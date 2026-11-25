/* ============================================================
   index-inline.js — extracted from index.html inline scripts
   ============================================================ */

/* -- Preloader hide -- */

        (function(){

            var p = new URLSearchParams(window.location.search);

            if(p.get('login')==='1'){

                var el = document.getElementById('preloader');

                if(el) el.style.display='none';

            }

        })();

/* -- Country flag init -- */

        (function(){

          var c = (localStorage.getItem('vpnexues_detected_country') || localStorage.getItem('country') || 'IN').toUpperCase();

          var D = { GB:'UK', AE:'UAE' };

          var code = D[c] || c;

          var flagBase = 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets';

          var flagMap = {IN:'in-flag.svg',US:'us flag.png',SG:'sg-flag.png',AE:'uae flag.png'};

          var flagFile = flagMap[c] || 'in-flag.svg';

          var flagUrl = flagBase + '/' + encodeURIComponent(flagFile);

          var flagImg = document.getElementById('flagImg');

          var countryCodeEl = document.getElementById('headerCountryCode');

          if(flagImg){ flagImg.onerror = function(){ this.onerror=null; this.src='assets-ui/img/in-flag.svg'; }; flagImg.src = flagUrl; }

          if(countryCodeEl) countryCodeEl.textContent = code;

          var topbarFlagImg = document.getElementById('topbarFlagImg');

          var topbarCodeEl = document.getElementById('topbarCountryCode');

          if(topbarFlagImg){ topbarFlagImg.onerror = function(){ this.onerror=null; this.src='assets-ui/img/in-flag.svg'; }; topbarFlagImg.src = flagUrl; }

          if(topbarCodeEl) topbarCodeEl.textContent = code;

        })();

/* -- Swiper product range -- */

            document.addEventListener('DOMContentLoaded', function () {

                if (typeof Swiper === 'undefined') return;



                var categoryTitle = document.getElementById('productCategoryTitle');

                var productSwiper = new Swiper('.product-range-swiper', {

                    loop: true,

                    speed: 850,

                    spaceBetween: 30,

                    slidesPerView: 1,

                    slidesPerGroup: 1,

                    autoplay: {

                        delay: 3000,

                        disableOnInteraction: false

                    },

                    navigation: {

                        nextEl: '.product-range-next',

                        prevEl: '.product-range-prev'

                    },

                    breakpoints: {

                        768: {

                            slidesPerView: 2,

                            slidesPerGroup: 2

                        },

                        1200: {

                            slidesPerView: 4,

                            slidesPerGroup: 4

                        }

                    },

                    on: {

                        init: function () {

                            updateProductCategory(this);

                        },

                        slideChangeTransitionStart: function () {

                            if (categoryTitle) categoryTitle.classList.add('is-changing');

                        },

                        slideChangeTransitionEnd: function () {

                            updateProductCategory(this);

                        }

                    }

                });



                function updateProductCategory(swiper) {

                    if (!categoryTitle || !swiper.slides.length) return;



                    var activeSlide = swiper.slides[swiper.activeIndex];

                    var category = activeSlide ? activeSlide.getAttribute('data-category') : 'Fresh Fruits';



                    categoryTitle.textContent = category || 'Fresh Fruits';

                    requestAnimationFrame(function () {

                        categoryTitle.classList.remove('is-changing');

                    });

                }

            });

/* -- Country sync -- */

document.addEventListener("DOMContentLoaded", function () {



  var flagImg = document.getElementById("flagImg");

  var countryCodeEl = document.getElementById("headerCountryCode");

  var topbarFlagImg = document.getElementById("topbarFlagImg");

  var topbarCodeEl = document.getElementById("topbarCountryCode");

  var COUNTRY_DISPLAY = { GB:'UK', AE:'UAE' };



  /* Apply country: update flag UI + save + re-render prices */

  function applyCountry(countryCode) {

    var display = COUNTRY_DISPLAY[countryCode] || countryCode;

    if (flagImg){ flagImg.onerror = function(){ this.onerror=null; this.src='assets-ui/img/in-flag.svg'; }; flagImg.src = VPNexuesCountry.getFlag(countryCode); }

    if (countryCodeEl) countryCodeEl.textContent = display;

    if (topbarFlagImg){ topbarFlagImg.onerror = function(){ this.onerror=null; this.src='assets-ui/img/in-flag.svg'; }; topbarFlagImg.src = VPNexuesCountry.getFlag(countryCode); }

    if (topbarCodeEl) topbarCodeEl.textContent = display;

    VPNexuesCountry.save(countryCode);

    VPNexuesCountry.update(countryCode);

  }

  window.applyCountry = applyCountry;



  /* â”€â”€ INIT â”€â”€ */

  var initCode = localStorage.getItem("vpnexues_detected_country") || localStorage.getItem("country") || "IN";

  applyCountry(initCode);



  /* â”€â”€ Auto-detect: update flag when geoip responds â”€â”€ */

  document.addEventListener("vpn-country-price-change", function (e) {

    var detail = e.detail || {};

    var code = detail.country || localStorage.getItem("vpnexues_detected_country") || localStorage.getItem("country") || "IN";

    var display = COUNTRY_DISPLAY[code] || code;

    if (flagImg){ flagImg.onerror = function(){ this.onerror=null; this.src='assets-ui/img/in-flag.svg'; }; flagImg.src = VPNexuesCountry.getFlag(code); }

    if (countryCodeEl) countryCodeEl.textContent = display;

    if (topbarFlagImg){ topbarFlagImg.onerror = function(){ this.onerror=null; this.src='assets-ui/img/in-flag.svg'; }; topbarFlagImg.src = VPNexuesCountry.getFlag(code); }

    if (topbarCodeEl) topbarCodeEl.textContent = display;

  });



});

/* -- Contact form + CTA slider -- */



const form = document.getElementById('contact-form');



if (form) {

    form.addEventListener('submit', function(e){



        e.preventDefault();



        const formData = new FormData(form);



        fetch('send-mail.php', {



            method: 'POST',

            body: formData



        })



        .then(response => response.text())



        .then(data => {



            if(data.trim() === "success"){



                showToast("Message sent successfully!", "success");



                form.reset();



            } else {



                showToast("Failed to send message!", "error");



            }



        })



        .catch(error => {



            showToast("Something went wrong!", "error");



        });



    });

}



