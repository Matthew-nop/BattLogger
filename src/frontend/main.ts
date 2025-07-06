import { BatteryData } from '../interfaces/BatteryData';
import { ModelDataDTO } from '../interfaces/ModelDataDTO';

document.addEventListener('DOMContentLoaded', () => {
	let sortColumn: string = 'id';
	let sortOrder: string = 'asc';
	let nameFilter: string = '';
	let formfactorFilter: string = '';
	let chemistryFilter: string = '';

	const addModelBtn = document.getElementById('addModelBtn');
	const addModelOverlay = document.getElementById('addModelOverlay') as HTMLElement;
	const addModelIframe = document.getElementById('addModelIframe') as HTMLIFrameElement;
	const closeAddModelPopupBtn = document.getElementById('closeAddModelPopupBtn') as HTMLButtonElement;

	if (addModelBtn) {
		addModelBtn.addEventListener('click', () => {
			addModelIframe.src = '/add_model';
			addModelOverlay.classList.add('visible');
		});
	}

	closeAddModelPopupBtn.addEventListener('click', () => {
		addModelOverlay.classList.remove('visible');
		addModelIframe.src = ''; // Clear iframe content
		fetchData(); // Refresh data after closing popup
	});

	const addFormFactorBtn = document.getElementById('addFormFactorBtn');
	const addFormFactorOverlay = document.getElementById('addFormFactorOverlay') as HTMLElement;
	const addFormFactorIframe = document.getElementById('addFormFactorIframe') as HTMLIFrameElement;
	const closeAddFormFactorPopupBtn = document.getElementById('closeAddFormFactorPopupBtn') as HTMLButtonElement;

	if (addFormFactorBtn) {
		addFormFactorBtn.addEventListener('click', () => {
			addFormFactorIframe.src = '/add_formfactor';
			addFormFactorOverlay.classList.add('visible');
		});
	}

	closeAddFormFactorPopupBtn.addEventListener('click', () => {
		addFormFactorOverlay.classList.remove('visible');
		addFormFactorIframe.src = ''; // Clear iframe content
		fetchData(); // Refresh data after closing popup
	});

	const addChemistryBtn = document.getElementById('addChemistryBtn');
	const addChemistryOverlay = document.getElementById('addChemistryOverlay') as HTMLElement;
	const addChemistryIframe = document.getElementById('addChemistryIframe') as HTMLIFrameElement;
	const closeAddChemistryPopupBtn = document.getElementById('closeAddChemistryPopupBtn') as HTMLButtonElement;

	if (addChemistryBtn) {
		addChemistryBtn.addEventListener('click', () => {
			addChemistryIframe.src = '/add_chemistry';
			addChemistryOverlay.classList.add('visible');
		});
	}

	closeAddChemistryPopupBtn.addEventListener('click', () => {
		addChemistryOverlay.classList.remove('visible');
		addChemistryIframe.src = ''; // Clear iframe content
		fetchData(); // Refresh data after closing popup
	});

	const addBatteryBtn = document.getElementById('addBatteryBtn');
	const addBatteryOverlay = document.getElementById('addBatteryOverlay') as HTMLElement;
	const addBatteryIframe = document.getElementById('addBatteryIframe') as HTMLIFrameElement;
	const closeAddBatteryPopupBtn = document.getElementById('closeAddBatteryPopupBtn') as HTMLButtonElement;

	if (addBatteryBtn) {
		addBatteryBtn.addEventListener('click', () => {
			addBatteryIframe.src = '/add_battery';
			addBatteryOverlay.classList.add('visible');
		});
	}

	closeAddBatteryPopupBtn.addEventListener('click', () => {
		addBatteryOverlay.classList.remove('visible');
		addBatteryIframe.src = ''; // Clear iframe content
		fetchData(); // Refresh data after closing popup
	});

	const addTestBtn = document.getElementById('addTestBtn');
	const addTestOverlay = document.getElementById('addTestOverlay') as HTMLElement;
	const addTestIframe = document.getElementById('addTestIframe') as HTMLIFrameElement;
	const closeAddTestPopupBtn = document.getElementById('closeAddTestPopupBtn') as HTMLButtonElement;

	if (addTestBtn) {
		addTestBtn.addEventListener('click', () => {
			addTestIframe.src = '/add_test_info';
			addTestOverlay.classList.add('visible');
		});
	}

	closeAddTestPopupBtn.addEventListener('click', () => {
		addTestOverlay.classList.remove('visible');
		addTestIframe.src = ''; // Clear iframe content
		fetchData(); // Refresh data after closing popup
	});

	const applyFiltersBtn = document.getElementById('applyFiltersBtn');
	if (applyFiltersBtn) {
		applyFiltersBtn.addEventListener('click', () => {
			const nameFilterElement = document.getElementById('nameFilter') as HTMLInputElement;
			const selectedModelName = nameFilterElement.value;
			// Find the GUID for the selected model name
			const modelNamesDatalist = document.getElementById('modelNames') as HTMLDataListElement;
			const selectedOption = Array.from(modelNamesDatalist.options).find(option => option.value === selectedModelName);
			nameFilter = selectedOption?.dataset.guid || '';

			const formFactorFilterElement = document.getElementById('formfactorFilter');
			formfactorFilter = (formFactorFilterElement instanceof HTMLSelectElement) ? formFactorFilterElement.value : '';

			const chemistryFilterElement = document.getElementById('chemistryFilter');
			chemistryFilter = (chemistryFilterElement instanceof HTMLSelectElement) ? chemistryFilterElement.value : '';
			fetchData();
		});
	}

	const clearFiltersBtn = document.getElementById('clearFiltersBtn');
	if (clearFiltersBtn) {
		clearFiltersBtn.addEventListener('click', () => {
			nameFilter = '';
			formfactorFilter = '';
			chemistryFilter = '';

			(document.getElementById('nameFilter') as HTMLInputElement).value = '';
			(document.getElementById('formfactorFilter') as HTMLSelectElement).value = '';
			(document.getElementById('chemistryFilter') as HTMLSelectElement).value = '';

			fetchData();
		});
	}

	const tableHead = document.querySelector('thead');
	if (tableHead) {
		tableHead.addEventListener('click', e => {
			const target = e.target as HTMLElement;
			if (target.tagName === 'TH') {
				const newSortColumn = target.dataset.sort;
				if (sortColumn === newSortColumn) {
					sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
				} else {
					sortColumn = newSortColumn || 'id';
					sortOrder = 'asc';
				}
				fetchData();
			}
		});
	}

	async function fetchData() {
		try {
			let url = `/api/data?sortBy=${sortColumn}&order=${sortOrder}`;
			if (nameFilter) {
				url += `&name=${nameFilter}`;
			}


			if (formfactorFilter) {
				url += `&formfactor=${formfactorFilter}`;
			}
			if (chemistryFilter) {
				url += `&chemistry=${chemistryFilter}`;
			}

			const [dataResponse, modelDetailsResponse] = await Promise.all([
				fetch(url),
				fetch('/api/model_details')
			]);
			const data: BatteryData[] = await dataResponse.json();
			const modelDetails = await modelDetailsResponse.json();
			renderTable(data, modelDetails);
		} catch (error) {
			console.error('Error fetching data:', error);
			document.querySelector('tbody')!.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
		}
	}

	function renderTable(data: BatteryData[], modelDetails: Record<string, ModelDataDTO>) {
		const tableBody = document.querySelector('tbody');
		if (!tableBody) {
			return;
		}

		tableBody.innerHTML = data.map(row => {
			const modelName = modelDetails[row.modelId]?.name || 'N/A';

			return `
				<tr>
					<td><a href="#" class="battery-summary-link" data-id="${row.id}" title="ID: ${row.id}">${row.id}</a></td>
					<td><a href="#" class="model-link" data-guid="${row.modelId}">${modelName}</a></td>
					<td><a href="#" class="battery-link" data-id="${row.id}">${row.lastTestedCapacity !== null ? row.lastTestedCapacity : 'N/A'}</a></td>
					<td>${row.lastTestedTimestamp !== null ? row.lastTestedTimestamp : 'N/A'}</td>
					<td>${row.chemistryShortName !== null ? row.chemistryShortName : 'N/A'}</td>
					<td>${row.formfactorName}</td>
				</tr>
			`;
		}).join('');

		document.querySelectorAll('th').forEach(th => {
			th.classList.remove('sort-asc', 'sort-desc');
			if (th.dataset.sort === sortColumn) {
				th.classList.add(`sort-${sortOrder}`);
			}
		});
	}

	const modelDetailsOverlay = document.getElementById('modelDetailsOverlay') as HTMLElement;
	const modelDetailsIframe = document.getElementById('modelDetailsIframe') as HTMLIFrameElement;
	const closePopupBtn = document.getElementById('closePopupBtn') as HTMLButtonElement;

	document.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (target.classList.contains('model-link')) {
			e.preventDefault();
			const guid = target.dataset.guid;
			if (guid) {
				modelDetailsIframe.src = `/model_details?guid=${guid}`;
				modelDetailsOverlay.classList.add('visible');
			}
		}
	});

	closePopupBtn.addEventListener('click', () => {
		modelDetailsOverlay.classList.remove('visible');
		modelDetailsIframe.src = ''; // Clear iframe content
	});

	const batterySummaryOverlay = document.getElementById('batterySummaryOverlay') as HTMLElement;
	const batterySummaryIframe = document.getElementById('batterySummaryIframe') as HTMLIFrameElement;
	const closeBatterySummaryPopupBtn = document.getElementById('closeBatterySummaryPopupBtn') as HTMLButtonElement;

	document.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (target.classList.contains('battery-summary-link')) {
			e.preventDefault();
			const id = target.dataset.id;
			if (id) {
				batterySummaryIframe.src = `/battery_summary?batteryId=${id}`;
				batterySummaryOverlay.classList.add('visible');
			}
		}
	});

	closeBatterySummaryPopupBtn.addEventListener('click', () => {
		batterySummaryOverlay.classList.remove('visible');
		batterySummaryIframe.src = ''; // Clear iframe content
	});

	const batteryDetailsOverlay = document.getElementById('batteryDetailsOverlay') as HTMLElement;
	const batteryDetailsIframe = document.getElementById('batteryDetailsIframe') as HTMLIFrameElement;
	const closeBatteryPopupBtn = document.getElementById('closeBatteryPopupBtn') as HTMLButtonElement;

	document.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (target.classList.contains('battery-link')) {
			e.preventDefault();
			const id = target.dataset.id;
			if (id) {
				batteryDetailsIframe.src = `/battery_details/${id}`;
				batteryDetailsOverlay.classList.add('visible');
			}
		}
	});

	closeBatteryPopupBtn.addEventListener('click', () => {
		batteryDetailsOverlay.classList.remove('visible');
		batteryDetailsIframe.src = ''; // Clear iframe content
	});

	// Populate filter options on page load
	async function populateFilterOptions() {
		console.log('Populating filter options...');
		try {
			const [modelDetailsResponse, chemistryDetailsResponse, formFactorDetailsResponse] = await Promise.all([
				fetch('/api/model_details'),
				fetch('/api/chemistry_details'),
				fetch('/api/formfactor_details')
			]);
			console.log('API responses received.');
			const modelDetails = await modelDetailsResponse.json();
			const chemistryDetails = await chemistryDetailsResponse.json();
			const formFactorDetails = await formFactorDetailsResponse.json();

			console.log('Model Details:', modelDetails);
			console.log('Chemistry Details:', chemistryDetails);
			console.log('Form Factor Details:', formFactorDetails);

			const formFactors = new Map<string, string>();
			const chemistries = new Map<string, string>();
			const models = new Map<string, string>();

			for (const guid in formFactorDetails) {
				formFactors.set(guid, formFactorDetails[guid].name);
			}
			for (const guid in chemistryDetails) {
				chemistries.set(guid, chemistryDetails[guid].shortName);
			}
			for (const guid in modelDetails) {
				models.set(guid, modelDetails[guid].name);
			}

			const formFactorSelect = document.getElementById('formfactorFilter');
			if (formFactorSelect instanceof HTMLSelectElement) {
				formFactors.forEach((name, guid) => {
					const option = document.createElement('option');
					option.value = guid;
					option.textContent = name;
					formFactorSelect.appendChild(option);
				});
			}

			const chemistrySelect = document.getElementById('chemistryFilter');
			if (chemistrySelect instanceof HTMLSelectElement) {
				chemistries.forEach((name, guid) => {
					const option = document.createElement('option');
					option.value = guid;
					option.textContent = name;
					chemistrySelect.appendChild(option);
				});
			}

			const modelDatalist = document.getElementById('modelNames');
			if (modelDatalist) {
				models.forEach((name, guid) => {
					const option = document.createElement('option');
					option.value = name;
					option.dataset.guid = guid;
					modelDatalist.appendChild(option);
				});
			}

		} catch (error) {
			console.error('Error populating filter options:', error);
		}
	}

	populateFilterOptions();
	fetchData(); // Initial data fetch
});