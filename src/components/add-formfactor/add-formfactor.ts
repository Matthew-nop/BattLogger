import { AddFormFactorRequestBody } from '../../interfaces/AddFormFactorRequestBody';

document.addEventListener('DOMContentLoaded', async () => {
	document.getElementById('createFormFactorSubmit')?.addEventListener('click', async () => {
		const formfactor = (document.getElementById('formfactor') as HTMLInputElement).value;

		// Basic validation
		if (!formfactor) {
			alert('Please enter a form factor.');
			return;
		}

		const newFormFactor: AddFormFactorRequestBody = {
			formfactor
		};

		try {
			const response = await fetch('/api/create_formfactor', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newFormFactor)
			});

			if (response.ok) {
				alert('Form Factor created successfully!');
				window.parent.postMessage('refreshData', '*');
				window.parent.postMessage('closeIframe', '*');
			} else {
				const errorData = await response.json();
				alert(`Error creating form factor: ${errorData.error}`);
			}
		} catch (error) {
			console.error('Error submitting form:', error);
			alert('An error occurred while creating the form factor.');
		}
	});
});