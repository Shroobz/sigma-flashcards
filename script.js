// script.js
let cards = [];
let currentIndex = -1;

const rawInput = document.getElementById('raw-input');
const listNameInput = document.getElementById('list-name');
const startBtn = document.getElementById('start-btn');
const saveListBtn = document.getElementById('save-list-btn');
const deleteListBtn = document.getElementById('delete-list-btn');
const resumeBtn = document.getElementById('resume-session-btn');
const inputArea = document.getElementById('input-area');
const testInterface = document.getElementById('test-interface');
const currentTermEl = document.getElementById('current-term');
const cardEl = document.getElementById('card');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submit-answer');
const confirmArea = document.getElementById('confirm-area');
const confirmText = document.getElementById('confirm-text');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');
const progressEl = document.getElementById('progress');
const listButtonsDiv = document.getElementById('list-buttons') || document.getElementById('saved-lists');
const homeBtnArea = document.getElementById('home-btn-area');

function parseInput(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    const [term, definition] = line.split('=').map(s => s.trim());
    return term && definition ? { term, definition } : null;
  }).filter(Boolean);
}

function updateProgress() {
  progressEl.textContent = `Remaining: ${cards.length}`;
  localStorage.setItem('flashcard-session', JSON.stringify(cards));
}

function animateOutAndNext(callback) {
  cardEl.style.transform = 'translateX(-100%)';
  cardEl.style.opacity = '0';
  setTimeout(() => {
    callback();
    cardEl.style.transition = 'none';
    cardEl.style.transform = 'translateX(100%)';
    cardEl.style.opacity = '0';
    setTimeout(() => {
      cardEl.style.transition = 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out';
      cardEl.style.transform = 'translateX(0)';
      cardEl.style.opacity = '1';
    }, 20);
  }, 400);
}

function nextCard() {
  if (cards.length === 0) {
    localStorage.removeItem('flashcard-session');
    testInterface.innerHTML = '<h2 style="text-align:center;">Well done! All cards completed.</h2>';
    homeBtnArea.style.display = 'block';
    return;
  }
  updateProgress();
  currentIndex = Math.floor(Math.random() * cards.length);
  currentTermEl.textContent = cards[currentIndex].term;
  answerInput.value = '';
  answerInput.focus();
  document.getElementById('answer-area').style.display = 'block';
  confirmArea.style.display = 'none';
}

submitBtn.addEventListener('click', () => {
  const userAns = answerInput.value.trim();
  const correctAns = cards[currentIndex].definition;
  if (userAns === correctAns) {
    cards.splice(currentIndex, 1);
    animateOutAndNext(nextCard);
  } else {
    confirmText.textContent = `Your answer: "${userAns}". Is this correct for '${cards[currentIndex].term}': '${correctAns}'`;
    document.getElementById('answer-area').style.display = 'none';
    confirmArea.style.display = 'block';
    confirmYes.focus();
  }
});

answerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitBtn.click();
  }
});

document.addEventListener('keydown', e => {
  if (confirmArea.style.display !== 'none') {
    if (e.key.toLowerCase() === 'v') confirmYes.click();
    else if (e.key.toLowerCase() === 'x') confirmNo.click();
  }
});

confirmYes.addEventListener('click', () => {
  cards.splice(currentIndex, 1);
  confirmArea.style.display = 'none';
  animateOutAndNext(nextCard);
});

confirmNo.addEventListener('click', () => {
  cards.push({ ...cards[currentIndex] });
  confirmArea.style.display = 'none';
  animateOutAndNext(nextCard);
});

startBtn.addEventListener('click', () => {
  cards = parseInput(rawInput.value);
  if (cards.length === 0) {
    alert('No valid entries found. Use format term = definition per line.');
    return;
  }
  localStorage.setItem('flashcard-session', JSON.stringify(cards));
  inputArea.style.display = 'none';
  testInterface.style.display = 'block';
  nextCard();
});

resumeBtn.addEventListener('click', () => {
  const sessionData = localStorage.getItem('flashcard-session');
  if (!sessionData) {
    alert("No saved session found.");
    return;
  }
  cards = JSON.parse(sessionData);
  inputArea.style.display = 'none';
  testInterface.style.display = 'block';
  nextCard();
});

function saveList(name, content) {
  document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(content) + ';path=/;max-age=31536000';
  loadSavedListNames();
}

function getCookie(name) {
  const decoded = decodeURIComponent(document.cookie);
  const pairs = decoded.split(';').map(c => c.trim());
  for (const pair of pairs) {
    if (pair.startsWith(name + '=')) return pair.substring(name.length + 1);
  }
  return null;
}

function getAllCookieNames() {
  return document.cookie.split(';').map(c => decodeURIComponent(c.trim().split('=')[0]));
}

function loadSavedListNames(exclude) {
  listButtonsDiv.innerHTML = '';
  if (document.cookie == "") return;
  getAllCookieNames().forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.onclick = () => {
      rawInput.value = decodeURIComponent(getCookie(name));
      listNameInput.value = name;
    };
    listButtonsDiv.appendChild(btn);
  });
}

saveListBtn.addEventListener('click', () => {
  const name = listNameInput.value.trim();
  const content = rawInput.value.trim();
  if (!name || !content) {
    alert("List name and content required.");
    return;
  }

  if (new Blob([name, content]).size > 4096) {
    alert("List is too large. Please reduce size or split into multiple parts.");
    return;
  }

  saveList(name, content);
});

deleteListBtn.addEventListener('click', () => {
  const name = listNameInput.value.trim();
  if (!name) {
    alert("Provide a list name to delete.");
    return;
  }
  document.cookie = encodeURIComponent(name) + '=; path=/; max-age=0';
  loadSavedListNames(name);
});

loadSavedListNames();
