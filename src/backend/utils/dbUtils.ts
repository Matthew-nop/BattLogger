import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';

const dataPath = path.join(__dirname, '..', '..', '..', 'data');

import { createTables } from './createTables.js';
import { ChemistryManager } from '../chemistryManager.js';
import { FormFactorManager } from '../formfactorManager.js';
import { populateModelsTable } from '../modelManager.js';

import { Chemistry, FormFactor, ModelData } from '../../interfaces/interfaces.js';

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

export function loadChemistryDetails(): Map<string, Chemistry> {
	const chemistryDetails = new Map<string, Chemistry>();
	const chemistriesFilePath = path.join(dataPath, 'chemistries.json');
	try {
		const data = fs.readFileSync(chemistriesFilePath, 'utf8');
		const chemistries: Chemistry[] = JSON.parse(data);
		for (const chemistry of chemistries) {
			chemistryDetails.set(chemistry.id, chemistry);
		}
	} catch (error) {
		console.error('Error reading chemistries.json:', error);
	}
	return chemistryDetails;
}

export function loadFormFactorDetails(): Map<string, FormFactor> {
	const formFactorDetails = new Map<string, FormFactor>();
	const formFactorsFilePath = path.join(dataPath, 'formfactors.json');
	try {
		const data = fs.readFileSync(formFactorsFilePath, 'utf8');
		const formFactors: FormFactor[] = JSON.parse(data);
		for (const formFactor of formFactors) {
			formFactorDetails.set(formFactor.id, formFactor);
		}
	} catch (error) {
		console.error('Error reading formfactors.json:', error);
	}
	return formFactorDetails;
}



export function loadModelDetails(): Map<string, ModelData> {
	const modelDetails = new Map<string, ModelData>();
	const modelsFilePath = path.join(dataPath, 'models.json');
	try {
		const data = fs.readFileSync(modelsFilePath, 'utf8');
		const models: ModelData[] = JSON.parse(data);
		for (const model of models) {
			modelDetails.set(model.id, model);
		}
	} catch (error) {
		console.error('Error reading models.json:', error);
	}
	return modelDetails;
}

// Function to load model map (guid to model name)
export function loadModelMap(): Map<string, string> {
	const modelMap = new Map<string, string>();
	const modelDetails = loadModelDetails();
	for (const [guid, details] of modelDetails.entries()) {
		modelMap.set(guid, details.name);
	}
	return modelMap;
}

export const initializeDatabase = async (db: sqlite3.Database): Promise<void> => {
	try {
		await createTables(db);

		const chemistryManager = ChemistryManager.getInstance();
		chemistryManager.setDb(db);

		const modelDetails: Map<string, ModelData> = loadModelDetails();
		
		const formFactorDetails: Map<string, FormFactor> = loadFormFactorDetails();

		const chemistryDetails: Map<string, Chemistry> = loadChemistryDetails();

		await populateModelsTable(db, modelDetails);
		await chemistryManager.populateChemistriesTable(chemistryDetails);
		const formFactorManager = FormFactorManager.getInstance();
		formFactorManager.setDb(db);
		await formFactorManager.populateFormFactorsTable(formFactorDetails);

	} catch (err: any) {
		console.error(err.message);
	}
};