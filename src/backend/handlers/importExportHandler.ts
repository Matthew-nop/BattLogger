import { Request, Response } from 'express';
import { ImportExportManager } from '../importExportManager.js';

export class ImportExportHandler {
	private manager: ImportExportManager;

	constructor(
		manager: ImportExportManager
	) {
		this.manager = manager;
	}

	public exportAll = async (req: Request, res: Response) => {
		try {
			const json = await this.manager.exportDbToJson();
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', 'attachment; filename=battlogger_all_data.json');
			res.send(json);
		} catch (error) {
			console.error('Error exporting all data:', error);
			res.status(500).json({ error: 'Failed to export all data' });
		}
	};

	public importAll = async (req: Request, res: Response) => {
		try {
			await this.manager.importDbFromJson(JSON.stringify(req.body));
			res.status(200).json({ message: 'All data imported successfully' });
		} catch (error) {
			console.error('Error importing all data:', error);
			res.status(500).json({ error: 'Failed to import all data' });
		}
	};

	public exportChemistries = async (req: Request, res: Response) => {
		try {
			const json = await this.manager.exportChemistriesToJson();
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', 'attachment; filename=chemistries.json');
			res.send(json);
		} catch (error) {
			console.error('Error exporting chemistries:', error);
			res.status(500).json({ error: 'Failed to export chemistries' });
		}
	};

	public importChemistries = async (req: Request, res: Response) => {
		try {
			await this.manager.importChemistriesFromJson(JSON.stringify(req.body));
			res.status(200).json({ message: 'Chemistries imported successfully' });
		} catch (error) {
			console.error('Error importing chemistries:', error);
			res.status(500).json({ error: 'Failed to import chemistries' });
		}
	};

	public exportFormFactors = async (req: Request, res: Response) => {
		try {
			const json = await this.manager.exportFormFactorsToJson();
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', 'attachment; filename=formfactors.json');
			res.send(json);
		} catch (error) {
			console.error('Error exporting form factors:', error);
			res.status(500).json({ error: 'Failed to export form factors' });
		}
	};

	public importFormFactors = async (req: Request, res: Response) => {
		try {
			await this.manager.importFormFactorsFromJson(JSON.stringify(req.body));
			res.status(200).json({ message: 'Form factors imported successfully' });
		} catch (error) {
			console.error('Error importing form factors:', error);
			res.status(500).json({ error: 'Failed to import form factors' });
		}
	};

	public exportModels = async (req: Request, res: Response) => {
		try {
			const json = await this.manager.exportModelsToJson();
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', 'attachment; filename=models.json');
			res.send(json);
		} catch (error) {
			console.error('Error exporting models:', error);
			res.status(500).json({ error: 'Failed to export models' });
		}
	};

	public importModels = async (req: Request, res: Response) => {
		try {
			await this.manager.importModelsFromJson(JSON.stringify(req.body));
			res.status(200).json({ message: 'Models imported successfully' });
		} catch (error) {
			console.error('Error importing models:', error);
			res.status(500).json({ error: 'Failed to import models' });
		}
	};
}
