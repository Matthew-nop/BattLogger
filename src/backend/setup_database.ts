import * as sqlite3 from 'sqlite3';

import { createTables } from './create_tables';
import { loadChemistryDetails, populateChemistriesTable } from './chemistryManager';
import { loadFormFactorDetails, populateFormFactorsTable } from './formfactorManager';
import { loadModelDetails, populateModelsTable } from './modelManager';
import { stmtRunAsync } from './utils/dbUtils';

import { Chemistry } from '../interfaces/Chemistry';
import { FormFactor } from '../interfaces/FormFactor';
import { ModelDataDTO } from '../interfaces/ModelDataDTO';

// Create a new database file
const db = new sqlite3.Database('./database.sqlite', (err: Error | null) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the SQLite database.');
});

// Create a table and insert some data
(async () => {
	try {

		await createTables(db);

		const modelDetails: Map<string, ModelDataDTO> = loadModelDetails();
		const chemistryDetails: Map<string, Chemistry> = loadChemistryDetails();
		const formFactorDetails: Map<string, FormFactor> = loadFormFactorDetails();

		await populateModelsTable(db, modelDetails);
		await populateChemistriesTable(db, chemistryDetails);
		await populateFormFactorsTable(db, formFactorDetails);

		const batteryStmt = db.prepare("INSERT INTO batteries (hr_identifier, model_id) VALUES (?, ?)");
		const testStmt = db.prepare("INSERT INTO battery_tests (battery_id, capacity, timestamp) VALUES (?, ?, ?)");

		const modelKeys = Array.from(modelDetails.keys());
		const chemistryKeys = Array.from(chemistryDetails.keys());
		const formFactorKeys = Array.from(formFactorDetails.keys());

		for (let i = 0; i < 10; i++) {
			const randomModelKey = modelKeys[Math.floor(Math.random() * modelKeys.length)];
			const model: ModelDataDTO | undefined = modelDetails.get(randomModelKey);
			if (model) {
				const batteryResult = await stmtRunAsync(batteryStmt, [`HR-${Math.floor(Math.random() * 10000)}`, model.id]);
				const batteryId = batteryResult.lastID;

				// Insert 3 test records for each battery
				for (let j = 0; j < 3; j++) {
					await stmtRunAsync(testStmt, [batteryId, Math.floor(Math.random() * 1000) + 1000, new Date(Date.now() - j * 86400000).toISOString()]);
				}
			}
		}

		batteryStmt.finalize();
		testStmt.finalize();


	} catch (err: any) {
		console.error(err.message);
	} finally {
		// Close the database connection
		db.close((err: Error | null) => {
			if (err) {
				console.error(err.message);
			}
			console.log('Closed the database connection.');
		});
	}
})();
