const BB_EMOJI_MAP={
1:'\u{1F955}',2:'\u{1F345}',3:'\u{1F96C}',4:'\u{1F33D}',5:'\u{1F9C5}',
6:'\u{1FAD1}',7:'\u{1F966}',8:'\u{1F952}',9:'\u{1F952}',10:'\u{1F345}',
11:'\u{1F96C}',12:'\u{1F96C}',13:'\u{1F966}',14:'\u{1F955}',15:'\u{1F96A}',
16:'\u{1FAD8}',17:'\u{1F96C}',18:'\u{1F96C}',19:'\u{1F96C}',20:'\u{1F383}',
21:'\u{1F346}',22:'\u{1F966}',23:'\u{1F96C}',24:'\u{1F951}',25:'\u{1F9C4}',
26:'\u{1F33F}',27:'\u{1F33F}',28:'\u{1F952}',29:'\u{1FAD8}',30:'\u{1FAD8}',
31:'\u{1F33F}',32:'\u{1F952}',33:'\u{1F954}',34:'\u{1F95C}',35:'\u{1F33F}',
36:'\u{1F336}\uFE0F',37:'\u{1FAD1}',38:'\u{1F96C}',39:'\u{1F96A}',40:'\u{1F952}',
41:'\u{1F96C}',42:'\u{1F96C}',43:'\u{1F955}',44:'\u{1F95C}',45:'\u{1F952}',
46:'\u{1FAD8}',47:'\u{1F952}',48:'\u{1F96C}',49:'\u{1F952}',50:'\u{1F338}',
51:'\u{1F96D}',52:'\u{1F34C}',53:'\u{1F352}',54:'\u{1F34F}',55:'\u{1F34A}',
56:'\u{1F34E}',57:'\u{1F34D}',58:'\u{1F349}',59:'\u{1F347}',60:'\u{1F353}',
61:'\u{1F34A}',62:'\u{1F34B}',63:'\u{1F95D}',64:'\u{1F951}',65:'\u{1FAD0}',
66:'\u{1F351}',67:'\u{1F350}',68:'\u{1F351}',69:'\u{1F34D}',70:'\u{1F351}',
71:'\u{1F351}',72:'\u{1F34F}',73:'\u{1F34E}',74:'\u{1F350}',75:'\u{1F366}',
76:'\u{1FAD0}',77:'\u{1F351}',78:'\u{1F352}',79:'\u{1F34C}',80:'\u{1F965}',
81:'\u{1F34D}',82:'\u{1F351}',83:'\u{1F353}',84:'\u{1F34A}',85:'\u{1F36B}',
86:'\u{1F34A}',87:'\u{1F348}',88:'\u{1F351}',89:'\u{1F351}',90:'\u{1F338}',
91:'\u{1F9C3}',92:'\u{1F965}',93:'\u{2615}',94:'\u{1F375}',95:'\u{1F9C3}',
96:'\u{1F95B}',97:'\u{1F95B}',98:'\u{1F9C3}',99:'\u{1F9C3}',100:'\u{1F965}',
101:'\u{1F9C3}',102:'\u{1F375}',103:'\u{1F9C3}',104:'\u{1F9C3}',105:'\u{1F375}',
106:'\u{1F9C3}',107:'\u{1F4A7}',108:'\u{1F9C3}',109:'\u{1F9C3}',110:'\u{1F9C3}',
111:'\u{1F35A}',112:'\u{1F965}',113:'\u{1F9C4}',114:'\u{1F95A}',115:'\u{1FAD2}',
116:'\u{1FAD8}',117:'\u{1F95B}',118:'\u{1F95B}',119:'\u{1F354}',120:'\u{1F35B}',
121:'\u{1F352}',122:'\u{1F352}',123:'\u{1F352}',124:'\u{1F36F}',125:'\u{1F36F}',
126:'\u{1FAD8}',127:'\u{1F352}',128:'\u{1FAD2}',129:'\u{1F965}',130:'\u{1F36F}',
131:'\u{1F36F}',132:'\u{1F9C5}',133:'\u{1F96A}',134:'\u{1F35A}',135:'\u{1FAD8}',
136:'\u{1F963}',137:'\u{1F95C}',138:'\u{1F95C}',139:'\u{1F95C}',140:'\u{1FAD0}',
141:'\u{1FAD0}',142:'\u{1FAD0}',143:'\u{1FAD0}',144:'\u{1F336}\uFE0F',
145:'\u{1F36F}',146:'\u{1F96B}',147:'\u{1F36B}',148:'\u{1F95B}',149:'\u{1F35A}',
150:'\u{1FAD8}',151:'\u{1F336}\uFE0F',152:'\u{1F33F}',153:'\u{1F9C4}',
154:'\u{1F965}',155:'\u{1F965}',156:'\u{1F353}',157:'\u{1F347}',158:'\u{1F352}',
159:'\u{1F349}',160:'\u{1F34A}',161:'\u{1F9C3}',162:'\u{1F9C3}',163:'\u{1F95B}',
164:'\u{1F95B}',165:'\u{1F352}',166:'\u{1F965}',167:'\u{1F965}',168:'\u{1F95B}',
169:'\u{1F9C3}',170:'\u{1F350}',171:'\u{1F353}',172:'\u{1F349}',173:'\u{1F34D}',
174:'\u{1F352}',175:'\u{1F34F}',176:'\u{1F965}',177:'\u{1FAD8}',178:'\u{1F965}',
179:'\u{1F96C}',180:'\u{1F9C5}',181:'\u{1F9C5}',182:'\u{1F95B}',183:'\u{1F95B}',
184:'\u{1F95B}',185:'\u{2615}',186:'\u{1F34A}',187:'\u{2615}',188:'\u{1F375}',
189:'\u{1F95B}'
};
function bbEmojiHtml(p){
  var e=BB_EMOJI_MAP[p.id]||'\u{1F6D2}';
  return '<div class="bb-item-emoji-wrap"><span class="bb-item-emoji">'+e+'</span></div>';
}
const BB_PAGE_SIZE=24;
let bbMobileVisible=BB_PAGE_SIZE;
let bbDesktopVisible=BB_PAGE_SIZE;

