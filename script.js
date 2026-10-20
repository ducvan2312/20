/* ==========================================================
   Quà 20/10 cho Huyền Xinh gái — JavaScript thuần
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

  /* --- Hoa nở bung và mưa cánh hoa (vẽ trên canvas) --- */
  var blooms = [], petals = [];
  var BLOOM_COLORS = [['#ffd0e3', '#ff5c9d'], ['#ffb3d1', '#e0245e'], ['#fff0f6', '#ff8db8'], ['#ffe3a8', '#ff6fa5']];
  var PETAL_COLORS = ['#ff9ec7', '#ff6fa5', '#ffc4dc', '#ff3d85', '#ffd9e8'];

  function easeOutBack(x) {
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function bloom(x, y, size, delayMs) {
    if (!ctx) return;
    blooms.push({ x: x, y: y, size: size, t0: performance.now() + (delayMs || 0), c: pick(BLOOM_COLORS), rot: rand(0, 6.28) });
    if (blooms.length > 12) blooms.shift();
  }

  function petalRain(n) {
    if (!ctx) return;
    for (var i = 0; i < n && petals.length < 120; i++) {
      petals.push({
        x: rand(0, W), y: rand(-H * 0.5, -10),
        vy: rand(1.1, 2.4), vx: rand(-0.3, 0.3),
        rot: rand(0, 6.28), vr: rand(-0.05, 0.05),
        s: rand(7, 15), ph: rand(0, 6.28), c: pick(PETAL_COLORS)
      });
    }
  }

  function drawBlooms(now) {
    ctx.globalCompositeOperation = 'lighter';
    for (var i = blooms.length - 1; i >= 0; i--) {
      var b = blooms[i];
      var p = (now - b.t0) / 2400;
      if (p < 0) continue;
      if (p >= 1) { blooms.splice(i, 1); continue; }
      var open = easeOutBack(Math.min(1, p / 0.55));
      var fade = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
      var R = b.size * open;
      ctx.save();
      ctx.translate(b.x, b.y);
      for (var ring = 0; ring < 3; ring++) {
        var n = ring === 1 ? 10 : 8;
        var rr = R * (1 - ring * 0.26);
        var rot = b.rot + p * (ring % 2 ? -1 : 1) * 0.9 + ring * 0.3;
        for (var k = 0; k < n; k++) {
          ctx.save();
          ctx.rotate(rot + (k * 6.2832) / n);
          ctx.translate(0, -rr * 0.55);
          var g = ctx.createLinearGradient(0, rr * 0.5, 0, -rr * 0.5);
          g.addColorStop(0, b.c[1]);
          g.addColorStop(1, b.c[0]);
          ctx.globalAlpha = 0.5 * fade * (1 - ring * 0.18);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(0, 0, rr * 0.2, rr * 0.5, 0, 0, 6.2832);
          ctx.fill();
          ctx.restore();
        }
      }
      var cg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.28);
      cg.addColorStop(0, 'rgba(255,236,170,0.95)');
      cg.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.globalAlpha = fade;
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.28, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function drawPetals(dt) {
    for (var i = petals.length - 1; i >= 0; i--) {
      var q = petals[i];
      q.y += q.vy * dt;
      q.ph += 0.03 * dt;
      q.x += (q.vx + Math.sin(q.ph) * 0.9) * dt;
      q.rot += q.vr * dt;
      if (q.y > H + 20) { petals.splice(i, 1); continue; }
      var s = q.s;
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.rot);
      ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(q.ph * 1.3)));
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = q.c;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.7, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.9, -s * 0.5, 0, -s);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
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

    drawBlooms(now);
    drawPetals(dt);
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

  /* ---------------- Hình cầu ảnh 3D ----------------
     24 ảnh và 34 trái tim nằm trên mặt cầu (điểm Fibonacci), quay quanh trục
     nghiêng, chiếu phối cảnh: phía trước lớn và rõ, phía sau nhỏ và mờ.
     Kéo chuột / vuốt ngang để xoay. Lúc vào trang quả cầu "nở" bung ra. */
  var gGlobe = $('#globe');
  var G_EMOJI = ['🌹', '🌸', '💐', '🌷', '✨', '💖'];
  var gNodes = [], gRot = 0, gTilt = 0.38, gVel = 0, gT0 = 0, gLast = 0, gDrag = null;

  function fib(n, i) {
    var y = 1 - ((i + 0.5) * 2) / n;
    var r = Math.sqrt(Math.max(0, 1 - y * y));
    var a = i * 2.399963;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  }

  function smooth(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function buildGlobe() {
    var NP = 24, ND = 34, i, el;
    for (i = 0; i < NP; i++) {
      var k = i % 6;
      el = document.createElement('div');
      el.className = 'gn';
      el.innerHTML = '<div class="ph" data-emoji="' + G_EMOJI[k] + '"><img src="./images/p' + (k + 1) +
        '.jpg" alt="" width="360" height="360" draggable="false"></div>';
      gGlobe.appendChild(el);
      gNodes.push({ el: el, p: fib(NP, i), dot: false });
    }
    for (i = 0; i < ND; i++) {
      el = document.createElement('i');
      el.className = 'gd';
      el.textContent = '♥';
      gGlobe.appendChild(el);
      gNodes.push({ el: el, p: fib(ND, i + 0.37), dot: true });
    }
  }

  function gFrame(now) {
    requestAnimationFrame(gFrame);
    var dt = Math.min((now - gLast) / 1000, 0.05);
    gLast = now;
    if (document.hidden || document.body.classList.contains('lock')) return;

    var t = (now - gT0) / 1000;
    var op = Math.min(1, t / 2.6);                 // mở bung
    var eo = easeOutBack(op);
    gRot += (0.24 + (1 - op) * (1 - op) * 3 + gVel) * dt;
    gVel *= Math.pow(0.05, dt);                     // quán tính giảm dần

    var S = gGlobe.clientWidth || 300;
    var R = S * 0.4 * eo;
    var cr = Math.cos(gRot), sr = Math.sin(gRot), ct = Math.cos(gTilt), st = Math.sin(gTilt);
    var appear = Math.min(1, op * 2);

    for (var i = 0; i < gNodes.length; i++) {
      var n = gNodes[i], p = n.p;
      var x = p[0] * cr + p[2] * sr;
      var z0 = -p[0] * sr + p[2] * cr;
      var y = p[1] * ct - z0 * st;
      var z = p[1] * st + z0 * ct;
      var k = 4.2 / (4.2 - z);
      var depth = (z + 1) / 2;
      // mờ bớt phần đi ngang qua chữ ở giữa để chữ luôn đọc được
      var fade = 0.3 + 0.7 * smooth(0.25, 0.7, Math.sqrt(x * x + y * y));
      var o = (0.2 + 0.8 * Math.pow(depth, 0.9)) * fade * appear;
      var s = k * (n.dot ? 0.8 : 0.9);
      n.el.style.transform = 'translate3d(' + (x * R * k).toFixed(1) + 'px,' + (y * R * k).toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
      n.el.style.opacity = o.toFixed(3);
      n.el.style.zIndex = Math.round(depth * 100);
    }
  }

  if (gGlobe) {
    buildGlobe();
    gT0 = performance.now();
    gLast = gT0;
    requestAnimationFrame(gFrame);

    // kéo để xoay
    var gLX = 0, gLY = 0;
    gGlobe.addEventListener('pointerdown', function (e) {
      gDrag = true; gLX = e.clientX; gLY = e.clientY;
      if (gGlobe.setPointerCapture) { try { gGlobe.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ } }
    });
    gGlobe.addEventListener('pointermove', function (e) {
      if (!gDrag) return;
      var dx = e.clientX - gLX, dy = e.clientY - gLY;
      gLX = e.clientX; gLY = e.clientY;
      gRot += dx * 0.01;
      gVel = Math.max(-6, Math.min(6, gVel * 0.5 + dx * 0.5));
      gTilt = Math.max(-0.25, Math.min(0.95, gTilt + dy * 0.004));
    });
    function endDrag() { gDrag = null; }
    gGlobe.addEventListener('pointerup', endDrag);
    gGlobe.addEventListener('pointercancel', endDrag);

    // hoa nở bung phía sau quả cầu khi vào trang
    var stageEl = $('.stage');
    if (stageEl && ctx) {
      setTimeout(function () {
        var r = stageEl.getBoundingClientRect();
        bloom(r.left + r.width / 2, r.top + r.height / 2, r.width * 0.62);
        bloom(r.left + r.width / 2, r.top + r.height / 2, r.width * 0.42, 700);
      }, 350);
    }
  }

  /* ---------------- Bó hoa: hoa hồng nở từng lớp cánh ---------------- */
  // [x, y, kích thước, màu, độ trễ]
  var ROSES = [
    [200, 90, 84, '#ff4d7d', .30], [116, 136, 78, '#f06fa3', .22], [284, 136, 78, '#f06fa3', .26],
    [64, 206, 68, '#a8174a', .14], [336, 206, 68, '#a8174a', .18], [150, 176, 92, '#e0245e', .34],
    [250, 176, 92, '#ff8db8', .38], [200, 140, 86, '#d81b55', .42], [108, 254, 76, '#ff9cc2', .46],
    [292, 254, 76, '#e0245e', .50], [200, 224, 100, '#ff3b6b', .56], [146, 276, 62, '#ff7aa6', .60],
    [254, 276, 62, '#c61a50', .64]
  ];

  function petalSVG(a, cy, rx, ry, pd) {
    return '<g transform="rotate(' + a + ')"><g class="pt" style="--pd:' + pd.toFixed(2) + 's">' +
      '<ellipse cx="0" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="currentColor" stroke="#000" stroke-opacity=".3" stroke-width="1.5"/>' +
      '<ellipse cx="0" cy="' + (cy - ry * 0.45).toFixed(1) + '" rx="' + (rx * 0.55).toFixed(1) + '" ry="' + (ry * 0.38).toFixed(1) + '" fill="#fff" fill-opacity=".16"/>' +
      '</g></g>';
  }

  function roseLayers() {
    var s = '<circle r="30" fill="currentColor" opacity=".55"/>', a;
    for (a = 0; a < 5; a++) s += petalSVG(a * 72, -26, 22, 28, 0.44 + a * 0.05);       // vòng ngoài
    for (a = 0; a < 5; a++) s += petalSVG(a * 72 + 36, -19, 18, 23, 0.22 + a * 0.04);  // vòng giữa
    for (a = 0; a < 4; a++) s += petalSVG(a * 90 + 20, -12, 13, 17, a * 0.03);         // vòng trong
    return s + '<circle r="8" fill="#000" fill-opacity=".3"/><circle r="4" fill="#000" fill-opacity=".25"/>';
  }

  function buildRoses() {
    var host = $('#roses');
    if (!host) return;
    var stems = '', flowers = '';
    ROSES.forEach(function (r) {
      var x = r[0], y = r[1], d = r[4] * 1.5;
      var cx = (200 + x) / 2 + (x - 200) * 0.12, cy = (300 + y) / 2;
      stems += '<path class="stem" pathLength="1" style="--d:' + (d - 0.45).toFixed(2) + 's" d="M200,300 Q' +
        cx.toFixed(0) + ',' + cy.toFixed(0) + ' ' + x + ',' + y + '"/>';
      flowers += '<g transform="translate(' + x + ' ' + y + ') scale(' + (r[2] / 116).toFixed(3) + ')" style="color:' + r[3] +
        ';--d:' + d.toFixed(2) + 's"><g class="bud">' + roseLayers() + '</g></g>';
    });
    host.innerHTML = stems + flowers;
  }
  buildRoses();

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
    // nút luôn ghi cùng một dòng
    if (wishLabel) wishLabel.textContent = 'Ấn vào đây để xem tiếp';
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
    bloom(c.x, c.y - 30, Math.min(W, H) * 0.3);
    bloom(c.x, c.y - 30, Math.min(W, H) * 0.18, 450);
    setTimeout(function () {
      if (wishBtn.scrollIntoView) wishBtn.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
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
    // hoa nở bung nhiều chỗ + mưa cánh hoa
    var m = Math.min(W, H);
    bloom(W * 0.5, H * 0.42, m * 0.5, 100);
    bloom(W * 0.2, H * 0.24, m * 0.2, 500);
    bloom(W * 0.82, H * 0.3, m * 0.22, 800);
    bloom(W * 0.24, H * 0.76, m * 0.2, 1100);
    bloom(W * 0.8, H * 0.74, m * 0.22, 1400);
    petalRain(70);
    setTimeout(function () { petalRain(40); }, 2200);
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

  var H_WORDS = ['yêu em', 'Yêu Em', 'YÊU EM', 'Huyền Xinh gái'];
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

  function setSynth(on) {
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

  /* --- Nhạc từ file của bạn (tùy chọn) ---
     Bỏ file mp3 vào thư mục audio/ với đúng tên dưới đây.
     Không có file thì tự dùng giai điệu nhẹ tạo bằng Web Audio ở trên. */
  var AUDIO_SRC = './audio/unstoppable-aylex.mp3';
  var AUDIO_START = 0; // giây bắt đầu phát
  var AUDIO_END = 0;   // giây kết thúc đoạn lặp lại (0 = phát hết file rồi lặp)
  var track = null, trackBad = false;

  function getTrack() {
    if (track) return track;
    track = new Audio();
    track.preload = 'none';
    track.src = AUDIO_SRC;
    track.loop = !AUDIO_END;
    track.addEventListener('timeupdate', function () {
      if (AUDIO_END && track.currentTime >= AUDIO_END) track.currentTime = AUDIO_START;
    });
    return track;
  }

  function setMusic(on) {
    if (trackBad || !window.Audio) { setSynth(on); return; }
    var t = getTrack();
    if (!on) {
      t.pause();
      musicOn = false;
      updateMusicUI();
      return;
    }
    try {
      if (AUDIO_START && t.currentTime < AUDIO_START) t.currentTime = AUDIO_START;
      var pr = t.play();
      musicOn = true;
      updateMusicUI();
      if (pr && pr.catch) {
        pr.catch(function (err) {
          musicOn = false;
          updateMusicUI();
          if (err && err.name === 'NotAllowedError') {
            armGesture(); // trình duyệt chặn tự phát: phát ở lần chạm đầu tiên
            return;
          }
          // chưa có file hoặc không phát được: dùng giai điệu tự tạo
          trackBad = true;
          setSynth(true);
        });
      }
    } catch (err) {
      trackBad = true;
      setSynth(true);
    }
  }

  /* --- Tự phát nhạc khi vào web (không có nút) ---
     Trình duyệt thường chặn âm thanh tự phát cho tới khi người xem chạm vào
     trang. Vì vậy: thử phát ngay; nếu bị chặn thì phát ở lần chạm/bấm đầu tiên. */
  var gestureArmed = false;
  function armGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    var evs = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
    function go() {
      evs.forEach(function (e) { document.removeEventListener(e, go, true); });
      gestureArmed = false;
      if (!musicOn) setMusic(true);
      else if (ac && ac.state === 'suspended') ac.resume();
    }
    evs.forEach(function (e) { document.addEventListener(e, go, true); });
  }
  armGesture();
  setMusic(true);
})();
