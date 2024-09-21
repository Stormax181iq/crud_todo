const { parseArgs } = require("node:util");
const readline = require("node:readline/promises");
const pg = require("pg");
const dotenv = require("dotenv");
const pjson = require("./package.json");

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
      You can update several items at once with the following syntax :
        "--done [id1],[id2],[idn]"
      `);
  }

  if (helpType === "delete") {
    console.log(`
      Delete an item : "--delete" or "-d [id]".
      Definitely deletes the corresponding item from the todo list.
      You can delete several items at once with the following syntax :
        "--delete [id1],[id2],[idn]"
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
  let query = "SELECT (id, title, done) FROM todos";
  switch (filter) {
    case "done":
      query += " WHERE done = true";
      break;
    case "pending":
      query += " WHERE done = false";
      break;
    default:
      break;
  }
  client
    .query(query)
    .then((res) => showItems(res.rows))
    .catch((err) => {
      console.error("Couldn't read the tasks", err);
    });
}

function showItems(rows) {
  const tasks = rows.map((item) => {
    const arrItems = item.row.slice(1, -1).split(",");
    const jsonItems = {
      id: arrItems[0],
      title: arrItems[1],
      done: arrItems[2] === "t",
    };
    return jsonItems;
  });
  console.log(`
    Found ${rows.length} items :
    Id  |   Title   |   Status`);
  tasks.forEach((task) => {
    console.log(`
    ${task.id}   | ${task.title} | ${task.done ? "Done" : "Pending"}
    _______________________________________________`);
  });
}

function updateItem(ids) {
  let query = `UPDATE todos SET done = NOT done WHERE id = `;

  ids.split(",").forEach((id) => {
    client
      .query(query + id)
      .then(
        console.log(`
        Task updated
        `)
      )
      .catch((err) => console.error("Couldn't update the task:", err));
  });
}

function deleteItem(ids) {
  const query = `DELETE FROM todos WHERE id = `;

  ids.split(",").forEach((id) => {
    client
      .query(query + id)
      .then(
        console.log(`
        Task deleted
        `)
      )
      .catch((err) => console.error("Couldn't delete the task:", err));
  });
}

function printVersion() {
  console.log(pjson.version);
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
      values: { help, add, list, done, delete: remove, version, exit },
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

    if (done) {
      updateItem(done);
    }

    if (remove) {
      deleteItem(remove);
    }

    if (version) {
      printVersion();
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
