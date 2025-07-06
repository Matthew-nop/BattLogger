import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { Request, Response } from 'express';
import * as sqlite3 from 'sqlite3';

import { ModelData, CreateModelParams } from '../interfaces/interfaces';
import { stmtRunAsync } from './utils/dbUtils';

const dataPath = path.join(__dirname, '..', '..', 'data');

// Function to load model details from JSON files
export function loadModelDetails(): Map<string, ModelData> {
	const modelDetails = new Map<string, ModelData>();
	const modelsFilePath = path.join(dataPath, 'models.json');
	try {
		const data = fs.readFileSync(modelsFilePath, 'utf8');
		const models: ModelData[] = JSON.parse(data);
		for (const model of models) {
			modelDetails.set(model.id, model);
		}
	} catch (error) {
		console.error('Error reading models.json:', error);
	}
	return modelDetails;
}

export async function populateModelsTable(db: sqlite3.Database, models: Map<string, ModelData>): Promise<void> {
	const stmt = db.prepare("INSERT OR IGNORE INTO models (id, name, design_capacity, manufacturer, chemistry_id, formfactor_id) VALUES (?, ?, ?, ?, ?, ?)");
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

// Function to load model map (guid to model name)
export function loadModelMap(): Map<string, string> {
	const modelMap = new Map<string, string>();
	const modelDetails = loadModelDetails();
	for (const [guid, details] of modelDetails.entries()) {
		modelMap.set(guid, details.name);
	}
	return modelMap;
}

export let modelMap = loadModelMap();
export let modelDetails = loadModelDetails();

export const getModelMap = (req: Request, res: Response<Record<string, string>>) => {
	res.json(Object.fromEntries(modelMap));
};

export const getModelDetails = (req: Request, res: Response<Record<string, ModelData>>) => {
	res.json(Object.fromEntries(modelDetails));
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

export const createModel = (req: Request<{}, {}, CreateModelParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
	const { name, designCapacity, formFactorId, chemistryId, manufacturer } = req.body;

	if (!name || !designCapacity || !formFactorId || !chemistryId) {
		res.status(400).json({ error: 'Missing required fields.' });
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

	const modelsFilePath = path.join(dataPath, 'models.json');
	fs.readFile(modelsFilePath, 'utf8', (err, data) => {
		if (err && err.code !== 'ENOENT') {
			console.error('Error reading models.json:', err);
			res.status(500).json({ error: 'Failed to save model.' });
			return;
		}

		let models: ModelData[] = [];
		if (data) {
			models = JSON.parse(data);
		}

		models.push(newModel);

		fs.writeFile(modelsFilePath, JSON.stringify(models, null, 2), (err) => {
			if (err) {
				console.error('Error writing models.json:', err);
				res.status(500).json({ error: 'Failed to save model.' });
				return;
			}
			// Reload model details after adding a new model
			modelDetails = loadModelDetails();
			modelMap = loadModelMap();
			res.status(201).json({ message: 'Model created successfully', id: newGuid });
		});
	});
};
