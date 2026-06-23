const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { xlsxToFortuneSheet, fortuneSheetToXlsx } = require('../utils/excel');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// List all files
router.get('/', (req, res) => {
  res.json(db.list());
});

// Upload Excel file
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const sheets = xlsxToFortuneSheet(req.file.buffer);
    const id = uuidv4();
    const name = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    db.insert(id, name, sheets);
    res.json({ id, name, sheets });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to parse file: ' + err.message });
  }
});

// Create blank spreadsheet
router.post('/new', (req, res) => {
  const { name = 'Untitled.xlsx' } = req.body;
  const id = uuidv4();
  const sheets = [
    {
      name: 'Sheet1',
      id: '1',
      status: 1,
      order: 0,
      celldata: [],
      row: 100,
      column: 26,
      config: {},
    },
  ];

  db.insert(id, name, sheets);
  res.json({ id, name, sheets });
});

// Get file data
router.get('/:id', (req, res) => {
  const file = db.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  res.json({ id: file.id, name: file.name, sheets: file.sheets });
});

// Save file changes
router.put('/:id', (req, res) => {
  const { sheets } = req.body;
  if (!sheets) return res.status(400).json({ error: 'Missing sheets data' });

  const ok = db.update(req.params.id, sheets);
  if (!ok) return res.status(404).json({ error: 'File not found' });
  res.json({ success: true });
});

// Download as Excel
router.get('/:id/download', (req, res) => {
  const file = db.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const buffer = fortuneSheetToXlsx(file.sheets);
  const safeName = file.name.replace(/[<>:"/\\|?*]/g, '_');

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.send(buffer);
});

// Delete file
router.delete('/:id', (req, res) => {
  const ok = db.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'File not found' });
  res.json({ success: true });
});

module.exports = router;
