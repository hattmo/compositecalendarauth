import express from "express";
import login from "./login";
import auth from "./auth";
import pg from "pg";

const pool = new pg.Pool();

const app = express();

app.use("/auth", auth(
  "1080184656423-2ue1gt1t85mhe98mac7nqipqhl2c55d4.apps.googleusercontent.com",
  "JkuTZwbtATLkIpaYaghB5po2",
  "http://localhost/auth",
  pool,
  "/",
  "/",
));
app.use("/login", login(
  "1080184656423-2ue1gt1t85mhe98mac7nqipqhl2c55d4.apps.googleusercontent.com",
  "openid email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.appdata",
  "http://localhost/auth",
));

app.use((err, _req, res, _next) => {

  if (err === 404) {
    res.sendStatus(404);
  } else {
    res.sendStatus(500);
    process.stderr.write(err + "\n");
  }
});

export default app;
