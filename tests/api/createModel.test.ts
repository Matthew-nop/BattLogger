import request from 'supertest';
import { setupTestEnvironment, teardownTestEnvironment } from '../utils/testSetup';

describe('POST /api/create_model', () => {
    let app: any;
    let db: any;

    beforeAll(async () => {
        ({ app, db } = await setupTestEnvironment());
    });

    afterAll(async () => {
        await teardownTestEnvironment(db);
    });

    test('should return 201 with valid data', async () => {
        const res = await request(app).post('/api/create_model').send({
            name: 'Test Model',
            designCapacity: 1000,
            formFactorId: Object.keys((await request(app).get('/api/formfactor_details')).body)[0], // Get an existing form factor ID
            chemistryId: Object.keys((await request(app).get('/api/chemistry_details')).body)[0], // Get an existing chemistry ID
            manufacturer: 'Test Manufacturer'
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });
});