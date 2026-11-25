const SB_PAGE_SIZE=24;
let sbMobileVisible=SB_PAGE_SIZE;
let sbDesktopVisible=SB_PAGE_SIZE;

function filterSBCat(cat){sbCatF=cat;sbMobileVisible=SB_PAGE_SIZE;sbDesktopVisible=SB_PAGE_SIZE;initSB();}

function initSB(){
  updateSmallBoxCountry(localStorage.getItem('country')||'IN',false);
  const mobileGrid=document.getElementById('sb-mobile-grid');
  renderBoxCategoryBar('sb-mobile-cat-bar',sbCatF,'filterSBCat','sb-mobile-product-count');
  renderBoxCategoryBar('sb-desktop-cat-bar',sbCatF,'filterSBCat','sb-mobile-product-count');
  var mobileProducts=getFilteredBoxProducts(sbCatF);
  if(sbSearchQuery){var q=sbSearchQuery.toLowerCase();mobileProducts=mobileProducts.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.tags||'').toLowerCase().includes(q));}
  var mobileTotal=mobileProducts.length;
  var mobileVisible=mobileProducts.slice(0,sbMobileVisible);
  if(mobileGrid)mobileGrid.innerHTML=mobileVisible.map(p=>{
    const qty=sbSel.filter(id=>id===p.id).length;
    return `<article class="bb-item sb-item sb-product-card ${qty?'sel':''}" data-name="${esc(p.name.toLowerCase())}" data-id="${p.id}" data-category="${esc(p.cat||'')}">
      ${sbBadgeHtml(p)}
      ${sbImageHtml(p)}
      <div class="bb-item-info">
        <h2 class="bb-item-name sb-n">${esc(p.name)}</h2>
        <p class="bb-item-meta sb-p">${fmtDual(p.price,p.inrPrice)} <span>\u00B7 ${esc(boxDisplayUnit(p.unit))}</span></p>
      </div>
      <button type="button" class="sb-add-btn" onclick="changeSBQuantity(${p.id},1)" aria-label="Add ${esc(p.name)} to cart"><i class="fas fa-shopping-basket" aria-hidden="true"></i> Add</button>
      <div class="sb-quantity" aria-label="${esc(p.name)} quantity">
        <button type="button" onclick="changeSBQuantity(${p.id},-1)" aria-label="Remove one ${esc(p.name)}"><i class="fas fa-minus"></i></button>
        <output>${qty}</output>
        <button type="button" onclick="changeSBQuantity(${p.id},1)" aria-label="Add one ${esc(p.name)}"><i class="fas fa-plus"></i></button>
      </div>
    </article>`;
  }).join('');
  updateSBLoadMore('sb-mobile',mobileTotal,sbMobileVisible);
  const desktopGrid=document.getElementById('sb-grid');
  var desktopProducts=getFilteredBoxProducts(sbCatF);
  if(sbSearchQuery){var q=sbSearchQuery.toLowerCase();desktopProducts=desktopProducts.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.tags||'').toLowerCase().includes(q));}
  var desktopTotal=desktopProducts.length;
  var desktopVisible=desktopProducts.slice(0,sbDesktopVisible);
  if(desktopGrid)desktopGrid.innerHTML=desktopVisible.map(p=>{
    const qty=sbSel.filter(id=>id===p.id).length;
    return `<div class="sb-item sb-product-card bb-mobile-product-card ${qty?'sel':''}" onclick="addSBOnce(${p.id})" style="cursor:pointer" data-id="${p.id}" data-category="${esc(p.cat||'')}">
      ${sbImageHtml(p)}
      <div class="bb-item-info"><div class="sb-n">${esc(p.name)}</div><div class="sb-p">${p.old?`<span class="sb-old-price">${fmtDual(p.old,p.inrOldPrice)}</span>`:''}${fmtDual(p.price,p.inrPrice)} <span>${esc(boxDisplayUnit(p.unit))}</span></div></div>
      <button type="button" class="sb-add-btn" onclick="event.stopPropagation();changeSBQuantity(${p.id},1)" aria-label="Add ${esc(p.name)}"><i class="fas fa-shopping-basket" aria-hidden="true"></i> Add</button>
      <div class="bb-qty-row"><button class="bb-qbtn" onclick="event.stopPropagation();changeSBQuantity(${p.id},-1)"><i class="fas fa-minus"></i></button><span class="bb-qval">${qty} <span style="font-size:14px;color:var(--text-m)">pc</span></span><button class="bb-qbtn" onclick="event.stopPropagation();changeSBQuantity(${p.id},1)"><i class="fas fa-plus"></i></button></div>
    </div>`;
  }).join('');
  updateSBLoadMore('sb-desktop',desktopTotal,sbDesktopVisible);
  updateSB();
  if(typeof Swiper!=='undefined'){
    var sbHeroEl=document.querySelector('#page-small-box .sb-hero-banner-swiper');
    if(sbHeroEl&&sbHeroEl.swiper)sbHeroEl.swiper.destroy(true,true);
    if(sbHeroEl)new Swiper(sbHeroEl,{loop:true,autoplay:{delay:3000,disableOnInteraction:false},effect:'slide',speed:500});
  }
}
function toggleSB(id){changeSBQuantity(id,sbSel.includes(id)?-1:1)}
function addSBOnce(id){if(!sbSel.includes(id))changeSBQuantity(id,1)}
function changeSBQuantity(id,change){
  const i=sbSel.indexOf(id);
  if(change<0&&i>=0)sbSel.splice(i,1);
  if(change>0)sbSel.push(id);
  initSB();
}
function getSmallBoxPricing(){
  const lines=new Map();
  let standard=0,premium=0,inrStd=0,inrPrem=0;
  sbSel.forEach((id,index)=>{
    const product=getBoxProduct(id);if(!product)return;
    const isPremium=index>=10;
    const line=lines.get(id)||{product,qty:0,total:0};
    const itemPrice=isPremium?product.price*1.15:product.price;
    const inrItem=isPremium?getEff(product)*1.15:getEff(product);
    line.qty++;line.total+=itemPrice;lines.set(id,line);
    if(isPremium){premium+=itemPrice;inrPrem+=inrItem}else{standard+=itemPrice;inrStd+=inrItem}
  });
  return {standard,premium,total:standard+premium,inrStandard:inrStd,inrPremium:inrPrem,inrTotal:inrStd+inrPrem,lines:[...lines.values()]};
}
function renderSBSumList(){
  const sumList=document.getElementById('sb-sumlist');
  if(!sumList)return;
  if(!sbSel.length){
    sumList.innerHTML='<p style="color:rgba(255,255,255,.26);font-size:12px;text-align:center;padding:8px 0">No products added yet</p>';
    return;
  }
  const c=getPriceCountry();
  const fmtIt=v=>c==='IN'?('\u20B9'+Math.round(v).toLocaleString('en-IN')):fmtDual(v);
  const merged=new Map();
  sbSel.forEach((id,i)=>{
    const p=getBoxProduct(id);if(!p)return;
    const linePrice=i<10?getEff(p):getEff(p)*1.15;
    let line=merged.get(id);
    if(!line){line={p,qty:0,total:0,premium:false};merged.set(id,line);}
    line.qty++;line.total+=linePrice;if(i>=10)line.premium=true;
  });
  sumList.innerHTML=[...merged.values()].map(line=>{
    return '<div class="ord-item"><span class="ord-item-emoji">'+line.p.emoji+'</span><span class="ord-item-name">'+esc(line.p.name)+'</span><span class="ord-item-qty">x'+line.qty+'</span>'+(line.premium?'<span class="ord-item-tag">+15%</span>':'')+'<span class="ord-item-price">'+fmtIt(line.total)+'</span></div>';
  }).join('');
}
function updateSBLegacy(){
  const c=getPriceCountry();
  const n=sbSel.length,pct=Math.min(100,(n/10)*100);
  document.getElementById('sb-cnt').textContent=n+' / 10+';
  document.getElementById('sb-pbar').style.width=pct+'%';
  let total=0,inrTotal=0;sbSel.forEach((id,i)=>{const p=getBoxProduct(id);if(p){const ep=getEff(p);total+=i<10?p.price:p.price*1.15;inrTotal+=i<10?ep:ep*1.15}});
  document.getElementById('sb-total').textContent=c==='IN'?('\u20B9'+Math.round(inrTotal).toLocaleString('en-IN')):fmtDual(total);
  const btn=document.getElementById('sb-btn'),note=document.getElementById('sb-note');
  let noteText,noteColor;
  if(n<10){noteText='Select '+(10-n)+' more';noteColor='var(--gold)';note.style.color=noteColor;note.textContent=noteText+' to continue';btn.disabled=true;btn.style.opacity='.45';btn.style.cursor='not-allowed';document.getElementById('sb-pnote').textContent='Standard pricing'}
  else{noteText='✅ Minimum reached!'+(n>10?' +15% on item '+(n>10?n-10+'+':''):'');noteColor='var(--green)';note.style.color=noteColor;note.textContent='✅ Minimum reached!'+(n>10?' Items '+(n-10)+' at +15%':'');btn.disabled=false;btn.style.opacity='1';btn.style.cursor='pointer';document.getElementById('sb-pnote').textContent=n>10?'Items 1–10 standard · Items 11+ at +15%':'Standard pricing applies'}
  /* sync sticky counter */
  const sc=document.getElementById('sb-sticky-cnt'),sb=document.getElementById('sb-sticky-bar'),sn=document.getElementById('sb-sticky-note');
  if(sc)sc.textContent=n+' / 10+';
  if(sb)sb.style.width=pct+'%';
  if(sn){sn.textContent=n<10?'Select '+(10-n)+' more':'✅ Ready to add!';sn.style.color=n<10?'var(--gold)':'var(--green)';}
  /* sync Order Summary panel */
  const met=n>=10;
  const sumCnt=document.getElementById('sb-sum-cnt');if(sumCnt)sumCnt.innerHTML=n+' <span style="font-size:13px;color:rgba(255,255,255,.34)">/ 10 minimum</span>';
  const sumBar=document.getElementById('sb-ord-bar');if(sumBar){sumBar.style.width=pct+'%';sumBar.style.background=n===0?'rgba(255,255,255,.18)':met?'#8dc63f':'var(--gold)';}
  const sumMsg=document.getElementById('sb-sum-msg');if(sumMsg){sumMsg.textContent=met?'✅ Minimum reached! '+(n>10?(n-10)+' item(s) at +15%':'Exactly 10 items'):'\uD83D\uDCE5 Need '+(10-n)+' more item(s) to proceed';sumMsg.style.color=met?'#8dc63f':'var(--gold)';}
  const sumIc=document.getElementById('sb-sum-icount');if(sumIc)sumIc.textContent=n;
  let stdSub=0,premSub=0,inrStdSub=0,inrPremSub=0;
  sbSel.forEach((id,i)=>{const p=getBoxProduct(id);if(p){const ep=getEff(p);if(i<10){stdSub+=p.price;inrStdSub+=ep}else{premSub+=p.price*1.15;inrPremSub+=ep*1.15}}});
  const fmtIt=v=>c==='IN'?('\u20B9'+Math.round(v).toLocaleString('en-IN')):fmtDual(v);
  const sumList=document.getElementById('sb-sumlist');
  if(sumList)renderSBSumList();
  const sumSubEl=document.getElementById('sb-sum-sub');if(sumSubEl)sumSubEl.textContent=fmtIt(inrStdSub);
  const sumPrem=document.getElementById('sb-sum-premium');if(sumPrem){if(n>10){sumPrem.textContent='+'+fmtIt(inrPremSub);sumPrem.style.color='var(--gold)';}else{sumPrem.textContent='Unlocks after 10 items';sumPrem.style.color='rgba(255,255,255,.3)';}}
  const sumTot=document.getElementById('sb-sum-tot');if(sumTot)sumTot.textContent=fmtIt(inrStdSub+inrPremSub);
  const sumBtn2=document.getElementById('sb-sum-btn');if(sumBtn2){sumBtn2.disabled=!met;sumBtn2.style.opacity=met?'1':'.45';sumBtn2.style.cursor=met?'pointer':'not-allowed';}
  const sumHint=document.getElementById('sb-sum-hint');if(sumHint){sumHint.textContent=met?'Ready: '+n+' items - '+fmtDual(stdSub+premSub):'Select at least 10 items to unlock';sumHint.style.color=met?'rgba(141,198,63,.8)':'rgba(255,255,255,.3)';}
  /* update selected-items-float - only show on Small Box page when products are selected */
  const selFloat=document.getElementById('selected-items-float');
  const selCount=document.getElementById('selected-items-count');
  const pageSmallBox=document.getElementById('page-small-box');
  if(selFloat&&selCount&&pageSmallBox&&pageSmallBox.classList.contains('active')){
    selCount.textContent=n;
    selFloat.style.display=n>0?'flex':'none';
  }else if(selFloat){
    selFloat.style.display='none';
  }
  /* update mobile selected items bar */
  const mobileSelectedBar=document.getElementById('mobile-selected-bar');
  const mobileSelectedCount=document.getElementById('mobile-selected-count');
  const mobileSelectedLabel=document.getElementById('mobile-selected-label');
  const mobileSelectedBtn=document.getElementById('mobile-selected-btn');
  if(mobileSelectedBar&&mobileSelectedCount){
    mobileSelectedLabel.textContent=n+' selected';
    if(n>=10){
      mobileSelectedCount.textContent='Go to Cart \u2192';
      mobileSelectedCount.style.color='#8dc63f';
      mobileSelectedCount.style.fontWeight='700';
      mobileSelectedBtn.onclick=function(){window.location.href='shop-cart.html'};
    }else{
      mobileSelectedCount.textContent='Add '+(10-n)+' more to reach 10';
      mobileSelectedCount.style.color='';
      mobileSelectedCount.style.fontWeight='';
      mobileSelectedBtn.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})};
    }
    if(n>0){
      mobileSelectedBar.classList.add('show');
    }else{
      mobileSelectedBar.classList.remove('show');
    }
  }
  /* update bottom-action-bar */
  const bottomBar=document.getElementById('bottom-action-bar');
  const bottomBarCount=document.getElementById('bottom-bar-count');
  if(bottomBar&&bottomBarCount){
    bottomBarCount.textContent=n+' selected';
    bottomBar.style.display=n>0?'flex':'none';
  }
  /* update mobile cart badge */
  const mobileCartBadge=document.getElementById('mobile-cart-badge');
  if(mobileCartBadge){
    const cartCount=cart.reduce((s,x)=>s+x.qty,0);
    mobileCartBadge.textContent=cartCount;
    mobileCartBadge.style.display=cartCount>0?'flex':'none';
  }
}

