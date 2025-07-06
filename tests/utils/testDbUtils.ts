import * as sqlite3 from 'sqlite3';

import { createTables } from '../../src/backend/create_tables';
import { loadChemistryDetails, populateChemistriesTable } from '../../src/backend/chemistryManager';
import { loadFormFactorDetails, populateFormFactorsTable } from '../../src/backend/formfactorManager';
import { loadModelDetails, populateModelsTable } from '../../src/backend/modelManager';
import { stmtRunAsync } from '../../src/backend/utils/dbUtils';

import { Chemistry } from '../../src/interfaces/Chemistry';
import { FormFactor } from '../../src/interfaces/FormFactor';
import { ModelDataDTO } from '../../src/interfaces/ModelDataDTO';
import { randomUUID } from 'crypto';

export const insertDummyValues = async (db: sqlite3.Database): Promise<void> => {
	try {
		const modelDetails: Map<string, ModelDataDTO> = loadModelDetails();
		const chemistryDetails: Map<string, Chemistry> = loadChemistryDetails();
		const formFactorDetails: Map<string, FormFactor> = loadFormFactorDetails();

		// Insert dummy battery and test data as part of application setup
		const batteryStmt = db.prepare("INSERT INTO batteries (id, model_id) VALUES (?, ?)");
		const testStmt = db.prepare("INSERT INTO battery_tests (battery_id, capacity, timestamp) VALUES (?, ?, ?)");

		const modelKeys = Array.from(modelDetails.keys());
		const chemistryKeys = Array.from(chemistryDetails.keys());
		const formFactorKeys = Array.from(formFactorDetails.keys());

		for (let i = 0; i < 11; i++) {
			const randomModelKey = modelKeys[Math.floor(Math.random() * modelKeys.length)];
			const model: ModelDataDTO | undefined = modelDetails.get(randomModelKey);
			if (model) {
				const batteryId = randomUUID();
				await stmtRunAsync(batteryStmt, [batteryId, model.id]);

				// Insert 3 test records for each battery
				for (let j = 0; j < 4; j++) {
					await stmtRunAsync(testStmt, [batteryId, Math.floor(Math.random() * 1000) + 1000, new Date(Date.now() - j * 86400000).toISOString()]);
				}
			}
		}

		batteryStmt.finalize();
		testStmt.finalize();

	} catch (err: any) {
		console.error(err.message);
	}
};