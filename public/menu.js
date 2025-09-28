const hamburgerBtn = document.getElementById("hamburger-btn");
const mainNav = document.getElementById("main-nav");

hamburgerBtn.addEventListener("click", () => {
  mainNav.classList.toggle("active");
});
