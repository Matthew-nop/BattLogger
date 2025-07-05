import { Request, Response } from 'express';
import * as path from 'path';

const distPath = path.join(__dirname, '..', '..', 'dist');

export function setupPageRoutes(app: any) {

  app.get('/add_formfactor', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'components', 'add-formfactor', 'add_formfactor.html'));
  });

  app.get('/add_chemistry', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'components', 'add-chemistry', 'add_chemistry.html'));
  });

}