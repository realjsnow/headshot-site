(function () {
  var quotes = document.querySelectorAll('#testimonials .quote');
  if (quotes.length < 2) return;

  var INTERVAL = 6000;
  var current = 0;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  setInterval(function () {
    quotes[current].classList.remove('is-active');
    current = (current + 1) % quotes.length;
    quotes[current].classList.add('is-active');
  }, INTERVAL);
})();
