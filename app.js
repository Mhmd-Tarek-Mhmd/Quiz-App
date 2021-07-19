/* Global Variables */
const submitBtn = document.querySelector('.quiz-controls button:first-of-type'),
      resultBtn = document.querySelector('.quiz-controls button:last-of-type'),
      questionOptions = document.getElementsByName('option');

let questions = [],
    questionsIndexes,
    currentIndex = 0,
    currentQuestion,
    timer;
      


/* Helper Functions */
function shuffleQuestions() {
  questionsIndexes = [...questions.keys()];
  let currentLength = questions.length,
      randomVal,
      helperVal;

  while (currentLength > 0) {
    randomVal = Math.floor(Math.random() * currentLength--);

    helperVal = questionsIndexes[currentLength];
    questionsIndexes[currentLength] = questionsIndexes[randomVal];
    questionsIndexes[randomVal] = helperVal;
  }

  currentQuestion = questions[questionsIndexes[0]];
}

function showPopup(title, msg, btnCaption, callbackFn=removePopup) {
  const popup = document.createElement('div'),
        popupOverlay = document.createElement('div'),
        popupTitle = document.createElement('h3'),
        popupMsg = document.createElement('p'),
        popupBtn = document.createElement('button');

  // [1] Popup Title
  popupTitle.innerHTML = title;
  popup.appendChild(popupTitle);

  // [2] Popup Msg
  popupMsg.innerHTML = msg;
  popup.appendChild(popupMsg);

  // [3] Popup Btn
  popupBtn.innerHTML = btnCaption;
  popupBtn.className = 'btn popup-btn';
  popupBtn.onclick = callbackFn;
  popup.appendChild(popupBtn);

  // [4] Popup Overlay
  popupOverlay.className = 'overlay';
  document.documentElement.appendChild(popupOverlay);

  // [5] Last Touch
  popup.className = 'popup';
  document.documentElement.appendChild(popup);
}
function removePopup() {
  document.querySelector('.popup').remove();
  document.querySelector('.overlay').remove();
}

function handleBullets() {
  // Set the chosen answer
  let chosenAnswer;
  questionOptions.forEach(e => e.checked ? chosenAnswer = e.value : null);
  
  // Handle the bullets
  document.querySelectorAll('.quiz-stats .bullets span').forEach((ele, i) => {
    i === currentIndex ? ele.className = 'on' : ele.classList.remove('on');
    if (i === currentIndex-1) {
      questions[questionsIndexes[currentIndex-1]].answer === chosenAnswer ? ele.classList.add('right') : ele.classList.add('wrong');
    }
  });
}
function countdownTimer() {
  const countdown = document.querySelector('.quiz-stats .countdown');
  let min = 0;
  let sec = 30;
  min < 10 ? min = `0${min}` : min;
  countdown.innerHTML = `${min}:${sec}`;

  timer = setInterval(() => {
    sec > 0 && sec--;
    sec < 10 ? sec = `0${sec}` : sec;
    countdown.style.color = sec < 10 ? 'red' : 'initial';
    sec === '00' && (currentIndex !== questions.length-1 ? submitBtn.click() : resultBtn.click());
    
    countdown.innerHTML = `${min}:${sec}`;
  }, 1000);
}

function showResults() {
  // Set the right answer
  let rightAnswers = document.querySelectorAll('.quiz-stats .bullets .right');
  rightAnswers === null ? rightAnswers = 0 : rightAnswers = rightAnswers.length;

  // Set set the Msg
  let msg = `<span style="color: var(--main-color)">Passed.</span> You answered ${rightAnswers} from ${questions.length}.`;
  rightAnswers === questions.length ? msg = '<span style="color: #0f0">Perfect.</span> All the right answers were chosen.' : null;
  rightAnswers < questions.length/2 ? msg = `<span style="color: #f00">Failed.</span> You answered ${rightAnswers} from ${questions.length}.` : null;

  showPopup('Results', msg, 'Another quiz?', () => location.reload()); 
}
function quizStart() {
  const data = Object.values(JSON.parse(this.responseText))[0];
  questions = [...data];
  shuffleQuestions(); // Shuffle the questions

  // Create bullets
  for (let i =0 ; i < questions.length; i++) {document.querySelector('.quiz-stats .bullets').appendChild(document.createElement('span'))}
  document.querySelector('.quiz-stats .bullets').children[0].className = 'on';

  // Handle app UI
  document.querySelector('.question-info .count span').textContent = questions.length;
  updateUI();
}

function updateUI() {
  // Set question info
  document.querySelector('.question-info .category span').innerHTML = currentQuestion.category;
  document.querySelector('.question-area h2').innerHTML = currentQuestion.title;

  // Set Options
  document.querySelectorAll('.question-area .option label').forEach((e, i) => e.innerHTML = currentQuestion.options[i]);
  questionOptions.forEach((input, i) => input.value = currentQuestion.options[i]);

  // Set Timer
  clearInterval(timer);
  countdownTimer();
}
function getData() {
  const questionsRequest = new XMLHttpRequest();

  questionsRequest.onload = quizStart;
  questionsRequest.onerror = (err) => console.log(err);

  questionsRequest.open('GET', 'fakeQuestions.json');
  questionsRequest.send();
}



/* Events to handle app actions */

// [1] Loading data action
window.onload = () => {
  showPopup('Hello in Quiz App', '', 'Start', () => {
    removePopup();
    getData();
  });
};

// [2] Choosing an option action
submitBtn.onclick = () => {
  currentIndex++;
  currentQuestion = questions[questionsIndexes[currentIndex]];
  handleBullets();
  updateUI();

  if (currentIndex === questions.length-1) {
    submitBtn.style.display = 'none';
    resultBtn.style.display = 'block';
  }
};

// [3] Showing results action
resultBtn.onclick = () => {
  currentIndex++; // To handle last bullet
  handleBullets();
  clearInterval(timer);
  showResults();
};