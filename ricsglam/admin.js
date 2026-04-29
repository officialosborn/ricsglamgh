/* ═══════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════ */
function openAdmPanel(tab){
  if(tab)switchAdmTab(tab,null);
  renderAdmLists();
  document.getElementById('admPanelOverlay').classList.add('show');
}
function closeAdmPanel(){document.getElementById('admPanelOverlay').classList.remove('show');}
function switchAdmTab(tab,btn){
  document.querySelectorAll('.adm-section').forEach(function(s){s.classList.remove('on');});
  document.querySelectorAll('.adm-tab-btn').forEach(function(b){b.classList.remove('on');});
  var s=document.getElementById('adm'+tab.charAt(0).toUpperCase()+tab.slice(1));
  if(s)s.classList.add('on');
  if(btn)btn.classList.add('on');
  else{
    document.querySelectorAll('.adm-tab-btn').forEach(function(b){
      if(b.getAttribute('onclick')&&b.getAttribute('onclick').includes("'"+tab+"'"))b.classList.add('on');
    });
  }
}
function renderAdmLists(){
  // Products
  var pl=document.getElementById('admProdList');
  if(pl)pl.innerHTML=products.map(function(p){
    var img=p.imgs&&p.imgs[0]?'<img src="'+p.imgs[0]+'" style="width:44px;height:44px;object-fit:cover;border-radius:8px"/>':p.icon;
    return '<div class="adm-list-item"><div class="adm-list-img">'+img+'</div><div class="adm-list-name">'+p.name+'</div>'
      +'<div class="adm-list-btns"><button class="adm-edit-btn" onclick="openProdForm('+p.id+');closeAdmPanel()">Edit</button>'
      +'<button class="adm-del-btn" onclick="deleteProdInline('+p.id+')">Del</button></div></div>';
  }).join('');
  // Services
  var sl=document.getElementById('admSvcList');
  if(sl)sl.innerHTML=services.map(function(s){
    var img=s.imgs&&s.imgs[0]?'<img src="'+s.imgs[0]+'" style="width:44px;height:44px;object-fit:cover;border-radius:8px"/>':s.icon;
    return '<div class="adm-list-item"><div class="adm-list-img">'+img+'</div><div class="adm-list-name">'+s.name+'</div>'
      +'<div class="adm-list-btns"><button class="adm-edit-btn" onclick="openSvcForm(\''+s.id+'\');closeAdmPanel()">Edit</button>'
      +'<button class="adm-del-btn" onclick="deleteSvcInline(\''+s.id+'\')">Del</button></div></div>';
  }).join('');
  // Reviews
  var rl=document.getElementById('admRevList');
  if(rl)rl.innerHTML=testimonials.map(function(t){
    return '<div class="adm-list-item"><div class="adm-list-img">'+t.av+'</div><div class="adm-list-name">'+t.name+'</div>'
      +'<div class="adm-list-btns"><button class="adm-edit-btn" onclick="openReviewForm(\''+t.id+'\');closeAdmPanel()">Edit</button>'
      +'<button class="adm-del-btn" onclick="deleteReview(\''+t.id+'\')">Del</button></div></div>';
  }).join('');
  // Categories
  var cl=document.getElementById('admCatList');
  if(cl)cl.innerHTML=categories.map(function(c){
    var img=c.img?'<img src="'+c.img+'" style="width:44px;height:44px;object-fit:cover;border-radius:50%"/>':c.emoji;
    return '<div class="adm-list-item"><div class="adm-list-img">'+img+'</div><div class="adm-list-name">'+c.label+'</div>'
      +'<div class="adm-list-btns"><button class="adm-edit-btn" onclick="openCatPhoto(\''+c.id+'\')">Photo</button></div></div>';
  }).join('');
  // Social inputs
  document.getElementById('aTiktokUrl').value=socialLinks.tiktokUrl||'';
  document.getElementById('aSnapUrl').value=socialLinks.snapUrl||'';
  // Hero inputs
  document.getElementById('aHeroH1').value=heroData.h1||'';
  document.getElementById('aHeroSub').value=heroData.sub||'';
}

