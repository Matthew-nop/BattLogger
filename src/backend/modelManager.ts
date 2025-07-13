import sqlite3 from 'sqlite3';

import { randomUUID } from 'crypto';
import { CreateModelParams, ModelData } from '../interfaces/interfaces.js';
import { ModelDTO } from '../interfaces/tables/ModelDTO.js';
import { ChemistryManager } from './chemistryManager.js';
import { FormFactorManager } from './formfactorManager.js';
import { LOG_LEVEL, LoggingManager } from './loggingManager.js';
import { stmtRunAsync } from './utils/dbUtils.js';

export class ModelManager {
	private static instance: ModelManager;
	private db: sqlite3.Database | null = null;
	private cachedModels: Map<string, ModelData> | null = null;
	private logger: LoggingManager;

	private constructor() {
		this.logger = LoggingManager.getInstance();
	}


	public static getInstance(): ModelManager {
		if (!ModelManager.instance) {
			ModelManager.instance = new ModelManager();
		}
		return ModelManager.instance;
	}

	public setDb(db: sqlite3.Database): void {
		this.db = db;
	}

	private getDb(): sqlite3.Database {
		if (!this.db) {
			throw new Error("Database not set for ModelManager.");
		}
		return this.db;
	}

	private async _loadModelsFromDb(): Promise<Map<string, ModelData>> {
		this.logger.log(LOG_LEVEL.INFO, 'Loading models from database.');
		const db = this.getDb();
		const modelsMap: Map<string, ModelData> = new Map<string, ModelData>();
		try {
			const rows = await new Promise<Array<ModelData>>((resolve, reject) => {
				db.all(
					`SELECT
						m.id,
						m.name,
						m.design_capacity AS designCapacity,
						m.manufacturer,
						m.chemistry_id AS chemistryId,
						m.formfactor_id AS formFactorId,
						c.name AS chemistry_name,
						ff.name AS formfactor_name
					FROM
						models m
					LEFT JOIN chemistries c ON m.chemistry_id = c.id
					LEFT JOIN formfactors ff ON m.formfactor_id = ff.id
					`,
					[],
					(err: Error | null, rows: Array<ModelData>) => {
						if (err) {
							this.logger.log(LOG_LEVEL.ERROR, `Error loading models from database: ${err.message}`);
							reject(err);
						} else {
							this.logger.log(LOG_LEVEL.INFO, `Successfully loaded ${rows.length} models from database.`);
							resolve(rows);
						}
					}
				);
			});

			for (const row of rows) {
				modelsMap.set(row.id, {
					id: row.id,
					name: row.name,
					designCapacity: Number(row.designCapacity),
					manufacturer: row.manufacturer,
					chemistryId: row.chemistryId,
					formFactorId: row.formFactorId,
					chemistry_name: row.chemistry_name,
					formfactor_name: row.formfactor_name,
				});
			}
			this.cachedModels = modelsMap;
			return modelsMap;
		} catch (error) {
			this.logger.log(LOG_LEVEL.ERROR, `Error fetching models from database: ${error}`);
			throw new Error('Failed to fetch models from database.');
		}
	}

	public async populateModelsTable(models: ModelDTO[]): Promise<void> {
		this.logger.log(LOG_LEVEL.INFO, 'Populating models table.');
		const db = this.getDb();
		const stmt = db.prepare("INSERT OR REPLACE INTO models (id, name, design_capacity, manufacturer, chemistry_id, formfactor_id) VALUES (?, ?, ?, ?, ?, ?)");
		for (const model of models) {
			await stmtRunAsync(stmt, [
				model.id,
				model.name,
				model.designCapacity,
				model.manufacturer,
				model.chemistryId,
				model.formFactorId
			]);
		}
		stmt.finalize();
		this.logger.log(LOG_LEVEL.INFO, 'Models table populated.');
		this.cachedModels = null; // Invalidate cache
	}

	public async getModelMap(): Promise<Map<string, string>> {
		if (!this.cachedModels) {
			await this._loadModelsFromDb();
		}
		const modelMap = new Map<string, string>();
		this.cachedModels!.forEach((model) => {
			modelMap.set(model.id, model.name);
		});
		return modelMap;
	}

	public async doesModelExist(id: string): Promise<boolean> {
		if (!this.cachedModels) {
			await this._loadModelsFromDb();
		}

		return this.cachedModels!.has(id);
	}

	public async getModelDetails(): Promise<Map<string, ModelData>> {
		if (!this.cachedModels) {
			await this._loadModelsFromDb();
		}
		return this.cachedModels!;
	}

	public async getModelDetailsForId(guid: string): Promise<ModelData | null> {
		if (!this.cachedModels) {
			await this._loadModelsFromDb();
		}
		return this.cachedModels!.get(guid) || null;
	}

	public async getAllModels(): Promise<ModelDTO[]> {
		this.logger.log(LOG_LEVEL.INFO, 'Fetching all models from database.');
		if (!this.cachedModels) {
			await this._loadModelsFromDb();
		}

		const models: ModelDTO[] = [];
		this.cachedModels!.forEach((modelData) => {
			models.push({
				id: modelData.id,
				name: modelData.name,
				designCapacity: modelData.designCapacity,
				formFactorId: modelData.formFactorId,
				chemistryId: modelData.chemistryId,
				manufacturer: modelData.manufacturer,
			});
		});
		return models;
	}

	public async getModelById(id: string): Promise<ModelData | null> {
		if (!this.cachedModels) {
			await this._loadModelsFromDb();
		}
		return this.cachedModels!.get(id) || null;
	}

	public async createModel(params: CreateModelParams): Promise<{ id: string }> {
		const db = this.getDb();

		const { name, designCapacity, formFactorId, chemistryId, manufacturer } = params;

		if (!name || !formFactorId) {
			throw new Error('Missing required fields: Name and Formfactor are required.');
		}

		if (designCapacity !== undefined && designCapacity !== null && typeof designCapacity !== 'number') {
			throw new Error('Design capacity must be a number if provided.');
		}

		const formFactorManager = FormFactorManager.getInstance();
		const chemistryManager = ChemistryManager.getInstance();

		const formFactor = await formFactorManager.getFormFactorById(formFactorId);
		const chemistry = await chemistryManager.getChemistryById(chemistryId);

		if (!formFactor) {
			throw new Error('Invalid formFactorId.');
		}

		if (!chemistry) {
			throw new Error('Invalid chemistryId.');
		}

		const newGuid = randomUUID();
		const newModel = {
			id: newGuid,
			name,
			designCapacity,
			formFactorId,
			chemistryId,
			manufacturer,
		};

		try {
			const stmt = db.prepare("INSERT INTO models (id, name, design_capacity, manufacturer, chemistry_id, formfactor_id) VALUES (?, ?, ?, ?, ?, ?)");
			await stmtRunAsync(stmt, [
				newModel.id,
				newModel.name,
				newModel.designCapacity,
				newModel.manufacturer,
				newModel.chemistryId,
				newModel.formFactorId
			]);
			stmt.finalize();
			this.cachedModels = null; // Invalidate cache
			return { id: newGuid };
		} catch (error) {
			this.logger.log(LOG_LEVEL.ERROR, `Error inserting new model into database: ${error}`);
			throw new Error('Failed to save model.');
		}
	}
}