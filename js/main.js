let btnClicked = false;
//hamburger
$(document).ready(function(){
	$('.navbar-toggler').click(function(){
    btnClicked = !btnClicked;
		$('#nav-icon3').toggleClass('open');
	});
});

//hide navbar
let prevScrollpos = window.pageYOffset;
window.onscroll = function() {
  let currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.querySelector(".navbar").style.top="0";
} else {
  if (btnClicked){    
    $('#nav-icon3').click();
  }
    document.querySelector(".navbar").style.top="-20vh";
}
  prevScrollpos = currentScrollPos;
}