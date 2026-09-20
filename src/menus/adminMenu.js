const Storage = require('../storage');
const { ask, pause, printHeader, printSubHeader, printDivider } = require('../utils');

// 1. Add Dissertation Topic
async function addTopic() {
  printSubHeader('ADD NEW DISSERTATION TOPIC');

  const title = await ask('Enter Topic Title: ');
  if (!title) {
    console.log('[!] Topic title cannot be empty.');
    await pause();
    return;
  }

  // DUPLICATE TOPIC CHECK
  if (Storage.isTopicTitleDuplicate(title)) {
    console.log('\n' + '!'.repeat(55));
    console.log(' [!] TOPIC DUPLICATION PREVENTED');
    console.log(' A topic with this exact title already exists in the system.');
    console.log(' Duplicate topics are not allowed.');
    console.log('!'.repeat(55));
    await pause();
    return;
  }

  const department = await ask('Enter Department (e.g. Ayurveda Research, Pharmacology): ');
  const domain = await ask('Enter Research Domain / Thrust Area: ');
  const description = await ask('Enter Topic Description / Objectives: ');

  const topics = Storage.getTopics();
  const newTopicId = Storage.generateTopicId();

  const newTopic = {
    id: newTopicId,
    title: title.trim(),
    department: department.trim() || 'General Research',
    domain: domain.trim() || 'General',
    description: description.trim() || 'Department thrust area research topic.',
    status: 'Available',
    addedBy: 'Admin',
    createdAt: new Date().toISOString().split('T')[0]
  };

  topics.push(newTopic);
  Storage.saveTopics(topics);

  console.log('\n' + '='.repeat(55));
  console.log(' [✓] DISSERTATION TOPIC ADDED SUCCESSFULLY!');
  console.log(` Topic ID   : ${newTopic.id}`);
  console.log(` Title      : "${newTopic.title}"`);
  console.log(` Department : ${newTopic.department}`);
  console.log(` Domain     : ${newTopic.domain}`);
  console.log(` Status     : ${newTopic.status}`);
  console.log('='.repeat(55));

  await pause();
}

// 2. View All Topics
async function viewAllTopics() {
  printSubHeader('ALL DEPARTMENTAL DISSERTATION TOPICS');
  const topics = Storage.getTopics();

  if (topics.length === 0) {
    console.log('No dissertation topics registered yet.');
    await pause();
    return;
  }

  console.log(`Total Topics Registered: ${topics.length}\n`);
  topics.forEach((t) => {
    console.log(`[${t.id}] ${t.title}`);
    console.log(`  • Dept   : ${t.department} | Domain: ${t.domain}`);
    console.log(`  • Status : [ ${t.status} ] | Added By: ${t.addedBy} (${t.createdAt})`);
    console.log(`  • Summary: ${t.description}`);
    printDivider('-', 55);
  });

  await pause();
}

// 3. View Students
async function viewStudents() {
  printSubHeader('REGISTERED PG STUDENTS');
  const students = Storage.getStudents();
  const dissertations = Storage.getDissertations();

  if (students.length === 0) {
    console.log('No students registered in the system.');
    await pause();
    return;
  }

  console.log(`Total Students: ${students.length}\n`);
  students.forEach((s, idx) => {
    const guide = s.guideId ? Storage.getUserById(s.guideId) : null;
    const diss = dissertations.find((d) => d.studentId === s.id);

    console.log(`${idx + 1}. [${s.id}] ${s.name}`);
    console.log(`   • Email        : ${s.email}`);
    console.log(`   • Department   : ${s.department}`);
    console.log(`   • Assigned Guide: ${guide ? guide.name + ' (' + guide.id + ')' : 'None'}`);
    console.log(`   • Dissertation : ${diss ? diss.topicTitle + ' [' + diss.status + ']' : 'Not Proposed'}`);
    printDivider('-', 55);
  });

  await pause();
}

