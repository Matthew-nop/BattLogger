// Add type declarations for File System Access API
declare global {
    interface Window {
        showOpenFilePicker(options?: any): Promise<any[]>;
        showSaveFilePicker(options?: any): Promise<any>;
    }
}

document.addEventListener('DOMContentLoaded', () => {
	// --- Helper Functions ---

	async function handleExport(url: string, suggestedName: string, successMessage: string) {
		if (window.showSaveFilePicker) {
			try {
				const response = await fetch(url);
				if (!response.ok) {
					const errorText = await response.text();
					console.error(`Failed to fetch data for export from ${url}. Status: ${response.status}`, errorText);
					alert(`Export failed: Server returned status ${response.status}.`);
					return;
				}
				const blob = await response.blob();
				const handle = await window.showSaveFilePicker({
					suggestedName,
					types: [{
						description: 'JSON Files',
						accept: { 'application/json': ['.json'] },
					}],
				});
				const writable = await handle.createWritable();
				await writable.write(blob);
				await writable.close();
				alert(successMessage);
			} catch (err: any) {
				// AbortError is thrown when the user cancels the file picker.
				if (err.name !== 'AbortError') {
					console.error(`Error exporting from ${url}:`, err);
					alert('An error occurred during export.');
				}
			}
		} else {
			// Fallback for browsers that don't support the File System Access API
			window.location.href = url;
		}
	}

	async function handleImport(url: string, inputId: string, successMessage: string) {
		if (window.showOpenFilePicker) {
			try {
				const [fileHandle] = await window.showOpenFilePicker({
					types: [{
						description: 'JSON Files',
						accept: { 'application/json': ['.json'] },
					}],
					multiple: false,
				});
				const file = await fileHandle.getFile();
				const content = await file.text();
				await postImport(url, content, successMessage);
			} catch (err: any) {
				if (err.name !== 'AbortError') {
					console.error(`Error during file selection for ${url}:`, err);
					alert('An error occurred during file selection.');
				}
			}
		} else {
			// Fallback for browsers that don't support the File System Access API
			const fileInput = document.getElementById(inputId) as HTMLInputElement;
			fileInput.click();
		}
	}

	async function postImport(url: string, content: string, successMessage: string) {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: content
			});
			if (response.ok) {
				alert(successMessage);
			} else {
				const error = await response.json();
				alert(`Import failed: ${error.error}`);
			}
		} catch (error) {
			console.error(`Error importing to ${url}:`, error);
			alert('Error importing data.');
		}
	}

	function setupImportFallback(inputId: string, url: string, successMessage: string) {
		document.getElementById(inputId)?.addEventListener('change', async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = async (e) => {
					const content = e.target?.result;
					if (typeof content === 'string') {
						await postImport(url, content, successMessage);
					}
				};
				reader.readAsText(file);
			}
		});
	}

	// --- Event Listeners ---

	// All Data
	document.getElementById('exportAllBtn')?.addEventListener('click', () => {
		handleExport('/api/export', 'battlogger_all_data.json', 'All data exported successfully!');
	});
	document.getElementById('importAllBtn')?.addEventListener('click', () => {
		handleImport('/api/import', 'importAllFile', 'All data imported successfully!');
	});
	setupImportFallback('importAllFile', '/api/import', 'All data imported successfully!');

	// Chemistries
	document.getElementById('exportChemistriesBtn')?.addEventListener('click', () => {
		handleExport('/api/export/chemistries', 'chemistries.json', 'Chemistries exported successfully!');
	});
	document.getElementById('importChemistriesBtn')?.addEventListener('click', () => {
		handleImport('/api/import/chemistries', 'importChemistriesFile', 'Chemistries imported successfully!');
	});
	setupImportFallback('importChemistriesFile', '/api/import/chemistries', 'Chemistries imported successfully!');

	// Form Factors
	document.getElementById('exportFormFactorsBtn')?.addEventListener('click', () => {
		handleExport('/api/export/formfactors', 'formfactors.json', 'Form Factors exported successfully!');
	});
	document.getElementById('importFormFactorsBtn')?.addEventListener('click', () => {
		handleImport('/api/import/formfactors', 'importFormFactorsFile', 'Form Factors imported successfully!');
	});
	setupImportFallback('importFormFactorsFile', '/api/import/formfactors', 'Form Factors imported successfully!');

	// Models
	document.getElementById('exportModelsBtn')?.addEventListener('click', () => {
		handleExport('/api/export/models', 'models.json', 'Models exported successfully!');
	});
	document.getElementById('importModelsBtn')?.addEventListener('click', () => {
		handleImport('/api/import/models', 'importModelsFile', 'Models imported successfully!');
	});
	setupImportFallback('importModelsFile', '/api/import/models', 'Models imported successfully!');
});