/* ═══════════════════════════════════════════
   HERO ADMIN EDITS
═══════════════════════════════════════════ */
function handleHeroFlyer(inp){
  var file=inp.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    pendingHeroFlyer=e.target.result;
    var z=document.getElementById('heroFlyerZone');
    var prev=document.getElementById('heroFlyerPrev');
    prev.src=e.target.result;z.classList.add('has');
  };
  reader.readAsDataURL(file);
  markEditing();
}
function applyHeroEdits(){
  var h1=document.getElementById('aHeroH1').value.trim();
  var sub=document.getElementById('aHeroSub').value.trim();
  if(h1){document.getElementById('heroH1').innerHTML=h1;heroData.h1=h1;}
  if(sub){document.getElementById('heroSub').textContent=sub;heroData.sub=sub;}
  if(pendingHeroFlyer){
    var layer=document.getElementById('heroFlyerLayer');
    var img=document.getElementById('heroFlyerImg');
    img.src=pendingHeroFlyer;layer.style.display='block';
    heroData.flyer=pendingHeroFlyer;
  }
  markEditing();
  showToast('✅ Hero updated!');
}
function applySocialLinks(){
  var tu=document.getElementById('aTiktokUrl').value.trim();
  var su=document.getElementById('aSnapUrl').value.trim();
  if(tu)socialLinks.tiktokUrl=tu;
  if(su)socialLinks.snapUrl=su;
  markEditing();showToast('✅ Social links saved!');
}
function applyHeroOnLoad(){
  if(heroData.h1)document.getElementById('heroH1').innerHTML=heroData.h1;
  if(heroData.sub)document.getElementById('heroSub').textContent=heroData.sub;
  // If admin uploaded a custom flyer, show it; otherwise keep the baked-in flyer
  if(heroData.flyer){
    var layer=document.getElementById('heroFlyerLayer');
    var img=document.getElementById('heroFlyerImg');
    img.src=heroData.flyer;
    layer.style.display='block';
  }
  // Always make sure the flyer layer is visible
  var fl=document.getElementById('heroFlyerLayer');
  if(fl&&fl.style.display==='none')fl.style.display='block';
}