function updateSB(){
  const c=getPriceCountry();
  const n=sbSel.length;
  const pricing=getSmallBoxPricing();
  const met=n>=10;
  const pct=Math.min(100,(n/10)*100);
  const remaining=Math.max(0,10-n);
  const premiumItems=Math.max(0,n-10);
  const fmtIt=v=>c==='IN'?('\u20B9'+Math.round(v).toLocaleString('en-IN')):fmtDual(v);
  const totDisplay=c==='IN'?pricing.inrTotal:pricing.total;
  const stdDisplay=c==='IN'?pricing.inrStandard:pricing.standard;
  const premDisplay=c==='IN'?pricing.inrPremium:pricing.premium;

  // Keep the previous desktop controls in sync when that layout is displayed.
  const legacyCount=document.getElementById('sb-cnt');
  if(legacyCount)legacyCount.textContent=n+' / 10+';
  const legacyProgress=document.getElementById('sb-pbar');
  if(legacyProgress)legacyProgress.style.width=pct+'%';
  const legacyTotal=document.getElementById('sb-total');
  if(legacyTotal)legacyTotal.textContent=fmtIt(totDisplay);
  const legacyNote=document.getElementById('sb-note');
  if(legacyNote){legacyNote.textContent=met?'✅ Minimum reached!':'Select '+remaining+' more to continue';legacyNote.style.color=met?'var(--green)':'var(--gold)';}
  const legacyPricingNote=document.getElementById('sb-pnote');
  if(legacyPricingNote)legacyPricingNote.textContent=premiumItems?'Items 1–10 standard · Items 11+ at +15%':'Standard pricing applies';
  const legacyButton=document.getElementById('sb-btn');
  if(legacyButton){legacyButton.disabled=!met;legacyButton.style.opacity=met?'1':'.45';legacyButton.style.cursor=met?'pointer':'not-allowed';}

  const summaryCount=document.getElementById('sb-sum-cnt');
  if(summaryCount)summaryCount.innerHTML=n+' <span style="font-size:13px;color:rgba(255,255,255,.34)">/ 10 minimum</span>';
  const summaryProgress=document.getElementById('sb-ord-bar');
  if(summaryProgress){summaryProgress.style.width=pct+'%';summaryProgress.style.background=n===0?'rgba(255,255,255,.18)':met?'#8dc63f':'var(--gold)';}
  const summaryMessage=document.getElementById('sb-sum-msg');
  if(summaryMessage){summaryMessage.textContent=met?'Minimum reached! '+(premiumItems?premiumItems+' item(s) at +15%':'Exactly 10 items'):'\uD83D\uDCE5 Need '+remaining+' more item(s) to proceed';summaryMessage.style.color=met?'#8dc63f':'var(--gold)';}
  const summaryProductCount=document.getElementById('sb-sum-icount');
  if(summaryProductCount)summaryProductCount.textContent=n;
  const summaryList=document.getElementById('sb-sumlist');
  if(summaryList)renderSBSumList();
  const summarySubtotal=document.getElementById('sb-sum-sub');
  if(summarySubtotal)summarySubtotal.textContent=fmtIt(stdDisplay);
  const summaryPremium=document.getElementById('sb-sum-premium');
  if(summaryPremium){summaryPremium.textContent=premiumItems?'+'+fmtIt(premDisplay):'Unlocks after 10 items';summaryPremium.style.color=premiumItems?'var(--gold)':'rgba(255,255,255,.3)';}
  const summaryTotal=document.getElementById('sb-sum-tot');
  if(summaryTotal)summaryTotal.textContent=fmtIt(totDisplay);
  const summaryButton=document.getElementById('sb-sum-btn');
  if(summaryButton){summaryButton.disabled=!met;summaryButton.style.opacity=met?'1':'.45';summaryButton.style.cursor=met?'pointer':'not-allowed';}
  const summaryHint=document.getElementById('sb-sum-hint');
  if(summaryHint){summaryHint.textContent=met?'Ready: '+n+' items - '+fmtIt(totDisplay):'Select at least 10 items to unlock';summaryHint.style.color=met?'rgba(141,198,63,.8)':'rgba(255,255,255,.3)';}

  const page=document.querySelector('#page-small-box .sb-mobile-page');
  if(page)page.classList.toggle('has-selection',n>0);
  const selectionBar=document.getElementById('sb-mobile-selection-bar');
  if(selectionBar)selectionBar.classList.toggle('is-visible',n>0);
  const selectionCount=document.getElementById('sb-mobile-selected-count');
  if(selectionCount)selectionCount.textContent=n+' Item'+(n===1?'':'s')+' Selected';
  const selectionNote=document.getElementById('sb-mobile-selection-note');
  if(selectionNote)selectionNote.textContent=met?'Ready to checkout \u{1F33F}':'Add '+remaining+' more to unlock';
  const selectionTotal=document.getElementById('sb-mobile-selection-total');
  if(selectionTotal)selectionTotal.textContent=fmtIt(totDisplay);
  const selectionBadge=document.getElementById('sb-selection-badge');
  if(selectionBadge)selectionBadge.textContent=n;
  const selectionButton=document.getElementById('sb-mobile-btn');
  if(selectionButton){selectionButton.disabled=!met;selectionButton.classList.toggle('is-ready',met);selectionButton.setAttribute('aria-disabled',String(!met));selectionButton.setAttribute('aria-label',met?'Add Small Box to Cart':'Add at least 10 items to cart');const btnSpan=selectionButton.querySelector('span');if(btnSpan)btnSpan.textContent=met?'Proceed':'Add to Cart';}
}

