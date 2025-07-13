import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { Chemistry, FormFactor } from '../../interfaces/interfaces.js';
import { ModelDTO } from '../../interfaces/tables/ModelDTO.js';
import { ChemistryManager } from '../chemistryManager.js';
import { FormFactorManager } from '../formfactorManager.js';
import { LOG_LEVEL, LoggingManager } from '../loggingManager.js';
import { ModelManager } from '../modelManager.js';

const dataPath = path.join(import.meta.dirname, '..', '..', '..', 'data');

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

export function loadBuiltInChemistries(): Chemistry[] {
	let chemistries: Chemistry[] = [];
	const chemistriesFilePath = path.join(dataPath, 'chemistries.json');
	try {
		const data = fs.readFileSync(chemistriesFilePath, 'utf8');
		chemistries = JSON.parse(data);
	} catch (error) {
		LoggingManager.getInstance().log(LOG_LEVEL.ERROR, `Error reading chemistries.json: ${error}`);
	}
	return chemistries;
}

export function loadBuiltInFormFactors(): FormFactor[] {
	let formfactors: FormFactor[] = [];
	const formFactorsFilePath = path.join(dataPath, 'formfactors.json');
	try {
		const data = fs.readFileSync(formFactorsFilePath, 'utf8');
		formfactors = JSON.parse(data);
	} catch (error) {
		LoggingManager.getInstance().log(LOG_LEVEL.ERROR, `Error reading formfactors.json: ${error}`);
	}
	return formfactors;
}

export function loadBuiltinModelDetails(): ModelDTO[] {
	let models: ModelDTO[] = [];
	const modelsFilePath = path.join(dataPath, 'models.json');
	try {
		const data = fs.readFileSync(modelsFilePath, 'utf8');
		models = JSON.parse(data);
	} catch (error) {
		LoggingManager.getInstance().log(LOG_LEVEL.ERROR, `Error reading models.json: ${error}`);
	}
	return models;
}

export const insertBuiltInData = async (db: sqlite3.Database): Promise<void> => {
	try {
		const formFactorManager = FormFactorManager.getInstance();
		const chemistryManager = ChemistryManager.getInstance();
		const modelManager = ModelManager.getInstance();

		const formfactors: FormFactor[] = loadBuiltInFormFactors();
		const chemistries: Chemistry[] = loadBuiltInChemistries();
		const models: ModelDTO[] = loadBuiltinModelDetails();

		await formFactorManager.populateFormFactorsTable(formfactors);
		await chemistryManager.populateChemistriesTable(chemistries);
		await modelManager.populateModelsTable(models);
	} catch (err: any) {
		LoggingManager.getInstance().log(LOG_LEVEL.ERROR, err.message);
	}
};