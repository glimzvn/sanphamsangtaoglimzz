//Variables
let numberOfQuestions = 15;
let questionsList = [];
let currentQuestion = 0;
let currentCorrectOption = 0;
let correctQuestCount = 0;
let topic = {};
let topicId = 0;
let username = "";

let urlParams = new URLSearchParams(window.location.search);
topicId = urlParams.get("topic");
numberOfQuestions = urlParams.get("number");
username = urlParams.get("username");

let progress_bar_width = 100;
let counterBack = setInterval(function () {
    progress_bar_width--;
    if (progress_bar_width >= 0) {
        $('.progress-bar').css('width', progress_bar_width + '%');
    } else {
        clearInterval(counterBack);
    }
}, 200);

//Controls
let startButton = document.querySelector("#start-btn")
let gameDiv = document.querySelector(".game-div")
let header = document.querySelector(".header")
let topic_control = new Vue({
    el: '#topic',
    data: { topic: '' }
})
let topic_start_control = new Vue({
    el: '#topic-start',
    data: { topic: '' }
})
let point_control = new Vue({
    el: '#point',
    data : { point: 0}
})
let quest_count_control = new Vue({
    el: '#quest-count',
    data : {
        currentQuest: currentQuestion,
        totalQuest: numberOfQuestions
    }
})
let username_control = new Vue({
    el: '#username',
    data : {
        username: username
    }
})
let quest_control = new Vue({
    el: '#question',
    data : {question: ''}
})
let background_music = document.querySelector("#background-music")
let right_audio = document.querySelector("#right-audio")
let wrong_audio = document.querySelector("#wrong-audio")
let option1 = new Vue({
    el: '#option1',
    data : {option: ''}
})
let option2 = new Vue({
    el: '#option2',
    data : {option: ''}
})
let option3 = new Vue({
    el: '#option3',
    data : {option: ''}
})
let option4 = new Vue({
    el: '#option4',
    data : {option: ''}
})
optionButtons = [option1.$el, option2.$el, option3.$el, option4.$el]
let btn_next = new Vue({
    el: '#btn-next',
    data : {content: 'Next'}
})
let question_content = document.querySelector(".question-content")
let question_media = document.querySelector(".question-media")
let question_video = document.querySelector("#question-video")
let question_audio = document.querySelector("#question-audio")
let question_image = document.querySelector("#question-image")
let number_of_quest_control = new Vue({
    el: '#number-of-quest',
    data: {questCount: numberOfQuestions}
})
let result_div = document.querySelector(".result-div")

startButton.addEventListener("click", function() {
    fadeOut(document.querySelector(".start-div"))
    background_music.volume = "1";
    background_music.play();
    background_music.muted = false;
    showNextQuestion();
})

document.addEventListener("DOMContentLoaded", function() {
    resizeBackground();
    result_div.style.setProperty("display", "none", "important");
    if (topicId != 0 && numberOfQuestions >= 5) {
        getTopics(topicId);
        getQuestions(topicId, numberOfQuestions);
    }
    else
    {
        alert("Thông số không chính xác!");
        window.location.href = "index.html";
    }
    for (let i = 0; i < optionButtons.length; i++) {
        optionButtons[i].addEventListener("click", function() {
            checkAnswer(i);
            clearInterval(counterBack);
        })
    }
    quest_count_control.totalQuest = numberOfQuestions;
    clearInterval(counterBack);
    question_image.style.display = "none";
    question_video.style.display = "none";
})

btn_next.$el.addEventListener("click", function() {
    if (currentQuestion < numberOfQuestions) {
        showNextQuestion();
    }
    else 
    {
        background_music.pause();
        background_music.currentTime = 0;
        topic_result.topic = topic.name;
        point_result.point = point_control.point;
        ratio_result.correct = correctQuestCount;
        ratio_result.total = numberOfQuestions;
        ratio_result.ratio = (correctQuestCount * 100 / numberOfQuestions).toFixed(0);
        fadeIn(result_div);
        uploadRecord();
        document.querySelector(".start-div").style.setProperty("height", "100vh");
        document.querySelector(".result-div").style.setProperty("height", "100vh");
        document.querySelector(".answer-div").style.setProperty("height", "0px");
        gameDiv.style.setProperty("display", "none");
    }
})

function uploadRecord() {
    //Retaining 6 information so making 6 PUT requests
    //Getting current timestamp for key
    let timestamp = new Date().getTime();
	let base_url = `https://quizzyweb-3e807-default-rtdb.firebaseio.com/records/${timestamp}/`;
    
    let xhr_correct = new XMLHttpRequest();
    xhr_correct.open("PUT", base_url + 'correctQuest.json', true);
    xhr_correct.send(correctQuestCount)

    let xhr_point = new XMLHttpRequest();
    xhr_point.open("PUT", base_url + 'point.json', true);
    xhr_point.send(point_control.point)

    let xhr_ratio = new XMLHttpRequest();
    xhr_ratio.open("PUT", base_url + 'ratio.json', true);
    xhr_ratio.send((correctQuestCount / numberOfQuestions))

    let xhr_topic = new XMLHttpRequest();
    xhr_topic.open("PUT", base_url + 'topic_id.json', true);
    xhr_topic.send(`"${topicId}"`)

    let xhr_totalquest = new XMLHttpRequest();
    xhr_totalquest.open("PUT", base_url + 'totalQuest.json', true);
    xhr_totalquest.send(numberOfQuestions)
    
    let xhr_username = new XMLHttpRequest();
    xhr_username.open("PUT", base_url + 'username.json', true);
    xhr_username.send(`"${username}"`)
}

