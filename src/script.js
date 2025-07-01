import chordDictionary from './chords_ceg.js';

const canvas = document.getElementById('balalaikaNeck');
const ctx = canvas.getContext('2d');

const stringCount = chordDictionary.stringCount || 3;
const notesList = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

// Генерируем элементы управления для струн
const stringsContainer = document.getElementById('stringsContainer');
stringsContainer.innerHTML = '';
for (let i = 1; i <= stringCount; i++) {
  const div = document.createElement('div');
  div.className = 'flex items-center space-x-2';

  // Селектор нот
  const select = document.createElement('select');
  select.id = `note${i}`;
  select.className = 'p-2 border rounded';
  notesList.forEach(note => {
    const option = document.createElement('option');
    option.value = note;
    option.textContent = note;
    // По умолчанию выбираем из tuning, если есть
    if (chordDictionary.tuning && chordDictionary.tuning[i-1] === note) option.selected = true;
    div.appendChild(option);
    select.appendChild(option);
  });

  // Ввод лада
  const input = document.createElement('input');
  input.id = `string${i}`;
  input.type = 'number';
  input.min = '0';
  input.max = '26';
  input.value = '0';
  input.className = 'w-16 p-2 border rounded text-center';
  input.placeholder = 'Лад';

  // Чекбокс
  const check = document.createElement('input');
  check.id = `check${i}`;
  check.type = 'checkbox';
  check.className = 'h-5 w-5';
  check.checked = true;

  div.appendChild(select);
  div.appendChild(input);
  div.appendChild(check);
  stringsContainer.appendChild(div);
}

// После генерации элементов собираем массивы
const stringInputs = [];
const noteSelects = [];
const checkInputs = [];
for (let i = 1; i <= stringCount; i++) {
  stringInputs.push(document.getElementById(`string${i}`));
  noteSelects.push(document.getElementById(`note${i}`));
  checkInputs.push(document.getElementById(`check${i}`));
}

const chordSelect = document.getElementById('chordSelect');
const tabSetSelect = document.getElementById('tabSetSelect');

// Заполняем список аккордов
Object.keys(chordDictionary.chords).forEach(chord => {
  const option = document.createElement('option');
  option.value = chord;
  option.textContent = chord;
  chordSelect.appendChild(option);
});

function drawChord(tuning, tabs, checks) {
  // Переворачиваем порядок табов и чеков:
  const reversedTabs   = [...tabs].reverse();
  const reversedChecks = [...checks].reverse();

  // 1) Обновляем ноты строя (не меняем порядок линий)
  noteSelects.forEach((select, i) => {
    if (tuning[i]) select.value = tuning[i];
  });

  // 2) Обновляем поля ввода и чекбоксы по перевёрнутым массивам
  stringInputs.forEach((input, i) => {
    input.value = reversedTabs[i] !== undefined ? reversedTabs[i] : 0;
    checkInputs[i].checked = reversedChecks[i] !== undefined ? reversedChecks[i] : true;
  });

  // 3) Очищаем канвас
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 4) Считаем минимальный и максимальный задействованные лады
  let frets = reversedTabs
    .map((f, i) => reversedChecks[i] ? f : -1)
    .filter(f => f > 0);
  let minFret = frets.length ? Math.min(...frets) : 1;
  let maxFret = frets.length ? Math.max(...frets) : 5;
  minFret = Math.max(1, minFret - 1);
  maxFret = Math.min(26, maxFret + 1);
  let fretCount = Math.max(5, maxFret - minFret + 1);

  // 5) Рисуем струны
  const stringSpacing = 40;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  for (let i = 0; i < stringCount; i++) {
    ctx.beginPath();
    ctx.moveTo(80, 30 + i * stringSpacing);
    ctx.lineTo(canvas.width - 50, 30 + i * stringSpacing);
    ctx.stroke();
  }

  // 6) Рисуем лады
  const fretSpacing = (canvas.width - 130) / (fretCount - 1);
  ctx.lineWidth = 1;
  for (let i = 0; i < fretCount; i++) {
    const fretNumber = minFret + i - 1;
    ctx.beginPath();
    ctx.moveTo(80 + i * fretSpacing, 30);
    ctx.lineTo(80 + i * fretSpacing, 30 + (stringCount - 1) * stringSpacing);
    ctx.stroke();
    ctx.font = '12px Arial';
    ctx.fillText(fretNumber, 80 + i * fretSpacing - 5, 20);
  }

  // 7) Подписи нот строя слева
  ctx.font = '16px Arial';
  ctx.fillStyle = '#000';
  noteSelects.forEach((select, i) => {
    ctx.fillText(select.value, 50, 35 + i * stringSpacing);
  });

  // 8) Рисуем точки и правые подписи ладов
  ctx.fillStyle = '#000';
  stringInputs.forEach((_, i) => {
    const fret     = parseInt(reversedTabs[i]) || 0;
    const isOn     = reversedChecks[i];
    // правая подпись: число или "X"
    ctx.fillText(isOn ? fret : 'X', canvas.width - 40, 35 + i * stringSpacing);
    // точка на грифе
    if (isOn && fret >= minFret && fret <= maxFret) {
      const x = 80 + (fret - minFret + 0.5) * fretSpacing;
      const y = 30 + i * stringSpacing;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

chordSelect.addEventListener('change', () => {
  const chord = chordSelect.value;
  tabSetSelect.innerHTML = '<option value="">Выберите набор</option>';
  tabSetSelect.disabled = !chord;

  if (chord) {
    chordDictionary.chords[chord].forEach((tabs, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = `Набор ${idx + 1} (${tabs.join(', ')})`;
      tabSetSelect.appendChild(option);
    });
  }

  // Сброс отображения на пустой
  drawChord(chordDictionary.tuning, [0, 0, 0], [true, true, true]);
});

tabSetSelect.addEventListener('change', () => {
  const chord = chordSelect.value;
  const tabIndex = tabSetSelect.value;
  if (chord && tabIndex !== '') {
    const tabs   = chordDictionary.chords[chord][tabIndex];
    const checks = tabs.map(f => f >= 0);
    drawChord(chordDictionary.tuning, tabs, checks);
  }
});

// Удаляем старые обработчики и навешиваем новые
stringInputs.forEach(input => {
  input.addEventListener('input', () => {
    chordSelect.value = '';
    tabSetSelect.value = '';
    tabSetSelect.disabled = true;
    drawChord(
      noteSelects.map(s => s.value),
      [...stringInputs.map(i => parseInt(i.value) || 0)].reverse(),
      [...checkInputs.map(c => c.checked)].reverse()
    );
  });
});

noteSelects.forEach(select => {
  select.addEventListener('change', () => {
    chordSelect.value = '';
    tabSetSelect.value = '';
    tabSetSelect.disabled = true;
    drawChord(
      noteSelects.map(s => s.value),
      [...stringInputs.map(i => parseInt(i.value) || 0)].reverse(),
      [...checkInputs.map(c => c.checked)].reverse()
    );
  });
});

checkInputs.forEach(check => {
  check.addEventListener('change', () => {
    chordSelect.value = '';
    tabSetSelect.value = '';
    tabSetSelect.disabled = true;
    drawChord(
      noteSelects.map(s => s.value),
      [...stringInputs.map(i => parseInt(i.value) || 0)].reverse(),
      [...checkInputs.map(c => c.checked)].reverse()
    );
  });
});

// Первоначальная отрисовка
drawChord(chordDictionary.tuning, [0, 0, 0], [true, true, true]);
