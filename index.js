require("dotenv").config();
const path = require("path");
const cors = require("cors");
const http = require("http");
const express = require("express");
const utils = require("./utils/utils");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const models = require("./models");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/api/users.router");
const assignmentsRouter = require("./routes/api/assignments.router");

const app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

utils.mkdir("./public");
utils.mkdir("./public/uploads");

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/public", express.static(path.join(__dirname, "/public")));

/**
 * Get port from environment and store in Express.
 */

const port = process.env.PORT || "4000";
app.set("port", port);

/**
 * Create HTTP server.
 */
models.sequelize.sync({ focus: true }).then(function () {
  /**
   * Listen on provided port, on all network interfaces.
   */
  const server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port, "0.0.0.0", () => {
    console.log("backend running at port", port);
  });
});
