let banner = document.querySelector('.banner');

document.addEventListener("DOMContentLoaded", function() {
    resizeBanner();
})

function resizeBanner() {
    let height = document.querySelector(".navbar").offsetHeight;
    banner.style.setProperty("margin-top", `${height - 25}px`)
}