/* ═══════════════════════════════════════════
   RENDER CATEGORIES
═══════════════════════════════════════════ */

/* ================================================
   SKELETON LOADERS
   Show animated placeholders while DB loads
================================================ */

function makeSkelCard(wide){
  var w=wide?'280px':'100%';
  return '<div class="skel-card" style="width:'+w+';flex-shrink:0">'
    +'<div class="skeleton skel-img"></div>'
    +'<div class="skel-body">'
    +'<div class="skeleton skel-line short"></div>'
    +'<div class="skeleton skel-line full"></div>'
    +'<div class="skeleton skel-line med"></div>'
    +'<div class="skel-price-row">'
    +'<div class="skeleton skel-price"></div>'
    +'<div class="skeleton skel-circle"></div>'
    +'</div></div></div>';
}

function showSkeletonBestSellers(){
  var g=document.getElementById('bsTrack');
  if(!g)return;
  var html='';
  for(var i=0;i<4;i++)html+=makeSkelCard(true);
  g.innerHTML=html;
}

function showSkeletonGrid(){
  var g=document.getElementById('prodGrid');
  if(!g)return;
  var html='';
  for(var i=0;i<8;i++)html+=makeSkelCard(false);
  g.innerHTML=html;
}

function showSkeletonServices(){
  var g=document.getElementById('svcsGrid');
  if(!g)return;
  var html='';
  for(var i=0;i<8;i++){
    html+='<div class="skel-card" style="padding:1.5rem">'
      +'<div class="skeleton" style="width:60px;height:60px;border-radius:12px;margin-bottom:1rem"></div>'
      +'<div class="skeleton skel-line med" style="margin-bottom:.6rem"></div>'
      +'<div class="skeleton skel-line full"></div>'
      +'<div class="skeleton skel-line short" style="margin-top:.5rem"></div>'
      +'</div>';
  }
  g.innerHTML=html;
}

function renderCats(){
  var g=document.getElementById('catsScroll');
  if(!g)return;
  if(!categories||categories.length===0)return; // nothing to render
  var h='';
  categories.forEach(function(c){
    if(!c||!c.key)return; // skip null/malformed entries
    var imgH=c.img
      ?'<img src="'+c.img+'?_t='+Date.now()+'" alt="'+c.label+'"/>'
      :'<span class="cat-emoji-fallback">'+c.emoji+'</span>';
    h+='<div class="cat-circle'+(activeCat===c.key?' active':'')+'" onclick="setCat(\''+c.key+'\')">'
      +'<div class="cat-img-wrap">'
      +imgH
      +(isAdmin?'<button class="cat-edit-btn" onclick="openCatPhoto(\''+c.id+'\');event.stopPropagation()">&#9998;</button>':'')
      +'</div>'
      +'<span class="cat-label">'+c.label+'</span>'
      +'</div>';
  });
  g.innerHTML=h;
}
function setCat(key){activeCat=key;renderCats();filterProds();}

