/* ============================================================
   MusicLIM — Landing Page JavaScript
   ============================================================ */

'use strict';

// ── Config ────────────────────────────────────────────────────
const CONFIG = {
  SIGNUP_API:  'https://formspree.io/f/mzdkaeyp',
  COMMENT_API: 'https://formspree.io/f/xojpneyv',
  SITE_URL:    'https://musiclim.com',
  SITE_TITLE:  'MusicLIM — Own music. Really own it.',
  SHARE_TEXT:  'Just reserved my spot on MusicLIM 🎵 A marketplace for limited-edition audio tracks — artist-set prices, encrypted streaming, peer-to-peer resale. Only 500 early adopter spots.',
};

// ── State ─────────────────────────────────────────────────────
const state = {
  likedComments: JSON.parse(localStorage.getItem('ml_likes') || '{}'),
  hasSignedUp: localStorage.getItem('ml_signed_up') === '1',
};

// ── DOM Helpers ───────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const qs = (sel, ctx = document) => ctx.querySelector(sel);

function showToast(msg, duration = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

function setStatus(el, type, msg) {
  el.className = `form-status ${type}`;
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ── Nav scroll effect ─────────────────────────────────────────
const nav = $('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Waveform animation ────────────────────────────────────────
function buildWaveform() {
  const wf = $('waveform');
  if (!wf) return;
  const bars = 60;
  wf.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${bars * 16} 120`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:120px;opacity:.15';
  for (let i = 0; i < bars; i++) {
    const h = 20 + Math.random() * 80;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', i * 16 + 4);
    rect.setAttribute('y', 120 - h);
    rect.setAttribute('width', 8);
    rect.setAttribute('height', h);
    rect.setAttribute('rx', 4);
    rect.setAttribute('fill', '#7C3AED');
    const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    anim.setAttribute('attributeName', 'height');
    anim.setAttribute('values', `${h};${h * 0.4};${h}`);
    anim.setAttribute('dur', `${1.2 + Math.random() * 1.8}s`);
    anim.setAttribute('repeatCount', 'indefinite');
    anim.setAttribute('begin', `${Math.random() * 2}s`);
    rect.appendChild(anim);
    svg.appendChild(rect);
  }
  wf.appendChild(svg);
}
buildWaveform();

// ── Email submission ──────────────────────────────────────────
async function handleSignup(form, emailInputId, btnId, statusId) {
  const emailEl = $(emailInputId);
  const statusEl = $(statusId);
  const email = emailEl ? emailEl.value.trim() : form.querySelector('input[type="email"]').value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const el = statusEl || form.querySelector('.form-status');
    if (el) setStatus(el, 'error', 'Please enter a valid email address.');
    return;
  }

  if (state.hasSignedUp) {
    showToast('You\'re already signed up! Check your inbox.');
    return;
  }

  const btnText = form.querySelector('#btn-text') || form.querySelector('button[type="submit"]');
  const spinner = form.querySelector('#btn-spinner');
  if (btnText && btnText.id === 'btn-text') btnText.textContent = 'Reserving...';
  if (spinner) spinner.classList.remove('hidden');
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const response = await fetch(CONFIG.SIGNUP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, source: 'landing_page' }),
    });

    if (response.ok) {
      state.hasSignedUp = true;
      localStorage.setItem('ml_signed_up', '1');

      form.innerHTML = `
        <div class="form-status success" style="display:block;text-align:center;padding:18px;font-size:.95rem;">
          You're in. Check <strong>${email}</strong> to confirm your spot.
          <br/><span style="font-size:.82rem;opacity:.8;margin-top:6px;display:block">Click the verification link within 24 hours.</span>
        </div>`;

      showToast('Spot reserved. Check your inbox.', 5000);

      setTimeout(() => {
        const share = document.getElementById('share');
        if (share) share.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 1500);
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    const el = statusEl || form.querySelector('.form-status');
    if (el) {
      setStatus(el, 'error', err.message === 'Failed to fetch'
        ? 'No connection. Please try again in a moment.'
        : 'Something went wrong. Try again or email us at hello@musiclim.com');
    }
    if (submitBtn) submitBtn.disabled = false;
    if (btnText && btnText.id === 'btn-text') btnText.textContent = 'Reserve my spot';
    if (spinner) spinner.classList.add('hidden');
  }
}

// Attach both signup forms
$('signup-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  handleSignup($('signup-form'), 'email-input', 'submit-btn', 'form-status');
});
$('signup-form-2')?.addEventListener('submit', (e) => {
  e.preventDefault();
  handleSignup($('signup-form-2'), 'email-input-2', null, 'form-status-2');
});

// ── Share functionality ───────────────────────────────────────
function buildShareUrls() {
  const url = encodeURIComponent(CONFIG.SITE_URL);
  const text = encodeURIComponent(CONFIG.SHARE_TEXT);

  const tw = $('btn-share-twitter');
  if (tw) tw.href = `https://x.com/intent/tweet?text=${text}&url=${url}`;

  const wa = $('btn-share-whatsapp');
  if (wa) wa.href = `https://wa.me/?text=${text}%20${url}`;

  const li = $('btn-share-linkedin');
  if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
}
buildShareUrls();

// Native share button
$('btn-share-native')?.addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: CONFIG.SITE_TITLE,
        text: CONFIG.SHARE_TEXT,
        url: CONFIG.SITE_URL,
      });
      showToast('Thanks for sharing!');
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Condivisione annullata.');
    }
  } else {
    // Fallback: copy to clipboard
    copyToClipboard();
  }
});

