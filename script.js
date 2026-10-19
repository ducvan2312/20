/* ==========================================================
   Quà 20/10 cho Huyền — JavaScript thuần
   Tim rơi như tuyết, pháo hoa, bấm 2 lần ra bó hoa, nhạc
   ========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function $(sel) { return document.querySelector(sel); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------------- Chữ nền chạy: lặp chữ để vòng lặp liền mạch ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.mq-track'), function (track) {
    var txt = track.getAttribute('data-text') || '';
    var s = '';
    for (var i = 0; i < 4; i++) s += txt + '   ';
    for (var k = 0; k < 2; k++) {
      var sp = document.createElement('span');
      sp.textContent = s;
      track.appendChild(sp);
    }
  });

  /* ---------------- Canvas: tim rơi như tuyết + pháo hoa ---------------- */
  var canvas = $('#fx');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var W = window.innerWidth, H = window.innerHeight, dpr = 1;
  var flakes = [], sparks = [], pops = [], sprites = [];
  var raf = 0, last = 0, tick = 0;
  var HEART_COLORS = ['#ff6fa5', '#ff3d85', '#ffb3d1', '#ff8fb8', '#ffd9e8', '#e8467c'];
  var FW_COLORS = ['#ff5c9d', '#ff2e63', '#ffd27a', '#c084fc', '#ff9ec7', '#ffb347'];

  function makeSprite(color) {
    var s = 64;
    var c = document.createElement('canvas');
    c.width = s; c.height = s;
    var g = c.getContext('2d');
    g.translate(s / 2, s / 2 + 2);
    g.fillStyle = color;
    g.shadowColor = color;
    g.shadowBlur = 10;
    g.beginPath();
    g.moveTo(0, 20);
    g.bezierCurveTo(-34, -2, -22, -26, 0, -9);
    g.bezierCurveTo(22, -26, 34, -2, 0, 20);
    g.closePath();
    g.fill();
    return c;
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setFlakeCount();
  }

  function newFlake(initial) {
    var size = rand(7, 22);
    var up = Math.random() < 0.14; // một ít tim bay ngược lên
    var f = {
      x0: rand(0, W),
      y: initial ? rand(0, H) : (up ? H + 30 : -30),
      s: size,
      vy: rand(0.35, 1.05) * (size / 14 + 0.4) * (up ? -0.8 : 1),
      amp: rand(10, 40),
      ph: rand(0, 6.28),
      fq: rand(0.4, 1.1),
      a: rand(0.35, 0.9),
      sp: pick(sprites)
    };
    return f;
  }

  function setFlakeCount() {
    var n = Math.round(Math.min(70, Math.max(34, (W * H) / 14000)));
    if (reduce) n = Math.min(n, 26);
    while (flakes.length < n) flakes.push(newFlake(true));
    while (flakes.length > n) flakes.pop();
  }

  function burst(x, y, n) {
    if (!ctx || reduce) return; // pháo hoa chớp sáng: tắt khi bật "giảm chuyển động"
    var count = n || 40;
    var c1 = pick(FW_COLORS), c2 = pick(FW_COLORS);
    for (var i = 0; i < count && sparks.length < 320; i++) {
      var a = (Math.PI * 2 * i) / count + rand(-0.1, 0.1);
      var s = rand(1.2, 4.2);
      sparks.push({
        x: x, y: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 1, decay: rand(0.012, 0.022),
        size: rand(1.2, 2.6),
        color: i % 2 ? c1 : c2
      });
    }
  }

  function popHearts(x, y, n) {
    if (!ctx) return;
    for (var i = 0; i < n && pops.length < 80; i++) {
      var a = rand(0, Math.PI * 2);
      var s = rand(1.5, 5);
      pops.push({
        x: x, y: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.2,
        life: 1, decay: rand(0.012, 0.024),
        s: rand(12, 26), sp: pick(sprites)
      });
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 16.667, 3);
    if (!isFinite(dt) || dt < 0) dt = 1;
    last = now;
    tick += dt;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    // Tim rơi như tuyết
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.vy * dt;
      if (f.vy > 0 && f.y > H + 30) flakes[i] = f = newFlake(false);
      else if (f.vy < 0 && f.y < -30) flakes[i] = f = newFlake(false);
      var x = f.x0 + Math.sin(tick * 0.02 * f.fq + f.ph) * f.amp;
      var r = Math.sin(tick * 0.015 * f.fq + f.ph + 1) * 0.5;
      ctx.globalAlpha = f.a;
      ctx.save();
      ctx.translate(x, f.y);
      ctx.rotate(r);
      ctx.drawImage(f.sp, -f.s / 2, -f.s / 2, f.s, f.s);
      ctx.restore();
    }

    // Tim bung ra khi bấm
    for (var j = pops.length - 1; j >= 0; j--) {
      var p = pops[j];
      p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.04;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) { pops.splice(j, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.life * 1.4);
      ctx.drawImage(p.sp, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    }

    // Pháo hoa
    ctx.globalCompositeOperation = 'lighter';
    for (var k = sparks.length - 1; k >= 0; k--) {
      var q = sparks[k];
      q.vx *= 0.985; q.vy = q.vy * 0.985 + 0.03;
      q.x += q.vx * dt; q.y += q.vy * dt;
      q.life -= q.decay * dt;
      if (q.life <= 0) { sparks.splice(k, 1); continue; }
      ctx.globalAlpha = Math.max(0, Math.min(1, q.life));
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function startLoop() {
    if (!ctx || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function autoFireworks() {
    if (!document.hidden) burst(rand(W * 0.08, W * 0.92), rand(H * 0.08, H * 0.5), W < 700 ? 26 : 40);
    setTimeout(autoFireworks, rand(2200, 4200));
  }

  if (ctx) {
    HEART_COLORS.forEach(function (c) { sprites.push(makeSprite(c)); });
    resizeCanvas();
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(resizeCanvas, 150);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else startLoop();
    });
    startLoop(); // tim rơi luôn chạy (nhẹ nhàng)
    if (!reduce) setTimeout(autoFireworks, 1200);
  }

  /* ---------------- Ảnh vòng tròn: dự phòng khi ảnh lỗi ---------------- */
  function markFailed(img) {
    var box = img.parentNode;
    if (box) box.classList.add('img-fail');
    if (box) box.removeChild(img);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.ph img'), function (img) {
    img.addEventListener('error', function () { markFailed(img); });
  });
  window.addEventListener('load', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.ph img'), function (img) {
      if (img.complete && img.naturalWidth === 0) markFailed(img);
    });
  });

  /* ---------------- Lời chúc: bấm lần 1 xem lời chúc, bấm lần 2 ra bó hoa ---------------- */
  var wish = $('#wish');
  var wishBtn = $('#wishBtn');
  var wishLabel = $('#wishLabel');
  var wishIcon = $('#wishIcon');
  var bq = $('#bouquet');
  var bqClose = $('#bqClose');
  var state = 0;            // 0: chưa mở, 1: đã xem lời chúc, 2: đang xem bó hoa
  var seenBouquet = false;
  var closeTimer = 0;

  function setLabel() {
    if (!wishLabel) return;
    if (state === 0) {
      wishLabel.textContent = 'Ấn vào đây để xem lời chúc';
      wishIcon.textContent = '👆';
    } else if (!seenBouquet) {
      wishLabel.textContent = 'Ấn thêm lần nữa để nhận bó hoa 20/10';
      wishIcon.textContent = '💐';
    } else {
      wishLabel.textContent = 'Xem lại bó hoa 20/10';
      wishIcon.textContent = '💐';
    }
  }

  function btnCenter() {
    var r = wishBtn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function openWish() {
    state = 1;
    wish.classList.add('open');
    wishBtn.setAttribute('aria-expanded', 'true');
    setLabel();
    var c = btnCenter();
    popHearts(c.x, c.y, 18);
    burst(c.x, Math.max(80, c.y - 120), 36);
    setTimeout(function () {
      if (wishBtn.scrollIntoView) wishBtn.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }, 300);
  }

  function openBouquet() {
    clearTimeout(closeTimer);
    state = 2;
    seenBouquet = true;
    bq.hidden = false;
    document.body.classList.add('lock');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { bq.classList.add('show'); });
    });
    if (bqClose) bqClose.focus();
    burst(W * 0.25, H * 0.3, 44);
    burst(W * 0.75, H * 0.3, 44);
    setTimeout(function () { burst(W * 0.5, H * 0.2, 50); }, 350);
    popHearts(W / 2, H * 0.5, 28);
  }

  // toHeart = true: chuyển thẳng sang trái tim chữ (giữ khóa cuộn trang)
  function closeBouquet(toHeart) {
    if (!bq || bq.hidden) return;
    bq.classList.remove('show');
    clearTimeout(closeTimer);
    if (toHeart === true) {
      state = 3;
      closeTimer = setTimeout(function () { bq.hidden = true; }, 480);
      openHeart();
      return;
    }
    document.body.classList.remove('lock');
    state = 1;
    setLabel();
    closeTimer = setTimeout(function () {
      bq.hidden = true;
      if (wishBtn) wishBtn.focus();
    }, 480);
  }

  if (wishBtn) {
    wishBtn.addEventListener('click', function () {
      if (state === 0) openWish();
      else if (state === 1) openBouquet();
    });
  }

  if (bq) {
    Array.prototype.forEach.call(bq.querySelectorAll('[data-close]'), function (el) {
      el.addEventListener('click', function () { closeBouquet(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (heartOpen) closeHeart();
      else closeBouquet(false);
    }
  });

  /* ---------------- Trái tim chữ "yêu em" (chuyển từ bản Pygame) ----------------
     Viền tim hiện dần trước, sau đó lấp đầy bên trong, chữ nhấp nháy nhẹ,
     cuối cùng hiện dòng chữ giữa tim. Mỗi chữ được vẽ sẵn một lần (sprite)
     rồi chỉ drawImage mỗi khung hình nên chạy nhẹ trên điện thoại. */
  var hs = $('#heartScene');
  var hc = $('#heartCanvas');
  var hx = hc && hc.getContext ? hc.getContext('2d') : null;
  var hsClose = $('#hsClose');
  var bqNext = $('#bqNext');

  var H_WORDS = ['yêu em', 'Yêu Em', 'YÊU EM', 'Huyền'];
  var H_COLORS = ['#ff6fa5', '#ff3d85', '#ffb3d1', '#ff8fb8', '#ff5c9d', '#ffd0e3'];
  var H_CENTER = 'Anh yêu em';
  var FONT_BODY = '"Be Vietnam Pro", Arial, sans-serif';
  var FONT_SERIF = '"Playfair Display", Georgia, serif';

  var hp = [], hRaf = 0, hLast = 0, hFrame = 0, hTimer = 0, hResizeT = 0;
  var hW = 0, hH = 0, hDpr = 1, hScale = 20, hCx = 0, hCy = 0, hFillStart = 0;
  var heartOpen = false;

  function heartXY(t) {
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [x, -y];
  }

  function wordSprite(word, color, px) {
    var font = '600 ' + px.toFixed(1) + 'px ' + FONT_BODY;
    var c = document.createElement('canvas');
    var g = c.getContext('2d');
    g.font = font;
    var pad = Math.ceil(px * 1.1);
    var w = Math.ceil(g.measureText(word).width) + pad * 2;
    var h = Math.ceil(px * 1.4) + pad * 2;
    c.width = Math.ceil(w * hDpr);
    c.height = Math.ceil(h * hDpr);
    g = c.getContext('2d');
    g.scale(hDpr, hDpr);
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = color;
    g.shadowColor = color;
    g.shadowBlur = px * 0.7;
    g.fillText(word, w / 2, h / 2);
    g.shadowBlur = px * 0.25;
    g.fillText(word, w / 2, h / 2);
    g.shadowBlur = 0;
    g.fillText(word, w / 2, h / 2);
    return { c: c, w: w, h: h };
  }

  function tooClose(list, x, y, gap) {
    for (var i = 0; i < list.length; i++) {
      var dx = x - list[i][0], dy = y - list[i][1];
      if (dx * dx + dy * dy < gap * gap) return true;
    }
    return false;
  }

  function buildHeart() {
    if (!hx) return;
    hDpr = Math.min(window.devicePixelRatio || 1, 2);
    hW = hc.clientWidth || window.innerWidth;
    hH = hc.clientHeight || window.innerHeight;
    hc.width = Math.round(hW * hDpr);
    hc.height = Math.round(hH * hDpr);
    hx.setTransform(hDpr, 0, 0, hDpr, 0, 0);

    // Chừa chỗ cho dòng chú thích và nút đóng ở dưới
    var areaH = Math.max(160, hH - 150);
    hScale = Math.max(6, Math.min(hW * 0.88 / 33, areaH / 30));
    hCx = hW / 2;
    hCy = 16 + areaH / 2 - 2.5 * hScale;

    var cache = {};
    function sprite(word, color, px) {
      var k = word + color + px.toFixed(1);
      return cache[k] || (cache[k] = wordSprite(word, color, px));
    }
    function make(x, y, delay, px) {
      var q = pick([0.9, 1, 1.1]);
      var s = sprite(pick(H_WORDS), pick(H_COLORS), px * q);
      return { x: x, y: y, delay: delay, alpha: 0, fl: rand(0, 6.2832), sp: s };
    }

    var outlinePx = Math.max(11, hScale);
    var fillPx = Math.max(9.5, hScale * 0.85);
    hp = [];

    // Viền tim
    var placed = [], n = 160, last = 0, i;
    for (i = 0; i < n; i++) {
      var t = (i / n) * 2 * Math.PI;
      var b = heartXY(t);
      var sx = hCx + b[0] * hScale, sy = hCy + b[1] * hScale;
      if (tooClose(placed, sx, sy, 1.5 * hScale)) continue;
      placed.push([sx, sy]);
      hp.push(make(sx, sy, i * 1.6, outlinePx));
      last = i;
    }
    hFillStart = last * 1.6 + 30;

    // Phần lấp đầy bên trong
    placed = [];
    var count = 0, attempts = 0, maxA = 130 * 80;
    while (count < 130 && attempts < maxA) {
      attempts++;
      var tt = rand(0, 2 * Math.PI);
      var r = rand(0, 0.86);
      var bb = heartXY(tt);
      var fx = hCx + bb[0] * r * hScale, fy = hCy + bb[1] * r * hScale;
      if (tooClose(placed, fx, fy, 2.3 * hScale)) continue;
      placed.push([fx, fy]);
      hp.push(make(fx, fy, hFillStart + Math.floor(rand(0, 320)), fillPx));
      count++;
    }
  }

  function heartFrame(now) {
    hRaf = requestAnimationFrame(heartFrame);
    var dt = Math.min((now - hLast) / 16.667, 3);
    if (!isFinite(dt) || dt < 0) dt = 1;
    hLast = now;
    hFrame += dt;

    hx.globalAlpha = 1;
    hx.clearRect(0, 0, hW, hH);

    for (var i = 0; i < hp.length; i++) {
      var p = hp[i];
      if (hFrame > p.delay && p.alpha < 255) {
        p.alpha = Math.min(255, p.alpha + (14 + Math.random() * 4) * dt);
      }
      var flick = (p.alpha >= 255 && !reduce) ? 0.75 + 0.25 * Math.sin(hFrame * 0.04 + p.fl) : 1;
      var a = (p.alpha / 255) * flick;
      if (a <= 0.01) continue;
      hx.globalAlpha = a;
      hx.drawImage(p.sp.c, p.x - p.sp.w / 2, p.y - p.sp.h / 2, p.sp.w, p.sp.h);
    }

    // Dòng chữ giữa tim
    var cs = hFillStart + 200;
    if (hFrame > cs) {
      var pr = Math.min(1, (hFrame - cs) / 60);
      var ca = 1 - Math.exp(-pr * 8);
      var pulse = 1 + 0.025 * Math.sin(hFrame * 0.05);
      var fs = Math.max(26, hScale * 2.7);

      hx.save();
      hx.translate(hCx, hCy);
      // nền tối mờ để chữ giữa nổi bật trên các chữ nhỏ
      var gr = hx.createRadialGradient(0, 0, 0, 0, 0, fs * 3);
      gr.addColorStop(0, 'rgba(13,4,16,0.6)');
      gr.addColorStop(1, 'rgba(13,4,16,0)');
      hx.globalAlpha = ca;
      hx.fillStyle = gr;
      hx.fillRect(-fs * 3, -fs * 3, fs * 6, fs * 6);

      hx.scale(pulse, pulse);
      hx.font = '800 ' + fs.toFixed(1) + 'px ' + FONT_SERIF;
      hx.textAlign = 'center';
      hx.textBaseline = 'middle';
      hx.fillStyle = '#fff0f6';
      hx.shadowColor = '#ff4d8d';
      hx.shadowBlur = hScale * 1.4;
      hx.fillText(H_CENTER, 0, 0);
      hx.shadowBlur = 0;
      hx.fillText(H_CENTER, 0, 0);
      hx.restore();
    }
    hx.globalAlpha = 1;
  }

  function openHeart() {
    if (!hs || !hx) return;
    heartOpen = true;
    clearTimeout(hTimer);
    hs.hidden = false;
    document.body.classList.add('lock', 'heart-on');
    buildHeart();
    hFrame = 0;
    hLast = performance.now();
    if (!hRaf) hRaf = requestAnimationFrame(heartFrame);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hs.classList.add('show'); });
    });
    if (hsClose) hsClose.focus();
  }

  function closeHeart() {
    if (!hs || hs.hidden) return;
    heartOpen = false;
    hs.classList.remove('show');
    document.body.classList.remove('lock', 'heart-on');
    state = 1;
    setLabel();
    clearTimeout(hTimer);
    hTimer = setTimeout(function () {
      hs.hidden = true;
      cancelAnimationFrame(hRaf);
      hRaf = 0;
      if (wishBtn) wishBtn.focus();
    }, 620);
  }

  if (!hx && bqNext) bqNext.style.display = 'none';
  if (bqNext) bqNext.addEventListener('click', function () { closeBouquet(true); });
  if (hsClose) hsClose.addEventListener('click', closeHeart);
  window.addEventListener('resize', function () {
    if (!heartOpen) return;
    clearTimeout(hResizeT);
    hResizeT = setTimeout(function () {
      buildHeart();
      hFrame = hFillStart + 400; // vẽ sẵn đầy đủ sau khi đổi kích thước
    }, 200);
  });

  /* ---------------- Nhạc (Web Audio API) ---------------- */
  var AC = window.AudioContext || window.webkitAudioContext;
  var ac = null, master = null, musicOn = false, mTimer = 0, nextT = 0, step = 0;
  var musicBtn = $('#musicBtn');
  var musicLabel = $('#musicLabel');
  // La thứ - Fa - Đô - Sol
  var CHORDS = [
    [220.00, 261.63, 329.63, 440.00],
    [174.61, 220.00, 261.63, 349.23],
    [261.63, 329.63, 392.00, 523.25],
    [196.00, 246.94, 293.66, 392.00]
  ];
  var PATTERN = [0, 1, 2, 3, 2, 1, 2, 1];

  function playNote(freq, t, dur, vol, type) {
    var o = ac.createOscillator();
    var g = ac.createGain();
    o.type = type || 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function schedule() {
    if (!musicOn || !ac) return;
    while (nextT < ac.currentTime + 0.8) {
      var chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
      var k = step % 8;
      playNote(chord[PATTERN[k]], nextT, 1.1, 0.09);
      if (k === 0) playNote(chord[0] / 2, nextT, 2.6, 0.12, 'sine');
      if (k === 4) playNote(chord[2] * 2, nextT, 0.9, 0.035, 'sine');
      nextT += 0.42;
      step++;
    }
    mTimer = setTimeout(schedule, 250);
  }

  function updateMusicUI() {
    if (!musicBtn) return;
    musicBtn.classList.toggle('on', musicOn);
    musicBtn.setAttribute('aria-pressed', musicOn ? 'true' : 'false');
    if (musicLabel) musicLabel.textContent = musicOn ? 'Tắt nhạc' : 'Bật nhạc';
  }

  function setMusic(on) {
    if (!AC) return;
    try {
      if (on) {
        if (!ac) ac = new AC();
        master = ac.createGain();
        master.gain.value = 0.9;
        master.connect(ac.destination);
        ac.resume();
        musicOn = true;
        nextT = ac.currentTime + 0.1;
        step = 0;
        schedule();
      } else {
        musicOn = false;
        clearTimeout(mTimer);
        if (ac && master) {
          var m = master;
          m.gain.cancelScheduledValues(ac.currentTime);
          m.gain.setTargetAtTime(0, ac.currentTime, 0.05);
          setTimeout(function () {
            try { m.disconnect(); } catch (e) { /* bỏ qua */ }
            if (!musicOn && ac) ac.suspend();
          }, 300);
        }
      }
    } catch (err) {
      musicOn = false;
    }
    updateMusicUI();
  }

  if (musicBtn) {
    if (!AC) musicBtn.style.display = 'none';
    musicBtn.addEventListener('click', function () { setMusic(!musicOn); });
  }
})();
