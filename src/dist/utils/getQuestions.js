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
exports.getQuestion = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const getQuestion = () => __awaiter(void 0, void 0, void 0, function* () {
    const questionsPath = path_1.default.resolve(__dirname, "../questions.json");
    try {
        const questionsData = (0, fs_1.readFileSync)(questionsPath, "utf-8");
        const questions = JSON.parse(questionsData);
        return questions;
    }
    catch (error) {
        console.error("Error reading or parsing questions.json:", error.message);
        throw error;
    }
});
exports.getQuestion = getQuestion;
