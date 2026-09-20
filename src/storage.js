const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');
const DISSERTATIONS_FILE = path.join(DATA_DIR, 'dissertations.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Generic file reader
function readJson(filePath, defaultValue = []) {
  ensureDataDir();
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
}

// Generic file writer
function writeJson(filePath, data) {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// Data Store Accessors
const Storage = {
  // Users
  getUsers: () => readJson(USERS_FILE),
  saveUsers: (data) => writeJson(USERS_FILE, data),
  getStudents: () => readJson(USERS_FILE).filter((u) => u.role === 'student'),
  getGuides: () => readJson(USERS_FILE).filter((u) => u.role === 'guide'),
  getUserById: (id) => readJson(USERS_FILE).find((u) => u.id === id),

  // Topics
  getTopics: () => readJson(TOPICS_FILE),
  saveTopics: (data) => writeJson(TOPICS_FILE, data),
  getTopicById: (id) => readJson(TOPICS_FILE).find((t) => t.id === id),
  getAvailableTopics: () => readJson(TOPICS_FILE).filter((t) => t.status === 'Available'),

  // Dissertations
  getDissertations: () => readJson(DISSERTATIONS_FILE),
  saveDissertations: (data) => writeJson(DISSERTATIONS_FILE, data),
  getDissertationByStudentId: (studentId) =>
    readJson(DISSERTATIONS_FILE).find((d) => d.studentId === studentId),
  getDissertationById: (id) =>
    readJson(DISSERTATIONS_FILE).find((d) => d.id === id),
  getPendingDissertations: () =>
    readJson(DISSERTATIONS_FILE).filter((d) => d.status === 'Pending Review'),

  // Duplicate Check Helper
  // Checks if a topic title already exists across registered topics or proposed dissertations (case-insensitive)
  isTopicTitleDuplicate: (title) => {
    if (!title) return false;
    const normalized = title.trim().toLowerCase();
    
    const topics = readJson(TOPICS_FILE);
    const hasInTopics = topics.some(
      (t) => t.title && t.title.trim().toLowerCase() === normalized
    );
    if (hasInTopics) return true;

    const dissertations = readJson(DISSERTATIONS_FILE);
    const hasInDissertations = dissertations.some(
      (d) => d.topicTitle && d.topicTitle.trim().toLowerCase() === normalized
    );
    return hasInDissertations;
  },

  // Generate unique IDs
  generateTopicId: () => {
    const topics = readJson(TOPICS_FILE);
    const maxNum = topics.reduce((max, t) => {
      const match = t.id && t.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    return `TOP${String(maxNum + 1).padStart(3, '0')}`;
  },

  generateDissertationId: () => {
    const dissertations = readJson(DISSERTATIONS_FILE);
    const maxNum = dissertations.reduce((max, d) => {
      const match = d.id && d.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    return `DIS${String(maxNum + 1).padStart(3, '0')}`;
  }
};

module.exports = Storage;
