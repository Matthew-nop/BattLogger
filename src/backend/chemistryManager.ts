import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import * as sqlite3 from 'sqlite3';
import { Request, Response } from 'express';

import { Chemistry } from '../interfaces/Chemistry';
import { CreateChemistryParams } from '../interfaces/CreateChemistryParams';
import { stmtRunAsync } from './utils/dbUtils';

const dataPath = path.join(__dirname, '..', '..', 'data');

export let chemistryDetails = loadChemistryDetails();

export async function populateChemistriesTable(db: sqlite3.Database, chemistries: Map<string, Chemistry>): Promise<void> {
	const stmt = db.prepare("INSERT OR IGNORE INTO chemistries (id, name, nominal_voltage) VALUES (?, ?, ?)");
	for (const [guid, chemistry] of chemistries.entries()) {
		await stmtRunAsync(stmt, [
			chemistry.id,
			chemistry.name,
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
	const chemistriesDir = path.join(dataPath, 'chemistries');
	const files = fs.readdirSync(chemistriesDir);

	for (const file of files) {
		if (file.endsWith('.json')) {
			const chemistryData = JSON.parse(fs.readFileSync(path.join(chemistriesDir, file), 'utf8'));
			chemistryDetails.set(chemistryData.id, chemistryData);
		}
	}
	return chemistryDetails;
}

export const createChemistry = (req: Request<{}, {}, CreateChemistryParams>, res: Response) => {
	const { name, nominalVoltage } = req.body;

	if (!name || isNaN(nominalVoltage)) {
		res.status(400).json({ error: 'Missing required fields.' });
		return;
	}

	const newGuid = randomUUID();
	const newChemistry = {
		id: newGuid,
		name,
		nominalVoltage
	};

	const filePath = path.join(dataPath, 'chemistries', `${newGuid}.json`);
	fs.writeFile(filePath, JSON.stringify(newChemistry, null, 2), (err) => {
		if (err) {
			console.error('Error writing chemistry file:', err);
			res.status(500).json({ error: 'Failed to save chemistry.' });
			return;
		}
		// Reload chemistry details after adding a new chemistry
		chemistryDetails = loadChemistryDetails();
		res.status(201).json({ message: 'Chemistry created successfully', id: newGuid });
	});
};


// Function to populate the chemistries table
