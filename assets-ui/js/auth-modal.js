/* VPNexues Auth Modal - shared across all pages */
(function(){
if(window.__vpnAuthModalLoaded) return;
window.__vpnAuthModalLoaded = true;

var OTP_VALIDITY_MS = 2*60*1000;
var OTP_RESEND_MS = 30*1000;
var MAX_OTP_ATTEMPTS = 3;
var otpTimers = {};
var SKIP_AUTH_MODAL = window.__vpnSkipAuthModal === true;

function _localFlag(code){
  var map={in:'in-flag.svg',us:'us flag.png',sg:'sg-flag.png',ae:'uae flag.png',gb:'us flag.png',au:'us flag.png',my:'sg-flag.png',sa:'uae flag.png'};
  var base='https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets';
  var f=map[code]; return f?base+'/'+encodeURIComponent(f):base+'/in-flag.svg';
}

function readJson(key,fallback){try{var v=localStorage.getItem(key);return v?JSON.parse(v):fallback;}catch(e){return fallback;}}
function readLoggedInUser(s){try{var u=JSON.parse(s.getItem('loggedInUser')||'null');return u&&u.isLoggedIn===true?u:null;}catch(e){return null;}}
function vpnIsLoggedIn(){return localStorage.getItem('vpnexuesAuth')==='true'||localStorage.getItem('vpnexuesLoggedIn')==='true'||localStorage.getItem('isLoggedIn')==='true'||sessionStorage.getItem('vpnexuesAuth')==='true'||sessionStorage.getItem('vpnexuesLoggedIn')==='true'||sessionStorage.getItem('isLoggedIn')==='true'||!!readLoggedInUser(localStorage)||!!readLoggedInUser(sessionStorage);}

function vpnUpdateLoginButtons(){
  var l=vpnIsLoggedIn();
  document.querySelectorAll('.vpn-login-btn').forEach(function(b){b.classList.toggle('vpn-hidden',l);b.style.display='';});
  document.querySelectorAll('.vpn-account-btn').forEach(function(a){a.classList.toggle('vpn-hidden',!l);a.style.display='';});
  if(l){
    var user=null;
    try{user=JSON.parse(localStorage.getItem('vpnexuesUser')||'null');}catch(e){}
    if(!user)try{user=JSON.parse(localStorage.getItem('loggedInUser')||'null');}catch(e){}
    var name=user&&(user.name||user.email);
    if(name){
      var shortName=name.split('@')[0];
      if(shortName.length>12)shortName=shortName.substring(0,12)+'...';
      document.querySelectorAll('#navAccountLabel').forEach(function(el){el.textContent=shortName;});
    }
  }else{
    document.querySelectorAll('#navAccountLabel').forEach(function(el){el.textContent='My Account';});
  }
}

function vpnDetectIpCountry(){return fetch('https://ip-api.com/json/?fields=status,countryCode,city').then(function(r){return r.json();}).then(function(d){if(d.status==='success'){var c=(d.countryCode||'').toUpperCase();localStorage.setItem('vpnexues_detected_country',c);return{country:c,city:(d.city||'').toLowerCase()};}return{country:'',city:''};}).catch(function(){return{country:'',city:''};});}

function vpnSyncLoginCountryCode(countryCode){
  var code=(countryCode||'').toUpperCase();
  if(!code)code=localStorage.getItem('vpnexues_detected_country')||localStorage.getItem('country')||'IN';
  var fallback={IN:{phoneCode:'91',flag:'in',digits:10},SG:{phoneCode:'65',flag:'sg',digits:8},US:{phoneCode:'1',flag:'us',digits:10},AE:{phoneCode:'971',flag:'ae',digits:9},GB:{phoneCode:'44',flag:'gb',digits:10},AU:{phoneCode:'61',flag:'au',digits:9},MY:{phoneCode:'60',flag:'my',digits:10},SA:{phoneCode:'966',flag:'sa',digits:9},CA:{phoneCode:'1',flag:'ca',digits:10},DE:{phoneCode:'49',flag:'de',digits:11},FR:{phoneCode:'33',flag:'fr',digits:9},JP:{phoneCode:'81',flag:'jp',digits:10},CN:{phoneCode:'86',flag:'cn',digits:11},BR:{phoneCode:'55',flag:'br',digits:11},MX:{phoneCode:'52',flag:'mx',digits:10}};
  var pc=fallback[code]||fallback.IN;
  [['vpnLogin','login'],['vpnSignup','signup']].forEach(function(pair){
    var prefix=pair[0];
    var hidden=document.getElementById(prefix+'CountryCode');
    var codeSpan=document.getElementById(prefix+'PhoneCode');
    var flag=document.getElementById(prefix+'Flag');
    var phone=document.getElementById(prefix+'Phone');
    if(hidden){hidden.value=pc.phoneCode;hidden.setAttribute('data-flag',pc.flag);hidden.setAttribute('data-digits',pc.digits);}
    if(codeSpan)codeSpan.textContent='+'+pc.phoneCode;
    if(flag)flag.src=_localFlag(pc.flag);
    if(phone){phone.maxLength=pc.digits;phone.value='';}
  });
}

function vpnGetSignupOfferAmount(countryCode){
  var code=(countryCode||'').toUpperCase();
  if(!code)code=localStorage.getItem('vpnexues_detected_country')||localStorage.getItem('country')||'IN';
  var fallback={IN:'\u20B9100',SG:'S$1.61',US:'$1.19',AE:'AED 4.39',GB:'\u00A30.95',AU:'A$1.80',MY:'RM5.50',SA:'SAR 4.47',CA:'C$1.60',DE:'\u20AC1.10',FR:'\u20AC1.10',JP:'\u00A5180',CN:'\u00A58.60',BR:'R$5.90',MX:'MX$20.00'};
  return fallback[code]||fallback.IN;
}

function vpnSyncOfferContent(countryCode){
  var amount=vpnGetSignupOfferAmount(countryCode);
  var el=document.getElementById('vpnAuthOfferAmount');
  if(el)el.textContent=amount+' off';
}

function vpnGetAuthElements(context){
  var prefix=context==='signup'?'vpnSignup':'vpnLogin';
  return{
    name:document.getElementById(prefix+'Name'),email:document.getElementById(prefix+'Email'),
    phone:document.getElementById(prefix+'Phone'),countryCode:document.getElementById(prefix+'CountryCode'),
    phoneCodeSpan:document.getElementById(prefix+'PhoneCode'),otpGroup:document.getElementById(prefix+'OtpGroup'),
    otp:document.getElementById(prefix+'Otp'),password:document.getElementById(prefix+'Password'),
    sendBtn:document.getElementById(prefix+'SendOtpBtn'),verifyBtn:document.getElementById(prefix+'VerifyOtpBtn'),
    resendBtn:document.getElementById(prefix+'ResendOtpBtn'),message:document.getElementById(prefix+'OtpMessage'),
    error:document.getElementById(prefix+'Error'),createBtn:document.getElementById('vpnSignupCreateBtn')
  };
}

function vpnSetButtonDisabled(b,d){if(!b)return;b.disabled=!!d;b.setAttribute('aria-disabled',d?'true':'false');}
function vpnNormalizePhone(v){return String(v||'').replace(/\D/g,'');}

function vpnIsValidPhone(phone){
  if(!phone||phone.length<6)return false;
  var signupForm=document.getElementById('vpnSignupForm');
  var ctx=(signupForm&&!signupForm.classList.contains('vpn-hidden'))?'signup':'login';
  var hidden=document.getElementById(ctx==='signup'?'vpnSignupCountryCode':'vpnLoginCountryCode');
  var digits=hidden?parseInt(hidden.getAttribute('data-digits')||'10',10):10;
  var flag=hidden?(hidden.getAttribute('data-flag')||'in').toUpperCase():'IN';
  if(phone.length!==digits)return false;
  var patterns={IN:/^[6-9]/,SG:/^[89]/,US:/^[2-9]/,AE:/^[5]/,GB:/^7/,AU:/^4/,MY:/^1/,SA:/^5/,CA:/^[2-9]/,DE:/^1[5-7]/,FR:/^[67]/,JP:/^[7-9]/,CN:/^1[3-9]/,BR:/^9/,MX:/^[1-9]/};
  var p=patterns[flag]; if(p&&!p.test(phone))return false;
  return true;
}

function vpnShowError(ctx,msg){var el=document.getElementById(ctx==='signup'?'vpnSignupError':'vpnLoginError');if(el){el.textContent=msg;el.style.display='block';}}
function vpnHideError(ctx){var el=document.getElementById(ctx==='signup'?'vpnSignupError':'vpnLoginError');if(el){el.textContent='';el.style.display='none';}}
function vpnShowFieldError(inputEl,msg){if(!inputEl)return;vpnClearFieldError(inputEl);inputEl.style.borderColor='#dc2626';var d=document.createElement('div');d.className='vpn-field-error';d.textContent=msg;d.style.cssText='color:#dc2626;font-size:12px;margin-top:4px;font-weight:500;display:block;';var g=inputEl.closest('.vpn-input-group')||inputEl.parentNode;g.parentNode.insertBefore(d,g.nextSibling);}
function vpnClearFieldError(inputEl){if(!inputEl)return;inputEl.style.borderColor='';var g=inputEl.closest('.vpn-input-group')||inputEl.parentNode;for(var i=g.parentNode.children.length-1;i>=0;i--){if(g.parentNode.children[i].classList&&g.parentNode.children[i].classList.contains('vpn-field-error'))g.parentNode.children[i].remove();}}

function vpnShowAuthMessage(ctx,msg,type){var m=vpnGetAuthElements(ctx).message;if(!m)return;m.textContent=msg;m.className='vpn-form-sub vpn-otp-message';if(type==='error'){m.classList.add('vpn-error');m.style.color='#dc2626';}else if(type==='success'){m.style.color='#16a34a';}else{m.style.color='#6b7280';}m.classList.remove('vpn-hidden');}
function vpnClearAuthMessage(ctx){var m=vpnGetAuthElements(ctx).message;if(!m)return;m.textContent='';m.classList.add('vpn-hidden');}
function vpnSetOtpControlsVisible(ctx,vis){var els=vpnGetAuthElements(ctx);[els.otpGroup,els.verifyBtn,els.resendBtn].forEach(function(e){if(e)e.classList.toggle('vpn-hidden',!vis);});if(els.sendBtn)els.sendBtn.classList.toggle('vpn-hidden',vis);}

function vpnResetOtpFlow(ctx){var els=vpnGetAuthElements(ctx);vpnClearOtpState(ctx);vpnSetOtpControlsVisible(ctx,false);if(els.otp){els.otp.value='';els.otp.disabled=false;}if(els.sendBtn)vpnSetButtonDisabled(els.sendBtn,false);if(ctx==='signup')vpnSyncSignupCreateButton();}

function vpnOtpKey(ctx){return 'vpnOtp_'+ctx;}
function vpnReadOtpState(ctx){var s=readJson(vpnOtpKey(ctx),null);return s&&s.otp?s:null;}
function vpnSaveOtpState(ctx,s){localStorage.setItem(vpnOtpKey(ctx),JSON.stringify(s));}
function vpnClearOtpState(ctx){localStorage.removeItem(vpnOtpKey(ctx));if(otpTimers[ctx]){clearInterval(otpTimers[ctx]);otpTimers[ctx]=null;}}
function vpnGenerateOtp(){return String(Math.floor(100000+Math.random()*900000));}

function vpnStartOtpCountdown(ctx){
  if(otpTimers[ctx])clearInterval(otpTimers[ctx]);
  function render(){var s=vpnReadOtpState(ctx);var els=vpnGetAuthElements(ctx);if(!s){if(otpTimers[ctx])clearInterval(otpTimers[ctx]);otpTimers[ctx]=null;return;}
  var now=Date.now();var resendSec=Math.max(0,Math.ceil((s.resendAt-now)/1000));var expired=now>s.expiresAt;var locked=s.attempts>=MAX_OTP_ATTEMPTS;
  vpnSetOtpControlsVisible(ctx,true);
  if(els.resendBtn){vpnSetButtonDisabled(els.resendBtn,resendSec>0);els.resendBtn.textContent=resendSec>0?'Resend OTP in '+resendSec+'s':'Resend OTP';}
  if(els.verifyBtn)vpnSetButtonDisabled(els.verifyBtn,expired||locked||s.verified);
  if(expired&&!s.verified){vpnShowError(ctx,'OTP expired. Please resend OTP.');clearInterval(otpTimers[ctx]);otpTimers[ctx]=null;}
  }
  render(); otpTimers[ctx]=setInterval(render,1000);
}

function vpnSendOtp(ctx,isResend){
  var els=vpnGetAuthElements(ctx);var phone=vpnNormalizePhone(els.phone&&els.phone.value);var state=vpnReadOtpState(ctx);var now=Date.now();
  vpnClearAuthMessage(ctx);vpnHideError(ctx);
  if(ctx==='signup'&&(!els.name||!els.name.value.trim())){vpnShowError(ctx,'Please enter your full name.');return;}
  if(!vpnIsValidPhone(phone)){vpnShowError(ctx,'Please enter a valid phone number.');return;}
  if(ctx==='login'){var eu=vpnFindUserByPhone(phone);if(!eu){vpnShowFieldError(els.phone,'This phone number is not registered. Please sign up first.');return;}}
  if(ctx==='signup'){var ep=vpnFindUserByPhone(phone);if(ep){vpnShowFieldError(els.phone,'This phone number is already registered. Please login instead.');return;}}
  if(state&&state.phone===phone&&state.resendAt>now){vpnStartOtpCountdown(ctx);vpnShowError(ctx,'Please wait before requesting another OTP.');return;}
  var otp=vpnGenerateOtp();var next={phone:phone,otp:otp,expiresAt:now+OTP_VALIDITY_MS,resendAt:now+OTP_RESEND_MS,attempts:0,verified:false};
  vpnSaveOtpState(ctx,next);vpnSetOtpControlsVisible(ctx,true);
  if(els.otp){els.otp.value='';els.otp.disabled=false;els.otp.focus();}
  if(els.verifyBtn)vpnSetButtonDisabled(els.verifyBtn,false);
  if(ctx==='signup')vpnSyncSignupCreateButton();
  vpnShowAuthMessage(ctx,'Demo OTP: '+otp,'success');vpnStartOtpCountdown(ctx);
}

function vpnVerifyOtp(ctx){
  var els=vpnGetAuthElements(ctx);var state=vpnReadOtpState(ctx);var phone=vpnNormalizePhone(els.phone&&els.phone.value);var entered=(els.otp&&els.otp.value||'').trim();
  vpnClearAuthMessage(ctx);vpnHideError(ctx);
  if(!state||state.phone!==phone){vpnShowError(ctx,'Please send a new OTP.');return;}
  if(Date.now()>state.expiresAt){vpnShowError(ctx,'OTP expired. Please resend.');return;}
  if(state.attempts>=MAX_OTP_ATTEMPTS){vpnShowError(ctx,'Max attempts reached. Please resend OTP.');return;}
  if(!/^\d{6}$/.test(entered)){vpnShowError(ctx,'Enter the 6-digit OTP.');return;}
  if(entered!==state.otp){state.attempts+=1;vpnSaveOtpState(ctx,state);var rem=MAX_OTP_ATTEMPTS-state.attempts;vpnShowError(ctx,rem<=0?'Max attempts reached. Resend OTP.':'Invalid OTP. '+rem+' attempt'+(rem===1?'':'s')+' remaining.');return;}
  state.verified=true;vpnSaveOtpState(ctx,state);
  if(ctx==='login'){var eu=vpnFindUserByPhone(phone);if(!eu){vpnShowError(ctx,'Account not found. Please sign up.');return;}vpnStoreLogin(eu);vpnClearOtpState(ctx);vpnAfterAuth();return;}
  if(els.otp)els.otp.disabled=true;if(els.verifyBtn)vpnSetButtonDisabled(els.verifyBtn,true);if(els.resendBtn)els.resendBtn.classList.add('vpn-hidden');
  if(otpTimers[ctx]){clearInterval(otpTimers[ctx]);otpTimers[ctx]=null;}
  vpnSyncSignupCreateButton();vpnShowAuthMessage(ctx,'OTP verified. Create your account now.','success');
}

function vpnReadUsers(){var u=readJson('users',[]);return Array.isArray(u)?u:[];}
function vpnFindUserByPhone(phone){return vpnReadUsers().find(function(u){return vpnNormalizePhone(u&&u.phone)===phone;})||null;}
function vpnSaveUser(user){var users=vpnReadUsers();var idx=users.findIndex(function(u){return vpnNormalizePhone(u&&u.phone)===user.phone;});if(idx>=0)users[idx]=user;else users.push(user);localStorage.setItem('users',JSON.stringify(users));}

function vpnSyncSignupCreateButton(){var els=vpnGetAuthElements('signup');if(!els.createBtn)return;var state=vpnReadOtpState('signup');var phone=vpnNormalizePhone(els.phone&&els.phone.value);vpnSetButtonDisabled(els.createBtn,!(vpnIsValidPhone(phone)&&state&&state.verified&&state.phone===phone));}

function vpnHandleSignup(){
  var els=vpnGetAuthElements('signup');var name=els.name&&els.name.value.trim();var email=els.email&&els.email.value.trim();var phone=vpnNormalizePhone(els.phone&&els.phone.value);var state=vpnReadOtpState('signup');
  vpnClearAuthMessage('signup');vpnHideError('signup');
  if(!name||!email||!phone){vpnShowError('signup','Please fill in all required fields.');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){vpnShowError('signup','Enter a valid email.');return;}
  if(!vpnIsValidPhone(phone)){vpnShowError('signup','Enter a valid phone number.');return;}
  if(!state||state.phone!==phone){vpnShowError('signup','Send OTP first.');return;}
  if(!state.verified){vpnVerifyOtp('signup');state=vpnReadOtpState('signup');}
  if(!state||!state.verified||state.phone!==phone)return;
  if(vpnFindUserByPhone(phone)){vpnShowError('signup','Already registered. Please login.');return;}
  var user={name:name,email:email,phone:phone,password:els.password?els.password.value:''};
  vpnSaveUser(user);vpnStoreLogin({name:name,email:email,phone:phone});vpnClearOtpState('signup');vpnAfterAuth();
}

function vpnStoreLogin(user){
  var profile={name:user.name||'VPNexues Customer',email:user.email||'',phone:vpnNormalizePhone(user.phone)};
  localStorage.setItem('loggedInUser',JSON.stringify({name:profile.name,email:profile.email,phone:profile.phone,isLoggedIn:true}));
  localStorage.setItem('vpnexuesAuth','true');localStorage.setItem('vpnexuesLoggedIn','true');localStorage.setItem('isLoggedIn','true');localStorage.setItem('vpnexuesSession','true');localStorage.setItem('vpnexuesUser',JSON.stringify(profile));
}

function vpnAfterAuth(){vpnCloseModal();vpnUpdateLoginButtons();window.location.href=window.location.pathname+'?r='+Date.now();}

function vpnAuthMascotVideos(){return document.querySelectorAll('#vpnModal .vpn-modal-mascot-video');}
function vpnSetAuthMascotsPlaying(playing){
  if(playing&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)playing=false;
  vpnAuthMascotVideos().forEach(function(v){
    if(playing){var p=v.play();if(p&&p.catch)p.catch(function(){});}
    else{v.pause();try{v.currentTime=0;}catch(e){}v.style.opacity='1';}
  });
}
function vpnWatchAuthMascotVideo(){
  var videos=Array.prototype.slice.call(vpnAuthMascotVideos());if(!videos.length)return;
  var FADE=.5,SYNC_TOLERANCE=.08,MAX_RETRIES=3,RETRY_CHECK=6000;
  function isOpen(){var modal=document.getElementById('vpnModal');return !!modal&&modal.classList.contains('open');}
  function playOne(video){var p=video.play();if(p&&p.catch)p.catch(function(){});}
  /* Keep the bell pepper and eggplant in lockstep, like the broccoli + carrot videos. */
  function syncVideos(){
    window.requestAnimationFrame(syncVideos);if(!isOpen())return;
    var reference=null;
    videos.forEach(function(v){if(!reference&&v.readyState>=2&&isFinite(v.duration)&&v.duration>0)reference=v;});
    if(!reference)return;
    videos.forEach(function(v){
      if(!isFinite(v.duration)||v.duration<=0)return;
      if(v!==reference&&!v.seeking){var half=v.duration/2;var delta=((v.currentTime-reference.currentTime+half)%v.duration+v.duration)%v.duration-half;if(Math.abs(delta)>SYNC_TOLERANCE)v.currentTime=reference.currentTime;}
      var remaining=v.duration-v.currentTime;v.style.opacity=String(Math.min(1,Math.max(0,remaining/FADE)));
    });
  }
  videos.forEach(function(video){
    if(video.dataset.vpnVideoWatched)return;
    video.dataset.vpnVideoWatched='1';
    var attempts=0,retryTimer=0,loadTimer=0;
    function retry(){
      if(video.readyState>=2||attempts>=MAX_RETRIES)return;
      attempts+=1;window.clearTimeout(loadTimer);
      loadTimer=window.setTimeout(function(){video.load();if(isOpen())playOne(video);scheduleCheck();},800*attempts);
    }
    function scheduleCheck(){window.clearTimeout(retryTimer);retryTimer=window.setTimeout(retry,RETRY_CHECK);}
    ['error','abort','stalled'].forEach(function(evt){video.addEventListener(evt,retry);});
    ['loadeddata','canplay'].forEach(function(evt){video.addEventListener(evt,function(){window.clearTimeout(retryTimer);});});
    scheduleCheck();
  });
  window.requestAnimationFrame(syncVideos);
}
function vpnBindAuthMascotBursts(){
  document.querySelectorAll('#vpnModal .vpn-modal-mascot').forEach(function(m){
    m.addEventListener('click',function(){
      if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      m.classList.remove('vpn-modal-mascot-burst');
      window.requestAnimationFrame(function(){m.classList.add('vpn-modal-mascot-burst');});
    });
    m.addEventListener('animationend',function(e){if(e.target===e.currentTarget)m.classList.remove('vpn-modal-mascot-burst');});
  });
}

function vpnOpenModal(tab){
  if(SKIP_AUTH_MODAL){window.location.href=vpnIsLoggedIn()?'account.html':(tab==='signup'?'signup.html':'login.html');return;}
  if(vpnIsLoggedIn()){window.location.href='index.html';return;}
  vpnDetectIpCountry().then(function(r){var code=r.country||localStorage.getItem('vpnexues_detected_country')||'IN';vpnSyncLoginCountryCode(code);vpnSyncOfferContent(code);});
  var modal=document.getElementById('vpnModal');if(!modal)return;
  modal.classList.add('open');document.documentElement.classList.add('vpn-auth-open');
  vpnSwitchTab(tab||'login');document.body.style.overflow='hidden';
  vpnSetAuthMascotsPlaying(true);
}
function vpnCloseModal(){var m=document.getElementById('vpnModal');if(!m)return;vpnSetAuthMascotsPlaying(false);m.classList.remove('open');document.documentElement.classList.remove('vpn-auth-open');document.body.style.overflow='';}
function vpnSwitchTab(tab){
  if(SKIP_AUTH_MODAL)return;
  var isL=tab==='login';
  document.getElementById('vpnLoginForm').classList.toggle('vpn-hidden',!isL);
  document.getElementById('vpnSignupForm').classList.toggle('vpn-hidden',isL);
  document.getElementById('vpnTabLogin').classList.toggle('active',isL);
  document.getElementById('vpnTabSignup').classList.toggle('active',!isL);
  var title=document.getElementById('vpnAuthTitle');var eyebrow=document.getElementById('vpnAuthEyebrow');
  var bannerTitle=document.getElementById('vpnAuthBannerTitle');var bannerCopy=document.getElementById('vpnAuthBannerCopy');
  if(title)title.textContent=isL?'Login':'Sign Up';
  if(eyebrow)eyebrow.textContent=isL?'Welcome back':'Create account';
  if(bannerTitle)bannerTitle.innerHTML=isL?'Fresh Vegetables<br>Delivered Daily.':'Fresh savings for<br>your first order.';
  if(bannerCopy)bannerCopy.textContent=isL
    ?'Order crisp greens, seasonal vegetables, and everyday essentials from trusted farms.'
    :'New users get exclusive offers on their first order. Fresh produce, trusted delivery, simple checkout.';
  vpnClearAuthMessage('login');vpnClearAuthMessage('signup');vpnHideError('login');vpnHideError('signup');vpnSyncSignupCreateButton();
}

function vpnLockPhonePrefix(){
  ['vpnLogin','vpnSignup'].forEach(function(prefix){
    var phoneInput=document.getElementById(prefix+'Phone');var countrySpan=document.getElementById(prefix+'CountryCode');
    if(phoneInput){phoneInput.addEventListener('keydown',function(e){if(this.selectionStart===0&&(e.key==='Backspace'||e.key==='Delete'))e.preventDefault();});}
    if(countrySpan){countrySpan.parentElement.style.pointerEvents='none';countrySpan.parentElement.style.opacity='0.9';countrySpan.parentElement.style.cursor='not-allowed';}
  });
}

function vpnInitAuthForms(){
  vpnSyncLoginCountryCode();vpnSyncOfferContent();vpnSyncSignupCreateButton();
  ['login','signup'].forEach(function(ctx){
    var els=vpnGetAuthElements(ctx);
    [els.name,els.email,els.phone,els.otp,els.password].forEach(function(input){
      if(!input)return;
      input.addEventListener('input',function(){
        var state=vpnReadOtpState(ctx);if(input===els.phone&&state&&state.phone!==vpnNormalizePhone(input.value))vpnResetOtpFlow(ctx);
        vpnClearAuthMessage(ctx);vpnClearFieldError(input);if(ctx==='signup')vpnSyncSignupCreateButton();
        if(input===els.phone){var phone=vpnNormalizePhone(input.value);var hidden=document.getElementById(ctx==='signup'?'vpnSignupCountryCode':'vpnLoginCountryCode');var digits=hidden?parseInt(hidden.getAttribute('data-digits')||'10',10):10;
          if(phone.length===digits){if(!vpnIsValidPhone(phone)){input.style.borderColor='#dc2626';vpnShowFieldError(input,'Invalid number.');if(els.sendBtn)vpnSetButtonDisabled(els.sendBtn,true);}else{input.style.borderColor='#16a34a';vpnClearFieldError(input);if(els.sendBtn)vpnSetButtonDisabled(els.sendBtn,false);}}
        }
      });
    });
  });
  setInterval(function(){['login','signup'].forEach(function(ctx){var els=vpnGetAuthElements(ctx);if(els.phone&&els.sendBtn){var phone=vpnNormalizePhone(els.phone.value);if(phone&&vpnIsValidPhone(phone)&&els.sendBtn.disabled)vpnSetButtonDisabled(els.sendBtn,false);else if(!vpnIsValidPhone(phone)&&phone.length>0&&!els.sendBtn.disabled)vpnSetButtonDisabled(els.sendBtn,true);}});},500);
  vpnLockPhonePrefix();
}

/* Inject modal HTML */
function vpnInjectModal(){
  if(SKIP_AUTH_MODAL || document.getElementById('vpnModal'))return;
  var html='<div id="vpnModal" role="dialog" aria-modal="true" aria-label="Login / Sign up">'+
    '<div class="vpn-modal-panel">'+
      '<button class="vpn-close-btn" onclick="vpnCloseModal()" aria-label="Close">&times;</button>'+
      '<div class="vpn-modal-mascots" aria-hidden="true">'+
        '<span class="vpn-modal-mascot vpn-modal-mascot-bellpeper"><span class="vpn-modal-mascot-bob"><video class="vpn-modal-mascot-video" src="assets-ui/img/box-concept/bellpeper-moscot.webm" autoplay loop muted playsinline preload="auto"></video></span></span>'+
        '<span class="vpn-modal-mascot vpn-modal-mascot-eggplant"><span class="vpn-modal-mascot-bob"><video class="vpn-modal-mascot-video" src="assets-ui/img/box-concept/eggplant-moscot.webm" autoplay loop muted playsinline preload="auto"></video></span></span>'+
      '</div>'+
      '<div class="vpn-modal-deco">'+
        '<div class="vpn-deco-topbar"><div class="vpn-category-drawer__brand"><img class="vpn-modal-logo" src="https://d1hs0xydm3t52x.cloudfront.net/media/vpnexues/old/site-assets/logo/vp-logo.svg" onerror="this.onerror=null;this.src=\'assets-ui/img/home-1/vp_logo.svg\'" alt="VPNexues logo"><span class="deco-logo">VPNexues<small class="idlogo-vivasayam-txt">விவசாயம் காப்போம்</small></span></div></div>'+
        '<div class="vpn-auth-banner-content"><h2 id="vpnAuthBannerTitle">Fresh Vegetables<br>Delivered Daily.</h2><p id="vpnAuthBannerCopy">Order crisp greens, seasonal vegetables, and everyday essentials from trusted farms.</p></div>'+
      '</div>'+
      '<div class="vpn-modal-form-area">'+
        '<div class="vpn-tabs"><button class="vpn-tab active" id="vpnTabLogin" onclick="vpnSwitchTab(\'login\')">Login</button><button class="vpn-tab" id="vpnTabSignup" onclick="vpnSwitchTab(\'signup\')">Sign Up</button></div>'+
        '<div class="vpn-auth-card-head"><p id="vpnAuthEyebrow">Welcome back</p><h3 id="vpnAuthTitle">Login</h3></div>'+
        '<div id="vpnLoginForm">'+
          '<p class="vpn-form-sub">Order crisp greens, seasonal vegetables, and everyday essentials from trusted farms.</p>'+
          '<label class="vpn-field-label">Phone number</label>'+
          '<div class="vpn-input-group"><span class="vpn-country-prefix"><img id="vpnLoginFlag" src="https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/in-flag.svg" alt="" style="width:24px;height:18px;object-fit:cover;border-radius:3px;"><span id="vpnLoginPhoneCode" style="font-size:14px;font-weight:700;color:inherit;">+91</span><input type="hidden" id="vpnLoginCountryCode" value="91" data-flag="in" data-digits="10"></span><input id="vpnLoginPhone" type="tel" placeholder="Enter phone number" autocomplete="tel" inputmode="numeric" maxlength="10" oninput="this.value=this.value.replace(/[^0-9]/g,\'\')"></div>'+
          '<div id="vpnLoginError" class="vpn-otp-message vpn-error" style="display:none;" aria-live="polite"></div>'+
          '<button id="vpnLoginSendOtpBtn" class="vpn-submit-btn" type="button" onclick="vpnSendOtp(\'login\')"><i class="far fa-paper-plane"></i> Login</button>'+
          '<div id="vpnLoginOtpGroup" class="vpn-input-group vpn-hidden"><i class="fal fa-key"></i><input id="vpnLoginOtp" type="tel" placeholder="Enter 6-digit OTP" autocomplete="one-time-code" inputmode="numeric" maxlength="6" oninput="this.value=this.value.replace(/[^0-9]/g,\'\')"></div>'+
          '<button id="vpnLoginVerifyOtpBtn" class="vpn-submit-btn vpn-otp-verify-btn vpn-hidden" type="button" onclick="vpnVerifyOtp(\'login\')"><i class="far fa-check-circle"></i> Verify &amp; Login</button>'+
          '<button id="vpnLoginResendOtpBtn" type="button" class="vpn-otp-resend-link vpn-hidden" onclick="vpnSendOtp(\'login\',true)">Resend OTP</button>'+
          '<p id="vpnLoginOtpMessage" class="vpn-form-sub vpn-otp-message vpn-hidden" aria-live="polite"></p>'+
          '<p class="vpn-auth-switch">New to VPNexues? <a href="signup.html">Create a account</a></p>'+
          '<div class="vpn-trust-note"><i class="far fa-shield-check"></i><span><strong>100% Fresh &amp; Trusted</strong><small>Direct from farms to your home</small></span></div>'+
          '<p class="vpn-terms">By continuing, you agree to <a href="javascript:void(0)">Terms</a> &amp; <a href="javascript:void(0)">Privacy Policy</a>.</p>'+
        '</div>'+
        '<div id="vpnSignupForm" class="vpn-hidden">'+
          '<p class="vpn-form-sub">New users get exclusive offers on their first order. Fresh produce, trusted delivery, simple checkout.</p>'+
          '<label class="vpn-field-label">Full name</label>'+
          '<div class="vpn-input-group"><i class="far fa-user"></i><input id="vpnSignupName" type="text" placeholder="Enter full name" autocomplete="name"></div>'+
          '<label class="vpn-field-label">Email address</label>'+
          '<div class="vpn-input-group"><i class="far fa-envelope"></i><input id="vpnSignupEmail" type="email" placeholder="Enter email address" autocomplete="email"></div>'+
          '<label class="vpn-field-label">Mobile number</label>'+
          '<div class="vpn-input-group"><span class="vpn-country-prefix"><img id="vpnSignupFlag" src="https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/in-flag.svg" alt="" style="width:24px;height:18px;object-fit:cover;border-radius:3px;"><span id="vpnSignupPhoneCode" style="font-size:14px;font-weight:700;color:inherit;">+91</span><input type="hidden" id="vpnSignupCountryCode" value="91" data-flag="in" data-digits="10"></span><input id="vpnSignupPhone" type="tel" placeholder="Enter mobile number" autocomplete="tel" inputmode="numeric" maxlength="10" oninput="this.value=this.value.replace(/[^0-9]/g,\'\')"></div>'+
          '<div id="vpnSignupError" class="vpn-otp-message vpn-error" style="display:none;" aria-live="polite"></div>'+
          '<button id="vpnSignupSendOtpBtn" class="vpn-submit-btn" type="button" onclick="vpnSendOtp(\'signup\')"><i class="far fa-paper-plane"></i> Send OTP</button>'+
          '<div id="vpnSignupOtpGroup" class="vpn-input-group vpn-hidden"><i class="fal fa-key"></i><input id="vpnSignupOtp" type="tel" placeholder="Enter 6-digit OTP" autocomplete="one-time-code" inputmode="numeric" maxlength="6" oninput="this.value=this.value.replace(/[^0-9]/g,\'\')"></div>'+
          '<button id="vpnSignupVerifyOtpBtn" class="vpn-submit-btn vpn-otp-verify-btn vpn-hidden" type="button" onclick="vpnHandleSignup()"><i class="far fa-check-circle"></i> Verify &amp; Create Account</button>'+
          '<button id="vpnSignupResendOtpBtn" type="button" class="vpn-otp-resend-link vpn-hidden" onclick="vpnSendOtp(\'signup\',true)">Resend OTP</button>'+
          '<p id="vpnSignupOtpMessage" class="vpn-form-sub vpn-otp-message vpn-hidden" aria-live="polite"></p>'+
          '<div class="vpn-input-group vpn-signup-extra"><i class="fal fa-lock"></i><input id="vpnSignupPassword" type="password" placeholder="Create password" autocomplete="new-password"></div>'+
          '<div class="vpn-input-group vpn-signup-extra"><i class="far fa-tag"></i><input id="vpnSignupReferral" type="text" placeholder="Referral code (optional)" autocomplete="off"></div>'+
          '<button id="vpnSignupCreateBtn" class="vpn-submit-btn vpn-signup-extra" onclick="vpnHandleSignup()" disabled>CREATE ACCOUNT <i class="far fa-arrow-right"></i></button>'+
          '<p class="vpn-auth-switch">Already registered? <a onclick="vpnSwitchTab(\'login\')">Login here</a></p>'+
          '<p class="vpn-terms">By continuing, you agree to <a href="javascript:void(0)">Terms</a> &amp; <a href="javascript:void(0)">Privacy Policy</a>.</p>'+
        '</div>'+
        '<div class="vpn-recaptcha-wrap" aria-hidden="true"></div>'+
        '<div class="vpn-auth-bottom-art" aria-hidden="true"></div>'+
      '</div>'+
    '</div>'+
  '</div>';
  document.body.insertAdjacentHTML('beforeend',html);
}

/* Expose globally */
window.vpnIsLoggedIn = vpnIsLoggedIn;
window.vpnUpdateLoginButtons = vpnUpdateLoginButtons;
window.vpnOpenModal = vpnOpenModal;
window.vpnCloseModal = vpnCloseModal;
window.vpnSwitchTab = vpnSwitchTab;
window.vpnSendOtp = vpnSendOtp;
window.vpnVerifyOtp = vpnVerifyOtp;
window.vpnHandleSignup = vpnHandleSignup;
window.vpnStoreLogin = vpnStoreLogin;
window.vpnAfterAuth = vpnAfterAuth;

/* Init on DOM ready */
document.addEventListener('DOMContentLoaded',function(){
  vpnInjectModal();
  vpnBindAuthMascotBursts();
  vpnWatchAuthMascotVideo();
  vpnDetectIpCountry().then(function(r){
    var code=r.country||localStorage.getItem('vpnexues_detected_country')||'IN';
    vpnSyncLoginCountryCode(code);vpnSyncOfferContent(code);
  });
  vpnInitAuthForms();
  vpnUpdateLoginButtons();
  var modal=document.getElementById('vpnModal');
  if(modal){modal.addEventListener('click',function(e){if(e.target===this)vpnCloseModal();});}
  document.addEventListener('keydown',function(e){if(e.key==='Escape')vpnCloseModal();});

  var params=new URLSearchParams(window.location.search);
  if(params.get('login')==='1'){
    if(vpnIsLoggedIn()){var redir=params.get('redirect');window.location.href=redir||'index.html';return;}
    vpnOpenModal('login');
  }
});

})();
