startQuizButton = document.getElementById("startQuiz");
questionText = document.getElementById("questionText");
submitButton = document.getElementById("submit");
endQuizButton = document.getElementById("endQuizbtn");
timerText = document.getElementById("timerDisplay");
answerDiv = document.getElementById("answer");
answerText = document.getElementById("answerText");

var QUIZ_TIME = 60;
var timerId = -1;

// initialize the question when the webpage is loaded
document.addEventListener("DOMContentLoaded", function() {
    
    // initTimer();
    // genQuestion();
    // timerInterval();
    // questionText.style.visibility = 'hidden';
    // submitButton.style.visibility= 'hidden';
    console.log("dom init function");
    questionText.style.visibility = 'hidden';
    answerDiv.style.visibility = 'hidden';
    timerText.style.visibility = 'hidden';
  },  { once: true });

startQuizButton.onclick = startQuiz;

var prevResult = -1;
var score = 0;

var timeRemaining = QUIZ_TIME;

const ops = ["+", "-", "*"];

function startQuiz() {
    // init quiz params
    timeRemaining = QUIZ_TIME;
    score = 0;
    prevResult = -1;
    
    initTimer();
    genQuestion();
    timerInterval();



    questionText.style.visibility = 'visible';
    startQuizButton.style.visibility = 'hidden';
    answerDiv.style.visibility = 'visible';
    timerText.style.visibility = 'visible';
}



function initTimer() {
    console.log("init timer called");
    if (timeRemaining >= 0) {
        timerText.innerHTML = "<p>Time remaining: " + timeRemaining.toString() + "</p>";
    }
}

function genQuestion() {

    console.log("genQuestion called");
    // generate question, answer and populate the div item

    // step 1: gen the question
    var a = Math.floor(Math.random() * 100);
    var b = Math.floor(Math.random() * 100);

    var opi = Math.floor(Math.random() * 10) % 2;
    var op = ops[opi];

    console.log("a = " + a.toString());
    console.log("b = " + b.toString());

    console.log("op = " + op);

    var res = -1;

    if (op == "+") {
        res = a + b;
    }
    else if(op == "-") {
        res = a - b;
    }
    else {
        res = a * b;
    }

    prevResult = res;

    // populate the div element
    var htmlText = "<p>" + a.toString() + op + b.toString() + "=</p>"
    questionText.innerHTML = htmlText;
    answerText.focus();
    answerText.select();
    return;


}

answerText.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
        onSubmit();
    }
});

function endQuiz() {
    window.alert("The quiz is over. Your final score is " + score.toString());
    console.log("Clearing timer...");
    clearInterval(timerId);
    console.log("cleared timer id = " + timerId.toString());
    timeRemaining = QUIZ_TIME;
    startQuizButton.style.visibility = 'visible';
    startQuizButton.value = 'Retake Quiz';
    questionText.style.visibility = 'hidden';
    answerDiv.style.visibility = 'hidden';
    timerText.style.visibility = 'hidden';
}

function onSubmit() {
    // evaluate the answer
    var ans = document.getElementById("answerText").value;
    document.getElementById("answerText").value = '';
    //console.log(ans);
    console.log("received answer = " + ans.toString());
    if (ans == prevResult.toString()) {
        score = score + 1;
        window.alert("Correct Answer!! Your current score is: " + score.toString());
    }
    else {
        window.alert("Wrong answer!!Your current score is: " + score.toString());
    }
    
    genQuestion();
}

function timerInterval() {
    timerId = setInterval(setAlert, 1000);
}

function setAlert() {
    console.log("alert: 1s over");
    timeRemaining = timeRemaining - 1;
    if(timeRemaining == 0) {
        // end the quiz
        endQuiz();
        
        // TODO 
    }
    initTimer();
}

submitButton.onclick = onSubmit;
endQuizButton.onclick = endQuiz;






