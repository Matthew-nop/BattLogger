import { CreateTestRunInfoParams, CreateTestRunProcessParams } from '../../../interfaces/interfaces.js';

document.addEventListener('DOMContentLoaded', async () => {
	const entityTypeSelect = document.getElementById('entityType') as HTMLSelectElement;
	const testRunFields = document.getElementById('test-run-fields') as HTMLDivElement;
	const testRunProcessFields = document.getElementById('test-run-process-fields') as HTMLDivElement;

	const addTestForm = document.getElementById('addTestForm') as HTMLFormElement;
	const addTestProcessForm = document.getElementById('addTestProcessForm') as HTMLFormElement;

	const batteryIdInput = document.getElementById('batteryId') as HTMLInputElement;
	const processIdSelect = document.getElementById('processId') as HTMLSelectElement;

	// Pre-fill battery ID if available from URL (for battery details page)
	const urlParams = new URLSearchParams(window.location.search);
	const batteryIdFromUrl = urlParams.get('battery_id');
	if (batteryIdFromUrl) {
		batteryIdInput.value = batteryIdFromUrl;
	}

	async function populateProcessDropdown() {
		try {
			const response = await fetch('/api/test_run_processes');
			const processes = await response.json();

			// Clear existing options except the first one ("None")
			while (processIdSelect.options.length > 1) {
				processIdSelect.remove(1);
			}

			for (const process of processes) {
				const option = document.createElement('option');
				option.value = process.id;
				option.textContent = process.name;
				processIdSelect.appendChild(option);
			}
		} catch (error) {
			console.error('Error populating process dropdown:', error);
		}
	}

	function toggleFields() {
		testRunFields.style.display = 'none';
		testRunProcessFields.style.display = 'none';

		const selectedType = entityTypeSelect.value;
		if (selectedType === 'testRun') {
			testRunFields.style.display = 'block';
		} else if (selectedType === 'testRunProcess') {
			testRunProcessFields.style.display = 'block';
		}
	}

	entityTypeSelect.addEventListener('change', toggleFields);

	addTestForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		await createTestRun();
	});

	addTestProcessForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		await createTestRunProcess();
	});

	async function createTestRun() {
		const formData = new FormData(addTestForm);
		const data: CreateTestRunInfoParams = {
			batteryId: formData.get('batteryId') as string,
			capacity: Number(formData.get('capacity')),
			timestamp: new Date(formData.get('timestamp') as string).toISOString(),
			processId: formData.get('processId') as string || undefined,
		};

		try {
			const response = await fetch('/api/create_test_run', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (response.ok) {
				alert('Test run info added successfully!');
				window.parent.postMessage('testAdded', '*');
			} else {
				const errorData = await response.json();
				alert(`Error: ${errorData.error}`);
			}
		} catch (error) {
			console.error('Error adding test run info:', error);
			alert('An error occurred while adding test run info.');
		}
	}

	async function createTestRunProcess() {
		const formData = new FormData(addTestProcessForm);
		const data: CreateTestRunProcessParams = {
			name: formData.get('processName') as string,
			description: formData.get('processDescription') as string,
		};

		if (!data.name) {
			alert('Process Name is required.');
			return;
		}

		if (!data.description) {
			alert('Process Description is required.');
			return;
		}

		try {
			const response = await fetch('/api/create_test_run_process', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (response.ok) {
				alert('Test run process created successfully!');
				window.parent.postMessage('testProcessAdded', '*');
			} else {
				const errorData = await response.json();
				alert(`Error: ${errorData.error}`);
			}
		} catch (error) {
			console.error('Error creating test run process:', error);
			alert('An error occurred while creating test run process.');
		}
	}

	await populateProcessDropdown();
	toggleFields();
});