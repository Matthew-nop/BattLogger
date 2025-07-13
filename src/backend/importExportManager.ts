import { Chemistry, FormFactor } from '../interfaces/interfaces.js';
import { ModelDTO } from '../interfaces/tables/ModelDTO.js';
import { BatteryManager } from './batteryManager.js';
import { ChemistryManager } from './chemistryManager.js';
import { FormFactorManager } from './formfactorManager.js';
import { ModelManager } from './modelManager.js';
import { TestManager } from './testManager.js';

export class ImportExportManager {
	private chemistryManager: ChemistryManager;
	private batteryManager: BatteryManager;
	private formFactorManager: FormFactorManager;
	private testManager: TestManager;
	private modelManager: ModelManager;

	constructor(
		batteryManager: BatteryManager, 
		chemistryManager: ChemistryManager,
		formFactorManager: FormFactorManager,
		modelManager: ModelManager,
		testManager: TestManager
	) {
		this.batteryManager = batteryManager;
		this.chemistryManager = chemistryManager;
		this.formFactorManager = formFactorManager;
		this.modelManager = modelManager;
		this.testManager = testManager;
	}

	public async exportChemistriesToJson(): Promise<string> {
		const chemistries: Chemistry[] = await this.chemistryManager.getAllChemistries();
		return JSON.stringify(chemistries, null, 2);
	}

	public async importChemistriesFromJson(json: string): Promise<void> {
		const chemistries: Chemistry[] = JSON.parse(json);
		await this.chemistryManager.populateChemistriesTable(chemistries);
	}

	public async exportFormFactorsToJson(): Promise<string> {
		const formFactors: FormFactor[] = await this.formFactorManager.getAllFormFactors();
		return JSON.stringify(formFactors, null, 2);
	}

	public async importFormFactorsFromJson(json: string): Promise<void> {
		const formfactors: FormFactor[] = JSON.parse(json);
		await this.formFactorManager.populateFormFactorsTable(formfactors);
	}

	public async exportModelsToJson(): Promise<string> {
		const models: ModelDTO[] = await this.modelManager.getAllModels();
		return JSON.stringify(models, null, 2);
	}

	public async importModelsFromJson(json: string): Promise<void> {
		const models: ModelDTO[] = JSON.parse(json);
		await this.modelManager.populateModelsTable(models);
	}

	public async exportDbToJson(): Promise<string> {
		const [batteries, chemistries, formfactors, models, testRuns] = await Promise.all([
			this.batteryManager.getAllBatteries(),
			this.chemistryManager.getAllChemistries(),
			this.formFactorManager.getAllFormFactors(),
			this.modelManager.getAllModels(),
			this.testManager.getAllTestRuns(),
		]);
		const data = {
			batteries, chemistries, formfactors, models, testRuns
		}

		return JSON.stringify(data, null, 2);
	}

	public async importDbFromJson(json: string): Promise<void> {
		const data = JSON.parse(json);

		const { batteries, chemistries, formfactors, models, testRuns } = data;

		await this.formFactorManager.populateFormFactorsTable(formfactors);
		await this.chemistryManager.populateChemistriesTable(chemistries);
		await this.modelManager.populateModelsTable(models);
		await this.batteryManager.populateBatteriesTable(batteries);
		await this.testManager.populateTestRunsTable(testRuns);

	}

}