function getQuestions(topicID, noQ){
    let xhr = new XMLHttpRequest();
    let url = "";
    if (topicID == 11) {
      url = "https://quizzyweb-3e807-default-rtdb.firebaseio.com/questions.json"
    } else {
      url = `https://quizzyweb-3e807-default-rtdb.firebaseio.com/questions.json?orderBy="topic_id"&startAt="${topicID}"&endAt="${topicID}"`;
    }
    xhr.open(
        "GET",
        url,
        true
    );
    xhr.onload = function() {
        if(this.status === 200) {
          let results = JSON.parse(this.responseText);
          questionsList = reduceResult(results, noQ);
        }
    }
    xhr.send();
}

function getTopics(topicID){
    let xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `https://quizzyweb-3e807-default-rtdb.firebaseio.com/topics.json`,
        true
    );
    xhr.onload = function() {
        if(this.status === 200) {
          let results = JSON.parse(this.responseText);
          topic = results[topicID];
          topic_control.topic = topic.name;
          topic_start_control.topic = topic.name;
          images = document.getElementsByClassName("topic-img");
          for (i = 0; i < images.length; i++) {
            images[i].setAttribute("src", topic.image);
          }
        }
    }
    xhr.send();
}

function fadeOut(element) {
    element.style.opacity = 0;
    setTimeout(function() {
        element.style = "opacity: 0; display:none; z-index: -1;";
    }, 300)
}

function fadeIn(element) {
    element.style.display = "initial";
    setTimeout(function() {
        element.style.opacity = 1;
    }, 10)
}

function checkAnswer(choice) {
    
    if (choice === correctOption) {
        right_audio.currentTime = 0;
        right_audio.volume = 0.7;
        right_audio.play();
        correctQuestCount++;
        updatePoint();
    } else {
        wrong_audio.currentTime = 0;
        wrong_audio.volume = 0.5;
        wrong_audio.play();
    }
    showAnswer();
}

function updatePoint() {
    if (progress_bar_width > 87)
        point_control.point += 20;
    else if (progress_bar_width > 80)
        point_control.point += 19;
    else if (progress_bar_width > 73)
        point_control.point += 18;
    else if (progress_bar_width > 67)
        point_control.point += 17;
    else if (progress_bar_width > 53)
        point_control.point += 16;
    else if (progress_bar_width > 40)
        point_control.point += 15;
    else if (progress_bar_width > 27)
        point_control.point += 14;
    else if (progress_bar_width > 13)
        point_control.point += 13;
    else if (progress_bar_width > 7)
        point_control.point += 12;
    else if (progress_bar_width > 0)
        point_control.point += 10;
}

function showAnswer() {
    progress_bar_width = 100;
    $('.progress-bar').css('width', progress_bar_width + '%');
    for (let i = 0; i < 4; i++) {
        optionButtons[i].disabled = true;
        optionButtons[i].classList.remove("btn-info");
        if (i === correctOption)
            optionButtons[i].classList.add("btn-success");
        else
            optionButtons[i].classList.add("btn-danger");
        optionButtons[i].style.setProperty("opacity", 1, "important");
    }
    btn_next.$el.style.display = "initial";
}

