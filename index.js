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
const paymentRouter = require("./routes/api/payment.router");
const fcmtokenRouter = require("./routes/api/fcmtoken.router");
const attachmentsRouter = require("./routes/api/attachment.router");
const assignmentsRouter = require("./routes/api/assignments.router");

const { addUser, removeUser, userCount } = require("./utils/room");
const { getChat, postChat } = require("./controllers/chat.controller");

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
app.use("/api/token", fcmtokenRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/attachments", attachmentsRouter);
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
   * Socket.io configuration for the server
   */

  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", async ({ user_id, assignment_id }) => {
      const { user, error } = addUser({
        id: socket.id,
        name: user_id,
        room: assignment_id,
      });

      if (error) return error;

      socket.join(user.room);

      io.to(user.room).emit("online", userCount(user.room) >= 2);

      socket.on("typing", (data) => {
        socket.broadcast.to(user.room).emit("typing", data);
      });

      const chat = await getChat(assignment_id);

      socket.emit("getChat", chat);

      socket.broadcast
        .to(user.room)
        .emit("userJoined", { message: `${user.name} has joined!` });

      socket.on("sendMessage", async (data) => {
        const { error } = await postChat(data);
        if (error) {
          await socket.broadcast.to(user.room).emit("error", error);
        } else {
          await socket.broadcast.to(user.room).emit("message", data);
        }
      });
    });

    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
      if (user) {
        io.to(user.room).emit("online", userCount(user.room) >= 2);
        socket.to(user.room).emit("message", {
          message: `${user.name} just left the room!`,
        });
      }
    });
  });

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port, "0.0.0.0", () => {
    console.log("backend running at port", port);
  });
});
