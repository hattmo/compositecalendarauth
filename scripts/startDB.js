const { exec } = require("child_process");
const { promisify } = require("util");
const { Pool } = require("pg");
const execp = promisify(exec);
const sleep = promisify(setTimeout);

(async () => {
    try {
        await execp("docker rm -f ccpg");
        console.log("stoped old DB")
    } catch {
        console.log("no old DB to stop");
    }
    const { stderr, stdout } = await execp("docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=postgres --name ccpg postgres")
    console.log("started new DB");
    const pool = new Pool({
        user: "postgres",
        host: "localhost",
        database: "postgres",
        password: "password",
        port: 5432,
    });
    await sleep(5000);
    await pool.query("\
            CREATE TABLE accounts (\
            id VARCHAR(32),\
            accessToken VARCHAR(256),\
            refreshToken VARCHAR(256),\
            lastUpdate VARCHAR(256),\
            lastRefresh VARCHAR(256)\
        )");
    await pool.query("\
        CREATE TABLE sessions (\
        cookie VARCHAR(256),\
        src VARCHAR(64),\
        expires VARCHAR(256),\
        id VARCHAR(32)\
    )");
    console.log("DB setup complete");
})()
