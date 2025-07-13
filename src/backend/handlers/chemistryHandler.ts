import { Request, Response } from 'express';
import { Chemistry, CreateChemistryParams } from '../../interfaces/interfaces.js';
import { ChemistryManager } from '../chemistryManager.js';

export class ChemistryHandler {
	private chemistryManager: ChemistryManager;

	constructor(chemistryManager: ChemistryManager) {
		this.chemistryManager = chemistryManager;
	}

	public getChemistriesMap = async (req: Request, res: Response<Record<string, Chemistry> | { error: string }>) => {
		try {
			const chemistriesMap = await this.chemistryManager.getChemistriesMap();
			res.json(Object.fromEntries(chemistriesMap));
		} catch (error) {
			console.error('Error fetching chemistries from database:', error);
			res.status(500).json({ error: 'Failed to fetch chemistries map.' });
		}
	};

	public createChemistry = async (req: Request<{}, {}, CreateChemistryParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
		const { name, shortName, nominalVoltage } = req.body;

		if (!name || !shortName || isNaN(nominalVoltage)) {
			res.status(400).json({ error: 'Missing required fields.' });
			return;
		}

		try {
			const result = await this.chemistryManager.createChemistry(name, shortName, nominalVoltage);
			res.status(201).json({ message: 'Chemistry created successfully', id: result.id });
		} catch (error: any) {
			console.error('Error creating chemistry:', error);
			res.status(500).json({ error: error.message });
		}
	};
}