// Copy link
function copyToClipboard() {
  const input = $('share-url');
  const label = $('copy-label');
  try {
    navigator.clipboard.writeText(CONFIG.SITE_URL).then(() => {
      if (label) label.textContent = 'Copied!';
      showToast('Link copied to clipboard');
      setTimeout(() => { if (label) label.textContent = 'Copy'; }, 2500);
    });
  } catch {
    if (input) { input.select(); document.execCommand('copy'); }
    showToast('Link copied!');
    if (label) { label.textContent = 'Copied!'; setTimeout(() => label.textContent = 'Copy', 2500); }
  }
}
$('btn-copy')?.addEventListener('click', copyToClipboard);
$('share-url')?.addEventListener('click', function () { this.select(); });

// ── Comment form ──────────────────────────────────────────────
const commentText = $('comment-text');
const charRemaining = $('char-remaining');
commentText?.addEventListener('input', () => {
  const left = 500 - commentText.value.length;
  if (charRemaining) charRemaining.textContent = left;
  if (left < 50) charRemaining.style.color = '#F87171';
  else charRemaining.style.color = '';
});

$('comment-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name  = $('comment-name').value.trim();
  const email = $('comment-email').value.trim();
  const text  = $('comment-text').value.trim();
  const statusEl = $('comment-status');

  if (!name || !email || !text) {
    setStatus(statusEl, 'error', 'Compila tutti i campi prima di inviare.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setStatus(statusEl, 'error', 'Inserisci un\'email valida (non pubblicata).');
    return;
  }

  const btn = qs('#comment-form button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Invio...';

  try {
    const response = await fetch(CONFIG.COMMENT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, comment: text, ts: new Date().toISOString() }),
    });

    if (response.ok) {
      setStatus(statusEl, 'success', 'Comment received. It will appear after review — thank you.');
      $('comment-form').reset();
      if (charRemaining) charRemaining.textContent = '500';

      // Optimistic: show pending comment in list
      appendPendingComment(name, text);
      showToast('Comment submitted, pending review.');
    } else {
      throw new Error('Server error');
    }
  } catch {
    setStatus(statusEl, 'error', 'Something went wrong. Try again or email us at hello@musiclim.com');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit comment';
  }
});

function appendPendingComment(name, text) {
  const list = $('comments-list');
  if (!list) return;
  const num = Math.floor(Math.random() * 9000) + 1000;
  const div = document.createElement('div');
  div.className = 'comment';
  div.style.opacity = '.6';
  div.innerHTML = `
    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7C3AED&color=fff&size=48" alt="${name}" width="48" height="48" style="border-radius:50%" />
    <div class="comment-body">
      <div class="comment-header">
        <strong>${escapeHtml(name)}</strong>
        <span class="comment-meta">Pending review</span>
      </div>
      <p>${escapeHtml(text)}</p>
    </div>`;
  list.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ── Like buttons ──────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.like-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  if (state.likedComments[id]) return; // already liked
  state.likedComments[id] = true;
  localStorage.setItem('ml_likes', JSON.stringify(state.likedComments));
  const countEl = btn.querySelector('.like-count');
  if (countEl) countEl.textContent = parseInt(countEl.textContent, 10) + 1;
  btn.classList.add('liked');
  showToast('👍 Thanks!', 1500);
});

// Restore liked state
document.querySelectorAll('.like-btn').forEach(btn => {
  if (state.likedComments[btn.dataset.id]) btn.classList.add('liked');
});

// ── Intersection Observer for animations ──────────────────────
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.step, .benefit-card, .trust-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    observer.observe(el);
  });
}

console.log('%c MusicLIM 🎵 ', 'background:#7C3AED;color:#fff;font-size:14px;padding:8px 16px;border-radius:8px;font-weight:bold;');
console.log('%c Early Access · musiclim.com ', 'color:#A855F7;font-size:11px;');
