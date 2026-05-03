/* ═══════════════════════════════════════════
   RENDER ALL
═══════════════════════════════════════════ */
function renderAll(){
  renderCats();
  renderBestSellers();
  filterProds();
  renderSvcs();
  renderReviews();
  renderFilterRow();
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function(){
  /* ── 1. Visual setup (instant, no data needed) ── */
  initMode();
  initParallax();
  initReveal();
  applyHeroOnLoad();

  /* ── 2. Show skeleton placeholders while DB loads ── */
  if(typeof showSkeletonBestSellers==='function') showSkeletonBestSellers();
  if(typeof showSkeletonGrid==='function')        showSkeletonGrid();
  if(typeof showSkeletonServices==='function')    showSkeletonServices();

  /* ── 3. Page loader overlay ── */
  var loaderDone = false;
  function hideLoader(){
    if(loaderDone) return;
    loaderDone = true;
    var loader = document.getElementById('pageLoader');
    if(loader){
      loader.classList.add('hidden');
      setTimeout(function(){ loader.classList.add('gone'); }, 420);
    }
  }
  /* Safety: hide loader after 6s regardless */
  setTimeout(function(){ hideLoader(); renderAll(); }, 6000);

  /* ── 4. Connect Supabase then fetch ALL live data ── */
  initSupa(function(){
    loadInitialData().then(function(){
      hideLoader();
    }).catch(function(e){
      console.error('[RicsGlam] Init error:', e);
      hideLoader();
      renderAll();
    });
  });

  /* ── 5. Restore session (login state) ── */
  var sess = getSession();
  if(sess){
    currentUser = sess;
    if(sess.role==='admin' && sessionStorage.getItem('rg2_admin')==='1'){
      isAdmin = true;
      enterAdminMode();
    } else if(sess.role==='user'){
      enterUserMode();
    }
  }

  /* ── 6. Scroll spy ── */
  var navSections = ['homeSection','servicesSection','shopSection',
                     'reviewsSection','contactSection'];
  var navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', function(){
    var scrollY = window.scrollY + 100;
    var current = 'homeSection';
    navSections.forEach(function(id){
      var el = document.getElementById(id);
      if(el && el.offsetTop <= scrollY) current = id;
    });
    navLinks.forEach(function(a, i){
      a.classList.toggle('active', navSections[i]===current);
    });
  }, {passive:true});

  /* ── 7. Cart badge ── */
  updateCartUI();

  /* ── 8. Chat badge (first visit) ── */
  setTimeout(function(){
    if(!sessionStorage.getItem('chatSeen')){
      var badge = document.getElementById('chatBadge');
      if(badge) badge.classList.add('show');
    }
  }, 3000);
  var chatWin = document.getElementById('chatWin');
  if(chatWin) chatWin.addEventListener('click', function(){
    sessionStorage.setItem('chatSeen','1');
  });
})