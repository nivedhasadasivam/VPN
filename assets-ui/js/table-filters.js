/* VPNexues TableFilters
 * Generic, defensive table filtering utilities.
 * Provides TableFilters.searchRows/filterRows plus auto-binding for
 * elements that opt in with data-table-filter / data-table-rows.
 */
(function () {
  'use strict';

  function toEl(sel) {
    return typeof sel === 'string' ? document.getElementById(sel.replace(/^#/, '')) || document.querySelector(sel) : sel;
  }

  var TableFilters = {
    /* filter rows by text across a set of columns (0-based indices; empty = all) */
    searchRows: function (input, tbodySelector, columns) {
      var inputEl = toEl(input);
      var tbody = toEl(tbodySelector);
      if (!inputEl || !tbody) return;
      var q = (inputEl.value || '').toLowerCase();
      var rows = tbody.querySelectorAll('tr');
      rows.forEach(function (row) {
        if (row.classList && row.classList.contains('no-filter-result')) return;
        if (!q) { row.style.display = ''; return; }
        var hay = '';
        if (columns && columns.length) {
          columns.forEach(function (i) {
            var cell = row.children[i];
            if (cell) hay += ' ' + (cell.textContent || '');
          });
        } else {
          hay = (row.textContent || '');
        }
        row.style.display = hay.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
      });
    },

    /* filter rows where dataset[attr] matches value (or 'all') */
    filterBy: function (attr, value, tbodySelector) {
      var tbody = toEl(tbodySelector);
      if (!tbody) return;
      tbody.querySelectorAll('tr').forEach(function (row) {
        var v = row.getAttribute('data-' + attr);
        row.style.display = (value === 'all' || v === value) ? '' : 'none';
      });
    },

    /* generic binding: input[data-table-filter] + tbody[data-table-rows] */
    autoBind: function () {
      document.querySelectorAll('input[data-table-filter]').forEach(function (input) {
        if (input.dataset.bound) return;
        input.dataset.bound = '1';
        var tbody = document.querySelector(input.getAttribute('data-table-rows') || '#tableBody');
        if (!tbody) return;
        input.addEventListener('input', function () {
          TableFilters.searchRows(input, tbody, []);
        });
      });
    }
  };

  window.TableFilters = TableFilters;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { TableFilters.autoBind(); });
  } else {
    TableFilters.autoBind();
  }
})();