function showNextQuestion() {
    currentQuestion += 1;
    quest_count_control.currentQuest = currentQuestion;
    getQuestion = questionsList[currentQuestion - 1];
    quest_control.question = getQuestion.question
    correctOption = parseInt(getQuestion.answer_no);
    randomIndex = []
    while (randomIndex.length != 4) {
        randomValue = Math.floor(Math.random() * 4);
        if (!randomIndex.includes(randomValue))
            randomIndex.push(randomValue);
    }
    correctOption = randomIndex.indexOf(correctOption - 1);
    optionsOriginalContent = [getQuestion.option1, getQuestion.option2, getQuestion.option3, getQuestion.option4]
    optionsContentShuffled = []
    for (let i = 0; i < 4; i++) {
        optionsContentShuffled.push(optionsOriginalContent[randomIndex[i]])
    }
    if (currentQuestion == numberOfQuestions) {
        btn_next.content = "End";
    }
    optionButtons.forEach((element) => {
        if (element.classList.contains("btn-danger"))
            element.classList.remove("btn-danger")
        if (element.classList.contains("btn-success"))
            element.classList.remove("btn-success")
        if (!element.classList.contains("btn-info"))
            element.classList.add("btn-info")
    })
    btn_next.$el.style.display = "none";
    if (getQuestion.image != "") {
        if (getQuestion.image.includes("media_questions%2Fmusic") || getQuestion.image.includes("media_questions%2Fvideo")) {
            updateMedia(getQuestion.image, optionsContentShuffled);
            option1.option = "";
            option2.option = "";
            option3.option = "";
            option4.option = "";
            for (let i = 0; i < 4; i++) {
                optionButtons[i].disabled = true;
                optionButtons[i].style.setProperty("opacity", 1, "important");
            }
        }
        else
        {
            updatePicture(getQuestion.image);
            option1.option = optionsContentShuffled[0];
            option2.option = optionsContentShuffled[1];
            option3.option = optionsContentShuffled[2];
            option4.option = optionsContentShuffled[3];
            setTimeout(function() {
                question_image.style.visibility = "visible";
                resetOptionsClickable();
                timerStart();
            }, 500);
        }
    } else {
        //document.querySelector(".question").style.setProperty("margin-bottom", "10px", "important");
        //document.querySelector(".question-media").style.setProperty("margin", "0px", "important");
        question_content.style.height = "100%";
        question_media.style.height = "0%";
        option1.option = optionsContentShuffled[0];
        option2.option = optionsContentShuffled[1];
        option3.option = optionsContentShuffled[2];
        option4.option = optionsContentShuffled[3];
        resetOptionsClickable();
        resizeBackground();
        timerStart();
    }
}

function resetOptionsClickable() {
    optionButtons.forEach((element) => {
        element.disabled = false;
    })
}

function timerStart() {
    counterBack = setInterval(function () {
        progress_bar_width--;
        if (progress_bar_width >= 0) {
            $('.progress-bar').css('width', progress_bar_width + '%');
        } else {
            clearInterval(counterBack);
            wrong_audio.currentTime = 0;
            wrong_audio.volume = 0.5;
            wrong_audio.play();
            showAnswer();
        }
    }, 150);
}

function updateMedia(url, optionsContent) {
    if (url.includes("media_questions%2Fvideo")) {
        question_image.style.display = "none";
        question_video.style.display = "initial";
        question_content.style.height = "30%";
        question_content.style.marginBottom = "10px";
        question_media.style.height = "70%";
        //document.querySelector(".question").style.setProperty("margin-bottom", "5vh", "important");
        preLoadMedia(url, question_video, optionsContent)
    } else {
        question_image.style.display = "none";
        question_video.style.display = "none";
        question_content.style.height = "100%";
        question_media.style.height = "0%";
        document.querySelector(".question").style.setProperty("margin-bottom", "10px", "important");
        preLoadMedia(url, question_audio, optionsContent)
    }
}

function preLoadMedia(url, el, optionsContent) {
    el.setAttribute("src", url);
    el.oncanplaythrough = function() {
        setTimeout(function() {
            background_music.pause();
            el.play();
        }, 1000);
    };
    el.onended = function(e) {
        option1.option = optionsContentShuffled[0];
        option2.option = optionsContentShuffled[1];
        option3.option = optionsContentShuffled[2];
        option4.option = optionsContentShuffled[3];
        resetOptionsClickable();
        timerStart();
        background_music.play();
    };
}

function updatePicture(url) {
    question_video.style.display = "none";
    question_image.style.display = "initial";
    question_image.setAttribute("src", url);
    question_image.style.visibility = "hidden";
    question_content.style.height = "30%";
    question_content.style.marginBottom = "10px";
    question_media.style.height = "70%";
    //document.querySelector(".question").style.setProperty("padding-bottom", "5vh", "important");
    question_image.onload = function() {
        let height = document.querySelector(".question").offsetHeight - question_content.offsetHeight;
        if (window.innerWidth <= 993) {
            question_media.style.setProperty("height", `${height}px`, "important");
        } else {
            question_media.style.setProperty("height", `70%`, "important");
        }
        question_image.style.setProperty("height", `100%`, "important");
        question_image.style.setProperty("width", `auto`, "important");
    }
    resizeBackground();
}

function resizeBackground() {
    gameDiv.style.setProperty("height", "auto", "important");
    setTimeout(function() {
        if (gameDiv.offsetHeight <= window.innerHeight) {
            gameDiv.style.setProperty("height", "100vh", "important");
        }
    }, 50);
}

//Result zone
let topic_result = new Vue({
    el: '#topic-result',
    data: {topic: topic.name}
})

let point_result = new Vue({
    el: '#point-result',
    data: {point: point_control.point}
})

let ratio_result = new Vue({
    el: '#ratio-result',
    data: {
        correct: correctQuestCount,
        total: numberOfQuestions,
        ratio: (correctQuestCount / numberOfQuestions).toFixed(2)
    }
})

document.getElementById("newgame").addEventListener("click", function(e) {
    e.preventDefault();
    window.location.href = `choosing.html?username=${username}`;
  });