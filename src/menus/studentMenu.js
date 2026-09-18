const Storage = require('../storage');
const { ask, pause, printHeader, printSubHeader, printDivider } = require('../utils');

async function selectStudent() {
  const students = Storage.getStudents();
  if (students.length === 0) {
    console.log('\n[!] No students registered in the system.');
    return null;
  }

  console.log('\nSelect Student Profile:');
  printDivider('-', 45);
  students.forEach((s, idx) => {
    console.log(` ${idx + 1}. [${s.id}] ${s.name} (${s.department})`);
  });
  console.log(` ${students.length + 1}. Cancel / Back`);
  printDivider('-', 45);

  const choice = await ask(`Enter choice (1-${students.length + 1}): `);
  const num = parseInt(choice, 10);
  if (num >= 1 && num <= students.length) {
    return students[num - 1];
  }
  return null;
}

// 1. View Available Topics
async function viewAvailableTopics() {
  printSubHeader('AVAILABLE DISSERTATION TOPICS');
  const topics = Storage.getAvailableTopics();

  if (topics.length === 0) {
    console.log('No available topics found in the departmental pool.');
    await pause();
    return;
  }

  console.log(`Found ${topics.length} available topic(s):\n`);
  topics.forEach((t, i) => {
    console.log(`[${t.id}] ${t.title}`);
    console.log(`  • Department : ${t.department}`);
    console.log(`  • Domain     : ${t.domain}`);
    console.log(`  • Description: ${t.description}`);
    console.log(`  • Status     : ${t.status}`);
    printDivider('-', 55);
  });

  await pause();
}

