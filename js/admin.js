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
async function handlePSlot(i){
  var file=document.getElementById('pFile'+i).files[0];
  if(!file)return;

  /* ── FIX 4: Upload to Supabase Storage (product-images) ──
     Replaces base64 logic. Resulting public URL is stored
     in the images array — no long base64 strings in the DB. */
  if(_sb){
    var ext=file.name.split('.').pop()||'jpg';
    var path='products/'+Date.now()+'_'+i+'.'+ext;
    showToast('\u23f3 Uploading image\u2026','info');
    var {data:upData,error:upErr}=await _sb.storage
      .from('product-images')
      .upload(path,file,{cacheControl:'3600',upsert:false});
    if(upErr){
      console.warn('[RicsGlam] Storage upload error:',upErr.message);
      showToast('\u26a0 Upload failed: '+upErr.message,'error');
      /* Fallback: use base64 so admin is not blocked */
      var reader=new FileReader();
      reader.onload=function(e){
        pendingPImgs[i]=e.target.result;
        document.getElementById('pPrev'+i).src=e.target.result;
        document.getElementById('pSlot'+i).classList.add('has');
        showToast('\u26a0 Saved as base64 fallback','warning');
      };
      reader.readAsDataURL(file);
      return;
    }
    /* Get public URL from bucket */
    var {data:urlData}=_sb.storage
      .from('product-images')
      .getPublicUrl(path);
    var publicUrl=urlData&&urlData.publicUrl?urlData.publicUrl:'';
    pendingPImgs[i]=publicUrl;
    document.getElementById('pPrev'+i).src=publicUrl;
    document.getElementById('pSlot'+i).classList.add('has');
    showToast('\u2705 Image uploaded!','success');
  }else{
    /* Supabase not ready — fall back to base64 */
    var reader=new FileReader();
    reader.onload=function(e){
      pendingPImgs[i]=e.target.result;
      document.getElementById('pPrev'+i).src=e.target.result;
      document.getElementById('pSlot'+i).classList.add('has');
    };
    reader.readAsDataURL(file);
  }
  markEditing();
}
async function saveProd(){
  var name  = document.getElementById('pName').value.trim();
  var cat   = document.getElementById('pCat').value;
  var price = parseFloat(document.getElementById('pPrice').value);
  var desc  = document.getElementById('pDesc').value.trim();
  var inchMin = parseInt(document.getElementById('pInchMin').value)||null;
  var inchMax = parseInt(document.getElementById('pInchMax').value)||null;
  var badge = document.getElementById('pBadge').value.trim();
  var eid   = (document.getElementById('editProdId').value||'').trim()||null;
  if(!name||!desc||isNaN(price)||price<=0){
    showToast('\u26a0 Fill in all required fields.','warning');
    return;
  }
  var imgs = pendingPImgs.filter(Boolean);
  if(!_sb){ showToast('\u26a0 Not connected to database.','error'); return; }
  showToast('\u23f3 Saving product...','info');
  var row = {
    name: name, category: cat, description: desc,
    price: price, badge: badge, icon: '\u2728',
    images: imgs, inch_min: inchMin, inch_max: inchMax
  };
  var dbErr;
  if(eid){
    /* ── EDIT: direct .update() — never creates a duplicate ── */
    var existingProd = products.find(function(p){ return String(p.id)===String(eid); });
    row.images = imgs.length ? imgs : (existingProd ? existingProd.imgs||[] : []);
    if(existingProd) row.icon = existingProd.icon||'\u2728';
    var {error:ue} = await _sb.from('products').update(row).eq('id', eid);
    dbErr = ue;
    if(!ue) showToast('\u2705 Product updated!','success');
  } else {
    /* ── NEW: direct .insert() with collision-safe ID ── */
    row.id = 'p'+Date.now();
    var {error:ie} = await _sb.from('products').insert(row);
    dbErr = ie;
    if(!ie) showToast('\u2705 Product added!','success');
  }
  if(dbErr){
    console.error('[RicsGlam] saveProd DB error:', dbErr.message);
    showToast('\u274c DB error: '+dbErr.message,'error');
    return;
  }
  /* Reset pending images */
  pendingPImgs = [null,null,null,null];
  closeModal('prodFormOverlay');
  /* Re-fetch live data so UI matches DB exactly */
  await loadInitialData();
  if(isAdmin) renderAdmLists();
}
async function deleteProd(){
  var eid = document.getElementById('editProdId').value;
  if(!eid || !confirm('Delete this product? This will also remove its images.')) return;
  if(!_sb){ showToast('\u26a0 Not connected.','error'); return; }
  showToast('\u23f3 Deleting product...','info');

  /* ── Step 1: Find the product in current state to get its images ── */
  var prod = products.find(function(p){ return String(p.id)===String(eid); });
  var imgs = (prod && prod.imgs && prod.imgs.length) ? prod.imgs : [];

  /* ── Step 2: Delete image files from Supabase Storage ── */
  if(imgs.length > 0){
    var filePaths = imgs
      .filter(function(url){ return url && url.includes('product-images'); })
      .map(function(url){
        /* Extract path after '/product-images/' from the public URL */
        var marker = '/product-images/';
        var idx    = url.indexOf(marker);
        return idx >= 0 ? url.substring(idx + marker.length) : null;
      })
      .filter(Boolean);

    if(filePaths.length > 0){
      var {error:storErr} = await _sb.storage
        .from('product-images')
        .remove(filePaths);
      if(storErr){
        console.warn('[RicsGlam] Storage delete warning:', storErr.message);
        /* Non-fatal — continue to delete the DB row */
      } else {
        console.log('[RicsGlam] Deleted '+filePaths.length+' image(s) from storage');
      }
    }
  }

  /* ── Step 3: Delete the product row from the database ── */
  var {error:dbErr} = await _sb.from('products').delete().eq('id', eid);
  if(dbErr){
    showToast('\u274c Delete failed: '+dbErr.message,'error');
    return;
  }
  closeModal('prodFormOverlay');
  showToast('\uD83D\uDDD1 Product and images deleted.','success');
  await loadInitialData();
  if(isAdmin) renderAdmLists();
}
async function deleteProdInline(id){
  if(!confirm('Delete this product? This will also remove its images.')) return;
  if(!_sb){ showToast('\u26a0 Not connected.','error'); return; }
  showToast('\u23f3 Deleting...','info');

  /* ── Storage cleanup ── */
  var prod = products.find(function(p){ return String(p.id)===String(id); });
  var imgs = (prod && prod.imgs && prod.imgs.length) ? prod.imgs : [];
  if(imgs.length > 0){
    var filePaths = imgs
      .filter(function(url){ return url && url.includes('product-images'); })
      .map(function(url){
        var marker = '/product-images/';
        var idx    = url.indexOf(marker);
        return idx >= 0 ? url.substring(idx + marker.length) : null;
      })
      .filter(Boolean);
    if(filePaths.length > 0){
      var {error:storErr} = await _sb.storage
        .from('product-images').remove(filePaths);
      if(storErr) console.warn('[RicsGlam] Storage delete warning:', storErr.message);
    }
  }

  /* ── DB row delete ── */
  var {error:dbErr} = await _sb.from('products').delete().eq('id', String(id));
  if(dbErr){ showToast('\u274c Delete failed: '+dbErr.message,'error'); return; }
  showToast('\uD83D\uDDD1 Product deleted.','success');
  await loadInitialData();
  if(isAdmin) renderAdmLists();
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
async function saveSvc(){
  var name = document.getElementById('sName').value.trim();
  var desc = document.getElementById('sDesc').value.trim();
  var eid  = document.getElementById('editSvcId').value;
  if(!name||!desc){ showToast('\u26a0 Fill in all fields.','warning'); return; }
  if(!_sb){ showToast('\u26a0 Not connected.','error'); return; }
  var imgs = pendingSImgs.filter(Boolean);
  showToast('\u23f3 Saving service...','info');
  var row = {name:name, description:desc, icon:'\u2728', images:imgs};
  var dbErr;
  if(eid){
    var existingSvc = services.find(function(s){ return String(s.id)===String(eid); });
    row.images = imgs.length ? imgs : (existingSvc ? existingSvc.imgs||[] : []);
    if(existingSvc) row.icon = existingSvc.icon||'\u2728';
    var {error:ue} = await _sb.from('services').update(row).eq('id', eid);
    dbErr = ue;
    if(!ue) showToast('\u2705 Service updated!','success');
  } else {
    row.id = 's'+Date.now();
    var {error:ie} = await _sb.from('services').insert(row);
    dbErr = ie;
    if(!ie) showToast('\u2705 Service added!','success');
  }
  if(dbErr){ showToast('\u274c DB error: '+dbErr.message,'error'); return; }
  pendingSImgs = [null,null,null,null];
  closeModal('svcFormOverlay');
  await loadInitialData();
  if(isAdmin) renderAdmLists();
}
async function deleteSvc(){
  var eid = document.getElementById('editSvcId').value;
  if(!eid||!confirm('Delete this service?')) return;
  if(!_sb){ showToast('\u26a0 Not connected.','error'); return; }
  var {error} = await _sb.from('services').delete().eq('id', eid);
  if(error){ showToast('\u274c Delete failed: '+error.message,'error'); return; }
  closeModal('svcFormOverlay');
  showToast('\uD83D\uDDD1 Service deleted.','success');
  await loadInitialData();
  if(isAdmin) renderAdmLists();
}
async function deleteSvcInline(id){
  if(!confirm('Delete this service?')) return;
  if(!_sb){ showToast('\u26a0 Not connected.','error'); return; }
  var {error} = await _sb.from('services').delete().eq('id', String(id));
  if(error){ showToast('\u274c Delete failed: '+error.message,'error'); return; }
  showToast('\uD83D\uDDD1 Service deleted.','success');
  await loadInitialData();
  if(isAdmin) renderAdmLists();
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
async function saveReview(){
  var name  = document.getElementById('revName').value.trim();
  var loc   = document.getElementById('revLoc').value.trim();
  var title = document.getElementById('revTitle').value.trim();
  var txt   = document.getElementById('revText').value.trim();
  var eid   = document.getElementById('editReviewId').value;
  if(!name||!txt){ showToast('\u26a0 Name and review are required.','warning'); return; }
  if(!_sb){ showToast('\u26a0 Not connected.','error'); return; }
  showToast('\u23f3 Saving review...','info');
  var now = new Date();
  var dateStr = now.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});
  var row = {
    name: name, location: loc||'Accra, Ghana',
    avatar: '\uD83D\uDC69\uD83C\uDFFE',
    stars: currentRevStars,
    title: title||'Great experience!',
    review_text: txt, review_date: dateStr
  };
  var dbErr;
  if(eid){
    var existingRev = testimonials.find(function(t){ return String(t.id)===String(eid); });
    if(existingRev) row.avatar = existingRev.av||'\uD83D\uDC69\uD83C\uDFFE';
    var {error:ue} = await _sb.from('testimonials').update(row).eq('id', eid);
    dbErr = ue;
    if(!ue) showToast('\u2705 Review updated!','success');
  } else {
    row.id = 't'+Date.now();
    var {error:ie} = await _sb.from('testimonials').insert(row);
    dbErr = ie;
    if(!ie) showToast('\u2705 Review added!','success');
  }
  if(dbErr){ showToast('\u274c DB error: '+dbErr.message,'error'); return; }
  closeModal('reviewFormOverlay');
  await loadInitialData();
  if(isAdmin) renderAdmLists();
}
async function deleteReview(id){
  var eid = id||document.getElementById('editReviewId').value;
  if(!eid||!confirm('Delete this review?')) return;
  if(!_sb){ showToast('\u26a0 Not connected.','error'); return; }
  var {error} = await _sb.from('testimonials').delete().eq('id', eid);
  if(error){ showToast('\u274c Delete failed: '+error.message,'error'); return; }
  closeModal('reviewFormOverlay');
  showToast('\uD83D\uDDD1 Review deleted.','success');
  await loadInitialData();
  if(isAdmin) renderAdmLists();
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
  if(!isAdmin){console.warn('[RicsGlam] deleteFromSupa blocked - not admin');return;}
  if(!_sb)return;
  try{
    var {error}=await _sb.from(table).delete().eq('id',String(id));
    if(error)console.warn('[RicsGlam] Delete error on '+table+':',error.message);
  }catch(e){console.warn('[RicsGlam] Delete exception:',e);}
}

function saveAllChanges(){
  /* Individual product/service/review saves now go directly to Supabase.
     saveAllChanges only syncs categories (photos) and site settings
     (hero flyer, social links) which don't have their own save buttons. */
  if(_sb){ syncToSupa(); }
  else{ initSupa(function(){ syncToSupa(); }); }
}