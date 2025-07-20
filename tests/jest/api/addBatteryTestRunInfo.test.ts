import request from 'supertest';
import { CreateTestRunInfoParams } from '../../../src/interfaces/interfaces.js';
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/testSetup.js';

describe('POST /api/create_test_run', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 201 with valid data', async () => {
		const testRun: CreateTestRunInfoParams = {
			batteryId: 'test-battery-1',
			capacity: 1500,
			timestamp: new Date().toISOString(),
			processId: 'test-process-1'
		};
		const res = await request(app).post('/api/create_test_run').send(testRun);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
		expect(typeof res.body.id).toBe('string');
	});

	test.each([
		['batteryId', { capacity: 1500, timestamp: new Date().toISOString() }, 'Missing required field: batteryId.'],
		['capacity', { batteryId: 'test-battery-1', timestamp: new Date().toISOString() }, 'Missing required field: capacity.'],
		['timestamp', { batteryId: 'test-battery-1', capacity: 1500 }, 'Missing required field: timestamp.'],
	])('should return 400 if %s is missing', async (field, payload, expectedError) => {
		const res = await request(app).post('/api/create_test_run').send(payload);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual(expectedError);
	});

	test.each([
		['not a number', 'invalid'],
		['a negative number', -100],
	])('should return 400 if capacity is %s', async (testName, capacityValue) => {
		const res = await request(app).post('/api/create_test_run').send({
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
		const res = await request(app).post('/api/create_test_run').send({
			batteryId: 'test-battery-1',
			capacity: 1500,
			timestamp: timestampValue
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Timestamp must be a valid ISO 8601 string.');
	});

	test.each([
		['an empty string', ''],
		['null', null],
		['undefined', undefined],
	])('should return 201 with valid data when processId is %s', async (testName, processIdValue) => {
		const res = await request(app).post('/api/create_test_run').send({
			batteryId: 'test-battery-1',
			capacity: 1500,
			timestamp: new Date().toISOString(),
			processId: processIdValue
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
		expect(typeof res.body.id).toBe('string');
	});
});