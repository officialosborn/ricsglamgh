/* ═══════════════════════════════════════════
   SUPABASE — backend auth & data
   URL:  https://nrltliemkvcckhrmbodn.supabase.co
═══════════════════════════════════════════ */
v
/* ═══════════════════════════════════════════
   SUPABASE — backend auth & data
   URL:  https://nrltliemkvcckhrmbodn.supabase.co
═══════════════════════════════════════════ */
var SUPA_URL='https://nrltliemkvcckhrmbodn.supabase.co';
var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybHRsaWVta3ZjY2tocm1ib2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTcyMTIsImV4cCI6MjA5MzAzMzIxMn0.17Lqrq-1s-6AaQKAIQqYJHN88wRPXqBPCmcc0TGwmoE';
var _sb=null;

function initSupa(cb){
  if(_sb){if(cb)cb();return;}
  var s=document.createElement('script');
  s.src='https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  s.onload=function(){
    try{
      _sb=window.supabase.createClient(SUPA_URL,SUPA_KEY,{
        global:{
          fetch:function(url,opts){
            opts=opts||{};
            opts.cache='no-store';
            opts.headers=Object.assign({},opts.headers,{
              'Cache-Control':'no-store, no-cache, must-revalidate',
              'Pragma':'no-cache'
            });
            return fetch(url,opts);
          }
        },
        db:{schema:'public'}
      });
      console.log('[RicsGlam] Supabase connected');
      if(cb)cb();
    }catch(e){console.warn('[RicsGlam] Supabase init failed:',e);}
  };
  s.onerror=function(){console.warn('[RicsGlam] Supabase SDK failed to load — running in localStorage mode');};
  document.head.appendChild(s);
}

/* Sign up via Supabase Auth + insert user profile */
async function signUpSupa(name,email,phone,password){
  if(!_sb)return{error:'Not connected'};
  var res=await _sb.auth.signUp({email:email,password:password,options:{data:{name:name,phone:phone}}});
  if(!res.error&&res.data.user){
    await _sb.from('profiles').upsert({id:res.data.user.id,name:name,email:email,phone:phone,role:'user'});
  }
  return res;
}

/* Login via Supabase Auth */
async function loginSupa(email,password){
  if(!_sb)return{error:'Not connected'};
  return await _sb.auth.signInWithPassword({email:email,password:password});
}

/* Logout via Supabase Auth */
async function logoutSupa(){
  if(_sb)await _sb.auth.signOut();
}

/* Save site data to Supabase (admin only) */
async function syncToSupa(){
  if(!isAdmin){
    console.warn('[RicsGlam] syncToSupa blocked - not admin');
    return;
  }
  if(!_sb){ initSupa(function(){ syncToSupa(); }); return; }
  try{
    showToast('\u23f3 Saving...', 'info');
    /* ── Categories (photos) ── */
    var cats = categories.map(function(c){
      return {id:c.id, cat_key:c.key, label:c.label, emoji:c.emoji, image:c.img||null};
    });
    var {error:ce} = await _sb.from('categories').upsert(cats,{onConflict:'id'});
    if(ce) console.warn('[RicsGlam] categories sync:', ce.message);
    /* ── Site settings (hero + social) ── */
    var settings = [
      {key:'heroData',    value:JSON.stringify(heroData)},
      {key:'socialLinks', value:JSON.stringify(socialLinks)}
    ];
    var {error:se} = await _sb.from('site_settings').upsert(settings,{onConflict:'key'});
    if(se) console.warn('[RicsGlam] settings sync:', se.message);
    showToast('\u2705 Saved! Refreshing...', 'success');
    /* Clear stale localStorage then reload so all visitors see changes */
    ['rg2_products','rg2_services','rg2_testimonials',
     'rg2_categories','rg2_hero','rg2_social'].forEach(function(k){
      localStorage.removeItem(k);
    });
    setTimeout(function(){ window.location.reload(true); }, 1500);
  } catch(e){
    console.error('[RicsGlam] syncToSupa error:', e.message||e);
    showToast('\u26a0 Sync failed: '+(e.message||e), 'error');
  }
}