/* ═══════════════════════════════════════════
   RENDER PRODUCTS
═══════════════════════════════════════════ */
function makeProductCard(p, forBS){
  forBS = forBS || false;

  /* ── Image: strictly use images[0] from Supabase Storage ── */
  var imgSrc  = (p.imgs && p.imgs.length > 0) ? p.imgs[0] : '';
  var imgHtml = imgSrc
    ? '<img src="' + imgSrc + '" alt="' + p.name + '" loading="lazy" '
        + 'onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'" />'
      + '<div class="prod-img-placeholder" style="display:none">' + (p.icon||'\u2728') + '</div>'
    : '<div class="prod-img-placeholder">' + (p.icon||'\u2728') + '</div>';

  var badgeHtml = p.badge
    ? '<span class="prod-badge">' + p.badge + '</span>'
    : '';

  var inchHtml = (p.inchMin && p.inchMax)
    ? '<span class="prod-tag">' + p.inchMin + '\u201d \u2013 ' + p.inchMax + '\u201d</span>'
    : '';

  var adminBar = isAdmin
    ? '<div class="prod-adm-bar">'
        + '<button class="prod-adm-edit" '
            + 'onclick="openProdForm(\'' + p.id + '\');event.stopPropagation()">Edit</button>'
        + '<button class="prod-adm-del" '
            + 'onclick="deleteProdInline(\'' + p.id + '\');event.stopPropagation()">Delete</button>'
        + '</div>'
    : '';

  return '<div class="prod-card' + (forBS ? ' bs-card' : '') + '" '
       + 'onclick="openProdDetail(\'' + p.id + '\')">' 
    + '<div class="prod-img-wrap">' + imgHtml + badgeHtml + '</div>'
    + '<div class="prod-body">'
    + '<div class="prod-tags">'
    + '<span class="prod-tag">' + p.cat + '</span>' + inchHtml
    + '</div>'
    + '<div class="prod-name">'  + p.name  + '</div>'
    + '<div class="prod-desc-short">' + p.desc + '</div>'
    + '<div class="prod-price-row">'
    + '<div><span class="prod-price">GH&#8373;'
    + Number(p.price).toLocaleString() + '</span></div>'
    + '<button class="prod-cart-btn" '
        + 'onclick="handleCartItem(event,\'' + p.id + '\')" title="Add to cart">'
        + '&#128717;</button>'
    + '</div>'
    + '</div>'
    + adminBar
    + '</div>';
}
function renderBestSellers(){
  var g=document.getElementById('bsTrack');
  if(!g)return;
  // Empty state — show placeholder message instead of crashing
  if(!products||products.length===0){
    g.innerHTML='<div style="padding:2rem 6%;color:var(--text3);font-size:.9rem;font-style:italic">New arrivals coming soon — check back shortly!</div>';
    return;
  }
  var best=products.filter(function(p){return p.badge;});
  if(!best.length)best=products.slice(0,4);
  g.innerHTML=best.map(function(p){return makeProductCard(p,true);}).join('');
}
function filterProds(){
  var q=(document.getElementById('searchInput').value||'').toLowerCase();
  var list=products.filter(function(p){
    var catOk=activeCat==='All'||p.cat===activeCat;
    var qOk=!q||p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q);
    return catOk&&qOk;
  });
  var g=document.getElementById('prodGrid');
  if(!g)return;
  // Empty DB state
  if(!products||products.length===0){
    g.innerHTML='<div class="no-results">New arrivals coming soon — check back shortly!</div>';
    return;
  }
  if(!list.length){g.innerHTML='<div class="no-results">No wigs found. Try a different search.</div>';return;}
  g.innerHTML=list.map(function(p){return makeProductCard(p);}).join('');
  renderFilterRow();
}
function renderFilterRow(){
  var r=document.getElementById('filterRow');
  if(!r)return;
  var cats=['All','Frontal','Closure','Curly','Straight','Bob','Colored'];
  r.innerHTML=cats.map(function(c){
    return '<button class="f-btn'+(activeCat===c?' on':'')+'" onclick="setCat(\''+c+'\')">'+c+'</button>';
  }).join('');
}

/* ═══════════════════════════════════════════
   RENDER SERVICES
═══════════════════════════════════════════ */
function renderSvcs(){
  var g=document.getElementById('svcsGrid');
  if(!g)return;
  if(!services||services.length===0){
    g.innerHTML='<div style="color:var(--text3);font-size:.9rem;padding:1rem;font-style:italic">Our services are being updated — check back soon!</div>';
    return;
  }
  g.innerHTML=services.map(function(s){
    var imgH=s.imgs&&s.imgs[0]
      ?'<img src="'+s.imgs[0]+'" alt="'+s.name+'" style="width:100%;height:100%;object-fit:cover"/>'
      :s.icon;
    return '<div class="svc-card" onclick="openSvcDetail(\''+s.id+'\')">'+
      (isAdmin?'<button class="svc-adm-btn" onclick="openSvcForm(\''+s.id+'\');event.stopPropagation()">Edit</button>':'')+
      '<div class="svc-img-box">'+imgH+'</div>'+
      '<div class="svc-name">'+s.name+'</div>'+
      '<div class="svc-desc">'+s.desc+'</div>'+
      '<button class="svc-book-btn" onclick="bookFromSvcId(\''+s.id+'\');event.stopPropagation()">&#128336; Book Now</button>'+
      '</div>';
  }).join('');
}

