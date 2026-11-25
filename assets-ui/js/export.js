/* VPNexues Export
 * Shared CSV / Excel / print helpers used by dashboard reports.
 * Provides ExportManager plus window-level aliases exportToCSV/exportToExcel/printView.
 */
(function () {
  'use strict';

  function csvCell(v) {
    var s = String(v == null ? '' : v);
    if (/[",\n]/.test(s)) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function buildCSV(columns, rows) {
    var lines = [columns.map(csvCell).join(',')];
    rows.forEach(function (row) {
      var vals = [];
      columns.forEach(function (_, i) { vals.push(csvCell(row[i])); });
      lines.push(vals.join(','));
    });
    return lines.join('\n');
  }

  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var ExportManager = {
    exportCSV: function (opts) {
      opts = opts || {};
      var columns = opts.columns || [];
      var rows = opts.rows || [];
      var csv = buildCSV(columns, rows);
      download(opts.filename || 'export.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8');
    },

    exportExcel: function (opts) {
      opts = opts || {};
      var columns = opts.columns || [];
      var rows = opts.rows || [];
      var html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1">';
      html += '<tr>' + columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
      rows.forEach(function (row) {
        html += '<tr>' + columns.map(function (_, i) { return '<td>' + esc(row[i]) + '</td>'; }).join('') + '</tr>';
      });
      html += '</table></body></html>';
      var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = opts.filename || 'export.xls';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    printView: function (opts) {
      opts = opts || {};
      var columns = opts.columns || [];
      var rows = opts.rows || [];
      var html = '<html><head><title>' + esc(opts.title || 'Report') + '</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>';
      html += '<h2>' + esc(opts.title || 'Report') + '</h2><table><thead><tr>' + columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
      rows.forEach(function (row) {
        html += '<tr>' + columns.map(function (_, i) { return '<td>' + esc(row[i]) + '</td>'; }).join('') + '</tr>';
      });
      html += '</tbody></table></body></html>';
      var win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.print();
      }
    }
  };

  window.ExportManager = ExportManager;
  window.exportToCSV = function (opts) { ExportManager.exportCSV(opts || {}); };
  window.exportToExcel = function (opts) { ExportManager.exportExcel(opts || {}); };
  window.printView = function (opts) { ExportManager.printView(opts || {}); };
})();