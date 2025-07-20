import { Request, Response } from 'express';
import { CreateTestRunInfoParams, CreateTestRunProcessParams, TestRunInfo, TestRunProcess } from '../../interfaces/interfaces.js';
import { TestManager } from '../testManager.js';

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

	public createTestRun = async (req: Request<{}, {}, CreateTestRunInfoParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
		const { batteryId, capacity, timestamp, processId } = req.body;

		if (!batteryId) {
			res.status(400).json({ error: 'Missing required field: batteryId.' });
			return;
		}

		if (capacity === undefined || capacity === null) {
			res.status(400).json({ error: 'Missing required field: capacity.' });
			return;
		}

		if (timestamp === undefined || timestamp === null) {
			res.status(400).json({ error: 'Missing required field: timestamp.' });
			return;
		}

		if (isNaN(Number(capacity)) || Number(capacity) < 0) {
			res.status(400).json({ error: 'Capacity must be a positive number.' });
			return;
		}

		if (typeof timestamp !== 'string' || isNaN(new Date(timestamp).getTime())) {
			res.status(400).json({ error: 'Timestamp must be a valid ISO 8601 string.' });
			return;
		}

		try {
			const result = await this.testManager.createTestRun({ batteryId, capacity, timestamp, processId });
			res.status(201).json({ message: 'Battery test added successfully.', id: result.id });
		} catch (error: any) {
			console.error('Error adding battery test:', error);
			res.status(500).json({ error: error.message });
		}
	};

	public createTestRunProcess = async (req: Request<{}, {}, CreateTestRunProcessParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
		const { name, description } = req.body;

		if (!name) {
			res.status(400).json({ error: 'Missing required field: name.' });
			return;
		}

		if (!description) {
			res.status(400).json({ error: 'Missing required field: description.' });
			return;
		}

		try {
			const result = await this.testManager.createTestRunProcess({ name, description });
			res.status(201).json({ message: 'Test run process created successfully.', id: result.id });
		} catch (error: any) {
			console.error('Error creating test run process:', error);
			res.status(500).json({ error: error.message });
		}
	};

	public getTestRunProcesses = async (req: Request, res: Response<TestRunProcess[] | { error: string }>) => {
		try {
			const processes = await this.testManager.getAllTestRunProcesses();
			res.json(processes);
		} catch (error) {
			console.error('Error fetching test run processes:', error);
			res.status(500).json({ error: 'Failed to fetch test run processes.' });
		}
	};
}