/* Show sticky counter when builder-head scrolls out of view */
(function(){
  function sbScrollCheck(){
    const page=document.getElementById('page-small-box');
    const head=document.getElementById('sb-head');
    const sticky=document.getElementById('sb-sticky');
    if(!sticky)return;
    if(page&&!page.classList.contains('active')){sticky.classList.remove('show');return;}
    if(head){
      const r=head.getBoundingClientRect();
      sticky.classList.toggle('show',r.bottom<0);
    }
  }
  window.addEventListener('scroll',sbScrollCheck,{passive:true});
})();
function addSmallBox(){
  var DELIVERY_COUNTRIES = ['IN', 'SG', 'US', 'AE'];
  var country = (localStorage.getItem('vpnexues_detected_country') || localStorage.getItem('country') || 'IN').toUpperCase();
  if (DELIVERY_COUNTRIES.indexOf(country) === -1) {
    if (typeof showDeliveryComingSoonToast === 'function') { showDeliveryComingSoonToast(); } else { showToast('Currently no delivery in your region. Delivery coming soon!'); }
    return;
  }
  if(sbSel.length<10){showToast('Select at least 10 items before adding your box.');return}
  const pricing=getSmallBoxPricing();
  const c=getPriceCountry();
  var item={id:Date.now(),name:'Small Box ('+sbSel.length+' items)',emoji:'🎁',cat:'Box',unit:'Box · custom box',price:pricing.total,qty:1,img:null,image:null};
  if(c==='IN'){item.inrPrice=pricing.inrTotal}
  var localCart;try{localCart=JSON.parse(localStorage.getItem("cart")||"[]")}catch(e){localCart=[]}
  localCart.push(item);
  localStorage.setItem("cart",JSON.stringify(localCart));
  cart=localCart;
  sbSel=[];initSB();updateDot();
  showToast('\uD83D\uDCE6 Small Box added to cart!');
  window.location.href='shop-cart.html';
}

