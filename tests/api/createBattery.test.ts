import request from 'supertest';
import { randomUUID } from 'crypto';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup.js';

describe('POST /api/create_battery', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 201 with valid data', async () => {
		const modelMap = (await request(app).get('/api/model_map')).body;
		const firstModelId = Object.keys(modelMap)[0];
		const testBatteryId = randomUUID();

		const res = await request(app).post('/api/create_battery').send({
			batteryId: testBatteryId,
			modelIdentifier: firstModelId
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
	});

	test('should return 409 for duplicate ID', async () => {
		const modelMap = (await request(app).get('/api/model_map')).body;
		const firstModelId = Object.keys(modelMap)[0];
		const duplicateBatteryId = randomUUID();

		// First insertion (should succeed)
		await request(app).post('/api/create_battery').send({
			batteryId: duplicateBatteryId,
			modelIdentifier: firstModelId
		});

		// Second insertion with the same ID (should conflict)
		const res = await request(app).post('/api/create_battery').send({
			batteryId: duplicateBatteryId,
			modelIdentifier: firstModelId
		});
		expect(res.statusCode).toEqual(409);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Battery with this ID already exists.');
	});
});