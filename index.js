const form = document.forms.sizing;
const buttonCalculate = form.buttonCalculate;
const buttonReset = form.buttonReset;
const resultPlace = document.querySelector('.result');
const resultSectionTemplate = document.querySelector('#result-section-template');
const resultItemTemplate = document.querySelector('#result-item-template');

const baseItems = [
  { cpu: '6', ram: '32', storage: '18' },
  { cpu: '2', ram: '4', storage: '8' },
  { cpu: '4', ram: '8', storage: '16' },
  { cpu: '8', ram: '16', storage: '32', description: 'Базовая конфигурация' }
];

const showInputError = (inputElement, errorMessage) => {
  const errorElement = form.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.add('sizing__input_type_error');
  errorElement.textContent = errorMessage;
};

const hideInputError = (inputElement) => {
  const errorElement = form.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.remove('sizing__input_type_error');
  errorElement.textContent = '';
};

const checkInputValidity = (inputElement) => {
  if (!inputElement.validity.valid) {
    showInputError(inputElement, inputElement.validationMessage);
  } else {
    hideInputError(inputElement);
  }
};

const checkUserOnlineValidity = () => {
  const userTotal = form.userTotal;
  const userOnline = form.userOnline;
  
  if (userOnline.value === '') {
    return true; // Поле может быть пустым
  }
  
  if (parseInt(userOnline.value) > parseInt(userTotal.value)) {
    showInputError(userOnline, userOnline.dataset.errorText);
    return false;
  } else {
    hideInputError(userOnline);
    return true;
  }
};

const hasInvalidInput = (inputList) => inputList.some((inputElement) => {
  const isVisible = !inputElement.closest('.hidden');
  return isVisible && !inputElement.validity.valid;
});

const toggleButtonState = (buttonElement) => {
  const activeInputs = getActiveInputs();
  const isFormValid = activeInputs.every(input => input.validity.valid) && checkUserOnlineValidity();
  buttonElement.disabled = !isFormValid;
};

const setEventListeners = () => {
  const inputList = getActiveInputs();
  
  toggleButtonState(buttonCalculate);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(inputElement);
      checkUserOnlineValidity();
      toggleButtonState(buttonCalculate);
    });
  });
};

const getActiveInputs = () => Array.from(form.querySelectorAll('input[type="number"]:not(.hidden)')).filter(input => !input.closest('.hidden'));

const enableValidation = () => {
  setEventListeners();
};

const clearValidation = () => {
  const inputList = getActiveInputs();
  inputList.forEach((inputElement) => hideInputError(inputElement));
  toggleButtonState(buttonCalculate);
};

const createResultItem = ( { cpu, ram, storage, description = ''} ) => {
  const resultItem = resultItemTemplate.content.cloneNode(true);
  const resultCPU = resultItem.querySelector('#resultCPU');
  const resultRAM = resultItem.querySelector('#resultRAM');
  const resultStorage = resultItem.querySelector('#resultStorage');
  const resultDescription = resultItem.querySelector('#resultDescription');

  resultCPU.textContent = `vCPU-${cpu}`;
  resultRAM.textContent = `RAM-${ram}`;
  resultStorage.textContent = `Storage-${storage}`;
  resultDescription.textContent = description;

  return resultItem;
};

const createResultSection = ( { title }, array ) => {
  const resultSection = resultSectionTemplate.content.cloneNode(true);
  const resultSectionTitle = resultSection.querySelector('.result__section-title');
  const resultSectionContent = resultSection.querySelector('.result__section-content');

  resultSectionTitle.textContent = title;

  array.forEach(item => {
    resultSectionContent.append(createResultItem(item));
  });

  return resultSection;
};

const handleCalculateSubmit = (event) => {
  event.preventDefault();

  const activeInputs = getActiveInputs();
  const isFormValid = activeInputs.every(input => input.validity.valid) && checkUserOnlineValidity();

  if (isFormValid) {
    resultPlace.textContent = '';
    resultPlace.append(
      createResultSection({ title: 'Результат 1' }, baseItems),
      createResultSection({ title: 'Результат 2' }, baseItems),
      createResultSection({ title: 'Результат 3' }, baseItems)
    );
  } else {
    console.log('Форма невалидна');
  }
};

form.addEventListener('submit', handleCalculateSubmit);

const setInitialVksState = () => {
  const vksRadio = form.querySelector('input[name="vksValue"][value="true"]');
  const vksFieldset = form.querySelector('.sizing__fieldset_vks');
  vksFieldset.classList.toggle('hidden', !vksRadio.checked);
};

const toggleVksFields = () => {
  const vksRadios = form.querySelectorAll('input[name="vksValue"]');
  const vksFieldset = form.querySelector('.sizing__fieldset_vks');
  const vksInputs = vksFieldset.querySelectorAll('input[type="number"]');

  vksRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const showVksFields = radio.value === 'true';
      vksFieldset.classList.toggle('hidden', !showVksFields);
      
      vksInputs.forEach(input => {
        input.required = showVksFields;
        if (!showVksFields) {
          input.value = '';
          hideInputError(input);
        }
      });
      
      toggleButtonState(buttonCalculate);
    });
  });
};

buttonReset.addEventListener('click', () => {
  form.reset();
  setInitialVksState();
  clearValidation();
  resultPlace.textContent = '';
});

setInitialVksState();
toggleVksFields();
enableValidation();