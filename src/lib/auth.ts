import { Router } from "express";
import { Pool } from "pg";
import fetch from "node-fetch";
import { v4 as uuid } from "uuid";


export default (
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    pool: Pool,
    successRedirect: string,
    failureRedirect: string,
) => {
    const router = Router();
    router.get("/", async (req, res, _next) => {
        if (req.query.code !== undefined) {
            const queryParams = {
                grant_type: "authorization_code",
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code: req.query.code,
            }
            const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(queryParams),
            });
            if (tokenRes.ok) {
                const {
                    access_token: accessToken,
                    id_token: jwt,
                    refresh_token: refreshToken,
                } = await tokenRes.json();
                const {
                    sub: id,
                } = getJWT(jwt);
                const cookie = uuid();
                const src = req.ip;
                await updateDB(pool, id, accessToken, refreshToken, cookie, src);
                res.cookie("ccsession", cookie);
                res.redirect(successRedirect);
            } else {
                console.log("bad token")
                res.redirect(failureRedirect);
            }
        } else {
            console.log("no code");
            res.sendStatus(500);
        }
    })
    return router;
};

const getJWT = (payload: string) => {
    const jwtParts = payload.split(".");
    if (jwtParts[1] !== undefined) {
        const buff = Buffer.from(jwtParts[1], "base64");
        const decodedBuffer = buff.toString("utf8");
        try {
            return JSON.parse(decodedBuffer);
        } catch{
            throw new Error("not valid JWT")
        }
    } else {
        throw new Error("not valid JWT");
    }
}

const updateDB = async (pool: Pool, id: string, accessToken: string, refreshToken: string, cookie: string, src: string) => {
    try {
        const client = await pool.connect();
        try {
            await client.query(`BEGIN`);
            const accountRes = await client.query("SELECT * from accounts WHERE id=$1", [id]);
            if (accountRes.rowCount === 0) {
                await client.query("INSERT INTO accounts VALUES ($1,$2,$3,$4)", [id, refreshToken, accessToken,(new Date()).getTime()])
            } else if (accountRes.rowCount === 1) {
                await client.query("UPDATE accounts SET accessToken=$1, refreshToken=$2 WHERE id=$3", [accessToken, refreshToken, id]);
            } else {
                throw new Error();
            }
            await client.query("INSERT INTO sessions VALUES ($1,$2,$3,$4)", [cookie, src, (new Date()).getTime(), id])
            await client.query('COMMIT');
        } catch {
            await client.query('ROLLBACK');
        } finally {
            console.log("----------------DB-------------------")
            console.log("----------------ACCOUNTS-------------------")
            console.log((await client.query('SELECT * FROM accounts')).rows)
            console.log("----------------SESSIONS-------------------")
            console.log((await client.query('SELECT * FROM sessions')).rows)
            client.release();
        }
    } catch {
        throw new Error("Failed to connect to DB");
    }
}