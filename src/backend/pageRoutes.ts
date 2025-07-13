import { Request, Response } from 'express';
import * as path from 'path';

const frontendPath = path.join(import.meta.dirname, '..', '..', 'dist', 'frontend');

export function setupPageRoutes(app: any) {
	app.get('/model_details', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'model-details', 'model_details.html'));
	});

	app.get('/battery_details/:batteryId', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'battery-details', 'battery_details.html'));
	});

	app.get('/add_battery_type', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'add-battery-type', 'add-battery-type.html'));
	});

	app.get('/add_battery', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'add-battery', 'add_battery.html'));
	});

	app.get('/add_test_info', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'add-test-info', 'add_test_info.html'));
	});

	app.get('/import_export', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'import-export', 'import_export.html'));
	});

	app.get('/battery_summary', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'battery-summary', 'battery_summary.html'));
	});

	app.get('/', (req: Request, res: Response) => {
		res.sendFile(path.join(frontendPath, 'index.html'));
	});
}