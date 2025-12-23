(function(){
  const $ = (id)=>document.getElementById(id);

  let currentLang = 'ru';
  let currentId = null;
  let filtered = [];

  /* ====== I18N: SORT ====== */
  const SORT_I18N = {
    ru: { tr:'Сортировка', he:'По ивриту', type:'Слова / предлоги' },
    en: { tr:'Sort', he:'By Hebrew', type:'Words / prepositions' },
    uk: { tr:'Сортування', he:'За івритом', type:'Слова / прийменники' }
  };

  function updateSortUI(){
    const sel = $('sortSelect');
    if(!sel) return;
    const t = SORT_I18N[currentLang] || SORT_I18N.ru;
    Array.from(sel.options).forEach(o=>{
      if(t[o.value]) o.text = t[o.value];
    });
  }

  function normalize(s){
    return (s||'').toString().toLowerCase().replace(/\s+/g,' ').trim();
  }

  function speakHebrew(text){
    try{
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'he-IL';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }catch(e){}
  }

  /* ===== SPEECH INFO ===== */
  function toggleSpeechInfo(){
    let box = document.getElementById('speechInfo');
    if(box){ box.remove(); return; }

    box = document.createElement('div');
    box.id = 'speechInfo';
    box.style.cssText = `
      border:2px solid #4da3ff;
      border-radius:10px;
      padding:12px 16px;
      margin:10px 0 14px;
      font-size:16px;
      background:#fff;
    `;
    box.innerHTML = `
      <strong>Как включить озвучку:</strong>
      <ul style="margin:8px 0 8px 20px">
        <li>Chrome / Edge — работает автоматически</li>
        <li>Firefox — экспериментально</li>
        <li>Safari — через Siri</li>
      </ul>
    `;

    const panel = document.getElementById('mainPanel');
    const controls = document.getElementById('topControls');
    panel.insertBefore(box, controls.nextSibling);
  }

  function getTr(word){
    return word[currentLang] || word.ru || word.en || word.uk || '';
  }

  function renderList(){
    const box = $('items');
    box.innerHTML = '';
    const sortMode = $('sortSelect').value;

    let arr = filtered.slice();
    if(sortMode==='he'){
      arr.sort((a,b)=>(a.he||'').localeCompare(b.he||''));
    }else if(sortMode==='type'){
      arr.sort((a,b)=>(a.type||'').localeCompare(b.type||'') || getTr(a).localeCompare(getTr(b)));
    }else{
      arr.sort((a,b)=>getTr(a).localeCompare(getTr(b)));
    }

    arr.forEach(w=>{
      const el = document.createElement('div');
      el.className = 'item' + (w.id===currentId?' active':'');
      el.innerHTML = `<span class="he">${w.he}</span> — <span class="tr">${getTr(w)}</span>`;
      el.onclick = ()=>selectItem(w.id);
      box.appendChild(el);
    });
  }

  /* ====== ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ====== */
  function renderEducational(id){
    const w = WORDS.find(x=>x.id===id);
    const t = TABLES[id];
    const wrap = $('tableWrapper');

    if(!w || !t){
      wrap.innerHTML = '<div class="small">Нет данных.</div>';
      return;
    }

    let html = `<div style="font-size:18px;line-height:1.35;">`;

    html += `
      <div style="
        text-align:center;
        font-weight:700;
        font-size:20px;
        margin-bottom:10px;
      ">
        ${getTr(w)} — <span class="hebrew">${w.he}</span>
      </div>
    `;

    /* ПРИМЕРЫ — СТРОГО В ОДНУ СТРОКУ */
    t.forms.forEach(f=>{
      const heEx = f.examples?.he || '';
      const trEx = f.examples?.[currentLang] || '';

      html += `
        <div style="margin:3px 0; line-height:1.3;">
          <span class="hebrew">
            <strong>${f.form}</strong> ${heEx}
          </span>
          —
          <span>
            ${trEx}
          </span>
        </div>
      `;
    });

    html += `</div>`;
    wrap.innerHTML = html;
  }
  /* ====== КОНЕЦ ИЗМЕНЕНИЯ ====== */

  function selectItem(id){
    currentId = id;
    renderList();
    renderEducational(id);
  }

  function applyFilter(){
    const q = normalize($('searchBox').value);
    filtered = !q ? WORDS.slice() : WORDS.filter(w=>{
      return normalize([w.he,w.ru,w.uk,w.en].join(' ')).includes(q);
    });
    renderList();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    filtered = WORDS.slice();
    $('langSelect').value = currentLang;

    $('langSelect').addEventListener('change', ()=>{
      currentLang = $('langSelect').value;
      updateSortUI();
      renderList();
      if(currentId) renderEducational(currentId);
    });

    $('sortSelect').addEventListener('change', renderList);
    $('searchBox').addEventListener('input', applyFilter);

    $('speakBase').addEventListener('click', ()=>{
      toggleSpeechInfo();
      if(!currentId) return;
      const w = WORDS.find(x=>x.id===currentId);
      if(w) speakHebrew(w.he);
    });

    renderList();
    updateSortUI();
    if(filtered.length) selectItem(filtered[0].id);
  });
})();