function showToast(message, type){



    const toast = document.getElementById('toast');



    toast.innerText = message;



    toast.className = "toast-message show";



    if(type === "success"){



        toast.classList.add("toast-success");



    } else {



        toast.classList.add("toast-error");



    }



    setTimeout(() => {



        toast.classList.remove("show");



    }, 3000);



}



(function () {

    const slides = document.querySelectorAll('.cta-slide');

    if (slides.length <= 1) return;



    let current = 0;

    slides[0].classList.add('active');



    setInterval(function () {

        const prev = current;

        current = (current + 1) % slides.length;



        // Add leaving class to outgoing slide

        slides[prev].classList.remove('active');

        slides[prev].classList.add('leaving');



        // After transition ends, clean up leaving class

        setTimeout(function () {

            slides[prev].classList.remove('leaving');

        }, 1800);



        // Activate incoming slide

        slides[current].classList.add('active');



    }, 4000); // 4s interval with 1.8s crossfade = buttery smooth

})();



/* -- Popup offer system -- */

  /* â•â•â• Popup offer system â•â•â• */

  function authOpen() {

    if (vpnIsLoggedIn()) { window.location.href = 'index.html'; return; }

    document.getElementById('authPopup').style.display = 'flex';

    document.body.style.overflow = 'hidden';

  }

  function authClose() {

    document.getElementById('authPopup').style.display = 'none';

    document.body.style.overflow = '';

    localStorage.setItem('vpnexues_had_account', '1');

  }

  function authShowSignupForm() {

    localStorage.setItem('vpnexues_had_account', '1');

    localStorage.setItem('vpnexues_promo_seen', '1');

    authClose();

    vpnOpenModal('signup');

  }

  /* Auto-detect location using browser geolocation (native prompt) */

  function vpnCheckShowPopup() {

    if (vpnIsLoggedIn()) return;

    if (localStorage.getItem('vpnexues_had_account') === '1') return;

    if (localStorage.getItem('vpnexues_promo_seen') === '1') return;

    if (new URLSearchParams(window.location.search).get('login') === '1') return;

    /* Show auth signup popup for new users */

    setTimeout(function() { authOpen(); }, 1000);

  }







  function showPromoPopup() {

    var offerAmount = vpnGetSignupOfferAmount();

    var badge = document.getElementById('promoBadge');

    var subtitle = document.getElementById('promoSubtitle');

    var feature1 = document.getElementById('promoFeature1');

    var ctaAmount = document.getElementById('promoCtaAmount');

    if (badge) badge.textContent = 'FLAT ' + offerAmount + ' OFF';

    if (subtitle) subtitle.textContent = 'Sign up now and get ' + offerAmount + ' off on your first order';

    if (feature1) feature1.textContent = offerAmount + ' instant discount on first purchase';

    if (ctaAmount) ctaAmount.textContent = offerAmount;

    document.getElementById('promoPopup').style.display = 'flex';

  }



  function closePromoPopup() {

    document.getElementById('promoPopup').style.display = 'none';

    localStorage.setItem('vpnexues_promo_seen', '1');

  }

/* -- Auth system (OTP, login, signup) -- */

// Frontend-only OTP settings. Swap these helpers for a real OTP API later.

var VPN_OTP_VALIDITY_MS = 2 * 60 * 1000;

var VPN_OTP_RESEND_MS = 30 * 1000;

var VPN_MAX_OTP_ATTEMPTS = 3;

var vpnOtpTimers = {};



function vpnReadJson(key, fallback) {

    try {

        var value = localStorage.getItem(key);

        return value ? JSON.parse(value) : fallback;

    } catch (error) {

        return fallback;

    }

}



function vpnReadLoggedInUser(storage) {

    try {

        var user = JSON.parse(storage.getItem('loggedInUser') || 'null');

        return user && user.isLoggedIn === true ? user : null;

    } catch (error) {

        return null;

    }

}



function vpnIsLoggedIn(){

    return localStorage.getItem('vpnexuesAuth')==='true'||localStorage.getItem('vpnexuesLoggedIn')==='true'||localStorage.getItem('isLoggedIn')==='true'||sessionStorage.getItem('vpnexuesAuth')==='true'||sessionStorage.getItem('vpnexuesLoggedIn')==='true'||sessionStorage.getItem('isLoggedIn')==='true'||!!vpnReadLoggedInUser(localStorage)||!!vpnReadLoggedInUser(sessionStorage);

}



function vpnUpdateLoginButtons(){

    var loggedIn=vpnIsLoggedIn();

    var showTopAccount=loggedIn;

    document.querySelectorAll('.vpn-login-btn').forEach(function(button){

        button.classList.toggle('vpn-hidden',loggedIn);

        button.setAttribute('aria-hidden',loggedIn?'true':'false');

        button.tabIndex=loggedIn?-1:0;

    });

    document.querySelectorAll('.vpn-account-btn').forEach(function(link){

        link.classList.toggle('vpn-hidden',!showTopAccount);

        link.setAttribute('aria-hidden',showTopAccount?'false':'true');

        link.tabIndex=showTopAccount?0:-1;

    });

    document.querySelectorAll('.vpn-shop-now-btn').forEach(function(link){

        link.classList.toggle('vpn-hidden',loggedIn);

        link.setAttribute('aria-hidden',loggedIn?'true':'false');

        link.tabIndex=loggedIn?-1:0;

    });

    if(window.vpnSyncMobileAccountNav) window.vpnSyncMobileAccountNav();

}



function vpnDetectIpCountry() {

    return fetch('https://ip-api.com/json/?fields=status,countryCode,city')

      .then(function(r) { return r.json(); })

      .then(function(data) {

        if (data.status === 'success') {

          var country = (data.countryCode || '').toUpperCase();

          var city = (data.city || '').toLowerCase();

          localStorage.setItem('vpnexues_detected_country', country);

          localStorage.setItem('vpnexues_detected_city', city);

          return { country: country, city: city };

        }

        return { country: '', city: '' };

      })

      .catch(function() { return { country: '', city: '' }; });

}



var _flagMap = {in:'in-flag.svg',us:'us flag.png',sg:'sg-flag.png',ae:'uae flag.png',gb:'us flag.png',au:'us flag.png',my:'sg-flag.png',sa:'uae flag.png'};

