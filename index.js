const H027 = require("./src/H027Client");
const client = new H027('5439888379:AAF4WIHrCb0c0LjcV6l0SmDNWLxjgjo9jNw');

const util = require('util');
const fs = require('fs');
const readdir = util.promisify(fs.readdir);

(async () => {
    const folder = await readdir('./src/commands/');
    folder.forEach(async (cmd) => {
        const cmdName = cmd.split('.')[0];
        const response = await client.loadCommand(folder, cmdName);
        if (response) {
            console.log(response);
        }       
    });

    client.login();
})();