import { randomUUID } from 'crypto';
import request from 'supertest';
import { createTables } from '../../../src/backend/utils/createTables.js';
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/testSetup.js';

describe('Import/Export API Routes', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	it('should export all data', async () => {
		const res = await request(app).get('/api/export/all');
		expect(res.statusCode).toEqual(200);
		expect(res.headers['content-type']).toContain('application/json');
		expect(res.headers['content-disposition']).toContain('attachment; filename=battlogger_data.json');
		const data = JSON.parse(res.text);
		expect(data).toHaveProperty('batteries');
		expect(data).toHaveProperty('chemistries');
		expect(data).toHaveProperty('formfactors');
		expect(data).toHaveProperty('models');
		expect(data).toHaveProperty('testRuns');
		expect(data.chemistries.length).toBeGreaterThan(0);
		expect(data.formfactors.length).toBeGreaterThan(0);
		expect(data.models.length).toBeGreaterThan(0);
	});

	it('should import all data', async () => {
		// First, export existing data to use as import data
		const exportRes = await request(app).get('/api/export/all');
		const exportedData = JSON.parse(exportRes.text);

		// Clear the database
		await createTables(db); // This will drop and recreate tables, effectively clearing them

		// Import the data
		const importRes = await request(app)
			.post('/api/import/all')
			.send(exportedData);

		expect(importRes.statusCode).toEqual(200);
		expect(importRes.body.message).toEqual('All data imported successfully');

		// Verify data was imported by exporting again and comparing
		const verifyExportRes = await request(app).get('/api/export/all');
		const verifiedData = JSON.parse(verifyExportRes.text);

		// Note: testRuns might have different IDs if they are auto-incremented, so we compare relevant parts
		expect(verifiedData.batteries).toEqual(exportedData.batteries);
		expect(verifiedData.chemistries).toEqual(exportedData.chemistries);
		expect(verifiedData.formfactors).toEqual(exportedData.formfactors);
		expect(verifiedData.models).toEqual(exportedData.models);
		// For testRuns, we might need a more nuanced comparison if IDs are generated on import
		// For now, just check if the count matches and relevant fields are there
		expect(verifiedData.testRuns.length).toEqual(exportedData.testRuns.length);
	});

	it('should export chemistries', async () => {
		const res = await request(app).get('/api/export/chemistries');
		expect(res.statusCode).toEqual(200);
		expect(res.headers['content-type']).toContain('application/json');
		expect(res.headers['content-disposition']).toContain('attachment; filename=chemistries.json');
		const data = JSON.parse(res.text);
		expect(data.length).toBeGreaterThan(0);
		expect(data[0]).toHaveProperty('id');
		expect(data[0]).toHaveProperty('name');
	});

	it('should import chemistries', async () => {
		const newChemistry = {
			id: randomUUID(),
			name: 'Test Chemistry',
			shortName: 'TC',
			nominalVoltage: 3.7
		};
		const importRes = await request(app)
			.post('/api/import/chemistries')
			.send([newChemistry]);

		expect(importRes.statusCode).toEqual(200);
		expect(importRes.body.message).toEqual('Chemistries imported successfully');

		const exportRes = await request(app).get('/api/export/chemistries');
		const chemistries = JSON.parse(exportRes.text);
		expect(chemistries).toContainEqual(expect.objectContaining(newChemistry));
	});

	it('should export formfactors', async () => {
		const res = await request(app).get('/api/export/formfactors');
		expect(res.statusCode).toEqual(200);
		expect(res.headers['content-type']).toContain('application/json');
		expect(res.headers['content-disposition']).toContain('attachment; filename=formfactors.json');
		const data = JSON.parse(res.text);
		expect(data.length).toBeGreaterThan(0);
		expect(data[0]).toHaveProperty('id');
		expect(data[0]).toHaveProperty('name');
	});

	it('should import formfactors', async () => {
		const newFormFactor = {
			id: randomUUID(),
			name: 'Test Form Factor'
		};
		const importRes = await request(app)
			.post('/api/import/formfactors')
			.send([newFormFactor]);

		expect(importRes.statusCode).toEqual(200);
		expect(importRes.body.message).toEqual('Form factors imported successfully');

		const exportRes = await request(app).get('/api/export/formfactors');
		const formfactors = JSON.parse(exportRes.text);
		expect(formfactors).toContainEqual(expect.objectContaining(newFormFactor));
	});

	it('should export models', async () => {
		const res = await request(app).get('/api/export/models');
		expect(res.statusCode).toEqual(200);
		expect(res.headers['content-type']).toContain('application/json');
		expect(res.headers['content-disposition']).toContain('attachment; filename=models.json');
		const data = JSON.parse(res.text);
		expect(data.length).toBeGreaterThan(0);
		expect(data[0]).toHaveProperty('id');
		expect(data[0]).toHaveProperty('name');
	});

	it('should import models', async () => {
		// Need valid chemistry and formfactor IDs for a model
		const exportChemRes = await request(app).get('/api/export/chemistries');
		const chemistries = JSON.parse(exportChemRes.text);
		const exportFFRes = await request(app).get('/api/export/formfactors');
		const formfactors = JSON.parse(exportFFRes.text);

		const newModel = {
			id: randomUUID(),
			name: 'Test Model',
			designCapacity: 1000,
			manufacturer: 'Test Mfg',
			chemistryId: chemistries[0].id,
			formFactorId: formfactors[0].id
		};

		const importRes = await request(app)
			.post('/api/import/models')
			.send([newModel]);

		expect(importRes.statusCode).toEqual(200);
		expect(importRes.body.message).toEqual('Models imported successfully');

		const exportRes = await request(app).get('/api/export/models');
		const models = JSON.parse(exportRes.text);
		expect(models).toContainEqual(expect.objectContaining(newModel));
	});

	it('should export batteries', async () => {
		const res = await request(app).get('/api/export/batteries');
		expect(res.statusCode).toEqual(200);
		expect(res.headers['content-type']).toContain('application/json');
		expect(res.headers['content-disposition']).toContain('attachment; filename=batteries.json');
		const data = JSON.parse(res.text);
		expect(Array.isArray(data)).toBe(true);
	});

	it('should import batteries', async () => {
		const exportModelsRes = await request(app).get('/api/export/models');
		const models = JSON.parse(exportModelsRes.text);
		const newBattery = {
			id: randomUUID(),
			modelId: models[0].id
		};

		const importRes = await request(app)
			.post('/api/import/batteries')
			.send([newBattery]);

		expect(importRes.statusCode).toEqual(200);
		expect(importRes.body.message).toEqual('Batteries imported successfully');

		const exportRes = await request(app).get('/api/export/batteries');
		const batteries = JSON.parse(exportRes.text);
		expect(batteries).toContainEqual(expect.objectContaining({ id: newBattery.id, modelId: newBattery.modelId }));
	});

	it('should export test runs', async () => {
		const res = await request(app).get('/api/export/testruns');
		expect(res.statusCode).toEqual(200);
		expect(res.headers['content-type']).toContain('application/json');
		expect(res.headers['content-disposition']).toContain('attachment; filename=testruns.json');
		const data = JSON.parse(res.text);
		expect(Array.isArray(data)).toBe(true);
	});

	it('should import test runs', async () => {
		const exportBatteriesRes = await request(app).get('/api/export/batteries');
		const batteries = JSON.parse(exportBatteriesRes.text);
		const newTestRun = {
			battery_id: batteries[0].id,
			capacity: 1234,
			timestamp: new Date().toISOString()
		};

		const importRes = await request(app)
			.post('/api/import/testruns')
			.send([newTestRun]);

		expect(importRes.statusCode).toEqual(200);
		expect(importRes.body.message).toEqual('Test runs imported successfully');

		const exportRes = await request(app).get('/api/export/testruns');
		const testRuns = JSON.parse(exportRes.text);
		expect(testRuns).toContainEqual(expect.objectContaining({
			battery_id: newTestRun.battery_id,
			capacity: newTestRun.capacity,
		}));
	});
});