/* ═══════════════════════════════════════════
   RENDER REVIEWS
═══════════════════════════════════════════ */
function renderReviews(){
  var g=document.getElementById('reviewsTrack');
  if(!g)return;
  if(!testimonials||testimonials.length===0){
    g.innerHTML='<div style="color:var(--text3);font-size:.9rem;padding:1rem 6%;font-style:italic">Be the first to share your experience!</div>';
    return;
  }
  g.innerHTML=testimonials.map(function(t){
    var stars='';
    for(var i=1;i<=5;i++)stars+='<span style="color:'+(i<=t.stars?'#2ecc71':'#ccc')+'">&#9733;</span>';
    return '<div class="review-card">'+
      '<div class="rev-stars">'+stars+'</div>'+
      '<div class="rev-title">'+t.title+'</div>'+
      '<div class="rev-text">"'+t.txt+'"</div>'+
      '<div class="rev-author">'+
      '<div class="rev-av">'+t.av+'</div>'+
      '<div><div class="rev-name">'+t.name+'</div><div class="rev-loc">'+t.loc+'</div></div>'+
      '<div class="rev-date">'+t.date+'</div>'+
      '</div>'+
      (isAdmin?'<div style="display:flex;gap:.4rem;margin-top:.8rem;padding-top:.8rem;border-top:1px solid var(--card-border)"><button class="adm-edit-btn" onclick="openReviewForm(\''+t.id+'\')">Edit</button><button class="adm-del-btn" onclick="deleteReview(\''+t.id+'\')">Delete</button></div>':'')+
      '</div>';
  }).join('');
}

/* ═══════════════════════════════════════════
   PRODUCT DETAIL MODAL
═══════════════════════════════════════════ */
function openProdDetail(id){
  var p=products.find(function(x){return x.id===id;});
  if(!p)return;
  currentProdModal=p;
  var imgs=p.imgs&&p.imgs.length?p.imgs:[];
  var mainImg=document.getElementById('pmMainImg');
  var placeholder=document.getElementById('pmImgPlaceholder');
  if(imgs.length){
    mainImg.src=imgs[0]; /* Storage URL — stable, no cache-bust needed */mainImg.style.display='block';
    placeholder.style.display='none';
  }else{
    mainImg.style.display='none';
    placeholder.style.display='flex';placeholder.textContent=p.icon;
  }
  // Thumbnails
  var tb=document.getElementById('pmThumbs');
  if(imgs.length>1){
    tb.style.display='flex';
    tb.innerHTML=imgs.map(function(src,i){
      return '<img class="prod-thumb'+(i===0?' active':'')+'" src="'+src+'" onclick="switchPMImg(\''+src+'\',this)"/>';
    }).join('');
  }else{tb.style.display='none';}
  // Badge
  var bd=document.getElementById('pmBadge');
  if(p.badge){bd.textContent=p.badge;bd.style.display='inline-block';}else{bd.style.display='none';}
  document.getElementById('pmName').textContent=p.name;
  document.getElementById('pmPrice').textContent='GH₵'+p.price.toLocaleString();
  document.getElementById('pmDesc').textContent=p.desc;
  // Inch
  var inch=document.getElementById('pmInch');
  if(p.inchMin&&p.inchMax){
    inch.style.display='inline-flex';
    document.getElementById('pmInchVal').textContent=p.inchMin+'" – '+p.inchMax+'"';
  }else{inch.style.display='none';}
  // Cart/Buy btn auth check
  var cartBtn=document.getElementById('pmCartBtn');
  cartBtn.textContent=currentUser?'🛒 Add to Cart':'🔒 Login to Add';
  openModal('prodDetailOverlay');
}
function switchPMImg(src,el){
  document.getElementById('pmMainImg').src=src;
  document.querySelectorAll('.prod-thumb').forEach(function(t){t.classList.remove('active');});
  el.classList.add('active');
}
function addToCartFromModal(){
  if(!currentUser){openModal('authOverlay');document.getElementById('authSubMsg').textContent='Please log in to add items to your cart.';return;}
  if(!currentProdModal)return;
  addToCart(currentProdModal.id);
  closeModal('prodDetailOverlay');
}
function buyNowFromModal(){
  if(!currentUser){openModal('authOverlay');document.getElementById('authSubMsg').textContent='Please log in to place an order.';return;}
  if(!currentProdModal)return;
  var p=currentProdModal;
  var msg='Hello Ric\'s Glam! 👋\n\nI\'d like to buy:\n🛒 '+p.name+'\nPrice: GH₵'+p.price.toLocaleString()+'\n\nPlease confirm availability. Thank you!';
  window.open('https://wa.me/233209823469?text='+encodeURIComponent(msg),'_blank');
}