function filterBBCat(cat,el){
  bbCatF=cat;
  bbMobileVisible=BB_PAGE_SIZE;
  bbDesktopVisible=BB_PAGE_SIZE;
  document.querySelectorAll('#bb-cat-bar .bb-cat-pill, #bb-desktop-cat-bar .bb-cat-pill').forEach(t=>t.classList.toggle('active',t.textContent.includes(cat)||cat==='All'&&t.textContent.trim()==='All'));
  if(el){document.querySelectorAll('#bb-cat-bar .bb-cat-pill, #bb-desktop-cat-bar .bb-cat-pill').forEach(t=>t.classList.remove('active'));el.classList.add('active');}
  initBB();
}
function initBBOld(){
  const list=bbCatF==='All'?PRODS:PRODS.filter(p=>p.cat===bbCatF);
  const desktopGrid=document.getElementById('bb-grid');
  if(desktopGrid)desktopGrid.innerHTML=list.map(p=>{
    const qty=bbSel[p.id]||0;
    return `<div class="bb-item bb-mobile-product-card ${qty?'sel':''}" data-category="${esc(p.cat||'')}" data-id="${p.id}" onclick="addBBOnce(${p.id})" style="cursor:pointer">
      ${boxBadgeHtml(p)}
      ${boxImageHtml(p)}
      <div class="bb-item-info"><div class="sb-n">${esc(p.name)}</div><div class="sb-p">${p.old?`<span class="sb-old-price">${fmtDual(p.old,p.inrOldPrice)}</span>`:''}${fmtDual(p.price,p.inrPrice)} <span>${esc(boxDisplayUnit(p.unit))}</span></div></div>
      <div class="bb-qty-row"><button class="bb-qbtn" onclick="event.stopPropagation();bbQ(${p.id},-.5)">\u2212</button><span class="bb-qval">${(bbSel[p.id]||0).toFixed(1)} <span style="font-size:14px;color:var(--text-m)">kg</span></span><button class="bb-qbtn" onclick="event.stopPropagation();bbQ(${p.id},.5)">+</button></div>
    </div>`;
  }).join('');
  const mobileGrid=document.getElementById('bb-mobile-grid');
  if(mobileGrid)mobileGrid.innerHTML=list.map(p=>{
    const qty=bbSel[p.id]||0,localIcon=getLocalProductIcon(p);
    return `<article class="bb-mobile-product-card ${qty?'sel':''}" data-category="${esc(p.cat||'')}" data-id="${p.id}">
      <div class="bb-mobile-image-wrap">${localIcon?`<img src="${localIcon}" alt="${esc(p.name)}" loading="lazy">`:`<span aria-hidden="true">${p.emoji}</span>`}</div>
      <h2>${esc(p.name)}</h2><p>${fmtDual(p.price,p.inrPrice)}</p>
      <div class="bb-mobile-quantity" aria-label="${esc(p.name)} quantity in kilograms"><button type="button" onclick="bbQ(${p.id},-.5)" aria-label="Remove 0.5 kg of ${esc(p.name)}"><i class="fas fa-minus"></i></button><output>${qty.toFixed(1)}<small>kg</small></output><button type="button" onclick="bbQ(${p.id},.5)" aria-label="Add 0.5 kg of ${esc(p.name)}"><i class="fas fa-plus"></i></button></div>
    </article>`;
  }).join('');
  updateBB();
}
function initBB(){
  updateSmallBoxCountry(localStorage.getItem('country')||'IN',false);
  var allProducts=getFilteredBoxProducts(bbCatF);
  if(bbSearchQuery){var q=bbSearchQuery.toLowerCase();allProducts=allProducts.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.tags||'').toLowerCase().includes(q));}
  var desktopTotal=allProducts.length;
  var desktopVisible=allProducts.slice(0,bbDesktopVisible);
  const desktopGrid=document.getElementById('bb-grid');
  if(desktopGrid)desktopGrid.innerHTML=desktopVisible.map(p=>{
    const qty=bbSel[p.id]||0;
    return `<div class="bb-item sb-product-card bb-mobile-product-card ${qty?'sel':''}" data-category="${esc(p.cat||'')}" data-id="${p.id}" onclick="addBBOnce(${p.id})" style="cursor:pointer">
      ${boxBadgeHtml(p)}
      ${boxImageHtml(p)}
      <div class="bb-item-info"><div class="sb-n">${esc(p.name)}</div><div class="sb-p">${p.old?`<span class="sb-old-price">${fmtDual(p.old,p.inrOldPrice)}</span>`:''}${fmtDual(p.price,p.inrPrice)} <span>${esc(boxDisplayUnit(p.unit))}</span></div></div>
      <button type="button" class="sb-add-btn" onclick="event.stopPropagation();bbQ(${p.id},.5)" aria-label="Add ${esc(p.name)}"><i class="fas fa-shopping-basket" aria-hidden="true"></i> Add</button>
      <div class="bb-qty-row"><button class="bb-qbtn" onclick="event.stopPropagation();bbQ(${p.id},-.5)"><i class="fas fa-minus"></i></button><span class="bb-qval">${(bbSel[p.id]||0).toFixed(1)} <span style="font-size:14px;color:var(--text-m)">kg</span></span><button class="bb-qbtn" onclick="event.stopPropagation();bbQ(${p.id},.5)"><i class="fas fa-plus"></i></button></div>
    </div>`;
  }).join('');
  updateBBLoadMore('bb-desktop',desktopTotal,bbDesktopVisible);
  renderBoxCategoryBar('bb-mobile-cat-bar',bbCatF,'filterBBCat','bb-mobile-product-count');
  const mobileGrid=document.getElementById('bb-mobile-grid');
  var mobileTotal=allProducts.length;
  var mobileVisible=allProducts.slice(0,bbMobileVisible);
  if(mobileGrid)mobileGrid.innerHTML=mobileVisible.map(p=>{
    const qty=bbSel[p.id]||0;
    return `<article class="bb-item sb-item sb-product-card bb-mobile-product-card ${qty?'sel':''}" data-category="${esc(p.cat||'')}" data-id="${p.id}" data-name="${esc(p.name.toLowerCase())}">
      ${boxBadgeHtml(p)}
      ${boxImageHtml(p)}
      <div class="bb-item-info">
        <h2 class="bb-item-name sb-n">${esc(p.name)}</h2>
        <p class="bb-item-meta sb-p">${fmtDual(p.price,p.inrPrice)} <span>\u00B7 ${esc(boxDisplayUnit(p.unit))}</span></p>
      </div>
      <button type="button" class="sb-add-btn" onclick="bbQ(${p.id},.5)" aria-label="Add ${esc(p.name)} to cart"><i class="fas fa-shopping-basket" aria-hidden="true"></i> Add</button>
      <div class="bb-mobile-quantity" aria-label="${p.name} quantity in kilograms">
        <button type="button" onclick="bbQ(${p.id},-.5)" aria-label="Remove 0.5 kg of ${p.name}"><i class="fas fa-minus"></i></button>
        <output>${qty.toFixed(1)} kg</output>
        <button type="button" onclick="bbQ(${p.id},.5)" aria-label="Add 0.5 kg of ${p.name}"><i class="fas fa-plus"></i></button>
      </div>
    </article>`;
  }).join('');
  updateBBLoadMore('bb-mobile',mobileTotal,bbMobileVisible);
  updateBB();
  if(typeof Swiper!=='undefined'){
    var bbEl=document.querySelector('#page-big-box .sb-hero-banner-swiper');
    if(bbEl&&bbEl.swiper)bbEl.swiper.destroy(true,true);
    if(bbEl)new Swiper(bbEl,{loop:true,autoplay:{delay:3000,disableOnInteraction:false},effect:'slide',speed:500});
  }
}
function bbQ(id,d){bbSel[id]=Math.max(0,parseFloat(((bbSel[id]||0)+d).toFixed(1)));if(!bbSel[id])delete bbSel[id];initBB()}
function addBBOnce(id){if(!bbSel[id])bbQ(id,.5)}

