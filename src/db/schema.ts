import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const teams = sqliteTable("teams", {
  teamNumber: integer("team_number").notNull().primaryKey(),
  teamPassword: text("team_password").notNull(),
});

export const points = sqliteTable("points", {
  teamNumber: integer("team_number")
    .notNull()
    .references(() => teams.teamNumber)
    .primaryKey(),
  points: integer("points").notNull(),
});

export const quiz = sqliteTable("quiz", {
  quizNumber: text("quiz_number").notNull().primaryKey(),
  QuizJson: text("quiz_json", { mode: "json" }).notNull(),
});

export type InsertTeam = typeof teams.$inferInsert;
export type SelectTeam = typeof teams.$inferSelect;
export type InsertPoints = typeof points.$inferInsert;
export type SelectPoints = typeof points.$inferSelect;
export type InsertQuiz = typeof quiz.$inferInsert;
export type SelectQuiz = typeof quiz.$inferSelect;
