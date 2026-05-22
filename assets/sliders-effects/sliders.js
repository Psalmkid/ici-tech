/**
 * sliders.js — Reusable Slider & Carousel Components
 * Zero dependencies — pure vanilla JS.
 * Drop this file into any project alongside sliders.css
 *
 * Exports:
 *   HeroSlider       — Full-screen hero with autoplay, fade/slide
 *   ContentSlider    — Card/content carousel with drag support
 *   LogoTicker       — Infinite marquee (logos, text)
 *   TestimonialSlider— Testimonials with auto-cycling
 *   TabSlider        — Tab-based panel switcher
 */

/* ============================================================
   UTILITIES
   ============================================================ */
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
function mod(n, m) { return ((n % m) + m) % m; }

function addRipple(btn) {
  btn.addEventListener('click', (e) => {
    const r = document.createElement('span');
    r.classList.add('sb-ripple');
    const d = Math.max(btn.offsetWidth, btn.offsetHeight);
    const rect = btn.getBoundingClientRect();
    r.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX-rect.left-d/2}px;top:${e.clientY-rect.top-d/2}px`;
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
}

/* ============================================================
   1. HERO SLIDER
   ============================================================ */
export class HeroSlider {
  /**
   * @param {HTMLElement|string} el  — container (.sb-hero) or selector
   * @param {object} opts
   *   mode         'slide' | 'fade'   (default 'fade')
   *   autoplay     boolean            (default true)
   *   delay        ms                 (default 5000)
   *   pauseOnHover boolean            (default true)
   *   keyboard     boolean            (default true)
   */
  constructor(el, opts = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) return;

    this.opts = {
      mode: 'fade',
      autoplay: true,
      delay: 5000,
      pauseOnHover: true,
      keyboard: true,
      ...opts,
    };

    this.slides = [...this.el.querySelectorAll('.sb-hero__slide')];
    this.dots   = [...this.el.querySelectorAll('.sb-hero__dot')];
    this.track  = this.el.querySelector('.sb-hero__track');
    this.progress = this.el.querySelector('.sb-hero__progress');
    this.btnPrev = this.el.querySelector('.sb-hero__arrow--prev');
    this.btnNext = this.el.querySelector('.sb-hero__arrow--next');

    this.current = 0;
    this.timer   = null;
    this.progTimer = null;
    this.paused  = false;

    if (this.opts.mode === 'fade') this.el.classList.add('sb-hero--fade');

    this._bindEvents();
    this._goto(0, false);
    if (this.opts.autoplay) this._startAutoplay();
  }

  _goto(index, animate = true) {
    const prev = this.current;
    this.current = mod(index, this.slides.length);

    this.slides[prev]?.classList.remove('is-active');
    this.slides[this.current].classList.add('is-active');

    if (this.opts.mode === 'slide' && this.track) {
      const offset = -this.current * 100;
      this.track.style.transform = `translateX(${offset}%)`;
    }

    this.dots.forEach((d, i) => d.classList.toggle('is-active', i === this.current));
    this._resetProgress();
  }

  next() { this._goto(this.current + 1); }
  prev() { this._goto(this.current - 1); }

  _startAutoplay() {
    this._stopAutoplay();
    this._resetProgress();
    this.timer = setInterval(() => {
      if (!this.paused) this.next();
    }, this.opts.delay);
  }

  _stopAutoplay() {
    clearInterval(this.timer);
    clearInterval(this.progTimer);
  }

  _resetProgress() {
    if (!this.progress) return;
    clearInterval(this.progTimer);
    this.progress.style.transition = 'none';
    this.progress.style.width = '0%';
    requestAnimationFrame(() => {
      this.progress.style.transition = `width ${this.opts.delay}ms linear`;
      this.progress.style.width = '100%';
    });
  }

  _bindEvents() {
    this.btnPrev?.addEventListener('click', () => this.prev());
    this.btnNext?.addEventListener('click', () => this.next());

    this.dots.forEach((d, i) => d.addEventListener('click', () => this._goto(i)));

    if (this.opts.pauseOnHover) {
      this.el.addEventListener('mouseenter', () => { this.paused = true; });
      this.el.addEventListener('mouseleave', () => { this.paused = false; });
    }

    if (this.opts.keyboard) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });
    }

    // Touch swipe
    let startX = 0;
    this.el.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    this.el.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { dx < 0 ? this.next() : this.prev(); }
    });
  }

  destroy() { this._stopAutoplay(); }
}

/* ============================================================
   2. CONTENT SLIDER (drag / touch / arrow)
   ============================================================ */
export class ContentSlider {
  /**
   * @param {HTMLElement|string} el  — container (.sb-slider)
   * @param {object} opts
   *   perPage      number | {sm,md,lg}   slides visible (default 3)
   *   gap          px number              (default 24)
   *   autoplay     boolean                (default false)
   *   delay        ms                     (default 4000)
   *   loop         boolean                (default false)
   *   center       boolean                (default false)
   */
  constructor(el, opts = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) return;

    this.opts = {
      perPage: 3,
      gap: 24,
      autoplay: false,
      delay: 4000,
      loop: false,
      center: false,
      ...opts,
    };

    this.track  = this.el.querySelector('.sb-slider__track');
    this.slides = [...this.el.querySelectorAll('.sb-slider__slide')];
    this.btnPrev = this.el.querySelector('.sb-slider__arrow--prev');
    this.btnNext = this.el.querySelector('.sb-slider__arrow--next');
    this.dotsEl  = this.el.querySelector('.sb-slider__dots');

    this.current = 0;
    this._drag = { active: false, startX: 0, curX: 0, startOffset: 0 };

    this._resize();
    this._buildDots();
    this._bindEvents();
    this._update();

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.el);

    if (this.opts.autoplay) {
      setInterval(() => this.next(), this.opts.delay);
    }
  }

  get perPage() {
    const w = this.el.offsetWidth;
    const pp = this.opts.perPage;
    if (typeof pp === 'object') {
      if (w < 600) return pp.sm ?? 1;
      if (w < 900) return pp.md ?? 2;
      return pp.lg ?? 3;
    }
    return pp;
  }

  get maxIndex() {
    return Math.max(0, this.slides.length - this.perPage);
  }

  _resize() {
    const gap = this.opts.gap;
    const pp  = this.perPage;
    const slideW = (this.el.offsetWidth - gap * (pp - 1)) / pp;
    this.slides.forEach((s) => {
      s.style.flex = `0 0 ${slideW}px`;
    });
    this.track.style.gap = `${gap}px`;
    this.current = clamp(this.current, 0, this.maxIndex);
    this._update();
  }

  _buildDots() {
    if (!this.dotsEl) return;
    this.dotsEl.innerHTML = '';
    for (let i = 0; i <= this.maxIndex; i++) {
      const dot = document.createElement('button');
      dot.classList.add('sb-slider__dot');
      dot.addEventListener('click', () => this.goto(i));
      this.dotsEl.appendChild(dot);
    }
  }

  _update() {
    const gap  = this.opts.gap;
    const slideW = this.slides[0]?.offsetWidth ?? 0;
    const offset = this.current * (slideW + gap);
    this.track.style.transform = `translateX(-${offset}px)`;

    if (this.btnPrev) this.btnPrev.disabled = !this.opts.loop && this.current === 0;
    if (this.btnNext) this.btnNext.disabled = !this.opts.loop && this.current >= this.maxIndex;

    const dots = this.dotsEl?.querySelectorAll('.sb-slider__dot') ?? [];
    dots.forEach((d, i) => d.classList.toggle('is-active', i === this.current));
  }

  goto(i) {
    if (this.opts.loop) {
      this.current = mod(i, this.maxIndex + 1);
    } else {
      this.current = clamp(i, 0, this.maxIndex);
    }
    this._update();
  }

  next() { this.goto(this.current + 1); }
  prev() { this.goto(this.current - 1); }

  _bindEvents() {
    this.btnPrev?.addEventListener('click', () => this.prev());
    this.btnNext?.addEventListener('click', () => this.next());

    // Drag
    const track = this.track;
    const onStart = (x) => {
      this._drag.active = true;
      this._drag.startX = x;
      const mat = new WebKitCSSMatrix(getComputedStyle(track).transform);
      this._drag.startOffset = mat.m41;
      track.style.transition = 'none';
      this.el.classList.add('is-dragging');
    };
    const onMove = (x) => {
      if (!this._drag.active) return;
      const dx = x - this._drag.startX;
      track.style.transform = `translateX(${this._drag.startOffset + dx}px)`;
    };
    const onEnd = (x) => {
      if (!this._drag.active) return;
      this._drag.active = false;
      this.el.classList.remove('is-dragging');
      track.style.transition = '';
      const dx = x - this._drag.startX;
      if (Math.abs(dx) > 60) {
        dx < 0 ? this.next() : this.prev();
      } else {
        this._update();
      }
    };

    track.addEventListener('mousedown', (e) => onStart(e.clientX));
    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup',   (e) => onEnd(e.clientX));

    track.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove',  (e) => onMove(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend',   (e) => onEnd(e.changedTouches[0].clientX));

    // Keyboard
    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }
}

/* ============================================================
   3. LOGO TICKER (infinite marquee)
   ============================================================ */
export class LogoTicker {
  /**
   * @param {HTMLElement|string} el  — .sb-ticker container
   * @param {object} opts
   *   speed   px/s     (default 60)
   *   reverse boolean  (default false)
   *   gap     px       (default 64)
   */
  constructor(el, opts = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) return;

    this.opts = { speed: 60, reverse: false, gap: 64, ...opts };

    const inner = this.el.querySelector('.sb-ticker__inner');
    const track = inner?.querySelector('.sb-ticker__track');
    if (!inner || !track) return;

    // Clone track for seamless loop
    const clone = track.cloneNode(true);
    inner.appendChild(clone);

    // Set gap via CSS variable
    this.el.style.setProperty('--sb-ticker-gap', `${this.opts.gap}px`);

    if (this.opts.reverse) this.el.classList.add('sb-ticker--reverse');

    // Compute duration from content width / speed
    this._setSpeed();
    this._ro = new ResizeObserver(() => this._setSpeed());
    this._ro.observe(inner);
  }

  _setSpeed() {
    const inner = this.el.querySelector('.sb-ticker__inner');
    if (!inner) return;
    const trackW = inner.children[0]?.scrollWidth ?? 300;
    const dur = trackW / this.opts.speed;
    this.el.style.setProperty('--sb-ticker-speed', `${dur}s`);
  }

  setSpeed(pxPerSec) {
    this.opts.speed = pxPerSec;
    this._setSpeed();
  }
}

/* ============================================================
   4. TESTIMONIAL SLIDER
   ============================================================ */
export class TestimonialSlider {
  /**
   * @param {HTMLElement|string} el  — .sb-testimonial container
   * @param {object} opts
   *   autoplay    boolean  (default true)
   *   delay       ms       (default 6000)
   */
  constructor(el, opts = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) return;

    this.opts = { autoplay: true, delay: 6000, ...opts };

    this.track  = this.el.querySelector('.sb-testimonial__track');
    this.slides = [...this.el.querySelectorAll('.sb-testimonial__slide')];
    this.dotsEl = this.el.querySelector('.sb-slider__dots');
    this.current = 0;

    this._buildDots();
    this._update();

    if (this.opts.autoplay) {
      this._timer = setInterval(() => this.next(), this.opts.delay);
    }

    this.el.querySelector('.sb-slider__arrow--prev')?.addEventListener('click', () => this.prev());
    this.el.querySelector('.sb-slider__arrow--next')?.addEventListener('click', () => this.next());
  }

  _buildDots() {
    if (!this.dotsEl) return;
    this.dotsEl.innerHTML = '';
    this.slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.classList.add('sb-slider__dot');
      d.addEventListener('click', () => this.goto(i));
      this.dotsEl.appendChild(d);
    });
  }

  _update() {
    this.track.style.transform = `translateX(-${this.current * 100}%)`;
    const dots = [...(this.dotsEl?.querySelectorAll('.sb-slider__dot') ?? [])];
    dots.forEach((d, i) => d.classList.toggle('is-active', i === this.current));
  }

  goto(i) { this.current = mod(i, this.slides.length); this._update(); }
  next()   { this.goto(this.current + 1); }
  prev()   { this.goto(this.current - 1); }
}

/* ============================================================
   5. TAB SLIDER
   ============================================================ */
export class TabSlider {
  /**
   * @param {HTMLElement|string} nav  — .sb-tabs container
   * @param {HTMLElement|string} body — .sb-tab-panels container
   */
  constructor(nav, body) {
    this.nav  = typeof nav  === 'string' ? document.querySelector(nav)  : nav;
    this.body = typeof body === 'string' ? document.querySelector(body) : body;
    if (!this.nav || !this.body) return;

    this.tabs   = [...this.nav.querySelectorAll('.sb-tab')];
    this.panels = [...this.body.querySelectorAll('.sb-tab-panel')];

    this.tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => this.goto(i));
    });

    this.goto(0);
  }

  goto(i) {
    this.tabs.forEach((t, idx) => t.classList.toggle('is-active', idx === i));
    this.panels.forEach((p, idx) => p.classList.toggle('is-active', idx === i));
  }
}

/* ============================================================
   INIT HELPER — auto-init all [data-sb-*] elements
   ============================================================ */
export function initAll() {
  document.querySelectorAll('[data-sb-hero]').forEach((el) => {
    const opts = {};
    if (el.dataset.sbMode)    opts.mode    = el.dataset.sbMode;
    if (el.dataset.sbDelay)   opts.delay   = +el.dataset.sbDelay;
    if (el.dataset.sbAutoplay === 'false') opts.autoplay = false;
    new HeroSlider(el, opts);
  });

  document.querySelectorAll('[data-sb-slider]').forEach((el) => {
    const opts = {};
    if (el.dataset.sbPer)     opts.perPage = +el.dataset.sbPer;
    if (el.dataset.sbGap)     opts.gap     = +el.dataset.sbGap;
    if (el.dataset.sbLoop)    opts.loop    = el.dataset.sbLoop !== 'false';
    if (el.dataset.sbAutoplay !== undefined) opts.autoplay = el.dataset.sbAutoplay !== 'false';
    new ContentSlider(el, opts);
  });

  document.querySelectorAll('[data-sb-ticker]').forEach((el) => {
    const opts = {};
    if (el.dataset.sbSpeed)   opts.speed   = +el.dataset.sbSpeed;
    if (el.dataset.sbReverse) opts.reverse = el.dataset.sbReverse !== 'false';
    new LogoTicker(el, opts);
  });

  document.querySelectorAll('[data-sb-testimonial]').forEach((el) => {
    const opts = {};
    if (el.dataset.sbDelay) opts.delay = +el.dataset.sbDelay;
    new TestimonialSlider(el, opts);
  });
}

/* Auto-init if loaded as plain <script> (non-module) */
if (typeof window !== 'undefined' && document.currentScript && !document.currentScript.type?.includes('module')) {
  document.addEventListener('DOMContentLoaded', initAll);
}
