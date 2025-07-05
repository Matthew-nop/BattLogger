import request from 'supertest';
import express from 'express';
import { setupApiRoutes } from '../src/backend/apiRoutes';
import { Database } from 'sqlite3';
import { createTables } from '../src/backend/create_tables';
import { initializeDatabase } from '../src/backend/utils/dbUtils';
import { insertDummyValues } from './utils/testDbUtils';

describe('API Route Integration Smoke Tests', () => {
    let app: express.Application;
    let db: Database;

    beforeAll(async () => {
        app = express();
        app.use(express.json());

        db = new Database(':memory:');
        await createTables(db);
        await initializeDatabase(db);
        await insertDummyValues(db);
        setupApiRoutes(app, db);
    });

    afterAll((done) => {
        db.close(done);
    });

    // GET routes
    test('GET /api/data should return 200', async () => {
        const res = await request(app).get('/api/data');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    test('GET /api/model_map should return 200', async () => {
        const res = await request(app).get('/api/model_map');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Object);
    });

    test('GET /api/model_details should return 200', async () => {
        const res = await request(app).get('/api/model_details');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Object);
    });

    test('GET /api/chemistry_details should return 200', async () => {
        const res = await request(app).get('/api/chemistry_details');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Object);
    });

    test('GET /api/formfactor_details should return 200', async () => {
        const res = await request(app).get('/api/formfactor_details');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Object);
    });

    test('GET /api/model_details_data/:guid should return 404 for non-existent GUID', async () => {
        const testGuid = 'non-existent-guid';
        const res = await request(app).get(`/api/model_details_data/${testGuid}`);
        expect(res.statusCode).toEqual(404);
    });

    test('GET /api/battery_tests/:batteryId should return 200', async () => {
        const testBatteryId = 1; // Assuming battery IDs are numbers and 1 exists after setup
        const res = await request(app).get(`/api/battery_tests/${testBatteryId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    test('GET /api/battery/:batteryId should return 200', async () => {
        const testBatteryId = 1; // Assuming battery IDs are numbers and 1 exists after setup
        const res = await request(app).get(`/api/battery/${testBatteryId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Object);
    });

    // POST routes
    test('POST /api/create_model should return 201 with valid data', async () => {
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

    test('POST /api/create_form_factor should return 201 with valid data', async () => {
        const res = await request(app).post('/api/create_form_factor').send({
            name: 'Test Form Factor'
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('POST /api/create_chemistry should return 201 with valid data', async () => {
        const res = await request(app).post('/api/create_chemistry').send({
            name: 'Test Chemistry',
            nominalVoltage: 3.7
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('POST /api/create_battery should return 201 with valid data', async () => {
        const modelMap = (await request(app).get('/api/model_map')).body;
        const firstModelId = Object.keys(modelMap)[0];

        const res = await request(app).post('/api/create_battery').send({
            hrIdentifier: 'HR-TEST-001',
            modelIdentifier: firstModelId
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('POST /api/battery_test should return 201 with valid data', async () => {
        const res = await request(app).post('/api/battery_test').send({
            batteryId: 1, // Assuming battery with ID 1 exists
            capacity: 1500,
            timestamp: new Date().toISOString()
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    // PUT routes
    test('PUT /api/battery/:batteryId should return 200 with valid data', async () => {
        const testBatteryId = 1; // Assuming battery with ID 1 exists
        const modelMap = (await request(app).get('/api/model_map')).body;
        const firstModelId = Object.keys(modelMap)[0];

        const res = await request(app).put(`/api/battery/${testBatteryId}`).send({
            hrIdentifier: 'HR-UPDATED-001',
            modelIdentifier: firstModelId
        });
        expect(res.statusCode).toEqual(200);
    });

    // DELETE routes
    test('DELETE /api/battery/:batteryId should return 200', async () => {
        // First, create a battery to delete
        const modelMap = (await request(app).get('/api/model_map')).body;
        const firstModelId = Object.keys(modelMap)[0];
        const createRes = await request(app).post('/api/create_battery').send({
            hrIdentifier: 'HR-TO-DELETE',
            modelIdentifier: firstModelId
        });
        const batteryIdToDelete = createRes.body.id;

        const res = await request(app).delete(`/api/battery/${batteryIdToDelete}`);
        expect(res.statusCode).toEqual(200);
    });
});