var _flagBase = 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets';

function _localFlag(code){ var f=_flagMap[code]; return f ? _flagBase+'/'+encodeURIComponent(f) : _flagBase+'/in-flag.svg'; }



function vpnSyncLoginCountryCode(countryCode) {

    var code = (countryCode || '').toUpperCase();

    if (!code) {

        try { code = VPNexuesCountry.getDetected() || VPNexuesCountry.get(); } catch(e) {}

        if (!code) code = localStorage.getItem('vpnexues_detected_country') || localStorage.getItem('country') || 'IN';

    }

    var phoneCfg = { phoneCode: '1', digits: 10, flag: 'us' };

    try {

        var pc = VPNexuesCountry.getPhoneConfig(code);

        phoneCfg = { phoneCode: pc.phoneCode, digits: pc.digits, flag: code.toLowerCase() };

    } catch(e) {

        var fallback = {

            IN: { phoneCode: '91', flag: 'in', digits: 10 },

            SG: { phoneCode: '65', flag: 'sg', digits: 8 },

            US: { phoneCode: '1', flag: 'us', digits: 10 },

            AE: { phoneCode: '971', flag: 'ae', digits: 9 },

            GB: { phoneCode: '44', flag: 'gb', digits: 10 },

            AU: { phoneCode: '61', flag: 'au', digits: 9 },

            MY: { phoneCode: '60', flag: 'my', digits: 10 },

            SA: { phoneCode: '966', flag: 'sa', digits: 9 },

            CA: { phoneCode: '1', flag: 'ca', digits: 10 },

            DE: { phoneCode: '49', flag: 'de', digits: 11 },

            FR: { phoneCode: '33', flag: 'fr', digits: 9 },

            JP: { phoneCode: '81', flag: 'jp', digits: 10 },

            CN: { phoneCode: '86', flag: 'cn', digits: 11 },

            BR: { phoneCode: '55', flag: 'br', digits: 11 },

            MX: { phoneCode: '52', flag: 'mx', digits: 10 }

        };

        phoneCfg = fallback[code] || fallback.IN;

    }

    [['vpnLogin', 'login'], ['vpnSignup', 'signup']].forEach(function(pair) {

        var prefix = pair[0];

        var hidden = document.getElementById(prefix + 'CountryCode');

        var codeSpan = document.getElementById(prefix + 'PhoneCode');

        var flag = document.getElementById(prefix + 'Flag');

        var phone = document.getElementById(prefix + 'Phone');

        if (hidden) { hidden.value = phoneCfg.phoneCode; hidden.setAttribute('data-flag', phoneCfg.flag); hidden.setAttribute('data-digits', phoneCfg.digits); }

        if (codeSpan) codeSpan.textContent = '+' + phoneCfg.phoneCode;

        if (flag) flag.src = _localFlag(phoneCfg.flag);

        if (phone) { phone.maxLength = phoneCfg.digits; phone.value = ''; }

    });

}



function vpnGetSignupOfferAmount(countryCode) {

    var code = (countryCode || '').toUpperCase();

    if (!code) {

        try { code = VPNexuesCountry.getDetected() || VPNexuesCountry.get(); } catch(e) {}

        if (!code) code = localStorage.getItem('vpnexues_detected_country') || localStorage.getItem('country') || 'IN';

    }

    var baseInrOffer = 100;

    try {

        var inrRate = VPNexuesCountry.config.IN.rate || 62;

        var baseSgdOffer = baseInrOffer / inrRate;

        var config = VPNexuesCountry.config[code] || VPNexuesCountry.config.IN;

        var converted = baseSgdOffer * config.rate;

        return config.prefix + converted.toLocaleString(config.locale, {

            minimumFractionDigits: config.digits,

            maximumFractionDigits: config.digits

        });

    } catch(e) {

        var fallback = {

            IN: '\u20B9100',

            SG: 'S$1.61',

            US: '$1.19',

            AE: 'AED 4.39',

            GB: '\u00A30.95',

            AU: 'A$1.80',

            MY: 'RM5.50',

            SA: 'SAR 4.47',

            CA: 'C$1.60',

            DE: '\u20AC1.10',

            FR: '\u20AC1.10',

            JP: '\u00A5180',

            CN: '\u00A58.60',

            BR: 'R$5.90',

            MX: 'MX$20.00'

        };

        return fallback[code] || fallback.IN;

    }

}



function vpnSyncOfferContent(countryCode) {

    var amount = vpnGetSignupOfferAmount(countryCode);

    var modalAmount = document.getElementById('vpnAuthOfferAmount');

    var popupBadge = document.getElementById('authCouponBadge');

    var popupSubtitle = document.getElementById('authCouponSubtitle');

    var popupFeature = document.getElementById('authCouponFeature');

    var popupButton = document.getElementById('authCouponButton');



    if (modalAmount) modalAmount.textContent = amount + ' off';

    if (popupBadge) popupBadge.textContent = 'FLAT ' + amount + ' OFF';

    if (popupSubtitle) popupSubtitle.textContent = 'Sign up now and get ' + amount + ' off on your first order';

    if (popupFeature) popupFeature.textContent = amount + ' instant discount on first purchase';

    if (popupButton) popupButton.innerHTML = 'Sign up & get ' + amount + ' off <i class="far fa-arrow-right"></i>';

}



function vpnOpenModal(tab){

    if(vpnIsLoggedIn()){window.location.href='index.html';return;}

    vpnDetectIpCountry().then(function(result) {

        var code = result.country || localStorage.getItem('vpnexues_detected_country') || 'IN';

        vpnSyncLoginCountryCode(code);

        vpnSyncOfferContent(code);

        vpnLockPhonePrefix();

    });

    document.getElementById('vpnModal').classList.add('open');

    document.documentElement.classList.add('vpn-auth-open');

    vpnSwitchTab(tab||'login');

    document.body.style.overflow='hidden';

}



