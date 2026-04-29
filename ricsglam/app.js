/* ═══════════════════════════════════════════
   RENDER ALL
═══════════════════════════════════════════ */
function renderAll(){
  renderCats();renderBestSellers();filterProds();renderSvcs();renderReviews();renderFilterRow();
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',function(){
  initMode();
  initParallax();
  initReveal();
  // Load from Supabase first — no flicker, no default flash
  // Loader is shown until Supabase responds (or 4s timeout)
  var loaderDone=false;
  function hideLoader(){
    if(loaderDone)return;
    loaderDone=true;
    var loader=document.getElementById('pageLoader');
    if(loader){
      loader.classList.add('hidden');
      setTimeout(function(){loader.classList.add('gone');},420);
    }
  }
  // Safety timeout — hide loader after 4s regardless
  setTimeout(hideLoader,4000);
  // Try Supabase first
  initSupa(function(){
    loadFromSupaWithLoader(function(){hideLoader();});
  });
  // If Supabase SDK fails to load, fall back to localStorage
  setTimeout(function(){
    if(!loaderDone&&!_sb){
      loadSaved();renderAll();applyHeroOnLoad();hideLoader();
    }
  },3500);
  // Scroll spy — update active nav link
  var navSections=['homeSection','servicesSection','shopSection','reviewsSection','contactSection'];
  var navLinks=document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll',function(){
    var scrollY=window.scrollY+100;
    var current='homeSection';
    navSections.forEach(function(id){
      var el=document.getElementById(id);
      if(el&&el.offsetTop<=scrollY)current=id;
    });
    navLinks.forEach(function(a,i){
      var targets=['homeSection','servicesSection','shopSection','reviewsSection','contactSection'];
      a.classList.toggle('active',targets[i]===current);
    });
  },{passive:true});

  // Restore session
  var sess=getSession();
  if(sess){
    currentUser=sess;
    if(sess.role==='admin'&&sessionStorage.getItem('rg2_admin')==='1'){isAdmin=true;enterAdminMode();}
    else if(sess.role==='user'){enterUserMode();}
  }
  // Show chat badge after 3s for first-time visitors
  setTimeout(function(){
    if(!sessionStorage.getItem('chatSeen'))document.getElementById('chatBadge').classList.add('show');
  },3000);
  document.getElementById('chatWin').addEventListener('click',function(){
    sessionStorage.setItem('chatSeen','1');
  });
});