
let sessionStarted = false;
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
const answerModeBtn = document.getElementById('answer-mode');
const answerArea = document.getElementById('answer-area');
const homeBtn = document.getElementById('home-btn');

function parseInput(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (answerModeBtn.value == "both") {
    answerModeBtn.value = "definition"
    let arr1 = parseInput(text)
    answerModeBtn.value = "term"
    let arr2 = parseInput(text)
    answerModeBtn.value = "both"
    return arr1.concat(arr2)
  }
  return lines.map(line => {
    if (answerModeBtn.value == "definition") {
      const [term, definition] = line.split('=').map(s => s.trim());
      return term && definition ? { term, definition } : null;
    } else if (answerModeBtn.value == "term") {
      const [definition, term] = line.split('=').map(s => s.trim());
      return term && definition ? { term, definition } : null;
    }
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
  if (!sessionStarted) return;
  console.log(cards.length)
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
  answerArea.style.display = 'block';
  confirmArea.style.display = 'none';
}

submitBtn.addEventListener('click', () => {
  const userAns = answerInput.value.trim();
  const correctAns = cards[currentIndex].definition;
  let withoutBracketsAns = correctAns.toLowerCase().replace(/\([^()]*\)/g, '').replace(/\s/g, '').replace("(", "").replace(")", "");
  let withoutBracketsUserAns = userAns.toLowerCase().replace(/\([^()]*\)/g, '').replace(/\s/g, '').replace("(", "").replace(")", "");
  let withBracketsAns = correctAns.toLowerCase().replace(/\s/g, '').replace("(", "").replace(")", "");
  let withBracketsUserAns = userAns.toLowerCase().replace(/\s/g, '').replace("(", "").replace(")", "")
  if (withBracketsUserAns == withBracketsAns || withoutBracketsUserAns == withoutBracketsAns) {
    cards.splice(currentIndex, 1);
    animateOutAndNext(nextCard);
  } else {
    confirmText.textContent = `Your answer: "${userAns}". Is this correct for '${correctAns}'`;
    answerArea.style.display = 'none';
    confirmArea.style.display = 'block';
    confirmYes.focus();
  }
});

answerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitBtn.click();
  w}
});

deleteListBtn.addEventListener('click', () => {
  const name = listNameInput.value.trim();
  if (!name) {
    alert("List name required to delete.");
    return;
  }
  if (confirm(`Are you sure you want to delete the list "${name}"?`)) {
    let save = localStorage.getItem("lists");
    if (save == null) return;
    save = JSON.parse(save);
    for (let i = 0; i < save.length; i++) {
      if (save[i].name == name) {
        console.log("deleting at " + i)
        save.splice(i,1)
        break;
      }
    }
    localStorage.setItem("lists", JSON.stringify(save))
    loadSavedListNames();
    listNameInput.value = '';
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
  console.log("hi")
  cards = parseInput(rawInput.value);
  if (cards.length === 0) {
    alert('No valid entries found. Use format term = definition per line.');
    return;
  }
  localStorage.setItem('flashcard-session', JSON.stringify(cards));
  inputArea.style.display = 'none';
  testInterface.style.display = 'block';
  sessionStarted = true;
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
  sessionStarted = true;
  nextCard();
});

homeBtn.addEventListener('click', () => {
  inputArea.style.display = 'block';
  testInterface.style.display = 'none';
  sessionStarted = false;
  cards = [];
  currentIndex = -1;
  rawInput.value = '';
  listNameInput.value = '';
  answerInput.value = '';
  confirmArea.style.display = 'none';
  homeBtnArea.style.display = 'none';
  progressEl.textContent = '';
  localStorage.removeItem('flashcard-session');
  loadSavedListNames();
});

function saveList(name, content) {
  if (getAllCookieNames().includes(name)) {
    alert("that name is taken!")
    return;
  }
  let input = { name, content }
  let save = localStorage.getItem("lists")
  if (save == null) {
    save = [input]
  } else {
    save = JSON.parse(save)
    save.push(input)
  }
  console.log(save)
  localStorage.setItem("lists", JSON.stringify(save))
  loadSavedListNames();
}

function getCookie(name) {
  if (!getAllCookieNames().includes(name)) return null;
  let save = localStorage.getItem("lists")
  if (save != null) {
    save = JSON.parse(save)
    for (let i = 0; i < save.length; i++) {
      if (save[i].name == name) return save[i].content
    }
  }
  return null;
}

function getCookieOldAndBad(name) {
  const decoded = decodeURIComponent(document.cookie);
  const pairs = decoded.split(';').map(c => c.trim());
  for (const pair of pairs) {
    if (pair.startsWith(name + '=')) return pair.substring(name.length + 1);
  }
  return null;
}

function getAllCookieNames() {
  let names = []
  let save = localStorage.getItem("lists")
  if (save != null) {
    save = JSON.parse(save)
    save.forEach(list => {
      names.push(list.name)
    })
  }
  return names
}

function loadSavedListNames(exclude) {
  if (document.cookie != "" && localStorage.getItem("lists") == null) {
    console.log("shit how i do")
    let cookies = document.cookie.split(';').map(c => decodeURIComponent(c.trim().split('=')[0]));
    let save = localStorage.getItem("lists");
    save = (save == null) ? [] : JSON.parse(save)

    cookies.forEach(name => {
      let content = decodeURIComponent(getCookieOldAndBad(name))
      let input = {name,content}
      save.push(input)
      
    })
    localStorage.setItem("lists", JSON.stringify(save))
  }


  listButtonsDiv.innerHTML = '';
  if (localStorage.getItem("lists") == null) return;
  getAllCookieNames().forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.onclick = () => {
      rawInput.value = getCookie(name);
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

loadSavedListNames();