function vpnLockPhonePrefix() {

    ['vpnLogin', 'vpnSignup'].forEach(function(prefix) {

        var phoneInput = document.getElementById(prefix + 'Phone');

        var countrySpan = document.getElementById(prefix + 'CountryCode');

        var sendBtn = document.getElementById(prefix + 'SendOtpBtn');

        if (phoneInput) {

            phoneInput.addEventListener('keydown', function(e) {

                if (this.selectionStart === 0 && (e.key === 'Backspace' || e.key === 'Delete')) {

                    e.preventDefault();

                }

            });

        }

        if (countrySpan) {

            countrySpan.parentElement.style.pointerEvents = 'none';

            countrySpan.parentElement.style.opacity = '0.9';

            countrySpan.parentElement.style.cursor = 'not-allowed';

        }

        if (sendBtn) vpnSetButtonDisabled(sendBtn, true);

    });

    

    // Initialize button state based on current phone value

    setTimeout(function() {

        ['login', 'signup'].forEach(function(ctx) {

            var els = vpnGetAuthElements(ctx);

            if (els.phone && els.sendBtn) {

                var phone = vpnNormalizePhone(els.phone.value);

                if (phone && vpnIsValidPhone(phone)) {

                    vpnSetButtonDisabled(els.sendBtn, false);

                }

            }

        });

    }, 100);

}



function vpnCloseModal(){

    document.getElementById('vpnModal').classList.remove('open');

    document.documentElement.classList.remove('vpn-auth-open');

    document.body.style.overflow='';

}



function vpnSwitchTab(tab){

    var isLogin=tab==='login';

    document.getElementById('vpnLoginForm').classList.toggle('vpn-hidden',!isLogin);

    document.getElementById('vpnSignupForm').classList.toggle('vpn-hidden',isLogin);

    document.getElementById('vpnTabLogin').classList.toggle('active',isLogin);

    document.getElementById('vpnTabSignup').classList.toggle('active',!isLogin);

    var title = document.getElementById('vpnAuthTitle');

    var eyebrow = document.getElementById('vpnAuthEyebrow');

    var bannerTitle = document.getElementById('vpnAuthBannerTitle');

    var bannerCopy = document.getElementById('vpnAuthBannerCopy');

    var bannerOffer = document.getElementById('vpnAuthOffer');

    var offerAmount = vpnGetSignupOfferAmount();

    if (title) title.textContent = isLogin ? 'Login' : 'Sign Up';

    if (eyebrow) eyebrow.textContent = isLogin ? 'Welcome back' : 'Create account';

    if (bannerOffer) bannerOffer.classList.toggle('vpn-hidden', isLogin);

    if (bannerTitle) bannerTitle.innerHTML = isLogin ? 'Fresh Vegetables<br>Delivered Daily.' : 'Fresh savings for<br>your first order.';

    if (bannerCopy) bannerCopy.textContent = isLogin ? 'Order crisp greens, seasonal vegetables, and everyday essentials from trusted farms.' : 'New users get ' + offerAmount + ' off on their first order. Fresh produce, trusted delivery, simple checkout.';

    vpnClearAuthMessage('login');

    vpnClearAuthMessage('signup');

    vpnHideError('login');

    vpnHideError('signup');

    vpnSyncSignupCreateButton();

    

    // Validate phone for the newly shown tab

    var ctx = isLogin ? 'login' : 'signup';

    var els = vpnGetAuthElements(ctx);

    if (els.phone && els.sendBtn) {

        var phone = vpnNormalizePhone(els.phone.value);

        if (phone && vpnIsValidPhone(phone)) {

            vpnSetButtonDisabled(els.sendBtn, false);

        } else if (phone && phone.length > 0) {

            vpnSetButtonDisabled(els.sendBtn, true);

        }

    }

}



function vpnShowError(context, message) {

    var errEl = document.getElementById(context === 'signup' ? 'vpnSignupError' : 'vpnLoginError');

    if (errEl) {

        errEl.textContent = message;

        errEl.style.display = 'block';

    }

}



function vpnHideError(context) {

    var errEl = document.getElementById(context === 'signup' ? 'vpnSignupError' : 'vpnLoginError');

    if (errEl) {

        errEl.textContent = '';

        errEl.style.display = 'none';

    }

}



function vpnShowFieldError(inputEl, message) {

    if (!inputEl) return;

    vpnClearFieldError(inputEl);

    inputEl.style.borderColor = '#dc2626';

    var errDiv = document.createElement('div');

    errDiv.className = 'vpn-field-error';

    errDiv.textContent = message;

    errDiv.style.cssText = 'color:#dc2626;font-size:12px;margin-top:4px;font-weight:500;display:block;';

    var group = inputEl.closest('.vpn-input-group') || inputEl.parentNode;

    group.parentNode.insertBefore(errDiv, group.nextSibling);

}



function vpnClearFieldError(inputEl) {

    if (!inputEl) return;

    inputEl.style.borderColor = '';

    var group = inputEl.closest('.vpn-input-group') || inputEl.parentNode;

    var siblings = group.parentNode.children;

    for (var i = siblings.length - 1; i >= 0; i--) {

        if (siblings[i].classList && siblings[i].classList.contains('vpn-field-error')) {

            siblings[i].remove();

        }

    }

}



function vpnUpdateCountryFlag(context) {

    var prefix = context === 'signup' ? 'vpnSignup' : 'vpnLogin';

    var hidden = document.getElementById(prefix + 'CountryCode');

    var flag = document.getElementById(prefix + 'Flag');

    if (!hidden || !flag) return;

    var flagCode = hidden.getAttribute('data-flag') || 'in';

    flag.src = _localFlag(flagCode);

}



function vpnNormalizePhone(value) {

    return String(value || '').replace(/\D/g, '');

}



function vpnIsValidPhone(phone) {

    if (!phone || phone.length < 6) return false;

    var loginForm = document.getElementById('vpnLoginForm');

    var signupForm = document.getElementById('vpnSignupForm');

    var ctx = (signupForm && !signupForm.classList.contains('vpn-hidden')) ? 'signup' : 'login';

    var hidden = document.getElementById(ctx === 'signup' ? 'vpnSignupCountryCode' : 'vpnLoginCountryCode');

    var digits = hidden ? parseInt(hidden.getAttribute('data-digits') || '10', 10) : 10;

    var flag = hidden ? (hidden.getAttribute('data-flag') || 'in').toUpperCase() : 'IN';

    

    if (phone.length !== digits) return false;

    

var patterns = {

        'IN': /^[6-9]/,

        'SG': /^[89]/,

        'US': /^[2-9]/,

        'AE': /^[5]/,

        'GB': /^7/,

        'AU': /^4/,

        'MY': /^1/,

        'SA': /^5/,

        'CA': /^[2-9]/,

        'DE': /^1[5-7]/,

        'FR': /^[67]/,

        'JP': /^[7-9]/,

        'CN': /^1[3-9]/,

        'BR': /^9/,

        'MX': /^[1-9]/

    };

    

    var pattern = patterns[flag];

    if (pattern && !pattern.test(phone)) return false;

    

    return true;

}



