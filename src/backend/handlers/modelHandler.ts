import { Request, Response } from 'express';
import { CreateModelParams, ModelData } from '../../interfaces/interfaces.js';
import { ModelManager } from '../modelManager.js';

export class ModelHandler {
	private modelManager: ModelManager;

	constructor(modelManager: ModelManager) {
		this.modelManager = modelManager;
	}

	public getModelMap = async (req: Request, res: Response<Record<string, string>>) => {
		try {
			const modelMap = await this.modelManager.getModelMap();
			res.json(Object.fromEntries(modelMap));
		} catch (error) {
			console.error('Error fetching model map:', error);
			res.status(500).json({ error: 'Failed to fetch model map.' });
		}
	};

	public getModelDetails = async (req: Request, res: Response<Record<string, ModelData> | { error: string }>) => {
		try {
			const modelDetails = await this.modelManager.getModelDetails();
			res.json(Object.fromEntries(modelDetails));
		} catch (error) {
			console.error('Error fetching model details:', error);
			res.status(500).json({ error: 'Failed to fetch model details.' });
		}
	};

	public getModelDetailsForId = async (req: Request<{ guid: string }>, res: Response<ModelData | { error: string }>) => {
		const guid = req.params.guid;
		try {
			const model = await this.modelManager.getModelDetailsForId(guid);
			if (model) {
				res.json(model);
			} else {
				res.status(404).json({ error: 'Model not found' });
			}
		} catch (error) {
			console.error('Error retrieving model details:', error);
			res.status(500).json({ error: 'Failed to retrieve model details.' });
		}
	};

	public createModel = async (req: Request<{}, {}, CreateModelParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
		const params = req.body;

		if (!params.name || !params.formFactorId) {
			res.status(400).json({ error: 'Missing required fields: Name and Formfactor are required.' });
			return;
		}
		if (params.designCapacity !== undefined && params.designCapacity !== null) {
			if (typeof params.designCapacity !== 'number') {
				res.status(400).json({ error: 'Design capacity must be a number if provided.' });
				return;
			}
			if (params.designCapacity <= 0) {
				res.status(400).json({ error: 'Design capacity must be a positive number.' });
				return;
			}
		}

		try {
			const result = await this.modelManager.createModel(params);
			res.status(201).json({ message: 'Model created successfully', id: result.id });
		} catch (error: any) {
			console.error('Error creating model:', error);
			if (error.message.includes('Invalid formFactorId') || error.message.includes('Invalid chemistryId') || error.message.includes('Missing required fields')) {
				res.status(400).json({ error: error.message });
			} else {
				res.status(500).json({ error: 'Failed to create model.' });
			}
		}
	};
}
