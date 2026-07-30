(function () {
  var btn = document.getElementById('text-btn');
  if (!btn) return;

  var label = btn.querySelector('.btn-text-label');
  var original = label.textContent;
  var resetTimer = null;

  // Stored as character codes so the number never appears in the page source,
  // where scrapers harvest it with a plain phone-number regex.
  var number = String.fromCharCode.apply(null, [43, 49, 55, 48, 50, 54, 48, 56, 49, 57, 53, 50]);

  btn.setAttribute('href', 'sms:' + number);

  // sms: links only resolve on devices with a messaging app registered for the
  // protocol. On desktop the click is silently ignored, so copy the number
  // instead of leaving a dead button.
  function isDesktop() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  function flash(message) {
    label.textContent = message;
    btn.classList.add('copied');
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () {
      label.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  }

  btn.addEventListener('click', function (e) {
    if (!isDesktop()) return; // let the sms: link open Messages on mobile

    e.preventDefault();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(number).then(
        function () { flash('Number copied'); },
        function () { flash('Copy failed'); }
      );
    } else {
      flash('Copy failed');
    }
  });
})();
