const Storage = require('../storage');
const { ask, pause, printHeader, printSubHeader, printDivider } = require('../utils');

// ── Helper: pick a student from list ─────────────────────────────────────────
async function selectStudent() {
  const students = Storage.getStudents();
  if (students.length === 0) {
    console.log('\n[!] No students registered in the system.');
    return null;
  }
  console.log('\nSelect Student Profile:');
  printDivider('-', 45);
  students.forEach((s, i) => console.log(` ${i + 1}. [${s.id}] ${s.name} (${s.department})`));
  console.log(` ${students.length + 1}. Cancel / Back`);
  printDivider('-', 45);
  const num = parseInt(await ask(`Enter choice (1-${students.length + 1}): `), 10);
  return num >= 1 && num <= students.length ? students[num - 1] : null;
}

// ── 1. View Available Topics ──────────────────────────────────────────────────
async function viewAvailableTopics() {
  printSubHeader('AVAILABLE DISSERTATION TOPICS');
  const topics = Storage.getAvailableTopics();
  if (topics.length === 0) {
    console.log('No available topics found in the departmental pool.');
    await pause();
    return;
  }
  console.log(`Found ${topics.length} available topic(s):\n`);
  topics.forEach((t) => {
    console.log(`[${t.id}] ${t.title}`);
    console.log(`  • Department : ${t.department}`);
    console.log(`  • Domain     : ${t.domain}`);
    console.log(`  • Description: ${t.description}`);
    console.log(`  • Status     : ${t.status}`);
    printDivider('-', 55);
  });
  await pause();
}

// ── 2. Propose Dissertation Topic ─────────────────────────────────────────────
async function proposeTopic() {
  printSubHeader('PROPOSE DISSERTATION TOPIC');

  const student = await selectStudent();
  if (!student) return;

  // Prevent duplicate dissertation for same student
  const existing = Storage.getDissertationByStudentId(student.id);
  if (existing) {
    const ts = existing.topicStatus || existing.status || '';
    if (ts !== 'Rejected') {
      console.log(`\n[!] ${student.name} already has an active dissertation proposal:`);
      console.log(`    Title  : "${existing.topicTitle}"`);
      console.log(`    Status : ${ts}`);
      console.log('    Cannot propose another topic while one is active.');
      await pause();
      return;
    }
  }

  console.log(`\nProposing topic for: ${student.name} (${student.id})`);
  console.log(' 1. Select from Departmental Available Topics');
  console.log(' 2. Propose a New Custom Research Topic');
  console.log(' 3. Cancel');
  const method = await ask('Enter choice (1-3): ');

  let topicTitle = '', department = student.department, domain = '', description = '', selectedTopicId = null;

  if (method === '1') {
    const avail = Storage.getAvailableTopics();
    if (avail.length === 0) {
      console.log('\n[!] No available topics. Propose a custom topic instead.');
      await pause();
      return;
    }
    avail.forEach((t, i) => console.log(` ${i + 1}. [${t.id}] ${t.title} (${t.domain})`));
    const n = parseInt(await ask(`Select topic (1-${avail.length}): `), 10);
    if (n < 1 || n > avail.length) { console.log('Invalid selection.'); await pause(); return; }
    const ch = avail[n - 1];
    topicTitle = ch.title; department = ch.department; domain = ch.domain;
    description = ch.description; selectedTopicId = ch.id;
  } else if (method === '2') {
    topicTitle = await ask('\nEnter Topic Title: ');
    if (!topicTitle) { console.log('Title cannot be empty.'); await pause(); return; }
    if (Storage.isTopicTitleDuplicate(topicTitle)) {
      console.log('\n' + '!'.repeat(55));
      console.log(' [!] TOPIC DUPLICATION PREVENTED');
      console.log(' A topic with this title already exists in the system.');
      console.log('!'.repeat(55));
      await pause();
      return;
    }
    domain = await ask('Enter Research Domain: ');
    description = await ask('Enter Brief Description / Abstract: ');
  } else {
    return;
  }

  // Guide info
  let guideId = student.guideId || null;
  let guideName = 'Unassigned';
  if (guideId) {
    const g = Storage.getUserById(guideId);
    if (g) guideName = g.name;
  }

  const dissertations = Storage.getDissertations();
  const id = Storage.generateDissertationId();

  const rec = {
    id,
    studentId: student.id,
    studentName: student.name,
    guideId: guideId,
    guideName: guideName,
    topicTitle: topicTitle.trim(),
    department: department || 'General',
    domain: domain || 'General',
    description: description || 'Research proposal submitted by PG student.',
    topicStatus: 'Pending',
    progress: 0,
    submissionStatus: 'Not Submitted',
    submissionDate: null,
    evaluationStatus: 'Pending',
    marks: null,
    evaluationRemarks: null,
    evaluationResult: null,
    proposedDate: new Date().toISOString().split('T')[0],
    reviewComments: 'Proposal submitted. Awaiting guide review.'
  };

  // Keep old `status` field for backward compat with Commit 2 tests
  rec.status = 'Pending Review';

  dissertations.push(rec);
  Storage.saveDissertations(dissertations);

  if (selectedTopicId) {
    const allTopics = Storage.getTopics();
    const ti = allTopics.findIndex((t) => t.id === selectedTopicId);
    if (ti !== -1) { allTopics[ti].status = 'Reserved'; Storage.saveTopics(allTopics); }
  }

  console.log('\n' + '='.repeat(55));
  console.log(' [✓] DISSERTATION TOPIC PROPOSED SUCCESSFULLY!');
  console.log('='.repeat(55));
  console.log(` ID      : ${rec.id}`);
  console.log(` Student : ${rec.studentName}`);
  console.log(` Guide   : ${rec.guideName}`);
  console.log(` Topic   : ${rec.topicTitle}`);
  console.log(` Status  : ${rec.topicStatus}`);
  console.log('='.repeat(55));
  await pause();
}

