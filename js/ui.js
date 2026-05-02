/* ═══════════════════════════════════════════
   MODE TOGGLE (light/dark)
═══════════════════════════════════════════ */
function toggleMode(){
  var dark=document.body.classList.toggle('dark');
  document.getElementById('modeBtn').textContent=dark?'☀️':'🌙';
  localStorage.setItem('rg2_mode',dark?'dark':'light');
}
function initMode(){
  var m=localStorage.getItem('rg2_mode');
  var dark=m===null?true:m==='dark';
  document.body.classList.toggle('dark',dark);
  document.getElementById('modeBtn').textContent=dark?'☀️':'🌙';
}

/* ═══════════════════════════════════════════
   PARALLAX EFFECT
═══════════════════════════════════════════ */
function initParallax(){
  // Parallax: only bg and mid layers move — fg stays centered always
  window.addEventListener('mousemove',function(e){
    var hero=document.getElementById('homeSection');
    if(!hero||hero.getBoundingClientRect().bottom<0)return;
    var cx=window.innerWidth/2,cy=window.innerHeight/2;
    var dx=(e.clientX-cx)/cx,dy=(e.clientY-cy)/cy;
    var bg=document.getElementById('heroBg');
    var mid=document.getElementById('heroMid');
    // FG never moves — stays perfectly centered
    if(bg)bg.style.transform='translate('+dx*-20+'px,'+dy*-20+'px) scale(1.15)';
    if(mid)mid.style.transform='translate('+dx*-8+'px,'+dy*-8+'px)';
  },{passive:true});
  window.addEventListener('scroll',function(){
    var hero=document.getElementById('homeSection');
    if(!hero)return;
    var s=window.scrollY;
    if(s>hero.offsetHeight)return;
    var bg=document.getElementById('heroBg');
    if(bg)bg.style.transform='translateY('+(s*0.35)+'px) scale(1.15)';
  },{passive:true});
}

/* ═══════════════════════════════════════════
   LOGO TRIPLE-TAP → ADMIN LOGIN
═══════════════════════════════════════════ */
function handleLogoTap(){
  logoTapCount++;
  clearTimeout(logoTapTimer);
  if(logoTapCount>=3){
    logoTapCount=0;
    if(isAdmin){openAdmPanel();}
    else{
      document.getElementById('admEmail').value='';
      document.getElementById('admPass').value='';
      document.getElementById('admErr').style.display='none';
      openModal('admAuthOverlay');
    }
    return;
  }
  logoTapTimer=setTimeout(function(){
    if(logoTapCount===1)scrollTo('homeSection');
    logoTapCount=0;
  },700);
}

/* ═══════════════════════════════════════════
   SCROLL / NAV
═══════════════════════════════════════════ */
function scrollTo(id){
  var el=document.getElementById(id);
  if(el)el.scrollIntoView({behavior:'smooth'});
}
function filterBycat(cat){activeCat=cat;scrollTo('shopSection');filterProds();}
function toggleMobNav(){document.getElementById('mobNav').classList.toggle('open');}

/* ═══════════════════════════════════════════
   MODALS
═══════════════════════════════════════════ */
function openModal(id){document.getElementById(id).classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('show');}

/* ═══════════════════════════════════════════
   CHAT
═══════════════════════════════════════════ */
function toggleChat(){
  var w=document.getElementById('chatWin');
  var open=w.classList.toggle('open');
  if(open)document.getElementById('chatBadge').classList.remove('show');
}
function sendChatMsg(){
  var inp=document.getElementById('chatInput');
  var msg=(inp.value||'').trim();
  if(!msg)return;
  var msgs=document.getElementById('chatMsgs');
  var now=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  var div=document.createElement('div');
  div.className='chat-msg user';
  div.innerHTML=msg+'<div class="chat-msg-time">'+now+'</div>';
  msgs.appendChild(div);
  inp.value='';
  msgs.scrollTop=msgs.scrollHeight;
  // Auto-reply after 1.5s
  setTimeout(function(){
    var replies=[
      'Thanks for reaching out! 😊 We\'ll get back to you shortly.',
      'Hi! For fastest response, also WhatsApp us at 0209823469.',
      'Got your message! Our team will reply very soon. 💗',
      'Thank you! You can also book directly via the booking form below.'
    ];
    var r=replies[Math.floor(Math.random()*replies.length)];
    var rd=document.createElement('div');
    rd.className='chat-msg admin';
    rd.innerHTML=r+'<div class="chat-msg-time">Just now</div>';
    msgs.appendChild(rd);
    msgs.scrollTop=msgs.scrollHeight;
  },1500);
}

/* ═══════════════════════════════════════════
   TOAST / UTILITY
═══════════════════════════════════════════ */
function showToast(msg, type){
  // type: 'success' | 'error' | 'warning' | 'info' (default)
  var t=document.getElementById('toast');
  if(!t)return;
  // Auto-detect type from message prefix if not specified
  if(!type){
    if(msg.startsWith('✅')||msg.startsWith('??')||msg.startsWith('??'))type='success';
    else if(msg.startsWith('⚠')||msg.startsWith('⏳'))type='warning';
    else if(msg.startsWith('❌')||msg.startsWith('??'))type='error';
    else type='info';
  }
  // Remove previous type classes
  t.classList.remove('toast-success','toast-error','toast-warning','toast-info');
  t.classList.add('toast-'+type);
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer=setTimeout(function(){t.classList.remove('show');},3000);
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
function initReveal(){
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});
  },{threshold:.12});
  document.querySelectorAll('.fu').forEach(function(el){obs.observe(el);});
}

/* ═══════════════════════════════════════════
   CLOSE MODALS ON BACKDROP CLICK
═══════════════════════════════════════════ */
document.querySelectorAll('.modal-overlay').forEach(function(overlay){
  overlay.addEventListener('click',function(e){
    if(e.target===overlay)overlay.classList.remove('show');
  });
});
document.querySelectorAll('.adm-panel-overlay').forEach(function(overlay){
  overlay.addEventListener('click',function(e){
    if(e.target===overlay)closeAdmPanel();
  });
});
/* ═══════════════════════════════════════════
   SETTINGS PANEL BACKDROP TOGGLE
═══════════════════════════════════════════ */
function showSettingsBackdrop(){
  var bd=document.getElementById('settingsBackdrop');
  if(bd)bd.classList.add('show');
}
function hideSettingsBackdrop(){
  var bd=document.getElementById('settingsBackdrop');
  if(bd)bd.classList.remove('show');
}
