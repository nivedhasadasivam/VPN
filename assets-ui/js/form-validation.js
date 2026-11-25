/* VPNexues FormValidation
 * Generic, defensive client-side form validation.
 * Provides FormValidator.validate and window.validateForm, plus auto-binding
 * for forms that opt in with data-validate.
 */
(function () {
  'use strict';

  function fieldName(el) {
    return el.name || el.id || '';
  }

  function rulesFor(el, formRules) {
    if (!formRules) return null;
    var name = fieldName(el);
    return formRules[name] || null;
  }

  var DEFAULT_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: function (v) { return String(v).trim().length > 0; },
    min: function (v, n) { return String(v).trim().length >= n; },
    number: function (v) { return v === '' || !isNaN(Number(v)); }
  };

  var FormValidator = {
    validate: function (formOrId, rules) {
      var form = typeof formOrId === 'string' ? document.getElementById(formOrId) : formOrId;
      if (!form) return { valid: false, errors: {} };
      var errors = {};
      var fields = form.querySelectorAll('input, select, textarea');
      var valid = true;

      fields.forEach(function (el) {
        var r = rulesFor(el, rules);
        if (!r) return;
        var value = el.value;
        if (r.required && !DEFAULT_RULES.required(value)) {
          errors[fieldName(el)] = r.message || 'This field is required';
          valid = false;
          return;
        }
        if (value && r.email && !DEFAULT_RULES.email.test(value)) {
          errors[fieldName(el)] = r.emailMessage || 'Enter a valid email address';
          valid = false;
          return;
        }
        if (r.min && value && !DEFAULT_RULES.min(value, r.min)) {
          errors[fieldName(el)] = r.message || 'Too short';
          valid = false;
          return;
        }
        if (r.number && value && !DEFAULT_RULES.number(value)) {
          errors[fieldName(el)] = r.numberMessage || 'Enter a valid number';
          valid = false;
        }
      });

      return { valid: valid, errors: errors };
    },

    clearErrors: function (formOrId) {
      var form = typeof formOrId === 'string' ? document.getElementById(formOrId) : formOrId;
      if (!form) return;
      form.querySelectorAll('.validation-error').forEach(function (el) { el.remove(); });
      form.querySelectorAll('.field-error').forEach(function (el) { el.classList.remove('field-error'); });
    },

    showErrors: function (formOrId, errors) {
      var form = typeof formOrId === 'string' ? document.getElementById(formOrId) : formOrId;
      if (!form) return;
      var self = this;
      Object.keys(errors).forEach(function (name) {
        var el = form.querySelector('[name="' + name + '"], #' + name);
        if (!el) return;
        el.classList.add('field-error');
        var err = document.createElement('div');
        err.className = 'validation-error';
        err.style.cssText = 'color:#EF4444;font-size:12px;margin-top:4px';
        err.textContent = errors[name];
        el.parentNode.appendChild(err);
      });
    },

    autoBind: function () {
      document.querySelectorAll('form[data-validate]').forEach(function (form) {
        if (form.dataset.validated) return;
        form.dataset.validated = '1';
        var rules = null;
        try { rules = JSON.parse(form.getAttribute('data-rules') || 'null'); } catch (e) {}
        form.addEventListener('submit', function (e) {
          var result = FormValidator.validate(form, rules);
          FormValidator.clearErrors(form);
          if (!result.valid) {
            e.preventDefault();
            FormValidator.showErrors(form, result.errors);
            var first = form.querySelector('.field-error');
            if (first && first.focus) first.focus();
          }
        });
      });
    }
  };

  window.FormValidator = FormValidator;

  window.validateForm = function (formOrId, rules) {
    var result = FormValidator.validate(formOrId, rules || {});
    FormValidator.clearErrors(formOrId);
    if (!result.valid) {
      FormValidator.showErrors(formOrId, result.errors);
      if (typeof window.showToast === 'function') {
        window.showToast('Please fix the highlighted fields');
      }
    }
    return result.valid;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { FormValidator.autoBind(); });
  } else {
    FormValidator.autoBind();
  }
})();