function vpnGenerateOtp() {

    return String(Math.floor(100000 + Math.random() * 900000));

}



function vpnOtpKey(context) {

    return 'vpnOtp_' + context;

}



// OTP state is temporary and kept separate for login and signup flows.

function vpnReadOtpState(context) {

    var state = vpnReadJson(vpnOtpKey(context), null);

    return state && state.otp ? state : null;

}



function vpnSaveOtpState(context, state) {

    localStorage.setItem(vpnOtpKey(context), JSON.stringify(state));

}



function vpnClearOtpState(context) {

    localStorage.removeItem(vpnOtpKey(context));

    if (vpnOtpTimers[context]) {

        clearInterval(vpnOtpTimers[context]);

        vpnOtpTimers[context] = null;

    }

}



function vpnGetAuthElements(context) {

    var prefix = context === 'signup' ? 'vpnSignup' : 'vpnLogin';

    return {

        name: document.getElementById(prefix + 'Name'),

        email: document.getElementById(prefix + 'Email'),

        phone: document.getElementById(prefix + 'Phone'),

        countryCode: document.getElementById(prefix + 'CountryCode'),

        phoneCodeSpan: document.getElementById(prefix + 'PhoneCode'),

        otpGroup: document.getElementById(prefix + 'OtpGroup'),

        otp: document.getElementById(prefix + 'Otp'),

        password: document.getElementById(prefix + 'Password'),

        sendBtn: document.getElementById(prefix + 'SendOtpBtn'),

        verifyBtn: document.getElementById(prefix + 'VerifyOtpBtn'),

        resendBtn: document.getElementById(prefix + 'ResendOtpBtn'),

        message: document.getElementById(prefix + 'OtpMessage'),

        error: document.getElementById(prefix + 'Error'),

        createBtn: document.getElementById('vpnSignupCreateBtn')

    };

}



function vpnSetButtonDisabled(button, disabled) {

    if (!button) return;

    button.disabled = !!disabled;

    button.setAttribute('aria-disabled', disabled ? 'true' : 'false');

}



function vpnShowAuthMessage(context, message, type) {

    var messageNode = vpnGetAuthElements(context).message;

    if (!messageNode) {

        if (typeof showToast === 'function') showToast(message, type === 'error' ? 'error' : 'success');

        return;

    }

    messageNode.textContent = message;

    messageNode.className = 'vpn-form-sub vpn-otp-message';

    if (type === 'error') {

        messageNode.classList.add('vpn-error');

        messageNode.style.color = '#dc2626';

    } else if (type === 'success') {

        messageNode.classList.add('vpn-success');

        messageNode.style.color = '#16a34a';

    } else {

        messageNode.style.color = '#6b7280';

    }

    messageNode.classList.remove('vpn-hidden');

}



function vpnClearAuthMessage(context) {

    var messageNode = vpnGetAuthElements(context).message;

    if (!messageNode) return;

    messageNode.textContent = '';

    messageNode.classList.add('vpn-hidden');

}



function vpnSetOtpControlsVisible(context, visible) {

    var els = vpnGetAuthElements(context);

    [els.otpGroup, els.verifyBtn, els.resendBtn].forEach(function(element) {

        if (element) element.classList.toggle('vpn-hidden', !visible);

    });

    if (els.sendBtn) els.sendBtn.classList.toggle('vpn-hidden', visible);

}



function vpnResetOtpFlow(context) {

    var els = vpnGetAuthElements(context);

    vpnClearOtpState(context);

    vpnSetOtpControlsVisible(context, false);

    if (els.otp) {

        els.otp.value = '';

        els.otp.disabled = false;

    }

    if (els.sendBtn) vpnSetButtonDisabled(els.sendBtn, false);

    if (context === 'signup') vpnSyncSignupCreateButton();

}



function vpnStartOtpCountdown(context) {

    if (vpnOtpTimers[context]) clearInterval(vpnOtpTimers[context]);



    function renderCountdown() {

        var state = vpnReadOtpState(context);

        var els = vpnGetAuthElements(context);

        if (!state) {

            if (vpnOtpTimers[context]) clearInterval(vpnOtpTimers[context]);

            vpnOtpTimers[context] = null;

            return;

        }



        var now = Date.now();

        var resendSeconds = Math.max(0, Math.ceil((state.resendAt - now) / 1000));

        var isExpired = now > state.expiresAt;

        var isLocked = state.attempts >= VPN_MAX_OTP_ATTEMPTS;



        vpnSetOtpControlsVisible(context, true);

        if (els.resendBtn) {

            vpnSetButtonDisabled(els.resendBtn, resendSeconds > 0);

            els.resendBtn.textContent = resendSeconds > 0 ? 'Resend OTP in ' + resendSeconds + 's' : 'Resend OTP';

        }

        if (els.verifyBtn) vpnSetButtonDisabled(els.verifyBtn, isExpired || isLocked || state.verified);



        if (isExpired && !state.verified) {

            vpnShowError(context, 'OTP expired. Please resend OTP.');

            clearInterval(vpnOtpTimers[context]);

            vpnOtpTimers[context] = null;

        }

    }



    renderCountdown();

    vpnOtpTimers[context] = setInterval(renderCountdown, 1000);

}



