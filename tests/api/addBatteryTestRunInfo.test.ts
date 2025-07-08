import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

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
			batteryId: 1, // Assuming battery with ID 1 exists
			capacity: 1500,
			timestamp: new Date().toISOString()
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
	});
});