/* Load site data from Supabase on page load */
function loadFromSupaWithLoader(callback){
  loadFromSupa().then(function(){
    if(callback)callback();
  }).catch(function(){
    // Supabase failed — use localStorage fallback
    loadSaved();renderAll();applyHeroOnLoad();
    if(callback)callback();
  });
}

async function loadInitialData(){
  if(!_sb){
    console.warn('[RicsGlam] Supabase not ready — retrying in 1s');
    setTimeout(loadInitialData, 1000);
    return;
  }
  console.log('[RicsGlam] Fetching live data from Supabase...');
  try{
    /* ── Products ── */
    var {data:prods, error:pe} = await _sb
      .from('products').select('*').order('created_at',{ascending:true});
    if(pe) console.warn('[RicsGlam] products:', pe.message);
    products = (prods||[]).map(function(p){
      return {
        id:      String(p.id),
        cat:     p.category  || 'Frontal',
        name:    p.name      || 'Unnamed',
        desc:    p.description || '',
        price:   Number(p.price) || 0,
        badge:   p.badge     || '',
        icon:    p.icon      || '\u2728',
        imgs:    Array.isArray(p.images) ? p.images : [],
        inchMin: p.inch_min  || null,
        inchMax: p.inch_max  || null
      };
    });
    /* ── Services ── */
    var {data:svcs, error:se} = await _sb
      .from('services').select('*').order('created_at',{ascending:true});
    if(se) console.warn('[RicsGlam] services:', se.message);
    services = (svcs||[]).map(function(s){
      return {
        id:   s.id,
        name: s.name        || 'Unnamed',
        desc: s.description || '',
        icon: s.icon        || '\u2728',
        imgs: Array.isArray(s.images) ? s.images : []
      };
    });
    /* ── Testimonials ── */
    var {data:revs, error:re} = await _sb
      .from('testimonials').select('*').order('created_at',{ascending:true});
    if(re) console.warn('[RicsGlam] testimonials:', re.message);
    testimonials = (revs||[]).map(function(t){
      return {
        id:    t.id,
        name:  t.name         || 'Anonymous',
        loc:   t.location     || '',
        av:    t.avatar       || '\uD83D\uDC69\uD83C\uDFFE',
        stars: Number(t.stars)|| 5,
        title: t.title        || '',
        txt:   t.review_text  || '',
        date:  t.review_date  || ''
      };
    });
    /* ── Categories (photos only) ── */
    var {data:cats, error:ce} = await _sb
      .from('categories').select('*');
    if(!ce && cats){
      cats.forEach(function(c){
        if(!c||!c.id) return;
        var local = categories.find(function(x){ return x.id===c.id; });
        if(local && c.image) local.img = c.image;
      });
    }
    /* ── Site settings (hero, social links) ── */
    var {data:settings, error:ste} = await _sb
      .from('site_settings').select('*');
    if(!ste && settings){
      settings.forEach(function(s){
        if(!s||!s.key||!s.value) return;
        try{
          if(s.key==='heroData'){
            var hd = JSON.parse(s.value);
            if(hd && typeof hd==='object') heroData = hd;
          } else if(s.key==='socialLinks'){
            var sl = JSON.parse(s.value);
            if(sl && typeof sl==='object') socialLinks = sl;
          }
        } catch(ex){
          console.warn('[RicsGlam] settings parse error:', s.key);
        }
      });
    }
    /* ── Render everything with live data ── */
    renderAll();
    applyHeroOnLoad();
    console.log('[RicsGlam] Live data loaded — products:'
      +products.length+' services:'+services.length
      +' reviews:'+testimonials.length);
  } catch(e){
    console.error('[RicsGlam] loadInitialData failed:', e.message||e);
    showToast('\u26a0 Could not load site data. Check your connection.','error');
    /* Render empty state — do NOT fall back to hardcoded data */
    renderAll();
    applyHeroOnLoad();
  }
}

