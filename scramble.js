(function () {
  var CHARS = '!<>-_\\/[]{}—=+*^?#';

  function TextScramble(el) {
    this.el = el;
    this.frame = 0;
    this.frameRequest = null;
    this.queue = [];
    this.resolve = null;
    this.update = this.update.bind(this);
  }

  TextScramble.prototype.setText = function (newText) {
    var self = this;
    var promise = new Promise(function (resolve) { self.resolve = resolve; });
    this.queue = [];
    for (var i = 0; i < newText.length; i++) {
      var start = Math.floor(i * 1.4) + Math.floor(Math.random() * 4);
      var end = start + 6 + Math.floor(Math.random() * 10);
      this.queue.push({ to: newText[i], start: start, end: end, char: '' });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  };

  TextScramble.prototype.update = function () {
    var output = '';
    var complete = 0;
    for (var i = 0; i < this.queue.length; i++) {
      var q = this.queue[i];
      if (this.frame >= q.end) {
        complete++;
        output += q.to;
      } else if (this.frame >= q.start) {
        if (!q.char || Math.random() < 0.3) {
          q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        output += q.char;
      } else {
        output += '';
      }
    }
    this.el.textContent = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-scramble]').forEach(function (el) {
      var finalText = el.textContent;
      new TextScramble(el).setText(finalText);
    });
  });
})();