// ── 3. View My Dissertation ───────────────────────────────────────────────────
async function viewMyDissertation() {
  printSubHeader('VIEW MY DISSERTATION');
  const student = await selectStudent();
  if (!student) return;

  const d = Storage.getDissertationByStudentId(student.id);
  if (!d) {
    console.log(`\n[!] No dissertation found for ${student.name}. Use Option 2 to propose a topic.`);
    await pause();
    return;
  }

  console.log('\n' + '='.repeat(55));
  console.log(` DISSERTATION: ${d.id}`);
  console.log('='.repeat(55));
  console.log(` Student          : ${d.studentName} (${d.studentId})`);
  console.log(` PG Guide         : ${d.guideName || 'Not Assigned'}`);
  console.log(` Department       : ${d.department}`);
  console.log(` Domain           : ${d.domain}`);
  console.log(` Topic            : ${d.topicTitle}`);
  console.log(` Topic Status     : [ ${d.topicStatus || d.status || 'Pending'} ]`);
  console.log(` Progress         : ${d.progress !== undefined ? d.progress : 0}%`);
  console.log(` Submission       : ${d.submissionStatus || 'Not Submitted'}${d.submissionDate ? ' (' + d.submissionDate + ')' : ''}`);
  console.log(` Evaluation       : ${d.evaluationStatus || 'Pending'}`);
  if (d.evaluationResult) {
    console.log(` Evaluation Result: [ ${d.evaluationResult.toUpperCase()} ]`);
    console.log(` Marks            : ${d.marks !== null ? d.marks : '-'}`);
    console.log(` Evaluator Remarks: ${d.evaluationRemarks || '-'}`);
  }
  console.log(` Guide Remarks    : ${d.reviewComments || 'None'}`);
  console.log(` Proposed Date    : ${d.proposedDate}`);
  console.log('='.repeat(55));
  await pause();
}