/* Alias — existing callers use loadFromSupa */
function loadFromSupa(){
  return loadInitialData();
}


'use strict';

/* ═══════════════════════════════════════════
   PERSIST / LOAD
═══════════════════════════════════════════ */
function save(){
  try{
    localStorage.setItem('rg2_products',JSON.stringify(products));
    localStorage.setItem('rg2_services',JSON.stringify(services));
    localStorage.setItem('rg2_testimonials',JSON.stringify(testimonials));
    localStorage.setItem('rg2_categories',JSON.stringify(categories));
    localStorage.setItem('rg2_social',JSON.stringify(socialLinks));
    localStorage.setItem('rg2_hero',JSON.stringify(heroData));
    localStorage.setItem('rg2_cart',JSON.stringify(cart));
    document.body.classList.remove('editing');
    showToast('✅ All changes saved!');
  }catch(e){showToast('⚠️ Save failed — try clearing old data');}
}
function loadSaved(){
  try{
    var p=localStorage.getItem('rg2_products');if(p)products=JSON.parse(p);
    var s=localStorage.getItem('rg2_services');if(s)services=JSON.parse(s);
    var t=localStorage.getItem('rg2_testimonials');if(t)testimonials=JSON.parse(t);
    var c=localStorage.getItem('rg2_categories');if(c)categories=JSON.parse(c);
    var sl=localStorage.getItem('rg2_social');if(sl)socialLinks=JSON.parse(sl);
    var h=localStorage.getItem('rg2_hero');if(h)heroData=JSON.parse(h);
    var cr=localStorage.getItem('rg2_cart');if(cr)cart=JSON.parse(cr);
  }catch(e){}
}
function markEditing(){if(isAdmin)document.body.classList.add('editing');}