function getBigBoxPricing(){
  const ids=Object.keys(bbSel).map(Number);
  const kg=ids.reduce((total,id)=>total+(bbSel[id]||0),0);
  const subtotal=ids.reduce((total,id)=>{
    const product=getBoxProduct(id);
    return product?total+product.price*(bbSel[id]||0):total;
  },0);
  const inrSubtotal=ids.reduce((total,id)=>{
    const product=getBoxProduct(id);
    return product?total+getEff(product)*(bbSel[id]||0):total;
  },0);
  const discount=kg>=10?subtotal*.12:0;
  const inrDiscount=kg>=10?inrSubtotal*.12:0;
  return {ids,kg,subtotal,discount,total:subtotal-discount,inrSubtotal,inrDiscount,inrTotal:inrSubtotal-inrDiscount};
}

function updateBBLegacy(){
  const c=getPriceCountry();
  const ids=Object.keys(bbSel).map(Number),ic=ids.length;
  const kg=ids.reduce((s,id)=>s+(bbSel[id]||0),0);
  const MIN=10,pct=Math.min(100,(kg/MIN)*100),met=kg>=MIN;
  const barC=kg===0?'rgba(255,255,255,.18)':met?'#8dc63f':'var(--gold)';
  document.getElementById('bb-kg-big').innerHTML=kg.toFixed(1)+'<small> kg</small>';
  document.getElementById('bb-pbar').style.width=pct+'%';document.getElementById('bb-pbar').style.background=barC;
  const lbl=document.getElementById('bb-kg-lbl'),st=document.getElementById('bb-status');
  if(!met){lbl.textContent='Add '+(MIN-kg).toFixed(1)+' kg more to reach the 10 kg minimum';lbl.style.color='rgba(255,255,255,.6)';st.textContent='\u23F3 '+(MIN-kg).toFixed(1)+' kg remaining';st.style.color='var(--gold)';st.style.borderColor='rgba(232,184,75,.4)'}
  else{lbl.textContent='\u2705 Minimum reached! '+(kg-MIN>0?(kg-MIN).toFixed(1)+' kg above minimum':'Exactly 10 kg');lbl.style.color='#8dc63f';st.textContent='\u2705 Ready to Order!';st.style.color='#8dc63f';st.style.borderColor='#8dc63f'}
  document.getElementById('bb-icount').textContent=ic;document.getElementById('bb-icount2').textContent=ic;
  document.getElementById('bb-kg-sum').innerHTML=kg.toFixed(1)+' kg <span style="font-size:13px;color:rgba(255,255,255,.34)">/ 10 kg minimum</span>';
  document.getElementById('bb-ord-bar').style.width=pct+'%';document.getElementById('bb-ord-bar').style.background=barC;
  const msg=document.getElementById('bb-kg-msg');msg.textContent=met?'\u2705 12% bulk discount applied!':'\uD83D\uDCE5 Need '+(MIN-kg).toFixed(1)+' kg more to proceed';msg.style.color=met?'#8dc63f':'var(--gold)';
  let sub=0,inrSub=0;ids.forEach(id=>{const p=getBoxProduct(id);if(p){const ep=getEff(p);sub+=p.price*(bbSel[id]||0);inrSub+=ep*(bbSel[id]||0)}});
  const disc=met?sub*.12:0;const inrDisc=met?inrSub*.12:0;
  const fmtIt=v=>c==='IN'?('\u20B9'+Math.round(v).toLocaleString('en-IN')):fmtDual(v);
  document.getElementById('bb-sub').textContent=fmtIt(inrSub);
  document.getElementById('bb-disc').textContent=met?'-'+fmtIt(inrDisc):'Unlocks at 10 kg';document.getElementById('bb-disc').style.color=met?'var(--gold)':'rgba(255,255,255,.28)';
  document.getElementById('bb-tot').textContent=fmtIt(inrSub-inrDisc);
  document.getElementById('bb-sumlist').innerHTML=ids.length?ids.map(id=>{const p=getBoxProduct(id);if(!p)return'';const linePrice=fmtIt((getEff(p)||p.price)*(bbSel[id]||0));return`<div class="ord-item"><span class="ord-item-emoji">${p.emoji}</span><span class="ord-item-name">${esc(p.name)}</span><span class="ord-item-qty">${(bbSel[id]||0).toFixed(1)} kg</span><span class="ord-item-price">${linePrice}</span></div>`}).join(''):'<p style="color:rgba(255,255,255,.26);font-size:12px;text-align:center;padding:8px 0">No products added yet</p>';
  const btn=document.getElementById('bb-btn'),hint=document.getElementById('bb-hint');
  btn.disabled=!met;btn.style.opacity=met?'1':'.45';btn.style.cursor=met?'pointer':'not-allowed';
  hint.textContent=met?`Ready: ${ic} products - ${kg.toFixed(1)} kg - ${fmtIt(inrSub-inrDisc)}`:`Add at least 10 kg to unlock - currently ${kg.toFixed(1)} kg`;
  hint.style.color=met?'rgba(141,198,63,.8)':'rgba(255,255,255,.3)';
  /* update mobile big box bar */
  const bbBar=document.getElementById('mobile-bigbox-bar');
  const bbLabel=document.getElementById('mobile-bigbox-label');
  const bbCount=document.getElementById('mobile-bigbox-count');
  const bbBtn=document.getElementById('mobile-bigbox-btn');
  if(bbBar&&bbCount){
    bbLabel.textContent=kg.toFixed(1)+' kg selected ('+ic+' items)';
    if(met){
      bbCount.textContent='Go to Cart \u2192';
      bbCount.style.color='#8dc63f';
      bbCount.style.fontWeight='700';
      bbBtn.onclick=function(){window.location.href='shop-cart.html'};
    }else{
      bbCount.textContent='Add '+(MIN-kg).toFixed(1)+' kg more to reach 10 kg';
      bbCount.style.color='';
      bbCount.style.fontWeight='';
      bbBtn.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})};
    }
    if(kg>0){
      bbBar.classList.add('show');
    }else{
      bbBar.classList.remove('show');
    }
  }
}