function vpnSendOtp(context, isResend) {

    var els = vpnGetAuthElements(context);

    var phone = vpnNormalizePhone(els.phone && els.phone.value);

    var currentState = vpnReadOtpState(context);

    var now = Date.now();



    vpnClearAuthMessage(context);

    vpnHideError(context);



    if (context === 'signup' && (!els.name || !els.name.value.trim())) {

        vpnShowError(context, 'Please enter your full name.');

        return;

    }



    if (!vpnIsValidPhone(phone)) {

        var countryNames = {

            'IN': 'Indian', 'SG': 'Singaporean', 'US': 'US', 'AE': 'UAE',

            'GB': 'UK', 'AU': 'Australian', 'MY': 'Malaysian', 'SA': 'Saudi',

            'CA': 'Canadian', 'DE': 'German', 'FR': 'French', 'JP': 'Japanese',

            'CN': 'Chinese', 'BR': 'Brazilian', 'MX': 'Mexican'

        };

        var hidden = document.getElementById(context === 'signup' ? 'vpnSignupCountryCode' : 'vpnLoginCountryCode');

        var flag = hidden ? (hidden.getAttribute('data-flag') || 'in').toUpperCase() : 'IN';

        var countryName = countryNames[flag] || flag;

        var phoneCode = hidden ? hidden.value || '91' : '91';

        var digits = hidden ? hidden.getAttribute('data-digits') || '10' : '10';

        vpnShowError(context, 'Invalid ' + countryName + ' number. Please enter a valid ' + digits + '-digit ' + countryName + ' phone number registered in ' + countryName + '.');

        return;

    }



    if (context === 'login') {

        var existingUser = vpnFindUserByPhone(phone);

        if (!existingUser) {

            vpnShowFieldError(els.phone, 'This phone number is not registered. Please sign up first.');

            return;

        }

    }



    if (context === 'signup') {

        var email = els.email && els.email.value.trim();

        var existingPhone = vpnFindUserByPhone(phone);

        if (existingPhone) {

            vpnShowFieldError(els.phone, 'This phone number is already registered. Please login instead.');

            return;

        }

        if (email) {

            var existingEmail = vpnReadUsers().find(function(u) {

                return (u.email || '').toLowerCase() === email.toLowerCase();

            });

            if (existingEmail) {

                vpnShowFieldError(els.email, 'This email is already registered. Please login instead.');

                return;

            }

        }

    }



    if (currentState && currentState.phone === phone && currentState.resendAt > now) {

        vpnStartOtpCountdown(context);

        vpnShowError(context, 'Please wait before requesting another OTP.');

        return;

    }



    var otp = vpnGenerateOtp();

    var nextState = {

        phone: phone,

        otp: otp,

        expiresAt: now + VPN_OTP_VALIDITY_MS,

        resendAt: now + VPN_OTP_RESEND_MS,

        attempts: 0,

        verified: false

    };



    vpnSaveOtpState(context, nextState);

    vpnSetOtpControlsVisible(context, true);



    if (els.otp) {

        els.otp.value = '';

        els.otp.disabled = false;

        els.otp.focus();

    }

    if (els.verifyBtn) vpnSetButtonDisabled(els.verifyBtn, false);

    if (context === 'signup') vpnSyncSignupCreateButton();



    vpnShowAuthMessage(context, 'Demo OTP: ' + otp, 'success');

    vpnStartOtpCountdown(context);

}



function vpnVerifyOtp(context) {

    var els = vpnGetAuthElements(context);

    var state = vpnReadOtpState(context);

    var phone = vpnNormalizePhone(els.phone && els.phone.value);

    var enteredOtp = (els.otp && els.otp.value || '').trim();



    vpnClearAuthMessage(context);

    vpnHideError(context);



    if (!state || state.phone !== phone) {

        vpnShowError(context, 'Please send a new OTP for this phone number.');

        return;

    }



    if (Date.now() > state.expiresAt) {

        vpnShowError(context, 'OTP expired. Please resend OTP.');

        if (els.verifyBtn) vpnSetButtonDisabled(els.verifyBtn, true);

        return;

    }



    if (state.attempts >= VPN_MAX_OTP_ATTEMPTS) {

        vpnShowError(context, 'Maximum incorrect attempts reached. Please resend OTP.');

        if (els.verifyBtn) vpnSetButtonDisabled(els.verifyBtn, true);

        return;

    }



    if (!/^\d{6}$/.test(enteredOtp)) {

        vpnShowError(context, 'Please enter the 6-digit OTP.');

        return;

    }



    if (enteredOtp !== state.otp) {

        state.attempts += 1;

        vpnSaveOtpState(context, state);

        var remaining = VPN_MAX_OTP_ATTEMPTS - state.attempts;

        if (remaining <= 0) {

            vpnShowError(context, 'Invalid OTP. Maximum attempts reached. Please resend OTP.');

            if (els.verifyBtn) vpnSetButtonDisabled(els.verifyBtn, true);

        } else {

            vpnShowError(context, 'Invalid OTP. ' + remaining + ' attempt' + (remaining === 1 ? '' : 's') + ' remaining.');

        }

        return;

    }



    state.verified = true;

    vpnSaveOtpState(context, state);



    if (context === 'login') {

        var existingUser = vpnFindUserByPhone(phone);

        if (!existingUser) {

            vpnShowError(context, 'Account not found. Please sign up first.');

            return;

        }

        vpnStoreLogin(existingUser);

        vpnClearOtpState(context);

        vpnAfterAuth();

        return;

    }



    if (els.otp) els.otp.disabled = true;

    if (els.verifyBtn) vpnSetButtonDisabled(els.verifyBtn, true);

    if (els.resendBtn) els.resendBtn.classList.add('vpn-hidden');

    if (vpnOtpTimers[context]) {

        clearInterval(vpnOtpTimers[context]);

        vpnOtpTimers[context] = null;

    }

    vpnSyncSignupCreateButton();

    vpnShowAuthMessage(context, 'OTP verified. You can create your account now.', 'success');

}



function vpnReadUsers() {

    var users = vpnReadJson('users', []);

    return Array.isArray(users) ? users : [];

}



function vpnFindUserByPhone(phone) {

    return vpnReadUsers().find(function(user) {

        return vpnNormalizePhone(user && user.phone) === phone;

    }) || null;

}



function vpnSaveUser(user) {

    var users = vpnReadUsers();

    var existingIndex = users.findIndex(function(savedUser) {

        return vpnNormalizePhone(savedUser && savedUser.phone) === user.phone;

    });



    if (existingIndex >= 0) {

        users[existingIndex] = user;

    } else {

        users.push(user);

    }



    localStorage.setItem('users', JSON.stringify(users));

}



