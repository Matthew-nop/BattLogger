import Chart from 'chart.js/auto'
import { BatteryData, TestRunProcess } from '../../../interfaces/interfaces.js';

document.addEventListener('DOMContentLoaded', async () => {
	const batteryId = window.location.pathname.split('/').pop();

	const chartContainer = document.getElementById('chartContainer') as HTMLDivElement;
	const testDataTable = document.getElementById('testDataTable') as HTMLTableElement;
	const toggleViewBtn = document.getElementById('toggleViewBtn') as HTMLButtonElement;
	let currentView = 'chart'; // 'chart' or 'table'
	let testData: any[] = [];
	let capacityChart: Chart | null = null; // Store chart instance

	const fetchData = async () => {
		try {
			const [testDataResponse, batteryDetailsResponse, testRunProcessesResponse] = await Promise.all([
				fetch(`/api/battery_tests/${batteryId}`),
				fetch(`/api/battery_details_data/${batteryId}`),
				fetch('/api/test_run_processes')
			]);

			if (!testDataResponse.ok) {
				throw new Error(`Failed to fetch test data: ${testDataResponse.statusText}`);
			}
			if (!batteryDetailsResponse.ok) {
				throw new Error(`Failed to fetch battery details: ${batteryDetailsResponse.statusText}`);
			}
			if (!testRunProcessesResponse.ok) {
				throw new Error(`Failed to fetch test run processes: ${testRunProcessesResponse.statusText}`);
			}

			testData = await testDataResponse.json();
			const batteryDetails: BatteryData = await batteryDetailsResponse.json();
			const testRunProcesses: TestRunProcess[] = await testRunProcessesResponse.json();

			const processMap = new Map<string, string>();
			testRunProcesses.forEach(process => {
				processMap.set(process.id, process.name);
			});

			testData = testData.map(test => ({
				...test,
				processName: test.process_id ? processMap.get(test.process_id) : 'N/A'
			}));

			if (!batteryDetails) {
				throw new Error('Battery details not found.');
			}

			const designCapacityResponse = await fetch(`/api/model_details_data/${batteryDetails.modelId}`);
			if (!designCapacityResponse.ok) {
				throw new Error(`Failed to fetch model details for design capacity: ${designCapacityResponse.statusText}`);
			}
			const modelDetails = await designCapacityResponse.json();
			const designCapacity = modelDetails.designCapacity;

			document.getElementById('designCapacity')!.textContent = `${designCapacity} mAh [${batteryDetails.formfactorName}, ${batteryDetails.chemistryName}]`;
			const latestTest = testData[0];
			if (latestTest) {
				document.getElementById('latestTestInfo')!.textContent = `${latestTest.capacity} mAh [${new Date(latestTest.timestamp).toISOString()}]`;
			} else {
				document.getElementById('latestTestInfo')!.textContent = 'No test data available';
			}

			// Sort data by date in ascending order for chart
			testData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
			console.log('Sorted testData:', testData);
			renderChart(testData, designCapacity);
			const tableData = [...testData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
			renderTable(tableData);
		} catch (error) {
			console.error('Error fetching data:', error);
			console.error('Full error object:', error);
			chartContainer.innerHTML = '<p>Error loading chart data.</p>';
			testDataTable.innerHTML = '<tr><td colspan="2">Error loading test data.</td></tr>';
		}
	};

	const renderChart = (data: any[], designCapacity: number) => {
		const ctx = (document.getElementById('capacityChart') as HTMLCanvasElement).getContext('2d');
		if (!ctx) {
			return;
		}

		// Destroy existing chart if it exists
		if (capacityChart) {
			capacityChart.destroy();
		}

		capacityChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: data.map(row => new Date(row.timestamp).toLocaleString()),
				datasets: [{
					label: 'Capacity',
					data: data.map(row => row.capacity),
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1,
					fill: false
				}, {
					label: 'Design Capacity',
					data: data.map(() => designCapacity),
					borderColor: 'rgba(255, 99, 132, 1)',
					borderWidth: 2,
					borderDash: [5, 5],
					fill: false,
					pointRadius: 0
				}]
			},
			options: {
				scales: {
					x: {
						type: 'category',
						title: {
							display: true,
							text: 'Timestamp'
						}
					},
					y: {
						title: {
							display: true,
							text: 'Capacity'
						}
					}
				}
			}
		});
	};

	const renderTable = (data: any[]) => {
		const tableBody = testDataTable.querySelector('tbody');
		if (!tableBody) {
			return;
		}
		tableBody.innerHTML = data.map(row => `
			<tr>
				<td>${row.capacity}</td>
				<td>${new Date(row.timestamp).toISOString()}</td>
				<td>${row.processName}</td>
			</tr>
		`).join('');
	};

	toggleViewBtn.addEventListener('click', () => {
		if (currentView === 'chart') {
			chartContainer.classList.add('hidden-table');
			testDataTable.classList.remove('hidden-table');
			toggleViewBtn.textContent = 'Show Chart';
			currentView = 'table';
		} else {
			chartContainer.classList.remove('hidden-table');
			testDataTable.classList.add('hidden-table');
			toggleViewBtn.textContent = 'Show Table';
			currentView = 'chart';
		}
	});

	fetchData();
});