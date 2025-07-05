import { Request, Response } from 'express';
import { Database, RunResult } from 'sqlite3';

import { TestRunInfo } from '../interfaces/TestRunInfo';
import { AddBatteryTestRequestBody } from '../interfaces/AddBatteryTestRequestBody';
import { BatteryIdParams } from '../interfaces/BatteryIdParams';

export const getBatteryTests = (db: Database) => (req: Request<BatteryIdParams>, res: Response) => {
	const batteryId = req.params.batteryId;
	db.all<TestRunInfo>("SELECT capacity, timestamp FROM battery_tests WHERE battery_id = ? ORDER BY timestamp DESC", [batteryId], (err: Error | null, rows: TestRunInfo[]) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

export const addBatteryTest = (db: Database) => (req: Request<BatteryIdParams, {}, AddBatteryTestRequestBody>, res: Response) => {
  const batteryId = req.params.batteryId;
  const { capacity } = req.body;

  if (!capacity) {
    res.status(400).json({ error: 'Missing required field: capacity.' });
    return;
  }

  db.run(
    "INSERT INTO battery_tests (battery_id, capacity, timestamp) VALUES (?, ?, datetime('now'))",
    [batteryId, capacity],
    function(this: RunResult, err: Error | null) {
      if (err) {
        console.error('Error adding battery test:', err.message);
        res.status(500).json({ error: 'Failed to add battery test.' });
        return;
      }
      res.status(201).json({ message: 'Battery test added successfully.', id: this.lastID });
    }
  );
};