/* ═══════════════════════════════════════════
   PRODUCT FORM (admin)
═══════════════════════════════════════════ */
function openProdForm(id){
  var p=id?products.find(function(x){return x.id===id;}):null;
  document.getElementById('prodFormTitle').textContent=p?'Edit Product':'Add Product';
  document.getElementById('editProdId').value=p?String(p.id):'';
  document.getElementById('pName').value=p?p.name:'';
  document.getElementById('pCat').value=p?p.cat:'Frontal';
  document.getElementById('pPrice').value=p?p.price:'';
  document.getElementById('pDesc').value=p?p.desc:'';
  document.getElementById('pInchMin').value=p&&p.inchMin?p.inchMin:'';
  document.getElementById('pInchMax').value=p&&p.inchMax?p.inchMax:'';
  document.getElementById('pBadge').value=p?p.badge:'';
  document.getElementById('delProdBtn').style.display=p?'block':'none';
  // Reset image slots
  pendingPImgs=[null,null,null,null];
  var imgs=p&&p.imgs?p.imgs:[];
  for(var i=0;i<4;i++){
    var slot=document.getElementById('pSlot'+i);
    var prev=document.getElementById('pPrev'+i);
    document.getElementById('pFile'+i).value='';
    if(imgs[i]){pendingPImgs[i]=imgs[i];prev.src=imgs[i];slot.classList.add('has');}
    else{prev.src='';slot.classList.remove('has');}
  }
  openModal('prodFormOverlay');
}
function trigPSlot(i){var s=document.getElementById('pSlot'+i);if(!s.classList.contains('has'))document.getElementById('pFile'+i).click();}
function handlePSlot(i){
  var file=document.getElementById('pFile'+i).files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    pendingPImgs[i]=e.target.result;
    var prev=document.getElementById('pPrev'+i);
    var slot=document.getElementById('pSlot'+i);
    prev.src=e.target.result;slot.classList.add('has');
  };
  reader.readAsDataURL(file);markEditing();
}
function saveProd(){
  var name=document.getElementById('pName').value.trim();
  var cat=document.getElementById('pCat').value;
  var price=parseFloat(document.getElementById('pPrice').value);
  var desc=document.getElementById('pDesc').value.trim();
  var inchMin=parseInt(document.getElementById('pInchMin').value)||null;
  var inchMax=parseInt(document.getElementById('pInchMax').value)||null;
  var badge=document.getElementById('pBadge').value.trim();
  // Always treat editProdId as a STRING for consistent comparison with Supabase IDs
  var eid=document.getElementById('editProdId').value.trim()||null;
  if(!name||!desc||isNaN(price)||price<=0){showToast('⚠️ Fill in all required fields.');return;}
  var imgs=pendingPImgs.filter(Boolean);
  if(eid){
    // EDIT — find by string ID and UPDATE in place (never create a duplicate)
    var idx=products.findIndex(function(p){return String(p.id)===String(eid);});
    if(idx>-1){
      var existingIcon=products[idx].icon||'✨';
      var finalImgs=imgs.length?imgs:(products[idx].imgs||[]);
      products[idx]={
        id:String(eid),cat:cat,name:name,desc:desc,price:price,
        badge:badge,icon:existingIcon,imgs:finalImgs,
        inchMin:inchMin,inchMax:inchMax
      };
      showToast('✅ Product updated!');
    }else{
      // eid set but not found — treat as new to avoid silent failure
      var fallbackId='p'+Date.now();
      products.push({id:fallbackId,cat:cat,name:name,desc:desc,price:price,
                     badge:badge,icon:'✨',imgs:imgs,inchMin:inchMin,inchMax:inchMax});
      showToast('✅ Product added!');
    }
  }else{
    // NEW product — unique timestamp-based string ID
    var newId='p'+Date.now();
    // Guard: if somehow ID already exists, generate a new one
    while(products.findIndex(function(p){return p.id===newId;})>-1){
      newId='p'+Date.now()+Math.floor(Math.random()*1000);
    }
    products.push({id:newId,cat:cat,name:name,desc:desc,price:price,badge:badge,
                   icon:'✨',imgs:imgs,inchMin:inchMin,inchMax:inchMax});
    showToast('✅ Product added!');
  }
  closeModal('prodFormOverlay');save();
  // Immediately sync this single product to Supabase
  if(_sb){syncToSupa();}else{initSupa(function(){syncToSupa();});}
  renderBestSellers();filterProds();renderAdmLists();
}
function deleteProd(){
  var eid=document.getElementById('editProdId').value;
  if(!eid||!confirm('Delete this product?'))return;
  products=products.filter(function(p){return String(p.id)!==String(eid);});
  closeModal('prodFormOverlay');
  // Save to localStorage and Supabase immediately
  save();
  deleteFromSupa('products',eid);
  renderBestSellers();filterProds();renderAdmLists();
  showToast('🗑 Product deleted.');
}
function deleteProdInline(id){
  if(!confirm('Delete this product?'))return;
  products=products.filter(function(p){return String(p.id)!==String(id);});
  save();
  deleteFromSupa('products',id);
  renderBestSellers();filterProds();renderAdmLists();
  showToast('🗑 Product deleted.');
}

