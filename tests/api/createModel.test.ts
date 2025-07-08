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
		const formFactorId = Object.keys((await request(app).get('/api/formfactor_details')).body)[0];
		const chemistryId = Object.keys((await request(app).get('/api/chemistry_details')).body)[0];

		const res = await request(app).post('/api/create_model').send({
			name: 'Test Model',
			designCapacity: 1000,
			formFactorId: formFactorId,
			chemistryId: chemistryId,
			manufacturer: 'Test Manufacturer'
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('id');
	});

	test('should return 400 if designCapacity is not a number', async () => {
		const formFactorId = Object.keys((await request(app).get('/api/formfactor_details')).body)[0];
		const chemistryId = Object.keys((await request(app).get('/api/chemistry_details')).body)[0];

		const res = await request(app).post('/api/create_model').send({
			name: 'Test Model',
			designCapacity: 'invalid',
			formFactorId: formFactorId,
			chemistryId: chemistryId,
			manufacturer: 'Test Manufacturer'
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Design capacity must be a number if provided.');
	});

	test('should return 400 if formFactorId is invalid', async () => {
		const chemistryId = Object.keys((await request(app).get('/api/chemistry_details')).body)[0];

		const res = await request(app).post('/api/create_model').send({
			name: 'Test Model',
			designCapacity: 1000,
			formFactorId: 'non-existent-formfactor-id',
			chemistryId: chemistryId,
			manufacturer: 'Test Manufacturer'
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Missing required fields: name, formFactorId, and chemistryId are required.');
	});

	test('should return 400 if chemistryId is invalid', async () => {
		const formFactorId = Object.keys((await request(app).get('/api/formfactor_details')).body)[0];

		const res = await request(app).post('/api/create_model').send({
			name: 'Test Model',
			designCapacity: 1000,
			formFactorId: formFactorId,
			chemistryId: 'non-existent-chemistry-id',
			manufacturer: 'Test Manufacturer'
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body).toHaveProperty('error');
		expect(res.body.error).toEqual('Invalid chemistry ID.');
	});
});