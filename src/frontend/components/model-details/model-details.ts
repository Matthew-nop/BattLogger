import { ModelData } from '../../../interfaces/interfaces.js';

document.addEventListener('DOMContentLoaded', async () => {
	const guid = new URLSearchParams(window.location.search).get('guid');

	if (!guid) {
		console.error('Model GUID not found in URL.');
		return;
	}

	try {
		const modelDetailsResponse = await fetch(`/api/model_details_data/${guid}`);

		if (!modelDetailsResponse.ok) {
			throw new Error(`Failed to fetch model details: ${modelDetailsResponse.statusText}`);
		}

		const model: ModelData = await modelDetailsResponse.json();

    document.getElementById('name')!.textContent = model.name;
    document.getElementById('modelId')!.textContent = model.id;
    document.getElementById('designCapacity')!.textContent = model.designCapacity.toString();
    document.getElementById('formfactor')!.textContent = model.formfactor_name || 'N/A';
    document.getElementById('chemistry')!.textContent = model.chemistry_name || 'N/A';
    document.getElementById('manufacturer')!.textContent = model.manufacturer || 'N/A';

	} catch (error) {
		console.error('Error fetching model details:', error);
		alert('An error occurred while fetching model details.');
	}
});