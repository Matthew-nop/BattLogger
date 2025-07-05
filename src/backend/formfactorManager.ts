import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

import { FormFactor } from '../interfaces/FormFactor';
import { CreateFormFactorParams } from '../interfaces/CreateFormFactorParams';

import { stmtRunAsync } from './utils/dbUtils';

const dataPath = path.join(__dirname, '..', '..', 'data');

// Function to load form factor details from JSON files
export function loadFormFactorDetails(): Map<string, FormFactor> {
	const formFactorDetails = new Map<string, FormFactor>();
	const formFactorsDir = path.join(dataPath, 'formfactors');
	const files = fs.readdirSync(formFactorsDir);

	for (const file of files) {
		if (file.endsWith('.json')) {
			const formFactorData = JSON.parse(fs.readFileSync(path.join(formFactorsDir, file), 'utf8'));
			formFactorDetails.set(formFactorData.id, formFactorData);
		}
	}
	return formFactorDetails;
}

export let formFactorDetails = loadFormFactorDetails();

export async function populateFormFactorsTable(db: sqlite3.Database, formFactors: Map<string, FormFactor>): Promise<void> {
	const stmt = db.prepare("INSERT OR IGNORE INTO formfactors (id, name) VALUES (?, ?)");
	for (const [guid, formfactor] of formFactors.entries()) {
		await stmtRunAsync(stmt, [
			formfactor.id,
			formfactor.name
		]);
	}
	stmt.finalize();
	console.log('Form Factors table populated.');
}

export const getFormFactorDetails = (req: Request, res: Response) => {
	res.json(Object.fromEntries(formFactorDetails));
};

export const createFormFactor = (req: Request, res: Response) => {
	const { name } = req.body as CreateFormFactorParams;

	if (!name) {
		res.status(400).json({ error: 'Missing required fields.' });
		return;
	}

	const newGuid = randomUUID();
	const newFormFactor = {
		id: newGuid,
		name: name,
	};

	const filePath = path.join(dataPath, 'formfactors', `${newGuid}.json`);
	fs.writeFile(filePath, JSON.stringify(newFormFactor, null, 2), (err) => {
		if (err) {
			console.error('Error writing form factor file:', err);
			res.status(500).json({ error: 'Failed to save form factor.' });
			return;
		}
		// Reload form factor details after adding a new form factor
		formFactorDetails = loadFormFactorDetails();
		res.status(201).json({ message: 'Form Factor created successfully', id: newGuid });
	});
};