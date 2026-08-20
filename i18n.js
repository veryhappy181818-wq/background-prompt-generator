const I18N = {
  _cache: {},
  _lang: 'en',
  _rtlLangs: ['ur'],

  async load(lang) {
    if (this._cache[lang]) return this._cache[lang];
    try {
      const res = await fetch(`lang/${lang}.json`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      this._cache[lang] = data;
      return data;
    } catch (e) {
      if (lang !== 'en') return await this.load('en');
      return {};
    }
  },

  t(key) {
    const dict = this._cache[this._lang] || this._cache['en'] || {};
    return dict[key] || this._cache['en']?.[key] || key;
  },

  applyRTL(lang) {
    const isRTL = this._rtlLangs.includes(lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('rtl-mode', isRTL);
  },

  async switchLang(lang) {
    await this.load(lang);
    if (lang !== 'en') await this.load('en');
    this._lang = lang;
    localStorage.setItem('ns_lang', lang);
    window.nsAppLang = lang;
    window.currentLang = lang;
    this.applyRTL(lang);
    this.updateDOM();
    this.updatePlaceholders();
    this.updateJS();
    window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
  },

  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val && val !== key) el.textContent = val;
    });
  },

  updatePlaceholders() {
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = this.t(key);
      if (val && val !== key) el.placeholder = val;
    });
  },

  updateJS() {
    // ── ALWAYS ENGLISH — never translate these ──
    const _en = (id, text) => { const el=document.getElementById(id); if(el) el.textContent=text; };
    const _eph = (id, text) => { const el=document.getElementById(id); if(el) el.placeholder=text; };

    // Orbit hint — always English
    const orbitHint = document.getElementById('clickHintTop');
    if(orbitHint) orbitHint.textContent = '✨ FILL IN THE OPTIONS';

    // Footer — remove/hide
    const footer = document.querySelector('.appfoot');
    if(footer) footer.style.display = 'none';

    // Profile — always English
    _eph('profileUsername', 'Enter the username');
    const pd = document.querySelector('#profilePage button[onclick="saveProfile()"]');
    if(pd) pd.textContent = '✅ DONE';

    // Lang search — always English
    _eph('langSearch', '🔍 Search language...');

    // Feature project name inputs — always English
    ['iw2-new-proj-name','prod-new-proj-name','sd-new-proj-name','dm-new-proj-name'].forEach(id => {
      _eph(id, 'Enter project name');
    });

    // Feature create buttons — always English
    document.querySelectorAll('[onclick*="featureCreateProject"]').forEach(btn => {
      btn.textContent = 'Create';
    });

    // Feature switch buttons — always English
    document.querySelectorAll('[onclick*="featureSwitchProject"]').forEach(btn => {
      btn.textContent = 'Switch Project';
    });

    // Subject placeholder — always English
    _eph('iw2-subject', 'Enter the subject name');

    // Script placeholders — translatable per language
    const _sph = this.t('script_ph') || 'Paste your script here...';
    _eph('prod-script-input', _sph);
    _eph('sd-script-input', _sph);
    _eph('dm-script-input', _sph);
    _eph('scriptInput', _sph);

    // Script labels (pila wala) — translatable per language
    const _slabel = this.t('script_label') || 'Paste Your Script Here';
    ['prod-script-label','sd-script-label','dm-script-label'].forEach(id => {
      const el = document.getElementById(id); if(el) el.textContent = _slabel;
    });

    // History empty state — translatable
    const histEl = document.getElementById('historyEmpty');
    if(histEl) histEl.textContent = this.t('no_history') || 'No version history yet.';

    // Workspace tabs — always English
    document.querySelectorAll('.tabs .tab').forEach(tab => {
      const m = {script:'📝 Script', backgrounds:'🎞️ Backgrounds', analytics:'📊 Analytics', history:'🕯️ History'};
      if(m[tab.dataset.tab]) tab.textContent = m[tab.dataset.tab];
    });

    // Feature names — always English
    const featNames = {
      'ideaWriterPage': 'Idea Writer',
      'productionPage': 'One-click Production',
      'doctorPage': 'AI Script Doctor',
      'directorPage': 'Director Mode',
      'sharePage': 'Share Project'
    };

    // ── TRANSLATABLE — per selected language ──
    const set = (id, key) => { const el=document.getElementById(id); if(el) el.textContent=this.t(key); };

    // Generate buttons — translatable
    set('iw2-gen-btn', 'iw_gen_btn');
    set('prod-gen-btn', 'prod_gen_btn');
    set('sd-analyze-btn', 'sd_btn');
    set('dm-gen-btn', 'dm_btn');
    set('enterAppBtn', 'enter_app');

    // Loading texts — translatable
    const iwL = document.querySelector('#iw2-loading div:last-child'); if(iwL) iwL.textContent = this.t('iw_loading');
    const plT = document.getElementById('prod-loading-text'); if(plT) plT.textContent = this.t('prod_loading');
    const sdL = document.querySelector('#sd-loading div:last-child'); if(sdL) sdL.textContent = this.t('sd_loading');
    const dmL = document.querySelector('#dm-loading div:last-child'); if(dmL) dmL.textContent = this.t('dm_loading');

    // Production tabs — always English
    const prodTabMap = {overview:'Overview',story:'Story',scenes:'Scenes',characters:'Characters',images:'Images',voice:'Voice',thumbnail:'Thumbnail',youtube:'YouTube'};
    document.querySelectorAll('.prod-tab').forEach(tab => {
      if(prodTabMap[tab.dataset.tab]) tab.textContent = prodTabMap[tab.dataset.tab];
    });

    // "No projects" in features — translatable
    document.querySelectorAll('.feat-no-proj').forEach(el => {
      el.textContent = this.t('feat_no_proj');
    });

    // Home empty state
    const emptyMsg = document.getElementById('emptyProjMsg');
    if(emptyMsg) emptyMsg.textContent = this._lang === 'hi' ? 'कोई project नहीं है। ऊपर नया बनाओ।' : 'No project. Please create a new project.';

    // Home quota — always English
    const qt = document.getElementById('quotaText');
    if(qt) { const cur = qt.textContent.match(/\d+\/\d+/)?.[0] || '0/3'; qt.textContent = cur + ' scripts used today'; }

    // Search — always English
    _eph('projectSearch', 'Search projects...');

    // App details
    if(typeof setAppDetailsLang === 'function') setAppDetailsLang(this._lang === 'en' ? 'en' : 'hi');

    // Re-render feature project lists
    if(typeof featurePageMap !== 'undefined' && typeof featureRenderProjectList === 'function') {
      Object.keys(featurePageMap).forEach(f => { try { featureRenderProjectList(f); } catch(e) {} });
    }

    // Re-render language list
    if(typeof renderLanguages === 'function') renderLanguages(document.getElementById('langSearch')?.value || '');
  },

  async init() {
    const saved = localStorage.getItem('ns_lang') || 'en';
    await this.load('en');
    await this.switchLang(saved);
  }
};

window.I18N = I18N;
window.__ = (key) => I18N.t(key);
