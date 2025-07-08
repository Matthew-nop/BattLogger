import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

import { setupPageRoutes } from './pageRoutes.js';
import { setupApiRoutes } from './apiRoutes.js';
import { ChemistryManager } from './chemistryManager.js';
import { FormFactorManager } from './formfactorManager.js';

const app: any = express();

const port = 3000;

const db = new sqlite3.Database('./database.sqlite', (err: Error | null) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the SQLite database.');
});

// Initialize ChemistryManager with the database instance
const chemistryManager = ChemistryManager.getInstance();
chemistryManager.setDb(db);

const formFactorManager = FormFactorManager.getInstance();
formFactorManager.setDb(db);

const frontendPath = path.join(__dirname, '..', '..', 'dist', 'frontend');
app.use(express.static(frontendPath));
app.use(express.json()); // Enable JSON body parsing

setupApiRoutes(app, db, chemistryManager, formFactorManager);
setupPageRoutes(app);

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});