import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/testSetup.js';

describe('GET /api/test_run_processes', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 200 with an array of test run processes', async () => {
		const res = await request(app).get('/api/test_run_processes');
		expect(res.statusCode).toEqual(200);
		expect(Array.isArray(res.body)).toBe(true);
	});
});