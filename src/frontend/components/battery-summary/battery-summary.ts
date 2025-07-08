document.addEventListener('DOMContentLoaded', async () => {
	const batteryId = new URLSearchParams(window.location.search).get('batteryId');

	if (!batteryId) {
		console.error('Battery ID not found in URL.');
		return;
	}

	try {
		const batteryResponse = await fetch(`/api/battery_details_data/${batteryId}`);
		const battery = await batteryResponse.json();

		if (!battery) {
			console.error('Battery data not found.');
			return;
		}

		const modelResponse = await fetch(`/api/model_details_data/${battery.modelId}`);
		const model = await modelResponse.json();

        document.getElementById('batteryId')!.textContent = battery.id;
        document.getElementById('modelName')!.textContent = model?.name || 'N/A';
        document.getElementById('chemistryName')!.textContent = battery.chemistryName || 'N/A';
        document.getElementById('formfactorName')!.textContent = battery.formfactorName || 'N/A';
        document.getElementById('lastTestedCapacity')!.textContent = battery.lastTestedCapacity !== null ? battery.lastTestedCapacity : 'N/A';
        document.getElementById('lastTestedTimestamp')!.textContent = battery.lastTestedTimestamp !== null ? new Date(battery.lastTestedTimestamp).toLocaleString() : 'N/A';

	} catch (error) {
		console.error('Error fetching battery details:', error);
	}
});