// 4. View Guides
async function viewGuides() {
  printSubHeader('PG GUIDES & RESEARCH SUPERVISORS');
  const guides = Storage.getGuides();
  const allStudents = Storage.getStudents();

  if (guides.length === 0) {
    console.log('No PG guides registered in the system.');
    await pause();
    return;
  }

  console.log(`Total Guides: ${guides.length}\n`);
  guides.forEach((g, idx) => {
    const assignedCount = allStudents.filter((s) => s.guideId === g.id).length;
    const maxCapacity = g.maxStudents || 3;

    console.log(`${idx + 1}. [${g.id}] ${g.name}`);
    console.log(`   • Designation : ${g.designation || 'Faculty Guide'}`);
    console.log(`   • Department  : ${g.department}`);
    console.log(`   • Email       : ${g.email}`);
    console.log(`   • Ratio/Load  : ${assignedCount} / ${maxCapacity} scholars allocated`);
    printDivider('-', 55);
  });

  await pause();
}

// 5. Assign Guide
async function assignGuide() {
  printSubHeader('ASSIGN PG GUIDE TO STUDENT');

  const students = Storage.getStudents();
  const guides = Storage.getGuides();

  if (students.length === 0) {
    console.log('No students available for guide assignment.');
    await pause();
    return;
  }
  if (guides.length === 0) {
    console.log('No guides available in the system.');
    await pause();
    return;
  }

  console.log('Select Student:');
  students.forEach((s, idx) => {
    const currentGuide = s.guideId ? Storage.getUserById(s.guideId) : null;
    console.log(` ${idx + 1}. [${s.id}] ${s.name} (Current Guide: ${currentGuide ? currentGuide.name : 'Unassigned'})`);
  });
  console.log(` ${students.length + 1}. Cancel`);

  const sChoice = await ask(`Enter choice (1-${students.length + 1}): `);
  const sNum = parseInt(sChoice, 10);
  if (sNum < 1 || sNum > students.length) {
    return;
  }
  const selectedStudent = students[sNum - 1];

  console.log(`\nSelect Guide for ${selectedStudent.name}:`);
  guides.forEach((g, idx) => {
    const studentCount = students.filter((s) => s.guideId === g.id).length;
    console.log(` ${idx + 1}. [${g.id}] ${g.name} (${g.department}) [Current Load: ${studentCount}/${g.maxStudents || 3}]`);
  });
  console.log(` ${guides.length + 1}. Cancel`);

  const gChoice = await ask(`Enter choice (1-${guides.length + 1}): `);
  const gNum = parseInt(gChoice, 10);
  if (gNum < 1 || gNum > guides.length) {
    return;
  }
  const selectedGuide = guides[gNum - 1];

  // Update user guideId
  const allUsers = Storage.getUsers();
  const uIndex = allUsers.findIndex((u) => u.id === selectedStudent.id);
  if (uIndex !== -1) {
    allUsers[uIndex].guideId = selectedGuide.id;
    Storage.saveUsers(allUsers);
  }

  // Update dissertation guide info if existing
  const dissertations = Storage.getDissertations();
  const dIndex = dissertations.findIndex((d) => d.studentId === selectedStudent.id);
  if (dIndex !== -1) {
    dissertations[dIndex].guideId = selectedGuide.id;
    dissertations[dIndex].guideName = selectedGuide.name;
    Storage.saveDissertations(dissertations);
  }

  console.log('\n' + '='.repeat(55));
  console.log(' [✓] GUIDE ASSIGNED SUCCESSFULLY!');
  console.log(` Student : ${selectedStudent.name} (${selectedStudent.id})`);
  console.log(` Guide   : ${selectedGuide.name} (${selectedGuide.id})`);
  console.log('='.repeat(55));

  await pause();
}

// Main Admin Menu Loop
async function adminMenu() {
  let inAdmin = true;

  while (inAdmin) {
    printHeader('ADMIN MENU');
    console.log('1. Add Dissertation Topic');
    console.log('2. View All Topics');
    console.log('3. View Students');
    console.log('4. View Guides');
    console.log('5. Assign Guide');
    console.log('6. Back');
    printDivider('-', 30);

    const choice = await ask('Enter choice (1-6): ');

    switch (choice) {
      case '1':
        await addTopic();
        break;
      case '2':
        await viewAllTopics();
        break;
      case '3':
        await viewStudents();
        break;
      case '4':
        await viewGuides();
        break;
      case '5':
        await assignGuide();
        break;
      case '6':
        inAdmin = false;
        break;
      default:
        console.log('\n[!] Invalid choice. Please select 1, 2, 3, 4, 5, or 6.');
        await pause();
        break;
    }
  }
}

module.exports = adminMenu;
