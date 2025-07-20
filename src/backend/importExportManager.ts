import { BatteryDTO, Chemistry, FormFactor, TestRunInfo } from '../interfaces/interfaces.js';
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

	public async importChemistries(chemistries: Chemistry[]): Promise<void> {
		await this.chemistryManager.populateChemistriesTable(chemistries);
	}

	public async exportFormfactorsToJson(): Promise<string> {
		const formFactors: FormFactor[] = await this.formFactorManager.getAllFormFactors();
		return JSON.stringify(formFactors, null, 2);
	}

	public async importFormfactors(formfactors: FormFactor[]): Promise<void> {
		await this.formFactorManager.populateFormFactorsTable(formfactors);
	}

	public async exportModelsToJson(): Promise<string> {
		const models: ModelDTO[] = await this.modelManager.getAllModels();
		return JSON.stringify(models, null, 2);
	}

	public async importModels(models: ModelDTO[]): Promise<void> {
		await this.modelManager.populateModelsTable(models);
	}

	public async exportBatteriesToJson(): Promise<string> {
		const batteries: BatteryDTO[] = await this.batteryManager.getAllBatteries();
		return JSON.stringify(batteries, null, 2);
	}

	public async importBatteries(batteries: BatteryDTO[]): Promise<void> {
		await this.batteryManager.populateBatteriesTable(batteries);
	}

	public async exportTestRunsToJson(): Promise<string> {
		const testRuns: TestRunInfo[] = await this.testManager.getAllTestRuns();
		return JSON.stringify(testRuns, null, 2);
	}

	public async importTestRuns(testRuns: TestRunInfo[]): Promise<void> {
		await this.testManager.populateTestRunsTable(testRuns);
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

	public async importAll(data: any): Promise<void> {
		const { batteries, chemistries, formfactors, models, testRuns } = data;

		await this.formFactorManager.populateFormFactorsTable(formfactors);
		await this.chemistryManager.populateChemistriesTable(chemistries);
		await this.modelManager.populateModelsTable(models);
		await this.batteryManager.populateBatteriesTable(batteries);
		await this.testManager.populateTestRunsTable(testRuns);

	}

}
