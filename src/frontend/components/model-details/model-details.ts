document.addEventListener('DOMContentLoaded', async () => {
	const urlParams = new URLSearchParams(window.location.search);
	const guid = urlParams.get('guid');

	if (!guid) {
		console.error('Model GUID not found in URL.');
		return;
	}

	try {
		const [modelDetailsResponse, formFactorDetailsResponse, chemistryDetailsResponse] = await Promise.all([
			fetch(`/api/model_details_data/${guid}`),
			fetch('/api/formfactor_details'),
			fetch('/api/chemistry_details')
		]);

		if (!modelDetailsResponse.ok) {
			throw new Error(`Failed to fetch model details: ${modelDetailsResponse.statusText}`);
		}

		const model = await modelDetailsResponse.json();
		const formFactorDetails = await formFactorDetailsResponse.json();
		const chemistryDetails = await chemistryDetailsResponse.json();

		const formfactor = formFactorDetails[model.formFactorId]?.formfactor || 'N/A';
		const chemistry = chemistryDetails[model.chemistryId]?.name || 'N/A';

		document.getElementById('name')!.textContent = model.name;
		document.getElementById('modelId')!.textContent = model.id;
		document.getElementById('designCapacity')!.textContent = model.designCapacity;
		document.getElementById('formfactor')!.textContent = formfactor;
		document.getElementById('chemistry')!.textContent = chemistry;
		document.getElementById('manufacturer')!.textContent = model.manufacturer || 'N/A';

	} catch (error) {
		console.error('Error fetching model details:', error);
	}
});