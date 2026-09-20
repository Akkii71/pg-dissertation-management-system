const Storage = require('../storage');
const { ask, pause, printHeader, printSubHeader, printDivider } = require('../utils');

// ── Helper: pick a guide ──────────────────────────────────────────────────────
async function selectGuide() {
  const guides = Storage.getGuides();
  if (guides.length === 0) { console.log('\n[!] No PG guides registered.'); return null; }
  console.log('\nSelect Guide:');
  printDivider('-', 45);
  guides.forEach((g, i) => console.log(` ${i + 1}. [${g.id}] ${g.name} (${g.department})`));
  console.log(` ${guides.length + 1}. Cancel / Back`);
  printDivider('-', 45);
  const num = parseInt(await ask(`Enter choice (1-${guides.length + 1}): `), 10);
  return num >= 1 && num <= guides.length ? guides[num - 1] : null;
}

// ── 1. View My Students ───────────────────────────────────────────────────────
async function viewMyStudents() {
  printSubHeader('VIEW MY STUDENTS');
  const guide = await selectGuide();
  if (!guide) return;

  const students = Storage.getStudents().filter((s) => s.guideId === guide.id);
  const dissertations = Storage.getDissertations();

  console.log(`\nGuide: ${guide.name} | ${guide.designation || 'Faculty'} | ${guide.department}`);
  console.log(`Students: ${students.length} / Max ${guide.maxStudents || 5}`);
  printDivider('-', 55);

  if (students.length === 0) {
    console.log('No students assigned to this guide.');
  } else {
    students.forEach((s, i) => {
      const d = dissertations.find((x) => x.studentId === s.id);
      console.log(`${i + 1}. [${s.id}] ${s.name}`);
      if (d) {
        console.log(`   Topic       : "${d.topicTitle}"`);
        console.log(`   Topic Status: ${d.topicStatus || d.status || 'Pending'}`);
        console.log(`   Progress    : ${d.progress !== undefined ? d.progress : 0}%`);
        console.log(`   Submission  : ${d.submissionStatus || 'Not Submitted'}`);
        console.log(`   Evaluation  : ${d.evaluationStatus || 'Pending'}`);
        console.log(`   Univ. Result: ${Storage.deriveUniversityResult(d)}`);
      } else {
        console.log('   No dissertation proposed yet.');
      }
      printDivider('-', 45);
    });
  }
  await pause();
}

// ── 2. Approve Topic ──────────────────────────────────────────────────────────
async function approveTopic() {
  printSubHeader('APPROVE DISSERTATION TOPIC');
  const guide = await selectGuide();
  if (!guide) return;

  const pending = Storage.getPendingDissertations().filter((d) => d.guideId === guide.id);
  if (pending.length === 0) {
    console.log(`No pending topics assigned to ${guide.name}.`);
    await pause();
    return;
  }

  pending.forEach((d, i) => console.log(` ${i + 1}. [${d.id}] "${d.topicTitle}" by ${d.studentName}`));
  console.log(` ${pending.length + 1}. Cancel`);
  const n = parseInt(await ask(`Select (1-${pending.length + 1}): `), 10);
  if (n < 1 || n > pending.length) return;

  const sel = pending[n - 1];
  const remarks = await ask('Approval remarks (optional): ');

  const all = Storage.getDissertations();
  const di = all.findIndex((d) => d.id === sel.id);
  if (di !== -1) {
    all[di].topicStatus = 'Approved';
    all[di].status = 'Approved';
    all[di].reviewComments = remarks || 'Topic approved by PG Guide. Research may commence.';
    Storage.saveDissertations(all);
    console.log(`\n[✓] Topic "${sel.topicTitle}" approved for ${sel.studentName}.`);
  }
  await pause();
}

