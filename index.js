const twofactor = require("node-2fa");
const commander = require("commander");
var sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("./db/accs.db");
const program = new commander.Command();
program.version("0.0.1");
program
  .command("add")
  .description("Add new 2fa")
  .argument("<name>", "Name/ID")
  .argument("<secret>", "Secret token")
  .action((name, secret) => {
    db.run(
      `
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT ,
        name string NOT NULL,
        secret string NOT NULL
        );
    `
    ).run(`INSERT INTO accounts(name, secret) values('${name}','${secret}')`);
    db.close();
  });

program
  .command("list")
  .description("list all 2fa")
  .action(() => {
    db.all(`SELECT * FROM accounts`, (err, rows) => {
      if (err) {
        console.log("Something wrong!");
      } else {
        rows.forEach((row) => {
          try {
            const token = twofactor.generateToken(row.secret);
            console.log(
              `${row.name} - ${token ? token.token : "Invalid secret"}`
            );
          } catch {
            console.log("Invalid secret for " + row.name);
          }
        });
      }
    });
    db.close();
  });

program
  .command("remove")
  .argument("<name>", "Name/ID")
  .description("remove 2fa")
  .action((name) => {
    db.run(`DELETE FROM accounts WHERE name = '${name}'`);
    db.close();
  });
program.parse();
