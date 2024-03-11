// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { addPoints, getTeam } from "./db/utilFunction.js";
import {
  adminCredentialsType,
  questionType,
  teamDataType,
  teamSchema,
} from "./zod/types.js";
import "dotenv/config";
import { getQuestion } from "./utils/getQuestions.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.use("/", (req, res) => {
  res.send("the backend server is running");
});

const port = process.env.PORT || 3000;

let presentParticipants: string[] = [];

let answerMutex = false;

let currentQuestion: number = 0;

let answers: any = [];

let questionList: Array<questionType>;

(async () => {
  questionList = await getQuestion();
  console.log(questionList);
})();

// Serve static files from the "public" directory
// app.use(express.static("public"));

// Define a Socket.io connection
io.of("/answer").on("connection", (socket) => {
  console.log("A user connected to /answer");

  // io.of("/").socketsJoin(`${process.env.QUIZ_CODE}`);

  socket.on("startUserTimer", () => {
    io.of("/").to(`${process.env.QUIZ_CODE}`).emit("startUserTimer", {});
  });

  socket.on("participantAnswer", (data) => {
    if (answerMutex === true) {
      answers.push(data);
      console.log(answers);
    }
  });
});

io.of("/admin-dash").on("connection", (adminSocket) => {
  console.log("A user connected to /admin-dash");
  adminSocket.on("disconnect", () => {
    console.log("A user disconnected from /admin-dash");
  });

  adminSocket.on("screenChange", (data) => {
    console.log("screenChange", data);
    io.of("/").to(`${process.env.QUIZ_CODE}`).emit("screenChange", data.screen);
    if (data.screen === "LeaderBoard") {
      adminSocket.emit("getCurrentQuestionNumber", {}, (data: any) => {
        currentQuestion = data.currentQuestion;
      });
      if (answers.length) {
        answers.forEach((answer: any) => {
          if (questionList[currentQuestion]?.answer === answer.answer) {
            addPoints(answer.teamNumber, 10000 - answer.time);
          }
        });
      }
    } else if (data.screen === "QuestionInScreen") {
      answers = [];
    }
  });

  adminSocket.on("getLeaderBoard", (data, callback) => {
    callback(answers);
  });

  adminSocket.on("quiz-ended", () => {
    io.of("/").to(`${process.env.QUIZ_CODE}`).emit("quiz-ended");
    presentParticipants = [];
  });

  adminSocket.on("setAnswerMutex", (data) => {
    answerMutex = data;
  });

  adminSocket.on("getQuestionList", async (data, callback) => {
    let questionList = await getQuestion();
    callback({ questionList: [...questionList] });
  });

  //admin timer update
  adminSocket.on("adminTimerUpdate", (data) => {
    console.log("timer update", data);
    io.of("/").to(`${process.env.QUIZ_CODE}`).emit("timerUpdate", data.time);
  });
});

io.on("connection", (socket) => {
  console.log("A user connected");

  //joining socket if already in quiz
  socket.on("connectToQuiz", (data) => {
    console.log("connectToQuiz", data);
    if (data.inQuiz === "true") {
      console.log("request to reconnect approved");
      socket.join(`${process.env.QUIZ_CODE}`);
    }
  });

  // Admin-Auth
  socket.on("admin-login", (data: adminCredentialsType, callback) => {
    console.log(`admin tried to login: ${data.adminId} ${data.adminPassword}`);
    let adminFlag;
    if (
      data.adminId === process.env.ADMIN_ID &&
      data.adminPassword === process.env.ADMIN_PASSWORD
    ) {
      adminFlag = true;
      socket.join(`${process.env.QUIZ_CODE}`);
    } else {
      adminFlag = false;
    }

    callback({ adminFlag });
  });

  // Auth
  socket.on("auth-team", async (data, callback) => {
    let team: teamDataType = {
      teamId: data.teamId,
      teamPassword: data.teamPassword,
    };

    let parse = teamSchema.safeParse(team);

    if (!parse.success) {
      console.log("invaild input info");
      callback({ authFlag: false });
      return;
    }

    let validTeam = await getTeam(team);

    if (
      data.teamPassword === validTeam[0].teamPassword &&
      data.teamId === validTeam[0].teamNumber
    ) {
      if (!presentParticipants.includes(`${validTeam[0].teamNumber}`)) {
        presentParticipants.push(`${validTeam[0].teamNumber}`);
        socket.join(`${process.env.QUIZ_CODE}`);
      } else {
        callback({
          authFlag: false,
        });
        return;
      }
      io.of("admin-dash").emit("participantListUpdate", presentParticipants);
      callback({
        authFlag: true,
      });
    } else {
      callback({
        authFlag: false,
      });
    }
  });

  //cancel-quiz
  socket.on("cancel-quiz", () => {
    console.log("emitted cancel event");
    presentParticipants = [];
    socket.broadcast.to(`${process.env.QUIZ_CODE}`).emit("cancel-quiz");
  });

  // Emit the list of participants
  socket.on("participant:list", (data, callback) => {
    callback(presentParticipants);
  });

  //start quiz
  socket.on("start-quiz", () => {
    socket.broadcast.to(`${process.env.QUIZ_CODE}`).emit("start-quiz");
  });

  socket.emit("message", "Welcome to the server!");
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
