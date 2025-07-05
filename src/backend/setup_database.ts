// This script sets up the SQLite database for the BattLogger application.
// It creates necessary tables and populates them with initial data,
// including dummy battery and test run information for demonstration purposes.

// This script sets up the SQLite database for the BattLogger application.
// It creates necessary tables and populates them with initial data,
// including dummy battery and test run information for demonstration purposes.

import * as sqlite3 from 'sqlite3';
import { initializeDatabase } from './utils/dbUtils';

// Create a new database file
const db = new sqlite3.Database('./database.sqlite', (err: Error | null) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the SQLite database.');
});

// Perform application setup: create tables and insert initial data
(async () => {
	await initializeDatabase(db);
})();

