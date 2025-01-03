const form = document.forms.sizing;
const buttonReset = form.buttonReset;

const resultPlace = document.querySelector('.result');

const resultSectionTemplate = document.querySelector('#result-section-template');
const resultItemTemplate = document.querySelector('#result-item-template');

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

const baseItems = [
  { cpu: '6', ram: '32', storage: '18' },
  { cpu: '2', ram: '4', storage: '8' },
  { cpu: '4', ram: '8', storage: '16' },
  { cpu: '8', ram: '16', storage: '32' }
];

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

  resultPlace.textContent = '';

  const formValues = {
    userTotal: form.userTotal.value,
    userOnline: form.userOnline.value || Math.ceil(form.userTotal.value / 3),
    faultTolerance: form.faultTolerance.querySelector('input[name="faultToleranceValue"]:checked').value,
    webServer: form.webServer.querySelector('input[name="webServerValue"]:checked').value,
    dataBase: form.dataBase.querySelector('input[name="dataBaseValue"]:checked').value,
    vks: form.vks.querySelector('input[name="vksValue"]:checked').value,
    vksUserOnline: form.vksUserOnline.value,
    vksRooms: form.vksRooms.value
  };

  resultPlace.append(createResultSection( { title: 'Результат 1' }, baseItems ));
  resultPlace.append(createResultSection( { title: 'Результат 2' }, baseItems ));
  resultPlace.append(createResultSection( { title: 'Результат 3' }, baseItems ));
};

buttonReset.addEventListener('click', () => {
  form.reset();
  resultPlace.textContent = '';
});

form.addEventListener('submit', handleCalculateSubmit);