function updateBB(){
  const c=getPriceCountry();
  const pricing=getBigBoxPricing();
  const {ids,kg,subtotal,discount,total,inrSubtotal,inrDiscount,inrTotal}=pricing;
  const productCount=ids.length;
  const minimum=10;
  const met=kg>=minimum;
  const pct=Math.min(100,(kg/minimum)*100);
  const remaining=Math.max(0,minimum-kg);
  const progressColor=kg===0?'rgba(255,255,255,.18)':met?'#8dc63f':'var(--gold)';
  const fmtIt=v=>c==='IN'?('\u20B9'+Math.round(v).toLocaleString('en-IN')):fmtDual(v);

  // Keep the existing desktop Big Box builder in sync.
  const kgLarge=document.getElementById('bb-kg-big');
  if(kgLarge)kgLarge.innerHTML=kg.toFixed(1)+'<small> kg</small>';
  const progress=document.getElementById('bb-pbar');
  if(progress){progress.style.width=pct+'%';progress.style.background=progressColor;}
  const label=document.getElementById('bb-kg-lbl');
  if(label){label.textContent=met?'\u2705 Minimum reached! '+(kg===minimum?'Exactly 10 kg':(kg-minimum).toFixed(1)+' kg above minimum'):'Add '+remaining.toFixed(1)+' kg more to reach the 10 kg minimum';label.style.color=met?'#8dc63f':'rgba(255,255,255,.6)';}
  const status=document.getElementById('bb-status');
  if(status){status.textContent=met?'\u2705 Ready to Order!':'\u23F3 '+remaining.toFixed(1)+' kg remaining';status.style.color=met?'#8dc63f':'var(--gold)';status.style.borderColor=met?'#8dc63f':'rgba(232,184,75,.4)';}
  ['bb-icount','bb-icount2'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=productCount;});
  const kgSummary=document.getElementById('bb-kg-sum');
  if(kgSummary)kgSummary.innerHTML=kg.toFixed(1)+' kg <span style="font-size:13px;color:rgba(255,255,255,.34)">/ 10 kg minimum</span>';
  const orderProgress=document.getElementById('bb-ord-bar');
  if(orderProgress){orderProgress.style.width=pct+'%';orderProgress.style.background=progressColor;}
  const orderMessage=document.getElementById('bb-kg-msg');
  if(orderMessage){orderMessage.textContent=met?'\u2705 12% bulk discount applied!':'\uD83D\uDCE5 Need '+remaining.toFixed(1)+' kg more to proceed';orderMessage.style.color=met?'#8dc63f':'var(--gold)';}
  const legacySubtotal=document.getElementById('bb-sub');if(legacySubtotal)legacySubtotal.textContent=fmtIt(inrSubtotal);
  const legacyDiscount=document.getElementById('bb-disc');
  if(legacyDiscount){legacyDiscount.textContent=met?'-'+fmtIt(inrDiscount):'Unlocks at 10 kg';legacyDiscount.style.color=met?'var(--gold)':'rgba(255,255,255,.28)';}
  const legacyTotal=document.getElementById('bb-tot');if(legacyTotal)legacyTotal.textContent=fmtIt(inrTotal);
  const legacyList=document.getElementById('bb-sumlist');
  if(legacyList)legacyList.innerHTML=ids.length?ids.map(id=>{const product=getBoxProduct(id);if(!product)return'';const linePrice=fmtIt((getEff(product)||product.price)*(bbSel[id]||0));return `<div class="ord-item"><span class="ord-item-emoji">${product.emoji}</span><span class="ord-item-name">${esc(product.name)}</span><span class="ord-item-qty">${bbSel[id].toFixed(1)} kg</span><span class="ord-item-price">${linePrice}</span></div>`;}).join(''):'<p style="color:rgba(255,255,255,.26);font-size:12px;text-align:center;padding:8px 0">No products added yet</p>';
  const legacyButton=document.getElementById('bb-btn');
  if(legacyButton){legacyButton.disabled=!met;legacyButton.style.opacity=met?'1':'.45';legacyButton.style.cursor=met?'pointer':'not-allowed';}
  const legacyHint=document.getElementById('bb-hint');
  if(legacyHint){legacyHint.textContent=met?`Ready: ${productCount} products - ${kg.toFixed(1)} kg - ${fmtIt(inrTotal)}`:`Add at least 10 kg to unlock - currently ${kg.toFixed(1)} kg`;legacyHint.style.color=met?'rgba(141,198,63,.8)':'rgba(255,255,255,.3)';}

  const page=document.querySelector('#page-big-box .bb-mobile-page');
  if(page)page.classList.toggle('has-selection',kg>0);
  const selectionBar=document.getElementById('bb-mobile-selection-bar');
  if(selectionBar)selectionBar.classList.toggle('is-visible',kg>0);
  const selectionCount=document.getElementById('bb-mobile-selected-count');
  if(selectionCount)selectionCount.textContent=productCount+' Item'+(productCount===1?'':'s')+' Selected';
  const selectionNote=document.getElementById('bb-mobile-selection-note');
  if(selectionNote)selectionNote.textContent=met?'Ready to checkout \u{1F33F}':!kg?'Add products to begin':'Add '+remaining.toFixed(1)+' kg more to reach 10 kg';
  const selectionTotal=document.getElementById('bb-mobile-selection-total');
  if(selectionTotal)selectionTotal.textContent=fmtIt(inrTotal);
  const selectionBadge=document.getElementById('bb-selection-badge');
  if(selectionBadge)selectionBadge.textContent=productCount;
  const selectionButton=document.getElementById('bb-mobile-btn');
  if(selectionButton){selectionButton.disabled=!met;selectionButton.classList.toggle('is-ready',met);selectionButton.setAttribute('aria-disabled',String(!met));selectionButton.setAttribute('aria-label',met?'Add Big Box to Cart':'Add at least 10 kg to cart');const btnSpan=selectionButton.querySelector('span');if(btnSpan)btnSpan.textContent=met?'Proceed':'Add to Cart';}
}

