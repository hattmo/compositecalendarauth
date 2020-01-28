
const { Pool } = require("pg");

(async () => {
    try {
        const pool = new Pool({
            user: "postgres",
            host: "localhost",
            database: "postgres",
            password: "password",
            port: 5432,
        });
        const accountsRes = await pool.query("SELECT * FROM accounts");
        const sessionsRes = await pool.query("SELECT * FROM sessions");
        console.log("---------------------DB---------------------")
        console.log("---------------------ACCOUNTS---------------")
        console.log(accountsRes.rows);
        console.log("---------------------SESSIONS---------------")
        console.log(sessionsRes.rows);
        console.log("DB setup complete");
        pool.end();
    } catch (e) {
        console.log(e);
    }

})()
