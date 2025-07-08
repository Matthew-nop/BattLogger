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
			timestamp: new Date().toISOString()
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
	});

	test.each([
		['batteryId', { capacity: 1500, timestamp: new Date().toISOString() }, 'Missing required field: batteryId.'],
		['capacity', { batteryId: 'test-battery-1', timestamp: new Date().toISOString() }, 'Missing required field: capacity.'],
		['timestamp', { batteryId: 'test-battery-1', capacity: 1500 }, 'Missing required field: timestamp.'],
	])('should return 400 if %s is missing', async (field, payload, expectedError) => {
		const res = await request(app).post('/api/battery_test').send(payload);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual(expectedError);
	});

	test.each([
		['not a number', 'invalid'],
		['a negative number', -100],
	])('should return 400 if capacity is %s', async (testName, capacityValue) => {
		const res = await request(app).post('/api/battery_test').send({
			batteryId: 'test-battery-1',
			capacity: capacityValue,
			timestamp: new Date().toISOString()
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Capacity must be a positive number.');
	});

	test.each([
		['not a valid ISO 8601 string', 'invalid-date'],
		['an empty string', ''],
	])('should return 400 if timestamp is %s', async (testName, timestampValue) => {
		const res = await request(app).post('/api/battery_test').send({
			batteryId: 'test-battery-1',
			capacity: 1500,
			timestamp: timestampValue
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Timestamp must be a valid ISO 8601 string.');
	});
});