import { Request, Response } from 'express';
import * as path from 'path';

const distPath = path.join(__dirname, '..', '..', 'dist');

export function setupPageRoutes(app: any) {
	app.get('/model_details', (req: Request, res: Response) => {
		res.sendFile(path.join(distPath, 'components', 'model-details', 'model_details.html'));
	});

	app.get('/battery_details/:batteryId', (req: Request, res: Response) => {
		res.sendFile(path.join(distPath, 'components', 'battery-details', 'battery_details.html'));
	});

	app.get('/add_model', (req: Request, res: Response) => {
		res.sendFile(path.join(distPath, 'components', 'add-model', 'add_model.html'));
	});

	app.get('/add_formfactor', (req: Request, res: Response) => {
		res.sendFile(path.join(distPath, 'components', 'add-formfactor', 'add_formfactor.html'));
	});

	app.get('/add_chemistry', (req: Request, res: Response) => {
		res.sendFile(path.join(distPath, 'components', 'add-chemistry', 'add_chemistry.html'));
	});

	app.get('/add_battery', (req: Request, res: Response) => {
		res.sendFile(path.join(distPath, 'components', 'add-battery', 'add_battery.html'));
	});

	app.get('/', (req: Request, res: Response) => {
		res.sendFile(path.join(distPath, 'components', 'main-page', 'index.html'));
	});
}