function vpnSyncSignupCreateButton() {

    var els = vpnGetAuthElements('signup');

    if (!els.createBtn) return;

    var state = vpnReadOtpState('signup');

    var phone = vpnNormalizePhone(els.phone && els.phone.value);

    var phoneValid = vpnIsValidPhone(phone);

    var canCreate = !!(phoneValid && state && state.verified && state.phone === phone);

    vpnSetButtonDisabled(els.createBtn, !canCreate);

}



function vpnHandleLogin() {

    vpnVerifyOtp('login');

}



function vpnHandleSignup(){

    var els = vpnGetAuthElements('signup');

    var name = els.name && els.name.value.trim();

    var email = els.email && els.email.value.trim();

    var phone = vpnNormalizePhone(els.phone && els.phone.value);

    var password = els.password && els.password.value;

    var state = vpnReadOtpState('signup');



    vpnClearAuthMessage('signup');

    vpnHideError('signup');



    if (!name || !email || !phone) {

        vpnShowError('signup', 'Please fill in all required fields.');

        return;

    }



    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        vpnShowError('signup', 'Please enter a valid email address.');

        return;

    }



    if (!vpnIsValidPhone(phone)) {

        vpnShowError('signup', 'Please enter a valid phone number.');

        return;

    }



    if (!state || state.phone !== phone) {

        vpnShowError('signup', 'Please send OTP before creating your account.');

        return;

    }



    if (!state.verified) {

        vpnVerifyOtp('signup');

        state = vpnReadOtpState('signup');

    }



    if (!state || !state.verified || state.phone !== phone) {

        return;

    }



    var existingUser = vpnFindUserByPhone(phone);

    if (existingUser) {

        vpnShowError('signup', 'Account already registered with this number. Please login instead.');

        return;

    }



    var user = {

        name: name,

        email: email,

        phone: phone,

        password: password || ''

    };



    vpnSaveUser(user);

    vpnStoreLogin({ name: name, email: email, phone: phone });

    vpnClearOtpState('signup');

    vpnAfterAuth();

}



function vpnStoreLogin(user){

    var profile = {

        name: user.name || 'VPNexues Customer',

        email: user.email || '',

        phone: vpnNormalizePhone(user.phone)

    };

    var loginCountry = (localStorage.getItem('vpnexues_detected_country') || localStorage.getItem('country') || 'IN').toUpperCase();

    localStorage.setItem('loggedInUser', JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone, isLoggedIn: true }));

    localStorage.setItem('vpnexuesAuth','true');

    localStorage.setItem('vpnexuesLoggedIn','true');

    localStorage.setItem('isLoggedIn','true');

    localStorage.setItem('vpnexuesSession','true');

    localStorage.setItem('vpnexuesUser',JSON.stringify(profile));

}



function vpnAfterAuth(){

    vpnCloseModal();

    vpnUpdateLoginButtons();

    window.location.href = 'index.html?r=' + Date.now();

}



function vpnInitializeAuthForms() {

    vpnSyncLoginCountryCode();

    vpnSyncOfferContent();

    vpnSyncSignupCreateButton();

    vpnUpdateCountryFlag('login');

    vpnUpdateCountryFlag('signup');

    ['login', 'signup'].forEach(function(context) {

        var els = vpnGetAuthElements(context);

        [els.name, els.email, els.phone, els.otp, els.password].forEach(function(input) {

            if (!input) return;

            input.addEventListener('input', function() {

                var state = vpnReadOtpState(context);

                if (input === els.phone && state && state.phone !== vpnNormalizePhone(input.value)) {

                    vpnResetOtpFlow(context);

                }

                vpnClearAuthMessage(context);

                vpnClearFieldError(input);

                if (context === 'signup') vpnSyncSignupCreateButton();

                

                if (input === els.phone) {

                    var phone = vpnNormalizePhone(input.value);

                    var hidden = document.getElementById(context === 'signup' ? 'vpnSignupCountryCode' : 'vpnLoginCountryCode');

                    var digits = hidden ? parseInt(hidden.getAttribute('data-digits') || '10', 10) : 10;

                    var flag = hidden ? (hidden.getAttribute('data-flag') || 'in').toUpperCase() : 'IN';

                    

                    if (phone.length > 0 && phone.length < digits) {

                        input.style.borderColor = '';

                        vpnClearFieldError(input);

                        if (els.sendBtn) vpnSetButtonDisabled(els.sendBtn, true);

                    }

                    

                    if (phone.length === digits) {

                        if (!vpnIsValidPhone(phone)) {

                            var countryNames = {

                                'IN': 'Indian', 'SG': 'Singaporean', 'US': 'US', 'AE': 'UAE',

                                'GB': 'UK', 'AU': 'Australian', 'MY': 'Malaysian', 'SA': 'Saudi',

                                'CA': 'Canadian', 'DE': 'German', 'FR': 'French', 'JP': 'Japanese',

                                'CN': 'Chinese', 'BR': 'Brazilian', 'MX': 'Mexican'

                            };

                            var countryName = countryNames[flag] || flag;

                            input.style.borderColor = '#dc2626';

                            vpnShowFieldError(input, 'Invalid ' + countryName + ' number. Please enter a valid ' + countryName + ' registered phone number.');

                            if (els.sendBtn) vpnSetButtonDisabled(els.sendBtn, true);

                        } else {

                            input.style.borderColor = '#16a34a';

                            vpnClearFieldError(input);

                            if (els.sendBtn) vpnSetButtonDisabled(els.sendBtn, false);

                        }

                    }

                }

            });

            

            if (els.phone) {

                els.phone.addEventListener('paste', function() {

                    var self = this;

                    setTimeout(function() {

                        var phone = vpnNormalizePhone(self.value);

                        var hidden = document.getElementById(context === 'signup' ? 'vpnSignupCountryCode' : 'vpnLoginCountryCode');

                        var digits = hidden ? parseInt(hidden.getAttribute('data-digits') || '10', 10) : 10;

                        var flag = hidden ? (hidden.getAttribute('data-flag') || 'in').toUpperCase() : 'IN';

                        

                        if (phone.length === digits && vpnIsValidPhone(phone)) {

                            self.style.borderColor = '#16a34a';

                            vpnClearFieldError(self);

                            if (els.sendBtn) vpnSetButtonDisabled(els.sendBtn, false);

                        } else if (phone.length > 0) {

                            self.style.borderColor = '#dc2626';

                            if (els.sendBtn) vpnSetButtonDisabled(els.sendBtn, true);

                        }

                    }, 0);

                });

            }

        });

    });

    

    // Fallback: periodic check to sync button state (handles autofill, browser password manager, etc.)

    setInterval(function() {

        ['login', 'signup'].forEach(function(ctx) {

            var els = vpnGetAuthElements(ctx);

            if (els.phone && els.sendBtn) {

                var phone = vpnNormalizePhone(els.phone.value);

                var isValid = phone && vpnIsValidPhone(phone);

                var isDisabled = els.sendBtn.disabled;

                if (isValid && isDisabled) {

                    vpnSetButtonDisabled(els.sendBtn, false);

                } else if (!isValid && phone.length > 0 && !isDisabled) {

                    vpnSetButtonDisabled(els.sendBtn, true);

                }

            }

        });

    }, 500);

}



