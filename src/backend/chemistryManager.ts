import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import * as sqlite3 from 'sqlite3';
import { Request, Response } from 'express';

import { Chemistry, CreateChemistryParams } from '../interfaces/interfaces';
import { stmtRunAsync } from './utils/dbUtils';

const dataPath = path.join(__dirname, '..', '..', 'data');

export async function populateChemistriesTable(db: sqlite3.Database, chemistries: Map<string, Chemistry>): Promise<void> {
	const stmt = db.prepare("INSERT OR IGNORE INTO chemistries (id, name, short_name, nominal_voltage) VALUES (?, ?, ?, ?)");
	for (const [guid, chemistry] of chemistries.entries()) {
		await stmtRunAsync(stmt, [
			chemistry.id,
			chemistry.name,
			chemistry.shortName,
			chemistry.nominalVoltage
		]);
	}
	stmt.finalize();
	console.log('Chemistries table populated.');
}

export const getChemistriesMap = async (db: sqlite3.Database, req: Request, res: Response<Record<string, Chemistry> | { error: string }>) => {
	const chemistriesMap = new Map<string, Chemistry>();

	try {
		const rows = await new Promise<any[]>((resolve, reject) => {
			db.all("SELECT * FROM chemistries", [], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});

		for (const row of rows) {
			chemistriesMap.set(row.id, {
				id: row.id,
				name: row.name,
				shortName: row.short_name,
				nominalVoltage: row.nominal_voltage
			});
		}
		res.json(Object.fromEntries(chemistriesMap));
	} catch (error) {
		console.error('Error fetching chemistries from database:', error);
		res.status(500).json({ error: 'Failed to fetch chemistries map.' });
	}
};


// Function to load chemistry details from JSON files
export function loadChemistryDetails(): Map<string, Chemistry> {
	const chemistryDetails = new Map<string, Chemistry>();
	const chemistriesFilePath = path.join(dataPath, 'chemistries.json');
	try {
		const data = fs.readFileSync(chemistriesFilePath, 'utf8');
		const chemistries: Chemistry[] = JSON.parse(data);
		for (const chemistry of chemistries) {
			chemistryDetails.set(chemistry.id, chemistry);
		}
	} catch (error) {
		console.error('Error reading chemistries.json:', error);
	}
	return chemistryDetails;
}



export const createChemistry = async (db: sqlite3.Database, req: Request<{}, {}, CreateChemistryParams>, res: Response) => {
	const { name, shortName, nominalVoltage } = req.body;

	if (!name || !shortName || isNaN(nominalVoltage)) {
		res.status(400).json({ error: 'Missing required fields.' });
		return;
	}

	const newGuid = randomUUID();
	const newChemistry = {
		id: newGuid,
		name,
		shortName,
		nominalVoltage
	};

	try {
		const stmt = db.prepare("INSERT INTO chemistries (id, name, short_name, nominal_voltage) VALUES (?, ?, ?, ?)");
		await stmtRunAsync(stmt, [
			newChemistry.id,
			newChemistry.name,
			newChemistry.shortName,
			newChemistry.nominalVoltage
		]);
		stmt.finalize();
		res.status(201).json({ message: 'Chemistry created successfully', id: newGuid });
	} catch (error) {
		console.error('Error inserting new chemistry into database:', error);
				res.status(500).json({ error: 'Failed to save chemistry.' });
			}
};
