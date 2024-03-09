"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionSchema = exports.adminSchema = exports.teamSchema = void 0;
const zod_1 = require("zod");
exports.teamSchema = zod_1.z.object({
    teamId: zod_1.z.number(),
    teamPassword: zod_1.z.string(),
});
exports.adminSchema = zod_1.z.object({
    adminId: zod_1.z.string(),
    adminPassword: zod_1.z.string(),
});
exports.questionSchema = zod_1.z.object({
    question: zod_1.z.string(),
    options: zod_1.z.array(zod_1.z.string()),
    answer: zod_1.z.number(),
});
