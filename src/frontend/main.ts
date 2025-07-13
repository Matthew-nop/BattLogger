import { BatteryData, ModelData } from '../interfaces/interfaces.js';

// Type definitions for state and elements to make it cleaner
interface AppState {
	sortColumn: string;
	sortOrder: string;
	nameFilter: string;
	formfactorFilter: string;
	chemistryFilter: string;
}

interface PopupElements {
	overlay: HTMLElement;
	iframe: HTMLIFrameElement;
}

interface AppElements {
	addBatteryType: PopupElements;
	addBattery: PopupElements;
	addTest: PopupElements;
	modelDetails: PopupElements;
	batterySummary: PopupElements;
	batteryDetails: PopupElements;
	closePopupBtn: HTMLButtonElement;
}

function getPopupElements(id: string): PopupElements {
	return {
		overlay: document.getElementById(`${id}Overlay`) as HTMLElement,
		iframe: document.getElementById(`${id}Iframe`) as HTMLIFrameElement,
	};
}

function setupPopup(
	openBtnId: string,
	closeBtnId: string,
	overlay: HTMLElement,
	iframe: HTMLIFrameElement,
	iframeSrc: string,
	onClose: () => void,
) {
	const openBtn = document.getElementById(openBtnId);
	const closeBtn = document.getElementById(closeBtnId) as HTMLButtonElement;

	if (openBtn) {
		openBtn.addEventListener('click', () => {
			iframe.src = iframeSrc;
			overlay.classList.add('visible');
		});
	}

	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			overlay.classList.remove('visible');
			iframe.src = '';
			onClose();
		});
	}
}

function setupMenuButtons(elements: AppElements, onClose: () => void) {
	setupPopup(
		'addBatteryTypeBtn',
		'closeAddBatteryTypePopupBtn',
		elements.addBatteryType.overlay,
		elements.addBatteryType.iframe,
		'/add_battery_type',
		onClose,
	);

	setupPopup(
		'addBatteryBtn',
		'closeAddBatteryPopupBtn',
		elements.addBattery.overlay,
		elements.addBattery.iframe,
		'/add_battery',
		onClose,
	);

	setupPopup(
		'addTestBtn',
		'closeAddTestPopupBtn',
		elements.addTest.overlay,
		elements.addTest.iframe,
		'/add_test_info',
		onClose,
	);
}

async function fetchData(state: AppState) {
	try {
		let url = `/api/data?sortBy=${state.sortColumn}&order=${state.sortOrder}`;
		if (state.nameFilter) {
			url += `&name=${state.nameFilter}`;
		}
		if (state.formfactorFilter) {
			url += `&formfactor=${state.formfactorFilter}`;
		}
		if (state.chemistryFilter) {
			url += `&chemistry=${state.chemistryFilter}`;
		}

		const [dataResponse, modelDetailsResponse] = await Promise.all([
			fetch(url),
			fetch('/api/model_details')
		]);
		const data: BatteryData[] = await dataResponse.json();
		const modelDetails = await modelDetailsResponse.json();
		renderTable(data, modelDetails, state);
	} catch (error) {
		console.error('Error fetching data:', error);
		document.querySelector('tbody')!.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
	}
}

function renderTable(data: BatteryData[], modelDetails: Record<string, ModelData>, state: Pick<AppState, 'sortColumn' | 'sortOrder'>) {
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
		if (th.dataset.sort === state.sortColumn) {
			th.classList.add(`sort-${state.sortOrder}`);
		}
	});
}

function setupPopupListeners(elements: AppElements) {
	if (elements.closePopupBtn) {
		elements.closePopupBtn.addEventListener('click', (event) => {
			const targetButton = event.target as HTMLElement;
			const popup = targetButton.closest('.popup');
			if (popup) {
				const overlay = popup.parentElement;
				if (overlay) {
					overlay.classList.remove('visible');
					const iframe = overlay.querySelector('iframe');
					if (iframe) {
						iframe.src = ''; // Clear iframe content
					}
				}
			}
		});
	}

	document.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (target.classList.contains('model-link')) {
			e.preventDefault();
			const guid = target.dataset.guid;
			if (guid) {
				elements.modelDetails.iframe.src = `/model_details?guid=${guid}`;
				elements.modelDetails.overlay.classList.add('visible');
			}
		} else if (target.classList.contains('battery-summary-link')) {
			e.preventDefault();
			const id = target.dataset.id;
			if (id) {
				elements.batterySummary.iframe.src = `/battery_summary?batteryId=${id}`;
				elements.batterySummary.overlay.classList.add('visible');
			}
		} else if (target.classList.contains('battery-link')) {
			e.preventDefault();
			const id = target.dataset.id;
			if (id) {
				elements.batteryDetails.iframe.src = `/battery_details/${id}`;
				elements.batteryDetails.overlay.classList.add('visible');
			}
		}
	});
}

