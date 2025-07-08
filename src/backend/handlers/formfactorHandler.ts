import { Request, Response } from 'express';
import { FormFactorManager } from '../formfactorManager.js';
import { FormFactor, CreateFormFactorParams } from '../../interfaces/interfaces.js';

export class FormFactorHandler {
	private formFactorManager: FormFactorManager;

	constructor(formFactorManager: FormFactorManager) {
		this.formFactorManager = formFactorManager;
	}

	public getFormFactorMap = async (req: Request, res: Response<Record<string, FormFactor> | { error: string }>) => {
		await this.formFactorManager.getFormFactorMap(req, res);
	};

	public createFormFactor = async (req: Request<{}, {}, CreateFormFactorParams>, res: Response) => {
		await this.formFactorManager.createFormFactor(req, res);
	};
}
