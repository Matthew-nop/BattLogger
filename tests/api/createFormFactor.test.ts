import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

describe('POST /api/create_formfactor', () => {
    let app: any;
    let db: any;

    beforeAll(async () => {
        ({ app, db } = await setupTestEnvironment());
    });

    afterAll(async () => {
        await teardownTestEnvironment(db);
    });

    test('should return 201 with valid data', async () => {
        const res = await request(app).post('/api/create_formfactor').send({
            name: 'Test Form Factor'
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });
});