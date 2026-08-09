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
    const set = (id, key) => { const el=document.getElementById(id); if(el) el.textContent=this.t(key); };
    const ph  = (id, key) => { const el=document.getElementById(id); if(el) el.placeholder=this.t(key); };

    set('iw2-gen-btn','iw_gen_btn');
    set('prod-gen-btn','prod_gen_btn');
    set('sd-analyze-btn','sd_btn');
    set('dm-gen-btn','dm_btn');
    set('enterAppBtn','enter_app');

    ph('iw2-subject','iw_subject_ph');
    ph('prod-script-input','prod_script_ph');
    ph('sd-script-input','sd_script_ph');
    ph('dm-script-input','dm_script_ph');
    ph('profileUsername','profile_username_ph');
    ph('langSearch','lang_search_ph');
    ['iw2-new-proj-name','prod-new-proj-name','sd-new-proj-name','dm-new-proj-name'].forEach(id=>ph(id,'iw_proj_ph'));

    document.querySelectorAll('[onclick*="featureCreateProject"]').forEach(btn=>{ btn.textContent=this.t('iw_create_btn'); });
    document.querySelectorAll('[onclick*="featureSwitchProject"]').forEach(btn=>{ btn.textContent=this.t('iw_switch_btn'); });

    const pd=document.querySelector('#profilePage button[onclick="saveProfile()"]');
    if(pd) pd.textContent=this.t('profile_done');

    const iwL=document.querySelector('#iw2-loading div:last-child'); if(iwL) iwL.textContent=this.t('iw_loading');
    const plT=document.getElementById('prod-loading-text'); if(plT) plT.textContent=this.t('prod_loading');
    const sdL=document.querySelector('#sd-loading div:last-child'); if(sdL) sdL.textContent=this.t('sd_loading');
    const dmL=document.querySelector('#dm-loading div:last-child'); if(dmL) dmL.textContent=this.t('dm_loading');

    const prodTabMap={overview:'prod_tab_overview',story:'prod_tab_story',scenes:'prod_tab_scenes',characters:'prod_tab_characters',images:'prod_tab_images',voice:'prod_tab_voice',thumbnail:'prod_tab_thumb',youtube:'prod_tab_youtube'};
    document.querySelectorAll('.prod-tab').forEach(tab=>{ const k=prodTabMap[tab.dataset.tab]; if(k) tab.textContent=this.t(k); });

    document.querySelectorAll('.tabs .tab').forEach(tab=>{
      const m={script:'tab_script',backgrounds:'tab_backgrounds',analytics:'tab_analytics',history:'tab_history'};
      const k=m[tab.dataset.tab]; if(k) tab.textContent=this.t(k);
    });

    const orbitHint=document.getElementById('clickHintTop'); if(orbitHint) orbitHint.textContent=this.t('orbit_hint');
    const footer=document.querySelector('.appfoot'); if(footer) footer.textContent=this.t('footer_text');
    set('enterAppBtn','enter_app');

    if(typeof setAppDetailsLang==='function') setAppDetailsLang(this._lang==='en'?'en':'hi');
    if(typeof renderLanguages==='function') renderLanguages(document.getElementById('langSearch')?.value||'');
    if(typeof featurePageMap!=='undefined'&&typeof featureRenderProjectList==='function'){
      Object.keys(featurePageMap).forEach(f=>{ try{ featureRenderProjectList(f); }catch(e){} });
    }
  },

  async init() {
    const saved = localStorage.getItem('ns_lang') || 'en';
    await this.load('en');
    await this.switchLang(saved);
  }
};

window.I18N = I18N;
window.__ = (key) => I18N.t(key);
