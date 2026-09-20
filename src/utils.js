const readline = require('readline');

let rlInstance = null;

function getRL() {
  if (!rlInstance) {
    rlInstance = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  return rlInstance;
}

// Ask a question asynchronously and return answer
function ask(questionText) {
  const rl = getRL();
  return new Promise((resolve) => {
    rl.question(questionText, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Wait for Enter key to continue
async function pause() {
  await ask('\nPress [ENTER] to continue...');
}

// Close readline when exiting
function closeRL() {
  if (rlInstance) {
    rlInstance.close();
    rlInstance = null;
  }
}

// Print section banner
function printHeader(title) {
  console.log('\n' + '='.repeat(50));
  console.log(` ${title.toUpperCase()}`);
  console.log('='.repeat(50));
}

// Print clean sub-header
function printSubHeader(subtitle) {
  console.log('\n--- ' + subtitle + ' ---');
}

// Print divider line
function printDivider(char = '-', length = 50) {
  console.log(char.repeat(length));
}

module.exports = {
  ask,
  pause,
  closeRL,
  printHeader,
  printSubHeader,
  printDivider
};
