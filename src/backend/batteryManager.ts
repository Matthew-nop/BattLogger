import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';

import { BatteryData, CreateBatteryParams, GetDataQueryParams } from '../interfaces/interfaces.js';

import { loadModelDetails } from './utils/dbUtils.js';

export const getData = (db: sqlite3.Database) => (req: Request<{}, {}, {}, GetDataQueryParams>, res: Response<BatteryData[]>) => {
	const { sortBy, order = 'asc', name, formfactor, chemistry } = req.query as GetDataQueryParams;
	let query = `
	SELECT
		bd.id AS id,
		bd.model_id AS modelId,
		bt.capacity AS lastTestedCapacity,
		bt.timestamp AS lastTestedTimestamp,
		c.name AS chemistryName,
		c.short_name AS chemistryShortName,
		ff.name AS formfactorName
	FROM
		batteries bd
	LEFT JOIN models m ON bd.model_id = m.id
	LEFT JOIN chemistries c ON m.chemistry_id = c.id
	LEFT JOIN formfactors ff ON m.formfactor_id = ff.id
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
		conditions.push(`m.chemistry_id = ?`);		params.push(chemistry);
	}

	if (conditions.length > 0) {
		query += " WHERE " + conditions.join(" AND ");
	}

	if (sortBy) {
		query += ` ORDER BY ${sortBy} ${order}`;
	}

	db.all<BatteryData>(query, params, (err: Error | null, rows: BatteryData[]) => {
		if (err) {
			throw err;
		}
		res.json(rows);
	});
};

export const getBattery = (db: sqlite3.Database) => (req: Request<{ batteryId: string }>, res: Response<BatteryData | { error: string }>) => {
	const batteryId = req.params.batteryId;
	db.get<BatteryData>("SELECT id, model_id AS modelId FROM batteries WHERE id = ?", [batteryId], (err: Error | null, row: BatteryData) => {
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

export const getBatteryDetailsForId = (db: sqlite3.Database) => (req: Request<{ batteryId: string }>, res: Response<BatteryData | { error: string }>) => {
	const batteryId = req.params.batteryId;
	const query = `
		SELECT
			b.id,
			b.model_id AS modelId,
			bt.capacity AS lastTestedCapacity,
			bt.timestamp AS lastTestedTimestamp,
			c.name AS chemistryName,
			ff.name AS formfactorName
		FROM
			batteries b
		LEFT JOIN models m ON b.model_id = m.id
		LEFT JOIN chemistries c ON m.chemistry_id = c.id
		LEFT JOIN formfactors ff ON m.formfactor_id = ff.id
		LEFT JOIN (
			SELECT
				battery_id,
				capacity,
				timestamp,
				ROW_NUMBER() OVER(PARTITION BY battery_id ORDER BY timestamp DESC) as rn
			FROM
				battery_tests
		) bt ON b.id = bt.battery_id AND bt.rn = 1
		WHERE b.id = ?
	`;

	db.get<BatteryData>(query, [batteryId], (err: Error | null, row: BatteryData) => {
		if (err) {
			console.error(err.message);
			res.status(500).json({ error: 'Failed to retrieve battery details.' });
			return;
		}
		if (row) {
			res.json(row);
		} else {
			res.status(404).json({ error: 'Battery not found' });
		}
	});
};

export const createBattery = (db: sqlite3.Database) => (req: Request<{}, {}, CreateBatteryParams>, res: Response<{ message: string, id: string } | { error: string }>) => {
	const { batteryId, modelIdentifier } = req.body;

	if (!batteryId || !modelIdentifier) {
		res.status(400).json({ error: 'Missing required fields: batteryId or modelIdentifier.' });
		return;
	}

	const model = loadModelDetails().get(modelIdentifier);
	if (!model) {
		res.status(400).json({ error: 'Invalid model identifier.' });
		return;
	}

	db.get("SELECT id FROM batteries WHERE id = ?", [batteryId], (err: Error | null, row: any) => {
		if (err) {
			console.error('Error checking for existing battery:', err.message);
			res.status(500).json({ error: 'Failed to check for existing battery.' });
			return;
		}
		if (row) {
			res.status(409).json({ error: 'Battery with this ID already exists.' });
			return;
		}

		db.run("INSERT INTO batteries (id, model_id) VALUES (?, ?)",
			[batteryId, modelIdentifier],
			function (this: sqlite3.RunResult, err: Error | null) {
				if (err) {
					console.error('Error inserting battery:', err.message);
					res.status(500).json({ error: 'Failed to add battery.' });
					return;
				}
				res.status(201).json({ message: 'Battery added successfully', id: batteryId });
			}
		);
	});
};

export const updateBattery = (db: sqlite3.Database) => (req: Request<{ batteryId: string }, {}, CreateBatteryParams>, res: Response<{ message: string } | { error: string }>) => {
	const batteryId = req.params.batteryId;
	const { modelIdentifier } = req.body;

	if (!modelIdentifier) {
		res.status(400).json({ error: 'Missing required fields.' });
		return;
	}

	const model = loadModelDetails().get(modelIdentifier);
	if (!model) {
		res.status(400).json({ error: 'Invalid model identifier.' });
		return;
	}

	db.run(
		"UPDATE batteries SET model_id = ? WHERE id = ?",
		[modelIdentifier, batteryId],
		function (this: sqlite3.RunResult, err: Error | null) {
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

export const deleteBattery = (db: sqlite3.Database) => (req: Request<{ batteryId: string }>, res: Response<{ message: string } | { error: string }>) => {
	const batteryId = req.params.batteryId;

	db.run("DELETE FROM batteries WHERE id = ?", [batteryId], function (this: sqlite3.RunResult, err: Error | null) {
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