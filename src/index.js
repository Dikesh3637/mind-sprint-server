"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.js
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const utilFunction_js_1 = require("./db/utilFunction.js");
const types_js_1 = require("./zod/types.js");
require("dotenv/config");
const getQuestions_js_1 = require("./utils/getQuestions.js");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
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
let presentParticipants = [];
let answerMutex = false;
let currentQuestion = 0;
let answers = [];
let questionList;
(() => __awaiter(void 0, void 0, void 0, function* () {
    questionList = yield (0, getQuestions_js_1.getQuestion)();
    console.log(questionList);
}))();
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
            adminSocket.emit("getCurrentQuestionNumber", {}, (data) => {
                currentQuestion = data.currentQuestion;
            });
            if (answers.length) {
                answers.forEach((answer) => {
                    var _a;
                    if (((_a = questionList[currentQuestion]) === null || _a === void 0 ? void 0 : _a.answer) === answer.answer) {
                        (0, utilFunction_js_1.addPoints)(answer.teamNumber, 10000 - answer.time);
                    }
                });
            }
        }
        else if (data.screen === "QuestionInScreen") {
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
    adminSocket.on("getQuestionList", (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
        let questionList = yield (0, getQuestions_js_1.getQuestion)();
        callback({ questionList: [...questionList] });
    }));
    //admin timer update
    adminSocket.on("adminTimerUpdate", (data) => {
        console.log("timer update", data);
        io.of("/").to(`${process.env.QUIZ_CODE}`).emit("timerUpdate", data.time);
    });
});
io.on("connection", (socket) => {
    console.log("A user connected");
    //joining socket if already in quiz
    socket.on("connectToQuiz", (data, callback) => {
        console.log("connectToQuiz", data);
        if (data.inQuiz === "true") {
            console.log("request to reconnect approved");
            socket.join(`${process.env.QUIZ_CODE}`);
        }
    });
    // Admin-Auth
    socket.on("admin-login", (data, callback) => {
        console.log(`admin tried to login: ${data.adminId} ${data.adminPassword}`);
        let adminFlag;
        if (data.adminId === process.env.ADMIN_ID &&
            data.adminPassword === process.env.ADMIN_PASSWORD) {
            adminFlag = true;
            socket.join(`${process.env.QUIZ_CODE}`);
        }
        else {
            adminFlag = false;
        }
        callback({ adminFlag });
    });
    // Auth
    socket.on("auth-team", (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
        let team = {
            teamId: data.teamId,
            teamPassword: data.teamPassword,
        };
        let parse = types_js_1.teamSchema.safeParse(team);
        if (!parse.success) {
            console.log("invaild input info");
            callback({ authFlag: false });
            return;
        }
        let validTeam = yield (0, utilFunction_js_1.getTeam)(team);
        if (data.teamPassword === validTeam[0].teamPassword &&
            data.teamId === validTeam[0].teamNumber) {
            if (!presentParticipants.includes(`${validTeam[0].teamNumber}`)) {
                presentParticipants.push(`${validTeam[0].teamNumber}`);
                socket.join(`${process.env.QUIZ_CODE}`);
            }
            else {
                callback({
                    authFlag: false,
                });
                return;
            }
            io.of("admin-dash").emit("participantListUpdate", presentParticipants);
            callback({
                authFlag: true,
            });
        }
        else {
            callback({
                authFlag: false,
            });
        }
    }));
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
