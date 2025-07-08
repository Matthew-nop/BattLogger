import { Request, Response } from 'express';

import { TestManager } from '../testManager.js';
import { TestRunInfo, CreateTestRunInfoParams } from '../../interfaces/interfaces.js';

export class TestHandler {
	private testManager: TestManager;

	constructor(testManager: TestManager) {
		this.testManager = testManager;
	}

	public getBatteryTests = async (req: Request<{ batteryId: string }>, res: Response<TestRunInfo[] | { error: string }>) => {
		const batteryId = req.params.batteryId;
		try {
			const tests = await this.testManager.getBatteryTests(batteryId);
			res.json(tests);
		} catch (error) {
			console.error('Error fetching battery tests:', error);
			res.status(500).json({ error: 'Failed to fetch battery tests.' });
		}
	};

	public addBatteryTestRunInfo = async (req: Request<{}, {}, CreateTestRunInfoParams>, res: Response<{ message: string, id: number } | { error: string }>) => {
		const { batteryId, capacity, timestamp } = req.body;

		if (!batteryId || !capacity || isNaN(Number(capacity)) || !timestamp || isNaN(Number(timestamp))) {
			res.status(400).json({ error: 'Missing required fields: batteryId, capacity, or a valid timestamp.' });
			return;
		}

		try {
			const result = await this.testManager.addBatteryTestRunInfo(batteryId, capacity, Number(timestamp));
			res.status(201).json({ message: 'Battery test added successfully.', id: result.id });
		} catch (error: any) {
			console.error('Error adding battery test:', error);
			res.status(500).json({ error: error.message });
		}
	};
}