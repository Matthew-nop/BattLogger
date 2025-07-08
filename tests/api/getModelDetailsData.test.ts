import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

describe('GET /api/model_details_data/:guid', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 404 for non-existent GUID', async () => {
		const testGuid = 'non-existent-guid';
		const res = await request(app).get(`/api/model_details_data/${testGuid}`);
		expect(res.statusCode).toEqual(404);
	});
});