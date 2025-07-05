

document.addEventListener('DOMContentLoaded', async () => {
	const batteryId = window.location.pathname.split('/').pop();

	const chartContainer = document.getElementById('chartContainer') as HTMLDivElement;
	const testDataTable = document.getElementById('testDataTable') as HTMLTableElement;
	const toggleViewBtn = document.getElementById('toggleViewBtn') as HTMLButtonElement;
	let currentView = 'chart'; // 'chart' or 'table'
	let testData: any[] = [];

	const fetchData = async () => {
		try {
			const [testDataResponse, batteryDetailsResponse, modelDetailsResponse, formFactorDetailsResponse, chemistryDetailsResponse] = await Promise.all([
				fetch(`/api/battery_tests/${batteryId}`),
				fetch(`/api/battery/${batteryId}`),
				fetch('/api/model_details'),
				fetch('/api/formfactor_details'),
				fetch('/api/chemistry_details')
			]);
			if (!testDataResponse.ok) {
				throw new Error(`Failed to fetch test data: ${testDataResponse.statusText}`);
			}
			else if (!batteryDetailsResponse.ok) {
				throw new Error(`Failed to fetch battery details: ${batteryDetailsResponse.statusText}`);
			}
			else if (!modelDetailsResponse.ok) {
				throw new Error(`Failed to fetch model details: ${modelDetailsResponse.statusText}`);
			}
			else if (!formFactorDetailsResponse.ok) {
				throw new Error(`Failed to fetch form factor details: ${formFactorDetailsResponse.statusText}`);
			}
			else if (!chemistryDetailsResponse.ok) {
				throw new Error(`Failed to fetch chemistry details: ${chemistryDetailsResponse.statusText}`);
			}

			testData = await testDataResponse.json();
			const batteryDetails = await batteryDetailsResponse.json();
			const modelDetails = await modelDetailsResponse.json();
			const formFactorDetails = await formFactorDetailsResponse.json();
			const chemistryDetails = await chemistryDetailsResponse.json();

			console.log('Battery Details:', batteryDetails);
			console.log('Model Details:', modelDetails);
			console.log('Form Factor Details:', formFactorDetails);

			const designCapacity = modelDetails[batteryDetails.model_id]?.designCapacity;
			const modelName = modelDetails[batteryDetails.model_id]?.name;
			const formfactorName = formFactorDetails[batteryDetails.formfactor_id]?.name;
			const chemistryName = chemistryDetails[batteryDetails.chemistry_identifier]?.name;



			document.getElementById('designCapacity')!.textContent = `${designCapacity} mAh [${formfactorName}, ${chemistryName}]`;
			const latestTest = testData[0];
			document.getElementById('latestTestInfo')!.textContent = `${latestTest.capacity} mAh [${new Date(latestTest.timestamp).toISOString()}]`;

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
		new Chart(ctx, {
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