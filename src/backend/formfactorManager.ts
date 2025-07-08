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



export async function populateFormFactorsTable(db: sqlite3.Database, formFactors: Map<string, FormFactor>): Promise<void> {
	const stmt = db.prepare("INSERT OR REPLACE INTO formfactors (id, name) VALUES (?, ?)");
	for (const [guid, formfactor] of formFactors.entries()) {
		await stmtRunAsync(stmt, [
			formfactor.id,
			formfactor.name
		]);
	}
	stmt.finalize();
	console.log('Form Factors table populated.');
}

export const getFormFactorMap = async (db: sqlite3.Database, req: Request, res: Response<Record<string, FormFactor> | { error: string }>) => {
	const formFactorsMap = new Map<string, FormFactor>();

	try {
		const rows = await new Promise<any[]>((resolve, reject) => {
			db.all("SELECT * FROM formfactors", [], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});

		for (const row of rows) {
			formFactorsMap.set(row.id, {
				id: row.id,
				name: row.name,
			});
		}
		res.json(Object.fromEntries(formFactorsMap));
	} catch (error) {
		console.error('Error fetching form factors from database:', error);
		res.status(500).json({ error: 'Failed to fetch Formfactor map.' });;
	}
};

export const createFormFactor = async (db: sqlite3.Database, req: Request<{}, {}, CreateFormFactorParams>, res: Response) => {
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

	try {
		const stmt = db.prepare("INSERT INTO formfactors (id, name) VALUES (?, ?)");
		await stmtRunAsync(stmt, [
			newFormFactor.id,
			newFormFactor.name
		]);
		stmt.finalize();
		res.status(201).json({ message: 'Form Factor created successfully', id: newGuid });
	} catch (error) {
		console.error('Error inserting new form factor into database:', error);
		res.status(500).json({ error: 'Failed to save form factor.' });
	}
};