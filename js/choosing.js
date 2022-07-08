let max_number_of_questions = [ 0 ]
let fetchResult;
let username = "";
let startButtons;

let urlParams = new URLSearchParams(window.location.search);
username = urlParams.get("username");

let swiper;

document.addEventListener("DOMContentLoaded", function() {
  if (username != null) {
    fetchTopic();
  }
  else
  {
      alert("Thông số không chính xác!");
      window.location.href = "index.html";
  }
})

function fetchQuestionsNumberOfQuest(topicID) {
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
  xhr.onreadystatechange = function() {
      if (this.status === 200 && this.readyState === 4) {
          let numberOfQuestions = 0;
          let result = JSON.parse(this.responseText);
          if (topicID === 11) {
            numberOfQuestions = result.length;
          } else {
              let tmpArr = []
              for (var id in result) {
                  if (Object.prototype.hasOwnProperty.call(result, id)) {
                      tmpArr.push(parseInt(id));
                  }
              }
              numberOfQuestions = tmpArr.length;
          }
          max_number_of_questions[topicID] = numberOfQuestions;
          if (max_number_of_questions.filter(function(x){return x==0}).length == 1)
          {
            createCard(fetchResult);
          }
      }
  }
  xhr.send();
}

function fetchTopic() {
    let xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `https://quizzyweb-3e807-default-rtdb.firebaseio.com/topics.json`,
        true
    );
    xhr.onreadystatechange = function() {
        if (this.status === 200 && this.readyState === 4) {
            fetchResult = JSON.parse(this.responseText);
            for (let i = 1; i < fetchResult.length; i++) {
              max_number_of_questions.push(0);
            }
            for (let i = 1; i < fetchResult.length; i++) {
              fetchQuestionsNumberOfQuest(i);
            }
        }
    }
    xhr.send();
}

function reduceResult(results){
  return Object.entries(results)
  .map(a => a.pop())
}

function createCard(apiResult){
  //const container = document.getElementById('topic-card');
  const container = document.querySelector('.swiper-wrapper');
  delete apiResult[0];
  for (let i = 1; i < apiResult.length; i++) {
    // Create card element
    const card = document.createElement('div');
    // Construct card content
    const cardContent = `
      <div class="swiper-slide">
      <div class="card col-md-12" id="topic-card-${i}" style="opacity: 0 important!;">
      <img class="card-img-top img-responsive" src="${apiResult[i].image}" alt="">
      <div class="card-title">
        <h3 class="mb-0"><b>${apiResult[i].name}<b></h3>
      </div>
        <div class="card-body">
          <div class="container">
             <div class="row justify-content-center">
               <div class="col-xs-3 col-xs-offset-3">
                  <div class="input-group number-spinner">
                      <span class="input-group-btn">
                           <button class="btn btn-default" data-dir="dwn" id="${i}"><span class="fa fa-minus"></span></button>
                      </span>
                      <input id="input-${i}" type="number" class="form-control text-center" min="5" max="${max_number_of_questions[i]}" value="5">
                      <span class="input-group-btn">
                           <button class="btn btn-default" data-dir="up"><span class="fa fa-plus"></span></button>
                      </span>
                  </div>
               </div>
           </div>
      </div>
          <button id="btn-${i}" class="btn-start btn btn-info btn-lg btn-block" style="margin-top: 1rem" ">Start</button>
        </div>
      </div>
      </div>`;

    // Append newyly created card element to the container
    container.innerHTML += cardContent;
  }
  document.querySelector(".jumbotron").style.setProperty("height", "auto", "important");
  startButtons = document.getElementsByClassName("btn-start");
  for (let i = 0; i < startButtons.length; i++) {
    startButtons[i].addEventListener("click", function() {
      let id = startButtons[i].id;
      id = id.substring(4, id.length);
      let numberOfQuestions = document.getElementById(`input-${id}`).getAttribute("value");
      window.location.href = `game.html?username=${username}&topic=${i + 1}&number=${numberOfQuestions}`;
    })
  }
  if (window.innerWidth <= 767 || (window.innerWidth < window.innerHeight)) {
    swiper = new Swiper('.swiper-container', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: '1',
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      },
      pagination: {
        el: '.swiper-pagination',
      },
    });
  } else {
    swiper = new Swiper('.swiper-container', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: '3',
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      },
      pagination: {
        el: '.swiper-pagination',
      },
    });
  }
  let card = document.querySelectorAll(".card");
  card[0].querySelector(".card-img-top").onload = function() {
    if (card[0].offsetWidth >= card[0].querySelector(".card-img-top").offsetWidth) {
      $('.card').attr('style', `width: ${card[0].querySelector(".card-img-top").offsetHeight}px !important`);
    } else if (card[0].offsetHeight >= card[0].querySelector(".card-img-top").offsetHeight) {
      $('.card').attr('style', `height: ${card[0].querySelector(".card-img-top").offsetWidth}px !important`);
    }
    setTimeout(function() {
      $('.loading').attr('style', "opacity: 0");
      $('.jumbotron').attr('style', "opacity: 1");
    }, 300)
  }
}

$(document).on('click', '.number-spinner button', function () {
	var btn = $(this),
		oldValue = btn.closest('.number-spinner').find('input').val().trim(),
		newVal = 0;

	if (btn.attr('data-dir') == 'up') {
		newVal = parseInt(oldValue) + 1;
	} else {
		if (oldValue > 5) {
			newVal = parseInt(oldValue) - 1;
		} else {
			newVal = 5;
		}
	}
	if (newVal > btn.closest('.number-spinner').find('input').attr('max')) {
    btn.closest('.number-spinner').find('input').attr("value", btn.closest('.number-spinner').find('input').attr('max'));
  } else if (newVal < btn.closest('.number-spinner').find('input').attr('min')) {
    btn.closest('.number-spinner').find('input').attr("value", btn.closest('.number-spinner').find('input').attr('min'));
  } else {
    btn.closest('.number-spinner').find('input').attr("value", newVal);
  }
});

window.addEventListener("resize", function() {
  // if (window.innerWidth <= 767 || (window.innerWidth < window.innerHeight)) {
  //   swiper.slidesPerView = 1;
  // } else {
  //   swiper.slidesPerView = 3;
  // }
  // swiper.update();
  window.location.reload();
})

/*
//card cosmestics
$(document).on({
  mouseenter: function () {
    let imgurl = $(this).find('img').attr('src');
    $(".background").css('background-image',`url('${imgurl}')`);
    $(".background").css('background-size','15%');
    $(".background").css('filter',`blur(20px)`);
    $(".jumbotron h1").css('color','#353637');
  },
  mouseleave: function () {
    let imgurl2 = 'res/images/landing_background.png';
    $(".background").css('background-image',`url('${imgurl2}')`);
    $(".background").css('background-size','auto');
    $(".background").css('filter',`none`);
    $(".jumbotron h1").css('color','#f2e3bb');
  }
},'.card');
*/