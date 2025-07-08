import request from 'supertest';
import express from 'express';
import { setupApiRoutes } from '../src/backend/apiRoutes';
import { ChemistryManager } from '../src/backend/chemistryManager';
import { FormFactorManager } from '../src/backend/formfactorManager';
import { Database } from 'sqlite3';
import { createTables } from '../src/backend/create_tables';
import { initializeDatabase } from '../src/backend/utils/dbUtils';
import { insertDummyValues } from './utils/testDbUtils';

import { randomUUID } from 'crypto';

describe('API Route Integration Smoke Tests', () => {
    let app: express.Application;
    let db: Database;
    let batteries: any[];

    beforeAll(async () => {
        app = express();
        app.use(express.json());

        db = new Database(':memory:');
        await createTables(db);
        await initializeDatabase(db);
        await insertDummyValues(db);
        const chemistryManager = ChemistryManager.getInstance();
        chemistryManager.setDb(db);
        const formFactorManager = FormFactorManager.getInstance();
        formFactorManager.setDb(db);
        setupApiRoutes(app, db, chemistryManager, formFactorManager);

        // Fetch created batteries to use in tests
        const res = await request(app).get('/api/data');
        batteries = res.body;
    });

    afterAll((done) => {
        db.close(done);
    });

    // GET routes
    test('GET /api/data should return 200', async () => {
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
        const testBatteryId = batteries[0].id;
        const res = await request(app).get(`/api/battery_tests/${testBatteryId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    test('GET /api/battery/:batteryId should return 200', async () => {
        const testBatteryId = batteries[0].id;
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

    test('POST /api/create_formfactor should return 201 with valid data', async () => {
        const res = await request(app).post('/api/create_formfactor').send({
            name: 'Test Form Factor'
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('POST /api/create_chemistry should return 201 with valid data', async () => {
        const res = await request(app).post('/api/create_chemistry').send({
            name: 'Test Chemistry',
            shortName: 'TestChem',
            nominalVoltage: 3.7
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('POST /api/create_battery should return 201 with valid data', async () => {
        const modelMap = (await request(app).get('/api/model_map')).body;
        const firstModelId = Object.keys(modelMap)[0];
        const testBatteryId = randomUUID();

        const res = await request(app).post('/api/create_battery').send({
            batteryId: testBatteryId,
            modelIdentifier: firstModelId
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('POST /api/create_battery should return 409 for duplicate ID', async () => {
        const modelMap = (await request(app).get('/api/model_map')).body;
        const firstModelId = Object.keys(modelMap)[0];
        const duplicateBatteryId = randomUUID();

        // First insertion (should succeed)
        await request(app).post('/api/create_battery').send({
            batteryId: duplicateBatteryId,
            modelIdentifier: firstModelId
        });

        // Second insertion with the same ID (should conflict)
        const res = await request(app).post('/api/create_battery').send({
            batteryId: duplicateBatteryId,
            modelIdentifier: firstModelId
        });
        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Battery with this ID already exists.');
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
        const testBatteryId = batteries[0].id;
        const modelMap = (await request(app).get('/api/model_map')).body;
        const firstModelId = Object.keys(modelMap)[0];

        const res = await request(app).put(`/api/battery/${testBatteryId}`).send({
            modelIdentifier: firstModelId
        });
        expect(res.statusCode).toEqual(200);
    });

    // DELETE routes
    test('DELETE /api/battery/:batteryId should return 200', async () => {
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
