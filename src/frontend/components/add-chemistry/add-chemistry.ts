import { CreateChemistryParams } from '../../../interfaces/CreateChemistryParams';

document.addEventListener('DOMContentLoaded', async () => {
	document.getElementById('createChemistrySubmit')?.addEventListener('click', async () => {
		const name = (document.getElementById('name') as HTMLInputElement).value;
		const shortName = (document.getElementById('shortName') as HTMLInputElement).value;
		const nominalVoltage = parseFloat((document.getElementById('nominalVoltage') as HTMLInputElement).value);

		// Basic validation
		if (!name || !shortName || isNaN(nominalVoltage)) {
			alert('Please fill in all required fields.');
			return;
		}

		const newChemistry: CreateChemistryParams = {
			name,
			shortName,
			nominalVoltage
		};

		try {
			const response = await fetch('/api/create_chemistry', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newChemistry)
			});

			if (response.ok) {
				alert('Chemistry created successfully!');
				window.location.href = '/'; // Redirect back to main page
			} else {
				const errorData = await response.json();
				alert(`Error creating chemistry: ${errorData.error}`);
			}
		} catch (error) {
			console.error('Error submitting form:', error);
			alert('An error occurred while creating the chemistry.');
		}
	});
});