// 2. Propose Dissertation Topic
async function proposeTopic() {
  printSubHeader('PROPOSE DISSERTATION TOPIC');

  const student = await selectStudent();
  if (!student) {
    return;
  }

  // Check if student already has a pending or approved dissertation
  const existingDissertation = Storage.getDissertationByStudentId(student.id);
  if (existingDissertation && (existingDissertation.status === 'Approved' || existingDissertation.status === 'Pending Review')) {
    console.log(`\n[!] Student ${student.name} (${student.id}) already has an active dissertation proposal:`);
    console.log(`    Title : "${existingDissertation.topicTitle}"`);
    console.log(`    Status: ${existingDissertation.status}`);
    console.log(`    Cannot propose another topic while one is active.`);
    await pause();
    return;
  }

  console.log(`\nProposing topic for student: ${student.name} (${student.id})`);
  console.log('Choose proposal method:');
  console.log(' 1. Select from Departmental Available Topics');
  console.log(' 2. Propose a New Custom Research Topic');
  console.log(' 3. Cancel');

  const methodChoice = await ask('Enter choice (1-3): ');
  let topicTitle = '';
  let department = student.department;
  let domain = '';
  let description = '';
  let selectedTopicId = null;

  if (methodChoice === '1') {
    const availableTopics = Storage.getAvailableTopics();
    if (availableTopics.length === 0) {
      console.log('\n[!] No available topics in the departmental list. You can propose a custom topic.');
      await pause();
      return;
    }

    console.log('\nAvailable Topics:');
    availableTopics.forEach((t, idx) => {
      console.log(` ${idx + 1}. [${t.id}] ${t.title} (${t.domain})`);
    });

    const topicNumStr = await ask(`Select topic (1-${availableTopics.length}): `);
    const topicNum = parseInt(topicNumStr, 10);
    if (topicNum >= 1 && topicNum <= availableTopics.length) {
      const chosen = availableTopics[topicNum - 1];
      topicTitle = chosen.title;
      department = chosen.department;
      domain = chosen.domain;
      description = chosen.description;
      selectedTopicId = chosen.id;
    } else {
      console.log('Invalid topic selection.');
      await pause();
      return;
    }
  } else if (methodChoice === '2') {
    topicTitle = await ask('\nEnter Proposed Topic Title: ');
    if (!topicTitle) {
      console.log('Topic title cannot be empty.');
      await pause();
      return;
    }

    domain = await ask('Enter Research Domain (e.g. Pharmacognosy, Clinical): ');
    description = await ask('Enter Brief Research Summary / Abstract: ');
  } else {
    return;
  }

  // DUPLICATE TOPIC CHECK
  // Prevent duplicate topic titles from being proposed
  if (methodChoice === '2' && Storage.isTopicTitleDuplicate(topicTitle)) {
    console.log('\n' + '!'.repeat(55));
    console.log(' [!] TOPIC DUPLICATION PREVENTED');
    console.log(' A topic with this exact title already exists in the system.');
    console.log(' Research duplication is strictly restricted.');
    console.log('!'.repeat(55));
    await pause();
    return;
  }

  // Determine Guide
  let guideId = student.guideId;
  let guideName = 'Unassigned';
  const guides = Storage.getGuides();

  if (guideId) {
    const guide = Storage.getUserById(guideId);
    if (guide) guideName = guide.name;
  } else if (guides.length > 0) {
    console.log('\nNo guide currently assigned. Select a PG Guide to review this proposal:');
    guides.forEach((g, idx) => {
      console.log(` ${idx + 1}. [${g.id}] ${g.name} (${g.department})`);
    });
    const gChoice = await ask(`Select Guide (1-${guides.length}): `);
    const gNum = parseInt(gChoice, 10);
    if (gNum >= 1 && gNum <= guides.length) {
      guideId = guides[gNum - 1].id;
      guideName = guides[gNum - 1].name;

      // Update student's assigned guide
      const allUsers = Storage.getUsers();
      const uIndex = allUsers.findIndex((u) => u.id === student.id);
      if (uIndex !== -1) {
        allUsers[uIndex].guideId = guideId;
        Storage.saveUsers(allUsers);
      }
    }
  }

  // Create Dissertation Record
  const dissertations = Storage.getDissertations();
  const newDissertationId = Storage.generateDissertationId();

  const newDissertation = {
    id: newDissertationId,
    studentId: student.id,
    studentName: student.name,
    guideId: guideId || null,
    guideName: guideName,
    topicTitle: topicTitle.trim(),
    department: department || 'General PG Research',
    domain: domain || 'General',
    description: description || 'Research proposal submitted by PG student.',
    status: 'Pending Review',
    proposedDate: new Date().toISOString().split('T')[0],
    reviewComments: 'Proposal submitted. Awaiting guide review.'
  };

  dissertations.push(newDissertation);
  Storage.saveDissertations(dissertations);

  // If selected from topics list, mark topic status as Reserved
  if (selectedTopicId) {
    const allTopics = Storage.getTopics();
    const tIndex = allTopics.findIndex((t) => t.id === selectedTopicId);
    if (tIndex !== -1) {
      allTopics[tIndex].status = 'Reserved';
      Storage.saveTopics(allTopics);
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log(' [✓] DISSERTATION TOPIC PROPOSED SUCCESSFULLY!');
  console.log('='.repeat(55));
  console.log(` Dissertation ID : ${newDissertation.id}`);
  console.log(` Student         : ${newDissertation.studentName} (${newDissertation.studentId})`);
  console.log(` Guide Assigned  : ${newDissertation.guideName}`);
  console.log(` Topic Title     : ${newDissertation.topicTitle}`);
  console.log(` Status          : ${newDissertation.status}`);
  console.log('='.repeat(55));

  await pause();
}

// 3. View My Dissertation
async function viewMyDissertation() {
  printSubHeader('VIEW MY DISSERTATION');

  const student = await selectStudent();
  if (!student) {
    return;
  }

  const dissertation = Storage.getDissertationByStudentId(student.id);

  if (!dissertation) {
    console.log(`\n[!] No dissertation proposal found for ${student.name} (${student.id}).`);
    console.log('    You can propose a topic from the Student Menu (Option 2).');
    await pause();
    return;
  }

  console.log('\n' + '='.repeat(55));
  console.log(` DISSERTATION RECORD: ${dissertation.id}`);
  console.log('='.repeat(55));
  console.log(` Student Name    : ${dissertation.studentName} (${dissertation.studentId})`);
  console.log(` PG Guide        : ${dissertation.guideName || 'Not Assigned'}`);
  console.log(` Department      : ${dissertation.department}`);
  console.log(` Research Domain : ${dissertation.domain}`);
  console.log(` Topic Title     : ${dissertation.topicTitle}`);
  console.log(` Description     : ${dissertation.description}`);
  console.log(` Proposed Date   : ${dissertation.proposedDate}`);
  console.log(` Status          : [ ${dissertation.status.toUpperCase()} ]`);
  console.log(` Guide Remarks   : ${dissertation.reviewComments || 'None'}`);
  console.log('='.repeat(55));

  await pause();
}

// Main Student Menu Loop
async function studentMenu() {
  let inStudent = true;

  while (inStudent) {
    printHeader('STUDENT MENU');
    console.log('1. View Available Topics');
    console.log('2. Propose Dissertation Topic');
    console.log('3. View My Dissertation');
    console.log('4. Back');
    printDivider('-', 30);

    const choice = await ask('Enter choice (1-4): ');

    switch (choice) {
      case '1':
        await viewAvailableTopics();
        break;
      case '2':
        await proposeTopic();
        break;
      case '3':
        await viewMyDissertation();
        break;
      case '4':
        inStudent = false;
        break;
      default:
        console.log('\n[!] Invalid choice. Please select 1, 2, 3, or 4.');
        await pause();
        break;
    }
  }
}

module.exports = studentMenu;
