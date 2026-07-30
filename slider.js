(function () {
  var slider = document.getElementById('photo-slider');
  var track = document.getElementById('photo-track');
  if (!slider || !track) return;

  var DRAG_THRESHOLD = 4;

  var offset = 0;
  var dragStartX = 0;
  var dragStartOffset = 0;
  var dragging = false;
  var captured = false;
  var moved = 0;
  var pointerId = null;

  function minOffset() {
    return Math.min(0, slider.clientWidth - track.scrollWidth);
  }

  function clamp(value) {
    return Math.max(minOffset(), Math.min(0, value));
  }

  function apply(settle) {
    track.classList.toggle('settling', !!settle);
    track.style.transform = 'translateX(' + offset + 'px)';
  }

  slider.addEventListener('pointerdown', function (e) {
    if (pointerId !== null) return;
    pauseAuto();
    pointerId = e.pointerId;
    dragging = true;
    captured = false;
    moved = 0;
    dragStartX = e.clientX;
    dragStartOffset = offset;
  });

  slider.addEventListener('pointermove', function (e) {
    if (!dragging || e.pointerId !== pointerId) return;
    var delta = e.clientX - dragStartX;
    moved = Math.max(moved, Math.abs(delta));

    // Only take pointer capture once this is clearly a drag, not a click.
    // Capturing on pointerdown would retarget the click event away from the
    // photo and break opening the lightbox.
    if (!captured && moved > DRAG_THRESHOLD) {
      captured = true;
      slider.setPointerCapture(pointerId);
      slider.classList.add('dragging');
    }

    if (!captured) return;
    offset = clamp(dragStartOffset + delta);
    apply(false);
  });

  function endDrag(e) {
    if (!dragging || (e && e.pointerId !== pointerId)) return;
    dragging = false;
    slider.classList.remove('dragging');
    if (captured && pointerId !== null && slider.hasPointerCapture(pointerId)) {
      slider.releasePointerCapture(pointerId);
    }
    captured = false;
    pointerId = null;
    offset = clamp(offset);
    apply(true);
    resumeAutoSoon();
  }

  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);

  window.addEventListener('resize', function () {
    offset = clamp(offset);
    apply(false);
  });

  // --- Auto-slide ---
  // Drifts back and forth on its own so the extra photos are discoverable,
  // and yields immediately to hover, drag, or an open lightbox.
  var SPEED = 16;          // px per second
  var RESUME_DELAY = 2500; // ms of stillness before it picks back up

  var autoOn = false;
  var autoDir = -1;
  var lastFrame = 0;
  var resumeTimer = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function pauseAuto() {
    autoOn = false;
    clearTimeout(resumeTimer);
  }

  function resumeAutoSoon() {
    clearTimeout(resumeTimer);
    if (reduceMotion.matches) return;
    resumeTimer = setTimeout(function () {
      lastFrame = 0;
      autoOn = true;
    }, RESUME_DELAY);
  }

  function tick(now) {
    requestAnimationFrame(tick);
    if (!autoOn || dragging) { lastFrame = now; return; }

    var min = minOffset();
    if (min === 0) return; // everything already fits, nothing to scroll

    var elapsed = lastFrame ? (now - lastFrame) : 0;
    lastFrame = now;
    if (elapsed > 100) return; // skip huge jumps after a background tab

    offset += autoDir * SPEED * (elapsed / 1000);

    if (offset <= min) {
      offset = min;
      autoDir = 1;
    } else if (offset >= 0) {
      offset = 0;
      autoDir = -1;
    }

    apply(false);
  }

  slider.addEventListener('pointerenter', pauseAuto);
  slider.addEventListener('pointerleave', resumeAutoSoon);

  requestAnimationFrame(tick);
  resumeAutoSoon();

  // --- Lightbox ---
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var closeBtn = document.getElementById('lightbox-close');

  function openLightbox(img) {
    pauseAuto();
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.getAttribute('data-caption') || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxImg.src = '';
    resumeAutoSoon();
  }

  // Delegated so it still fires if the browser retargets the click.
  slider.addEventListener('click', function (e) {
    if (moved > DRAG_THRESHOLD) return;
    var img = e.target.closest('.photo img');
    if (img) openLightbox(img);
  });

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();
