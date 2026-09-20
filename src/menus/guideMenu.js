const Storage = require('../storage');
const { ask, pause, printHeader, printSubHeader, printDivider } = require('../utils');

async function selectGuide() {
  const guides = Storage.getGuides();
  if (guides.length === 0) {
    console.log('\n[!] No PG guides registered in the system.');
    return null;
  }

  console.log('\nSelect Guide Profile:');
  printDivider('-', 45);
  guides.forEach((g, idx) => {
    console.log(` ${idx + 1}. [${g.id}] ${g.name} (${g.department})`);
  });
  console.log(` ${guides.length + 1}. Cancel / Back`);
  printDivider('-', 45);

  const choice = await ask(`Enter choice (1-${guides.length + 1}): `);
  const num = parseInt(choice, 10);
  if (num >= 1 && num <= guides.length) {
    return guides[num - 1];
  }
  return null;
}

// 1. View Pending Topics
async function viewPendingTopics() {
  printSubHeader('PENDING DISSERTATION TOPIC PROPOSALS');
  const pending = Storage.getPendingDissertations();

  if (pending.length === 0) {
    console.log('No pending topic proposals awaiting review.');
    await pause();
    return;
  }

  console.log(`Found ${pending.length} pending proposal(s):\n`);
  pending.forEach((d) => {
    console.log(`[${d.id}] "${d.topicTitle}"`);
    console.log(`  • Student  : ${d.studentName} (${d.studentId})`);
    console.log(`  • Guide    : ${d.guideName}`);
    console.log(`  • Dept     : ${d.department} | Domain: ${d.domain}`);
    console.log(`  • Date     : ${d.proposedDate}`);
    console.log(`  • Status   : [ ${d.status} ]`);
    printDivider('-', 55);
  });

  await pause();
}

// 2. View My Students
async function viewMyStudents() {
  printSubHeader('VIEW GUIDE STUDENTS');

  const guide = await selectGuide();
  if (!guide) {
    return;
  }

  const allStudents = Storage.getStudents();
  const guideStudents = allStudents.filter((s) => s.guideId === guide.id);
  const dissertations = Storage.getDissertations();

  console.log(`\nGuide: ${guide.name} (${guide.designation}, ${guide.department})`);
  console.log(`Assigned Students: ${guideStudents.length} / Max Capacity: ${guide.maxStudents || 3}`);
  printDivider('-', 55);

  if (guideStudents.length === 0) {
    console.log('No students currently assigned to this guide.');
  } else {
    guideStudents.forEach((s, idx) => {
      const diss = dissertations.find((d) => d.studentId === s.id);
      console.log(`${idx + 1}. [${s.id}] ${s.name} (${s.email})`);
      if (diss) {
        console.log(`   Topic  : "${diss.topicTitle}"`);
        console.log(`   Status : ${diss.status}`);
      } else {
        console.log(`   Topic  : No dissertation proposed yet`);
      }
      printDivider('-', 45);
    });
  }

  await pause();
}

// 3. Approve Topic
async function approveTopic() {
  printSubHeader('APPROVE DISSERTATION TOPIC');

  const pending = Storage.getPendingDissertations();
  if (pending.length === 0) {
    console.log('No pending topic proposals to approve.');
    await pause();
    return;
  }

  console.log('Select pending topic to approve:');
  pending.forEach((d, idx) => {
    console.log(` ${idx + 1}. [${d.id}] "${d.topicTitle}" by ${d.studentName}`);
  });
  console.log(` ${pending.length + 1}. Cancel`);

  const choice = await ask(`Enter choice (1-${pending.length + 1}): `);
  const num = parseInt(choice, 10);
  if (num < 1 || num > pending.length) {
    return;
  }

  const selected = pending[num - 1];
  const remarks = await ask('\nEnter Approval Comments / Instructions (optional): ');

  const allDissertations = Storage.getDissertations();
  const dIndex = allDissertations.findIndex((d) => d.id === selected.id);

  if (dIndex !== -1) {
    allDissertations[dIndex].status = 'Approved';
    allDissertations[dIndex].reviewComments =
      remarks || 'Topic approved by PG Guide. Eligible for research work.';
    Storage.saveDissertations(allDissertations);

    console.log('\n' + '='.repeat(55));
    console.log(` [✓] DISSERTATION PROPOSAL APPROVED!`);
    console.log(` Topic   : "${selected.topicTitle}"`);
    console.log(` Student : ${selected.studentName} (${selected.studentId})`);
    console.log(` Status  : Approved`);
    console.log('='.repeat(55));
  }

  await pause();
}

// 4. Reject Topic
async function rejectTopic() {
  printSubHeader('REJECT DISSERTATION TOPIC');

  const pending = Storage.getPendingDissertations();
  if (pending.length === 0) {
    console.log('No pending topic proposals to reject.');
    await pause();
    return;
  }

  console.log('Select pending topic to reject:');
  pending.forEach((d, idx) => {
    console.log(` ${idx + 1}. [${d.id}] "${d.topicTitle}" by ${d.studentName}`);
  });
  console.log(` ${pending.length + 1}. Cancel`);

  const choice = await ask(`Enter choice (1-${pending.length + 1}): `);
  const num = parseInt(choice, 10);
  if (num < 1 || num > pending.length) {
    return;
  }

  const selected = pending[num - 1];
  const reason = await ask('\nEnter Rejection Reason / Revision Guidance: ');

  if (!reason) {
    console.log('Rejection reason cannot be blank.');
    await pause();
    return;
  }

  const allDissertations = Storage.getDissertations();
  const dIndex = allDissertations.findIndex((d) => d.id === selected.id);

  if (dIndex !== -1) {
    allDissertations[dIndex].status = 'Rejected';
    allDissertations[dIndex].reviewComments = `Rejected: ${reason}`;
    Storage.saveDissertations(allDissertations);

    console.log('\n' + '='.repeat(55));
    console.log(` [✗] DISSERTATION PROPOSAL REJECTED`);
    console.log(` Topic   : "${selected.topicTitle}"`);
    console.log(` Student : ${selected.studentName} (${selected.studentId})`);
    console.log(` Remarks : ${reason}`);
    console.log('='.repeat(55));
  }

  await pause();
}

// Main Guide Menu Loop
async function guideMenu() {
  let inGuide = true;

  while (inGuide) {
    printHeader('GUIDE MENU');
    console.log('1. View Pending Topics');
    console.log('2. View My Students');
    console.log('3. Approve Topic');
    console.log('4. Reject Topic');
    console.log('5. Back');
    printDivider('-', 30);

    const choice = await ask('Enter choice (1-5): ');

    switch (choice) {
      case '1':
        await viewPendingTopics();
        break;
      case '2':
        await viewMyStudents();
        break;
      case '3':
        await approveTopic();
        break;
      case '4':
        await rejectTopic();
        break;
      case '5':
        inGuide = false;
        break;
      default:
        console.log('\n[!] Invalid choice. Please select 1, 2, 3, 4, or 5.');
        await pause();
        break;
    }
  }
}

module.exports = guideMenu;