function sbImageHtml(product){
  if(product.img){
    var sources = '';
    if(product.mobileImg) sources += '<source media="(max-width: 767px)" srcset="' + product.mobileImg + '">';
    if(product.desktopImg) sources += '<source media="(min-width: 768px)" srcset="' + product.desktopImg + '">';
    if(sources){
      return '<div class="bb-item-img box-icon-only"><picture>' + sources + '<img src="' + product.img + '" alt="' + product.name + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:14px;"></picture><span class="box-product-icon" style="display:none" aria-hidden="true">' + product.emoji + '</span></div>';
    }
    return '<div class="bb-item-img box-icon-only"><img src="' + product.img + '" alt="' + product.name + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:14px;"><span class="box-product-icon" style="display:none" aria-hidden="true">' + product.emoji + '</span></div>';
  }
  return '<div class="bb-item-img box-icon-only"><span class="box-product-icon" aria-hidden="true">' + product.emoji + '</span></div>';
}

function updateSBLoadMore(prefix,total,visible){
  var status=document.getElementById(prefix+'-results-status');
  var btn=document.getElementById(prefix+'-load-more');
  if(status)status.textContent='Showing '+Math.min(visible,total)+' of '+total+' products';
  if(btn)btn.hidden=visible>=total;
}

document.addEventListener('DOMContentLoaded',function(){
  var sbMobileBtn=document.getElementById('sb-mobile-load-more');
  if(sbMobileBtn)sbMobileBtn.addEventListener('click',function(){sbMobileVisible+=SB_PAGE_SIZE;initSB();});
  var sbDesktopBtn=document.getElementById('sb-desktop-load-more');
  if(sbDesktopBtn)sbDesktopBtn.addEventListener('click',function(){sbDesktopVisible+=SB_PAGE_SIZE;initSB();});
});
