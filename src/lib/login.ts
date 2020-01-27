import { Router } from "express";
import querystring from "querystring";


export default (clientId: string, scope: string, redirectUri: string) => {
    const router = Router();

    router.get("/", (_req, res, _next) => {
        const queryParams = {
            access_type: "offline",
            prompt: "consent",
            response_type: "code",
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
            state: "1234",
        };
        const parsedQueryString = querystring.stringify(queryParams);
        res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${parsedQueryString}`);
    })
    return router;
};
