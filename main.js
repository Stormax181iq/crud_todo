const { parseArgs } = require("node:util");
const args = process.argv.slice(2);

const options = {
  help: {
    type: "string",
    short: "h",
  },
  add: {
    type: "boolean",
    short: "a",
  },
  list: {
    type: "string",
    short: "l",
  },
  done: {
    type: "string",
    short: "u",
  },
  delete: {
    type: "string",
    short: "d",
  },
  version: {
    type: "boolean",
    short: "v",
  },
};

const {
  values: { help, add, list, done, version },
} = parseArgs({ options, strict: false });

function printWelcome() {
  console.log(`
    Welcome to my CLI todo app ! Type "node . --help" for more information on the usage.
    `);
}

function printHelp(helpValue) {
  const helpType = helpValue.toString().replaceAll("-", "");
  if (helpType.toString() === "true") {
    console.log(`
    Add a new item : "node . --add"
    List the items : "node . --list [all|pending|done]"
    Update an item : "node . --done [id]"
    Delete an item : "node . --delete [id]"
    Show this message : "node . --help"
    Show the application version : "node . --version" 
    `);
  }

  if (helpType === "add") {
    console.log(`
      Add a new item : "node . --add" or "node . -a".
      Prompts a series of questions to add a new item to your todos.
      You'll be asked for the title of the task and its identifier.
      An error will be thrown if an already existing identifier is specified.
      `);
  }

  if (helpType === "list") {
    console.log(`
      List the todo items : "node . --list [all|pending|done]" or "node . -l [all|pending|done]".
      Displays all of the tasks within the specified category :
        "node . --list all" shows all tasks,
        "node . --list pending" shows all undone tasks,
        "node . --list done" shows all done tasks.
      `);
  }

  if (helpType === "done") {
    console.log(`
      Update an item : "node . --done [id]" or "node . -u [id]".
      Toggles the state of the todo item with the corresponding id :
        A task marked as "done" will be undone.
        A task marked as "pending" will be done.
      `);
  }

  if (helpType === "delete") {
    console.log(`
      Delete an item : "node . --delete" or "node . -d [id]".
      Definitely deletes the corresponding item from the todo list.
      `);
  }

  if (helpType === "version") {
    console.log(`
      Show the application version : "node . --version" or "node . -v".
      Prints the version of the application e.g. 1.0.2
      `);
  }

  console.log(`
    For more information on a specific command, type "node . --help [command keyword]"
    `);
}

function main() {
  if (args.length === 0) {
    printWelcome();
  }
  if (help) {
    printHelp(help);
  }
}

main();
