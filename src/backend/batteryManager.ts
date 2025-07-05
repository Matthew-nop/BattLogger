import { Request, Response } from 'express';
import { Database, RunResult } from 'sqlite3';

import { AddBatteryRequestBody } from '../interfaces/AddBatteryRequestBody';
import { BatteryData } from '../interfaces/BatteryData';
import { GetDataQueryParams } from '../interfaces/GetDataQueryParams';
import { TestRunInfo } from '../interfaces/TestRunInfo';

import { modelDetails } from './modelManager';

export const getData = (db: Database) => (req: Request<{}, {}, {}, GetDataQueryParams>, res: Response) => {
	const { sortBy, order = 'asc', name, formfactor, chemistry } = req.query as GetDataQueryParams;
	let query = `
	SELECT
		bd.id as id,
		bd.hr_identifier,
		bd.model_id,
		bt.capacity AS last_tested_capacity
	FROM
		batteries bd
	LEFT JOIN models m ON bd.model_id = m.id
	LEFT JOIN (
		SELECT
			battery_id,
			capacity,
			timestamp,
			ROW_NUMBER() OVER(PARTITION BY battery_id ORDER BY timestamp DESC) as rn
		FROM
			battery_tests
	) bt ON bd.id = bt.battery_id AND bt.rn = 1
  `;
	const params = [];
	const conditions = [];

	if (name) {
		conditions.push(`bd.model_id = ?`);
		params.push(name);
	}
	if (formfactor) {
		conditions.push(`m.formfactor_id = ?`);
		params.push(formfactor);
	}
	if (chemistry) {
		conditions.push(`m.chemistry_id = ?`);
		params.push(chemistry);
	}

	if (conditions.length > 0) {
		query += " WHERE " + conditions.join(" AND ");
	}

	if (sortBy) {
		const allowedColumns = ['id', 'hr_identifier', 'model_id', 'last_tested_capacity'];
		if (allowedColumns.includes(sortBy as string)) {
			const sortOrder = (order as string).toUpperCase();
			if (sortOrder === 'ASC' || sortOrder === 'DESC') {
				query += ` ORDER BY ${sortBy} ${sortOrder}`;
			}
		}
	}

	db.all<BatteryData>(query, params, (err: Error | null, rows: BatteryData[]) => {
		if (err) {
			throw err;
		}
		res.json(rows);
	});
};

export const getBattery = (db: Database) => (req: Request, res: Response) => {
	const batteryId = req.params.batteryId;
	db.get<BatteryData>("SELECT id, hr_identifier, model_id FROM batteries WHERE id = ?", [batteryId], (err: Error | null, row: BatteryData) => {
		if (err) {
			console.error(err.message);
			res.status(500).json({ error: 'Failed to add battery.' });
			return;
		}
		if (row) {
			res.json(row);
		} else {
			res.status(404).json({ error: 'Battery not found' });
		}
	});
};

export const createBattery = (db: Database) => (req: Request, res: Response) => {
	const { hrIdentifier, modelIdentifier, manufacturer } = req.body as AddBatteryRequestBody;

	if (!modelIdentifier) {
		res.status(400).json({ error: 'Missing required fields.' });
		return;
	}

	const model = modelDetails.get(modelIdentifier);
	if (!model) {
		res.status(400).json({ error: 'Invalid model identifier.' });
		return;
	}

	db.run("INSERT INTO batteries (hr_identifier, model_id) VALUES (?, ?)",
		[hrIdentifier, modelIdentifier],
		function (this: RunResult, err: Error | null) {
			if (err) {
				console.error('Error inserting battery:', err.message);
				res.status(500).json({ error: 'Failed to add battery.' });
				return;
			}
			res.status(201).json({ message: 'Battery added successfully', id: this.lastID });
		}
	);
};

export const updateBattery = (db: Database) => (req: Request, res: Response) => {
	const batteryId = req.params.batteryId;
	const { hrIdentifier, modelIdentifier } = req.body as AddBatteryRequestBody;

	if (!hrIdentifier || !modelIdentifier) {
		res.status(400).json({ error: 'Missing required fields.' });
		return;
	}

	const model = modelDetails.get(modelIdentifier);
	if (!model) {
		res.status(400).json({ error: 'Invalid model identifier.' });
		return;
	}

	db.run(
		"UPDATE batteries SET hr_identifier = ?, model_id = ? WHERE id = ?",
		[hrIdentifier, modelIdentifier, batteryId],
		function (this: RunResult, err: Error | null) {
			if (err) {
				console.error('Error updating battery:', err.message);
				res.status(500).json({ error: 'Failed to update battery.' });
				return;
			}
			if (this.changes === 0) {
				res.status(404).json({ error: 'Battery not found.' });
			} else {
				res.status(200).json({ message: 'Battery updated successfully.' });
			}
		}
	);
};

export const deleteBattery = (db: Database) => (req: Request, res: Response) => {
	const batteryId = req.params.batteryId;

	db.run("DELETE FROM batteries WHERE id = ?", [batteryId], function (this: RunResult, err: Error | null) {
		if (err) {
			console.error('Error deleting battery:', err.message);
			res.status(500).json({ error: 'Failed to delete battery.' });
			return;
		}
		if (this.changes === 0) {
			res.status(404).json({ error: 'Battery not found.' });
		} else {
			res.status(200).json({ message: 'Battery deleted successfully.' });
		}
	});
};