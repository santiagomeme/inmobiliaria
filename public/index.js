  const slides = document.querySelectorAll('.slides img');
  let index = 0;
  function showSlide() {
    slides.forEach((img,i)=> img.style.opacity=0);
    slides[index].style.opacity=1;
    index = (index + 1) % slides.length;
  }
  showSlide();
  setInterval(showSlide, 4000);