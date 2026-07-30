(function () {
  var slider = document.getElementById('photo-slider');
  var track = document.getElementById('photo-track');
  if (!slider || !track) return;

  var offset = 0;
  var dragStartX = 0;
  var dragStartOffset = 0;
  var dragging = false;
  var moved = 0;
  var pointerId = null;

  function minOffset() {
    return Math.min(0, slider.clientWidth - track.scrollWidth);
  }

  function apply(settle) {
    track.classList.toggle('settling', !!settle);
    track.style.transform = 'translateX(' + offset + 'px)';
  }

  function clamp(value) {
    return Math.max(minOffset(), Math.min(0, value));
  }

  slider.addEventListener('pointerdown', function (e) {
    if (pointerId !== null) return;
    pointerId = e.pointerId;
    dragging = true;
    moved = 0;
    dragStartX = e.clientX;
    dragStartOffset = offset;
    slider.classList.add('dragging');
    slider.setPointerCapture(pointerId);
  });

  slider.addEventListener('pointermove', function (e) {
    if (!dragging || e.pointerId !== pointerId) return;
    var delta = e.clientX - dragStartX;
    moved = Math.max(moved, Math.abs(delta));
    offset = clamp(dragStartOffset + delta);
    apply(false);
  });

  function endDrag(e) {
    if (!dragging || (e && e.pointerId !== pointerId)) return;
    dragging = false;
    slider.classList.remove('dragging');
    if (pointerId !== null && slider.hasPointerCapture(pointerId)) {
      slider.releasePointerCapture(pointerId);
    }
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

  track.querySelectorAll('.photo img').forEach(function (img) {
    img.addEventListener('click', function () {
      // Ignore the click that ends a drag gesture.
      if (moved > 5) return;
      openLightbox(img);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();
