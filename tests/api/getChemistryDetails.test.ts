import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

describe('GET /api/chemistry_details', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 200', async () => {
		const res = await request(app).get('/api/chemistry_details');
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Object);
	});
});