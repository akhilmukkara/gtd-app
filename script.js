// Task Management
let tasks = JSON.parse(localStorage.getItem('gtdTasks')) || {
  nextActions: [],
  waitingFor: [],
  somedayMaybe: [],
  done: []
};

function saveTasks() {
  localStorage.setItem('gtdTasks', JSON.stringify(tasks));
}

function addTask() {
  const taskText = document.getElementById('taskInput').value.trim();
  if (!taskText) return;
  tasks.nextActions.push({ id: Date.now(), text: taskText });
  document.getElementById('taskInput').value = '';
  saveTasks();
  renderTasks();
}

function moveTask(id, fromList, toList) {
  const task = tasks[fromList].find(t => t.id === id);
  if (task) {
    tasks[fromList] = tasks[fromList].filter(t => t.id !== id);
    tasks[toList].push(task);
    saveTasks();
    renderTasks();
  }
}

function renderTasks() {
  const lists = ['nextActions', 'waitingFor', 'somedayMaybe', 'done'];
  lists.forEach(list => {
    const ul = document.getElementById(list);
    ul.innerHTML = '';
    tasks[list].forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-card bg-gray-800 p-3 rounded flex justify-between items-center';
      li.innerHTML = `
        <span>${task.text}</span>
        <div>
          ${list !== 'nextActions' ? `<button onclick="moveTask(${task.id}, '${list}', 'nextActions')" class="text-sm bg-gray-600 hover:bg-gray-500 text-white p-1 rounded mr-1">Next</button>` : ''}
          ${list !== 'waitingFor' ? `<button onclick="moveTask(${task.id}, '${list}', 'waitingFor')" class="text-sm bg-gray-600 hover:bg-gray-500 text-white p-1 rounded mr-1">Waiting</button>` : ''}
          ${list !== 'somedayMaybe' ? `<button onclick="moveTask(${task.id}, '${list}', 'somedayMaybe')" class="text-sm bg-gray-600 hover:bg-gray-500 text-white p-1 rounded mr-1">Someday</button>` : ''}
          ${list !== 'done' ? `<button onclick="moveTask(${task.id}, '${list}', 'done')" class="text-sm bg-gray-600 hover:bg-gray-500 text-white p-1 rounded">Done</button>` : ''}
        </div>
      `;
      ul.appendChild(li);
    });
  });
}

// Timer Logic
let timerInterval = null;
let timeLeft = 25 * 60;
let isWorkSession = true;
let sessionsCompleted = 0;
let isRunning = false;
let timerMode = '25-5';
const workSound = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3'); // Typewriter ding
const breakSound = new Audio('https://www.soundjay.com/bell/sounds/bell-02.mp3'); // Soft bell
const longBreakSound = new Audio('https://www.soundjay.com/bell/sounds/bell-04.mp3'); // Deep chime

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timerDisplay').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timerDisplay').classList.toggle('timer-pulse', isRunning);
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      isWorkSession = !isWorkSession;
      sessionsCompleted += isWorkSession ? 1 : 0;
      const [workTime, breakTime] = timerMode.split('-').map(Number);
      timeLeft = isWorkSession ? workTime * 60 : (sessionsCompleted % 4 === 0 ? 25 * 60 : breakTime * 60);
      (isWorkSession ? workSound : (sessionsCompleted % 4 === 0 ? longBreakSound : breakSound)).play();
      document.getElementById('sessionCount').textContent = `Sessions Completed: ${sessionsCompleted}`;
    }
    updateTimerDisplay();
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  const [workTime] = timerMode.split('-').map(Number);
  timeLeft = workTime * 60;
  isWorkSession = true;
  updateTimerDisplay();
}

// Event Listeners
document.getElementById('addTask').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});
document.getElementById('startTimer').addEventListener('click', startTimer);
document.getElementById('resetTimer').addEventListener('click', resetTimer);
document.getElementById('timerMode').addEventListener('change', e => {
  timerMode = e.target.value;
  resetTimer();
});

// Initialize
renderTasks();
updateTimerDisplay();