/* ═══════════════════════════════════════════
   SERVICE DETAIL MODAL
═══════════════════════════════════════════ */
function openSvcDetail(id){
  var s=services.find(function(x){return x.id===id;});
  if(!s)return;
  currentSvcModal=s;
  var imgBox=document.getElementById('smImg');
  if(s.imgs&&s.imgs[0]){
    imgBox.innerHTML='<img src="'+s.imgs[0]+'?_t='+Date.now()+'" alt="'+s.name+'" style="width:100%;height:100%;object-fit:cover"/>';
  }else{imgBox.innerHTML=s.icon;}
  document.getElementById('smName').textContent=s.name;
  document.getElementById('smDesc').textContent=s.desc;
  openModal('svcDetailOverlay');
}
function bookFromSvc(){
  closeModal('svcDetailOverlay');
  if(currentSvcModal){
    document.getElementById('bkService').value=currentSvcModal.name;
    scrollTo('contactSection');
  }
}
function bookFromSvcId(id){
  var s=services.find(function(x){return x.id===id;});
  if(s){document.getElementById('bkService').value=s.name;}
  scrollTo('contactSection');
}

/* ═══════════════════════════════════════════
   CART
═══════════════════════════════════════════ */
function handleCartItem(e,id){
  e.stopPropagation();
  if(!currentUser){openModal('authOverlay');document.getElementById('authSubMsg').textContent='Please log in to add items to your cart.';return;}
  addToCart(id);
}
function addToCart(id){
  /* ── Pull product details from the live Supabase state array ── */
  var prod = products.find(function(p){ return String(p.id)===String(id); });
  if(!prod){
    console.warn('[RicsGlam] addToCart: product '+id+' not found in live state');
    showToast('\u26a0 Product not found. Please refresh the page.','warning');
    return;
  }
  /* Cart stores id + qty only. Price always read from live products[] at checkout. */
  var existing = cart.find(function(c){ return String(c.id)===String(id); });
  if(existing){
    existing.qty++;
  } else {
    cart.push({id: String(id), qty: 1});
  }
  updateCartUI();
  showToast('\uD83D\uDED2 ' + prod.name.split(' ').slice(0,3).join(' ') + ' added to cart!', 'success');
}
function updateCartUI(){
  var total=cart.reduce(function(s,c){return s+c.qty;},0);
  var count=document.getElementById('cartCount');
  var dispCount=document.getElementById('cartCountDisplay');
  count.textContent=total;
  count.classList.toggle('show',total>0);
  if(dispCount)dispCount.textContent=total;
}
function handleCartClick(){
  if(!currentUser){openModal('authOverlay');return;}
  openCart();
}
function openCart(){
  renderCartItems();
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartBackdrop').classList.add('show');
}
function closeCart(){
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartBackdrop').classList.remove('show');
}
function renderCartItems(){
  var container = document.getElementById('cartItems');
  var footer    = document.getElementById('cartFooter');
  if(!cart.length){
    container.innerHTML = '<div class="cart-empty">'
      + '<div class="cart-empty-ico">\uD83D\uDED2</div>'
      + '<div>Your cart is empty</div>'
      + '<div style="font-size:.82rem;color:var(--text3);margin-top:.4rem">'
      + 'Browse our collection and add some wigs!</div></div>';
    footer.style.display = 'none';
    return;
  }
  footer.style.display = 'block';
  var html  = '';
  var total = 0;
  cart.forEach(function(item){
    /* ── Always look up price from live products[] — never from stale data ── */
    var p = products.find(function(x){ return String(x.id)===String(item.id); });
    if(!p) return; /* product was deleted — skip silently */
    var lineTotal = Number(p.price) * item.qty;
    total += lineTotal;
    /* Image: use images[0] from Supabase Storage, fall back to icon */
    var imgHtml = (p.imgs && p.imgs.length > 0)
      ? '<img src="' + p.imgs[0] + '" style="width:100%;height:100%;object-fit:cover" />'
      : p.icon || '\u2728';
    html += '<div class="cart-item">'
      + '<div class="cart-item-img">' + imgHtml + '</div>'
      + '<div class="cart-item-info">'
      + '<div class="cart-item-name">' + p.name + '</div>'
      + '<div class="cart-item-price">GH\u20B3' + Number(p.price).toLocaleString() + '</div>'
      + '<div class="cart-item-qty">'
      + '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\',-1)">\u2212</button>'
      + '<span class="qty-num">' + item.qty + '</span>'
      + '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\',1)">+</button>'
      + '</div></div>'
      + '<button class="cart-item-del" onclick="removeFromCart(\'' + item.id + '\')" '
          + 'title="Remove">\u2715</button>'
      + '</div>';
  });
  container.innerHTML = html;
  document.getElementById('cartSubtotal').textContent = 'GH\u20B3' + total.toLocaleString();
  document.getElementById('cartTotal').textContent    = 'GH\u20B3' + total.toLocaleString();
}
function changeQty(id,delta){
  var item=cart.find(function(c){return String(c.id)===String(id);});
  if(!item)return;
  item.qty+=delta;
  if(item.qty<1)cart=cart.filter(function(c){return String(c.id)!==String(id);});
  updateCartUI();renderCartItems();
}
function removeFromCart(id){
  cart=cart.filter(function(c){return String(c.id)!==String(id);});
  updateCartUI();renderCartItems();
}
function checkoutWA(){
  if(!cart.length) return;
  /* Build order from live products[] — always current price */
  var lines = [];
  var total = 0;
  cart.forEach(function(item){
    var p = products.find(function(x){ return String(x.id)===String(item.id); });
    if(!p) return;
    var lineTotal = Number(p.price) * item.qty;
    total += lineTotal;
    lines.push('\u2022 ' + p.name + ' x' + item.qty
      + ' = GH\u20B3' + lineTotal.toLocaleString());
  });
  if(!lines.length){
    showToast('\u26a0 Cart is empty or products not loaded.','warning');
    return;
  }
  var msg = 'Hello Ric\'s Glam! \uD83D\uDC4B\n\n'
    + 'I\'d like to order:\n\n'
    + lines.join('\n')
    + '\n\nTotal: GH\u20B3' + total.toLocaleString()
    + '\n\nPlease confirm and arrange delivery. Thank you!';
  window.open('https://wa.me/233209823469?text='+encodeURIComponent(msg),'_blank');
}

