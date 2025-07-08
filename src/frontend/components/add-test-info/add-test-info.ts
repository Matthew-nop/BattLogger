import { CreateTestRunInfoParams } from '../../../interfaces/interfaces.js';

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('addTestForm') as HTMLFormElement;
	const batteryIdInput = document.getElementById('batteryId') as HTMLInputElement;

	// Pre-fill battery ID if available from URL (for battery details page)
	const urlParams = new URLSearchParams(window.location.search);
	const batteryIdFromUrl = urlParams.get('battery_id');
	if (batteryIdFromUrl) {
		batteryIdInput.value = batteryIdFromUrl;
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const formData = new FormData(form);
		const data: CreateTestRunInfoParams = {
			batteryId: formData.get('batteryId') as string,
			capacity: Number(formData.get('capacity')),
			timestamp: new Date(formData.get('timestamp') as string).getTime(),
		};

		try {
			const response = await fetch('/api/battery_test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (response.ok) {
				alert('Test run info added successfully!');
				// Optionally close the popup or refresh the parent page
				window.parent.postMessage('testAdded', '*'); // Notify parent window
			} else {
				const errorData = await response.json();
				alert(`Error: ${errorData.error}`);
			}
		} catch (error) {
			console.error('Error adding test run info:', error);
			alert('An error occurred while adding test run info.');
		}
	});
});