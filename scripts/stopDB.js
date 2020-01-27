const { exec } = require("child_process");
const { promisify } = require("util");
const execp = promisify(exec);
(async () => {
    try {
        await execp("docker rm -f ccpg");
    } catch {
        console.log("no database to stop");
    }
})()