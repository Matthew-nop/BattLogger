import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/testSetup.js';

describe('GET /api/model_map', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 200', async () => {
		const res = await request(app).get('/api/model_map');
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Object);
	});
});