import { Database } from 'sqlite3';

export async function createTables(db: Database): Promise<void> {
	const runAsync = (query: string, params: any[] = []): Promise<any> => {
		return new Promise((resolve, reject) => {
			db.run(query, params, function (err: Error | null) {
				if (err) {
					reject(err);
				} else {
					resolve(this);
				}
			});
		});
	};

	try {
		await runAsync(`DROP TABLE IF EXISTS batteries`);
		await runAsync(`DROP TABLE IF EXISTS battery_tests`);
		await runAsync(`DROP TABLE IF EXISTS models`);
		await runAsync(`DROP TABLE IF EXISTS formfactors`);
		await runAsync(`DROP TABLE IF EXISTS chemistries`);

		await runAsync(`CREATE TABLE IF NOT EXISTS models (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			design_capacity INTEGER NOT NULL,
			formfactor_id NEXT NOT NULL,
			chemistry_id TEXT NOT NULL,
			manufacturer TEXT,
			FOREIGN KEY (formfactor_id) REFERENCES formfactors(id),
			FOREIGN KEY (chemistry_id) REFERENCES chemistries(id)
		)`);

		await runAsync(`CREATE TABLE IF NOT EXISTS chemistries (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			nominal_voltage REAL NOT NULL
		)`);

		await runAsync(`CREATE TABLE IF NOT EXISTS formfactors (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL
		)`);

		await runAsync(`CREATE TABLE IF NOT EXISTS batteries (
			id TEXT PRIMARY KEY,
			hr_identifier TEXT NOT NULL,
			model_id TEXT NOT NULL,
			FOREIGN KEY (model_id) REFERENCES models(id)
		)`);

		await runAsync(`CREATE TABLE IF NOT EXISTS battery_tests (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			battery_id INTEGER NOT NULL,
			capacity INTEGER NOT NULL,
			timestamp TEXT NOT NULL,
			FOREIGN KEY (battery_id) REFERENCES batteries(id)
		)`);
		console.log('Tables created successfully.');
	} catch (err: any) {
		console.error('Error creating tables:', err.message);
		throw err;
	}
}