document.getElementById('vpnModal').addEventListener('click',function(e){if(e.target===this)vpnCloseModal();});

document.addEventListener('keydown',function(e){if(e.key==='Escape')vpnCloseModal();});

document.addEventListener('DOMContentLoaded',function(){

    var params=new URLSearchParams(window.location.search);

    

    vpnDetectIpCountry().then(function(result) {

        var code = result.country || localStorage.getItem('vpnexues_detected_country') || 'IN';

        vpnSyncLoginCountryCode(code);

        vpnSyncOfferContent(code);

    });

    

    vpnInitializeAuthForms();

    vpnUpdateLoginButtons();

    window.addEventListener('resize',vpnUpdateLoginButtons);



    /* Listen for country changes (GeoIP / manual) and sync login page */

    document.addEventListener('vpn-country-price-change', function(e) {

        var code = (e.detail && e.detail.country) || localStorage.getItem('vpnexues_detected_country') || localStorage.getItem('country') || 'IN';

        vpnSyncLoginCountryCode(code);

        vpnSyncOfferContent(code);

        if (!document.getElementById('vpnSignupForm').classList.contains('vpn-hidden')) vpnSwitchTab('signup');

    });



    /* Also sync on storage change (another tab changes country) */

    window.addEventListener('storage', function(e) {

        if ((e.key === 'country' || e.key === 'vpnexues_detected_country') && e.newValue) {

            vpnSyncLoginCountryCode(e.newValue);

            vpnSyncOfferContent(e.newValue);

            if (!document.getElementById('vpnSignupForm').classList.contains('vpn-hidden')) vpnSwitchTab('signup');

        }

    });



    if(params.get('login')==='1'){

        if(vpnIsLoggedIn()){window.location.href=params.get('redirect')||'index.html';return;}

        vpnOpenModal('login');

    }

    if(params.get('menu')==='open'){

        setTimeout(function(){

            var catBtn=document.querySelector('.nav-categories');

            if(catBtn)catBtn.click();

        },400);

        history.replaceState(null,'',window.location.pathname);

    }

    vpnCheckShowPopup();

});

/* -- Account nav guard -- */

  (function(){

    var acct = document.getElementById('navBottomAccount');

    if (!acct) return;

    acct.addEventListener('click', function(e){

      var loggedIn = false;

      try {

        loggedIn = (typeof isVpnUserLoggedIn === 'function' && isVpnUserLoggedIn()) ||

                   localStorage.getItem('vpnexuesAuth') === 'true' ||

                   localStorage.getItem('vpnexuesLoggedIn') === 'true' ||

                   localStorage.getItem('isLoggedIn') === 'true' ||

                   sessionStorage.getItem('vpnexuesAuth') === 'true' ||

                   sessionStorage.getItem('vpnexuesLoggedIn') === 'true' ||

                   sessionStorage.getItem('isLoggedIn') === 'true';

      } catch(err){}

      if (!loggedIn) {

        e.preventDefault();

        if (typeof vpnOpenModal === 'function') {

          vpnOpenModal('login');

        } else {

          window.location.href = 'index.html?login=1';

        }

      }

    });

  })();

/* -- Cart badge update -- */

  (function() {

    function updateCartBadge() {

      var badge = document.getElementById("nav-cart-badge");

      var hBadge = document.getElementById("header-cart-badge");

      var cart = JSON.parse(localStorage.getItem("cart") || "[]");

      var count = 0;

      cart.forEach(function(item) { count += (item.qty || item.quantity || 1); });

      if (badge) {

        if (count > 0) {

          badge.textContent = count;

          badge.style.display = "";

        } else {

          badge.style.display = "none";

        }

      }

      if (hBadge) {

        if (count > 0) {

          hBadge.textContent = count;

          hBadge.style.display = "";

        } else {

          hBadge.style.display = "none";

        }

      }

    }

    updateCartBadge();

    window.updateCartBadge = updateCartBadge;

  })();

/* -- Broken image hide + Nav sync + fixNav -- */
document.addEventListener("error",function(e){if(e.target.tagName==="IMG"){e.target.style.setProperty("display","none","important");var c=e.target.closest(".bb-item-img,.box-icon-only,.bb-mobile-image-wrap,.sb-mobile-product-card,.prd-img,.product-image,.image-box");if(c){c.classList.add("img-load-failed");var ic=c.querySelector(".box-product-icon");if(ic){ic.style.setProperty("display","flex","important");ic.style.alignItems="center";ic.style.justifyContent="center";ic.style.width="100%";ic.style.height="100%";ic.style.fontSize="44px";}}}},true);

document.addEventListener('DOMContentLoaded',function(){var isLoggedIn=localStorage.getItem('vpnexuesAuth')==='true';var btn=document.getElementById('navLoginBtn');var acc=document.getElementById('navAccountBtn');if(btn&&acc){if(isLoggedIn){btn.style.display='none';acc.style.display='inline-flex';}else{btn.style.display='inline-flex';acc.style.display='none';}}});

document.addEventListener('DOMContentLoaded',function(){if(window.vpnSyncNavbarLogin)window.vpnSyncNavbarLogin();});

function fixNav(){var l=document.getElementById("navLoginBtn"),a=document.getElementById("navAccountBtn");if(!l||!a)return;try{var ok=(typeof isVpnUserLoggedIn==="function"&&isVpnUserLoggedIn());l.style.display=ok?"none":"";a.style.display=ok?"":"none";}catch(e){l.style.display="";a.style.display="none";}}