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

	const applyFiltersBtn = document.getElementById('applyFiltersBtn');
	if (applyFiltersBtn) {
		applyFiltersBtn.addEventListener('click', () => {
			const nameFilterElement = document.getElementById('nameFilter');
			nameFilter = (nameFilterElement instanceof HTMLSelectElement) ? nameFilterElement.value : '';

			const formFactorFilterElement = document.getElementById('formfactorFilter');
			formfactorFilter = (formFactorFilterElement instanceof HTMLSelectElement) ? formFactorFilterElement.value : '';

			const chemistryFilterElement = document.getElementById('chemistryFilter');
			chemistryFilter = (chemistryFilterElement instanceof HTMLSelectElement) ? chemistryFilterElement.value : '';
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

			const [dataResponse, modelDetailsResponse, chemistryDetailsResponse, formFactorDetailsResponse] = await Promise.all([
				fetch(url),
				fetch('/api/model_details'),
				fetch('/api/chemistry_details'),
				fetch('/api/formfactor_details')
			]);
			const data = await dataResponse.json();
			const modelDetails = await modelDetailsResponse.json();
			const chemistryDetails = await chemistryDetailsResponse.json();
			const formFactorDetails = await formFactorDetailsResponse.json();
			renderTable(data, modelDetails, chemistryDetails, formFactorDetails);
		} catch (error) {
			console.error('Error fetching data:', error);
			document.querySelector('tbody')!.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
		}
	}

	function renderTable(data: any[], modelDetails: any, chemistryDetails: any, formFactorDetails: any) {
		const tableBody = document.querySelector('tbody');
		if (!tableBody) {
			return;
		}

		tableBody.innerHTML = data.map(row => {
			const modelName = modelDetails[row.model_id]?.name || 'N/A';
			const chemistryName = chemistryDetails[row.chemistry_identifier]?.name || 'N/A';
			const formfactorName = formFactorDetails[row.formfactor_id]?.name || 'N/A';

			return `
				<tr>
					<td>${row.id}</td>
					<td><a href="#" class="model-link" data-guid="${row.model_id}">${modelName}</a></td>
					<td><a href="#" class="battery-link" data-id="${row.id}">${row.last_tested_capacity}</a></td>
					<td>${row.last_tested_timestamp}</td>
					<td>${chemistryName}</td>
					<td>${formfactorName}</td>
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
				chemistries.set(guid, chemistryDetails[guid].name);
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

			const modelSelect = document.getElementById('nameFilter');
			if (modelSelect instanceof HTMLSelectElement) {
				models.forEach((name, guid) => {
					const option = document.createElement('option');
					option.value = guid;
					option.textContent = name;
					modelSelect.appendChild(option);
				});
			}

		} catch (error) {
			console.error('Error populating filter options:', error);
		}
	}

	populateFilterOptions();
	fetchData(); // Initial data fetch
});