function addBigBox(){
  var DELIVERY_COUNTRIES = ['IN', 'SG', 'US', 'AE'];
  var country = (localStorage.getItem('vpnexues_detected_country') || localStorage.getItem('country') || 'IN').toUpperCase();
  if (DELIVERY_COUNTRIES.indexOf(country) === -1) {
    if (typeof showDeliveryComingSoonToast === 'function') { showDeliveryComingSoonToast(); } else { showToast('Currently no delivery in your region. Delivery coming soon!'); }
    return;
  }
  const pricing=getBigBoxPricing();
  if(pricing.kg<10){showToast('âÅ¡  Add at least 10 kg to proceed');return}
  const c=getPriceCountry();
  var item={id:Date.now(),name:'Big Box ('+pricing.kg.toFixed(1)+' kg · '+pricing.ids.length+' items)',emoji:'🛒',cat:'Box',unit:'Box · bulk box',price:parseFloat(pricing.total.toFixed(2)),qty:1,img:null,image:null};
  if(c==='IN'){item.inrPrice=parseFloat(pricing.inrTotal.toFixed(2))}
  var localCart;try{localCart=JSON.parse(localStorage.getItem("cart")||"[]")}catch(e){localCart=[]}
  localCart.push(item);
  localStorage.setItem("cart",JSON.stringify(localCart));
  cart=localCart;
  bbSel={};bbCatF='All';initBB();updateDot();
  showToast('ðÅ¸·ï¸ Big Box added to cart!');
  window.location.href='shop-cart.html';
}

function boxImageHtml(product){
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

function updateBBLoadMore(prefix,total,visible){
  var status=document.getElementById(prefix+'-results-status');
  var btn=document.getElementById(prefix+'-load-more');
  if(status)status.textContent='Showing '+Math.min(visible,total)+' of '+total+' products';
  if(btn)btn.hidden=visible>=total;
}

document.addEventListener('DOMContentLoaded',function(){
  var bbMobileBtn=document.getElementById('bb-mobile-load-more');
  if(bbMobileBtn)bbMobileBtn.addEventListener('click',function(){bbMobileVisible+=BB_PAGE_SIZE;initBB();});
  var bbDesktopBtn=document.getElementById('bb-desktop-load-more');
  if(bbDesktopBtn)bbDesktopBtn.addEventListener('click',function(){bbDesktopVisible+=BB_PAGE_SIZE;initBB();});
});

