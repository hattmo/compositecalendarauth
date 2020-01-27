import express from "express";
import login from "./login";
import auth from "./auth";
import pg from "pg";

const {
  SUCESS_REDIRECT,
  FAILURE_REDIRECT,
  AUTH_REDIRECT,
  CLIENT_ID,
  CLIENT_SECRET,
  SCOPES
} = process.env;

if (!(SUCESS_REDIRECT &&
  FAILURE_REDIRECT &&
  AUTH_REDIRECT &&
  CLIENT_ID &&
  CLIENT_SECRET &&
  SCOPES)) {
  process.stderr.write("Evironment variables not set\n")
  process.exit(1);
}

const pool = new pg.Pool();

const app = express();

app.use("/auth", auth(
  CLIENT_ID,
  CLIENT_SECRET,
  AUTH_REDIRECT,
  SUCESS_REDIRECT,
  FAILURE_REDIRECT,
  pool,
));
app.use("/login", login(
  CLIENT_ID,
  SCOPES,
  AUTH_REDIRECT,
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
