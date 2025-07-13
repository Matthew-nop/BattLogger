import express from 'express';
import { exit } from 'process';
import sqlite3 from 'sqlite3';
import { bootstrap } from './utils/bootstrap.js';

const app: any = express();
const db = new sqlite3.Database('./database.sqlite', (err: Error | null) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the SQLite database.');
});
const initDb: boolean = process.argv.includes('--init-db');

(async () => {
	await bootstrap(app, db, initDb);
	if (initDb) {
		exit(0);
	}

	const port = 3000;
	app.listen(port, () => {
		console.log(`Server listening at http://localhost:${port}`);
	});
})();

