const args = process.argv.slice(2);

function printWelcome() {
  console.log(
    `Welcome to my CLI todo app ! Type "node . --help" for more information on the usage.`
  );
}

function printHelp() {
  console.log(`
    Add a new item : "node . --new"
    List the items : "node . --list [all|pending|done]"
    Update an item : "node . --done [id]"
    Delete an item : "node . --delete [id]"
    Show this message : "node . --help"
    Show the application version : "node . --version" 

    For more information on each specific command, type "node . --help [command]"
    `);
}

function parseArguments() {
  const options = {};

  if (args.length === 0) {
    options.welcome = true;
  }

  if (args[0] === "help" || args[0] === "--help") {
    options.help = true;
  }

  return options;
}

function main() {
  const options = parseArguments();

  if (options.welcome) {
    printWelcome();
  }
  if (options.help) {
    printHelp();
  }
}

main();
