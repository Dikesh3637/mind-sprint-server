"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quiz = exports.points = exports.teams = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.teams = (0, sqlite_core_1.sqliteTable)("teams", {
    teamNumber: (0, sqlite_core_1.integer)("team_number").notNull().primaryKey(),
    teamPassword: (0, sqlite_core_1.text)("team_password").notNull(),
});
exports.points = (0, sqlite_core_1.sqliteTable)("points", {
    teamNumber: (0, sqlite_core_1.integer)("team_number")
        .notNull()
        .references(() => exports.teams.teamNumber)
        .primaryKey(),
    points: (0, sqlite_core_1.integer)("points").notNull(),
});
exports.quiz = (0, sqlite_core_1.sqliteTable)("quiz", {
    quizNumber: (0, sqlite_core_1.text)("quiz_number").notNull().primaryKey(),
    QuizJson: (0, sqlite_core_1.text)("quiz_json", { mode: "json" }).notNull(),
});
