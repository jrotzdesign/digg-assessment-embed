/*! Digg Agency Growth Opportunity Assessment, embed build v__VERSION__
    https://github.com/jrotzdesign/digg-assessment-embed
    Usage:  <div id="digg-assessment"></div>
            <script src=".../dist/digg-assessment.js" defer></script> */
(function(){

  /* ======================= SETTINGS ======================= */

  /* Where submitted leads go. null = demo mode: nothing is sent, the lead is
     logged to the browser console. Set it to a webhook URL (WPForms, HubSpot,
     Zapier...) to go live. This repo is public, so use an endpoint that is
     safe to be public. */
  var ENDPOINT = null;

  /* Where "Book a call" goes (opens in the same tab).
     null = show the old "Demo only" alert instead. */
  var BOOK_URL = 'https://www.thediggagency.com/contact-us/';

  /* ======================================================== */

  var CSS = __CSS__;
  var HTML = __HTML__;

/* ---------- content: questions.js from digg-assessment, verbatim ---------- */
__QUESTIONS__
/* ---------- end of questions.js ---------- */

  function boot(root){
    var $=function(s){return root.querySelector(s)};
    var ans=new Array(QUESTIONS.length).fill(null), i=0;
    var rail=$('#dga-rail i');

    /* Height of anything pinned to the top of the viewport (the WP admin bar
       when logged in, or the site header if it is ever made sticky).
       data-offset="80" on the container overrides the detection. */
    function topOffset(){
      var o=parseInt(root.getAttribute('data-offset'),10);
      if(!isNaN(o)) return o;
      var max=0, els=document.querySelectorAll('#wpadminbar, .elementor-location-header, .elementor-location-header > *, .elementor-sticky--active, #site-header');
      for(var k=0;k<els.length;k++){
        var cs=window.getComputedStyle(els[k]);
        if(cs.position!=='fixed' && cs.position!=='sticky') continue;
        var r=els[k].getBoundingClientRect();
        if(r.top<=1 && r.bottom>max && r.height<window.innerHeight/2) max=r.bottom;
      }
      return max;
    }

    /* Inside a host page: only move when the card's top has scrolled out of
       view, and then bring the card (not the header area above it) back. */
    function reveal(){
      var card=$('.shell'), off=topOffset(), top=card.getBoundingClientRect().top;
      if(top < off){
        var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({top:Math.max(0, window.pageYOffset + top - off - 16), behavior:reduce?'auto':'smooth'});
      }
    }

    function show(id){
      root.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on')});
      $(id).classList.add('on');
      reveal();
    }

    function steps(){
      var wrap=$('#dga-steps'); wrap.innerHTML='';
      AREAS.forEach(function(a,n){
        var qs=QUESTIONS.map(function(q,ix){return q.area===n?ix:-1}).filter(function(x){return x>-1});
        var done=qs.filter(function(ix){return ans[ix]!==null}).length;
        var cur=QUESTIONS[i].area===n;
        var d=document.createElement('div');
        d.className='step'+(cur?' now':'')+(done===qs.length&&!cur?' done':'');
        d.innerHTML='<div class="ln"><i style="width:'+Math.round(done/qs.length*100)+'%"></i></div><span>'+a.short+'</span>';
        wrap.appendChild(d);
      });
    }

    /* Light update on pick: no re-render, so nothing re-animates and the
       option keeps focus for keyboard users. */
    function select(n){
      ans[i]=n;
      var list=$('#dga-opts').querySelectorAll('.opt');
      for(var k=0;k<list.length;k++) list[k].setAttribute('aria-checked', k===n?'true':'false');
      $('#dga-next').disabled=false;
      steps();
    }

    function paint(dir){
      var q=QUESTIONS[i];
      $('#dga-qnum').textContent=String(i+1).padStart(2,'0');
      $('#dga-qof').textContent='of '+QUESTIONS.length+'  ·  '+(q.area>-1?AREAS[q.area].label:(q.type==='text'?q.label:'About your company'));
      $('#dga-qtext').textContent=q.q;
      var ul=$('#dga-opts'); ul.innerHTML='';
      (q.type==='text'?[]:q.a).forEach(function(t,n){
        var li=document.createElement('li');
        li.style.setProperty('--i', n);
        var b=document.createElement('button');
        b.className='opt'; b.type='button'; b.setAttribute('role','radio');
        b.setAttribute('aria-checked', ans[i]===n?'true':'false');
        b.innerHTML='<span class="dot"></span><span></span>'; b.lastChild.textContent=t;
        b.onclick=function(){ select(n) };
        li.appendChild(b); ul.appendChild(li);
      });
      if(q.type==='text'){
        var li=document.createElement('li');
        li.innerHTML='<textarea class="fixbox" id="dga-fix" maxlength="'+q.max+'" placeholder="Type your answer (optional)" aria-label="Optional answer"></textarea><div class="fixcount" id="dga-fixcount">0/'+q.max+'</div>';
        ul.appendChild(li);
        var ta=li.querySelector('textarea'); ta.value=ans[i]||'';
        var upd=function(){ ans[i]=ta.value; $('#dga-fixcount').textContent=ta.value.length+'/'+q.max };
        ta.addEventListener('input',upd); upd();
        $('#dga-next').disabled=false;
      } else {
        $('#dga-next').disabled = ans[i]===null;
      }
      $('#dga-next').innerHTML = (i===QUESTIONS.length-1?'See my results':'Next')+' <span class="arr">&rarr;</span>';
      $('#dga-back').style.visibility = i===0?'hidden':'visible';
      rail.style.width=(i/QUESTIONS.length*100)+'%';
      steps();
      var c=$('#dga-s-q');
      if(dir){
        c.classList.remove('anim','rev');
        void c.offsetWidth;                      /* restart the animations */
        c.classList.add('anim');
        if(dir<0) c.classList.add('rev');
        reveal();                                /* Next/Back from low on a long question: back to the card */
      } else {
        c.classList.remove('anim','rev');
      }
    }

    var last = {};

    function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}) }

    /* Her scoring: area = sum of its two answers (0–4). A D answer flags the area
       "Needs validation" unless the question marks its D as a real answer (dk:false). */
    function score(){
      var per=AREAS.map(function(){return {score:0,dk:false,dkPts:0}});
      QUESTIONS.forEach(function(q,n){
        if(q.area<0) return;
        var p=POINTS[ans[n]], unknown=(ans[n]===3 && q.dk!==false);
        per[q.area].score+=p;
        if(unknown){ per[q.area].dk=true; per[q.area].dkPts+=p }
      });
      var hi=Math.max.apply(null,per.map(function(p){return p.score}));
      var first = hi>0 ? per.map(function(p,n){return p.score===hi?n:-1}).filter(function(n){return n>-1}) : [];
      /* "mainly from unknowns": at least half the area's points come from don't-know answers */
      per.forEach(function(p){ p.label=gapLabel(p.score); p.mostlyUnknown = p.score>0 && p.dkPts*2>=p.score });
      return { per:per, first:first };
    }

    function results(){
      last = score();
      buildBars();
      buildRec();
      rail.style.width='100%';
      show('#dga-s-res');
    }

    function buildBars(){
      var per=last.per, first=last.first;
      var bars=$('#dga-bars');
      bars.innerHTML='<div class="hd"><span>By area</span><span>Potential gap</span></div>';
      AREAS.forEach(function(a,n){
        var p=per[n], lv=p.score<=1?'lo':p.score===2?'mid':'hi';
        var d=document.createElement('div');
        d.className='bar lv-'+lv+(first.indexOf(n)>-1?' first':'')+(p.dk?' flagged':'');
        d.innerHTML='<div class="top"><b>'+esc(a.label)+'</b>'+
          '<span class="rt"><span class="lvl">'+p.label+'</span><span class="chk">Needs validation</span></span></div>'+
          '<div class="segs" role="img" aria-label="'+p.label+', '+p.score+' of 4"><i></i><i></i><i></i><i></i></div>'+
          '<div class="note">'+esc(RESULTS[a.key].desc)+'</div>';
        bars.appendChild(d);
      });
      var any=per.some(function(p){return p.dk});
      var foot=document.createElement('p');
      foot.className='bars-note';
      foot.innerHTML=(any?'<span class="chk">Needs validation</span> means the area includes a “not sure” answer. Treat it as something to check, not a confirmed gap. ':'')+esc(DIRECTIONAL);
      bars.appendChild(foot);
    }

    function buildRec(){
      var rec=$('#dga-rec'), first=last.first;
      var html='<div class="eyebrow">We recommend the first area to investigate</div>';
      if(!first.length){
        html+='<p class="nogaps">'+esc(NO_GAPS)+'</p>';
      } else {
        first.forEach(function(n){
          var a=AREAS[n], r=RESULTS[a.key], p=last.per[n];
          html+='<article class="pick">'+
            '<div class="pick-area"><span>'+esc(a.label)+'</span><span class="lvl">'+p.label+'</span>'+(p.dk?'<span class="chk">Needs validation</span>':'')+'</div>'+
            '<h3>'+esc(r.head)+'</h3>'+
            (p.mostlyUnknown?'<p class="more">More information is needed. Much of this result comes from “not sure” answers, so it shows what to check first, not a confirmed gap.</p>':'')+
            r.body.map(function(t){return '<p>'+esc(t)+'</p>'}).join('')+
            '<h4>'+esc(r.stepsHead)+'</h4><ol>'+r.steps.map(function(t){return '<li>'+t+'</li>'}).join('')+'</ol>'+
            '<h4>How we can help</h4><p>'+esc(r.help)+'</p>'+
          '</article>';
        });
      }
      rec.innerHTML=html;
    }

    function drawBars(){
      $('#dga-bars').querySelectorAll('.bar').forEach(function(bar,n){
        var segs=bar.querySelectorAll('.segs i'), s=last.per[n].score;
        for(var k=0;k<s;k++) (function(el,delay){ setTimeout(function(){ el.classList.add('on') },delay) })(segs[k],120+n*110+k*70);
      });
    }

    $('#dga-start').onclick=function(){ show('#dga-s-q'); paint(1) };
    $('#dga-next').onclick=function(){ i<QUESTIONS.length-1 ? (i++,paint(1)) : results() };
    $('#dga-back').onclick=function(){ if(i>0){ i--; paint(-1) } };
    $('#dga-again').onclick=function(){
      ans=new Array(QUESTIONS.length).fill(null); i=0; rail.style.width='0%';
      $('#dga-vault').classList.remove('open'); $('#dga-gate').style.display=''; $('#dga-post').hidden=true;
      $('#dga-confirm').hidden=true;
      $('#dga-mail').value=''; $('#dga-mail').classList.remove('bad'); $('#dga-err').textContent='';
      var b=$('#dga-send'); b.disabled=false; b.innerHTML='Unlock results <span class="arr">&rarr;</span>';
      show('#dga-s-intro');
    };
    var FREE = /@(gmail|yahoo|hotmail|outlook|icloud|aol|proton(mail)?|live|msn)\./i;

    $('#dga-emailwrap').addEventListener('submit', function(e){
      e.preventDefault();
      var el=$('#dga-mail'), v=el.value.trim(), err=$('#dga-err');
      el.classList.remove('bad'); err.textContent='';

      if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)){
        el.classList.add('bad'); el.focus(); err.textContent='That does not look like a valid email.'; return;
      }
      if(FREE.test(v)){
        el.classList.add('bad'); el.focus(); err.textContent='Please use your work email so we can tailor the results.'; return;
      }

      var btn=$('#dga-send'); btn.disabled=true; btn.innerHTML='Unlocking\u2026';
      deliver(v, payload());
      $('#dga-confirmmail').textContent=v;
      $('#dga-confirm').hidden=false;
      unlock();
    });

    /* Lead record: each original letter is kept separately from its points. */
    function payload(){
      var pick=function(n){ return ans[n]===null ? null : { letter:LETTERS[ans[n]], answer:QUESTIONS[n].a[ans[n]] } };
      return {
        email: null,
        assessment: 'Your Sales & Marketing Growth Gap – Assessment',
        company: { revenue:pick(0), role:pick(1) },
        fixIn90Days: (ans[QUESTIONS.length-1]||'').trim()||null,
        answers: QUESTIONS.map(function(q,n){
          if(q.area<0) return null;
          var unknown = ans[n]===3 && q.dk!==false;
          return { q:'Q'+(n+1), area:AREAS[q.area].label, question:q.q,
                   letter:LETTERS[ans[n]], answer:q.a[ans[n]], points:POINTS[ans[n]], unknown:unknown };
        }).filter(Boolean),
        areas: AREAS.map(function(a,n){ var p=last.per[n];
          return { area:a.label, score:p.score, max:4, label:p.label, needsValidation:p.dk, mostlyUnknown:p.mostlyUnknown } }),
        firstToInvestigate: last.first.map(function(n){ return AREAS[n].label }),
        noSignificantGaps: last.first.length===0,
        completedAt: new Date().toISOString()
      };
    }

    function deliver(email, data){
      data.email = email;
      if(!ENDPOINT){ console.log('[assessment] demo mode \u2014 would POST:', data); return }
      fetch(ENDPOINT,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
        .catch(function(){ /* never block the user on a failed post */ });
    }

    function unlock(){
      $('#dga-vault').classList.add('open');
      $('#dga-post').hidden=false;
      drawBars();
      setTimeout(function(){
        $('#dga-emailwrap') && ($('#dga-gate').style.display='none');
        $('#dga-post').scrollIntoView({behavior:'smooth',block:'nearest'});
      },700);
    }
    $('#dga-book').onclick=function(){
      if(BOOK_URL){ window.location.href=BOOK_URL } else { alert('Demo only — this would open the booking link.') }
    };
  }

  /* ---------- mount ---------- */
  function init(){
    var root=document.getElementById('digg-assessment');
    if(!root || root.getAttribute('data-ready')) return;   /* Elementor's editor can run this twice */
    root.setAttribute('data-ready','1');
    if(!document.getElementById('digg-assessment-css')){
      var st=document.createElement('style');
      st.id='digg-assessment-css';
      st.textContent=CSS;
      (document.head||document.documentElement).appendChild(st);
    }
    root.innerHTML=HTML;
    boot(root);
  }
  if(document.getElementById('digg-assessment') || document.readyState!=='loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
