const { ask, closeRL, printHeader, printDivider } = require('./src/utils');
const studentMenu = require('./src/menus/studentMenu');
const guideMenu = require('./src/menus/guideMenu');
const adminMenu = require('./src/menus/adminMenu');

async function main() {
  let running = true;

  while (running) {
    if (process.stdout.isTTY) {
      console.clear();
    }
    console.log('========================================');
    console.log(' PG DISSERTATION MANAGEMENT SYSTEM');
    console.log('========================================\n');
    console.log('1. Student');
    console.log('2. Guide');
    console.log('3. Admin');
    console.log('4. Exit\n');

    const choice = await ask('Enter choice: ');

    switch (choice) {
      case '1':
        await studentMenu();
        break;
      case '2':
        await guideMenu();
        break;
      case '3':
        await adminMenu();
        break;
      case '4':
      case 'exit':
      case 'quit':
        console.log('\nThank you for using PG Dissertation Management System.');
        console.log('Exiting...\n');
        closeRL();
        running = false;
        process.exit(0);
        break;
      default:
        console.log('\n[!] Invalid selection. Please enter 1, 2, 3, or 4.');
        await new Promise((res) => setTimeout(res, 1200));
        break;
    }
  }
}

// Run application
main().catch((err) => {
  console.error('\nFatal error running application:', err);
  process.exit(1);
});
