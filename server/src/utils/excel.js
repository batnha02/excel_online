const XLSX = require('xlsx');

function xlsxToFortuneSheet(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellStyles: true, cellFormula: true });

  return workbook.SheetNames.map((name, index) => {
    const ws = workbook.Sheets[name];
    const ref = ws['!ref'];

    if (!ref) {
      return {
        name,
        id: String(index + 1),
        status: index === 0 ? 1 : 0,
        order: index,
        celldata: [],
        row: 100,
        column: 26,
        config: {},
      };
    }

    const range = XLSX.utils.decode_range(ref);
    const celldata = [];

    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (!cell || cell.v === undefined) continue;

        let t = 'g';
        if (cell.t === 'n') t = 'n';
        else if (cell.t === 'b') t = 'b';
        else if (cell.t === 'd') t = 'd';

        const v = {
          v: cell.v,
          m: cell.w || String(cell.v),
          t,
        };
        if (cell.f) v.f = '=' + cell.f;

        celldata.push({ r, c, v });
      }
    }

    // Handle merged cells
    const merges = {};
    if (ws['!merges']) {
      ws['!merges'].forEach((merge, i) => {
        const key = `${merge.s.r}_${merge.s.c}`;
        merges[key] = {
          r: merge.s.r,
          c: merge.s.c,
          rs: merge.e.r - merge.s.r + 1,
          cs: merge.e.c - merge.s.c + 1,
        };
      });
    }

    // Column widths and hidden state
    const columnlen = {};
    const colhidden = {};
    if (ws['!cols']) {
      ws['!cols'].forEach((col, i) => {
        if (col && col.hidden) colhidden[i] = 1;
        if (col && col.wpx) columnlen[i] = col.wpx;
        else if (col && col.wch) columnlen[i] = Math.round(col.wch * 8);
      });
    }

    // Row heights and hidden state
    const rowlen = {};
    const rowhidden = {};
    if (ws['!rows']) {
      ws['!rows'].forEach((row, i) => {
        if (row && row.hidden) rowhidden[i] = 1;
        if (row && row.hpx) rowlen[i] = row.hpx;
      });
    }

    return {
      name,
      id: String(index + 1),
      status: index === 0 ? 1 : 0,
      order: index,
      celldata,
      row: Math.max(range.e.r + 20, 100),
      column: Math.max(range.e.c + 5, 26),
      config: {
        merge: Object.keys(merges).length ? merges : undefined,
        columnlen: Object.keys(columnlen).length ? columnlen : undefined,
        rowlen: Object.keys(rowlen).length ? rowlen : undefined,
        colhidden: Object.keys(colhidden).length ? colhidden : undefined,
        rowhidden: Object.keys(rowhidden).length ? rowhidden : undefined,
      },
    };
  });
}

function fortuneSheetToXlsx(sheets) {
  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const wsData = {};
    let maxR = 0;
    let maxC = 0;

    (sheet.celldata || []).forEach(({ r, c, v }) => {
      if (!v || (v.v === undefined && !v.f)) return;

      const addr = XLSX.utils.encode_cell({ r, c });
      let cellType = 's';
      if (v.t === 'n') cellType = 'n';
      else if (v.t === 'b') cellType = 'b';
      else if (v.t === 'd') cellType = 'd';
      else if (typeof v.v === 'number') cellType = 'n';
      else if (typeof v.v === 'boolean') cellType = 'b';

      wsData[addr] = { v: v.v, t: cellType };
      if (v.f) wsData[addr].f = v.f.replace(/^=/, '');

      maxR = Math.max(maxR, r);
      maxC = Math.max(maxC, c);
    });

    if (Object.keys(wsData).length > 0) {
      wsData['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
    }

    // Restore merges
    if (sheet.config && sheet.config.merge) {
      wsData['!merges'] = Object.values(sheet.config.merge).map((m) => ({
        s: { r: m.r, c: m.c },
        e: { r: m.r + m.rs - 1, c: m.c + m.cs - 1 },
      }));
    }

    // Restore column widths and hidden state
    if (sheet.config && (sheet.config.columnlen || sheet.config.colhidden)) {
      const cols = [];
      for (let i = 0; i <= maxC; i++) {
        const colInfo = {};
        if (sheet.config.columnlen && sheet.config.columnlen[i]) colInfo.wpx = sheet.config.columnlen[i];
        if (sheet.config.colhidden && sheet.config.colhidden[i]) colInfo.hidden = true;
        cols.push(Object.keys(colInfo).length ? colInfo : null);
      }
      wsData['!cols'] = cols;
    }

    // Restore row heights and hidden state
    if (sheet.config && (sheet.config.rowlen || sheet.config.rowhidden)) {
      const rows = [];
      for (let i = 0; i <= maxR; i++) {
        const rowInfo = {};
        if (sheet.config.rowlen && sheet.config.rowlen[i]) rowInfo.hpx = sheet.config.rowlen[i];
        if (sheet.config.rowhidden && sheet.config.rowhidden[i]) rowInfo.hidden = true;
        rows.push(Object.keys(rowInfo).length ? rowInfo : null);
      }
      wsData['!rows'] = rows;
    }

    XLSX.utils.book_append_sheet(wb, wsData, sheet.name || `Sheet${wb.SheetNames.length + 1}`);
  });

  if (wb.SheetNames.length === 0) {
    XLSX.utils.book_append_sheet(wb, {}, 'Sheet1');
  }

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { xlsxToFortuneSheet, fortuneSheetToXlsx };
