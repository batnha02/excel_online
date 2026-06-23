const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(INDEX_FILE)) fs.writeFileSync(INDEX_FILE, '[]', 'utf8');

function readIndex() {
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
}

function writeIndex(index) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
}

function dataPath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

const db = {
  list() {
    return readIndex().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },

  insert(id, name, sheets) {
    const now = new Date().toISOString();
    const entry = { id, name, created_at: now, updated_at: now };
    const index = readIndex();
    index.push(entry);
    writeIndex(index);
    fs.writeFileSync(dataPath(id), JSON.stringify(sheets), 'utf8');
  },

  get(id) {
    const index = readIndex();
    const entry = index.find((f) => f.id === id);
    if (!entry) return null;
    const sheets = JSON.parse(fs.readFileSync(dataPath(id), 'utf8'));
    return { ...entry, sheets };
  },

  update(id, sheets) {
    const index = readIndex();
    const i = index.findIndex((f) => f.id === id);
    if (i === -1) return false;
    index[i].updated_at = new Date().toISOString();
    writeIndex(index);
    fs.writeFileSync(dataPath(id), JSON.stringify(sheets), 'utf8');
    return true;
  },

  delete(id) {
    const index = readIndex();
    const i = index.findIndex((f) => f.id === id);
    if (i === -1) return false;
    index.splice(i, 1);
    writeIndex(index);
    if (fs.existsSync(dataPath(id))) fs.unlinkSync(dataPath(id));
    return true;
  },
};

module.exports = db;
