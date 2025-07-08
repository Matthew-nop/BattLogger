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

    test('should return 200', async () => {
        // First, create a battery to delete
        const modelMap = (await request(app).get('/api/model_map')).body;
        const firstModelId = Object.keys(modelMap)[0];
        const batteryIdToDelete = randomUUID();
        await request(app).post('/api/create_battery').send({
            batteryId: batteryIdToDelete,
            modelIdentifier: firstModelId
        });

        const res = await request(app).delete(`/api/battery/${batteryIdToDelete}`);
        expect(res.statusCode).toEqual(200);
    });
});