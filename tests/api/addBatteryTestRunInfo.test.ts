import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup.js';

describe('POST /api/battery_test', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 201 with valid data', async () => {
		const res = await request(app).post('/api/battery_test').send({
			batteryId: 'test-battery-1',
			capacity: 1500,
			timestamp: Date.now()
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
	});

	test.each([
		['batteryId', { capacity: 1500, timestamp: Date.now() }],
		['capacity', { batteryId: 'test-battery-1', timestamp: Date.now() }],
		['timestamp', { batteryId: 'test-battery-1', capacity: 1500 }],
	])('should return 400 if %s is missing', async (field, payload) => {
		const res = await request(app).post('/api/battery_test').send(payload);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Missing required fields: batteryId, capacity, or a valid timestamp.');
	});

	test.each([
		['not a number', 'invalid'],
		['a negative number', -100],
	])('should return 400 if capacity is %s', async (testName, capacityValue) => {
		const res = await request(app).post('/api/battery_test').send({
			batteryId: 'test-battery-1',
			capacity: capacityValue,
			timestamp: Date.now()
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Capacity must be a positive number.');
	});

	test('should return 400 if timestamp is not a valid number', async () => {
		const res = await request(app).post('/api/battery_test').send({
			batteryId: 'test-battery-1',
			capacity: 1500,
			timestamp: 'invalid'
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Missing required fields: batteryId, capacity, or a valid timestamp.');
	});
});