function setupEscapeKey(elements: AppElements, fetchData: () => void) {
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			elements.addBatteryType.overlay.classList.remove('visible');
			elements.addBatteryType.iframe.src = '';
			elements.addBattery.overlay.classList.remove('visible');
			elements.addBattery.iframe.src = '';
			elements.addTest.overlay.classList.remove('visible');
			elements.addTest.iframe.src = '';
			elements.modelDetails.overlay.classList.remove('visible');
			elements.modelDetails.iframe.src = '';
			elements.batterySummary.overlay.classList.remove('visible');
			elements.batterySummary.iframe.src = '';
			elements.batteryDetails.overlay.classList.remove('visible');
			elements.batteryDetails.iframe.src = '';
			fetchData(); // Refresh data after closing any popup
		}
	});
}

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
			const sortedFormFactors = [...formFactors.entries()].sort((a, b) => a[1].localeCompare(b[1]));
			sortedFormFactors.forEach(([guid, name]) => {
				const option = document.createElement('option');
				option.value = guid;
				option.textContent = name;
				formFactorSelect.appendChild(option);
			});
		}

		const chemistrySelect = document.getElementById('chemistryFilter');
		if (chemistrySelect instanceof HTMLSelectElement) {
			const sortedChemistries = [...chemistries.entries()].sort((a, b) => a[1].localeCompare(b[1]));
			sortedChemistries.forEach(([guid, name]) => {
				const option = document.createElement('option');
				option.value = guid;
				option.textContent = name;
				chemistrySelect.appendChild(option);
			});
		}

		const modelDatalist = document.getElementById('modelNames');
		if (modelDatalist) {
			const sortedModels = [...models.entries()].sort((a, b) => a[1].localeCompare(b[1]));
			sortedModels.forEach(([guid, name]) => {
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

function setupFilterButtons(state: AppState, fetchData: () => void) {
	const applyFiltersBtn = document.getElementById('applyFiltersBtn');
	if (applyFiltersBtn) {
		applyFiltersBtn.addEventListener('click', () => {
			const nameFilterElement = document.getElementById('nameFilter') as HTMLInputElement;
			const selectedModelName = nameFilterElement.value;
			// Find the GUID for the selected model name
			const modelNamesDatalist = document.getElementById('modelNames') as HTMLDataListElement;
			const selectedOption = Array.from(modelNamesDatalist.options).find(option => option.value === selectedModelName);
			state.nameFilter = selectedOption?.dataset.guid || '';

			const formFactorFilterElement = document.getElementById('formfactorFilter');
			state.formfactorFilter = (formFactorFilterElement instanceof HTMLSelectElement) ? formFactorFilterElement.value : '';

			const chemistryFilterElement = document.getElementById('chemistryFilter');
			state.chemistryFilter = (chemistryFilterElement instanceof HTMLSelectElement) ? chemistryFilterElement.value : '';
			fetchData();
		});
	}

	const clearFiltersBtn = document.getElementById('clearFiltersBtn');
	if (clearFiltersBtn) {
		clearFiltersBtn.addEventListener('click', () => {
			state.nameFilter = '';
			state.formfactorFilter = '';
			state.chemistryFilter = '';

			(document.getElementById('nameFilter') as HTMLInputElement).value = '';
			(document.getElementById('formfactorFilter') as HTMLSelectElement).value = '';
			(document.getElementById('chemistryFilter') as HTMLSelectElement).value = '';

			fetchData();
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const state: AppState = {
		sortColumn: 'id',
		sortOrder: 'asc',
		nameFilter: '',
		formfactorFilter: '',
		chemistryFilter: '',
	};

	const elements: AppElements = {
		addBatteryType: getPopupElements('addBatteryType'),
		addBattery: getPopupElements('addBattery'),
		addTest: getPopupElements('addTest'),
		modelDetails: getPopupElements('modelDetails'),
		batterySummary: getPopupElements('batterySummary'),
		batteryDetails: getPopupElements('batteryDetails'),
		closePopupBtn: document.getElementById('closePopupBtn') as HTMLButtonElement,
	};

	const fetchDataWithState = () => fetchData(state);

	setupMenuButtons(elements, fetchDataWithState);
	setupPopupListeners(elements);
	setupEscapeKey(elements, fetchDataWithState);
	setupFilterButtons(state, fetchDataWithState);


	const tableHead = document.querySelector('thead');
	if (tableHead) {
		tableHead.addEventListener('click', e => {
			const target = e.target as HTMLElement;
			if (target.tagName === 'TH') {
				const newSortColumn = target.dataset.sort;
				if (state.sortColumn === newSortColumn) {
					state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
				} else {
					state.sortColumn = newSortColumn || 'id';
					state.sortOrder = 'asc';
				}
				fetchDataWithState();
			}
		});
	}

	populateFilterOptions();
	fetchDataWithState(); // Initial data fetch
});
