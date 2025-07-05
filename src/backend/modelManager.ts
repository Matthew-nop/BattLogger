import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { Request, Response } from 'express';
import * as sqlite3 from 'sqlite3';

import { Model } from '../interfaces/Model';
import { CreateModelParams } from '../interfaces/CreateModelParams';
import { stmtRunAsync } from './utils/dbUtils';

const dataPath = path.join(__dirname, '..', '..', 'data');

// Function to load model details from JSON files
export function loadModelDetails(): Map<string, Model> {
	const modelDetails = new Map<string, Model>();
	const modelsDir = path.join(dataPath, 'models');
	const files = fs.readdirSync(modelsDir);

	for (const file of files) {
		if (file.endsWith('.json')) {
			const modelData = JSON.parse(fs.readFileSync(path.join(modelsDir, file), 'utf8'));
			modelDetails.set(modelData.id, modelData);
		}
	}
	return modelDetails;
}

export async function populateModelsTable(db: sqlite3.Database, models: Map<string, Model>): Promise<void> {
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

export const getModelMap = (req: Request, res: Response) => {
	res.json(Object.fromEntries(modelMap));
};

export const getModelDetails = (req: Request, res: Response) => {
	res.json(Object.fromEntries(modelDetails));
};

export const getModelDetailsForId = (req: Request<{ guid: string }>, res: Response) => {
	const guid = req.params.guid;
	const model = modelDetails.get(guid);
	if (model) {
		res.json(model);
	} else {
		res.status(404).json({ error: 'Model not found' });
	}
};

export const createModel = (req: Request<{}, {}, CreateModelParams>, res: Response) => {
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

	const filePath = path.join(dataPath, 'models', `${newGuid}.json`);
	fs.writeFile(filePath, JSON.stringify(newModel, null, 2), (err) => {
		if (err) {
			console.error('Error writing model file:', err);
			res.status(500).json({ error: 'Failed to save model.' });
			return;
		}
		// Reload model details after adding a new model
		modelDetails = loadModelDetails();
		modelMap = loadModelMap();
		res.status(201).json({ message: 'Model created successfully', id: newGuid });
	});
};
