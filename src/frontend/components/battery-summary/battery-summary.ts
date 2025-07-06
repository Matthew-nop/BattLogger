document.addEventListener('DOMContentLoaded', async () => {
    const batteryId = new URLSearchParams(window.location.search).get('batteryId');

    if (!batteryId) {
        console.error('Battery ID not found in URL.');
        return;
    }

    try {
        const batteryResponse = await fetch(`/api/battery_details_data/${batteryId}`);
        const battery = await batteryResponse.json();

        if (!battery) {
            console.error('Battery data not found.');
            return;
        }

        const modelResponse = await fetch(`/api/model_details_data/${battery.model_id}`);
        const model = await modelResponse.json();

        document.getElementById('batteryId')!.textContent = battery.id;
        document.getElementById('modelName')!.textContent = model?.name || 'N/A';
        document.getElementById('chemistryName')!.textContent = battery.chemistry_name || 'N/A';
        document.getElementById('formfactorName')!.textContent = battery.formfactor_name || 'N/A';
        document.getElementById('lastTestedCapacity')!.textContent = battery.last_tested_capacity !== null ? battery.last_tested_capacity : 'N/A';
        document.getElementById('lastTestedTimestamp')!.textContent = battery.last_tested_timestamp !== null ? battery.last_tested_timestamp : 'N/A';

    } catch (error) {
        console.error('Error fetching battery details:', error);
    }
});