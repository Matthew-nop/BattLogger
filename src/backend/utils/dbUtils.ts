import * as sqlite3 from 'sqlite3';

import { createTables } from '../create_tables';
import { loadChemistryDetails, populateChemistriesTable } from '../chemistryManager';
import { loadFormFactorDetails, populateFormFactorsTable } from '../formfactorManager';
import { loadModelDetails, populateModelsTable } from '../modelManager';

import { Chemistry, FormFactor, ModelDataDTO } from '../../interfaces/interfaces';

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const stmtRunAsync = (stmt: sqlite3.Statement, params: any[] = []): Promise<sqlite3.RunResult> => {
	return new Promise((resolve, reject) => {
		stmt.run(params, function (this: sqlite3.RunResult, err: Error | null) {
			if (err) {
				reject(err);
			} else {
				resolve(this);
			}
		});
	});
};

export const initializeDatabase = async (db: sqlite3.Database): Promise<void> => {
	try {
		await createTables(db);

		const modelDetails: Map<string, ModelDataDTO> = loadModelDetails();
		const chemistryDetails: Map<string, Chemistry> = loadChemistryDetails();
		const formFactorDetails: Map<string, FormFactor> = loadFormFactorDetails();

		await populateModelsTable(db, modelDetails);
		await populateChemistriesTable(db, chemistryDetails);
		await populateFormFactorsTable(db, formFactorDetails);

	} catch (err: any) {
		console.error(err.message);
	}
};