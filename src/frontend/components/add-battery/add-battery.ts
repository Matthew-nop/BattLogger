import { CreateBatteryParams, ModelData } from '../../../interfaces/interfaces.js';

document.addEventListener('DOMContentLoaded', async () => {
	const modelSelect = document.getElementById('modelIdentifier') as HTMLSelectElement;

	// Populate dropdowns
	try {
		const modelResponse = await fetch('/api/model_details');
		const modelDetails: Record<string, ModelData> = await modelResponse.json();

		for (const guid in modelDetails) {
			const option = document.createElement('option');
			option.value = guid;
			option.textContent = modelDetails[guid].name;
			modelSelect.appendChild(option);
		}

	} catch (error) {
		console.error('Error populating dropdowns:', error);
	}

	document.getElementById('addBatterySubmit')?.addEventListener('click', async () => {
		const batteryId = (document.getElementById('id') as HTMLInputElement).value;
		const modelIdentifier = modelSelect.value;

		// Basic validation
		if (!batteryId || !modelIdentifier) {
			alert('Please enter an ID and select a Model.');
			return;
		}

		const newBattery: CreateBatteryParams = {
			batteryId,
			modelIdentifier
		};

		try {
			const response = await fetch('/api/create_battery', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newBattery)
			});

			if (response.ok) {
				alert('Battery added successfully!');
				window.parent.postMessage('refreshData', '*');
				window.parent.postMessage('closeIframe', '*');
			} else {
				const errorData = await response.json();
				alert(`Error adding battery: ${errorData.error}`);
			}
		} catch (error) {
			console.error('Error submitting form:', error);
			alert('An error occurred while adding the battery.');
		}
	});
});