// ── 3. Reject Topic ───────────────────────────────────────────────────────────
async function rejectTopic() {
  printSubHeader('REJECT DISSERTATION TOPIC');
  const guide = await selectGuide();
  if (!guide) return;

  const pending = Storage.getPendingDissertations().filter((d) => d.guideId === guide.id);
  if (pending.length === 0) {
    console.log(`No pending topics assigned to ${guide.name}.`);
    await pause();
    return;
  }

  pending.forEach((d, i) => console.log(` ${i + 1}. [${d.id}] "${d.topicTitle}" by ${d.studentName}`));
  console.log(` ${pending.length + 1}. Cancel`);
  const n = parseInt(await ask(`Select (1-${pending.length + 1}): `), 10);
  if (n < 1 || n > pending.length) return;

  const sel = pending[n - 1];
  const reason = await ask('Rejection reason: ');
  if (!reason) { console.log('[!] Reason cannot be empty.'); await pause(); return; }

  const all = Storage.getDissertations();
  const di = all.findIndex((d) => d.id === sel.id);
  if (di !== -1) {
    all[di].topicStatus = 'Rejected';
    all[di].status = 'Rejected';
    all[di].reviewComments = `Rejected: ${reason}`;
    Storage.saveDissertations(all);
    console.log(`\n[✗] Topic "${sel.topicTitle}" rejected. Reason: ${reason}`);
  }
  await pause();
}

// ── 4. View Student Progress ──────────────────────────────────────────────────
async function viewStudentProgress() {
  printSubHeader('VIEW STUDENT PROGRESS');
  const guide = await selectGuide();
  if (!guide) return;

  const students = Storage.getStudents().filter((s) => s.guideId === guide.id);
  if (students.length === 0) {
    console.log(`No students assigned to ${guide.name}.`);
    await pause();
    return;
  }

  const dissertations = Storage.getDissertations();
  console.log(`\nProgress Report — Guide: ${guide.name}`);
  printDivider('=', 55);
  students.forEach((s, i) => {
    const d = dissertations.find((x) => x.studentId === s.id);
    console.log(`${i + 1}. ${s.name} [${s.id}]`);
    if (d) {
      const pct = d.progress || 0;
      const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      console.log(`   Topic    : "${d.topicTitle}"`);
      console.log(`   Status   : ${d.topicStatus || d.status || '-'}`);
      console.log(`   Progress : ${bar} ${pct}%`);
      console.log(`   Submitted: ${d.submissionStatus || 'Not Submitted'}`);
    } else {
      console.log('   No dissertation proposed yet.');
    }
    printDivider('-', 45);
  });
  await pause();
}

// ── 5. Evaluate Dissertation ──────────────────────────────────────────────────
async function evaluateDissertation() {
  printSubHeader('EVALUATE DISSERTATION');
  const guide = await selectGuide();
  if (!guide) return;

  const submitted = Storage.getDissertationsByGuideId(guide.id).filter(
    (d) => d.submissionStatus === 'Submitted' &&
           d.evaluationStatus !== 'Approved' &&
           d.evaluationStatus !== 'Rejected'
  );

  if (submitted.length === 0) {
    console.log(`No submitted dissertations awaiting evaluation for ${guide.name}.`);
    await pause();
    return;
  }

  submitted.forEach((d, i) => console.log(` ${i + 1}. [${d.id}] "${d.topicTitle}" by ${d.studentName}`));
  console.log(` ${submitted.length + 1}. Cancel`);
  const n = parseInt(await ask(`Select (1-${submitted.length + 1}): `), 10);
  if (n < 1 || n > submitted.length) return;

  const sel = submitted[n - 1];
  const marksRaw = await ask('Enter marks awarded (0-100): ');
  const marks = parseInt(marksRaw, 10);
  if (isNaN(marks) || marks < 0 || marks > 100) {
    console.log('[!] Invalid marks. Must be 0-100.');
    await pause();
    return;
  }

  const remarks = await ask('Enter evaluation remarks: ');
  console.log('\nResult:');
  console.log(' 1. Approved');
  console.log(' 2. Rejected');
  const rn = await ask('Select result (1-2): ');
  if (rn !== '1' && rn !== '2') { console.log('[!] Invalid selection.'); await pause(); return; }
  const result = rn === '1' ? 'Approved' : 'Rejected';

  const all = Storage.getDissertations();
  const di = all.findIndex((d) => d.id === sel.id);
  if (di !== -1) {
    all[di].evaluationStatus = result;
    all[di].evaluationResult = result;
    all[di].marks = marks;
    all[di].evaluationRemarks = remarks || 'Evaluated by PG Guide.';
    all[di].universityResult = Storage.deriveUniversityResult(all[di]);
    Storage.saveDissertations(all);

    console.log('\n' + '='.repeat(55));
    console.log(` [✓] DISSERTATION EVALUATED`);
    console.log(` Student       : ${sel.studentName}`);
    console.log(` Topic         : "${sel.topicTitle}"`);
    console.log(` Marks         : ${marks}/100`);
    console.log(` Result        : [ ${result.toUpperCase()} ]`);
    console.log(` Univ. Result  : ${result === 'Approved' ? 'Eligible' : 'Withheld'}`);
    console.log('='.repeat(55));
  }
  await pause();
}

