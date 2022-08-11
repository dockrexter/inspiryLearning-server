const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require('cors')
const http = require('http');
require('dotenv').config()
var models = require('./models');
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/api/users.router");


const app = express();
app.use(cors())

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


app.use("/", indexRouter);

app.use("/api/users", usersRouter);

/**
 * Get port from environment and store in Express.
 */

const port = process.env.PORT || '4000';
app.set('port', port);

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

    server.listen(port, () => {
        console.log("backend running at port", port)
    });
});



