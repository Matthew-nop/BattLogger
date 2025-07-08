import { Request, Response } from 'express';
import { FormFactorManager } from '../formfactorManager.js';
import { FormFactor, CreateFormFactorParams } from '../../interfaces/interfaces.js';

export class FormFactorHandler {
	private formFactorManager: FormFactorManager;

	constructor(formFactorManager: FormFactorManager) {
		this.formFactorManager = formFactorManager;
	}

	public getFormFactorMap = async (req: Request, res: Response<Record<string, FormFactor> | { error: string }>) => {
		try {
			const formFactorMap = await this.formFactorManager.getFormFactorMap();
			res.json(Object.fromEntries(formFactorMap));
		} catch (error) {
			console.error('Error fetching form factors from database:', error);
			res.status(500).json({ error: 'Failed to fetch form factor map.' });
		}
	};

	public createFormFactor = async (req: Request<{}, {}, CreateFormFactorParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
		const { name } = req.body;

		if (name === undefined || name === null || name.trim() === '') {
			res.status(400).json({ error: 'Form factor name is required and cannot be empty.' });
			return;
		}

		try {
			const result = await this.formFactorManager.createFormFactor(name);
			res.status(201).json({ message: 'Form factor created successfully', id: result.id });
		} catch (error: any) {
			console.error('Error inserting new form factor into database:', error);
			res.status(500).json({ error: error.message });
		}
	};
}
