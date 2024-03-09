import { readFileSync } from "fs";
import path from "path";

export const getQuestion = async (): Promise<[]> => {
  const questionsPath = path.resolve(__dirname, "../questions.json");

  try {
    const questionsData = readFileSync(questionsPath, "utf-8");
    const questions = JSON.parse(questionsData);
    return questions;
  } catch (error: any) {
    console.error("Error reading or parsing questions.json:", error.message);
    throw error;
  }
};
