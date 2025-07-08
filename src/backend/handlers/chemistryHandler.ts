import { Request, Response } from 'express';
import { ChemistryManager } from '../chemistryManager.js';
import { Chemistry, CreateChemistryParams } from '../../interfaces/interfaces.js';

export class ChemistryHandler {
	private chemistryManager: ChemistryManager;

	constructor(chemistryManager: ChemistryManager) {
		this.chemistryManager = chemistryManager;
	}

	public getChemistriesMap = async (req: Request, res: Response<Record<string, Chemistry> | { error: string }>) => {
		await this.chemistryManager.getChemistriesMap(req, res);
	};

	public createChemistry = async (req: Request<{}, {}, CreateChemistryParams>, res: Response) => {
		await this.chemistryManager.createChemistry(req, res);
	};
}