/* ═══════════════════════════════════════════
   BOOKING
═══════════════════════════════════════════ */
function submitBooking(){
  var name=document.getElementById('bkName').value.trim();
  var phone=document.getElementById('bkPhone').value.trim();
  var svc=document.getElementById('bkService').value;
  var date=document.getElementById('bkDate').value;
  var time=document.getElementById('bkTime').value;
  var notes=document.getElementById('bkNotes').value.trim();
  if(!name||!phone||!svc||!date||!time){showToast('⚠️ Please fill in all required fields.');return;}
  var msg='Hello Ric\'s Glam! 👋\n\nI\'d like to book an appointment:\n\n'
    +'📋 Service: '+svc+'\n👤 Name: '+name+'\n📞 Phone: '+phone
    +'\n📅 Date: '+date+'\n🕐 Time: '+time
    +(notes?'\n📝 Notes: '+notes:'')
    +'\n\nPlease confirm my slot. Thank you!';
  window.open('https://wa.me/233209823469?text='+encodeURIComponent(msg),'_blank');
}

/* ═══════════════════════════════════════════
   BEST SELLER SCROLL
═══════════════════════════════════════════ */
function scrollBS(dir){
  var t=document.getElementById('bsTrack');
  if(t)t.scrollBy({left:dir*280,behavior:'smooth'});
}