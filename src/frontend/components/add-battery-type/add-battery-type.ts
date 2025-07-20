import { Chemistry, CreateChemistryParams, CreateFormFactorParams, CreateModelParams, FormFactor } from '../../../interfaces/interfaces.js';

document.addEventListener('DOMContentLoaded', async () => {
	const batteryTypeSelect = document.getElementById('entityType') as HTMLSelectElement;
	const modelFields = document.getElementById('model-fields') as HTMLDivElement;
	const chemistryFields = document.getElementById('chemistry-fields') as HTMLDivElement;
	const formFactorFields = document.getElementById('formfactor-fields') as HTMLDivElement;
	const createBatteryTypeSubmit = document.getElementById('createEntitySubmit') as HTMLButtonElement;

	const formFactorSelect = document.getElementById('formFactorId') as HTMLSelectElement;
	const chemistrySelect = document.getElementById('chemistryId') as HTMLSelectElement;

	async function populateDropdowns() {
		try {
			const [formFactorResponse, chemistryResponse] = await Promise.all([
				fetch('/api/formfactor_details'),
				fetch('/api/chemistry_details')
			]);
			const formFactorDetails: FormFactor[] = await formFactorResponse.json();
			const chemistryDetails: Chemistry[] = await chemistryResponse.json();

			const sortedFormFactors: FormFactor[] = Object.values(formFactorDetails).sort((a: FormFactor, b: FormFactor) => a.name.localeCompare(b.name));
			for (const formFactor of sortedFormFactors) {
				const option = document.createElement('option');
				option.value = formFactor.id;
				option.textContent = formFactor.name;
				formFactorSelect.appendChild(option);
			}

			const sortedChemistries: Chemistry[] = Object.values(chemistryDetails).sort((a: Chemistry, b: Chemistry) => a.name.localeCompare(b.name));
			for (const chemistry of sortedChemistries) {
				const option = document.createElement('option');
				option.value = chemistry.id;
				option.textContent = chemistry.name;
				chemistrySelect.appendChild(option);
			}

		} catch (error) {
			console.error('Error populating dropdowns:', error);
		}
	}

	function toggleFields() {
		modelFields.style.display = 'none';
		chemistryFields.style.display = 'none';
		formFactorFields.style.display = 'none';

		const selectedType = batteryTypeSelect.value;
		if (selectedType === 'model') {
			modelFields.style.display = 'block';
		} else if (selectedType === 'chemistry') {
			chemistryFields.style.display = 'block';
		} else if (selectedType === 'formfactor') {
			formFactorFields.style.display = 'block';
		}
	}

	batteryTypeSelect.addEventListener('change', toggleFields);

	createBatteryTypeSubmit.addEventListener('click', async () => {
		const selectedType = batteryTypeSelect.value;

		try {
			if (selectedType === 'model') {
				await createModel();
			} else if (selectedType === 'chemistry') {
				await createChemistry();
			} else if (selectedType === 'formfactor') {
				await createFormFactor();
			}
			alert(`${batteryTypeSelect.options[batteryTypeSelect.selectedIndex].textContent} created successfully!`);
			window.parent.postMessage('refreshData', '*');
			window.parent.postMessage('closeIframe', '*');
		} catch (error) {
			alert(`Error creating Battery Type: ${error}`);
		}
	});

	async function createModel() {
		const name = (document.getElementById('model-name') as HTMLInputElement).value;
		const designCapacity = parseInt((document.getElementById('designCapacity') as HTMLInputElement).value);
		const formFactorId = formFactorSelect.value;
		const chemistryId = chemistrySelect.value;
		const manufacturer = (document.getElementById('manufacturer') as HTMLInputElement).value;

		if (!name || !designCapacity || !formFactorId || !chemistryId) {
			throw new Error('Please fill in all required model fields.');
		}

		const newModel: CreateModelParams = { name, designCapacity, formFactorId, chemistryId, manufacturer };
		await sendRequest('/api/create_model', newModel);
	}

	async function createChemistry() {
		const name = (document.getElementById('chemistry-name') as HTMLInputElement).value;
		const shortName = (document.getElementById('shortName') as HTMLInputElement).value;
		const nominalVoltage = parseFloat((document.getElementById('nominalVoltage') as HTMLInputElement).value);

		if (!name || !shortName || isNaN(nominalVoltage)) {
			throw new Error('Please fill in all required chemistry fields.');
		}

		const newChemistry: CreateChemistryParams = { name, shortName, nominalVoltage };
		await sendRequest('/api/create_chemistry', newChemistry);
	}

	async function createFormFactor() {
		const name = (document.getElementById('formfactor-name') as HTMLInputElement).value;

		if (!name) {
			throw new Error('Please enter a form factor name.');
		}

		const newFormFactor: CreateFormFactorParams = { name };
		await sendRequest('/api/create_formfactor', newFormFactor);
	}

	async function sendRequest(url: string, data: any) {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error);
		}
	}

	populateDropdowns();
	toggleFields();
});