// ── 4. Update Progress ────────────────────────────────────────────────────────
async function updateProgress() {
  printSubHeader('UPDATE RESEARCH PROGRESS');
  const student = await selectStudent();
  if (!student) return;

  const dissertations = Storage.getDissertations();
  const di = dissertations.findIndex((d) => d.studentId === student.id);
  if (di === -1) {
    console.log('\n[!] No dissertation found. Propose a topic first (Option 2).');
    await pause();
    return;
  }

  const d = dissertations[di];
  const ts = d.topicStatus || d.status || '';
  if (ts !== 'Approved') {
    console.log(`\n[!] Topic must be approved before recording progress. Current status: ${ts}`);
    await pause();
    return;
  }

  console.log(`\nCurrent progress for "${d.topicTitle}": ${d.progress !== undefined ? d.progress : 0}%`);
  const raw = await ask('Enter new progress percentage (0-100): ');
  const pct = parseInt(raw, 10);
  if (isNaN(pct) || pct < 0 || pct > 100) {
    console.log('[!] Invalid value. Enter a number between 0 and 100.');
    await pause();
    return;
  }

  dissertations[di].progress = pct;
  Storage.saveDissertations(dissertations);
  console.log(`\n[✓] Progress updated to ${pct}% for ${student.name}.`);
  await pause();
}

// ── 5. Submit Dissertation ────────────────────────────────────────────────────
async function submitDissertation() {
  printSubHeader('SUBMIT DISSERTATION');
  const student = await selectStudent();
  if (!student) return;

  const dissertations = Storage.getDissertations();
  const di = dissertations.findIndex((d) => d.studentId === student.id);
  if (di === -1) {
    console.log('\n[!] No dissertation found. Propose a topic first.');
    await pause();
    return;
  }

  const d = dissertations[di];

  // Must have a guide assigned
  if (!d.guideId) {
    console.log('\n[!] Cannot submit: No guide assigned to this dissertation.');
    console.log('    Ask Admin to assign a guide (Admin Menu → Option 5).');
    await pause();
    return;
  }

  // Topic must be approved
  const ts = d.topicStatus || d.status || '';
  if (ts !== 'Approved') {
    console.log(`\n[!] Cannot submit: Topic is not yet approved. Current status: ${ts}`);
    await pause();
    return;
  }

  // Already submitted?
  if (d.submissionStatus === 'Submitted') {
    console.log(`\n[!] Dissertation already submitted on ${d.submissionDate}.`);
    await pause();
    return;
  }

  console.log(`\nYou are about to submit the dissertation:`);
  console.log(`  Topic  : "${d.topicTitle}"`);
  console.log(`  Guide  : ${d.guideName}`);
  console.log(`  Progress: ${d.progress !== undefined ? d.progress : 0}%`);
  const confirm = await ask('Confirm submission? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('Submission cancelled.');
    await pause();
    return;
  }

  dissertations[di].submissionStatus = 'Submitted';
  dissertations[di].submissionDate = new Date().toISOString().split('T')[0];
  Storage.saveDissertations(dissertations);

  console.log('\n' + '='.repeat(55));
  console.log(' [✓] DISSERTATION SUBMITTED SUCCESSFULLY!');
  console.log(`  Student : ${student.name}`);
  console.log(`  Topic   : "${d.topicTitle}"`);
  console.log(`  Date    : ${dissertations[di].submissionDate}`);
  console.log('='.repeat(55));
  await pause();
}

// ── Main Student Menu ─────────────────────────────────────────────────────────
async function studentMenu() {
  let running = true;
  while (running) {
    printHeader('STUDENT MENU');
    console.log('1. View Available Topics');
    console.log('2. Propose Dissertation Topic');
    console.log('3. View My Dissertation');
    console.log('4. Update Progress');
    console.log('5. Submit Dissertation');
    console.log('6. Back');
    printDivider('-', 30);

    const choice = await ask('Enter choice (1-6): ');
    switch (choice) {
      case '1': await viewAvailableTopics(); break;
      case '2': await proposeTopic(); break;
      case '3': await viewMyDissertation(); break;
      case '4': await updateProgress(); break;
      case '5': await submitDissertation(); break;
      case '6': running = false; break;
      default:
        console.log('\n[!] Invalid choice. Enter 1-6.');
        await pause();
    }
  }
}

module.exports = studentMenu;
