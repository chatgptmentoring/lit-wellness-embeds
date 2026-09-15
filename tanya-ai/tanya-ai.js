/* =====================================================================
   Tanya AI — chat widget for litwellnesssolutions.com (Wix)

   Install once, site-wide: Wix Dashboard -> Settings -> Custom Code ->
   + Add Custom Code -> paste, "All pages", "Load code once", "Body - end":

   <script src="https://chatgptmentoring.github.io/lit-wellness-embeds/tanya-ai/tanya-ai.js"
           data-endpoint="https://xagfmcbpqpkfrtqkwjzg.supabase.co/functions/v1/tanya-chat"
           defer></script>

   Options (data- attributes on the script tag):
     data-endpoint   required — the tanya-chat Edge Function URL
     data-nudge      seconds before the friendly greeting pops up (default 45, 0 = off)
     data-inline     CSS selector: render a full chat panel inside that element
                     instead of the floating bubble

   No keys live here. The OpenAI key and the book stay in Supabase.
   ===================================================================== */
(function () {
  'use strict';

  if (window.__TANYA_AI_LOADED__) return;
  window.__TANYA_AI_LOADED__ = true;

  var script = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="tanya-ai.js"]');
    return s[s.length - 1];
  })();
  if (!script) return;

  var BASE = script.src.replace(/tanya-ai\.js(\?.*)?$/, '');
  var ENDPOINT = script.getAttribute('data-endpoint') || '';
  var NUDGE_MS = Math.max(0, parseInt(script.getAttribute('data-nudge') || '45', 10)) * 1000;
  var INLINE_SEL = script.getAttribute('data-inline') || '';
  var INSIDE_IFRAME = window.self !== window.top;

  var STORE = 'tanya_ai_v2';
  var NUDGE_KEY = 'tanya_ai_nudged_v2';
  var MAX_STORED = 30;

  var AVATAR = 'https://static.wixstatic.com/media/dca1c2_ad3d1a3d26ad4ec2a3238ed019a9763a~mv2.jpg/v1/fill/w_132,h_132,al_t,q_85,enc_auto/tanya.jpg';
  var SITE = 'https://www.litwellnesssolutions.com';

  var CTA = {
    BOOK_LINK:         { label: 'Get “Food Isn’t the Problem”', icon: 'book',   url: 'https://www.amazon.com/Food-Isnt-Problem-Understanding-Emotional/dp/B0HHCBCQGB/', kind: 'primary' },
    JOURNAL_LINK:      { label: 'The Mindful Me Journey',                  icon: 'journal', url: SITE + '/the-mindful-me-journey', kind: 'soft' },
    CTA_MINDFUL:       { label: 'The 5-Week Mindful Me Program',           icon: 'leaf',   url: SITE + '/mindful-coaching-program', kind: 'blue' },
    CTA_INTENSIVE:     { label: 'The 4-Month Coaching Intensive',          icon: 'leaf',   url: SITE + '/coaching-intensive', kind: 'blue' },
    CTA_STRATEGY_CALL: { label: 'Schedule a Free Strategy Session',        icon: 'call',   url: 'https://secure.gethealthie.com/appointments/embed_appt?dietitian_id=420052&require_offering=true&offering_id=76499&hide_package_images=false&primary_color=355d80', kind: 'primary' },
    CTA_INSURANCE:     { label: 'Check Your Insurance Coverage',           icon: 'shield', url: 'https://signup.faynutrition.com/book/tanya-jolliffe/ddfa1a', kind: 'blue' },
    CTA_RESOURCES:     { label: 'Free Tools',                              icon: 'spark',  url: SITE + '/free-resources', kind: 'soft' }
  };

  var ICONS = {
    book:    '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
    journal: '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M9 7h6M9 11h6"/>',
    leaf:    '<path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z"/><path d="M5 19l7-7"/>',
    call:    '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    shield:  '<path d="M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6z"/>',
    spark:   '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    chat:    '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>',
    send:    '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
    close:   '<path d="M18 6 6 18M6 6l12 12"/>',
    reset:   '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  var STARTERS = [
    { label: 'What is emotional eating, really?', prompt: 'What is emotional eating, really? How do I know if that’s what I’m doing?' },
    { label: 'Tell me about your new book',        prompt: 'Tell me about your new book, Food Isn’t the Problem. Who is it for?' },
    { label: 'I’m craving something right now', prompt: 'I’m having a craving right now and I’d love some help figuring out what’s going on.' },
    { label: 'Which program is right for me?',     prompt: 'I’m thinking about working with you. What are my options, and how do I know which one fits?' }
  ];

  var NUDGES = [
    { match: 'coaching-intensive',       text: 'Curious about the **4-month Intensive**? I can answer the real questions — like whether you actually need it — before you book anything.' },
    { match: 'mindful-coaching-program', text: 'The **5-week Mindful Me program** is the gentlest on-ramp. Want help figuring out if it fits where you are?' },
    { match: 'the-mindful-me-journey',   text: 'Wondering how the journal works day to day? Ask me — I can walk you through Phase One.' },
    { match: 'free-resources',           text: 'Not sure which free tool to start with? Tell me what’s going on and I’ll point you to the one that helps most.' },
    { match: 'mindful-eating',           text: 'Here’s a question to start: *are you hungry, or are you feeling something?* I can help you tell the difference.' },
    { match: 'contact',                  text: 'Before you reach out — can I help with something quick? Sometimes five minutes here answers it.' },
    { match: '',                         text: 'Hi, I’m Tanya’s AI coach 🤍 I’m trained on her new book, *Food Isn’t the Problem*. Want to chat about what brought you here?' }
  ];

  /* ---------------- Utilities ---------------- */
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function sget(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function newId() {
    var a = new Uint8Array(12);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function isInternal(url) { return url.indexOf(SITE) === 0; }
  function linkTarget(url) {
    if (!isInternal(url)) return ' target="_blank" rel="noopener noreferrer"';
    return INSIDE_IFRAME ? ' target="_top"' : '';
  }

  /* ---------------- Markdown (escape first, then format) ---------------- */
  function inline(s) {
    return s
      .replace(/\*\*\*([^*\n]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\w)/g, '$1<em>$2</em>');
  }
  function markdown(text) {
    return esc(text).split(/\n\s*\n+/).map(function (block) {
      block = block.trim();
      if (!block) return '';
      if (/^&gt;\s?/.test(block)) {
        return '<blockquote>' + inline(block.split('\n').map(function (l) { return l.replace(/^&gt;\s?/, ''); }).join('<br>')) + '</blockquote>';
      }
      var lines = block.split('\n');
      if (lines.every(function (l) { return /^\s*[-*•]\s+/.test(l); })) {
        return '<ul>' + lines.map(function (l) { return '<li>' + inline(l.replace(/^\s*[-*•]\s+/, '')) + '</li>'; }).join('') + '</ul>';
      }
      if (lines.every(function (l) { return /^\s*\d+[.)]\s+/.test(l); })) {
        return '<ol>' + lines.map(function (l) { return '<li>' + inline(l.replace(/^\s*\d+[.)]\s+/, '')) + '</li>'; }).join('') + '</ol>';
      }
      return '<p>' + inline(block.replace(/\n/g, '<br>')) + '</p>';
    }).join('');
  }

  /* Strip CTA tokens from the prose and render them as buttons. While a reply
     is still streaming, hide a half-arrived "[CTA_..." at the very end. */
  function renderAssistant(text, streaming) {
    var found = [];
    var prose = text.replace(/\[([A-Z_]+)\]/g, function (m, key) {
      if (CTA[key]) { if (found.indexOf(key) === -1) found.push(key); return ''; }
      return m;
    });
    if (streaming) prose = prose.replace(/\[[A-Z_]*$/, '');
    var html = markdown(prose.replace(/[ \t]+\n/g, '\n').trim());
    if (found.length && !streaming) {
      html += '<div class="tai-ctas">' + found.slice(0, 1).map(function (key) {
        var c = CTA[key];
        return '<a class="tai-cta tai-cta--' + c.kind + '" href="' + esc(c.url) + '"' + linkTarget(c.url) +
          ' data-cta="' + key + '">' + icon(c.icon) + '<span>' + esc(c.label) + '</span></a>';
      }).join('') + '</div>';
    }
    return html;
  }

  /* ---------------- Styles + fonts ---------------- */
  function loadAssets() {
    if (!document.querySelector('link[data-tanya-ai-css]')) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = BASE + 'tanya-ai.css?v=2';
      css.setAttribute('data-tanya-ai-css', '');
      document.head.appendChild(css);
    }
    if (!document.querySelector('link[data-tanya-ai-fonts]')) {
      var f = document.createElement('link');
      f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,500;1,6..72,400&display=swap';
      f.setAttribute('data-tanya-ai-fonts', '');
      document.head.appendChild(f);
    }
  }

  /* ---------------- Chat ---------------- */
  function Chat(mount, inlineMode) {
    var saved = sget(STORE) || {};
    this.sessionId = saved.sessionId || newId();
    this.history = Array.isArray(saved.history) ? saved.history : [];
    this.inlineMode = inlineMode;
    this.busy = false;
    this.build(mount);
  }

  Chat.prototype.persist = function () {
    sset(STORE, { sessionId: this.sessionId, history: this.history.slice(-MAX_STORED) });
  };

  Chat.prototype.build = function (mount) {
    var self = this;
    this.root = el(
      '<section class="tai tai-panel' + (this.inlineMode ? ' tai-panel--inline' : '') + '" role="dialog" aria-label="Chat with Tanya’s AI coach">' +
        '<header class="tai-head">' +
          '<span class="tai-avatar"><img src="' + AVATAR + '" alt=""><i></i></span>' +
          '<span class="tai-head-text"><strong>Tanya</strong><small>AI coach · <em>Food Isn’t the Problem</em></small></span>' +
          '<button class="tai-icon-btn" type="button" data-act="reset" aria-label="Start a new conversation" title="New conversation">' + icon('reset') + '</button>' +
          (this.inlineMode ? '' : '<button class="tai-icon-btn" type="button" data-act="close" aria-label="Close chat">' + icon('close') + '</button>') +
        '</header>' +
        '<div class="tai-log" aria-live="polite"></div>' +
        '<form class="tai-compose">' +
          '<textarea rows="1" maxlength="1500" placeholder="Tell me what’s on your mind…" aria-label="Your message"></textarea>' +
          '<button class="tai-send" type="submit" aria-label="Send">' + icon('send') + '</button>' +
        '</form>' +
        '<p class="tai-fine">AI coaching guidance, not medical or mental-health care. In crisis? Call or text 988.</p>' +
      '</section>'
    );

    this.log = this.root.querySelector('.tai-log');
    this.input = this.root.querySelector('textarea');
    this.sendBtn = this.root.querySelector('.tai-send');

    this.root.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); self.send(); });
    this.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); self.send(); }
    });
    this.input.addEventListener('input', function () {
      self.input.style.height = 'auto';
      self.input.style.height = Math.min(self.input.scrollHeight, 120) + 'px';
    });
    this.root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.getAttribute('data-act') === 'close') self.close();
      if (b.getAttribute('data-act') === 'reset') self.reset();
    });

    mount.appendChild(this.root);
    this.renderAll();
  };

  Chat.prototype.renderAll = function (greeting) {
    var self = this;
    this.log.innerHTML = '';
    if (!this.history.length) {
      this.bubble('assistant', greeting ||
        'Hi, I’m **Tanya’s AI coach** — so glad you’re here.\n\n' +
        'I’m trained on my new book, *Food Isn’t the Problem*. I can answer questions about emotional eating and my programs, or walk with you through a craving right now. What’s on your mind?');
      var wrap = el('<div class="tai-starters"><span>Quick start</span></div>');
      STARTERS.forEach(function (s) {
        var chip = el('<button type="button" class="tai-chip"></button>');
        chip.textContent = s.label;
        chip.addEventListener('click', function () { self.input.value = s.prompt; self.send(); });
        wrap.appendChild(chip);
      });
      this.log.appendChild(wrap);
    } else {
      this.history.forEach(function (m) { self.bubble(m.role, m.content); });
    }
    this.scroll();
  };

  Chat.prototype.bubble = function (role, text) {
    var b = el('<div class="tai-msg tai-msg--' + role + '"></div>');
    if (role === 'user') b.textContent = text;
    else b.innerHTML = renderAssistant(text, false);
    this.log.appendChild(b);
    return b;
  };

  Chat.prototype.scroll = function () {
    var log = this.log;
    requestAnimationFrame(function () { log.scrollTop = log.scrollHeight; });
  };

  Chat.prototype.open = function () {
    this.root.classList.add('is-open');
    if (launcher) launcher.classList.add('is-hidden');
    hideNudge();
    var input = this.input;
    setTimeout(function () { input.focus(); }, 60);
  };
  Chat.prototype.close = function () {
    this.root.classList.remove('is-open');
    if (launcher) launcher.classList.remove('is-hidden');
  };
  Chat.prototype.isOpen = function () { return this.root.classList.contains('is-open'); };

  Chat.prototype.reset = function () {
    if (this.busy) return;
    this.history = [];
    this.sessionId = newId();
    this.persist();
    this.renderAll();
  };

  Chat.prototype.send = function () {
    var self = this;
    var text = (this.input.value || '').trim();
    if (!text || this.busy) return;
    if (!ENDPOINT) { this.bubble('assistant', 'Chat isn’t connected yet — please check back soon.'); return; }

    var starters = this.log.querySelector('.tai-starters');
    if (starters) starters.remove();

    this.input.value = '';
    this.input.style.height = 'auto';
    this.history.push({ role: 'user', content: text });
    this.persist();
    this.bubble('user', text);

    this.busy = true;
    this.sendBtn.disabled = true;
    var out = this.bubble('assistant', '');
    out.classList.add('is-typing');
    out.innerHTML = '<span class="tai-dots"><i></i><i></i><i></i></span>';
    this.scroll();

    var reply = '';
    var pending = false;
    var finished = false;
    function paint(streaming) {
      // A frame queued by the last delta must not repaint over the final
      // render (it would strip the CTA button, which only shows when done).
      if (streaming && finished) return;
      out.classList.remove('is-typing');
      out.innerHTML = renderAssistant(reply, streaming) || '<span class="tai-dots"><i></i><i></i><i></i></span>';
      self.scroll();
    }
    function schedule() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; paint(true); });
    }
    function finish(errorText) {
      if (finished) return;
      finished = true;
      if (errorText && !reply) reply = errorText;
      paint(false);
      if (reply && !errorText) {
        self.history.push({ role: 'assistant', content: reply });
        self.persist();
      } else if (errorText) {
        // Let the visitor retry the same message.
        self.history.pop();
        self.persist();
      }
      self.busy = false;
      self.sendBtn.disabled = false;
      if (!matchMedia('(pointer: coarse)').matches) self.input.focus();
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.sessionId,
        messages: this.history.slice(-16),
        page: { url: (INSIDE_IFRAME ? document.referrer : location.href) || location.href, title: INSIDE_IFRAME ? '' : document.title }
      })
    }).then(function (res) {
      var type = res.headers.get('content-type') || '';
      if (!res.ok || type.indexOf('text/event-stream') === -1) {
        return res.json().catch(function () { return {}; }).then(function (j) {
          finish(j.error || 'Hmm — something tripped me up. Mind trying that again?');
        });
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { finish(); return; }
          buffer += decoder.decode(r.value, { stream: true });
          var events = buffer.split('\n\n');
          buffer = events.pop();
          for (var i = 0; i < events.length; i++) {
            var line = events[i].replace(/^data:\s?/, '');
            if (!line) continue;
            try {
              var msg = JSON.parse(line);
              if (msg.delta) { reply += msg.delta; schedule(); }
              if (msg.error) { finish(msg.error); return; }
            } catch (e) { /* ignore partial */ }
          }
          return pump();
        });
      }
      return pump();
    }).catch(function () {
      finish('A network hiccup interrupted us. Mind trying that again?');
    });
  };

  /* ---------------- Floating launcher + nudge ---------------- */
  var launcher = null;
  var nudge = null;
  var chat = null;

  function pickNudge() {
    var path = location.pathname.toLowerCase();
    for (var i = 0; i < NUDGES.length; i++) {
      if (!NUDGES[i].match || path.indexOf(NUDGES[i].match) !== -1) return NUDGES[i].text;
    }
    return NUDGES[NUDGES.length - 1].text;
  }

  function showNudge() {
    if (nudge || (chat && chat.isOpen()) || sget(NUDGE_KEY) || (chat && chat.history.length)) return;
    var text = pickNudge();
    nudge = el(
      '<div class="tai tai-nudge" role="status">' +
        '<button type="button" class="tai-nudge-x" aria-label="Dismiss">' + icon('close') + '</button>' +
        '<img src="' + AVATAR + '" alt="">' +
        '<div><strong>Tanya</strong><p></p></div>' +
      '</div>'
    );
    nudge.querySelector('p').innerHTML = inline(esc(text));
    document.body.appendChild(nudge);
    requestAnimationFrame(function () { nudge && nudge.classList.add('is-in'); });
    launcher.classList.add('has-nudge');

    nudge.addEventListener('click', function (e) {
      sset(NUDGE_KEY, 1);
      if (e.target.closest('.tai-nudge-x')) { hideNudge(); return; }
      if (!chat.history.length) chat.renderAll(text + '\n\nWhat’s on your mind?');
      chat.open();
    });
  }

  function hideNudge() {
    if (!nudge) return;
    var n = nudge;
    nudge = null;
    n.classList.remove('is-in');
    if (launcher) launcher.classList.remove('has-nudge');
    setTimeout(function () { n.remove(); }, 300);
  }

  function initFloating() {
    var host = el('<div class="tai tai-float"></div>');
    document.body.appendChild(host);
    chat = new Chat(host, false);

    launcher = el(
      '<button class="tai tai-launcher" type="button" aria-label="Chat with Tanya’s AI coach">' +
        '<img src="' + AVATAR + '" alt="">' +
        '<span class="tai-launcher-badge">' + icon('chat') + '</span>' +
        '<span class="tai-launcher-label">Ask Tanya</span>' +
      '</button>'
    );
    document.body.appendChild(launcher);
    launcher.addEventListener('click', function () { sset(NUDGE_KEY, 1); chat.open(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && chat.isOpen()) chat.close();
    });

    if (NUDGE_MS >= 1000) setTimeout(showNudge, NUDGE_MS);
  }

  function init() {
    loadAssets();
    var inlineEl = INLINE_SEL ? document.querySelector(INLINE_SEL) : null;
    if (inlineEl) { chat = new Chat(inlineEl, true); chat.root.classList.add('is-open'); }
    else initFloating();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
