import { Request, Response } from 'express';
import * as sqlite3 from 'sqlite3';

import { ModelData, CreateModelParams } from '../interfaces/interfaces';
import { randomUUID } from 'crypto';
import { stmtRunAsync, loadModelDetails, loadModelMap } from './utils/dbUtils';
import { FormFactorManager } from './formfactorManager';
import { ChemistryManager } from './chemistryManager';

export async function populateModelsTable(db: sqlite3.Database, models: Map<string, ModelData>): Promise<void> {
	const stmt = db.prepare("INSERT OR REPLACE INTO models (id, name, design_capacity, manufacturer, chemistry_id, formfactor_id) VALUES (?, ?, ?, ?, ?, ?)");
	for (const [guid, model] of models.entries()) {
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
	console.log('Models table populated.');
}

export const getModelMap = (req: Request, res: Response<Record<string, string>>) => {
	res.json(Object.fromEntries(loadModelMap()));
};

export const getModelDetails = (req: Request, res: Response<Record<string, ModelData>>) => {
	res.json(Object.fromEntries(loadModelDetails()));
};

export const getModelDetailsForId = (db: sqlite3.Database) => (req: Request<{ guid: string }>, res: Response<ModelData | { error: string }>) => {
	const guid = req.params.guid;
	db.get<ModelData>(
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
		WHERE m.id = ?`,
		[guid],
		(err: Error | null, row: ModelData) => {
			if (err) {
				console.error(err.message);
				res.status(500).json({ error: 'Failed to retrieve model details.' });
				return;
			}
			if (row) {
				res.json(row);
			} else {
				res.status(404).json({ error: 'Model not found' });
			}
		}
	);
};

export const createModel = async (db: sqlite3.Database, req: Request<{}, {}, CreateModelParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
	const { name, designCapacity, formFactorId, chemistryId, manufacturer } = req.body;

	if (!name || !designCapacity || !formFactorId || !chemistryId) {
		res.status(400).json({ error: 'Missing required fields.' });
		return;
	}

	const formFactorManager = FormFactorManager.getInstance();
	const chemistryManager = ChemistryManager.getInstance();

	const formFactor = await formFactorManager.getFormFactorById(formFactorId);
	const chemistry = await chemistryManager.getChemistryById(chemistryId);

	if (!formFactor) {
		res.status(400).json({ error: 'Invalid formFactorId.' });
		return;
	}

	if (!chemistry) {
		res.status(400).json({ error: 'Invalid chemistryId.' });
		return;
	}

	const newGuid = randomUUID();
	const newModel = {
		id: newGuid,
		name,
		designCapacity,
		formFactorId,
		chemistryId,
		manufacturer
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
		res.status(201).json({ message: 'Model created successfully', id: newGuid });
	} catch (error) {
		console.error('Error inserting new model into database:', error);
		res.status(500).json({ error: 'Failed to save model.' });
	}
};
