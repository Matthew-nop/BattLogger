import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

import { FormFactor, CreateFormFactorParams } from '../interfaces/interfaces';

import { stmtRunAsync } from './utils/dbUtils';

const dataPath = path.join(__dirname, '..', '..', 'data');

// Function to load form factor details from JSON files
export function loadFormFactorDetails(): Map<string, FormFactor> {
	const formFactorDetails = new Map<string, FormFactor>();
	const formFactorsFilePath = path.join(dataPath, 'formfactors.json');
	try {
		const data = fs.readFileSync(formFactorsFilePath, 'utf8');
		const formFactors: FormFactor[] = JSON.parse(data);
		for (const formFactor of formFactors) {
			formFactorDetails.set(formFactor.id, formFactor);
		}
	} catch (error) {
		console.error('Error reading formfactors.json:', error);
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

export const getFormFactorDetails = (req: Request, res: Response<Record<string, FormFactor>>) => {
	res.json(Object.fromEntries(formFactorDetails));
};

export const createFormFactor = (req: Request<{}, {}, CreateFormFactorParams>, res: Response) => {
	const { name } = req.body;

	if (!name) {
		res.status(400).json({ error: 'Missing required fields.' });
		return;
	}

	const newGuid = randomUUID();
	const newFormFactor = {
		id: newGuid,
		name: name,
	};

	const formFactorsFilePath = path.join(dataPath, 'formfactors.json');
	fs.readFile(formFactorsFilePath, 'utf8', (err, data) => {
		if (err && err.code !== 'ENOENT') {
			console.error('Error reading formfactors.json:', err);
			res.status(500).json({ error: 'Failed to save form factor.' });
			return;
		}

		let formFactors: FormFactor[] = [];
		if (data) {
			formFactors = JSON.parse(data);
		}

		formFactors.push(newFormFactor);

		fs.writeFile(formFactorsFilePath, JSON.stringify(formFactors, null, 2), (err) => {
			if (err) {
				console.error('Error writing formfactors.json:', err);
				res.status(500).json({ error: 'Failed to save form factor.' });
				return;
			}
			// Reload form factor details after adding a new form factor
			formFactorDetails = loadFormFactorDetails();
			res.status(201).json({ message: 'Form Factor created successfully', id: newGuid });
		});
	});
};