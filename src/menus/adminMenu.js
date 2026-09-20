const Storage = require('../storage');
const { ask, pause, printHeader, printSubHeader, printDivider } = require('../utils');

const MAX_STUDENTS_PER_GUIDE = 5;

// ── 1. Add Dissertation Topic ─────────────────────────────────────────────────
async function addTopic() {
  printSubHeader('ADD NEW DISSERTATION TOPIC');
  const title = await ask('Enter Topic Title: ');
  if (!title) { console.log('[!] Title cannot be empty.'); await pause(); return; }

  if (Storage.isTopicTitleDuplicate(title)) {
    console.log('\n' + '!'.repeat(55));
    console.log(' [!] TOPIC DUPLICATION PREVENTED');
    console.log(' A topic with this title already exists.');
    console.log('!'.repeat(55));
    await pause();
    return;
  }

  const department = await ask('Department: ');
  const domain = await ask('Research Domain / Thrust Area: ');
  const description = await ask('Description / Objectives: ');

  const topics = Storage.getTopics();
  const id = Storage.generateTopicId();
  topics.push({
    id,
    title: title.trim(),
    department: department.trim() || 'General',
    domain: domain.trim() || 'General',
    description: description.trim() || 'Departmental research topic.',
    status: 'Available',
    addedBy: 'Admin',
    createdAt: new Date().toISOString().split('T')[0]
  });
  Storage.saveTopics(topics);
  console.log(`\n[✓] Topic "${title}" added as ${id}.`);
  await pause();
}

// ── 2. View All Topics ────────────────────────────────────────────────────────
async function viewAllTopics() {
  printSubHeader('ALL DISSERTATION TOPICS');
  const topics = Storage.getTopics();
  if (topics.length === 0) { console.log('No topics registered.'); await pause(); return; }
  console.log(`Total: ${topics.length}\n`);
  topics.forEach((t) => {
    console.log(`[${t.id}] ${t.title}`);
    console.log(`  • Dept  : ${t.department} | Domain: ${t.domain}`);
    console.log(`  • Status: [ ${t.status} ] | Added: ${t.createdAt}`);
    printDivider('-', 55);
  });
  await pause();
}

// ── 3. View Students ──────────────────────────────────────────────────────────
async function viewStudents() {
  printSubHeader('REGISTERED PG STUDENTS');
  const students = Storage.getStudents();
  const dissertations = Storage.getDissertations();
  if (students.length === 0) { console.log('No students registered.'); await pause(); return; }
  console.log(`Total: ${students.length}\n`);
  students.forEach((s, i) => {
    const guide = s.guideId ? Storage.getUserById(s.guideId) : null;
    const d = dissertations.find((x) => x.studentId === s.id);
    console.log(`${i + 1}. [${s.id}] ${s.name} | ${s.department}`);
    console.log(`   Guide : ${guide ? guide.name + ' (' + guide.id + ')' : 'Not Assigned'}`);
    if (d) {
      console.log(`   Topic : "${d.topicTitle}" [${d.topicStatus || d.status || '-'}]`);
      console.log(`   Progress: ${d.progress !== undefined ? d.progress : 0}% | Submission: ${d.submissionStatus || 'Not Submitted'}`);
    } else {
      console.log('   Topic : No dissertation proposed yet');
    }
    printDivider('-', 55);
  });
  await pause();
}

// ── 4. View Guides ────────────────────────────────────────────────────────────
async function viewGuides() {
  printSubHeader('PG GUIDES');
  const guides = Storage.getGuides();
  const allStudents = Storage.getStudents();
  if (guides.length === 0) { console.log('No guides registered.'); await pause(); return; }
  console.log(`Total: ${guides.length}\n`);
  guides.forEach((g, i) => {
    const count = allStudents.filter((s) => s.guideId === g.id).length;
    const max = g.maxStudents || MAX_STUDENTS_PER_GUIDE;
    console.log(`${i + 1}. [${g.id}] ${g.name}`);
    console.log(`   Designation: ${g.designation || 'Faculty'} | Dept: ${g.department}`);
    console.log(`   Load: ${count}/${max} students`);
    printDivider('-', 55);
  });
  await pause();
}

