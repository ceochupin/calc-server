const form = document.forms.sizing;
const buttonCalculate = form.buttonCalculate;
const buttonReset = form.buttonReset;
const resultPlace = document.querySelector('.result');
const resultSectionTemplate = document.querySelector('#result-section-template');
const resultItemTemplate = document.querySelector('#result-item-template');

const WEB_SERVER_VCPU_BASE = 4;
const WEB_SERVER_RAM_BASE = 8;
const WEB_SERVER_STORAGE_BASE = 80;

const WEB_SERVER_FAULT_TOLERANCE_VCPU_BASE = 4;
const WEB_SERVER_FAULT_TOLERANCE_RAM_BASE = 4;
const WEB_SERVER_FAULT_TOLERANCE_STORAGE_BASE = 35;

const DATA_BASE_VCPU_BASE = 2;
const DATA_BASE_RAM_BASE = 8;
const DATA_BASE_STORAGE_BASE = 100;

const POSTGRES_BASE = [
  { cpu: '4', ram: '4', storage: '35', description: 'HAProxy Master' },
  { cpu: '4', ram: '4', storage: '35', description: 'HAProxy Slave' },
  { cpu: '2', ram: '2', storage: '25', description: 'etcd node 1' },
  { cpu: '2', ram: '2', storage: '25', description: 'etcd node 2' },
  { cpu: '2', ram: '2', storage: '25', description: 'etcd node 3' }
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

const createResultSection = (title, array) => {
  const resultSection = resultSectionTemplate.content.cloneNode(true);
  const resultSectionTitle = resultSection.querySelector('.result__section-title');
  const resultSectionContent = resultSection.querySelector('.result__section-content');

  resultSectionTitle.textContent = title;

  array.forEach(item => {
    resultSectionContent.append(createResultItem(item));
  });

  return resultSection;
};

const webServerCalculate = (userOnline, faultTolerance) => {
  const serverCount = Math.ceil(userOnline / 200);

  let webServerData = [];

  for (let i = 0; i < serverCount; i++) {
    const webServerItem = {
      cpu: WEB_SERVER_VCPU_BASE.toString(),
      ram: WEB_SERVER_RAM_BASE.toString(),
      storage: WEB_SERVER_STORAGE_BASE.toString()
    };

    webServerData.push(webServerItem);
  }

  if (faultTolerance === 'true' && userOnline <= 200) {
    const webServerItem = {
      cpu: WEB_SERVER_VCPU_BASE.toString(),
      ram: WEB_SERVER_RAM_BASE.toString(),
      storage: WEB_SERVER_STORAGE_BASE.toString()
    };

    webServerData.push(webServerItem);
  }

  if (faultTolerance === 'true' || userOnline > 200) {
    const webServerItem = {
      cpu: WEB_SERVER_FAULT_TOLERANCE_VCPU_BASE.toString(),
      ram: WEB_SERVER_FAULT_TOLERANCE_RAM_BASE.toString(),
      storage: WEB_SERVER_FAULT_TOLERANCE_STORAGE_BASE.toString(),
      description: 'Балансировщик'
    };

    webServerData.push(webServerItem);
  }

  return webServerData;
};

const dataBaseCalculate = (userOnline, faultTolerance, dataBase) => {
  const serverCpuCount = (userOnline <= 200) ? 2 : Math.ceil(userOnline / 100);
  const serverRamCount = (userOnline <= 300) ? 2 : Math.ceil(userOnline / 200);

  let dataBaseData = [];

  const dataBaseItem = {
    cpu: (DATA_BASE_VCPU_BASE * serverCpuCount).toString(),
    ram: (DATA_BASE_RAM_BASE * serverRamCount).toString(),
    storage: DATA_BASE_STORAGE_BASE.toString()
  };

  dataBaseData.push(dataBaseItem);

  if (faultTolerance === 'true') {
    const dataBaseItemFaultTolerance = {
      ...dataBaseItem,
      description: 'Отказоусточивость'
    };

    dataBaseData = dataBaseData.concat(POSTGRES_BASE);

    dataBaseData.push(dataBaseItemFaultTolerance);
  }

  // if (dataBase === 'Postgres') {
  //   dataBaseData = dataBaseData.concat(POSTGRES_BASE);
  // };

  return dataBaseData;
};

  //================================
  // SQL сервер PG
  //================================
  // без отказоустойчивости
  // БД vCPU-4 RAM-16 Storage-100

  // с отказоустойчивостью
  // БД vCPU-4 RAM-16 Storage-100
  // БД vCPU-4 RAM-16 Storage-100 отказоустойчивость
  // vCPU-4 RAM-4 Storage-35 HAProxy Master
  // vCPU-4 RAM-4 Storage-35 HAProxy Slave
  // vCPU-2 RAM-2 Storage-25 etcd node 1
  // vCPU-2 RAM-2 Storage-25 etcd node 2
  // vCPU-2 RAM-2 Storage-25 etcd node 3

  // до 200 4 ядра, 16 памяти
  // от 200 до 300 6, 16
  // от 300 до 400 8, 24
  // от 400 до 500 10, 24
  // от 500 до 600 12, 32
  // от 600 до 700 14, 32
  // от 700 до 800 16, 48
  // от 800 до 900 18, 48
  // от 900 до 1000 20, 64
  // от 1000 до 1500 24, 96

console.log(dataBaseCalculate(600, 'true', 'Postgres'));

const handleCalculateSubmit = (event) => {
  event.preventDefault();

  const activeInputs = getActiveInputs();
  const isFormValid = activeInputs.every(input => input.validity.valid) && checkUserOnlineValidity();

  const userTotal = form.userTotal.value;
  const userOnline = (form.userOnline.value && form.userOnline.value > 0) ? form.userOnline.value : Math.ceil(userTotal / 3);
  const faultTolerance = form.faultTolerance.querySelector('input[name="faultToleranceValue"]:checked').value;
  const webServer = form.webServer.querySelector('input[name="webServerValue"]:checked').value;
  const dataBase = form.dataBase.querySelector('input[name="dataBaseValue"]:checked').value;
  const vks = form.vks.querySelector('input[name="vksValue"]:checked').value;

  if (vks === 'true') {
    const vksUserOnline = form.vksUserOnline.value;
    const vksRooms = form.vksRooms.value;
  }

  if (isFormValid) {
    resultPlace.textContent = '';

    const webServerTitle = `${webServer}-сервер WEB`;
    const webServerData = webServerCalculate(userOnline, faultTolerance);

    resultPlace.append(
      createResultSection(webServerTitle, webServerData)
    );

    const dataBaseTitle = `Сервер базы данных (${dataBase})`;
    const dataBaseData = dataBaseCalculate(userOnline, faultTolerance, dataBase);

    resultPlace.append(
      createResultSection(dataBaseTitle, dataBaseData)
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

//================================
// Веб сервер
//================================
// до 200 в онлайне без отказоустойчивости
// vCPU-4 RAM-8 Storage-80

//================================

// до 200 в онлайне с отказоустойчивостью
// vCPU-4 RAM-4 Storage-35 балансировщик
// vCPU-4 RAM-8 Storage-80
// vCPU-4 RAM-8 Storage-80

// больше 200 в онлайне без отказоустойчивости и с отказоустойчивостью
// vCPU-4 RAM-4 Storage-35 балансировщик
// N x vCPU-4 RAM-8 Storage-80 на каждые 200 онлайн (201-400: 2N, 401-600: 3N, 601-800: 4N, 801-1000: 5N)


//================================
// SQL сервер PG
//================================
// без отказоустойчивости
// БД vCPU-4 RAM-16 Storage-100

// с отказоустойчивостью
// БД vCPU-4 RAM-16 Storage-100
// БД vCPU-4 RAM-16 Storage-100 отказоустойчивость
// vCPU-4 RAM-4 Storage-35 HAProxy Master
// vCPU-4 RAM-4 Storage-35 HAProxy Slave
// vCPU-2 RAM-2 Storage-25 etcd node 1
// vCPU-2 RAM-2 Storage-25 etcd node 2
// vCPU-2 RAM-2 Storage-25 etcd node 3

// до 200 4 ядра, 16 памяти
// от 200 до 300 6, 16
// от 300 до 400 8, 24
// от 400 до 500 10, 24
// от 500 до 600 12, 32
// от 600 до 700 14, 32
// от 700 до 800 16, 48
// от 800 до 900 18, 48
// от 900 до 1000 20, 64
// от 1000 до 1500 24, 96