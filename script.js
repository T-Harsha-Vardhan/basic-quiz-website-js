const categoryContainer = document.querySelector("#category");
const levelContainer = document.querySelector("#level");
const startScreenContainer = document.querySelector("#start-screen");
const quizStartContainer = document.querySelector("#quiz-start");
const quizCancelContainer = document.querySelector("#quiz-cancel");
const quizEndContainer = document.querySelector("#quiz-end");
const quizRestartContainer = document.querySelector("#quiz-restart");
const selectedCategoryAndLevel = document.querySelector(
  "#selected-category-level"
);
const QuizStartHead = document.querySelector("#quiz-start-head");
const questionEle = document.querySelector("#question");
const optionsContainer = document.querySelector("#options");

let score = localStorage.getItem("score") ? +localStorage.getItem("score") : 0;

function selectCategory(selectedCategory) {
  localStorage.setItem("category", selectedCategory);
  categoryContainer.style.display = "none";
  levelContainer.style.display = "block";
}

async function selectLevel(selectedLevel) {
  localStorage.setItem("level", selectedLevel);
  const category = localStorage.getItem("category");
  const level = localStorage.getItem("level");
  levelContainer.style.display = "none";
  selectedCategoryAndLevel.innerHTML = `${category} - ${level}`;
  try {
    const res = await fetch("./questions.json");
    const data = await res.json();
    const questions = data[category][level];
    localStorage.setItem("questions", JSON.stringify(questions));
  } catch (error) {
    console.error("Failed to load questions:", error);
  }
  startScreenContainer.style.display = "block";
}

function startQuiz() {
  startScreenContainer.style.display = "none";
  quizStartContainer.style.display = "block";
  const category = localStorage.getItem("category");
  const level = localStorage.getItem("level");
  QuizStartHead.innerText = `${category} - ${level}`;
  QuizStartHead.style.textTransform = "uppercase";
  const questions = JSON.parse(localStorage.getItem("questions"));
  let currentQuestion = localStorage.getItem("currentQuestion")
    ? +localStorage.getItem("currentQuestion")
    : 0;

  if (currentQuestion >= questions.length) {
    currentQuestion = 0; // Reset if out of bounds
    localStorage.setItem("currentQuestion", currentQuestion);
  }

  loadQuestion(questions[currentQuestion]);
}

function cancelQuiz() {
  if (confirm("Do you want to end the quiz in the middle?")) {
    localStorage.clear();
    quizStartContainer.style.display = "none";
    categoryContainer.style.display = "block";
  }
}

function loadQuestion(question) {
  if (!question) {
    console.error("No question found to load.");
    return;
  }
  questionEle.innerText = question.question;
  optionsContainer.innerHTML = "";
  if (question.options) {
    question.options.forEach((option) => {
      const optionEle = document.createElement("h3");
      optionEle.classList.add("option");
      optionEle.innerText = option;
      optionEle.addEventListener("click", () => selectOption(option));
      optionsContainer.appendChild(optionEle);
    });
  }
}

function selectOption(selectedOption) {
  const questions = JSON.parse(localStorage.getItem("questions"));
  let currentQuestion = +localStorage.getItem("currentQuestion");
  const correctOption = questions[currentQuestion]?.answer;

  if (correctOption === selectedOption) {
    score++;
  }

  currentQuestion++;
  localStorage.setItem("currentQuestion", currentQuestion);
  localStorage.setItem("score", score);

  if (currentQuestion < questions.length) {
    loadQuestion(questions[currentQuestion]);
  } else {
    quizStartContainer.style.display = "none";
    quizEndContainer.style.display = "block";
    document.querySelector(
      "#score"
    ).innerText = `Congratulations! You have answered ${score} out of ${questions.length} questions correctly.`;
  }
}

function restartQuiz() {
  quizEndContainer.style.display = "none";
  categoryContainer.style.display = "block";
  localStorage.clear();
  score = 0;
}

window.onload = function () {
  const category = localStorage.getItem("category");
  const level = localStorage.getItem("level");

  if (category && level) {
    categoryContainer.style.display = "none";
    levelContainer.style.display = "none";
    startScreenContainer.style.display = "block";
    selectedCategoryAndLevel.innerHTML = `${category} - ${level}`;
    if (localStorage.getItem("currentQuestion") !== null) {
      startQuiz();
    }
  } else {
    categoryContainer.style.display = "block";
  }
};