/* ═══════════════════════════════════════════
   AUTH — USERS
═══════════════════════════════════════════ */
function getUsers(){try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]');}catch(e){return[];}}
function saveUsers(u){localStorage.setItem(USERS_KEY,JSON.stringify(u));}
function hashPwd(s){var h=0,i,c;for(i=0;i<s.length;i++){c=s.charCodeAt(i);h=((h<<5)-h)+c;h|=0;}return Math.abs(h).toString(16).padStart(8,'0');}
function getSession(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');}catch(e){return null;}}
function setSession(u){sessionStorage.setItem(SESSION_KEY,JSON.stringify(u));}
function clearSession(){sessionStorage.removeItem(SESSION_KEY);sessionStorage.removeItem('rg2_admin');}

function doLogin(){
  var em=(document.getElementById('liEmail').value||'').trim().toLowerCase();
  var pw=document.getElementById('liPass').value||'';
  var err=document.getElementById('loginErr');
  err.style.display='none';
  if(!em||!pw){showErr(err,'Please enter email and password.');return;}

  /* ── STEP 1: Hardcoded admin intercept ──────────────────
     Recognises ritchinduka@gmail.com / Ndukaglam2018@
     Bypasses Supabase Auth completely — never creates a
     customer profile. Sets isAdmin = true immediately.     */
  if(checkAdminCreds(em,pw)){
    var u={name:'Admin',email:em,role:'admin'};
    setSession(u);
    sessionStorage.setItem('rg2_admin','1');
    currentUser=u;
    isAdmin=true;
    closeModal('authOverlay');
    enterAdminMode();
    showToast('\u{1F6E1} Admin mode activated!','success');
    return;
  }

  /* ── STEP 2: Regular customer login via Supabase Auth ── */
  var btn=document.querySelector('#loginSection .auth-btn');
  if(btn){btn.textContent='Logging in\u2026';btn.disabled=true;}
  function restoreBtn(){if(btn){btn.textContent='Log In';btn.disabled=false;}}

  if(_sb){
    _sb.auth.signInWithPassword({email:em,password:pw}).then(function(res){
      restoreBtn();
      if(res.error){
        /* Supabase failed — try localStorage fallback */
        localLogin(em,pw,err);
      }else{
        var ud=res.data.user;
        var name=(ud.user_metadata&&ud.user_metadata.name)||em.split('@')[0];
        var su={name:name,email:em,role:'user',sbId:ud.id};
        setSession(su);
        currentUser=su;
        closeModal('authOverlay');
        enterUserMode();
        showToast('\u{1F497} Welcome back, '+name.split(' ')[0]+'!','success');
      }
    });
  }else{
    restoreBtn();
    localLogin(em,pw,err);
  }
}
function localLogin(em,pw,err){
  var users=getUsers();
  var user=users.find(function(u){return u.email===em&&u.passHash===hashPwd(pw);});
  if(user){
    var su={name:user.name,email:user.email,role:'user'};
    setSession(su);currentUser=su;
    closeModal('authOverlay');enterUserMode();
    showToast('Welcome back, '+user.name.split(' ')[0]+'! ??');
  } else {
    showErr(err,'Incorrect email or password.');
  }
}
function doSignup(){
  var name=(document.getElementById('suName').value||'').trim();
  var em=(document.getElementById('suEmail').value||'').trim().toLowerCase();
  var ph=(document.getElementById('suPhone').value||'').trim();
  var pw=document.getElementById('suPass').value||'';
  var err=document.getElementById('signupErr');
  err.style.display='none';
  // Block admin email from creating a customer account
  if(em===_AE.toLowerCase()){
    showErr(err,'This email is reserved. Please use the admin login.');
    return;
  }
  if(!name||!em||!pw){showErr(err,'Please fill in all required fields.');return;}
  if(pw.length<6){showErr(err,'Password must be at least 6 characters.');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){showErr(err,'Please enter a valid email address.');return;}
  var users=getUsers();
  if(users.find(function(u){return u.email===em;})){showErr(err,'An account with this email already exists.');return;}
  var u={name:name,email:em,phone:ph,passHash:hashPwd(pw),joined:new Date().toISOString()};
  users.push(u);saveUsers(users);
  var su={name:name,email:em,role:'user'};
  setSession(su);currentUser=su;
  closeModal('authOverlay');enterUserMode();
  showToast('Welcome to Ric\'s Glam, '+name.split(' ')[0]+'! 💗');
}
function doAdminLogin(){
  var em=(document.getElementById('admEmail').value||'').trim().toLowerCase();
  var pw=document.getElementById('admPass').value||'';
  var err=document.getElementById('admErr');
  err.style.display='none';
  if(!em||!pw){showErr(err,'Please enter credentials.');return;}
  if(checkAdminCreds(em,pw)){
    var u={name:'Admin',email:em,role:'admin'};
    setSession(u);sessionStorage.setItem('rg2_admin','1');
    currentUser=u;isAdmin=true;
    closeModal('admAuthOverlay');enterAdminMode();
  }else{showErr(err,'Invalid credentials.');}
}

/* ================================================
   USER ACCOUNT SETTINGS FUNCTIONS
   openSettingsPanel, closeSettingsPanel,
   updateDisplayName, deleteAccount
================================================ */

function openSettingsPanel(){
  if(!currentUser||isAdmin)return;
  var panel=document.getElementById('settingsPanel');
  if(!panel)return;
  var ni=document.getElementById('settingsNameInput');
  var nd=document.getElementById('settingsNameDisplay');
  var em=document.getElementById('settingsEmailDisplay');
  if(ni)ni.value=currentUser.name||'';
  if(nd)nd.textContent=currentUser.name||'';
  if(em)em.textContent=currentUser.email||'';
  panel.classList.add('open');
  if(typeof showSettingsBackdrop==='function')showSettingsBackdrop();
}

function closeSettingsPanel(){
  var panel=document.getElementById('settingsPanel');
  if(panel)panel.classList.remove('open');
  if(typeof hideSettingsBackdrop==='function')hideSettingsBackdrop();
}

async function updateDisplayName(newName){
  if(!currentUser||isAdmin)return;
  newName=(newName||'').trim();
  if(!newName){showToast('⚠ Name cannot be empty.');return;}
  if(_sb&&currentUser.sbId){
    var res=await _sb.from('profiles').update({name:newName}).eq('id',currentUser.sbId);
    if(res.error){showToast('⚠ Could not update name. Try again.');return;}
  }
  currentUser.name=newName;
  setSession(currentUser);
  var nb=document.getElementById('navUserBtn');
  if(nb)nb.textContent='?? '+newName.split(' ')[0];
  var ud=document.getElementById('userDisplayName');
  if(ud)ud.textContent=newName.split(' ')[0];
  var nd=document.getElementById('settingsNameDisplay');
  if(nd)nd.textContent=newName;
  closeSettingsPanel();
  showToast('✅ Name updated!');
}

async function deleteAccount(){
  if(!currentUser||isAdmin)return;
  var ok=confirm('Delete your account permanently? This cannot be undone.');
  if(!ok)return;
  showToast('⏳ Deleting account...');
  try{
    if(_sb&&currentUser.sbId){
      await _sb.from('profiles').delete().eq('id',currentUser.sbId);
    }
    if(_sb)await _sb.auth.signOut();
  }catch(e){console.warn('[RicsGlam] Delete error:',e.message||e);}
  currentUser=null;isAdmin=false;cart=[];
  clearSession();
  closeSettingsPanel();
  document.body.classList.remove('admin-mode','editing');
  document.getElementById('userBar').classList.remove('show');
  document.getElementById('admBar').classList.remove('show');
  var nb=document.getElementById('navUserBtn');
  if(nb)nb.textContent='?? Log In';
  var gear=document.getElementById('settingsGearBtn');
  if(gear)gear.style.display='none';
  updateCartUI();renderAll();
  showToast('?? Account deleted. Sorry to see you go!');
}
function doLogout(){
  currentUser=null;isAdmin=false;cart=[];
  clearSession();
  closeSettingsPanel();
  document.body.classList.remove('admin-mode','editing');
  document.getElementById('userBar').classList.remove('show');
  document.getElementById('admBar').classList.remove('show');
  document.getElementById('navUserBtn').textContent='\u{1F464} Log In';
  var gear=document.getElementById('settingsGearBtn');
  if(gear)gear.style.display='none';
  updateCartUI();
  renderAll();
  showToast('\u{1F44B} Logged out. See you soon!');
}
function handleAuthClick(){
  if(currentUser){openCart();}
  else{openModal('authOverlay');}
}
function switchAuthTab(t){
  document.getElementById('tabLogin').classList.toggle('on',t==='login');
  document.getElementById('tabSignup').classList.toggle('on',t==='signup');
  document.getElementById('loginSection').classList.toggle('on',t==='login');
  document.getElementById('signupSection').classList.toggle('on',t==='signup');
}
function showErr(el,msg){el.textContent=msg;el.style.display='block';}
function enterUserMode(){
  document.body.classList.remove('admin-mode');
  document.getElementById('userBar').classList.add('show');
  document.getElementById('admBar').classList.remove('show');
  document.getElementById('userDisplayName').textContent=currentUser.name.split(' ')[0];
  document.getElementById('navUserBtn').textContent='\u{1F464} '+currentUser.name.split(' ')[0];
  var gear=document.getElementById('settingsGearBtn');
  if(gear)gear.style.display='flex';
  updateCartUI();renderAll();
}
function enterAdminMode(){
  document.body.classList.add('admin-mode');
  document.getElementById('admBar').classList.add('show');
  document.getElementById('userBar').classList.remove('show');
  document.getElementById('admEmail').textContent=currentUser.email;
  document.getElementById('navUserBtn').textContent='\u{1F6E1} Admin';
  var gear=document.getElementById('settingsGearBtn');
  if(gear)gear.style.display='none';
  renderAll();renderAdmLists();
}