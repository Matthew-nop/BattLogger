
import { Chemistry, FormFactor, CreateModelParams } from '../../../interfaces/interfaces';
document.addEventListener('DOMContentLoaded', async () => {
  const formFactorSelect = document.getElementById('formFactorId') as HTMLSelectElement;
  const chemistrySelect = document.getElementById('chemistryId') as HTMLSelectElement;

  // Populate form factor and chemistry dropdowns
  try {
    const [formFactorResponse, chemistryResponse] = await Promise.all([
      fetch('/api/formfactor_details'),
      fetch('/api/chemistry_details')
    ]);
    const formFactorDetails = await formFactorResponse.json();
    const chemistryDetails = await chemistryResponse.json();

    for (const guid in formFactorDetails) {
      const option = document.createElement('option');
      option.value = guid;
      option.textContent = formFactorDetails[guid].name;
      formFactorSelect.appendChild(option);
    }

    for (const guid in chemistryDetails) {
      const option = document.createElement('option');
      option.value = guid;
      option.textContent = chemistryDetails[guid].name;
      chemistrySelect.appendChild(option);
    }

  } catch (error) {
    console.error('Error populating dropdowns:', error);
  }

  document.getElementById('createModelSubmit')?.addEventListener('click', async () => {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const designCapacityInput = document.getElementById('designCapacity') as HTMLInputElement;
    const designCapacityValue = designCapacityInput.value;
    let designCapacity: number;

    // Attempt to parse as integer, default to 0 if invalid
    const parsedCapacity = Number(designCapacityValue);
    if (isNaN(parsedCapacity)) {
      designCapacity = 0;
    } else {
      designCapacity = parsedCapacity;
    }
    const formFactorId = formFactorSelect.value;
    const chemistryId = chemistrySelect.value;
    const manufacturer = (document.getElementById('manufacturer') as HTMLInputElement).value;

    // Basic validation
    if (!name || designCapacity <= 0 || !formFactorId || !chemistryId) {
      alert('Please fill in all required fields with valid data.');
      return;
    }

    const newModel: CreateModelParams = {
      name,
      designCapacity,
      formFactorId,
      chemistryId,
      manufacturer
    };

    try {
      const response = await fetch('/api/create_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newModel)
      });

      if (response.ok) {
        alert('Model created successfully!');
        window.parent.postMessage('refreshData', '*');
        window.parent.postMessage('closeIframe', '*');
      } else {
        const errorData = await response.json();
        alert(`Error creating model: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while creating the model.');
    }
  });
});