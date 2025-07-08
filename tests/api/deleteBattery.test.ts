import request from 'supertest';
import { randomUUID } from 'crypto';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

describe('DELETE /api/battery/:batteryId', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 200 when deleting an existing battery', async () => {
		// First, create a battery to delete
		const modelMap = (await request(app).get('/api/model_map')).body;
		const firstModelId = Object.keys(modelMap)[0];
		const batteryIdToDelete = randomUUID();
		const createRes = await request(app).post('/api/create_battery').send({
			batteryId: batteryIdToDelete,
			modelIdentifier: firstModelId
		});
		expect(createRes.statusCode).toEqual(201);

		// Verify the battery exists before deletion
		const getBeforeDeleteRes = await request(app).get(`/api/battery/${batteryIdToDelete}`);
		expect(getBeforeDeleteRes.statusCode).toEqual(200);
		expect(getBeforeDeleteRes.body.id).toEqual(batteryIdToDelete);

		// Delete the battery
		const deleteRes = await request(app).delete(`/api/battery/${batteryIdToDelete}`);
		expect(deleteRes.statusCode).toEqual(200);

		// Verify the battery no longer exists after deletion
		const getAfterDeleteRes = await request(app).get(`/api/battery/${batteryIdToDelete}`);
		expect(getAfterDeleteRes.statusCode).toEqual(404);
	});

	test('should return 404 for a non-existent battery ID', async () => {
		const nonExistentBatteryId = randomUUID();
		const res = await request(app).delete(`/api/battery/${nonExistentBatteryId}`);
		expect(res.statusCode).toEqual(404);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Battery not found.');
	});
});