// ── 5. Assign Guide ───────────────────────────────────────────────────────────
async function assignGuide() {
  printSubHeader('ASSIGN PG GUIDE TO STUDENT');
  const students = Storage.getStudents();
  const guides = Storage.getGuides();
  if (students.length === 0) { console.log('No students available.'); await pause(); return; }
  if (guides.length === 0) { console.log('No guides available.'); await pause(); return; }

  // Select student
  console.log('\nSelect Student:');
  students.forEach((s, i) => {
    const g = s.guideId ? Storage.getUserById(s.guideId) : null;
    console.log(` ${i + 1}. [${s.id}] ${s.name} (Current: ${g ? g.name : 'Unassigned'})`);
  });
  console.log(` ${students.length + 1}. Cancel`);
  const sn = parseInt(await ask(`Enter choice (1-${students.length + 1}): `), 10);
  if (sn < 1 || sn > students.length) return;
  const student = students[sn - 1];

  // Select guide
  console.log('\nSelect Guide:');
  guides.forEach((g, i) => {
    const count = Storage.getStudentCountForGuide(g.id);
    const max = g.maxStudents || MAX_STUDENTS_PER_GUIDE;
    const full = count >= max;
    console.log(` ${i + 1}. [${g.id}] ${g.name} | Load: ${count}/${max}${full ? ' [FULL]' : ''}`);
  });
  console.log(` ${guides.length + 1}. Cancel`);
  const gn = parseInt(await ask(`Enter choice (1-${guides.length + 1}): `), 10);
  if (gn < 1 || gn > guides.length) return;
  const guide = guides[gn - 1];

  // Check max capacity
  const currentCount = Storage.getStudentCountForGuide(guide.id);
  const max = guide.maxStudents || MAX_STUDENTS_PER_GUIDE;
  if (currentCount >= max) {
    console.log(`\n[!] ${guide.name} already has ${currentCount}/${max} students. Cannot assign more.`);
    await pause();
    return;
  }

  // Update student guideId
  const allUsers = Storage.getUsers();
  const ui = allUsers.findIndex((u) => u.id === student.id);
  if (ui !== -1) { allUsers[ui].guideId = guide.id; Storage.saveUsers(allUsers); }

  // Update dissertation if exists
  const all = Storage.getDissertations();
  const di = all.findIndex((d) => d.studentId === student.id);
  if (di !== -1) { all[di].guideId = guide.id; all[di].guideName = guide.name; Storage.saveDissertations(all); }

  console.log(`\n[✓] ${student.name} assigned to ${guide.name}.`);
  await pause();
}

// ── 6. View Dissertation Status ───────────────────────────────────────────────
async function viewDissertationStatus() {
  printSubHeader('DISSERTATION STATUS OVERVIEW');
  const dissertations = Storage.getDissertations();
  if (dissertations.length === 0) { console.log('No dissertations on record.'); await pause(); return; }
  console.log(`Total Records: ${dissertations.length}\n`);
  dissertations.forEach((d, i) => {
    console.log(`${i + 1}. [${d.id}] ${d.studentName}`);
    console.log(`   Topic      : "${d.topicTitle}"`);
    console.log(`   Guide      : ${d.guideName || 'Not Assigned'}`);
    console.log(`   Topic Status: ${d.topicStatus || d.status || 'Pending'}`);
    console.log(`   Progress   : ${d.progress !== undefined ? d.progress : 0}%`);
    console.log(`   Submission : ${d.submissionStatus || 'Not Submitted'}${d.submissionDate ? ' (' + d.submissionDate + ')' : ''}`);
    console.log(`   Evaluation : ${d.evaluationStatus || 'Pending'}${d.evaluationResult ? ' → ' + d.evaluationResult : ''}${d.marks !== null && d.marks !== undefined ? ' (' + d.marks + '/100)' : ''}`);
    printDivider('-', 55);
  });
  await pause();
}

// ── Main Admin Menu ───────────────────────────────────────────────────────────
async function adminMenu() {
  let running = true;
  while (running) {
    printHeader('ADMIN MENU');
    console.log('1. Add Dissertation Topic');
    console.log('2. View All Topics');
    console.log('3. View Students');
    console.log('4. View Guides');
    console.log('5. Assign Guide');
    console.log('6. View Dissertation Status');
    console.log('7. Back');
    printDivider('-', 30);

    const choice = await ask('Enter choice (1-7): ');
    switch (choice) {
      case '1': await addTopic(); break;
      case '2': await viewAllTopics(); break;
      case '3': await viewStudents(); break;
      case '4': await viewGuides(); break;
      case '5': await assignGuide(); break;
      case '6': await viewDissertationStatus(); break;
      case '7': running = false; break;
      default:
        console.log('\n[!] Invalid choice. Enter 1-7.');
        await pause();
    }
  }
}

module.exports = adminMenu;
