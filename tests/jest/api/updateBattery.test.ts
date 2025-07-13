import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/testSetup.js';

describe('PUT /api/battery/:batteryId', () => {
	let app: any;
	let db: any;

	beforeAll(async () => {
		({ app, db } = await setupTestEnvironment());
	});

	afterAll(async () => {
		await teardownTestEnvironment(db);
	});

	test('should return 200 and update the model ID', async () => {
		const modelMap = (await request(app).get('/api/model_map')).body;
		const modelIds = Object.keys(modelMap);
		const initialModelId = modelIds[0];
		const newModelId = modelIds[1]; // Use a different model ID for update

		// Create a battery with the initial model ID
		const createRes = await request(app).post('/api/create_battery').send({
			batteryId: 'test-battery-123',
			modelIdentifier: initialModelId
		});
		expect(createRes.statusCode).toEqual(201);
		const batteryId = createRes.body.id;

		// Fetch the battery details and verify the initial model ID
		const initialGetRes = await request(app).get(`/api/battery/${batteryId}`);
		expect(initialGetRes.statusCode).toEqual(200);
		expect(initialGetRes.body.modelId).toEqual(initialModelId);

		// Update the battery with the new model ID
		const updateRes = await request(app).put(`/api/battery/${batteryId}`).send({
			modelIdentifier: newModelId
		});
		expect(updateRes.statusCode).toEqual(200);

		// Fetch the battery details and verify the updated model ID
		const getRes = await request(app).get(`/api/battery/${batteryId}`);
		expect(getRes.statusCode).toEqual(200);
		expect(getRes.body.modelId).toEqual(newModelId);
	});
});