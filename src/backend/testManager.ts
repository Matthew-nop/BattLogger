import { Request, Response } from 'express';
import { Database, RunResult } from 'sqlite3';

import { TestRunInfo } from '../interfaces/TestRunInfo';
import { CreateTestRunInfoParams } from '../interfaces/CreateTestRunInfoParams';

export const getBatteryTests = (db: Database) => (req: Request<{ batteryId: string }>, res: Response<TestRunInfo[] | { error: string }>) => {
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

export const addBatteryTestRunInfo = (db: Database) => (req: Request<{}, {}, CreateTestRunInfoParams>, res: Response<{ message: string, id: number } | { error: string }>) => {
  const { batteryId, capacity, timestamp } = req.body;

  if (!batteryId || !capacity || !timestamp) {
    res.status(400).json({ error: 'Missing required fields: batteryId, capacity, or timestamp.' });
    return;
  }

  db.run(
    "INSERT INTO battery_tests (battery_id, capacity, timestamp) VALUES (?, ?, ?)",
    [batteryId, capacity, timestamp],
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