// ── 6. Record Publication ─────────────────────────────────────────────────────
async function recordPublication() {
  printSubHeader('RECORD PUBLICATION');
  const guide = await selectGuide();
  if (!guide) return;

  const approved = Storage.getDissertationsByGuideId(guide.id).filter(
    (d) => d.evaluationResult === 'Approved' || d.evaluationStatus === 'Approved'
  );

  if (approved.length === 0) {
    console.log(`No approved dissertations under ${guide.name} for publication recording.`);
    await pause();
    return;
  }

  approved.forEach((d, i) => {
    const pub = d.publication && d.publication.published;
    console.log(` ${i + 1}. [${d.id}] "${d.topicTitle}" by ${d.studentName}${pub ? ' [Published]' : ''}`);
  });
  console.log(` ${approved.length + 1}. Cancel`);
  const n = parseInt(await ask(`Enter choice (1-${approved.length + 1}): `), 10);
  if (n < 1 || n > approved.length) return;

  const sel = approved[n - 1];
  console.log('\n 1. Yes — record publication\n 2. No — mark as not published');
  const pub = await ask('Enter choice (1-2): ');

  const all = Storage.getDissertations();
  const di = all.findIndex((d) => d.id === sel.id);
  if (di === -1) return;

  if (pub === '1') {
    const pubTitle = await ask('Publication Title: ');
    const journal = await ask('Journal / Conference Name: ');
    const year = await ask('Publication Year: ');
    all[di].publication = {
      published: true,
      title: pubTitle.trim() || sel.topicTitle,
      journal: journal.trim() || 'Unknown',
      year: year.trim() || new Date().getFullYear().toString()
    };
    Storage.saveDissertations(all);
    console.log(`\n[✓] Publication recorded for "${sel.topicTitle}".`);
  } else {
    all[di].publication = { published: false, title: null, journal: null, year: null };
    Storage.saveDissertations(all);
    console.log('\n[✓] Marked as not published.');
  }
  await pause();
}

// ── Main Guide Menu ───────────────────────────────────────────────────────────
async function guideMenu() {
  let running = true;
  while (running) {
    printHeader('GUIDE MENU');
    console.log('1. View My Students');
    console.log('2. Approve Topic');
    console.log('3. Reject Topic');
    console.log('4. View Student Progress');
    console.log('5. Evaluate Dissertation');
    console.log('6. Record Publication');
    console.log('7. Back');
    printDivider('-', 30);

    const choice = await ask('Enter choice (1-7): ');
    switch (choice) {
      case '1': await viewMyStudents(); break;
      case '2': await approveTopic(); break;
      case '3': await rejectTopic(); break;
      case '4': await viewStudentProgress(); break;
      case '5': await evaluateDissertation(); break;
      case '6': await recordPublication(); break;
      case '7': running = false; break;
      default:
        console.log('\n[!] Invalid choice. Enter 1-7.');
        await pause();
    }
  }
}

module.exports = guideMenu;
