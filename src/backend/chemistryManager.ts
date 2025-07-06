import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import * as sqlite3 from 'sqlite3';
import { Request, Response } from 'express';

import { Chemistry, CreateChemistryParams } from '../interfaces/interfaces';
import { stmtRunAsync } from './utils/dbUtils';

const dataPath = path.join(__dirname, '..', '..', 'data');

export let chemistryDetails = loadChemistryDetails();

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

export const getChemistryDetails = (req: Request, res: Response<Record<string, Chemistry>>) => {
	res.json(Object.fromEntries(chemistryDetails));
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

export const createChemistry = (req: Request<{}, {}, CreateChemistryParams>, res: Response) => {
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

	const chemistriesFilePath = path.join(dataPath, 'chemistries.json');
	fs.readFile(chemistriesFilePath, 'utf8', (err, data) => {
		if (err && err.code !== 'ENOENT') {
			console.error('Error reading chemistries.json:', err);
			res.status(500).json({ error: 'Failed to save chemistry.' });
			return;
		}

		let chemistries: Chemistry[] = [];
		if (data) {
			chemistries = JSON.parse(data);
		}

		chemistries.push(newChemistry);

		fs.writeFile(chemistriesFilePath, JSON.stringify(chemistries, null, 2), (err) => {
			if (err) {
				console.error('Error writing chemistries.json:', err);
				res.status(500).json({ error: 'Failed to save chemistry.' });
				return;
			}
			// Reload chemistry details after adding a new chemistry
			chemistryDetails = loadChemistryDetails();
			res.status(201).json({ message: 'Chemistry created successfully', id: newGuid });
		});
	});
};


// Function to populate the chemistries table
