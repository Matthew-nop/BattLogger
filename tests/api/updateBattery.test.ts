import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

describe('PUT /api/battery/:batteryId', () => {
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

    test('should return 200 with valid data', async () => {
        const testBatteryId = batteries[0].id;
        const modelMap = (await request(app).get('/api/model_map')).body;
        const firstModelId = Object.keys(modelMap)[0];

        const res = await request(app).put(`/api/battery/${testBatteryId}`).send({
            modelIdentifier: firstModelId
        });
        expect(res.statusCode).toEqual(200);
    });
});