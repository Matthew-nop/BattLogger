import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

import { setupPageRoutes } from './pageRoutes';

const distPath = path.join(__dirname, '..', '..', 'dist');

const app: any = express();

const port = 3000;

const db = new sqlite3.Database('./database.sqlite', (err: Error | null) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the SQLite database.');
});

app.use(express.static(distPath));
app.use('/components', express.static(path.join(distPath, 'components')));
app.use(express.json()); // Enable JSON body parsing

setupPageRoutes(app);

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