/* ═══════════════════════════════════════════
   SERVICE FORM (admin)
═══════════════════════════════════════════ */
function openSvcForm(id){
  var s=id?services.find(function(x){return x.id===id;}):null;
  document.getElementById('svcFormTitle').textContent=s?'Edit Service':'Add Service';
  document.getElementById('editSvcId').value=s?s.id:'';
  document.getElementById('sName').value=s?s.name:'';
  document.getElementById('sDesc').value=s?s.desc:'';
  document.getElementById('delSvcBtn').style.display=s?'block':'none';
  pendingSImgs=[null,null,null,null];
  var imgs=s&&s.imgs?s.imgs:[];
  for(var i=0;i<4;i++){
    var slot=document.getElementById('sSlot'+i);
    var prev=document.getElementById('sPrev'+i);
    document.getElementById('sFile'+i).value='';
    if(imgs[i]){pendingSImgs[i]=imgs[i];prev.src=imgs[i];slot.classList.add('has');}
    else{prev.src='';slot.classList.remove('has');}
  }
  openModal('svcFormOverlay');
}
function trigSSlot(i){var s=document.getElementById('sSlot'+i);if(!s.classList.contains('has'))document.getElementById('sFile'+i).click();}
function handleSSlot(i){
  var file=document.getElementById('sFile'+i).files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    pendingSImgs[i]=e.target.result;
    document.getElementById('sPrev'+i).src=e.target.result;
    document.getElementById('sSlot'+i).classList.add('has');
  };
  reader.readAsDataURL(file);markEditing();
}
function saveSvc(){
  var name=document.getElementById('sName').value.trim();
  var desc=document.getElementById('sDesc').value.trim();
  var eid=document.getElementById('editSvcId').value;
  if(!name||!desc){showToast('⚠️ Fill in all fields.');return;}
  var imgs=pendingSImgs.filter(Boolean);
  if(eid){
    // EDIT — find and update in place, never duplicate
    var idx=services.findIndex(function(s){return String(s.id)===String(eid);});
    if(idx>-1){
      var existingIcon=services[idx].icon||'✨';
      var finalImgs=imgs.length?imgs:(services[idx].imgs||[]);
      services[idx]={id:String(eid),name:name,desc:desc,icon:existingIcon,imgs:finalImgs};
      showToast('✅ Service updated!');
    }else{
      // eid not found — add as new
      var newSvcId='s'+Date.now();
      services.push({id:newSvcId,name:name,desc:desc,icon:'✨',imgs:imgs});
      showToast('✅ Service added!');
    }
  }else{
    // NEW service
    var newSvcId='s'+Date.now();
    services.push({id:newSvcId,name:name,desc:desc,icon:'✨',imgs:imgs});
    showToast('✅ Service added!');
  }
  closeModal('svcFormOverlay');markEditing();renderSvcs();renderAdmLists();
}
function deleteSvc(){
  var eid=document.getElementById('editSvcId').value;
  if(!eid||!confirm('Delete this service?'))return;
  services=services.filter(function(s){return String(s.id)!==String(eid);});
  closeModal('svcFormOverlay');save();deleteFromSupa('services',eid);renderSvcs();renderAdmLists();
  showToast('🗑 Service deleted.');
}
function deleteSvcInline(id){
  if(!confirm('Delete this service?'))return;
  services=services.filter(function(s){return String(s.id)!==String(id);});
  save();deleteFromSupa('services',id);renderSvcs();renderAdmLists();showToast('🗑 Service deleted.');
}

/* ═══════════════════════════════════════════
   REVIEW FORM (admin)
═══════════════════════════════════════════ */
function openReviewForm(id){
  var t=id?testimonials.find(function(x){return x.id===id;}):null;
  editingRevId=t?t.id:null;
  document.getElementById('reviewFormTitle').textContent=t?'Edit Review':'Add Review';
  document.getElementById('editReviewId').value=t?t.id:'';
  document.getElementById('revName').value=t?t.name:'';
  document.getElementById('revLoc').value=t?t.loc:'';
  document.getElementById('revTitle').value=t?t.title:'';
  document.getElementById('revText').value=t?t.txt:'';
  document.getElementById('delRevBtn').style.display=t?'block':'none';
  currentRevStars=t?t.stars:5;
  updateStarPicker();
  openModal('reviewFormOverlay');
}
function setRevStars(n){currentRevStars=n;updateStarPicker();}
function updateStarPicker(){
  document.querySelectorAll('.star-opt').forEach(function(b){
    b.style.opacity=parseInt(b.getAttribute('data-v'))<=currentRevStars?'1':'0.3';
    b.style.color=parseInt(b.getAttribute('data-v'))<=currentRevStars?'#2ecc71':'var(--text3)';
  });
}
function saveReview(){
  var name=document.getElementById('revName').value.trim();
  var loc=document.getElementById('revLoc').value.trim();
  var title=document.getElementById('revTitle').value.trim();
  var txt=document.getElementById('revText').value.trim();
  if(!name||!txt){showToast('⚠️ Name and review text are required.');return;}
  var now=new Date();
  var dateStr=now.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});
  var eid=document.getElementById('editReviewId').value;
  if(eid){
    // EDIT — find and update in place, never duplicate
    var idx=testimonials.findIndex(function(t){return String(t.id)===String(eid);});
    if(idx>-1){
      var existingAv=testimonials[idx].av||'👩🏾';
      testimonials[idx]={
        id:String(eid),name:name,loc:loc||'Accra, Ghana',
        av:existingAv,stars:currentRevStars,
        title:title||'Great experience!',txt:txt,date:dateStr
      };
      showToast('✅ Review updated!');
    }else{
      // eid not found — add as new
      var newRevId='t'+Date.now();
      testimonials.push({id:newRevId,name:name,loc:loc||'Accra, Ghana',
        av:'👩🏾',stars:currentRevStars,title:title||'Great experience!',
        txt:txt,date:dateStr});
      showToast('✅ Review added!');
    }
  }else{
    // NEW review — unique timestamp ID
    var newRevId='t'+Date.now();
    testimonials.push({id:newRevId,name:name,loc:loc||'Accra, Ghana',
      av:'👩🏾',stars:currentRevStars,title:title||'Great experience!',
      txt:txt,date:dateStr});
    showToast('✅ Review added!');
  }
  closeModal('reviewFormOverlay');markEditing();renderReviews();renderAdmLists();
}
function deleteReview(id){
  var eid=id||document.getElementById('editReviewId').value;
  if(!eid||!confirm('Delete this review?'))return;
  testimonials=testimonials.filter(function(t){return String(t.id)!==String(eid);});
  closeModal('reviewFormOverlay');save();deleteFromSupa('testimonials',eid);renderReviews();renderAdmLists();
  showToast('🗑 Review deleted.');
}

