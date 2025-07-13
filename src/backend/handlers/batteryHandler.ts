import { Request, Response } from 'express';
import { BatteryManager } from '../batteryManager.js';
import { BatteryData, CreateBatteryParams, GetDataQueryParams } from '../../interfaces/interfaces.js';

export class BatteryHandler {
	private batteryManager: BatteryManager;

	constructor(batteryManager: BatteryManager) {
		this.batteryManager = batteryManager;
	}

	public getData = async (req: Request<{}, {}, {}, GetDataQueryParams>, res: Response<BatteryData[] | { error: string }>) => {
		try {
			const data = await this.batteryManager.getData(req.query as GetDataQueryParams);
			res.json(data);
		} catch (error) {
			console.error('Error fetching data:', error);
			res.status(500).json({ error: 'Failed to fetch data.' });
		}
	};

	public getBattery = async (req: Request<{ batteryId: string }>, res: Response<BatteryData | { error: string }>) => {
		const batteryId = req.params.batteryId;
		try {
			const battery = await this.batteryManager.getBatteryDetailsForId(batteryId);
			if (battery) {
				res.json(battery);
			} else {
				res.status(404).json({ error: 'Battery not found' });
			}
		} catch (error) {
			console.error('Error fetching battery:', error);
			res.status(500).json({ error: 'Failed to fetch battery.' });
		}
	};

	public getBatteryDetailsForId = async (req: Request<{ batteryId: string }>, res: Response<BatteryData | { error: string }>) => {
		const batteryId = req.params.batteryId;
		try {
			const batteryDetails = await this.batteryManager.getBatteryDetailsForId(batteryId);
			if (batteryDetails) {
				res.json(batteryDetails);
			} else {
				res.status(404).json({ error: 'Battery not found' });
			}
		} catch (error) {
			console.error('Error retrieving battery details:', error);
			res.status(500).json({ error: 'Failed to retrieve battery details.' });
		}
	};

	public createBattery = async (req: Request<{}, {}, CreateBatteryParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
		const { batteryId, modelIdentifier } = req.body;

		if (!batteryId || !modelIdentifier) {
			res.status(400).json({ error: 'Missing required fields: batteryId or modelIdentifier.' });
			return;
		}

		try {
			const result = await this.batteryManager.createBattery(batteryId, modelIdentifier);
			res.status(201).json({ message: 'Battery added successfully', id: result.id });
		} catch (error: any) {
			console.error('Error creating battery:', error);
			if (error.message.includes('Battery with this ID already exists.')) {
				res.status(409).json({ error: error.message });
			} else if (error.message.includes('Invalid model identifier.')) {
				res.status(400).json({ error: error.message });
			} else {
				res.status(500).json({ error: error.message });
			}
		}
	};

	public updateBattery = async (req: Request<{ batteryId: string }, {}, CreateBatteryParams>, res: Response<{ message: string } | { error: string }>) => {
		const batteryId = req.params.batteryId;
		const { modelIdentifier } = req.body;

		if (!modelIdentifier) {
			res.status(400).json({ error: 'Missing required fields.' });
			return;
		}

		try {
			const result = await this.batteryManager.updateBattery(batteryId, modelIdentifier);
			if (result) {
				res.status(200).json({ message: 'Battery updated successfully.' });
			} else {
				res.status(500).json({ error: 'Failed to update battery.' });
			}
		} catch (error: any) {
			console.error('Error updating battery:', error);
			res.status(500).json({ error: error.message });
		}
	};

	public deleteBattery = async (req: Request<{ batteryId: string }>, res: Response<{ message: string } | { error: string }>) => {
		const batteryId = req.params.batteryId;
		try {
			const result = await this.batteryManager.deleteBattery(batteryId);
			if (result) {
				res.status(200).json({ message: 'Battery deleted successfully.' });
			} else {
				res.status(500).json({ error: 'Failed to delete battery.' });
			}
		} catch (error: any) {
			console.error('Error deleting battery:', error);
			if (error.message.includes('Battery not found.')) {
				res.status(404).json({ error: error.message });
			} else {
				res.status(500).json({ error: error.message });
			}
		}
	};
}