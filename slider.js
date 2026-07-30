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
  }

  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);

  window.addEventListener('resize', function () {
    offset = clamp(offset);
    apply(false);
  });

  // --- Lightbox ---
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var closeBtn = document.getElementById('lightbox-close');

  function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
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
