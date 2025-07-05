import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';

import { Model } from '../interfaces/Model';
import { Chemistry } from '../interfaces/Chemistry';
import { FormFactor } from '../interfaces/FormFactor';

const dataPath = path.join(__dirname, '..', '..', 'data');

// Helper function to promisify stmt.run
const stmtRunAsync = (stmt: sqlite3.Statement, params: any[] = []): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    stmt.run(params, function(this: sqlite3.RunResult, err: Error | null) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

// Function to load model details from JSON files
export function loadModelDetails(): Map<string, Model> {
  const modelDetails = new Map<string, Model>();
  const modelsDir = path.join(dataPath, 'models');
  const files = fs.readdirSync(modelsDir);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const modelData = JSON.parse(fs.readFileSync(path.join(modelsDir, file), 'utf8'));
      modelDetails.set(modelData.id, modelData);
    }
  }
  return modelDetails;
}

// Function to populate the models table
export async function populateModelsTable(db: sqlite3.Database, models: Map<string, Model>): Promise<void> {
  const stmt = db.prepare("INSERT OR IGNORE INTO models (id, name, design_capacity, manufacturer, chemistry_id, formfactor_id) VALUES (?, ?, ?, ?, ?, ?)");
  for (const [guid, model] of models.entries()) {
    await stmtRunAsync(stmt, [
      model.id,
      model.name,
      model.designCapacity,
      model.manufacturer,
      model.chemistryId,
      model.formFactorId
    ]);
  }
  stmt.finalize();
  console.log('Models table populated.');
}

// Function to load model map (guid to model name)
export function loadModelMap(): Map<string, string> {
  const modelMap = new Map<string, string>();
  const modelDetails = loadModelDetails();
  for (const [guid, details] of modelDetails.entries()) {
    modelMap.set(guid, details.name);
  }
  return modelMap;
}

// Function to load chemistry details from JSON files
export function loadChemistryDetails(): Map<string, Chemistry> {
  const chemistryDetails = new Map<string, Chemistry>();
  const chemistriesDir = path.join(dataPath, 'chemistries');
  const files = fs.readdirSync(chemistriesDir);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const chemistryData = JSON.parse(fs.readFileSync(path.join(chemistriesDir, file), 'utf8'));
      chemistryDetails.set(chemistryData.id, chemistryData);
    }
  }
  return chemistryDetails;
}

// Function to populate the chemistries table
export async function populateChemistriesTable(db: sqlite3.Database, chemistries: Map<string, Chemistry>): Promise<void> {
  const stmt = db.prepare("INSERT OR IGNORE INTO chemistries (id, name, nominal_voltage) VALUES (?, ?, ?)");
  for (const [guid, chemistry] of chemistries.entries()) {
    await stmtRunAsync(stmt, [
      chemistry.id,
      chemistry.name,
      chemistry.nominalVoltage
    ]);
  }
  stmt.finalize();
  console.log('Chemistries table populated.');
}

// Function to load form factor details from JSON files
export function loadFormFactorDetails(): Map<string, FormFactor> {
  const formFactorDetails = new Map<string, FormFactor>();
  const formFactorsDir = path.join(dataPath, 'formfactors');
  const files = fs.readdirSync(formFactorsDir);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const formFactorData = JSON.parse(fs.readFileSync(path.join(formFactorsDir, file), 'utf8'));
      formFactorDetails.set(formFactorData.id, formFactorData);
    }
  }
  return formFactorDetails;
}

// Function to populate the form_factors table
export async function populateFormFactorsTable(db: sqlite3.Database, formFactors: Map<string, FormFactor>): Promise<void> {
  const stmt = db.prepare("INSERT OR IGNORE INTO formfactors (id, name) VALUES (?, ?)");
  for (const [guid, formFactor] of formFactors.entries()) {
    await stmtRunAsync(stmt, [
      formFactor.id,
      formFactor.name
    ]);
  }
  stmt.finalize();
  console.log('Form Factors table populated.');
}