import { Request, Response } from 'express';
import { ModelManager } from '../modelManager.js';
import { ModelData, CreateModelParams } from '../../interfaces/interfaces.js';

export class ModelHandler {
	private modelManager: ModelManager;

	constructor(modelManager: ModelManager) {
		this.modelManager = modelManager;
	}

	public getModelMap = async (req: Request, res: Response<Record<string, string>>) => {
		await this.modelManager.getModelMap(req, res);
	};

	public getModelDetails = async (req: Request, res: Response<Record<string, ModelData> | { error: string }>) => {
		await this.modelManager.getModelDetails(req, res);
	};

	public getModelDetailsForId = async (req: Request<{ guid: string }>, res: Response<ModelData | { error: string }>) => {
		await this.modelManager.getModelDetailsForId(req, res);
	};

	public createModel = async (req: Request<{}, {}, CreateModelParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
		await this.modelManager.createModel(req, res);
	};
}
