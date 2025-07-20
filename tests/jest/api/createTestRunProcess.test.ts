import request from 'supertest';
import { CreateTestRunProcessParams } from '../../../src/interfaces/interfaces.js';
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/testSetup.js';

describe('POST /api/create_test_run_process', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 201 with valid data', async () => {
		const testRunProcess: CreateTestRunProcessParams = {
			name: 'Test Process',
			description: 'A test process description.'
		};
		const res = await request(app).post('/api/create_test_run_process').send(testRunProcess);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
		expect(typeof res.body.id).toBe('string');
	});

	test('should return 400 if description is missing', async () => {
		const testRunProcess: CreateTestRunProcessParams = {
			name: 'Test Process Without Description',
			description: undefined as any
		};
		const res = await request(app).post('/api/create_test_run_process').send(testRunProcess);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Missing required field: description.');
	});

	test('should return 400 if name is missing', async () => {
		const testRunProcess: CreateTestRunProcessParams = {
			name: undefined as any,
			description: 'A test process with no name.'
		};
		const res = await request(app).post('/api/create_test_run_process').send(testRunProcess);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Missing required field: name.');
	});
});