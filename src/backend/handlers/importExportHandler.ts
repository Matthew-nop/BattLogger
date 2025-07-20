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
			res.setHeader('Content-Disposition', 'attachment; filename=battlogger_data.json');
			res.send(json);
		} catch (error) {
			console.error('Error exporting all data:', error);
			res.status(500).json({ error: 'Failed to export all data' });
		}
	};

	public importAll = async (req: Request, res: Response) => {
		try {
			await this.manager.importAll(req.body);
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
			await this.manager.importChemistries(req.body);
			res.status(200).json({ message: 'Chemistries imported successfully' });
		} catch (error) {
			console.error('Error importing chemistries:', error);
			res.status(500).json({ error: 'Failed to import chemistries' });
		}
	};

	public exportFormFactors = async (req: Request, res: Response) => {
		try {
			const json = await this.manager.exportFormfactorsToJson();
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
			await this.manager.importFormfactors(req.body);
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
			await this.manager.importModels(req.body);
			res.status(200).json({ message: 'Models imported successfully' });
		} catch (error) {
			console.error('Error importing models:', error);
			res.status(500).json({ error: 'Failed to import models' });
		}
	};

	public exportBatteries = async (req: Request, res: Response) => {
		try {
			const json = await this.manager.exportBatteriesToJson();
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', 'attachment; filename=batteries.json');
			res.send(json);
		} catch (error) {
			console.error('Error exporting batteries:', error);
			res.status(500).json({ error: 'Failed to export batteries' });
		}
	};

	public importBatteries = async (req: Request, res: Response) => {
		try {
			await this.manager.importBatteries(req.body);
			res.status(200).json({ message: 'Batteries imported successfully' });
		} catch (error) {
			console.error('Error importing batteries:', error);
			res.status(500).json({ error: 'Failed to import batteries' });
		}
	};

	public exportTestRuns = async (req: Request, res: Response) => {
		try {
			const json = await this.manager.exportTestRunsToJson();
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', 'attachment; filename=testruns.json');
			res.send(json);
		} catch (error) {
			console.error('Error exporting test runs:', error);
			res.status(500).json({ error: 'Failed to export test runs' });
		}
	};

	public importTestRuns = async (req: Request, res: Response) => {
		try {
			await this.manager.importTestRuns(req.body);
			res.status(200).json({ message: 'Test runs imported successfully' });
		} catch (error) {
			console.error('Error importing test runs:', error);
			res.status(500).json({ error: 'Failed to import test runs' });
		}
	};

	public exportTestRunProcesses = async (req: Request, res: Response) => {
		try {
			const json = await this.manager.exportTestRunProcessesToJson();
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', 'attachment; filename=test_run_processes.json');
			res.send(json);
		} catch (error) {
			console.error('Error exporting test run processes:', error);
			res.status(500).json({ error: 'Failed to export test run processes' });
		}
	};

	public importTestRunProcesses = async (req: Request, res: Response) => {
		try {
			await this.manager.importTestRunProcesses(req.body);
			res.status(200).json({ message: 'Test Run Processes imported successfully!' });
		} catch (error) {
			console.error('Error importing test run processes:', error);
			res.status(500).json({ error: 'Failed to import test run processes' });
		}
	};
}