/* ═══════════════════════════════════════════
   CATEGORY PHOTO (admin)
═══════════════════════════════════════════ */
function openCatPhoto(id){
  var c=categories.find(function(x){return x.id===id;});
  if(!c)return;
  pendingCatImg=c.img||null;
  document.getElementById('editCatId').value=id;
  document.getElementById('catPhotoTitle').textContent=c.label+' Photo';
  var zone=document.getElementById('catPhotoZone');
  var prev=document.getElementById('catPhotoPrev');
  document.getElementById('catPhotoFile').value='';
  if(c.img){prev.src=c.img;zone.classList.add('has');}else{prev.src='';zone.classList.remove('has');}
  openModal('catPhotoOverlay');
}
function handleCatPhoto(inp){
  var file=inp.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    pendingCatImg=e.target.result;
    var z=document.getElementById('catPhotoZone');
    var p=document.getElementById('catPhotoPrev');
    p.src=e.target.result;z.classList.add('has');
  };
  reader.readAsDataURL(file);markEditing();
}
function saveCatPhoto(){
  var id=document.getElementById('editCatId').value;
  var c=categories.find(function(x){return x.id===id;});
  if(c&&pendingCatImg){c.img=pendingCatImg;markEditing();renderCats();renderAdmLists();closeModal('catPhotoOverlay');showToast('✅ Category photo saved!');}
  else{showToast('⚠️ Please upload a photo first.');}
}
function clearCatPhoto(){
  var id=document.getElementById('editCatId').value;
  var c=categories.find(function(x){return x.id===id;});
  if(c){c.img=null;pendingCatImg=null;markEditing();renderCats();renderAdmLists();closeModal('catPhotoOverlay');showToast('Photo removed.');}
}

/* ═══════════════════════════════════════════
   SAVE ALL
═══════════════════════════════════════════ */

async function deleteFromSupa(table,id){
  if(!_sb)return;
  try{
    var {error}=await _sb.from(table).delete().eq('id',String(id));
    if(error)console.warn('[RicsGlam] Delete error on '+table+':',error.message);
  }catch(e){console.warn('[RicsGlam] Delete exception:',e);}
}

function saveAllChanges(){
  // Step 1: Save to localStorage immediately
  save();
  // Step 2: Sync to Supabase, then clear localStorage cache + reload
  function afterSync(){
    // Remove stale localStorage data so next load pulls fresh from Supabase
    localStorage.removeItem('rg2_products');
    localStorage.removeItem('rg2_services');
    localStorage.removeItem('rg2_testimonials');
    localStorage.removeItem('rg2_categories');
    localStorage.removeItem('rg2_hero');
    localStorage.removeItem('rg2_social');
    showToast('✅ Saved! Refreshing for all visitors...');
    // Reload after 1.5s so admin sees the toast, then gets fresh live version
    setTimeout(function(){
      window.location.reload(true); // true = bypass browser cache
    }, 1500);
  }
  if(_sb){
    syncToSupa().then(afterSync).catch(function(e){
      console.error('Sync failed:',e);
      showToast('⚠️ Sync failed — changes saved locally only.');
    });
  }else{
    initSupa(function(){
      syncToSupa().then(afterSync).catch(function(e){
        showToast('⚠️ Sync failed — changes saved locally only.');
      });
    });
  }
}