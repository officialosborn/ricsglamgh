/* ═══════════════════════════════════════════
   SUPABASE — backend auth & data
   URL:  https://xryizxjtyvehkrapjwww.supabase.co
═══════════════════════════════════════════ */
v
/* ═══════════════════════════════════════════
   SUPABASE — backend auth & data
   URL:  https://xryizxjtyvehkrapjwww.supabase.co
═══════════════════════════════════════════ */
var SUPA_URL='https://xryizxjtyvehkrapjwww.supabase.co';
var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeWl6eGp0eXZlaGtyYXBqd3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTc1NTIsImV4cCI6MjA5MjU5MzU1Mn0.iInB0ELVOoDRZz_V9qMssWxI9Kt1vJ5Q-djBjAoxNig';
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
  if(!_sb){initSupa(function(){syncToSupa();});return;}
  try{
    showToast('⏳ Saving to database...');
    var prods=products.map(function(p){
      return{id:String(p.id),name:p.name,category:p.cat,description:p.desc,
             price:p.price,badge:p.badge||'',icon:p.icon||'',
             images:p.imgs||[],inch_min:p.inchMin||null,inch_max:p.inchMax||null};
    });
    var r1=await _sb.from('products').upsert(prods,{onConflict:'id'});
    if(r1.error)console.warn('products:',r1.error.message);

    var svcs=services.map(function(s){
      return{id:s.id,name:s.name,description:s.desc,icon:s.icon||'',images:s.imgs||[]};
    });
    var r2=await _sb.from('services').upsert(svcs,{onConflict:'id'});
    if(r2.error)console.warn('services:',r2.error.message);

    var revs=testimonials.map(function(t){
      return{id:t.id,name:t.name,location:t.loc||'',avatar:t.av||'',
             stars:t.stars,title:t.title||'',review_text:t.txt,review_date:t.date||''};
    });
    var r3=await _sb.from('testimonials').upsert(revs,{onConflict:'id'});
    if(r3.error)console.warn('testimonials:',r3.error.message);

    var cats=categories.map(function(c){
      return{id:c.id,cat_key:c.key,label:c.label,emoji:c.emoji,image:c.img||null};
    });
    var r4=await _sb.from('categories').upsert(cats,{onConflict:'id'});
    if(r4.error)console.warn('categories:',r4.error.message);

    var settings=[
      {key:'heroData',value:JSON.stringify(heroData)},
      {key:'socialLinks',value:JSON.stringify(socialLinks)}
    ];
    var r5=await _sb.from('site_settings').upsert(settings,{onConflict:'key'});
    if(r5.error)console.warn('settings:',r5.error.message);

    console.log('[RicsGlam] ✅ All data synced to Supabase');
    showToast('✅ Saved! Changes are now live for everyone.');
  }catch(e){
    console.error('[RicsGlam] Sync error:',e);
    showToast('⚠️ Sync error — saved locally. Check console.');
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

async function loadFromSupa(){
  if(!_sb)return;
  try{
    var {data:prods,error:pe}=await _sb.from('products').select('*').order('created_at',{ascending:true});
    if(pe){console.warn('[RicsGlam] products error:',pe.message);}
    else if(prods&&prods.length>0){
      products=prods.map(function(p){
        return{id:String(p.id),cat:p.category||'Frontal',name:p.name||'Unnamed',
               desc:p.description||'',price:Number(p.price)||0,badge:p.badge||'',
               icon:p.icon||'\u2728',imgs:Array.isArray(p.images)?p.images:[],
               inchMin:p.inch_min||null,inchMax:p.inch_max||null};
      });
    }else{console.log('[RicsGlam] No products in DB - using defaults');}

    var {data:svcs,error:se}=await _sb.from('services').select('*');
    if(se){console.warn('[RicsGlam] services error:',se.message);}
    else if(svcs&&svcs.length>0){
      services=svcs.map(function(s){
        return{id:s.id,name:s.name||'Unnamed',desc:s.description||'',
               icon:s.icon||'\u2728',imgs:Array.isArray(s.images)?s.images:[]};
      });
    }else{console.log('[RicsGlam] No services in DB - using defaults');}

    var {data:revs,error:re2}=await _sb.from('testimonials').select('*').order('created_at',{ascending:true});
    if(re2){console.warn('[RicsGlam] testimonials error:',re2.message);}
    else if(revs&&revs.length>0){
      testimonials=revs.map(function(t){
        return{id:t.id,name:t.name||'Anonymous',loc:t.location||'',
               av:t.avatar||'\uD83D\uDC69\uD83C\uDFFE',stars:Number(t.stars)||5,
               title:t.title||'',txt:t.review_text||'',date:t.review_date||''};
      });
    }else{console.log('[RicsGlam] No testimonials in DB - using defaults');}

    var {data:cats,error:ce}=await _sb.from('categories').select('*');
    if(!ce&&cats&&cats.length>0){
      cats.forEach(function(c){
        if(!c||!c.id)return;
        var local=categories.find(function(x){return x.id===c.id;});
        if(local&&c.image)local.img=c.image;
      });
    }

    var {data:settings,error:ste}=await _sb.from('site_settings').select('*');
    if(!ste&&settings&&settings.length>0){
      settings.forEach(function(s){
        if(!s||!s.key||!s.value)return;
        try{
          if(s.key==='heroData'){var hd=JSON.parse(s.value);if(hd&&typeof hd==='object')heroData=hd;}
          else if(s.key==='socialLinks'){var sl=JSON.parse(s.value);if(sl&&typeof sl==='object')socialLinks=sl;}
        }catch(ex){console.warn('[RicsGlam] Setting parse error:',s.key);}
      });
    }

    renderAll();
    applyHeroOnLoad();
    console.log('[RicsGlam] Loaded - products:'+products.length+' services:'+services.length+' reviews:'+testimonials.length);

  }catch(e){
    // Network/Supabase down - use defaults, no crash
    console.warn('[RicsGlam] Load failed, using defaults:',e.message||e);
    renderAll();
    applyHeroOnLoad();
  }
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
  // Admin check (bypass Supabase)
  if(checkAdminCreds(em,pw)){
    var u={name:'Admin',email:em,role:'admin'};
    setSession(u);sessionStorage.setItem('rg2_admin','1');
    currentUser=u;isAdmin=true;
    closeModal('authOverlay');enterAdminMode();return;
  }
  // Try Supabase auth first, fall back to localStorage
  var btn=document.querySelector('#loginSection .auth-btn');
  if(btn){btn.textContent='Logging in...';btn.disabled=true;}
  function restoreBtn(){if(btn){btn.textContent='Log In';btn.disabled=false;}}
  if(_sb){
    _sb.auth.signInWithPassword({email:em,password:pw}).then(function(res){
      restoreBtn();
      if(res.error){
        // Fall back to localStorage
        localLogin(em,pw,err);
      } else {
        var ud=res.data.user;
        var name=(ud.user_metadata&&ud.user_metadata.name)||em.split('@')[0];
        var su={name:name,email:em,role:'user',sbId:ud.id};
        setSession(su);currentUser=su;
        closeModal('authOverlay');enterUserMode();
        showToast('Welcome back, '+name.split(' ')[0]+'! ??');
      }
    });
  } else {
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
function doLogout(){
  currentUser=null;isAdmin=false;cart=[];
  clearSession();
  document.body.classList.remove('admin-mode','editing');
  document.getElementById('userBar').classList.remove('show');
  document.getElementById('admBar').classList.remove('show');
  document.getElementById('navUserBtn').textContent='👤 Log In';
  updateCartUI();
  renderAll();
  showToast('👋 Logged out.');
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
  document.getElementById('navUserBtn').textContent='👤 '+currentUser.name.split(' ')[0];
  updateCartUI();renderAll();
}
function enterAdminMode(){
  document.body.classList.add('admin-mode');
  document.getElementById('admBar').classList.add('show');
  document.getElementById('userBar').classList.remove('show');
  document.getElementById('admEmail').textContent=currentUser.email;
  document.getElementById('navUserBtn').textContent='🛡 Admin';
  renderAll();renderAdmLists();
}