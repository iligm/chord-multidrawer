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

function drawChordOnCanvas(ctx, canvas, tuning, tabs, checks) {
  const stringCount = tuning.length;
  const reversedTabs   = [...tabs].reverse();
  const reversedChecks = [...checks].reverse();
  let frets = reversedTabs
    .map((f, i) => reversedChecks[i] ? f : -1)
    .filter(f => f > 0);
  let minFret = frets.length ? Math.min(...frets) : 1;
  let maxFret = frets.length ? Math.max(...frets) : 5;
  minFret = Math.max(1, minFret - 1);
  maxFret = Math.min(26, maxFret + 1);
  let fretCount = Math.max(5, maxFret - minFret + 1);
  const stringSpacing = (canvas.height - 60) / (stringCount - 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  for (let i = 0; i < stringCount; i++) {
    ctx.beginPath();
    ctx.moveTo(40, 30 + i * stringSpacing);
    ctx.lineTo(canvas.width - 30, 30 + i * stringSpacing);
    ctx.stroke();
  }
  const fretSpacing = (canvas.width - 70) / (fretCount - 1);
  ctx.lineWidth = 1;
  for (let i = 0; i < fretCount; i++) {
    const fretNumber = minFret + i - 1;
    ctx.beginPath();
    ctx.moveTo(40 + i * fretSpacing, 30);
    ctx.lineTo(40 + i * fretSpacing, 30 + (stringCount - 1) * stringSpacing);
    ctx.stroke();
    ctx.font = '12px Arial';
    ctx.fillText(fretNumber, 40 + i * fretSpacing - 5, 20);
  }
  ctx.font = '16px Arial';
  ctx.fillStyle = '#000';
  tuning.forEach((note, i) => {
    ctx.fillText(note, 10, 35 + i * stringSpacing);
  });
  ctx.fillStyle = '#000';
  reversedTabs.forEach((fret, i) => {
    const isOn = reversedChecks[i];
    ctx.fillText(isOn ? fret : 'X', canvas.width - 20, 35 + i * stringSpacing);
    if (isOn && fret >= minFret && fret <= maxFret) {
      const x = 40 + (fret - minFret + 0.5) * fretSpacing;
      const y = 30 + i * stringSpacing;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function createChordWindow({
  title = '',
  tuning, tabs, checks,
  x = 100, y = 100, width = 400, height = 150
}) {
  const chordWindows = document.getElementById('chordWindows');
  const win = document.createElement('div');
  win.className = 'chord-window';
  win.style.left = x + 'px';
  win.style.top = y + 'px';
  win.style.width = width + 'px';
  win.style.height = height + 'px';

  // Заголовок и крестик
  const header = document.createElement('div');
  header.className = 'chord-header';
  const titleDiv = document.createElement('div');
  titleDiv.className = 'chord-title';
  titleDiv.textContent = title;
  header.appendChild(titleDiv);
  win.appendChild(header);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => win.remove();
  win.appendChild(closeBtn);

  // Канвас
  const chordCanvas = document.createElement('canvas');
  chordCanvas.width = width - 40;
  chordCanvas.height = height - 60;
  chordCanvas.className = 'chord-canvas';
  win.appendChild(chordCanvas);

  chordWindows.appendChild(win);

  // Рисуем аккорд
  const ctx = chordCanvas.getContext('2d');
  drawChordOnCanvas(ctx, chordCanvas, tuning, tabs, checks);

  // Drag'n'drop
  let offsetX, offsetY, isDragging = false;
  header.onmousedown = function(e) {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = 'none';
  };
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    win.style.left = (e.clientX - offsetX) + 'px';
    win.style.top = (e.clientY - offsetY) + 'px';
  });
  document.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = '';
  });
}

// При выборе аккорда или таба создаём новое окно
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
    // Окно с пустым аккордом
    createChordWindow({
      title: chord,
      tuning: chordDictionary.tuning,
      tabs: [0,0,0].slice(0, stringCount),
      checks: Array(stringCount).fill(true),
      x: 100 + Math.random()*100,
      y: 100 + Math.random()*100,
      width: 400,
      height: 180
    });
  }
  drawChord(chordDictionary.tuning, [0, 0, 0], [true, true, true]);
});

tabSetSelect.addEventListener('change', () => {
  const chord = chordSelect.value;
  const tabIndex = tabSetSelect.value;
  if (chord && tabIndex !== '') {
    const tabs   = chordDictionary.chords[chord][tabIndex];
    const checks = tabs.map(f => f >= 0);
    createChordWindow({
      title: `${chord} (${tabs.join(', ')})`,
      tuning: chordDictionary.tuning,
      tabs: tabs.slice(0, stringCount),
      checks: checks.slice(0, stringCount),
      x: 120 + Math.random()*120,
      y: 120 + Math.random()*120,
      width: 400,
      height: 180
    });
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
