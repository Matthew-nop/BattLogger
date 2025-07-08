import request from 'supertest';
import { randomUUID } from 'crypto';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup.js';

describe('POST /api/create_battery', () => {
	let app: any;
	let db: any;
	// To fix ts false error "'firstModelId' is used before being assigned.ts(2454)"
	let firstModelId: string = '';

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
		const modelMap = (await request(app).get('/api/model_map')).body;
		firstModelId = Object.keys(modelMap)[0];
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 201 with valid data', async () => {
		const testBatteryId = randomUUID();

		const res = await request(app).post('/api/create_battery').send({
			batteryId: testBatteryId,
			modelIdentifier: firstModelId
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
	});

	test.each([
		['batteryId', { modelIdentifier: firstModelId }],
		['modelIdentifier', { batteryId: randomUUID() }],
	])('should return 400 if %s is missing', async (field, payload) => {
		const res = await request(app).post('/api/create_battery').send(payload);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Missing required fields: batteryId or modelIdentifier.');
	});

	test('should return 400 if modelIdentifier is invalid', async () => {
		const res = await request(app).post('/api/create_battery').send({
			batteryId: randomUUID(),
			modelIdentifier: 'invalid-model-id'
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Invalid model identifier.');
	});

	test('should return 409 for duplicate ID', async () => {
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