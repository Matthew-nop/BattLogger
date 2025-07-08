import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

describe('GET /api/data', () => {
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
        const res = await request(app).get('/api/data');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('modelId');
        expect(res.body[0]).toHaveProperty('lastTestedCapacity');
        expect(res.body[0]).toHaveProperty('lastTestedTimestamp');
        expect(res.body[0]).toHaveProperty('chemistryName');
        expect(res.body[0]).toHaveProperty('chemistryShortName');
        expect(res.body[0]).toHaveProperty('formfactorName');
    });
});