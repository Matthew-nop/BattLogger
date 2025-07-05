import { Request, Response } from 'express';
import * as path from 'path';

const frontendPath = path.join(__dirname, '..', '..', 'dist', 'frontend');

export function setupPageRoutes(app: any) {
	app.get('/model_details', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'model-details', 'model_details.html'));
	});

	app.get('/battery_details/:batteryId', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'battery-details', 'battery_details.html'));
	});

	app.get('/add_model', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'add-model', 'add_model.html'));
	});

	app.get('/add_formfactor', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'add-formfactor', 'add_formfactor.html'));
	});

	app.get('/add_chemistry', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'add-chemistry', 'add_chemistry.html'));
	});

	app.get('/add_battery', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'add-battery', 'add_battery.html'));
	});

	app.get('/add_test_info', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'add-test-info', 'add_test_info.html'));
	});

	app.get('/battery_summary', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'battery-summary', 'battery_summary.html'));
	});

	app.get('/', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'index.html'));
	});
}