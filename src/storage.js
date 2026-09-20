const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');
const DISSERTATIONS_FILE = path.join(DATA_DIR, 'dissertations.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

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

// Derive the university result from evaluation state
function deriveUniversityResult(d) {
  const evalResult = (d.evaluationResult || '').toLowerCase();
  const evalStatus = (d.evaluationStatus || '').toLowerCase();
  if (evalResult === 'approved' || evalStatus === 'approved') return 'Eligible';
  if (evalResult === 'rejected' || evalStatus === 'rejected') return 'Withheld';
  return 'Pending';
}

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

  // Pending dissertations (topicStatus = Pending)
  getPendingDissertations: () =>
    readJson(DISSERTATIONS_FILE).filter(
      (d) => d.topicStatus === 'Pending' || d.status === 'Pending Review'
    ),

  // Dissertations by guide
  getDissertationsByGuideId: (guideId) =>
    readJson(DISSERTATIONS_FILE).filter((d) => d.guideId === guideId),

  // Count students assigned to a guide
  getStudentCountForGuide: (guideId) =>
    readJson(USERS_FILE).filter(
      (u) => u.role === 'student' && u.guideId === guideId
    ).length,

  // Search dissertations by student name or topic title (case-insensitive)
  searchDissertations: (query) => {
    if (!query) return [];
    const q = query.trim().toLowerCase();
    return readJson(DISSERTATIONS_FILE).filter((d) => {
      return (
        (d.studentName && d.studentName.toLowerCase().includes(q)) ||
        (d.topicTitle && d.topicTitle.toLowerCase().includes(q)) ||
        (d.category && d.category.toLowerCase().includes(q)) ||
        (d.domain && d.domain.toLowerCase().includes(q)) ||
        (d.department && d.department.toLowerCase().includes(q))
      );
    });
  },

  // Duplicate title check
  isTopicTitleDuplicate: (title) => {
    if (!title) return false;
    const normalized = title.trim().toLowerCase();
    const topics = readJson(TOPICS_FILE);
    if (topics.some((t) => t.title && t.title.trim().toLowerCase() === normalized)) return true;
    const dissertations = readJson(DISSERTATIONS_FILE);
    return dissertations.some(
      (d) => d.topicTitle && d.topicTitle.trim().toLowerCase() === normalized
    );
  },

  // University result helper
  deriveUniversityResult,

  // ID generators
  generateTopicId: () => {
    const topics = readJson(TOPICS_FILE);
    const max = topics.reduce((m, t) => {
      const n = t.id ? parseInt((t.id.match(/\d+/) || ['0'])[0], 10) : 0;
      return n > m ? n : m;
    }, 0);
    return `TOP${String(max + 1).padStart(3, '0')}`;
  },

  generateDissertationId: () => {
    const d = readJson(DISSERTATIONS_FILE);
    const max = d.reduce((m, x) => {
      const n = x.id ? parseInt((x.id.match(/\d+/) || ['0'])[0], 10) : 0;
      return n > m ? n : m;
    }, 0);
    return `DIS${String(max + 1).padStart(3, '0')}`;
  }
};

module.exports = Storage;
