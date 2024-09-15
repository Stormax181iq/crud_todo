const { parseArgs } = require("node:util");
const readline = require("node:readline/promises");
const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { Client } = pg;
const client = new Client();

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
  exit: {
    type: "boolean",
    short: "e",
  },
};

function printWelcome() {
  console.log(`
    Welcome to my CLI todo app ! Type "--help" for more information on the usage.
    `);
}

function printHelp(helpValue) {
  const helpType = helpValue.toString().replaceAll("-", "");
  if (helpType.toString() === "true") {
    console.log(`
    Add a new item : "--add"
    List the items : "--list [all|pending|done]"
    Update an item : "--done [id]"
    Delete an item : "--delete [id]"
    Show this message : "--help"
    Show the application version : "--version" 
    `);
  }

  if (helpType === "add") {
    console.log(`
      Add a new item : "--add" or "-a".
      Prompts a series of questions to add a new item to your todos.
      You'll be asked for the title of the task and its identifier.
      An error will be thrown if an already existing identifier is specified.
      `);
  }

  if (helpType === "list") {
    console.log(`
      List the todo items : "--list [all|pending|done]" or "-l [all|pending|done]".
      Displays all of the tasks within the specified category :
        "--list all" shows all tasks,
        "--list pending" shows all undone tasks,
        "--list done" shows all done tasks.
      `);
  }

  if (helpType === "done") {
    console.log(`
      Update an item : "--done [id]" or "-u [id]".
      Toggles the state of the todo item with the corresponding id :
        A task marked as "done" will be undone.
        A task marked as "pending" will be done.
      `);
  }

  if (helpType === "delete") {
    console.log(`
      Delete an item : "--delete" or "-d [id]".
      Definitely deletes the corresponding item from the todo list.
      `);
  }

  if (helpType === "version") {
    console.log(`
      Show the application version : "--version" or "-v".
      Prints the version of the application e.g. 1.0.2
      `);
  }

  console.log(`
    For more information on a specific command, type "--help [command]"
    `);
}

async function printAddInstruction() {
  const title = await rl.question("Title : ");
  const id = await rl.question("Id (must be unique number) : ");
  rl.pause();

  addItem(id, title);

  rl.resume();
}

function addItem(id, title) {
  client
    .query(`INSERT INTO todos (id, title) VALUES (${id}, '${title}')`)
    .then(() => {
      console.log("Task added");
    })
    .catch((err) => {
      console.error("Couldn't add the task :", err);
    });
}

function readItems(filter) {
  client
    .query(`SELECT (id, title, done) FROM todos`)
    .then((res) => showItems(res.rows))
    .catch((err) => {
      console.error("Couldn't read the tasks", err);
    });
}

function showItems(rows) {
  console.log(`
    Found ${rows.length} items :
    Id  |     Title     |   Status   |`);
  rows.map((row) => console.log(row.row));
}

async function main() {
  await client
    .connect()
    .then(() => {
      console.log("Connected to PostgreSQL database !");
    })
    .catch((err) => {
      console.error("Error connecting to the database:", err);
    });

  printWelcome();

  rl.on("line", (input) => {
    const {
      values: { help, add, list, done, version, exit },
    } = parseArgs({ args: input.split(" "), options: options, strict: false });

    if (help) {
      printHelp(help);
    }

    if (add) {
      printAddInstruction();
    }

    if (list) {
      readItems(list);
    }

    if (exit) {
      client
        .end()
        .then(() => {
          console.log("Disconnected from the PostgreSQL database");
          process.exit(1);
        })
        .catch((err) => {
          console.error("Error disconnecting from the database:", err);
        });
    }
  });
}

main();
