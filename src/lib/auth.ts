import { Router } from "express";
import fetch from "node-fetch";
import { v4 as uuid } from "uuid";
import { IDatabaseModel } from "./db";

export default (
    clientId: string,
    clientSecret: string,
    authRedirect: string,
    successRedirect: string,
    failureRedirect: string,
    db: IDatabaseModel,
) => {
    const router = Router();
    router.get("/", async (req, res, _next) => {
        if (req.query.code !== undefined) {
            const queryParams = {
                grant_type: "authorization_code",
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: authRedirect,
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
                await db.updateUser(id, refreshToken, accessToken, cookie, src);
                res.cookie("ccsession", cookie);
                res.redirect(successRedirect);
            } else {
                res.redirect(failureRedirect);
            }
        } else {
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


