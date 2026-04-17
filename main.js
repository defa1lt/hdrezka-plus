// ==UserScript==
// @name         HDrezka Plus
// @namespace    hdrezka
// @version      1.0005
// @author       dea1lt
// @match        *://hdrezka*/*
// @match        *://*.hdrezka*/*
// @match        *://rezka*/*
// @match        *://*.rezka*/*
// @match        *://hdrzk*/*
// @include      *://*rezka*.*/*
// @include      /^https?:\/\/hdrezka[a-z0-9]+\.org\/.*$/
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

  // --- 1. VIEWPORT & INITIAL SHIELD ---
  const shieldStyle = document.createElement('style');
  shieldStyle.textContent = `
        html, body { background: #050505 !important; }
        body > *:not(#hdm-app):not(#hdm-player-ui) { display: none !important; }
        #hdm-app { display: flex !important; }
    `;
  (document.head || document.documentElement).appendChild(shieldStyle);

  function fixViewport() {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      (document.head || document.documentElement).appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    document.documentElement.style.touchAction = 'manipulation';
  }
  fixViewport();

  document.addEventListener('DOMContentLoaded', fixViewport, { once: true });

  const VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  const vpObserver = new MutationObserver(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta || meta.getAttribute('content') !== VIEWPORT_CONTENT) fixViewport();
  });
  const startVpObserver = () => {
    if (document.head) vpObserver.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] });
  };
  if (document.head) startVpObserver();
  else document.addEventListener('DOMContentLoaded', startVpObserver, { once: true });

  // --- 2. CSS ---
  const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');

        :root {
            --bg: #050505;
            --surface: #121214;
            --surface-elevated: #1c1c1f;
            --surface-glass: rgba(10, 10, 12, 0.9);
            --accent: #ff2d55;
            --accent-gradient: linear-gradient(135deg, #ff2d55 0%, #ff5e3a 100%);
            --accent-glow: rgba(255, 45, 85, 0.4);
            --text: #ffffff;
            --text-dim: #94949e;
            --radius-md: 16px;
            --radius-lg: 24px;
            --blur: 30px;
            --safe-top: env(safe-area-inset-top, 0px);
            --safe-bottom: env(safe-area-inset-bottom, 0px);
        }

        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }

        html, body {
            margin: 0; padding: 0; background: var(--bg) !important; color: var(--text);
            font-family: 'Outfit', -apple-system, sans-serif;
            overflow: hidden; width: 100vw; height: 100vh;
        }

        #hdm-app {
            position: fixed; inset: 0; z-index: 1000000;
            background: var(--bg); display: none; flex-direction: column;
            animation: fadeIn 0.4s ease;
        }



        .logo {
            font-size: 24px; font-weight: 800; color: var(--text);
            background: var(--accent-gradient); -webkit-background-clip: text;
            -webkit-text-fill-color: transparent; letter-spacing: -0.5px;
            display: none; /* Hide default logo since we use header-title */
        }

        .search-page { padding: 20px; }
        .search-inner {
            background: rgba(255,255,255,0.06);
            border-radius: var(--radius-md); padding: 12px 16px;
            display: flex; align-items: center; gap: 10px;
            border: 1px solid rgba(255,255,255,0.04);
            transition: 0.3s; margin-bottom: 20px;
        }
        .search-inner:focus-within { background: rgba(255,255,255,0.1); border-color: var(--accent); }
        .search-inner input {
            background: none; border: none; color: #fff; font-size: 16px; width: 100%;
            font-family: inherit;
        }

        main {
            flex: 1; overflow-y: auto; overflow-x: hidden;
            padding-top: calc(52px + var(--safe-top));
            padding-bottom: calc(90px + var(--safe-bottom));
            scroll-behavior: smooth; -webkit-overflow-scrolling: touch;
            scrollbar-width: none; -ms-overflow-style: none;
        }
        main::-webkit-scrollbar { display: none; }

        .hdm-section-head { font-size: 19px; font-weight: 800; padding: 25px 20px 12px; display: flex; justify-content: space-between; align-items: center; }
        .section-more { font-size: 13px; color: var(--accent); font-weight: 700; }

        .movie-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 0 20px; }
        @media (min-width: 480px) { .movie-grid { grid-template-columns: repeat(3, 1fr); } }

        .h-scroll { display: flex; gap: 14px; overflow-x: auto; padding: 0 20px 10px; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
        .h-scroll::-webkit-scrollbar { display: none; }

        .m-card { display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: 0.2s; }
        .m-card:active { transform: scale(0.96); opacity: 0.8; }

        .m-poster {
            position: relative; aspect-ratio: 2/3;
            border-radius: var(--radius-md); overflow: hidden;
            background: var(--surface);

        }
        .m-poster img { width: 100%; height: 100%; object-fit: cover; }

        .m-rating {
            position: absolute; top: 8px; left: 8px;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
            color: #ffcc00; font-size: 10px; font-weight: 800;
            padding: 2px 6px; border-radius: 6px;
        }
        .m-type {
            position: absolute; top: 8px; right: 8px;
            background: var(--accent); color: #fff; font-size: 9px; font-weight: 800;
            padding: 2px 6px; border-radius: 4px; z-index: 2;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .m-type.movie { background: #5856d6; }
        .m-type.series { background: #ff2d55; }
        .m-type.cartoon { background: #ff9500; }
        .m-type.anime { background: #af52de; }
        .m-count { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; }

        .m-title { font-size: 13px; font-weight: 700; line-height: 1.3; color: #fff; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .m-card.small { width: 110px; flex-shrink: 0; }
        .m-card.small .m-poster { border-radius: 12px; overflow: hidden; }
        .m-card.small .m-title { font-size: 13px; margin: 6px 0 2px; height: 1.3em; -webkit-line-clamp: 1; }
        .m-card.small .m-meta { font-size: 11px; }

        .hdm-ratings-row { display: flex; gap: 12px; margin: 0 0 22px; padding: 0 20px; }
        .hdm-rating-card {
            flex: 1; background: var(--surface-glass); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            padding: 14px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08);
            display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center;
        }
        .hdm-rating-card .r-label { font-size: 10px; font-weight: 900; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; }
        .hdm-rating-card .r-val { font-size: 20px; font-weight: 900; }
        .hdm-rating-card.imdb .r-val { color: #f5c518; }
        .hdm-rating-card.kp .r-val { color: #ff6600; }
        .hdm-rating-card .r-votes { font-size: 10px; color: var(--text-dim); opacity: 0.6; }
        .m-meta { font-size: 11px; color: var(--text-dim); }

        nav {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--surface-glass); backdrop-filter: blur(var(--blur));
            padding: 10px 20px calc(12px + var(--safe-bottom));
            display: flex; justify-content: space-around;
            border-top: 1px solid rgba(255,255,255,0.08); z-index: 1000;
        }
        .nav-link {
            display: flex; flex-direction: column; align-items: center; gap: 4px;
            color: var(--text-dim); font-size: 10px; font-weight: 700; transition: 0.2s;
        }
        .nav-link.active { color: var(--accent); }
        .nav-link svg { width: 24px; height: 24px; }

        .hero { position: relative; width: 100%; aspect-ratio: 16/10; }
        .hero-img { width: 100%; object-fit: cover; filter: brightness(0.7); }
        .hero-grad { position: absolute; inset: 0; background: linear-gradient(0deg, var(--bg) 0%, transparent 60%); }
        .hero-meta { position: absolute; bottom: 20px; left: 20px; right: 20px; }
        .hero-title { font-size: 24px; font-weight: 800; line-height: 1.2; margin-bottom: 4px; }
        
        /* Player Controls Modernization */
        .player-controls { display: flex; flex-direction: column; gap: 15px; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .pc-section { display: flex; flex-direction: column; gap: 10px; }
        .pc-label { font-size: 13px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; padding: 0 15px; }
        .pc-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 0 15px 10px; scrollbar-width: none; -ms-overflow-style: none; }
        .pc-scroll::-webkit-scrollbar { display: none; }
        .pc-item { background: var(--surface-elevated); border: 1px solid rgba(255,255,255,0.08); padding: 10px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; color: var(--text-dim); white-space: nowrap; transition: 0.2s; cursor: pointer; }
        .pc-item.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 4px 12px var(--accent-glow); transform: scale(1.05); }
        .pc-item:active { transform: scale(0.95); }
        
        .ep-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 15px; }
        .ep-item { background: var(--surface-elevated); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 600; color: var(--text-dim); text-align: center; transition: 0.2s; cursor: pointer; }
        .ep-item.active { background: var(--accent); color: #fff; border-color: var(--accent); }
        
        body.is-watching header, body.is-watching nav { display: none !important; }
        #hdm-player-container { display: none; }
        body.is-watching #hdm-player-container {
            display: flex !important; flex-direction: column;
            justify-content: center; align-items: center;
            position: fixed; inset: 0; z-index: 10000;
            background: #000; overflow: hidden !important;
        }
        body.is-watching #hdm-player-wrap {
            display: block !important; position: relative !important;
            width: 100vw !important; aspect-ratio: 16/9; flex-shrink: 0;
            overflow: hidden !important; max-width: none !important;
        }

        @media (orientation: landscape), (min-aspect-ratio: 1/1) {
            body.is-watching #hdm-player-wrap {
                height: 100vh !important; width: 100vw !important; aspect-ratio: auto !important;
                display: flex !important; align-items: center; justify-content: center;
                max-width: none !important;
            }
            body.is-watching #hdm-player-controls { display: none !important; }
        }
        
        body.is-watching #hdm-player-controls {
            width: 100%; flex-shrink: 0; background: #0a0a0a;
            padding-bottom: calc(20px + var(--safe-bottom));
        }
        
        #hdm-pjs-player { width: 100% !important; height: 100% !important; position: relative !important; overflow: hidden !important; }
        #hdm-pjs-player * { display: none !important; }
        #hdm-pjs-player pjsdiv:has(video),
        #hdm-pjs-player video,
        /* Ad Layer allowance (VAST/Ads) */
        #hdm-pjs-player pjsdiv[style*="z-index: 3001"],
        #hdm-pjs-player pjsdiv[style*="z-index: 3001"] *,
        /* Skip button and info elements allowance */
        #hdm-pjs-player pjsdiv[style*="bottom: 10px"][style*="left: 10px"],
        #hdm-pjs-player pjsdiv[style*="bottom: 10px"][style*="left: 10px"] *,
        #hdm-pjs-player pjsdiv[style*="top: 0px"][style*="left: 0px"][style*="background-color: rgba(0, 0, 0, 0.5)"],
        #hdm-pjs-player pjsdiv[style*="top: 0px"][style*="left: 0px"][style*="background-color: rgba(0, 0, 0, 0.5)"] *,
        /* Also allow any element that looks like a skip button SVG wrapper */
        #hdm-pjs-player pjsdiv:has(svg#pljsvastprogress_hdm-pjs-player) {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }
        /* Raise ad layer and skip button to top (above custom UI 10001 and modals 20000000) */
        #hdm-pjs-player pjsdiv[style*="z-index: 3001"] {
            z-index: 20000001 !important;
        }
        #hdm-pjs-player pjsdiv[style*="bottom: 10px"][style*="left: 10px"],
        #hdm-pjs-player pjsdiv:has(svg#pljsvastprogress_hdm-pjs-player) {
            z-index: 2147483647 !important;
        }
        #hdm-pjs-player video {
            object-fit: contain !important;
            pointer-events: auto !important;
            position: absolute !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important; height: 100% !important;
        }
        #hdm-player-wrap video, #hdm-player-wrap iframe {
            width: 100%; height: 100%; object-fit: contain; transition: 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
            background: #000;
        }
        #hdm-player-wrap.hdm-zoom-fill video, #hdm-player-wrap.hdm-zoom-fill iframe { 
            object-fit: cover;
            /* Extra scale to ensure notch/rounded corners are covered on iOS */
            transform: scale(1.02);
        }
        
        .hdm-player-top { 
            display: flex; align-items: center; justify-content: space-between; 
            gap: 15px; padding: 20px; width: 100%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
        }
        .hdm-player-top-left { display: flex; align-items: center; gap: 15px; flex: 1; overflow: hidden; }
        .hdm-player-top-acts { display: flex; align-items: center; gap: 10px; }
        .hdm-player-top-acts .icon-only { opacity: 0.8; transition: 0.2s; }
        .hdm-player-top-acts .icon-only:hover { opacity: 1; transform: scale(1.1); }
        
        #hdm-player-wrap > div, #hdm-player-wrap > iframe { width: 100% !important; height: 100% !important; }
        #player, #p-mount, #cdnplayer, #cdnplayer-container, #player-iframe { width: 100% !important; height: 100% !important; display: block !important; position: static !important; }
        
        #hdm-hidden-loader { position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden; }

        .rating-bar { display: flex; gap: 15px; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .r-item { flex: 1; background: var(--surface); padding: 12px; border-radius: var(--radius-md); text-align: center; border: 1px solid rgba(255,255,255,0.05); }
        .r-val { font-size: 20px; font-weight: 800; color: #ffcc00; }
        .r-lab { font-size: 10px; font-weight: 800; opacity: 0.5; text-transform: uppercase; margin-top: 2px; }
        .r-votes { font-size: 9px; opacity: 0.3; margin-top: 2px; }

        .details-body { padding: 0 20px 100px; }
        .labels { font-size: 12px; font-weight: 800; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0 12px; }
        .desc-wrap { position: relative; margin-bottom: 25px; }
        .desc { color: var(--text-dim); line-height: 1.6; font-size: 14px; position: relative; }
        .desc.truncated { max-height: 100px; overflow: hidden; -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%); mask-image: linear-gradient(to bottom, black 60%, transparent 100%); }
        .read-more-btn { position: absolute; bottom: -20px; right: 0; color: var(--accent); font-size: 13px; font-weight: 800; padding: 10px 0; cursor: pointer; }

        .info-table { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }
        .it-row { display: flex; gap: 15px; font-size: 13px; }
        .it-lab { color: var(--text-dim); width: 100px; flex-shrink: 0; }

        .person-card { flex-shrink: 0; width: 75px; text-align: center; }
        .person-img { width: 75px; height: 75px; border-radius: 50%; overflow: hidden; background: var(--surface); margin-bottom: 6px; border: 1px solid rgba(255,255,255,0.1); }
        .person-img img { width: 100%; height: 100%; object-fit: cover; }
        .person-name { font-size: 10px; font-weight: 600; line-height: 1.2; }

        /* Person View */
        .person-header { display: flex; gap: 20px; padding: 20px; align-items: flex-start; }
        .person-photo { width: 110px; aspect-ratio: 2/3; border-radius: var(--radius-md); overflow: hidden; background: var(--surface); box-shadow: 0 8px 20px rgba(0,0,0,0.4); flex-shrink: 0; }
        .person-photo img { width: 100%; height: 100%; object-fit: cover; }
        .person-info { flex: 1; min-width: 0; }
        .person-title-main { font-size: 22px; font-weight: 800; line-height: 1.2; margin-bottom: 4px; }
        .person-title-sub { font-size: 14px; color: var(--text-dim); margin-bottom: 15px; }

        .pill-box { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; -ms-overflow-style: none; }
        .pill-box::-webkit-scrollbar { display: none; }
        .pill {
            flex-shrink: 0; padding: 10px 18px; background: var(--surface-elevated);
            border-radius: var(--radius-md); font-size: 14px; font-weight: 700;
            border: 1px solid rgba(255,255,255,0.05); transition: 0.2s;
        }
        .pill.active { background: var(--accent-gradient); border: none; box-shadow: 0 5px 15px var(--accent-glow); }

        .bookmark-cats { display: flex; flex-direction: column; gap: 15px; padding: 20px; }
        .b-cat-card { position: relative; border-radius: 12px; background: transparent; padding: 0; border: none; overflow: hidden; }
        .b-cat-actions-bg { position: absolute; inset: 0; display: flex; justify-content: flex-end; background: var(--surface); border-radius: 12px; z-index: 1; }
        .b-cat-action-btn { width: 60px; display: flex; align-items: center; justify-content: center; color: white; border: none; cursor: pointer; }
        .b-cat-action-btn svg { width: 22px; height: 22px; flex-shrink: 0; display: block; }
        .b-cat-action-btn.edit { background: #007aff; }
        .b-cat-action-btn.del { background: #ff3b30; }
        .b-cat-body {
            background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
            position: relative; z-index: 2; transition: transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1); display: flex; justify-content: space-between; align-items: center;
        }
        .b-cat-body.swiping { transition: none; }
        .b-cat-name { font-weight: 700; font-size: 16px; text-align: left; }
        .b-cat-count { font-size: 13px; color: var(--accent); font-weight: 800; }

        .coll-grid { display: grid; grid-template-columns: 1fr; gap: 16px; padding: 0 20px; }
        .coll-card { background: var(--surface); border-radius: var(--radius-md); overflow: hidden; position: relative; aspect-ratio: 16/9; box-shadow: 0 8px 20px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); }
        .coll-card.small { width: 220px; flex-shrink: 0; }
        .coll-card img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6); }
        .coll-card.small .coll-title { font-size: 14px; }
        .coll-meta { position: absolute; bottom: 15px; left: 15px; right: 15px; }
        .coll-title { font-size: 18px; font-weight: 800; text-shadow: 0 2px 5px rgba(0,0,0,0.8); }
        .coll-count { font-size: 11px; color: var(--accent); font-weight: 800; margin-top: 4px; }

        .p-wrapper { padding: 20px; }
        .p-header { color: var(--text-dim); font-size: 13px; text-transform: uppercase; margin-bottom: 10px; font-weight: 600; padding-left: 15px; }
        .p-links { background: rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; }
        .p-item { padding: 16px 20px; color: #fff; font-size: 16px; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: space-between; }
        .p-item:last-child { border-bottom: none; }
        .p-item:active { background: rgba(255,255,255,0.1); }
        .p-item.logout { color: #ff3b30; }
        .p-item:after { content: '›'; font-size: 20px; color: var(--text-dim); font-weight: 300; }
        .p-item-theme:after { display: none !important; }

        /* Hidden Native Elements */
        #b-post__prem_holder, .b-post__prem_content, .b-prem-button, .tg__info_block_wrapper,
        #user-network-issues, a[id^="hcc"], a[id^="i"], a[href*="/help/"], #youtubeplayer,
        .b-simple_seasons__title, .b-simple_episodes__title,
        .b-simple_seasons__list, .b-simple_episodes__list, .b-translator__list, #translators-list, .b-translator__block,
        #hrezka-loader, .b-player__loader, .b-player__restricted { display: none !important; }

        .genre-scroll { display: flex; overflow-x: auto; gap: 10px; padding: 15px 20px 5px; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
        .genre-scroll::-webkit-scrollbar { display: none; }
        .genre-pill { padding: 8px 16px; background: rgba(255,255,255,0.06); border-radius: var(--radius-md); font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; white-space: nowrap; }
        .genre-pill.active { background: var(--accent); color: #fff; }

        .filter-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 15px 20px 10px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .filter-pill { 
            padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; background: var(--surface-glass); 
            border: 1px solid rgba(255,255,255,0.06); color: var(--text-dim); white-space: nowrap; cursor: pointer; transition: 0.2s;
        }
        .filter-pill.active { background: var(--accent-gradient); color: #fff; border-color: transparent; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2); }

        .hdm-hidden-native {
            position: absolute !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            z-index: -1;
            pointer-events: none !important;
        }

        #hdm-fav-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10000000;
            backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.35s ease; pointer-events: none;
        }
        #hdm-fav-backdrop.show { opacity: 1; pointer-events: auto; }

        .hdm-modal-base {
            display: none !important;
        }
        .hdm-modal-base.hdm-active {
            display: flex !important; flex-direction: column !important; visibility: visible !important; opacity: 1 !important;
            z-index: 20000000 !important; position: fixed !important; bottom: 0 !important; left: 0 !important; top: auto !important;
            width: 100vw !important; max-height: 85vh !important; background: rgba(15,15,15,0.98) !important;
            border-radius: 24px 24px 0 0 !important; padding: 15px 20px 40px !important;
            overflow-y: auto !important; box-sizing: border-box !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.8) !important;
            backdrop-filter: blur(40px) !important; -webkit-backdrop-filter: blur(40px) !important;
            transform: translateY(100%) !important; transition: transform 0.35s cubic-bezier(0.1, 0.9, 0.2, 1) !important;
            border: 1px solid rgba(255,255,255,0.1) !important; border-bottom: none !important;
        }
        .hdm-modal-base.hdm-active.hdm-shown { transform: translateY(0) !important; }

        .hdm-modal-handle {
            width: 60px; height: 6px; background: rgba(255,255,255,0.4); border-radius: 4px;
            margin: 0 auto 20px; cursor: pointer; flex-shrink: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .hdm-modal-base .hd-label-row { font-size: 15px; font-weight: 600; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; }
        .hdm-modal-base .hd-label-row label { flex: 1; cursor: pointer; color: var(--text); display: flex; align-items: center; }
        .hdm-modal-base .hd-label-row input { margin-right: 12px; transform: scale(1.3); cursor: pointer; }
        .hdm-modal-base small { margin-left: auto; opacity: 0.5; }
        .hdm-modal-base .start-info { font-size: 13px; color: var(--text-dim); margin-bottom: 15px; }

        .b-userset__fav_addcat_inner, .b-userset__fav_addcat_editor, .b-userset__fav_addcat, #addcat-fav-close, .b-userset__fav_addcat_wrapper > a { display: none !important; }

        .hdm-create-cat-btn { background: rgba(255,255,255,0.05); padding: 15px; text-align: center; border-radius: 12px; font-weight: 600; color: var(--accent); cursor: pointer; margin-top: 15px; border: 1px dashed rgba(255,255,255,0.2); transition: 0.2s; }
        .hdm-create-cat-btn:active { background: rgba(255,255,255,0.1); }

        .hdm-prompt-overlay { position: fixed !important; inset: 0 !important; background: rgba(0,0,0,0.8) !important; z-index: 2147483647 !important; display: flex !important; align-items: center !important; justify-content: center !important; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); opacity: 0; pointer-events: none; transition: opacity 0.3s !important; visibility: hidden; }
        .hdm-prompt-overlay.show { opacity: 1 !important; pointer-events: auto !important; visibility: visible !important; }
        .hdm-prompt-box { background: var(--surface); border-radius: 16px; padding: 25px; width: 80%; max-width: 320px; transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1); border: 1px solid rgba(255,255,255,0.1); text-align: center; }
        .hdm-prompt-overlay.show .hdm-prompt-box { transform: scale(1); }
        .hdm-prompt-box h3 { margin: 0 0 15px; font-size: 18px; font-weight: 700; color: #fff;}
        .hdm-prompt-box input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px 15px; border-radius: 10px; color: #fff; font-size: 16px; box-sizing: border-box; outline: none; margin-bottom: 20px; }
        .hdm-prompt-actions { display: flex; gap: 10px; }
        .hdm-prompt-actions button { flex: 1; padding: 12px; border-radius: 10px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; }
        .hdm-prompt-actions button#hdm-prompt-cancel { background: rgba(255,255,255,0.1); color: #fff; }
        .hdm-prompt-actions button#hdm-prompt-save { background: var(--accent); color: #fff; }
        .b-cat-actions svg { width: 18px; height: 18px; fill: var(--text-dim); }

        .b-post__rating_table { width: 100% !important; margin: 25px 0 0; background: rgba(255,255,255,0.03); padding: 18px; border-radius: var(--radius-md); box-sizing: border-box; position: relative; }
        .b-post__rating_table tbody, .b-post__rating_table tr, .b-post__rating_table td { display: block; width: 100%; border: none !important; padding: 0 !important; }
        .b-post__rating_table .label { font-size: 14px; color: var(--text); font-weight: 800; padding-bottom: 12px; }
        .b-post__rating_table .votes { font-size: 11px; color: var(--text-dim); text-align: right; display: block; margin-top: 5px; opacity: 0.5; }
        .b-post__rating_layer { display: flex !important; justify-content: space-between; position: relative; background: rgba(255,255,255,0.05); height: 34px; border-radius: 17px; overflow: hidden; margin: 5px 0 0; list-style: none; padding: 0; width: 100% !important; box-sizing: border-box !important; }
        .b-post__rating_layer_current { position: absolute; left: 0 !important; top: 0 !important; bottom: 0 !important; background: var(--accent-gradient); z-index: 1; pointer-events: none; height: 100% !important; border: none !important; margin: 0 !important; }
        .b-post__rating_layer li:not(.b-post__rating_layer_current) { flex: 1; z-index: 2; text-align: center; position: relative; height: 100%; border: none !important; margin: 0 !important; padding: 0 !important; }
        .b-post__rating_layer a { display: block; height: 34px; line-height: 34px; color: transparent !important; width: 100%; cursor: pointer; border: none !important; text-decoration: none !important; }
        .b-post__rating_layer li:not(.b-post__rating_layer_current):after { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.6); pointer-events: none; }
        .b-post__rating_layer li:nth-child(2):after { content: '1'; } .b-post__rating_layer li:nth-child(3):after { content: '2'; } .b-post__rating_layer li:nth-child(4):after { content: '3'; } .b-post__rating_layer li:nth-child(5):after { content: '4'; } .b-post__rating_layer li:nth-child(6):after { content: '5'; } .b-post__rating_layer li:nth-child(7):after { content: '6'; } .b-post__rating_layer li:nth-child(8):after { content: '7'; } .b-post__rating_layer li:nth-child(9):after { content: '8'; } .b-post__rating_layer li:nth-child(10):after { content: '9'; } .b-post__rating_layer li:nth-child(11):after { content: '10'; }

        .franchise-scroll { display: flex; overflow-x: auto; gap: 12px; padding: 5px 0 15px; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
        .franchise-scroll::-webkit-scrollbar { display: none; }
        .franchise-card { background: rgba(255,255,255,0.04); padding: 15px; border-radius: var(--radius-md); min-width: 160px; max-width: 220px; border: 1px solid rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 6px; cursor: pointer; flex-shrink: 0; }
        .franchise-card.current { background: rgba(0, 173, 239, 0.1); border-color: rgba(0, 173, 239, 0.3); }
        .f-title { font-size: 13px; font-weight: 700; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .f-meta { font-size: 11px; color: var(--text-dim); margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
        .f-meta span.f-rating { color: #ffcc00; font-weight: 800; }

        .meta-array { display: flex; flex-wrap: wrap; gap: 6px; }
        .meta-pill { background: rgba(255,255,255,0.06); font-size: 12px; padding: 4px 10px; border-radius: 6px; transition: 0.2s; white-space: nowrap; color: #eee; cursor: pointer; border: 1px solid rgba(255,255,255,0.02); }
        .meta-pill:active { background: var(--accent); color: #fff; }

        .update-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.04); border-radius: var(--radius-md); padding: 15px; min-width: 200px; display: flex; flex-direction: column; gap: 5px; }
        .upd-title { font-size: 14px; font-weight: 700; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .upd-season { font-size: 13px; font-weight: 800; color: var(--accent); }
        .upd-ep { font-size: 12px; color: var(--text-dim); }
        .upd-date { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: auto; }

        .section-header { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; margin: 25px 0 10px; }
        .hdm-section-head { padding: 0; margin: 0; }
        .section-more { font-size: 12px; font-weight: 700; color: var(--accent); cursor: pointer; background: rgba(0, 173, 239, 0.1); padding: 6px 12px; border-radius: 6px; }

        .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; padding: 20px; }
        .page-end-loader { display: flex; justify-content: center; padding: 20px; }

        .cat-group-title { font-size: 18px; font-weight: 800; margin: 30px 20px 10px; color: var(--text); }
        .s-cats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; padding: 0 20px; }
        .s-cat-btn { background: rgba(255,255,255,0.05); padding: 12px; border-radius: var(--radius-md); text-align: center; color: var(--text); font-weight: 700; font-size: 13px; cursor: pointer; border: 1px solid rgba(255,255,255,0.02); }
        .s-cat-btn:active { background: rgba(255,255,255,0.1); }
        .s-filter-wrap { display: flex; gap: 10px; padding: 0 20px; margin-bottom: 30px; }
        .s-filter-select { flex: 1; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: var(--radius-md); font-size: 14px; }
        .s-filter-btn { background: var(--accent); color: #fff; border: none; padding: 10px 20px; border-radius: var(--radius-md); font-weight: 700; cursor: pointer; }

        .loader-wrap { display: flex; justify-content: center; padding: 100px 0; }
        .m-loader { width: 38px; height: 38px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        #hdm-progress { position: fixed; top: 0; left: 0; height: 3px; background: var(--accent-gradient); z-index: 1000001; transition: width 0.3s ease, opacity 0.3s ease; width: 0; opacity: 0; pointer-events: none; }
        .loader-bar-active #hdm-progress { width: 70%; opacity: 1; transition: width 2s cubic-bezier(0.1, 0.05, 0, 1); }
        .loader-bar-done #hdm-progress { width: 100%; opacity: 0; transition: width 0.3s ease, opacity 0.5s 0.2s ease; }

        .skeleton { background: linear-gradient(90deg, var(--surface) 25%, var(--surface-elevated) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
        .m-sk-card { width: 130px; flex-shrink: 0; }
        .m-sk-poster { aspect-ratio: 2/3; border-radius: var(--radius-md); margin-bottom: 8px; }
        .m-sk-title { height: 14px; width: 80%; border-radius: 4px; margin-bottom: 6px; }
        .m-sk-meta { height: 10px; width: 50%; border-radius: 4px; }

        .coll-sk-card { width: 220px; flex-shrink: 0; }
        .coll-sk-poster { aspect-ratio: 16/9; border-radius: var(--radius-md); margin-bottom: 8px; }

        .upd-sk-card { min-width: 200px; padding: 15px; background: rgba(255,255,255,0.04); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px; }
        .upd-sk-line { height: 12px; border-radius: 4px; width: 100%; }
        @keyframes shimmer { to { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Search Tabs */
        .s-tabs { display: flex; gap: 10px; padding: 0 20px 15px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .s-tabs::-webkit-scrollbar { display: none; }
        .s-tab { padding: 8px 16px; }
        header {
            position: fixed; top: 0; left: 0; right: 0;
            height: calc(56px + var(--safe-top));
            padding: var(--safe-top) 10px 0;
            background: var(--surface-glass);
            backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur));
            display: grid; grid-template-columns: 48px 1fr 48px; align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.08); z-index: 1001;
        }
        .header-left, .header-right { display: flex; align-items: center; justify-content: center; width: 48px; height: 100%; position: relative; }
        .header-title { font-size: 18px; font-weight: 800; color: var(--text); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0; text-align: center; }
        .fav-header-btn { display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: var(--text-dim); }
        .fav-header-btn svg { width: 22px; height: 22px; }
        .fav-header-btn.active { color: #ff2d55; }

        .back-btn { 
            display: flex; align-items: center; justify-content: center;
            width: 32px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 50%; 
            cursor: pointer; color: var(--accent); transition: 0.2s; opacity: 0; pointer-events: none;
        }
        .back-btn svg { width: 24px; height: 24px; }
        body.can-back .back-btn { opacity: 1; pointer-events: auto; }
        .s-tab { padding: 8px 16px; background: rgba(255,255,255,0.05); border-radius: var(--radius-md); font-size: 14px; font-weight: 700; color: var(--text-dim); transition: 0.2s; white-space: nowrap; }
        .s-tab.active { background: var(--accent); color: #fff; box-shadow: 0 4px 12px var(--accent-glow); }

        /* Hide nav on login screen */
        body.hdm-login-mode nav { display: none !important; }
        body.hdm-login-mode main { padding-bottom: 0 !important; }

        /* ===== LIGHT THEME ===== */
        :root[data-theme="light"] {
            --bg: #f0f2f5; --surface: #ffffff; --surface-elevated: #e4e6eb;
            --surface-glass: rgba(240,242,245,0.94); --text: #1c1c1e; --text-dim: #6c6c72;
            --accent-glow: rgba(255,45,85,0.2);
        }
        :root[data-theme="light"] body { background: var(--bg) !important; color: var(--text); }
        :root[data-theme="light"] #hdm-app { background: var(--bg); }
        :root[data-theme="light"] header { background: rgba(240,242,245,0.95); border-bottom-color: rgba(0,0,0,0.1); }
        :root[data-theme="light"] nav { background: rgba(240,242,245,0.95); border-top-color: rgba(0,0,0,0.1); }
        :root[data-theme="light"] .nav-link { color: #8e8e93; }
        :root[data-theme="light"] .m-poster { box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        :root[data-theme="light"] .m-title { color: #1c1c1e; }
        :root[data-theme="light"] .m-rating { background: rgba(255,255,255,0.92); color: #b8860b; }
        :root[data-theme="light"] .r-item { background: #fff; border-color: rgba(0,0,0,0.08); }
        :root[data-theme="light"] .r-val { color: #b8860b; }
        :root[data-theme="light"] .desc { color: #3c3c43; }
        :root[data-theme="light"] .it-lab { color: #8e8e93; }
        :root[data-theme="light"] .update-card { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.06); }
        :root[data-theme="light"] .upd-title { color: #1c1c1e; }
        :root[data-theme="light"] .upd-date { color: rgba(0,0,0,0.35); }
        :root[data-theme="light"] .p-links { background: rgba(0,0,0,0.04); }
        :root[data-theme="light"] .p-item { color: #1c1c1e; border-bottom-color: rgba(0,0,0,0.06); }
        :root[data-theme="light"] .p-item:after { color: #aeaeb2; }
        :root[data-theme="light"] .b-cat-body { background: #fff; border-color: rgba(0,0,0,0.1); }
        :root[data-theme="light"] .b-cat-name { color: #1c1c1e; }
        :root[data-theme="light"] .genre-pill { background: rgba(0,0,0,0.06); color: #1c1c1e; }
        :root[data-theme="light"] .genre-pill.active { color: #fff; }
        :root[data-theme="light"] .s-cat-btn { background: rgba(0,0,0,0.05); color: #1c1c1e; border-color: rgba(0,0,0,0.04); }
        :root[data-theme="light"] .search-inner { background: rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.06); }
        :root[data-theme="light"] .search-inner:focus-within { background: rgba(0,0,0,0.08); }
        :root[data-theme="light"] .search-inner input { color: #1c1c1e; }


        :root[data-theme="light"] .franchise-card { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.04); }
        :root[data-theme="light"] .meta-pill { background: rgba(0,0,0,0.06); color: #3c3c43; border-color: rgba(0,0,0,0.04); }
        :root[data-theme="light"] .coll-card { background: #e4e6eb; border-color: rgba(0,0,0,0.06); }
        :root[data-theme="light"] .pill { background: #e4e6eb; border-color: rgba(0,0,0,0.08); color: #1c1c1e; }
        :root[data-theme="light"] .labels { color: #aeaeb2; }
        :root[data-theme="light"] .hdm-modal-base.hdm-active { background: rgba(245,245,248,0.98) !important; border-color: rgba(0,0,0,0.1) !important; }
        :root[data-theme="light"] .hd-label-row label { color: #1c1c1e; }
        :root[data-theme="light"] .hdm-prompt-box { background: #fff; border-color: rgba(0,0,0,0.1); }
        :root[data-theme="light"] .hdm-prompt-box h3 { color: #1c1c1e; }
        :root[data-theme="light"] .hdm-prompt-box input { background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.1); color: #1c1c1e; }
        :root[data-theme="light"] .hdm-create-cat-btn { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.15); }
        :root[data-theme="light"] .back-btn { background: rgba(0,0,0,0.06); }
        :root[data-theme="light"] .cat-group-title { color: #1c1c1e; }
        :root[data-theme="light"] .section-more { background: rgba(255,45,85,0.1); }
        :root[data-theme="light"] #hdm-progress { background: var(--accent-gradient); }

        /* Theme Toggle in Profile */
        .p-item-theme { display: flex; align-items: center; justify-content: space-between; }
        .p-theme-toggle { width: 48px; height: 28px; background: rgba(255,255,255,0.1); border-radius: 14px; position: relative; transition: 0.3s; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0; }
        .p-theme-toggle.on { background: var(--accent); border-color: transparent; }
        .p-theme-toggle::after { content: ''; position: absolute; width: 22px; height: 22px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: 0.3s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
        .p-theme-toggle.on::after { left: calc(100% - 24px); }
        :root[data-theme="light"] .p-theme-toggle { background: rgba(0,0,0,0.12); border-color: rgba(0,0,0,0.15); }
        :root[data-theme="light"] .p-theme-toggle::after { background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }

        /* ===== RESPONSIVE - TABLET (768px+) ===== */
        @media (min-width: 768px) {
            .movie-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 0 24px; }
            .page-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; padding: 24px; }
            .m-card.small { width: 160px; }
            .coll-card.small { width: 280px; }
            .coll-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 0 24px; }
            .h-scroll { gap: 18px; padding: 0 24px 15px; }
            .hero-title { font-size: 30px; }
            .hdm-section-head { font-size: 22px; }
            .section-header { padding: 0 24px; }
            .genre-scroll { padding: 15px 24px 5px; }
            .s-cats-grid { padding: 0 24px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
            .bookmark-cats { padding: 24px; }
        }

        /* ===== RESPONSIVE - DESKTOP (1024px+) ===== */
        @media (min-width: 1024px) {
            nav {
                position: fixed; left: 0; top: 0; bottom: 0; right: auto; width: 260px; height: 100vh;
                flex-direction: column; align-items: flex-start;
                padding: calc(80px + var(--safe-top)) 16px 40px;
                border-right: 1px solid rgba(255,255,255,0.08); border-top: none;
                gap: 4px; justify-content: flex-start;
            }
            :root[data-theme="light"] nav { border-right-color: rgba(0,0,0,0.1); border-top: none; }
            .nav-link {
                flex-direction: row; gap: 14px; font-size: 15px;
                padding: 13px 18px; border-radius: 14px; width: 100%;
                justify-content: flex-start; font-weight: 700;
            }
            .nav-link svg { flex-shrink: 0; }
            .nav-link.active { background: rgba(255,45,85,0.12); color: var(--accent); }
            :root[data-theme="light"] .nav-link.active { background: rgba(255,45,85,0.1); }
            header { left: 260px; padding: 0 30px; height: 70px; }
            main { margin-left: 260px; padding-top: 70px; padding-bottom: 40px; }
            .movie-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; padding: 0 30px; }
            .page-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px; padding: 30px; }
            .m-card.small { width: 180px; }
            .coll-card.small { width: 320px; }
            .coll-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 0 30px; }
            .hero { aspect-ratio: 21/8; }
            .hero-title { font-size: 36px; }
            .play-action { max-width: 400px; }
            .hdm-section-head { font-size: 24px; }
            .h-scroll { padding: 0 30px 15px; }
            .genre-scroll { padding: 15px 30px 5px; }
            .section-header { padding: 0 30px; }
            .s-cats-grid { padding: 0 30px; }
            .search-page { padding: 30px; max-width: 900px; margin: 0 auto; }
            .bookmark-cats { padding: 30px; max-width: 800px; margin: 0 auto; }
            .p-wrapper { max-width: 600px; margin: 0 auto; }
            .rating-bar { max-width: 600px; }
            .details-body { max-width: 900px; }
            .desc { font-size: 15px; }
            #hdm-player-wrap { max-width: 900px; }
            body.is-watching #hdm-player-wrap { max-width: none !important; }
        }

        /* ===== RESPONSIVE - LARGE SCREEN / TV (1440px+) ===== */
        @media (min-width: 1440px) {
            nav { width: 300px; padding-left: 20px; padding-right: 20px; }
            header { left: 300px; height: 76px; font-size: 20px; }
            main { margin-left: 300px; padding-top: 76px; }
            .movie-grid { grid-template-columns: repeat(5, 1fr); gap: 28px; padding: 0 40px; }
            .page-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 28px; padding: 40px; }
            .coll-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; padding: 0 40px; }
            .h-scroll { padding: 0 40px 20px; }
            .section-header { padding: 0 40px; }
            .genre-scroll { padding: 15px 40px 5px; }
            .nav-link { font-size: 17px; padding: 16px 22px; }
            .header-title { font-size: 22px; }
        }

        /* ===== LOGIN PAGE ===== */
        .hdm-login-wrap {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 100%; padding: 40px 20px;
        }
        .hdm-login-box {
            width: 100%; max-width: 420px; background: var(--surface);
            border-radius: var(--radius-lg); padding: 36px 32px;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        :root[data-theme="light"] .hdm-login-box { box-shadow: 0 10px 40px rgba(0,0,0,0.12); border-color: rgba(0,0,0,0.08); }
        .hdm-login-logo {
            font-size: 34px; font-weight: 800; text-align: center; margin-bottom: 8px;
            background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hdm-login-subtitle { text-align: center; color: var(--text-dim); font-size: 14px; margin-bottom: 28px; }
        .hdm-login-title { font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 24px; color: var(--text); }
        .hdm-login-field {
            width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
            color: var(--text); padding: 14px 16px; border-radius: var(--radius-md); font-size: 16px;
            font-family: inherit; box-sizing: border-box; margin-bottom: 12px; outline: none; transition: 0.2s;
        }
        :root[data-theme="light"] .hdm-login-field { background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.1); color: #1c1c1e; }
        .hdm-login-field::placeholder { color: var(--text-dim); }
        .hdm-login-field:focus { border-color: var(--accent); background: rgba(255,45,85,0.05); }
        .hdm-login-btn {
            width: 100%; padding: 16px; background: var(--accent-gradient); color: #fff;
            border: none; border-radius: var(--radius-lg); font-size: 17px; font-weight: 800;
            cursor: pointer; margin-top: 8px; box-shadow: 0 8px 20px var(--accent-glow);
            transition: 0.2s; font-family: inherit; letter-spacing: -0.2px;
        }
        .hdm-login-btn:active { transform: scale(0.98); }
        .hdm-login-btn:disabled { opacity: 0.6; cursor: default; }
        .hdm-login-error { color: #ff3b30; font-size: 13px; text-align: center; margin: 10px 0; min-height: 18px; font-weight: 600; }
        .hdm-login-links { text-align: center; margin-top: 22px; font-size: 14px; color: var(--text-dim); line-height: 2; }
        .hdm-login-links a { color: var(--accent); font-weight: 700; text-decoration: none; }
        
        /* Settings & Payments */
        .p-form { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        .p-input-group { display: flex; flex-direction: column; gap: 8px; }
        .p-input-group label { font-size: 13px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; padding-left: 4px; }
        .p-input, .p-select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 16px; color: #fff; font-size: 16px; font-family: inherit; transition: 0.2s; }
        :root[data-theme="light"] .p-input, :root[data-theme="light"] .p-select { background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.1); color: #1c1c1e; }
        .p-input:focus, .p-select:focus { border-color: var(--accent); background: rgba(255,45,85,0.05); }
        .p-submit { background: var(--accent-gradient); color: #fff; border: none; border-radius: 16px; padding: 16px; font-size: 17px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 20px var(--accent-glow); margin-top: 10px; }
        .p-submit:active { transform: scale(0.98); }
        
        .p-avatar-wrap { display: flex; align-items: center; gap: 15px; margin-bottom: 5px; }
        .p-avatar-img { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent); }
        .p-avatar-img img { width: 100%; height: 100%; object-fit: cover; }
        
        .p-currency-bar { display: flex; gap: 10px; overflow-x: auto; padding: 0 20px 15px; scrollbar-width: none; -ms-overflow-style: none; }
        .p-currency-bar::-webkit-scrollbar { display: none; }
        .p-method-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 20px 20px; }
        .p-method-card { background: var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 15px; display: flex; flex-direction: column; gap: 8px; transition: 0.2s; cursor: pointer; }
        .p-method-card.active { border-color: var(--accent); background: rgba(255,45,85,0.05); }
        .p-method-icon { height: 24px; object-fit: contain; width: fit-content; }
        .p-method-name { font-size: 14px; font-weight: 700; color: #fff; }
        :root[data-theme="light"] .p-method-name { color: #1c1c1e; }
        .p-method-desc { font-size: 11px; color: var(--text-dim); line-height: 1.2; }
        
        .p-plans { display: flex; flex-direction: column; gap: 12px; padding: 0 20px 40px; }
        .p-plan-card { background: var(--surface-glass); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
        .p-plan-card:active { transform: scale(0.98); }
        .p-plan-card.active { border-color: var(--accent); background: rgba(255,45,85,0.05); }
        .p-plan-info { display: flex; flex-direction: column; gap: 4px; }
        .p-plan-title { font-size: 16px; font-weight: 700; color: #fff; }
        :root[data-theme="light"] .p-plan-title { color: #1c1c1e; }
        .p-plan-price { font-size: 14px; color: var(--accent); font-weight: 800; }
        .p-plan-discount { background: #ff9500; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; width: fit-content; }

        /* ===== CUSTOM PLAYER UI ===== */
        .hdm-player-overlay {
            position: fixed; inset: 0; z-index: 10001;
            display: flex; flex-direction: column; justify-content: space-between;
            opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
            color: #fff;
        }
        .hdm-player-overlay.show { opacity: 1; pointer-events: auto; }
        .hdm-player-overlay.show-blur { backdrop-filter: blur(10px); background: rgba(0,0,0,0.4); }

        .hdm-player-top {
            padding: calc(15px + var(--safe-top)) 20px 20px;
            display: flex; align-items: center; gap: 15px;
        }
        .hdm-player-back { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border-radius: 50%; color: #fff; border: 1px solid rgba(255,255,255,0.1); }
        .hdm-player-title-wrap { flex: 1; min-width: 0; }
        .hdm-player-title { font-size: 16px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hdm-player-subtitle { font-size: 12px; opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }

        .hdm-player-center {
            position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 40px; pointer-events: none;
        }
        .hdm-player-center > * { pointer-events: auto; }
        .hdm-player-big-btn {
            width: 72px; height: 72px; background: rgba(255,45,85,0.9); border-radius: 50%;
            display: flex; align-items: center; justify-content: center; color: #fff;
            box-shadow: 0 0 30px rgba(255,45,85,0.4); transition: transform 0.2s, background 0.2s;
        }
        .hdm-player-big-btn:active { transform: scale(0.9); background: var(--accent); }
        .hdm-player-side-btn { width: 44px; height: 44px; color: #fff; opacity: 0.8; display: flex; align-items: center; justify-content: center; }

        .hdm-player-bottom { padding: 20px 20px calc(20px + var(--safe-bottom)); display: flex; flex-direction: column; gap: 15px; }
        
        .hdm-player-progress-container { display: flex; align-items: center; gap: 12px; }
        .hdm-player-time { font-size: 12px; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; width: 45px; }
        .hdm-player-scrub { flex: 1; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; position: relative; cursor: pointer; }
        .hdm-player-scrub-buf { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(255,255,255,0.2); border-radius: 2px; width: 0%; }
        .hdm-player-scrub-act { position: absolute; left: 0; top: 0; bottom: 0; background: var(--accent-gradient); border-radius: 2px; width: 0%; }
        .hdm-player-scrub-knob {
            position: absolute; top: 50%; left: 0%; width: 14px; height: 14px; background: #fff;
            border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }

        .hdm-player-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        @media (max-width: 600px) and (orientation: portrait) {
            .hdm-player-actions { flex-direction: column; gap: 15px; }
            .hdm-player-act-group { width: 100%; justify-content: center; flex-wrap: wrap; }
            .hdm-player-bottom { padding: 20px 20px calc(40px + var(--safe-bottom)); background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); }
            .hdm-player-top { background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); }
        }
        .hdm-player-act-group { display: flex; align-items: center; gap: 12px; }
        .hdm-player-act-btn {
            height: 42px; padding: 0 14px; background: rgba(255,255,255,0.08); border-radius: 12px;
            display: flex; align-items: center; gap: 8px; color: #fff; font-size: 13px; font-weight: 700;
            border: 1px solid rgba(255,255,255,0.05); transition: background 0.2s, transform 0.1s;
        }
        .hdm-player-act-btn.icon-only { width: 40px; justify-content: center; padding: 0; }
        .hdm-player-act-btn:active { background: rgba(255,255,255,0.15); transform: scale(0.95); }

        .hdm-vol-slider {
            width: 80px; opacity: 1; transition: width 0.3s, opacity 0.3s, margin 0.3s;
            -webkit-appearance: none; background: rgba(255,255,255,0.2); height: 4px; border-radius: 2px; outline: none;
            margin: 0 5px 0 0; position: static !important;
        }
        .hdm-vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #fff; border-radius: 50%; cursor: pointer; border: none; }

        /* Drawer for selections */
        .hdm-player-drawer {
            position: absolute; bottom: 0; left: 0; right: 0;
            background: rgba(15,15,15,0.98); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
            border-radius: 24px 24px 0 0; border-top: 1px solid rgba(255,255,255,0.1);
            z-index: 10002; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
            max-height: 80%; display: flex; flex-direction: column;
            pointer-events: none; visibility: hidden;
        }
        .hdm-player-drawer.show { transform: translateY(0); pointer-events: auto; visibility: visible; }
        .hdm-player-drawer-head { padding: 20px 20px 10px; display: flex; justify-content: space-between; align-items: center; }
        .hdm-player-drawer-title { font-size: 18px; font-weight: 800; }
        .hdm-player-drawer-body { flex: 1; overflow-y: auto; padding-bottom: 40px; }

        .hdm-loading-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #000; z-index: 5; }

        .hdm-player-big-btn.hdm-buffering {
            background: rgba(255,255,255,0.08); box-shadow: none; pointer-events: none;
        }
        .hdm-player-big-btn.hdm-buffering::after {
            content: ''; display: block;
            width: 30px; height: 30px;
            border: 3px solid rgba(255,255,255,0.2);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
        }
        
        /* Focus & Remote Control Styles */
        .hdm-focusable { outline: none !important; transition: transform 0.2s, box-shadow 0.2s; position: relative; }
        .hdm-focusable.hdm-focused { 
            z-index: 10;
            box-shadow: 0 0 0 3px var(--accent), 0 0 25px var(--accent-glow) !important;
            transform: scale(1.05) !important;
        }
        .m-card.hdm-focused .m-poster { box-shadow: 0 0 20px var(--accent-glow); }
        .nav-link.hdm-focused { background: rgba(255, 45, 85, 0.15); border-radius: 12px; }
        .p-item.hdm-focused { background: rgba(255,255,255,0.1); border-radius: 12px; }
        .pc-item.hdm-focused, .ep-item.hdm-focused { background: var(--accent); color: #fff; box-shadow: 0 0 15px var(--accent-glow); }
        .s-cat-btn.hdm-focused, .pill.hdm-focused, .genre-pill.hdm-focused { background: var(--accent); border-color: transparent; }
        
        body.hdm-remote-mode * { cursor: none !important; }

        /* Double tap ripples */
        .hdm-ripple { position: absolute; width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; pointer-events: none; animation: ripple 0.6s ease-out forwards; }
        @keyframes ripple { from { transform: scale(0.5); opacity: 1; } to { transform: scale(2.5); opacity: 0; } }
    `;

  const ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
    fav: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    coll: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M15 19l-7-7 7-7"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
    profile: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    fwd: `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`,
    rew: `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`,
    vol: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4-.9 7-4.6 7-8.77s-3-7.87-7-8.77z"/></svg>`,
    mute: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
    fullscreen: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
    episodes: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`,
    quality: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM10 6.5h3v1h-3v-1zM10 11.5h3v1h-3v-1zM10 9h3v1h-3v-1z"/></svg>`,
    voice: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.84C16.42 14.24 14.46 16 12 16s-4.42-1.76-4.93-4.16c-.08-.48-.49-.84-.98-.84-.61 0-1.07.54-1 1.15.59 3.3 3.3 5.85 6.91 6.45V20c0 .55.45 1 1 1s1-.45 1-1v-1.4c3.61-.6 6.32-3.15 6.91-6.45.07-.61-.39-1.15-1-1.15z"/></svg>`,
    cc: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 7H9.5V10.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zm7 0h-1.5V10.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z"/></svg>`,
    zoom: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z"/></svg>`,
    pip: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 11h-8v6h8v-6zm4 8V5c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zM3 19V5h18v14H3z"/></svg>`,
    airplay: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 22h12l-6-6-6 6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`
  };

  const State = {
    details: null, translator: null, season: null, episode: null, view: 'home',
    genre: 0, pagination: null, title: null, isNavigating: false, isWatching: false,
    lastProcessedUrl: location.pathname.replace(/\/+$/, '') || '/',
    activeTranslatorId: null, activeSeason: null, activeEpisode: null,
    streamQualities: null, streamQuality: null,
    nativeQualityOverride: null,
    streamSubtitles: null, activeSubtitleId: null,
    zoomMode: parseInt(localStorage.getItem('hdm-zoom-mode') || 0)
  };

  // --- 3. REZKA PARSER (SWIFT PORT) ---
  const RezkaParser = {
    extractPlayerInfo(html, initName) {
      const needle = `sof.tv.${initName}(`;
      const start = html.indexOf(needle);
      if (start === -1) return null;

      let objStart = -1;
      let inString = false;
      let quote = '';
      let escaped = false;

      for (let i = start + needle.length; i < html.length; i++) {
        const ch = html[i];
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (ch === '\\') {
            escaped = true;
          } else if (ch === quote) {
            inString = false;
            quote = '';
          }
          continue;
        }
        if (ch === '"' || ch === "'") {
          inString = true;
          quote = ch;
          continue;
        }
        if (ch === '{') {
          objStart = i;
          break;
        }
      }

      if (objStart === -1) return null;

      let depth = 0;
      inString = false;
      quote = '';
      escaped = false;
      let objEnd = -1;

      for (let i = objStart; i < html.length; i++) {
        const ch = html[i];
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (ch === '\\') {
            escaped = true;
          } else if (ch === quote) {
            inString = false;
            quote = '';
          }
          continue;
        }
        if (ch === '"' || ch === "'") {
          inString = true;
          quote = ch;
          continue;
        }
        if (ch === '{') depth++;
        if (ch === '}') {
          depth--;
          if (depth === 0) {
            objEnd = i + 1;
            break;
          }
        }
      }

      if (objEnd === -1) return null;

      try {
        return Function(`return (${html.slice(objStart, objEnd)});`)();
      } catch (e) {
        console.error('[HDrezka] Failed to parse player info', e);
        return null;
      }
    },

    parseMovies(node) {
      return [...node.querySelectorAll('.b-content__inline_item')].map(el => {
        const link = el.querySelector('.b-content__inline_item-link > a');
        const coverLink = el.querySelector('.b-content__inline_item-cover a');
        const catNode = el.querySelector('.cat');

        let poster = el.querySelector('img')?.src;
        if (!poster) {
          const iTag = el.querySelector('.b-content__inline_item-cover a i');
          const style = iTag?.getAttribute('style');
          const match = style && style.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (match) poster = match[1];
        }

        const metaRow = el.querySelector('.b-content__inline_item-link div:not(.misc)');
        const metaText = metaRow?.textContent.trim() || '';
        const parts = metaText.split(',').map(s => s.trim());

        return {
          url: link?.getAttribute('href') || coverLink?.getAttribute('href') || '',
          poster: poster || '',
          name: (link?.textContent || coverLink?.title || '').trim(),
          rating: catNode?.querySelector('.b-category-bestrating')?.textContent.trim() || '',
          info: el.querySelector('.info')?.textContent.trim() || '',
          year: parts[0] || '',
          country: parts[1] || '',
          genre: parts.slice(2).join(', ') || '',
          type: catNode?.classList.contains('series') ? 'series' :
            catNode?.classList.contains('films') ? 'movie' :
              catNode?.classList.contains('cartoons') ? 'cartoon' :
                catNode?.classList.contains('animation') ? 'anime' :
                  (el.querySelector('.series') ? 'series' : 'movie')
        };
      }).filter(m => m.url && m.url !== '#');
    },

    async parseDetails(html, path) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.querySelector('.b-content__main');
      const getRating = (cls) => {
        const node = content.querySelector(`.b-post__info_rates.${cls}`) ||
          [...content.querySelectorAll('.b-post__info_rates')].find(el => el.textContent.includes(cls === 'imdb' ? 'IMDb' : 'Кинопоиск'));
        if (!node) return null;
        const base64Link = node.querySelector('a')?.href.split('/').filter(Boolean).pop();
        return {
          val: node.querySelector('.bold')?.textContent.trim() || node.textContent.match(/\d\.\d/)?.[0] || '?',
          votes: node.querySelector('i')?.textContent.trim() || '',
          link: base64Link ? atob(base64Link) : null
        };
      };

      const meta = {};
      const infoItems = [...content.querySelectorAll('.b-post__info tr')];
      infoItems.forEach(tr => {
        const label = tr.querySelector('.l')?.textContent.replace(/:/g, '').trim();
        const valNode = tr.querySelector('td:not(.l)');
        if (!label || !valNode) return;
        const clickableLabels = ['Режиссер', 'В ролях', 'Страна', 'Жанр', 'Входит в списки', 'Из серии', 'В ролях актеры'];
        if (clickableLabels.includes(label)) {
          meta[label] = [...valNode.querySelectorAll('a')].map(a => ({
            name: a.textContent.trim(),
            url: a.getAttribute('href'),
            photo: a.closest('.person-name-item')?.getAttribute('data-photo')
          }));
        } else { meta[label] = valNode.textContent.trim(); }
      });

      const postIdMatch = html.match(/post_id:\s*['"]?(\d+)['"]?/i);
      const postId = postIdMatch ? postIdMatch[1] : (content.querySelector('input[name="post_id"]')?.value || path.match(/(\d+)-/)?.[1]);

      const favList = doc.querySelector('#user-favorites-list');
      const isFav = favList ? !!favList.querySelector('input[checked]') : false;

      return {
        postId: postId,
        nameRussian: content.querySelector('.b-post__title')?.textContent.trim(),
        nameOriginal: content.querySelector('.b-post__origtitle')?.textContent.trim(),
        poster: content.querySelector('.b-sidecover img')?.src,
        hposter: content.querySelector('.b-sidecover a')?.href,
        desc: content.querySelector('.b-post__description_text')?.textContent.trim(),
        imdb: getRating('imdb'), kp: getRating('kp'), meta: meta,
        translators: [...doc.querySelectorAll('.b-translator__item')].map(t => ({ id: t.getAttribute('data-translator_id'), name: t.textContent.trim(), active: t.classList.contains('active') })),
        seasons: [...doc.querySelectorAll('.b-simple_season__item')].map(s => {
          const sid = s.getAttribute('data-tab_id');
          return { id: sid, name: s.textContent.trim(), active: s.classList.contains('active'), episodes: [...doc.querySelectorAll(`.b-simple_episode__item[data-season_id="${sid}"]`)].map(e => ({ id: e.getAttribute('data-episode_id'), name: e.textContent.trim(), active: e.classList.contains('active') })) };
        }),
        franchise: [...doc.querySelectorAll('.b-post__partcontent_item')].map(item => ({
          title: item.querySelector('.title')?.textContent.trim() || item.textContent.trim(),
          year: item.querySelector('.year')?.textContent.trim() || '',
          rating: item.querySelector('.rating i')?.textContent.trim() || '',
          url: item.getAttribute('data-url') || '',
          current: item.classList.contains('current')
        })),
        playerInfo: RezkaParser.extractPlayerInfo(html, 'initCDNSeriesEvents') || RezkaParser.extractPlayerInfo(html, 'initCDNMoviesEvents'),
        related: RezkaParser.parseMovies(doc.querySelector('.b-sidelist') || h('div')),
        rating: doc.querySelector('.b-post__rating .num')?.textContent.trim() || 0,
        votes: doc.querySelector('.b-post__rating .votes span')?.textContent.trim() || '',
        isFav: isFav
      };
    },

    async parsePerson(html, path) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.querySelector('.b-content__main');
      if (!content) return null;

      const meta = {};
      const infoItems = [...content.querySelectorAll('.b-post__info tr')];
      infoItems.forEach(tr => {
        const label = tr.querySelector('.l')?.textContent.replace(/:/g, '').trim();
        const valNode = tr.querySelector('td:not(.l)');
        if (label && valNode) meta[label] = valNode.textContent.trim();
      });

      return {
        nameRussian: content.querySelector('.b-post__title .t1')?.textContent.trim() || content.querySelector('.b-post__title h1')?.textContent.trim(),
        nameOriginal: content.querySelector('.b-post__title .t2')?.textContent.trim(),
        poster: content.querySelector('.b-sidecover img')?.src,
        meta: meta,
        films: RezkaParser.parseMovies(content.querySelector('.b-person__career') || content)
      };
    },

    syncPlayerState() {
      const getActive = (sel) => {
        const el = document.querySelector(sel);
        return el ? { id: el.getAttribute('data-translator_id') || el.getAttribute('data-tab_id') || el.getAttribute('data-episode_id'), name: el.textContent.trim() } : null;
      };

      return {
        translator: getActive('#translators-list .active, .b-translator__item.active'),
        season: getActive('#simple-seasons-tabs .active, .b-simple_season__item.active'),
        episode: getActive('.b-simple_episodes__list .active, .b-simple_episode__item.active'),
        translators: [...document.querySelectorAll('#translators-list .b-translator__item')].map(t => ({ id: t.getAttribute('data-translator_id'), name: t.textContent.trim(), active: t.classList.contains('active') })),
        seasons: [...document.querySelectorAll('#simple-seasons-tabs .b-simple_season__item')].map(s => ({ id: s.getAttribute('data-tab_id'), name: s.textContent.trim(), active: s.classList.contains('active') })),
        episodes: [...document.querySelectorAll('.b-simple_episodes__list:not([style*="display: none"]) .b-simple_episode__item')].map(e => ({ id: e.getAttribute('data-episode_id'), name: e.textContent.trim(), active: e.classList.contains('active') }))
      };
    },

    async getHistory() {
      try {
        const html = await req('/continue/');
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return [...doc.querySelectorAll('.b-videosaves__list_item')].map(el => {
          const titleA = el.querySelector('.td.title a');
          const infoSpan = el.querySelector('.td.info span');
          const small = el.querySelector('.td.title small');
          return {
            url: titleA?.getAttribute('href') || '',
            poster: titleA?.getAttribute('data-cover_url') || '',
            name: titleA?.textContent.trim() || '',
            info: infoSpan?.textContent.trim() || small?.textContent.trim() || '',
            date: el.querySelector('.td.date')?.textContent.trim() || '',
            isSeries: !!small
          };
        }).filter(h => h.url);
      } catch (e) {
        console.error("History parse fail", e);
        return [];
      }
    },

    parseCollections(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return [...doc.querySelectorAll('.b-content__collections_item')].map(el => ({
        url: el.getAttribute('data-url') || '',
        name: el.querySelector('.title-layer a')?.textContent.trim() || '',
        poster: el.querySelector('img')?.getAttribute('src') || '',
        count: el.querySelector('.num-holder .fb-1')?.textContent.trim() || ''
      }));
    },

    parseBookmarks(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return [...doc.querySelectorAll('.b-favorites_content__cats_list_item')].map(el => ({
        id: el.getAttribute('data-cat_id'), name: el.querySelector('.name')?.textContent.trim(), count: el.querySelector('.num-holder .fb-1')?.textContent.trim()
      }));
    },
    parseUpdates(doc) {
      const items = [...doc.querySelectorAll('.b-seriesupdate__block_list_item')];
      if (items.length) {
        return items.map(el => ({
          url: el.querySelector('a')?.href || '',
          name: el.querySelector('a')?.textContent.trim() || '',
          season: el.querySelector('.season')?.textContent.trim() || '',
          ep: el.querySelector('.cell-2')?.textContent.replace(el.querySelector('.cell-2 i')?.textContent || '', '').trim() || '',
          voice: el.querySelector('.cell-2 i')?.textContent.trim() || '',
          date: el.querySelector('.b-seriesupdate__block_date')?.childNodes[0]?.textContent.trim() || ''
        }));
      }
      return [...doc.querySelectorAll('.b-content__inline_item')].map(el => {
        const info = el.querySelector('.info')?.textContent.trim() || '';
        const parts = info.split(',');
        return {
          url: el.querySelector('a')?.href || '',
          name: (el.querySelector('.b-content__inline_item-link a')?.textContent || '').trim(),
          season: parts[0]?.trim() || '',
          ep: parts[1]?.trim() || '',
          voice: el.querySelector('.info i')?.textContent.trim() || '',
          date: '',
          poster: el.querySelector('img')?.src || ''
        };
      }).filter(m => m.url);
    },
    parseWatchingLater(doc) {
      return [...doc.querySelectorAll('.b-videosaves__list_item')].map(el => {
        const a = el.querySelector('.td.title a');
        return { url: a?.href || '', name: (a?.textContent || '').trim(), poster: a?.getAttribute('data-cover_url') || '', info: el.querySelector('.td.info span')?.textContent.trim() || '' };
      }).filter(m => m.url);
    },
    parseSettings(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const genderSelect = doc.querySelector('#gender');
      const genderValue = genderSelect ? ([...genderSelect.options].find(o => o.hasAttribute('selected'))?.value || genderSelect.value) : '0';
      return {
        email: doc.querySelector('#email')?.value || '',
        gender: genderValue,
        avatar: doc.querySelector('#avatar-profile img')?.src || '',
        userId: doc.querySelector('input[name="username_id"]')?.value || '',
        hash: doc.querySelector('input[name="dle_allow_hash"]')?.value || ''
      };
    },
    parseSecurity(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return {
        userId: doc.querySelector('input[name="username_id"]')?.value || '',
        hash: doc.querySelector('input[name="dle_allow_hash"]')?.value || ''
      };
    },
    parsePayments(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const currentCurrency = doc.querySelector('.currency-pay-dropdown-current')?.textContent.trim().replace(/\s+/g, ' ') || '';
      const currencyList = [...doc.querySelectorAll('.currency-pay-dropdown-list a')].map(a => ({
        url: a.getAttribute('href'),
        text: a.textContent.trim().replace(/\s+/g, ' ')
      }));
      const paymentMethods = [...doc.querySelectorAll('.b-payments-method-switcher input')].map(input => {
        const label = doc.querySelector(`label[for="${input.id}"]`);
        return {
          id: input.id,
          value: input.value,
          name: label?.querySelector('div')?.textContent.trim() || label?.textContent.trim(),
          desc: label?.textContent.trim().replace(label?.querySelector('div')?.textContent || '', '').trim(),
          icon: label?.getAttribute('data-icon_url')
        };
      });
      const plans = [];
      doc.querySelectorAll('.price-list-inner > div').forEach(group => {
        const methodCls = group.className;
        [...group.querySelectorAll('.pl-item')].forEach(item => {
          const input = item.querySelector('input');
          const label = item.querySelector('label');
          plans.push({
            method: methodCls.replace('-prices', ''),
            id: input?.id,
            value: input?.value,
            name: input?.name,
            title: label?.querySelector('.pl-title')?.textContent.trim().replace(/\s+/g, ' '),
            price: label?.querySelector('.pl-price')?.textContent.trim().replace(/\s+/g, ' '),
            discount: label?.querySelector('.pl-discount')?.textContent.trim()
          });
        });
      });
      return { currentCurrency, currencyList, paymentMethods, plans, email: doc.querySelector('#pay-proccess-email-confirmation b')?.textContent.trim() };
    }
  };

  // --- 4. UTILS & HELPERS ---
  // Detects the mirror's login-gate page (returns 404 with a login form)
  function isLoginGate(html) {
    return !!(html && (html.includes('id="check-form"') || html.includes("id='check-form'")));
  }

  function normalizePath(p) {
    if (!p) return '/';
    try {
      const u = new URL(p, location.origin);
      return u.pathname.replace(/\/+$/, '') || '/';
    } catch (e) {
      return (p.split('?')[0] || '/').replace(/\/+$/, '') || '/';
    }
  }

  function decrypt(enc) {
    if (!enc || !enc.startsWith('#')) return enc || '';
    const trash = (() => {
      const chars = ['@', '#', '!', '^', '$'];
      const out = [];
      for (const a of chars) for (const b of chars) out.push(btoa(a + b));
      for (const a of chars) for (const b of chars) for (const c of chars) out.push(btoa(a + b + c));
      return out;
    })();
    const cache = new Map();
    function rec(str) {
      if (cache.has(str)) return cache.get(str);
      let pos = str.indexOf('//_//');
      if (pos === -1) return str;
      let after = str.slice(pos + 5);
      let splitIdx = after.search(/\/|=/);
      let beforeSlash = splitIdx === -1 ? after : after.slice(0, splitIdx + 1);
      let suffix = splitIdx === -1 ? '' : after.slice(splitIdx + 1);
      let cleared = trash.reduce((acc, t) => acc.split(t).join(''), beforeSlash);
      let result = rec(str.slice(0, pos) + cleared + suffix);
      cache.set(str, result); return result;
    }
    try { return atob(rec(enc.slice(2))); } catch { return ''; }
  }

  function showPrompt(title, placeholder, saveText, onSave) {
    let overlay = document.getElementById('hdm-custom-prompt');
    let input = document.getElementById('hdm-prompt-input');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'hdm-custom-prompt';
      overlay.className = 'hdm-prompt-overlay';
      document.getElementById('hdm-app').appendChild(overlay);

      overlay.innerHTML = `
              <div class="hdm-prompt-box">
                  <h3 id="hdm-prompt-title"></h3>
                  <input type="text" id="hdm-prompt-input">
                  <div class="hdm-prompt-actions">
                      <button id="hdm-prompt-cancel">Отмена</button>
                      <button id="hdm-prompt-save"></button>
                  </div>
              </div>
          `;
      input = overlay.querySelector('#hdm-prompt-input');
      overlay.querySelector('#hdm-prompt-cancel').onclick = () => overlay.classList.remove('show');
    } else {
      input = overlay.querySelector('#hdm-prompt-input');
    }

    overlay.querySelector('#hdm-prompt-title').textContent = title;
    if (placeholder) {
      input.placeholder = placeholder;
      input.value = '';
      input.style.display = 'block';
    } else {
      input.style.display = 'none';
    }

    const saveBtn = overlay.querySelector('#hdm-prompt-save');
    saveBtn.textContent = saveText;
    saveBtn.onclick = async () => {
      const val = input.value.trim();
      if (placeholder && !val) return;
      overlay.classList.remove('show');
      if (onSave) await onSave(val);
    };

    overlay.classList.add('show');
    if (placeholder) setTimeout(() => input.focus(), 100);
  }

  function triggerNativeClick(el) {
    if (!el) return;
    try {
      // For mobile compatibility (iOS)
      if (typeof TouchEvent !== 'undefined') {
        const t = new Touch({ identifier: Date.now(), target: el, clientX: 0, clientY: 0 });
        el.dispatchEvent(new TouchEvent('touchstart', { touches: [t], targetTouches: [t], changedTouches: [t], bubbles: true, cancelable: true }));
        el.dispatchEvent(new TouchEvent('touchend', { touches: [], targetTouches: [], changedTouches: [t], bubbles: true, cancelable: true }));
      }
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      el.click();
    } catch (e) {
      console.error('[HDrezka] Trigger click fail', e);
      el.click();
    }
  }

  async function req(path, params = null, retries = 3) {
    let url = path.startsWith('http') ? path : (location.origin + '/' + path.replace(/^\//, ''));
    const opts = { credentials: 'include' };
    if (params) {
      if (params.method === 'POST') {
        const fd = new URLSearchParams();
        Object.keys(params).forEach(k => { if (k !== 'method') fd.append(k, params[k]); });
        opts.method = 'POST'; opts.body = fd;
      } else { url += (url.includes('?') ? '&' : '?') + new URLSearchParams(params).toString(); }
    }
    if (url.includes('ajax')) url += (url.includes('?') ? '&' : '?') + 't=' + Date.now();

    for (let i = 0; i < retries; i++) {
      try {
        document.body.classList.remove('loader-bar-done');
        document.body.classList.add('loader-bar-active');
        const r = await fetch(url, opts);
        document.body.classList.replace('loader-bar-active', 'loader-bar-done');
        if (r.status === 503 && i < retries - 1) {
          await new Promise(res => setTimeout(res, 300 * (i + 1)));
          continue;
        }
        return r.headers.get('content-type')?.includes('json') ? r.json() : r.text();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(res => setTimeout(res, 300 * (i + 1)));
      }
    }
  }

  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    Object.keys(props).forEach(k => {
      if (k.startsWith('on')) el.addEventListener(k.toLowerCase().slice(2), props[k]);
      else el.setAttribute(k, props[k]);
    });
    children.flat().forEach(c => {
      if (c === null || c === undefined || c === false) return;
      if (typeof c === 'string' || typeof c === 'number') {
        const str = String(c);
        if (str.trim().startsWith('<svg')) el.insertAdjacentHTML('beforeend', str);
        else el.appendChild(document.createTextNode(str));
      } else if (c instanceof Node) {
        el.appendChild(c);
      } else {
        console.warn('[HDrezka] Unexpected child in h():', c);
      }
    });
    return el;
  }

  function closeModal() {
    const existing = document.querySelector('.hdm-modal-base.hdm-active');
    const backdrop = document.getElementById('hdm-fav-backdrop');
    if (existing) {
      existing.classList.remove('hdm-shown');
      if (backdrop) backdrop.classList.remove('show');
      setTimeout(() => {
        existing.classList.remove('hdm-active');
        existing.style.transform = '';
      }, 350);
    } else if (backdrop) {
      backdrop.classList.remove('show');
    }
  }

  function renderMovieCard(m, small = false) {
    return h('div', { class: 'm-card hdm-focusable' + (small ? ' small' : ''), onClick: () => navigateTo(m.url) },
      h('div', { class: 'm-poster' },
        h('img', { src: m.poster, loading: 'lazy' }),
        m.rating ? h('div', { class: 'm-rating' }, '★ ' + m.rating) : null,
        (() => {
          const labels = { series: 'СЕРИАЛ', movie: 'КИНО', cartoon: 'МУЛЬТФИЛЬМ', anime: 'АНИМЕ' };
          return h('div', { class: `m-type ${m.type}` }, labels[m.type] || 'КИНО');
        })(),
        m.count ? h('div', { class: 'm-count' }, m.count) : null
      ),
      h('div', { class: 'm-title' }, m.name),
      m.info ? h('div', { class: 'm-meta' }, m.info) : (m.meta ? h('div', { class: 'm-meta' }, m.meta.split(',')[0]) : null)
    );
  }

  function renderCollectionCard(c, small = false) {
    return h('div', { class: 'coll-card hdm-focusable' + (small ? ' small' : ''), onClick: () => navigateTo(c.url) },
      h('img', { src: c.poster, loading: 'lazy' }),
      h('div', { class: 'coll-meta' },
        h('div', { class: 'coll-title' }, c.name),
        h('div', { class: 'coll-count' }, c.count)
      )
    );
  }

  function ensureFavHeaderActions() {
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !headerRight.querySelector('.fav-create-top')) {
      headerRight.appendChild(h('div', {
        class: 'fav-header-btn fav-create-top', onClick: () => {
          showPrompt('Новый раздел', 'Название раздела', 'Создать', async (val) => {
            try {
              const fd = new URLSearchParams();
              fd.append('action', 'add_cat'); fd.append('name', val);
              await fetch('/ajax/favorites/', { method: 'POST', body: fd, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' } });
              if (State.viewNamespace === 'favorites') loadFavorites();
            } catch (e) { }
          });
        }
      }, ICONS.plus));
    }
  }

  // --- 5. NAVIGATION & VIEWS ---
  function updateHeaderTitle(title) {
    const headTitle = document.querySelector('.header-title');
    if (headTitle) headTitle.textContent = title;
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      const oldPlus = headerRight.querySelector('.fav-create-top');
      if (oldPlus) oldPlus.remove();
    }
  }

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // --- 4b. PLAYBACK UTILS ---
  const Timecode = {
    getKey(postId, tId, sId, eId) {
      return `hdm-tc-${postId}-${tId}-${sId || 0}-${eId || 0}`;
    },
    save(postId, tId, sId, eId, time) {
      if (time < 5) return;
      localStorage.setItem(this.getKey(postId, tId, sId, eId), Math.floor(time));
    },
    get(postId, tId, sId, eId) {
      return parseInt(localStorage.getItem(this.getKey(postId, tId, sId, eId)) || 0);
    }
  };

  const FocusManager = {
    current: null,
    isRemote: false,

    init() {
      window.addEventListener('keydown', (e) => this.onKeyDown(e));
      window.addEventListener('mousemove', () => {
        if (this.isRemote) {
          this.isRemote = false;
          document.body.classList.remove('hdm-remote-mode');
        }
      });
    },

    setFocus(el, scroll = true) {
      if (!el) return;
      if (this.current) this.current.classList.remove('hdm-focused');
      this.current = el;
      this.current.classList.add('hdm-focused');
      if (scroll) {
        this.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
      if (!this.isRemote) {
        this.isRemote = true;
        document.body.classList.add('hdm-remote-mode');
      }
    },

    onKeyDown(e) {
      if (State.isWatching) {
        const v = document.querySelector('#hdm-player-wrap video');
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          const playBtn = document.querySelector('.hdm-player-big-btn');
          if (playBtn) playBtn.click();
          return;
        }
        if (e.key === 'ArrowRight') { if (v) v.currentTime += 10; return; }
        if (e.key === 'ArrowLeft') { if (v) v.currentTime -= 10; return; }
        if (e.key === 'ArrowUp') { if (v) v.volume = Math.min(1, v.volume + 0.1); return; }
        if (e.key === 'ArrowDown') { if (v) v.volume = Math.max(0, v.volume - 0.1); return; }
        if (e.key === 'Backspace' || e.key === 'Escape') {
          e.preventDefault();
          const closeBtn = document.querySelector('.hdm-player-back');
          if (closeBtn) closeBtn.click();
          return;
        }
      }

      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Escape'];
      if (!keys.includes(e.key)) return;

      if (!this.isRemote) {
        this.isRemote = true;
        document.body.classList.add('hdm-remote-mode');
        if (!this.current) {
          this.focusFirst();
          if (this.current) e.preventDefault();
          return;
        }
      }

      if (e.key === 'Enter') {
        if (this.current) {
          e.preventDefault();
          this.current.click();
        }
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Escape') {
        const modal = document.querySelector('.hdm-modal-base.hdm-active');
        if (modal) {
          e.preventDefault();
          closeModal();
        } else if (document.body.classList.contains('can-back')) {
          e.preventDefault();
          history.back();
        }
        return;
      }

      e.preventDefault();
      this.move(e.key);
    },

    move(dir) {
      const focusables = Array.from(document.querySelectorAll('.hdm-focusable:not([style*="display: none"])')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (!focusables.length) return;

      if (!this.current || !focusables.includes(this.current)) {
        this.setFocus(focusables[0]);
        return;
      }

      const curRect = this.current.getBoundingClientRect();
      const curCenter = { x: curRect.left + curRect.width / 2, y: curRect.top + curRect.height / 2 };

      let best = null;
      let minScore = Infinity;

      focusables.forEach(el => {
        if (el === this.current) return;
        const r = el.getBoundingClientRect();
        const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };

        const dx = center.x - curCenter.x;
        const dy = center.y - curCenter.y;

        let isCorrectDir = false;
        if (dir === 'ArrowUp') isCorrectDir = dy < -5;
        if (dir === 'ArrowDown') isCorrectDir = dy > 5;
        if (dir === 'ArrowLeft') isCorrectDir = dx < -5;
        if (dir === 'ArrowRight') isCorrectDir = dx > 5;

        if (!isCorrectDir) return;

        // Scoring: primary distance + secondary distance weighted
        // We favor elements that are more aligned in the primary direction
        const distSq = dx * dx + dy * dy;
        let score = distSq;

        if (dir === 'ArrowUp' || dir === 'ArrowDown') score += Math.abs(dx) * 2;
        else score += Math.abs(dy) * 2;

        if (score < minScore) {
          minScore = score;
          best = el;
        }
      });

      if (best) this.setFocus(best);
    },

    focusFirst() {
      const el = document.querySelector('.hdm-focusable:not([style*="display: none"])');
      if (el) this.setFocus(el);
    }
  };

  function findNextEpisode() {
    if (!State.details || !State.details.seasons.length) return null;
    const seasons = State.details.seasons;
    const sIdx = seasons.findIndex(s => s.id === State.activeSeason);
    if (sIdx === -1) return null;
    const episodes = seasons[sIdx].episodes;
    const eIdx = episodes.findIndex(e => e.id === State.activeEpisode);
    if (eIdx !== -1 && eIdx < episodes.length - 1) {
      return { seasonId: seasons[sIdx].id, episodeId: episodes[eIdx + 1].id };
    } else if (sIdx < seasons.length - 1) {
      const nextS = seasons[sIdx + 1];
      if (nextS.episodes && nextS.episodes.length) {
        return { seasonId: nextS.id, episodeId: nextS.episodes[0].id };
      }
    }
    return null;
  }

  // --- History API Interception ---
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  const handleUrlChange = (url) => {
    if (!url || State.isNavigating) return;
    const normPath = normalizePath(url);

    // If only hash changed on a movie page, lastProcessedUrl stays same, so we return.
    if (normPath === State.lastProcessedUrl) return;

    console.debug('[HDrezka] URL changed to:', normPath);
    State.lastProcessedUrl = normPath;

    if (/\/\d+-.*\.html/.test(normPath)) {
      loadDetailsView(normPath, true);
    } else if (/\/person\//.test(normPath)) {
      loadPersonView(normPath);
    } else {
      navigateTo(normPath, null, true);
    }
  };

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleUrlChange(args[2]);
  };
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleUrlChange(args[2]);
  };

  async function navigateTo(path, viewNamespace = null, bypass = false, initialTitle = null) {
    if (path.includes('/logout')) { window.location.href = path; return; }

    const normPath = normalizePath(path);
    const currentNorm = normalizePath(location.pathname);

    State.lastProcessedUrl = normPath;
    State.isNavigating = true;
    if (State.details?.hijackInterval) clearInterval(State.details.hijackInterval);

    const isMoviePage = /\/\d+-.*\.html/.test(normPath);
    const isPersonPage = /\/person\//.test(normPath);

    if (!bypass && normPath !== currentNorm) {
      history.pushState({ path: normPath, viewNamespace }, '', path);
    }
    document.body.classList.toggle('is-detail', isMoviePage);

    const isRoot = path === '/' || (path.startsWith('/search/') && !path.includes('q=')) || path === '/favorites/' || path === '/profile/';
    const isSearchHome = viewNamespace === 'search' && !path.includes('q=');
    document.body.classList.toggle('can-back', !isRoot && !isSearchHome);

    document.body.classList.remove('hdm-login-mode');

    // Pages that require auth — redirect to login if not logged in
    const _protectedPaths = ['/favorites/', '/settings/', '/settings/security/', '/payments/'];
    if (_protectedPaths.some(p => path.startsWith(p)) && !await isLoggedIn()) {
      State.isNavigating = false;
      loadLoginView();
      return;
    }

    const favBtn = document.querySelector('.fav-header-btn');
    if (favBtn) favBtn.style.display = isMoviePage ? 'block' : 'none';

    const main = document.querySelector('main'); if (!main) return;
    main.innerHTML = '<div class="loader-wrap"><div class="m-loader"></div></div>';

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    let pageTitle = 'HDrezka';

    if (path === '/') {
      document.querySelector('.nav-link[data-v="home"]')?.classList.add('active');
      pageTitle = 'Главная';
    } else if (path === '/profile/' || viewNamespace === 'profile') {
      document.querySelector('.nav-link[data-v="profile"]')?.classList.add('active');
      pageTitle = 'Профиль';
    } else if (path.includes('/favorites/')) {
      document.querySelector('.nav-link[data-v="fav"]')?.classList.add('active');
      pageTitle = 'Закладки';
    } else if (path.includes('/collections/')) {
      pageTitle = 'Подборки';
    } else if (path.includes('/search/') || viewNamespace === 'search') {
      document.querySelector('.nav-link[data-v="search"]')?.classList.add('active');
      pageTitle = 'Поиск';
    } else if (path === '/settings/') {
      pageTitle = 'Настройки';
    } else if (path === '/settings/security/') {
      pageTitle = 'Безопасность';
    } else if (path === '/payments/') {
      pageTitle = 'Платежи';
    }

    if (pageTitle === 'HDrezka' && path !== '/' && !isMoviePage) {
      const cleanPath = path.split('?')[0].replace(/\/+$/, '');
      const segments = cleanPath.split('/').filter(Boolean);
      if (segments.length) {
        pageTitle = segments[segments.length - 1].split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      }
    }

    if (initialTitle) pageTitle = initialTitle;
    State.title = pageTitle;

    updateHeaderTitle(pageTitle);

    if (viewNamespace === 'search' || (path.startsWith('/search/') && !path.includes('q='))) await loadSearchView();
    else if (viewNamespace === 'favorites' || (path.split('?')[0] === '/favorites/' && !path.includes('cat_id'))) await loadFavorites();
    else if (viewNamespace === 'profile' || path === '/profile/') await loadProfileView();
    else if (path === '/settings/') await loadSettingsView();
    else if (path === '/settings/security/') await loadSecurityView();
    else if (path === '/payments/') await loadPaymentsView();
    else if (viewNamespace === 'collections' || path.split('?')[0] === '/collections/') await loadCollections();
    else if (path === '/') await loadHome();
    else if (path !== '/' && !isMoviePage) {
      await loadPaginatedList(path, pageTitle);
    }

    closeModal();

    if (path.includes('/favorites/')) ensureFavHeaderActions();
    if (isMoviePage) await loadDetailsView(path);
    else if (isPersonPage) await loadPersonView(path);
    State.isNavigating = false;

    // Focus first element on new page after render
    setTimeout(() => {
      if (FocusManager.isRemote) FocusManager.focusFirst();
    }, 500);
  }

  function renderList(html, title) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const movies = RezkaParser.parseMovies(doc);
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.appendChild(h('div', { class: 'hdm-section-head' }, title));
    const grid = h('div', { class: 'movie-grid' });
    movies.forEach(m => grid.appendChild(renderMovieCard(m)));
    main.appendChild(grid);
  }

  function renderSection(title, items, moreUrl, isUpdates = false, isCollections = false) {
    if (!items || !items.length) return null;
    let head = h('div', { class: 'section-header' },
      h('h2', { class: 'hdm-section-head' }, title)
    );
    if (moreUrl && !isUpdates) {
      let moreBtn = h('div', { class: 'section-more', onClick: () => navigateTo(moreUrl, null, false, title) }, 'Все');
      head.appendChild(moreBtn);
    }
    let listContainer = h('div', { class: 'h-scroll' });
    items.forEach(itm => {
      if (isUpdates) {
        listContainer.appendChild(h('div', { class: 'update-card', onClick: () => navigateTo(itm.url) },
          h('div', { class: 'upd-title' }, itm.name),
          h('div', { class: 'upd-season' }, itm.season),
          h('div', { class: 'upd-ep' }, itm.ep + (itm.voice ? ` · ${itm.voice}` : '')),
          h('div', { class: 'upd-date' }, itm.date)
        ));
      } else if (isCollections) {
        listContainer.appendChild(renderCollectionCard(itm, true));
      } else {
        const card = renderMovieCard(itm, true);
        card.onclick = (e) => {
          e.preventDefault();
          navigateTo(itm.url, 'detail');
        };
        listContainer.appendChild(card);
      }
    });
    return h('div', {}, head, listContainer);
  }

  async function loadHome() {
    const main = document.querySelector('main');
    main.innerHTML = '';

    const genres = [
      { id: 0, name: 'Все' }, { id: 1, name: 'Фильмы' },
      { id: 2, name: 'Сериалы' }, { id: 3, name: 'Мультфильмы' }, { id: 82, name: 'Аниме' }
    ];

    const genreWrap = h('div', { class: 'genre-scroll' }, genres.map(g =>
      h('div', {
        class: `genre-pill hdm-focusable ${State.genre === g.id ? 'active' : ''}`,
        onClick: () => { State.genre = g.id; loadHome(); }
      }, g.name)
    ));
    main.appendChild(genreWrap);

    const contentWrap = h('div', { id: 'hm-content' }, '<div class="loader-wrap"><div class="m-loader"></div></div>');
    main.appendChild(contentWrap);

    const buildParams = (filter) => `/?filter=${filter}${State.genre !== 0 ? '&genre=' + State.genre : ''}`;

    try {
      const buildMoreUrl = (filter) => filter === '/' ? '/new/' : `/?filter=${filter}${State.genre !== 0 ? '&genre=' + State.genre : ''}`;

      const loggedIn = await isLoggedIn();
      const reqs = [
        ...(loggedIn ? [{ key: 'cont', url: '/continue/', title: 'Продолжить просмотр', more: '/continue/' }] : []),
        { key: 'colls', url: '/collections/', title: 'Подборки', more: '/collections/' },
        { key: 'last', url: buildParams('last'), title: 'Новинки', more: buildMoreUrl('last') },
        { key: 'pop', url: buildParams('popular'), title: 'Популярные', more: buildMoreUrl('popular') },
        { key: 'updates', url: '/', title: 'Обновления сериалов', more: '/series/' },
        { key: 'watching', url: buildParams('watching'), title: 'Смотрят сейчас', more: buildMoreUrl('watching') },
        { key: 'soon', url: buildParams('soon'), title: 'Ожидаемые', more: buildMoreUrl('soon') }
      ];

      const renderSkeletonSection = (title, key) => {
        let cardBuilder = () => h('div', { class: 'm-sk-card' },
          h('div', { class: 'skeleton m-sk-poster' }),
          h('div', { class: 'skeleton m-sk-title' }),
          h('div', { class: 'skeleton m-sk-meta' })
        );
        if (key === 'colls') {
          cardBuilder = () => h('div', { class: 'coll-sk-card' },
            h('div', { class: 'skeleton coll-sk-poster' }),
            h('div', { class: 'skeleton m-sk-title' })
          );
        } else if (key === 'updates') {
          cardBuilder = () => h('div', { class: 'upd-sk-card' },
            h('div', { class: 'skeleton upd-sk-line', style: 'width:80%' }),
            h('div', { class: 'skeleton upd-sk-line', style: 'width:40%;height:10px' }),
            h('div', { class: 'skeleton upd-sk-line', style: 'width:60%;height:10px' })
          );
        }

        return h('div', { class: 'sk-section' },
          h('div', { class: 'section-header' }, h('h2', { class: 'hdm-section-head' }, title)),
          h('div', { class: 'h-scroll' }, [1, 2, 3, 4, 5].map(() => cardBuilder()))
        );
      };

      contentWrap.innerHTML = '';
      const sectionMounts = {};
      reqs.forEach(r => {
        const m = h('div', { id: 'sk-' + r.key }, renderSkeletonSection(r.title, r.key));
        contentWrap.appendChild(m);
        sectionMounts[r.key] = m;
      });

      for (const r of reqs) {
        try {
          const html = await req(r.url);
          if (isLoginGate(html)) {
            _cachedAuth = false;
            State.isNavigating = false;
            loadLoginView();
            return;
          }
          const doc = new DOMParser().parseFromString(html, 'text/html');
          let items = [];

          if (r.key === 'cont') items = RezkaParser.parseWatchingLater(doc).slice(0, 10);
          else if (r.key === 'updates') items = RezkaParser.parseUpdates(doc).slice(0, 12);
          else if (r.key === 'colls') items = RezkaParser.parseCollections(html).slice(0, 5);
          else items = RezkaParser.parseMovies(doc.querySelector('.b-content__inline') || doc);

          if (items && items.length) {
            const section = renderSection(r.title, items, r.more, r.key === 'updates', r.key === 'colls');
            sectionMounts[r.key].innerHTML = '';
            sectionMounts[r.key].appendChild(section);
          } else {
            sectionMounts[r.key].remove();
          }
          await new Promise(res => setTimeout(res, 100));
        } catch (e) {
          console.warn(`Failed to load section ${r.title}`, e);
          sectionMounts[r.key].innerHTML = `<div style="padding:20px;text-align:center;color:var(--accent);font-size:12px;" onClick="location.reload()">Не удалось загрузить ${r.title}. Нажмите для повтора</div>`;
        }
      }

      // If every section was removed (e.g. server returns 404 for all requests), show error
      if (!contentWrap.children.length) {
        contentWrap.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--text-dim);font-size:15px;line-height:1.6;">Сервер недоступен или вернул ошибку.<br>Проверьте подключение к интернету или попробуйте обновить страницу.<br><br><span style="color:var(--accent);font-weight:700;cursor:pointer;" onclick="location.reload()">Обновить</span></div>';
      }
    } catch (e) {
      contentWrap.innerHTML = '<div style="text-align:center;padding:50px;color:var(--accent);">Ошибка сети</div>';
    }
  }

  function renderFilterScroll(baseUrl) {
    const urlObj = new URL(baseUrl, location.origin);
    const activeFilter = urlObj.searchParams.get('filter') || '';

    const filters = [
      { id: '', name: 'Все' },
      { id: 'popular', name: 'Популярные' },
      { id: 'watching', name: 'Смотрят сейчас' },
      { id: 'soon', name: 'Ожидаемые' },
      { id: 'last', name: 'Новинки' }
    ];

    return h('div', { class: 'filter-scroll' }, filters.map(f => {
      return h('div', {
        class: `filter-pill ${activeFilter === f.id ? 'active' : ''}`,
        onClick: (e) => {
          e.preventDefault();
          const targetUrl = new URL(baseUrl, location.origin);
          if (f.id) targetUrl.searchParams.set('filter', f.id);
          else targetUrl.searchParams.delete('filter');
          navigateTo(targetUrl.pathname + targetUrl.search);
        }
      }, f.name);
    }));
  }

  async function loadPaginatedList(baseUrl, titleStr) {
    const main = document.querySelector('main');
    main.innerHTML = '';

    main.appendChild(renderFilterScroll(baseUrl));

    const grid = h('div', { class: 'page-grid' });
    const loader = h('div', { class: 'page-end-loader' }, h('div', { class: 'm-loader' }));
    main.appendChild(grid);
    main.appendChild(loader);

    State.pagination = { base: baseUrl, page: 1, loading: false, hasMore: true };

    const loadPage = async () => {
      if (State.pagination.loading || !State.pagination.hasMore) return;
      State.pagination.loading = true;
      loader.style.display = 'flex';

      let url = State.pagination.base;
      if (State.pagination.page > 1) {
        if (url.includes('?')) url = url.replace('?', `page/${State.pagination.page}/?`);
        else url = url.endsWith('/') ? `${url}page/${State.pagination.page}/` : `${url}/page/${State.pagination.page}/`;
      }

      try {
        const html = await req(url);
        const doc = new DOMParser().parseFromString(html, 'text/html');

        if (State.pagination.page === 1) {
          let realTitle = doc.querySelector('.b-content__main h1')?.textContent.trim() || doc.querySelector('h1')?.textContent.trim();
          if (realTitle === 'Мои закладки' || !realTitle) realTitle = (State.title && State.title !== 'HDrezka') ? State.title : 'Закладки';
          if (realTitle) updateHeaderTitle(realTitle);
          if (url.includes('/favorites/')) ensureFavHeaderActions();
        }

        let items = [];
        if (url.includes('/new/')) {
          items = RezkaParser.parseUpdates(doc);
          items.forEach(itm => {
            const card = h('div', { class: 'update-card', onClick: () => navigateTo(itm.url || itm.href) },
              itm.poster ? h('div', { class: 'm-poster', style: 'margin-bottom:8px' }, h('img', { src: itm.poster })) : null,
              h('div', { class: 'upd-title' }, itm.name),
              h('div', { class: 'upd-season' }, itm.season),
              h('div', { class: 'upd-ep' }, itm.ep + (itm.voice ? ` · ${itm.voice}` : ''))
            );
            if (itm.date) card.appendChild(h('div', { class: 'upd-date' }, itm.date));
            grid.appendChild(card);
          });
        } else {
          items = url.includes('/continue/') ? RezkaParser.parseWatchingLater(doc) : RezkaParser.parseMovies(doc);
          items.forEach(m => {
            const card = renderMovieCard(m);
            // Ensure cards from 'Continue Watching' or categories also trigger the player
            card.onclick = (e) => {
              e.preventDefault();
              navigateTo(m.url, 'detail');
            };
            grid.appendChild(card);
          });
        }

        if (!items.length || items.length < 15) {
          State.pagination.hasMore = false;
          loader.style.display = 'none';
        }
      } catch (e) {
        console.error('Paginate err', e);
        State.pagination.hasMore = false;
        loader.innerHTML = 'Конец списка';
      }
      State.pagination.page++;
      State.pagination.loading = false;
    };

    await loadPage();

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadPage();
    }, { rootMargin: '200px' });
    observer.observe(loader);
  }

  async function loadDetailsView(path, isInternal = false) {
    const main = document.querySelector('main');
    if (!isInternal) {
      main.innerHTML = '<div class="loader-wrap"><div class="m-loader"></div></div>';
    }

    const html = await req(path);
    const d = await RezkaParser.parseDetails(html, path);

    if (!d || !d.nameRussian) {
      if (!isInternal) main.innerHTML = '<div style="padding:50px;text-align:center;color:var(--accent);">Ошибка загрузки данных</div>';
      return;
    }

    // If we're navigating (not an internal update) or it's a different movie, we must full re-render
    const fullRender = !isInternal || !State.details || State.details.postId !== d.postId;
    State.details = d;

    // Parse URL hash #t:8-s:9-e:2 for initial translator/season/episode
    const hashParsed = (() => {
      const r = {};
      location.hash.replace(/^#/, '').split('-').forEach(p => {
        const [k, v] = p.split(':');
        if (k === 't') r.translatorId = v;
        if (k === 's') r.season = v;
        if (k === 'e') r.episode = v;
      });
      return r;
    })();

    if (fullRender) {
      const activeT = d.translators.find(t => t.active) || d.translators[0];
      const activeS = d.seasons.find(s => s.active) || d.seasons[0];
      const activeE = activeS?.episodes.find(e => e.active) || activeS?.episodes[0];
      State.activeTranslatorId = hashParsed.translatorId || activeT?.id;
      State.activeSeason = hashParsed.season || activeS?.id;
      State.activeEpisode = hashParsed.episode || activeE?.id;
      State.streamQualities = null;
      State.streamQuality = null;
    }

    const isSeries = d.seasons && d.seasons.length > 0;

    const parseQualityLabel = (raw) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = raw;
      const isPrem = !!tmp.querySelector('.pjs-prem-quality');
      const text = tmp.textContent.trim();
      return { text, isPrem };
    };

    // --- STREAM LOADER: direct AJAX → decrypt → <video> ---
    const loadStream = async (translatorId, seasonId, episodeId) => {
      const playerWrap = document.getElementById('hdm-player-wrap');
      if (!playerWrap) return;

      if (State.nativeSyncInterval) {
        clearInterval(State.nativeSyncInterval);
        State.nativeSyncInterval = null;
      }
      playerWrap.innerHTML = '';

      try {
        const fd = new URLSearchParams({ id: d.postId, translator_id: translatorId });
        if (isSeries && seasonId && episodeId) {
          fd.append('season', seasonId);
          fd.append('episode', episodeId);
          fd.append('action', 'get_stream');
        } else {
          fd.append('action', 'get_movie');
        }
        const resp = await fetch('/ajax/get_cdn_series/', {
          method: 'POST', body: fd,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include'
        });
        const json = await resp.json();
        if (!json.success) throw new Error(json.message || 'Ошибка сервера');

        if (json.seasons !== undefined) {
          const tmp = new DOMParser().parseFromString(
            `<ul>${json.seasons || ''}</ul><div>${json.episodes || ''}</div>`, 'text/html');
          const newSeasons = [...tmp.querySelectorAll('.b-simple_season__item')].map(sEl => {
            const sid = sEl.getAttribute('data-tab_id');
            const epList = tmp.querySelector(`.b-simple_episodes__list[data-id="${sid}"]`);
            return {
              id: sid, name: sEl.textContent.trim(), active: sid === seasonId,
              episodes: epList ? [...epList.querySelectorAll('.b-simple_episode__item')].map(eEl => ({
                id: eEl.getAttribute('data-episode_id'), name: eEl.textContent.trim(),
                active: eEl.getAttribute('data-episode_id') === episodeId
              })) : []
            };
          });
          if (newSeasons.length) State.details.seasons = newSeasons;
        }

        State.activeTranslatorId = translatorId;
        State.activeSeason = seasonId;
        State.activeEpisode = episodeId;
        State.details.translators.forEach(t => t.active = t.id === translatorId);

        const decrypted = decrypt(json.url || '');
        const streams = {};
        decrypted.split(',').forEach(part => {
          const m = part.trim().match(/\[([^\]]+)\](.+)/);
          if (!m) return;
          const quality = m[1].trim();
          const rawUrl = m[2].trim();
          const orIdx = rawUrl.indexOf(' or ');
          if (orIdx !== -1) {
            const mp4Url = rawUrl.slice(orIdx + 4).trim().replace(/^\/mp4:/, '');
            streams[quality] = mp4Url;
          } else {
            streams[quality] = rawUrl.replace(/^\/mp4:/, '');
          }
        });
        const qualities = Object.keys(streams);
        if (!qualities.length) throw new Error('Нет ссылок на воспроизведение');

        const preferredQuality = State.nativeQualityOverride || localStorage.getItem('hdm-default-quality') || '1080p';
        const priority = ['2160p', '1440p', '1080p Ultra', '1080p', '720p', '480p', '360p'];

        let selectedQuality = qualities.find(q => parseQualityLabel(q).text === preferredQuality);
        if (!selectedQuality) {
          const prefIdx = priority.indexOf(preferredQuality);
          for (let i = prefIdx === -1 ? 0 : prefIdx; i < priority.length; i++) {
            selectedQuality = qualities.find(q => parseQualityLabel(q).text === priority[i]);
            if (selectedQuality) break;
          }
        }
        if (!selectedQuality) selectedQuality = qualities[qualities.length - 1];

        State.streamQualities = streams;
        State.streamQuality = selectedQuality;

        const subs = [];
        if (json.subtitle) {
          try {
            const decryptedSubs = decrypt(json.subtitle);
            decryptedSubs.split(',').forEach(part => {
              const m = part.trim().match(/\[([^\]]+)\](.+)/);
              if (m) subs.push({ label: m[1].trim(), url: m[2].trim() });
            });
          } catch (e) { console.error('Subtitles error:', e); }
        }
        State.streamSubtitles = subs;

        const getActiveEngineVideo = () => playerWrap.querySelector('video');
        const isNativeEngine = (localStorage.getItem('hdm-player-type') === 'native') && (typeof pageWindow.Playerjs === 'function');
        let video = null;

        // --- Native Playerjs branch ---
        const NativePlayerjs = pageWindow.Playerjs;
        if (isNativeEngine) {
          const playerInfo = State.details?.playerInfo || {};
          const fileStr = Object.entries(streams)
            .map(([q, url]) => `[${parseQualityLabel(q).text}]${url}`)
            .join(',');

          const pjsId = 'hdm-pjs-player';
          const pjsEl = document.createElement('div');
          pjsEl.id = pjsId;
          pjsEl.style.cssText = 'width:100%;height:100%;display:block;';
          playerWrap.appendChild(pjsEl);

          const savedTime = Timecode.get(d.postId, translatorId, seasonId, episodeId);
          const nativeParams = {
            id: pjsId,
            file: fileStr,
            start: savedTime > 5 ? savedTime : 0,
            poster: d.poster || ''
          };

          if (json.subtitle) nativeParams.subtitle = json.subtitle;
          if (json.thumbnails || playerInfo.thumbnails) nativeParams.thumbnails = json.thumbnails || playerInfo.thumbnails;
          if (playerInfo.preroll) nativeParams.preroll = playerInfo.preroll;
          if (playerInfo.midroll) nativeParams.midroll = playerInfo.midroll;
          if (playerInfo.hlsconfig) nativeParams.hlsconfig = playerInfo.hlsconfig;
          if (playerInfo.hlsdebug !== undefined) nativeParams.hlsdebug = playerInfo.hlsdebug;
          if (playerInfo.debug !== undefined) nativeParams.debug = playerInfo.debug;
          nativeParams.default_quality = State.nativeQualityOverride || localStorage.getItem('pljsquality') || playerInfo.default_quality || parseQualityLabel(selectedQuality).text;

          new NativePlayerjs(nativeParams);
        } else {
          // Create Video
          video = h('video', {
            autoplay: true, playsInline: true,
            style: 'width:100%;height:100%;background:#000;display:block;',
            src: streams[selectedQuality]
          });
        }

        const currentVideo = () => isNativeEngine ? getActiveEngineVideo() : video;
        const withVideo = (fn) => {
          const v = currentVideo();
          if (!v) return null;
          return fn(v);
        };

        // --- CUSTOM OVERLAY ---
        let uiTimeout;
        const showUI = () => {
          overlay.classList.add('show');
          clearTimeout(uiTimeout);
          const v = currentVideo();
          if (v && !v.paused) uiTimeout = setTimeout(() => {
            overlay.classList.remove('show');
            closeDrawer();
          }, 3500);
        };

        // Auto-apply active subtitle
        if (State.activeSubtitleId) {
          const s = subs.find(x => x.url === State.activeSubtitleId);
          if (s && !isNativeEngine && video) {
            const track = document.createElement('track');
            track.kind = 'subtitles'; track.label = s.label; track.srclang = 'ru'; track.src = s.url; track.default = true;
            video.appendChild(track);
            track.onload = () => { if (video.textTracks[0]) video.textTracks[0].mode = 'showing'; };
          }
        }
        const togglePlay = () => {
          withVideo(v => {
            if (v.paused) v.play();
            else v.pause();
          });
          showUI();
        };

        const toggleDrawer = (type) => {
          overlay.classList.add('show-blur');
          drawer.classList.add('show');
          renderDrawerContent(type);
        };

        const closeDrawer = () => {
          drawer.classList.remove('show');
          overlay.classList.remove('show-blur');
        };

        // UI Components
        const scrubAct = h('div', { class: 'hdm-player-scrub-act' });
        const scrubBuf = h('div', { class: 'hdm-player-scrub-buf' });
        const scrubKnob = h('div', { class: 'hdm-player-scrub-knob' });
        const timeCurr = h('div', { class: 'hdm-player-time' }, '0:00');
        const timeTotal = h('div', { class: 'hdm-player-time', style: 'text-align:right' }, '0:00');
        const scrubEl = h('div', {
          class: 'hdm-player-scrub', onClick: (e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            withVideo(v => {
              if (!isNaN(v.duration)) v.currentTime = pos * v.duration;
            });
          }
        }, scrubBuf, scrubAct, scrubKnob);
        let _scrubDragging = false;
        const _scrubSeek = (clientX) => {
          const rect = scrubEl.getBoundingClientRect();
          const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
          const v = currentVideo();
          if (v && !isNaN(v.duration)) {
            v.currentTime = pos * v.duration;
            scrubAct.style.width = (pos * 100) + '%';
            scrubKnob.style.left = (pos * 100) + '%';
            timeCurr.textContent = formatTime(v.currentTime);
          }
        };
        scrubEl.addEventListener('touchstart', (e) => { e.stopPropagation(); _scrubDragging = true; _scrubSeek(e.touches[0].clientX); showUI(); }, { passive: true });
        scrubEl.addEventListener('touchmove', (e) => { if (!_scrubDragging) return; e.stopPropagation(); e.preventDefault(); _scrubSeek(e.touches[0].clientX); }, { passive: false });
        scrubEl.addEventListener('touchend', (e) => { _scrubDragging = false; e.stopPropagation(); showUI(); }, { passive: true });
        const playBtnBig = h('div', { class: 'hdm-player-big-btn hdm-focusable hdm-buffering', onClick: (e) => { e.stopPropagation(); togglePlay(); } });

        // Feature detection
        const pipBtn = h('div', {
          class: 'hdm-player-act-btn icon-only hdm-focusable',
          style: (document.pictureInPictureEnabled ? '' : 'display:none'),
          onClick: (e) => {
            e.stopPropagation();
            const v = currentVideo();
            if (!v) return;
            if (document.pictureInPictureElement) document.exitPictureInPicture();
            else if (typeof v.requestPictureInPicture === 'function') v.requestPictureInPicture();
          }
        }, ICONS.pip);

        const airplayBtn = h('div', {
          class: 'hdm-player-act-btn icon-only hdm-focusable',
          style: 'display:none',
          onClick: (e) => {
            e.stopPropagation();
            withVideo(v => {
              if (typeof v.webkitShowPlaybackTargetPicker === 'function') v.webkitShowPlaybackTargetPicker();
            });
          }
        }, ICONS.airplay);

        if (!isNativeEngine && 'webkitShowPlaybackTargetPicker' in HTMLVideoElement.prototype && video) {
          airplayBtn.style.display = 'flex';
          video.addEventListener('webkitplaybacktargetavailabilitychanged', (e) => {
            airplayBtn.style.display = (e.availability === 'not-available') ? 'none' : 'flex';
          });
        }

        const drawer = h('div', { class: 'hdm-player-drawer' },
          h('div', { class: 'hdm-player-drawer-head' },
            h('div', { class: 'hdm-player-drawer-title' }, 'Настройки'),
            h('div', { class: 'hdm-player-act-btn icon-only', onClick: closeDrawer }, ICONS.close)
          ),
          h('div', { class: 'hdm-player-drawer-body' })
        );

        const overlay = h('div', { class: 'hdm-player-overlay' },
          h('div', { class: 'hdm-player-top' },
            h('div', { class: 'hdm-player-top-left' },
              h('div', { class: 'hdm-player-back hdm-focusable', onClick: (e) => { e.stopPropagation(); history.back(); } }, ICONS.back),
              h('div', { class: 'hdm-player-title-wrap' },
                h('div', { class: 'hdm-player-title' }, d.nameRussian),
                h('div', { class: 'hdm-player-subtitle' }, (isSeries ? `Сезон ${State.activeSeason}, Серия ${State.activeEpisode}` : d.nameOriginal))
              )
            ),
            h('div', { class: 'hdm-player-top-acts' }, airplayBtn, pipBtn)
          ),
          h('div', { class: 'hdm-player-center' },
            h('div', {
              class: 'hdm-player-side-btn hdm-focusable',
              onClick: (e) => {
                e.stopPropagation();
                withVideo(v => { v.currentTime -= 10; });
                showUI();
              }
            }, ICONS.rew),
            playBtnBig,
            h('div', {
              class: 'hdm-player-side-btn hdm-focusable',
              onClick: (e) => {
                e.stopPropagation();
                withVideo(v => { v.currentTime += 10; });
                showUI();
              }
            }, ICONS.fwd)
          ),
          h('div', { class: 'hdm-player-bottom' },
            h('div', { class: 'hdm-player-progress-container' },
              timeCurr,
              scrubEl,
              timeTotal
            ),
            h('div', { class: 'hdm-player-actions' },
              h('div', { class: 'hdm-player-act-group' },
                h('div', {
                  class: 'hdm-player-act-btn icon-only', onClick: (e) => {
                    e.stopPropagation();
                    const v = currentVideo();
                    if (!v) return;
                    v.muted = !v.muted;
                    e.currentTarget.innerHTML = v.muted ? ICONS.mute : ICONS.vol;
                    showUI();
                  }
                }, (video && video.muted) ? ICONS.mute : ICONS.vol),
                h('input', {
                  type: 'range', class: 'hdm-vol-slider', min: 0, max: 1, step: 0.05, value: video ? video.volume : 1,
                  onInput: (e) => {
                    withVideo(v => {
                      v.volume = e.target.value;
                      v.muted = false;
                    });
                    showUI();
                  },
                  onClick: (e) => e.stopPropagation()
                }),
                h('div', {
                  class: 'hdm-player-act-btn hdm-focusable',
                  style: isNativeEngine ? 'display:none' : '',
                  onClick: (e) => { e.stopPropagation(); toggleDrawer('subtitles'); }
                }, ICONS.cc, 'Субтитры'),
                h('div', { class: 'hdm-player-act-btn hdm-focusable', onClick: (e) => { e.stopPropagation(); toggleDrawer('episodes'); } }, ICONS.episodes, 'Серии'),
                h('div', { class: 'hdm-player-act-btn hdm-focusable', onClick: (e) => { e.stopPropagation(); toggleDrawer('translators'); } }, ICONS.voice, 'Озвучка')
              ),
              h('div', { class: 'hdm-player-act-group' },
                h('div', { class: 'hdm-player-act-btn hdm-focusable', onClick: (e) => { e.stopPropagation(); toggleDrawer('quality'); } }, ICONS.quality, parseQualityLabel(State.streamQuality).text),
                h('div', {
                  class: 'hdm-player-act-btn icon-only hdm-focusable',
                  id: 'hdm-zoom-btn',
                  onClick: (e) => {
                    e.stopPropagation();
                    State.zoomMode = State.zoomMode ? 0 : 1;
                    localStorage.setItem('hdm-zoom-mode', State.zoomMode);
                    e.currentTarget.style.color = State.zoomMode ? 'var(--accent)' : 'inherit';
                    if (State.zoomMode) playerWrap.classList.add('hdm-zoom-fill');
                    else playerWrap.classList.remove('hdm-zoom-fill');
                    showUI();
                  }
                }, ICONS.zoom)
              )
            )
          ),
          drawer
        );

        if (State.zoomMode) {
          playerWrap.classList.add('hdm-zoom-fill');
          const zoomBtn = overlay.querySelector('#hdm-zoom-btn');
          if (zoomBtn) zoomBtn.style.color = 'var(--accent)';
        }

        const renderDrawerContent = (type) => {
          const body = drawer.querySelector('.hdm-player-drawer-body');
          const title = drawer.querySelector('.hdm-player-drawer-title');
          body.innerHTML = '';

          if (type === 'quality') {
            title.textContent = 'Качество';
            Object.keys(State.streamQualities).forEach(q => {
              const { text, isPrem } = parseQualityLabel(q);
              const item = h('div', {
                class: 'p-item hdm-focusable' + (q === State.streamQuality ? ' active' : ''),
                style: q === State.streamQuality ? 'color:var(--accent)' : '',
                onClick: async () => {
                  const t = currentVideo()?.currentTime || 0;
                  State.streamQuality = q;
                  if (isNativeEngine) {
                    State.nativeQualityOverride = parseQualityLabel(q).text;
                    localStorage.setItem('pljsquality', State.nativeQualityOverride);
                    Timecode.save(d.postId, translatorId, seasonId, episodeId, t);
                    closeDrawer();
                    await loadStream(State.activeTranslatorId, State.activeSeason, State.activeEpisode);
                    return;
                  }
                  if (!video) return;
                  video.src = State.streamQualities[q];
                  video.currentTime = t;
                  video.play();
                  closeDrawer();
                  showUI();
                }
              }, text + (isPrem ? ' (ULTRA)' : ''));
              body.appendChild(item);
            });
          } else if (type === 'subtitles') {
            title.textContent = 'Субтитры';

            const offItem = h('div', {
              class: 'p-item' + (!State.activeSubtitleId ? ' active' : ''),
              style: !State.activeSubtitleId ? 'color:var(--accent)' : '',
              onClick: () => {
                State.activeSubtitleId = null;
                withVideo(v => [...v.querySelectorAll('track')].forEach(t => t.remove()));
                closeDrawer();
                showUI();
              }
            }, 'Выключены');
            body.appendChild(offItem);

            State.streamSubtitles.forEach(s => {
              const item = h('div', {
                class: 'p-item' + (s.url === State.activeSubtitleId ? ' active' : ''),
                style: s.url === State.activeSubtitleId ? 'color:var(--accent)' : '',
                onClick: () => {
                  State.activeSubtitleId = s.url;
                  const activeVideo = currentVideo();
                  if (!activeVideo) return;
                  [...activeVideo.querySelectorAll('track')].forEach(t => t.remove());
                  const track = document.createElement('track');
                  track.kind = 'subtitles';
                  track.label = s.label;
                  track.srclang = 'ru';
                  track.src = s.url;
                  track.default = true;
                  activeVideo.appendChild(track);
                  track.onload = () => {
                    const t = activeVideo.textTracks[0];
                    if (t) t.mode = 'showing';
                  };
                  closeDrawer();
                  showUI();
                }
              }, s.label);
              body.appendChild(item);
            });
          } else if (type === 'translators') {
            title.textContent = 'Озвучка';
            State.details.translators.forEach(t => {
              const item = h('div', {
                class: 'p-item hdm-focusable' + (t.id === State.activeTranslatorId ? ' active' : ''),
                style: t.id === State.activeTranslatorId ? 'color:var(--accent)' : '',
                onClick: () => {
                  loadStream(t.id, State.activeSeason, State.activeEpisode);
                }
              }, t.name);
              body.appendChild(item);
            });
          } else if (type === 'episodes') {
            const currentSeason = State.details.seasons.find(s => s.id === State.activeSeason);
            title.textContent = currentSeason ? currentSeason.name : 'Выбор серии';

            // Season Selector (pills)
            const seasonScroll = h('div', { class: 'pc-scroll', style: 'padding: 15px 20px;' }, State.details.seasons.map(s => h('div', {
              class: 'pc-item hdm-focusable' + (s.id === State.activeSeason ? ' active' : ''),
              onClick: () => {
                State.activeSeason = s.id;
                renderDrawerContent('episodes');
              }
            }, s.name)));
            body.appendChild(seasonScroll);

            const grid = h('div', { class: 'ep-grid', style: 'margin-top:10px' });
            const s = State.details.seasons.find(s => s.id === State.activeSeason) || State.details.seasons[0];
            if (s) {
              s.episodes.forEach(e => {
                grid.appendChild(h('div', {
                  class: 'ep-item hdm-focusable' + (e.id === State.activeEpisode && s.id === State.activeSeason ? ' active' : ''),
                  onClick: () => {
                    loadStream(State.activeTranslatorId, s.id, e.id);
                  }
                }, e.name));
              });
            }
            body.appendChild(grid);
          }
        };

        // Video Events
        const updatePlayBtn = () => {
          const v = currentVideo();
          if (!v) {
            playBtnBig.classList.add('hdm-buffering');
            playBtnBig.innerHTML = '';
            return;
          }
          playBtnBig.classList.remove('hdm-buffering');
          playBtnBig.innerHTML = v.paused ? ICONS.play : ICONS.pause;
        };
        let lastSave = 0;
        let lastEnded = false;
        const syncPlaybackUi = () => {
          const v = currentVideo();
          updatePlayBtn();
          if (!v) return;

          const now = Math.floor(v.currentTime || 0);
          if (now % 5 === 0 && now !== lastSave) {
            lastSave = now;
            Timecode.save(d.postId, translatorId, seasonId, episodeId, v.currentTime);
          }

          if (!isNaN(v.duration) && v.duration > 0) {
            const p = (v.currentTime / v.duration) * 100;
            scrubAct.style.width = p + '%';
            scrubKnob.style.left = p + '%';
            timeCurr.textContent = formatTime(v.currentTime);
            timeTotal.textContent = formatTime(v.duration);
          }

          if (v.buffered && v.buffered.length > 0 && !isNaN(v.duration) && v.duration > 0) {
            const b = (v.buffered.end(v.buffered.length - 1) / v.duration) * 100;
            scrubBuf.style.width = b + '%';
          }

          if (v.ended && !lastEnded) {
            lastEnded = true;
            const next = findNextEpisode();
            if (next) loadStream(translatorId, next.seasonId, next.episodeId);
            else history.back();
          } else if (!v.ended) {
            lastEnded = false;
          }
        };

        if (!isNativeEngine && video) {
          video.addEventListener('play', () => { updatePlayBtn(); showUI(); });
          video.addEventListener('pause', () => {
            updatePlayBtn();
            Timecode.save(d.postId, translatorId, seasonId, episodeId, video.currentTime);
            showUI();
          });
          video.addEventListener('waiting', () => {
            playBtnBig.classList.add('hdm-buffering');
            playBtnBig.innerHTML = '';
          });
          video.addEventListener('playing', () => { updatePlayBtn(); });
          video.addEventListener('timeupdate', syncPlaybackUi);
          video.addEventListener('loadedmetadata', () => {
            timeTotal.textContent = formatTime(video.duration);
            const lastTime = Timecode.get(d.postId, translatorId, seasonId, episodeId);
            if (lastTime > 0 && lastTime < video.duration - 10) video.currentTime = lastTime;
          });
          video.addEventListener('ended', () => {
            const next = findNextEpisode();
            if (next) loadStream(translatorId, next.seasonId, next.episodeId);
            else history.back();
          });
        } else {
          State.nativeSyncInterval = setInterval(syncPlaybackUi, 250);
        }

        // Double tap gestures
        let lastTap = 0;
        overlay.addEventListener('touchstart', (e) => {
          const now = Date.now();
          if (now - lastTap < 300) {
            const x = e.touches[0].clientX;
            const w = window.innerWidth;
            if (x < w * 0.4) {
              withVideo(v => { v.currentTime -= 10; });
              createRipple(overlay, x, e.touches[0].clientY);
            } else if (x > w * 0.6) {
              withVideo(v => { v.currentTime += 10; });
              createRipple(overlay, x, e.touches[0].clientY);
            }
          }
          lastTap = now;
        });

        function createRipple(parent, x, y) {
          const r = h('div', { class: 'hdm-ripple', style: `left:${x - 50}px; top:${y - 50}px` });
          parent.appendChild(r);
          setTimeout(() => r.remove(), 600);
        }

        const playerContainer = document.getElementById('hdm-player-container');
        if (playerContainer) {
          playerContainer.onclick = showUI;
          if (!playerContainer.contains(overlay)) playerContainer.appendChild(overlay);
        }
        if (!isNativeEngine && video) playerWrap.appendChild(video);
        playerWrap.appendChild(overlay);

        const parts = [`t:${translatorId}`];
        if (seasonId) parts.push(`s:${seasonId}`);
        if (episodeId) parts.push(`e:${episodeId}`);
        history.replaceState(null, '', location.pathname + '#' + parts.join('-'));

        showUI();
      } catch (err) {
        playerWrap.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;gap:12px;padding:20px;text-align:center;background:#000;"><div style="color:#ff3b30;font-size:14px;">${err.message}</div></div>`;
      }
    };

    const renderControls = () => {
      const wrap = document.getElementById('hdm-player-controls');
      if (wrap) wrap.innerHTML = '';
    };

    if (fullRender) {
      updateHeaderTitle(d.nameRussian);
      main.innerHTML = '';
      main.appendChild(h('div', { class: 'hero' },
        h('img', { class: 'hero-img', src: d.hposter || d.poster }),
        h('div', { class: 'hero-grad' }),
        h('div', { class: 'hero-meta' },
          h('div', { class: 'hero-title' }, d.nameRussian),
          d.nameOriginal ? h('div', { style: 'opacity:0.6;font-size:14px;margin-bottom:12px;' }, d.nameOriginal) : null,
          h('button', {
            class: 'hdm-login-btn hdm-focusable',
            style: 'width:auto; padding: 12px 24px; margin-top: 10px; background: var(--accent-gradient);',
            onClick: () => {
              if (State.isWatching) return;
              // Push state for the player so "Back" button closes it
              const currentPath = location.pathname + location.hash;
              history.pushState({ path: normalizePath(location.pathname), isWatching: true }, '', currentPath);
              document.body.classList.add('is-watching');
              State.isWatching = true;
              loadStream(State.activeTranslatorId, State.activeSeason, State.activeEpisode);
            }
          }, 'Смотреть')
        )
      ));

      // Fullscreen container: video on top, controls scrollable below
      main.appendChild(h('div', { id: 'hdm-player-container' },
        h('div', { id: 'hdm-player-wrap' }),
      ));

      const favToggle = document.querySelector('.fav-header-btn');
      if (favToggle) {
        favToggle.innerHTML = ICONS.heart;
        favToggle.style.display = 'block';
        favToggle.classList.toggle('active', !!d.isFav);
        let backdrop = document.getElementById('hdm-fav-backdrop');
        if (!backdrop) {
          backdrop = h('div', { id: 'hdm-fav-backdrop', class: 'hdm-backdrop' });
          document.getElementById('hdm-app').appendChild(backdrop);
        }
        backdrop.onclick = closeModal;
        let _favLastTs = 0;
        favToggle.onclick = (e) => {
          const now = Date.now();
          if (now - _favLastTs < 600) return; // Safari: prevent touchend + click double-fire
          _favLastTs = now;
          if (e) {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
          }

          if (document.querySelector('.hdm-modal-base.hdm-active')) return closeModal();
          const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
          const nativeFav = document.querySelector('.add-favorite');
          if (nativeFav) triggerNativeClick(nativeFav);
          else if (win.sof?.home?.favorites) win.sof.home.favorites(d.postId, 'show');
          else if (win.sof?.fav?.init_post_dropdown) win.sof.fav.init_post_dropdown(null, d.postId);

          const checkPopup = () => {
            ['.b-userset__fav_holder', '#user-favorites-holder'].forEach(s => {
              const h_node = document.querySelector(s);
              if (h_node) {
                const app = document.getElementById('hdm-app');
                if (app && h_node.parentElement !== app) app.appendChild(h_node);
                h_node.classList.add('hdm-modal-base');
                if (!h_node.querySelector('.hdm-modal-handle')) {
                  const handle = document.createElement('div');
                  handle.className = 'hdm-modal-handle';
                  handle.onclick = (ev) => { ev.stopPropagation(); closeModal(); };
                  h_node.insertBefore(handle, h_node.firstChild);
                }
                // Hide native close link
                h_node.querySelectorAll('#addcat-fav-close, .b-userset__fav_link').forEach(el => el.style.display = 'none');
                // Inject custom create-category button
                if (!h_node.querySelector('.hdm-create-cat-btn')) {
                  const createBtn = document.createElement('div');
                  createBtn.className = 'hdm-create-cat-btn';
                  createBtn.textContent = '+ Создать новый раздел';
                  createBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    showPrompt('Новый раздел', 'Название раздела', 'Создать', async (val) => {
                      const nameInput = document.getElementById('addcat-fav-name');
                      const addBtn = document.getElementById('addcat-fav-addbt');
                      if (nameInput && addBtn) {
                        nameInput.value = val;
                        addBtn.click();
                      } else {
                        // fallback: AJAX create only
                        const fd = new URLSearchParams();
                        fd.append('action', 'add_cat'); fd.append('name', val);
                        await fetch('/ajax/favorites/', { method: 'POST', body: fd, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' } });
                      }
                    });
                  };
                  const favList = h_node.querySelector('#user-favorites-list');
                  if (favList) favList.appendChild(createBtn);
                  else h_node.appendChild(createBtn);
                }
                if (!h_node.classList.contains('hdm-active')) {
                  h_node.classList.add('hdm-active');
                  setTimeout(() => { h_node.classList.add('hdm-shown'); backdrop.classList.add('show'); }, 50);
                }
              }
            });
          };
          [50, 150, 300, 600, 1000].forEach(ms => setTimeout(checkPopup, ms));
        };
        favToggle.addEventListener('touchend', (e) => {
          favToggle.onclick(e);
        }, { passive: false });
      }

      const descEl = h('div', { class: 'desc truncated' }, d.desc);
      const readMore = h('div', { class: 'read-more-btn', onClick: (e) => { descEl.classList.toggle('truncated'); e.target.textContent = descEl.classList.contains('truncated') ? 'Читать далее' : 'Свернуть'; } }, 'Читать далее');

      const ratingsRow = (() => {
        const cards = [];
        if (d.imdb && d.imdb.val && d.imdb.val !== '?') {
          cards.push(h('div', { class: 'hdm-rating-card imdb' },
            h('div', { class: 'r-label' }, 'IMDb'),
            h('div', { class: 'r-val' }, d.imdb.val),
            d.imdb.votes ? h('div', { class: 'r-votes' }, d.imdb.votes) : null
          ));
        }
        if (d.kp && d.kp.val && d.kp.val !== '?') {
          cards.push(h('div', { class: 'hdm-rating-card kp' },
            h('div', { class: 'r-label' }, 'Кинопоиск'),
            h('div', { class: 'r-val' }, d.kp.val),
            d.kp.votes ? h('div', { class: 'r-votes' }, d.kp.votes) : null
          ));
        }
        return cards.length ? h('div', { class: 'hdm-ratings-row' }, cards) : null;
      })();

      const detailsBody = h('div', { class: 'details-body' },
        h('div', { class: 'desc-wrap' }, descEl, d.desc && d.desc.length > 200 ? readMore : null),
        ratingsRow,
        h('div', { class: 'info-table' }, Object.keys(d.meta).map(k => {
          if (Array.isArray(d.meta[k])) return h('div', { class: 'it-row' }, h('div', { class: 'it-lab' }, k), h('div', { class: 'meta-array' }, d.meta[k].map(i => h('div', { class: 'meta-pill', onClick: (e) => { e.preventDefault(); navigateTo(i.url); } }, i.name))));
          return h('div', { class: 'it-row' }, h('div', { class: 'it-lab' }, k), h('div', { class: 'it-val' }, d.meta[k]));
        })),
        d.meta['В ролях'] ? [h('div', { class: 'labels' }, 'Актеры'), h('div', { class: 'h-scroll' }, d.meta['В ролях'].map(a => h('div', { class: 'person-card', onClick: () => navigateTo(a.url) }, h('div', { class: 'person-img' }, a.photo ? h('img', { src: a.photo }) : null), h('div', { class: 'person-name' }, a.name))))] : null,
        d.franchise && d.franchise.length ? [h('div', { class: 'labels' }, 'Франшиза'), h('div', { class: 'franchise-scroll' }, d.franchise.map(f => h('div', { class: `franchise-card ${f.current ? 'current' : ''}`, onClick: () => { if (!f.current) navigateTo(f.url); } }, h('div', { class: 'f-title' }, f.title), h('div', { class: 'f-meta' }, h('span', { class: 'f-year' }, f.year), h('span', { class: 'f-rating' }, f.rating)))))] : null,
        d.related && d.related.length ? [h('div', { class: 'labels' }, 'Смотреть еще'), h('div', { class: 'h-scroll' }, d.related.map(m => renderMovieCard(m, true)))] : null
      );
      main.appendChild(detailsBody);
      main.scrollTop = 0;
    }

    renderControls();
  }

  async function loadPersonView(path) {
    const main = document.querySelector('main');
    main.innerHTML = '<div class="loader-wrap"><div class="m-loader"></div></div>';

    const html = await req(path);
    const p = await RezkaParser.parsePerson(html, path);

    if (!p || !p.nameRussian) {
      main.innerHTML = '<div style="padding:50px;text-align:center;color:var(--accent);">Ошибка загрузки профиля</div>';
      return;
    }

    updateHeaderTitle(p.nameRussian);
    main.innerHTML = '';

    const personHeader = h('div', { class: 'person-header' },
      h('div', { class: 'person-photo' }, p.poster ? h('img', { src: p.poster }) : null),
      h('div', { class: 'person-info' },
        h('div', { class: 'person-title-main' }, p.nameRussian),
        p.nameOriginal ? h('div', { class: 'person-title-sub' }, p.nameOriginal) : null,
        h('div', { class: 'info-table' }, Object.keys(p.meta).map(k => h('div', { class: 'it-row' },
          h('div', { class: 'it-lab' }, k),
          h('div', { class: 'it-val' }, p.meta[k])
        )))
      )
    );

    main.appendChild(personHeader);

    if (p.films && p.films.length) {
      main.appendChild(h('div', { class: 'hdm-section-head' }, 'Фильмография'));
      const grid = h('div', { class: 'movie-grid' });
      p.films.forEach(m => grid.appendChild(renderMovieCard(m)));
      main.appendChild(grid);
    }
  }

  async function loadFavorites() {
    let html;
    try { html = await req('/favorites/'); } catch (e) { html = ''; }
    const cats = RezkaParser.parseBookmarks(html);
    updateHeaderTitle('Закладки');

    const main = document.querySelector('main');

    // If the response is the mirror's login gate, or has no favorites content → show login
    const hasFavPage = html && html.includes('b-favorites_content');
    if (!hasFavPage || isLoginGate(html)) {
      _cachedAuth = false;
      State.isNavigating = false;
      loadLoginView();
      return;
    }

    ensureFavHeaderActions();

    let openSwipeCard = null;

    const renderCats = () => {
      main.innerHTML = '';
      main.appendChild(h('div', { class: 'bookmark-cats' }, cats.map(c => {
        let startX = 0, startY = 0, currentX = 0, swiping = false, isHorizontal = null;

        const bodyDiv = h('div', { class: 'b-cat-body' },
          h('div', { class: 'b-cat-name' }, c.name),
          h('div', { class: 'b-cat-count' }, c.count)
        );

        bodyDiv.addEventListener('touchstart', e => {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          swiping = true;
          isHorizontal = null;
          bodyDiv.classList.add('swiping');
          if (openSwipeCard && openSwipeCard !== bodyDiv) {
            openSwipeCard.style.transform = '';
            openSwipeCard = null;
          }
        }, { passive: true });

        bodyDiv.addEventListener('touchmove', e => {
          if (!swiping) return;
          let deltaX = e.touches[0].clientX - startX;
          let deltaY = e.touches[0].clientY - startY;

          if (isHorizontal === null) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              isHorizontal = true;
            } else {
              isHorizontal = false;
              swiping = false; // vertical scroll, cancel horizontal swipe
              bodyDiv.classList.remove('swiping');
              return;
            }
          }

          if (isHorizontal) {
            if (e.cancelable) e.preventDefault(); // Stop iOS Safari native scroll handling
            currentX = deltaX;
            if (openSwipeCard === bodyDiv) {
              currentX = Math.min(0, currentX - 120);
            } else {
              currentX = Math.min(0, currentX);
              // Add resistance when swiping right (positive X)
              if (currentX > 0) currentX = currentX * 0.2;
            }
            bodyDiv.style.transform = `translateX(${currentX}px)`;
          }
        }, { passive: false });

        bodyDiv.addEventListener('touchend', e => {
          if (!swiping && isHorizontal === false) return;
          swiping = false;
          isHorizontal = null;
          bodyDiv.classList.remove('swiping');

          if (currentX < -40) {
            bodyDiv.style.transform = `translateX(-120px)`;
            openSwipeCard = bodyDiv;
          } else {
            bodyDiv.style.transform = ``;
            if (openSwipeCard === bodyDiv) openSwipeCard = null;
            if (currentX > -5 && currentX < 5) navigateTo(`/favorites/${c.id}/`, null, false, c.name);
          }
        });

        return h('div', { class: 'b-cat-card' },
          h('div', { class: 'b-cat-actions-bg' },
            h('button', {
              class: 'b-cat-action-btn edit', onClick: (e) => {
                e.stopPropagation();
                showPrompt('Переименовать', 'Новое название', 'Сохранить', async (val) => {
                  try {
                    const fd = new URLSearchParams();
                    fd.append('action', 'change_cat_name'); fd.append('cat_id', c.id); fd.append('name', val);
                    await fetch('/ajax/favorites/', { method: 'POST', body: fd, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' } });
                    c.name = val; renderCats();
                  } catch (e) { }
                });
              }
            }, ICONS.edit),
            h('button', {
              class: 'b-cat-action-btn del', onClick: (e) => {
                e.stopPropagation();
                showPrompt('Удалить раздел?', null, 'Удалить', async () => {
                  try {
                    const fd = new URLSearchParams();
                    fd.append('action', 'delete_cat'); fd.append('cat_id', c.id);
                    await fetch('/ajax/favorites/', { method: 'POST', body: fd, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' } });

                    // Reset native if exists to sync
                    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
                    if (win.sof && win.sof.favorites && win.sof.favorites.delete_cat) {
                      win.sof.favorites.delete_cat.call(win.sof.favorites, c.id);
                    }

                    cats.splice(cats.indexOf(c), 1); renderCats();
                  } catch (e) { }
                });
              }
            }, ICONS.trash)
          ),
          bodyDiv
        );
      })));
    };
    renderCats();
  }

  async function loadCollections() {
    const main = document.querySelector('main');
    main.innerHTML = '';
    updateHeaderTitle('Подборки');

    const baseUrl = '/collections/';
    main.appendChild(renderFilterScroll(baseUrl));

    const grid = h('div', { class: 'coll-grid' });
    const loader = h('div', { class: 'page-end-loader' }, h('div', { class: 'm-loader' }));
    main.appendChild(grid);
    main.appendChild(loader);

    State.pagination = { base: location.pathname + location.search, page: 1, loading: false, hasMore: true };

    const loadPage = async () => {
      if (State.pagination.loading || !State.pagination.hasMore) return;
      State.pagination.loading = true;
      loader.style.display = 'flex';

      let url = State.pagination.base;
      if (State.pagination.page > 1) {
        url = `${url}page/${State.pagination.page}/`;
      }

      try {
        const html = await req(url);
        const colls = RezkaParser.parseCollections(html);

        colls.forEach(c => grid.appendChild(renderCollectionCard(c)));

        if (!colls.length) {
          State.pagination.hasMore = false;
          loader.style.display = 'none';
        }
      } catch (e) {
        console.error('Coll paginate err', e);
        State.pagination.hasMore = false;
        loader.innerHTML = 'Конец списка';
      }
      State.pagination.page++;
      State.pagination.loading = false;
    };

    await loadPage();

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadPage();
    }, { rootMargin: '200px' });
    observer.observe(loader);
  }

  async function loadProfileView() {
    const main = document.querySelector('main');
    main.innerHTML = '';
    updateHeaderTitle('Профиль');
    document.querySelector('.fav-create-top')?.remove();

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

    const toggleTheme = () => {
      const newTheme = isLight() ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('hdm-theme', newTheme);
      const tog = document.getElementById('hdm-theme-tog');
      const lbl = document.getElementById('hdm-theme-lbl');
      if (tog) tog.classList.toggle('on', isLight());
      if (lbl) lbl.textContent = isLight() ? 'Светлая тема' : 'Тёмная тема';
    };

    const themeToggle = h('div', { id: 'hdm-theme-tog', class: 'p-theme-toggle' + (isLight() ? ' on' : '') });
    themeToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleTheme(); });

    const loggedIn = await isLoggedIn();

    if (!loggedIn) {
      // Guest profile: appearance + player settings + login button
      const p = h('div', { class: 'p-wrapper' },
        h('div', { class: 'p-header' }, 'Внешний вид'),
        h('div', { class: 'p-links' },
          h('div', { class: 'p-item p-item-theme', onClick: toggleTheme },
            h('span', { id: 'hdm-theme-lbl' }, isLight() ? 'Светлая тема' : 'Тёмная тема'),
            themeToggle
          )
        ),
        h('div', { class: 'p-header', style: 'margin-top:24px' }, 'Настройки плеера'),
        h('div', { class: 'p-links' },
          h('div', { class: 'p-item hdm-focusable', style: 'justify-content: space-between;' },
            h('span', {}, 'Качество по умолчанию'),
            h('select', {
              style: 'background:none; border:none; color:var(--accent); font-weight:700; font-family:inherit; font-size:14px; outline:none; direction:rtl; width: 120px;',
              onChange: (e) => localStorage.setItem('hdm-default-quality', e.target.value)
            }, ['2160p', '1440p', '1080p Ultra', '1080p', '720p', '480p', '360p'].map(q => {
              const current = localStorage.getItem('hdm-default-quality') || '1080p';
              return h('option', { value: q, ...(q === current ? { selected: 'selected' } : {}) }, q);
            }))
          ),
          h('div', { class: 'p-item hdm-focusable', style: 'justify-content: space-between;' },
            h('span', {}, 'Тип плеера'),
            h('select', {
              style: 'background:none; border:none; color:var(--accent); font-weight:700; font-family:inherit; font-size:14px; outline:none; direction:rtl; width: 120px;',
              onChange: (e) => localStorage.setItem('hdm-player-type', e.target.value)
            }, [{ v: 'custom', t: 'Свой' }, { v: 'native', t: 'С сайта' }].map(opt => {
              const cur = localStorage.getItem('hdm-player-type') || 'custom';
              return h('option', { value: opt.v, ...(opt.v === cur ? { selected: 'selected' } : {}) }, opt.t);
            }))
          )
        ),
        h('div', { class: 'p-header', style: 'margin-top:24px' }, 'Аккаунт'),
        h('div', { class: 'p-links' },
          h('div', { class: 'p-item hdm-focusable', onClick: () => loadLoginView() }, 'Войти')
        ),
        h('div', { style: 'text-align:center; padding: 20px 0 10px; font-size: 12px; color: var(--text-dim); opacity: 0.5;' }, 'HDrezka Plus v1.0005')
      );
      main.appendChild(p);
      return;
    }

    // Logged-in profile
    const p = h('div', { class: 'p-wrapper' },
      h('div', { class: 'p-header' }, 'Внешний вид'),
      h('div', { class: 'p-links' },
        h('div', { class: 'p-item p-item-theme', onClick: toggleTheme },
          h('span', { id: 'hdm-theme-lbl' }, isLight() ? 'Светлая тема' : 'Тёмная тема'),
          themeToggle
        )
      ),
      h('div', { class: 'p-header', style: 'margin-top:24px' }, 'Настройки плеера'),
      h('div', { class: 'p-links' },
        h('div', { class: 'p-item hdm-focusable', style: 'justify-content: space-between;' },
          h('span', {}, 'Качество по умолчанию'),
          h('select', {
            style: 'background:none; border:none; color:var(--accent); font-weight:700; font-family:inherit; font-size:14px; outline:none; direction:rtl; width: 120px;',
            onChange: (e) => localStorage.setItem('hdm-default-quality', e.target.value)
          }, ['2160p', '1440p', '1080p Ultra', '1080p', '720p', '480p', '360p'].map(q => {
            const current = localStorage.getItem('hdm-default-quality') || '1080p';
            return h('option', { value: q, ...(q === current ? { selected: 'selected' } : {}) }, q);
          }))
        ),
        h('div', { class: 'p-item hdm-focusable', style: 'justify-content: space-between;' },
          h('span', {}, 'Тип плеера'),
          h('select', {
            style: 'background:none; border:none; color:var(--accent); font-weight:700; font-family:inherit; font-size:14px; outline:none; direction:rtl; width: 120px;',
            onChange: (e) => localStorage.setItem('hdm-player-type', e.target.value)
          }, [{ v: 'custom', t: 'Свой' }, { v: 'native', t: 'С сайта' }].map(opt => {
            const cur = localStorage.getItem('hdm-player-type') || 'custom';
            return h('option', { value: opt.v, ...(opt.v === cur ? { selected: 'selected' } : {}) }, opt.t);
          }))
        )
      ),
      h('div', { class: 'p-header', style: 'margin-top:24px' }, 'Аккаунт'),
      h('div', { class: 'p-links' },
        h('div', { class: 'p-item hdm-focusable', onClick: () => navigateTo('/settings/') }, 'Настройки'),
        h('div', { class: 'p-item hdm-focusable', onClick: () => navigateTo('/settings/security/') }, 'Безопасность'),
        h('div', { class: 'p-item hdm-focusable', onClick: () => navigateTo('/payments/') }, 'Платежи'),
        h('div', { class: 'p-item logout', onClick: () => navigateTo('/logout/') }, 'Выйти')
      ),
      h('div', { style: 'text-align:center; padding: 20px 0 10px; font-size: 12px; color: var(--text-dim); opacity: 0.5;' }, 'HDrezka Plus v1.0005')
    );
    main.appendChild(p);
  }

  async function loadSettingsView() {
    const main = document.querySelector('main');
    main.innerHTML = '<div class="loader-wrap"><div class="m-loader"></div></div>';
    updateHeaderTitle('Настройки');

    try {
      const html = await req('/settings/');
      const data = RezkaParser.parseSettings(html);

      main.innerHTML = '';
      const form = h('div', { class: 'p-form' },
        h('div', { class: 'p-avatar-wrap' },
          h('div', { class: 'p-avatar-img' }, h('img', { src: data.avatar })),
          h('div', { style: 'font-weight:700' }, 'Аватар')
        ),
        h('div', { class: 'p-input-group' },
          h('label', {}, 'Email'),
          h('input', { id: 'p-email', class: 'p-input hdm-focusable', type: 'email', value: data.email })
        ),
        h('div', { class: 'p-input-group' },
          h('label', {}, 'Пол'),
          h('select', { id: 'p-gender', class: 'p-select hdm-focusable' },
            h('option', { value: '0', selected: data.gender === '0' }, '-'),
            h('option', { value: '1', selected: data.gender === '1' }, 'Мужской'),
            h('option', { value: '2', selected: data.gender === '2' }, 'Женский')
          )
        ),
        h('button', {
          class: 'p-submit hdm-focusable', onClick: async (e) => {
            const btn = e.target;
            const oldText = btn.textContent;
            btn.disabled = true; btn.textContent = 'Сохранение...';
            try {
              const email = document.getElementById('p-email').value;
              const gender = document.getElementById('p-gender').value;
              const fd = {
                method: 'POST',
                dosection: 'general',
                doaction: 'save_general',
                username_id: data.userId,
                dle_allow_hash: data.hash,
                email: email,
                gender: gender,
                submit: 'Сохранить'
              };
              await req(`/user/${data.userId}/`, fd);
              showPrompt('Успех', null, 'OK', () => navigateTo('/profile/', 'profile'));
            } catch (err) {
              showPrompt('Ошибка', 'Не удалось сохранить настройки', 'OK');
            } finally { btn.disabled = false; btn.textContent = oldText; }
          }
        }, 'Сохранить')
      );
      main.appendChild(form);
    } catch (e) {
      main.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-dim)">Ошибка загрузки настроек</div>';
    }
  }

  async function loadSecurityView() {
    const main = document.querySelector('main');
    main.innerHTML = '<div class="loader-wrap"><div class="m-loader"></div></div>';
    updateHeaderTitle('Безопасность');

    try {
      const html = await req('/settings/security/');
      const data = RezkaParser.parseSecurity(html);

      main.innerHTML = '';
      const form = h('div', { class: 'p-form' },
        h('div', { class: 'p-input-group' },
          h('label', {}, 'Текущий пароль'),
          h('input', { id: 'p-old-pass', class: 'p-input', type: 'password' })
        ),
        h('div', { class: 'p-input-group' },
          h('label', {}, 'Новый пароль'),
          h('input', { id: 'p-new-pass1', class: 'p-input', type: 'password' })
        ),
        h('div', { class: 'p-input-group' },
          h('label', {}, 'Повторите пароль'),
          h('input', { id: 'p-new-pass2', class: 'p-input', type: 'password' })
        ),
        h('button', {
          class: 'p-submit hdm-focusable', onClick: async (e) => {
            const btn = e.target;
            const oldText = btn.textContent;
            const p0 = document.getElementById('p-old-pass').value;
            const p1 = document.getElementById('p-new-pass1').value;
            const p2 = document.getElementById('p-new-pass2').value;

            if (!p0 || !p1 || !p2) { showPrompt('Внимание', 'Заполните все поля', 'OK'); return; }
            if (p1 !== p2) { showPrompt('Внимание', 'Пароли не совпадают', 'OK'); return; }

            btn.disabled = true; btn.textContent = 'Сохранение...';
            try {
              const fd = {
                method: 'POST',
                dosection: 'security',
                doaction: 'save_security',
                username_id: data.userId,
                dle_allow_hash: data.hash,
                altpass: p0,
                password1: p1,
                password2: p2,
                submit: 'Сохранить'
              };
              await req(`/user/${data.userId}/security/`, fd);
              showPrompt('Успех', null, 'OK', () => navigateTo('/profile/', 'profile'));
            } catch (err) {
              showPrompt('Ошибка', 'Не удалось изменить пароль', 'OK');
            } finally { btn.disabled = false; btn.textContent = oldText; }
          }
        }, 'Изменить пароль')
      );
      main.appendChild(form);
    } catch (e) {
      main.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-dim)">Ошибка загрузки безопасности</div>';
    }
  }

  async function loadPaymentsView(path = '/payments/') {
    const main = document.querySelector('main');
    main.innerHTML = '<div class="loader-wrap"><div class="m-loader"></div></div>';
    updateHeaderTitle('Премиум');

    try {
      const html = await req(path);
      const data = RezkaParser.parsePayments(html);

      main.innerHTML = '';

      // 1. Currency Bar
      const curWrap = h('div', { class: 'p-currency-bar', style: 'padding-top: 15px' },
        h('div', { class: 'pill active' }, data.currentCurrency),
        data.currencyList.map(c => h('div', {
          class: 'pill hdm-focusable',
          onClick: () => loadPaymentsView(c.url)
        }, c.text))
      );
      main.appendChild(curWrap);

      // 2. Payment Methods
      let activeMethod = data.paymentMethods[0]?.value || 'card_payment';
      const methodMount = h('div', { class: 'p-method-list' });
      const plansMount = h('div', { class: 'p-plans' });

      const renderMethods = () => {
        methodMount.innerHTML = '';
        data.paymentMethods.forEach(m => {
          const card = h('div', {
            class: 'p-method-card' + (activeMethod === m.value ? ' active' : ''),
            onClick: () => {
              activeMethod = m.value;
              renderMethods();
              renderPlans();
            }
          },
            m.icon ? h('img', { class: 'p-method-icon', src: m.icon }) : null,
            h('div', { class: 'p-method-name' }, m.name),
            h('div', { class: 'p-method-desc' }, m.desc)
          );
          methodMount.appendChild(card);
        });
      };

      const renderPlans = () => {
        plansMount.innerHTML = '';
        const filtered = data.plans.filter(p => p.method === activeMethod);
        if (!filtered.length) {
          plansMount.innerHTML = '<div style="color:var(--text-dim);text-align:center">Нет доступных планов для этого метода</div>';
          return;
        }
        filtered.forEach(p => {
          const card = h('div', {
            class: 'p-plan-card',
            onClick: () => {
              showPrompt('Оплата', `Вы выбрали ${p.title} за ${p.price}.\nКвитанция придет на ${data.email || 'вашу почту'}.`, 'Перейти к оплате', async () => {
                // In a real scenario, we would submit the form here.
                // For now, we'll inform that redirect is needed or try to find the hidden pay button.
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const form = doc.querySelector('#payment_form');
                if (form) {
                  form.action = location.origin + '/payments/';
                  // We need to inject the form and submit it, but simpler to just use location.href for the demo or try native flow
                  showPrompt('Внимание', 'Для завершения оплаты вы будете перенаправлены на защищенную страницу.', 'OK', () => {
                    window.location.href = location.origin + path;
                  });
                }
              });
            }
          },
            h('div', { class: 'p-plan-info' },
              h('div', { class: 'p-plan-title' }, p.title),
              p.discount ? h('div', { class: 'p-plan-discount' }, p.discount) : null
            ),
            h('div', { class: 'p-plan-price' }, p.price)
          );
          plansMount.appendChild(card);
        });
      };

      main.appendChild(h('div', { class: 'p-header' }, 'Выберите способ оплаты'));
      main.appendChild(methodMount);
      main.appendChild(h('div', { class: 'p-header' }, 'Выберите длительность'));
      main.appendChild(plansMount);

      renderMethods();
      renderPlans();

    } catch (e) {
      main.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-dim)">Ошибка загрузки платежей</div>';
    }
  }

  function loadSearchView() {
    const main = document.querySelector('main');
    main.innerHTML = '';

    let activeTab = 'films';

    const wrap = h('div', { class: 'search-page' },
      h('div', { class: 'search-inner' },
        h('span', { style: 'color:#666' }, ICONS.search),
        h('input', {
          id: 'hdm-search-inp', placeholder: 'Что вы ищете?', autofocus: true, onKeyup: (e) => {
            if (e.key === 'Enter') performSearch(e.target.value, resMount, catMount);
          }
        })
      )
    );

    const tabs = [
      { id: 'films', t: 'Фильмы' },
      { id: 'series', t: 'Сериалы' },
      { id: 'cartoons', t: 'Мультфильмы' },
      { id: 'anime', t: 'Аниме' }
    ];

    const tabWrap = h('div', { class: 's-tabs' }, tabs.map(t => h('div', {
      class: 's-tab' + (t.id === activeTab ? ' active' : ''),
      onClick: (e) => {
        activeTab = t.id;
        document.querySelectorAll('.s-tab').forEach(el => el.classList.remove('active'));
        e.target.classList.add('active');
        renderCategories();
      }
    }, t.t)));

    const resMount = h('div', { id: 's-res' });
    const catMount = h('div', { id: 's-cats' });

    wrap.appendChild(tabWrap);
    wrap.appendChild(resMount);
    wrap.appendChild(catMount);
    main.appendChild(wrap);

    const CONFIG = {
      films: {
        base: '/films/', streaming: [
          { t: 'Лучшие года', u: '/films/best/' + new Date().getFullYear() + '/' }, { t: 'Netflix', u: '/collections/834-filmy-netflix/' },
          { t: 'HBO / Max', u: '/collections/1419-filmy-hbo/' }, { t: 'Amazon', u: '/collections/1417-filmy-amazon/' },
          { t: 'Disney', u: '/collections/1075-filmy-disney/' }
        ], genres: [
          { t: 'Вестерны', u: 'western' }, { t: 'Комедии', u: 'comedy' }, { t: 'Семейные', u: 'family' }, { t: 'Мелодрамы', u: 'melodrama' },
          { t: 'Фэнтези', u: 'fantasy' }, { t: 'Триллеры', u: 'thriller' }, { t: 'Биографии', u: 'biographical' }, { t: 'Ужасы', u: 'horror' },
          { t: 'Арт-хаус', u: 'arthouse' }, { t: 'Мюзиклы', u: 'musical' }, { t: 'Боевики', u: 'action' }, { t: 'Исторические', u: 'historical' },
          { t: 'Военные', u: 'military' }, { t: 'Детективы', u: 'detective' }, { t: 'Криминал', u: 'crime' }, { t: 'Приключения', u: 'adventures' },
          { t: 'Драмы', u: 'drama' }, { t: 'Спортивные', u: 'sport' }, { t: 'Фантастика', u: 'fiction' }
        ]
      },
      series: {
        base: '/series/', streaming: [
          { t: 'Лучшие новинки', u: '/series/best/2026/' }, { t: 'Netflix', u: '/collections/1242-anime-netflix/' },
          { t: 'HBO / Max', u: '/collections/1419-filmy-hbo/' }, { t: 'Amazon', u: '/collections/1417-filmy-amazon/' },
          { t: 'Epix', u: '/collections/1418-filmy-epix/' }
        ], genres: [
          { t: 'Боевики', u: 'action' }, { t: 'Триллеры', u: 'thriller' }, { t: 'Ужасы', u: 'horror' }, { t: 'Фантастика', u: 'fiction' },
          { t: 'Драмы', u: 'drama' }, { t: 'Комедии', u: 'comedy' }, { t: 'Детективы', u: 'detective' }, { t: 'Криминал', u: 'crime' },
          { t: 'Документалки', u: 'documentary' }, { t: 'Стендап', u: 'standup' }, { t: 'Зарубежные', u: 'foreign' }, { t: 'Русские', u: 'russian' }
        ]
      },
      cartoons: {
        base: '/cartoons/', streaming: [
          { t: 'Все мультсериалы', u: '/cartoons/multseries/' }, { t: 'Полнометражные', u: '/cartoons/full-length/' },
          { t: 'Союзмультфильм', u: '/cartoons/soyzmyltfilm/' }, { t: 'Anime (Cartoons)', u: '/cartoons/anime/' }
        ], genres: [
          { t: 'Сказки', u: 'fairytales' }, { t: 'Семейные', u: 'family' }, { t: 'Для взрослых', u: 'adults' }, { t: 'Короткометражные', u: 'shorts' },
          { t: 'Комедии', u: 'comedy' }, { t: 'Приключения', u: 'adventure' }, { t: 'Фэнтези', u: 'fantasy' }
        ]
      },
      anime: {
        base: '/animation/', streaming: [
          { t: 'Аниме-сериалы', u: '/animation/' }, { t: 'Netflix Anime', u: '/collections/1242-anime-netflix/' },
          { t: 'Лучшее 2026', u: '/animation/best/2026/' }
        ], genres: [
          { t: 'Боевые искусства', u: 'fighting' }, { t: 'Самураи', u: 'samurai' }, { t: 'Повседневность', u: 'everyday' },
          { t: 'Школа', u: 'school' }, { t: 'Сёнэн', u: 'shounen' }, { t: 'Сёдзё', u: 'shoujo' }, { t: 'Меха', u: 'mecha' },
          { t: 'Махо-сёдзё', u: 'mahoushoujo' }, { t: 'Этти', u: 'ecchi' }, { t: 'Кодомо', u: 'kodomo' }
        ]
      }
    };

    function renderCategories() {
      catMount.innerHTML = '';
      const c = CONFIG[activeTab];

      catMount.appendChild(h('div', { class: 'cat-group-title' }, 'Стриминги и Спец.разделы'));
      catMount.appendChild(h('div', { class: 's-cats-grid' }, c.streaming.map(s =>
        h('div', { class: 's-cat-btn hdm-focusable', onClick: () => navigateTo(s.u) }, s.t)
      )));

      catMount.appendChild(h('div', { class: 'cat-group-title' }, 'Фильтр по году и жанру'));
      const selGenre = h('select', { class: 's-filter-select hdm-focusable' },
        h('option', { value: '' }, 'Любого жанра'),
        ...c.genres.map(g => h('option', { value: g.u }, g.t))
      );
      const selYear = h('select', { class: 's-filter-select' });
      selYear.appendChild(h('option', { value: '' }, 'Все годы'));
      const curYear = new Date().getFullYear();
      for (let y = curYear; y >= 1990; y--) { selYear.appendChild(h('option', { value: y }, String(y))); }

      const filterBtn = h('button', {
        class: 's-filter-btn hdm-focusable', onClick: () => {
          const g = selGenre.value; const y = selYear.value;
          let u = `${c.base}best/`;
          if (g) u += g + '/';
          if (y) u += y + '/';
          navigateTo(u);
        }
      }, 'Искать');
      catMount.appendChild(h('div', { class: 's-filter-wrap' }, selGenre, selYear, filterBtn));

      catMount.appendChild(h('div', { class: 'cat-group-title' }, 'По жанрам'));
      catMount.appendChild(h('div', { class: 's-cats-grid' }, c.genres.map(s =>
        h('div', { class: 's-cat-btn', onClick: () => navigateTo(`${c.base}${s.u}/`) }, s.t)
      )));
    }

    renderCategories();
    setTimeout(() => document.getElementById('hdm-search-inp')?.focus(), 100);
  }

  async function performSearch(q, resMount, catMount) {
    if (!q.trim()) return;
    const tabs = document.querySelector('.s-tabs');
    if (tabs) tabs.style.display = 'none';
    if (catMount) catMount.style.display = 'none'; // hide cats when searching
    resMount.innerHTML = '<div class="loader-wrap"><div class="m-loader"></div></div>';
    const html = await req('search/', { do: 'search', subaction: 'search', q: q.trim() });
    const doc = new DOMParser().parseFromString(html, 'text/html');
    resMount.innerHTML = '';
    const movies = RezkaParser.parseMovies(doc);
    if (movies.length) {
      const grid = h('div', { class: 'movie-grid' });
      movies.forEach(m => grid.appendChild(renderMovieCard(m)));
      resMount.appendChild(grid);
    } else {
      resMount.innerHTML = '<div style="text-align:center;color:var(--text-dim);margin-top:20px;">Ничего не найдено</div>';
    }
  }

  // --- 6. LOGIN VIEW ---
  async function loadLoginView() {
    const main = document.querySelector('main');
    main.innerHTML = '';
    updateHeaderTitle('Вход');
    document.body.classList.remove('can-back');
    document.body.classList.add('hdm-login-mode');

    const errorEl = h('div', { class: 'hdm-login-error', id: 'hdm-login-err' }, '');
    const emailInput = h('input', { type: 'text', class: 'hdm-login-field hdm-focusable', placeholder: 'Email', name: 'login_name', autocomplete: 'email' });
    const passInput = h('input', { type: 'password', class: 'hdm-login-field hdm-focusable', placeholder: 'Пароль', name: 'login_password', autocomplete: 'current-password' });

    const loginBtn = h('button', { class: 'hdm-login-btn hdm-focusable' }, 'Войти');

    const doLogin = async () => {
      const email = emailInput.value.trim();
      const pass = passInput.value;
      if (!email || !pass) { errorEl.textContent = 'Введите email и пароль'; return; }
      errorEl.textContent = '';
      loginBtn.textContent = 'Загрузка...';
      loginBtn.disabled = true;
      try {
        const fd = new URLSearchParams({ login_name: email, login_password: pass, login_not_save: '0', login: 'submit' });
        const res = await fetch('/ajax/login/', {
          method: 'POST', body: fd, credentials: 'include',
          redirect: 'follow',  // follow redirect so Set-Cookie headers are applied
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }
        });
        // If the server redirected us (301 → followed to /), login succeeded and cookies are now set
        if (res.redirected) {
          window.location.reload();
          return;
        }
        // JSON fallback (some mirrors return JSON instead of redirect)
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('json')) {
          const json = await res.json();
          if (json.success || json.ok) { window.location.reload(); return; }
          errorEl.textContent = json.message || json.error || 'Неверный email или пароль';
        } else {
          // Any non-JSON 2xx also treat as success
          if (res.ok) { window.location.reload(); return; }
          errorEl.textContent = 'Неверный email или пароль';
        }
        loginBtn.textContent = 'Войти';
        loginBtn.disabled = false;
      } catch (e) {
        errorEl.textContent = 'Ошибка сети. Попробуйте снова.';
        loginBtn.textContent = 'Войти';
        loginBtn.disabled = false;
      }
    };

    loginBtn.addEventListener('click', doLogin);
    emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') passInput.focus(); });
    passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

    main.appendChild(h('div', { class: 'hdm-login-wrap' },
      h('div', { class: 'hdm-login-box' },
        h('div', { class: 'hdm-login-logo' }, 'HDrezka'),
        h('div', { class: 'hdm-login-subtitle' }, 'Войдите, чтобы продолжить'),
        emailInput, passInput, errorEl, loginBtn,
        h('div', { class: 'hdm-login-links' },
          h('a', { href: '/registration/' }, 'Создать аккаунт'),
          ' или ',
          h('a', { href: '/lost/' }, 'восстановить пароль')
        )
      )
    ));
    setTimeout(() => emailInput.focus(), 150);
  }

  // --- 7. BOOT ---
  let _cachedAuth = null;

  async function isLoggedIn() {
    if (_cachedAuth !== null) return _cachedAuth;
    // Wait for DOM if script ran before page was parsed
    if (document.readyState === 'loading') {
      await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
    }
    // Most reliable indicator: logout link only exists in DOM when logged in
    if (document.querySelector('a[href*="/logout/"]')) return (_cachedAuth = true);
    // Fallback: known HDrezka logged-in class names
    if (document.querySelector('.b-topauth__logged, .b-topauth_user__name, .b-userset__logged')) {
      return (_cachedAuth = true);
    }
    // Cookie fallback (non-HttpOnly only)
    if (/dle_user_taken=1/.test(document.cookie)) return (_cachedAuth = true);
    const uid = document.cookie.match(/dle_user_id=(\d+)/);
    if (uid && +uid[1] > 0) return (_cachedAuth = true);
    return (_cachedAuth = false);
  }

  async function init() {
    if (!document.body) { setTimeout(init, 50); return; }
    // Apply saved theme before render
    const savedTheme = localStorage.getItem('hdm-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.head.appendChild(h('style', {}, CSS));
    const app = h('div', { id: 'hdm-app' },
      h('header', {},
        h('div', { class: 'header-left' },
          h('div', { class: 'back-btn hdm-focusable', onClick: () => history.back() }, ICONS.back)
        ),
        h('div', { class: 'header-title' }, 'HDrezka'),
        h('div', { class: 'header-right' },
          h('div', { class: 'fav-header-btn hdm-focusable', style: 'display:none' }, ICONS.heart)
        )
      ),
      h('main', {}),
      h('nav', {},
        h('div', { class: 'nav-link hdm-focusable active', 'data-v': 'home', onClick: () => navigateTo('/') }, ICONS.home, h('span', {}, 'Главная')),
        h('div', { class: 'nav-link hdm-focusable', 'data-v': 'search', onClick: () => navigateTo('/search/', 'search') }, ICONS.search, h('span', {}, 'Поиск')),
        h('div', { class: 'nav-link hdm-focusable', 'data-v': 'fav', onClick: () => navigateTo('/favorites/', 'favorites') }, ICONS.fav, h('span', {}, 'Закладки')),
        h('div', { class: 'nav-link hdm-focusable', 'data-v': 'profile', onClick: () => navigateTo('/profile/', 'profile') }, ICONS.profile, h('span', {}, 'Профиль'))
      )
    );
    document.body.appendChild(app);
    document.body.appendChild(h('div', { id: 'hdm-progress' }));

    FocusManager.init();
    window.onpopstate = (e) => {
      const isPlayerState = !!(e.state && e.state.isWatching);

      // If we're closing the player via back button
      if (State.isWatching && !isPlayerState) {
        document.body.classList.remove('is-watching');
        const v = document.querySelector('#hdm-player-wrap video');
        if (v) { v.pause(); v.src = ""; v.load(); v.remove(); }
        const playerWrap = document.getElementById('hdm-player-wrap');
        if (playerWrap) playerWrap.innerHTML = '';
        document.querySelector('.hdm-player-overlay')?.classList.remove('show', 'show-blur');
        State.isWatching = false;
        return;
      }

      // If we're re-opening the player via forward button
      if (!State.isWatching && isPlayerState) {
        document.body.classList.add('is-watching');
        State.isWatching = true;
        if (State.details) {
          loadStream(State.activeTranslatorId, State.activeSeason, State.activeEpisode);
        }
        return;
      }

      const path = location.pathname;
      const viewNamespace = e.state ? e.state.viewNamespace : null;
      navigateTo(path, viewNamespace, true);
    };
    navigateTo(location.pathname, null, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
