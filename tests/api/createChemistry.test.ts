import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

describe('POST /api/create_chemistry', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 201 with valid data', async () => {
		const res = await request(app).post('/api/create_chemistry').send({
			name: 'Test Chemistry',
			shortName: 'TestChem',
			nominalVoltage: 3.7
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
	});

	test.each([
		['name', { shortName: 'TestChem', nominalVoltage: 3.7 }],
		['shortName', { name: 'Test Chemistry', nominalVoltage: 3.7 }],
		['nominalVoltage', { name: 'Test Chemistry', shortName: 'TestChem' }],
	])('should return 400 if %s is missing', async (field, payload) => {
		const res = await request(app).post('/api/create_chemistry').send(payload);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Missing required fields.');
	});

	test('should return 400 if nominalVoltage is not a number', async () => {
		const res = await request(app).post('/api/create_chemistry').send({
			name: 'Test Chemistry',
			shortName: 'TestChem',
			nominalVoltage: 'invalid'
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Missing required fields.');
	});
});