import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/testSetup.js';

describe('GET /api/battery_tests/:batteryId', () => {
	let app: any;
	let db: any;
	let batteries: any[];

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());

		// Fetch created batteries to use in tests
		const res = await request(app).get('/api/data');
		batteries = res.body;
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 200', async () => {
		const testBatteryId = batteries[0].id;
		const res = await request(app).get(`/api/battery_tests/${testBatteryId}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Array);
	});
});