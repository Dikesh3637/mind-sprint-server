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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPoints = exports.deleteTeams = exports.getTeam = exports.insertTeam = void 0;
const drizzle_1 = require("../drizzle/drizzle");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("./schema");
function insertTeam(data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield drizzle_1.db.insert(schema_1.teams).values({
            teamNumber: data.teamId,
            teamPassword: data.teamPassword,
        });
    });
}
exports.insertTeam = insertTeam;
function getTeam(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield drizzle_1.db.select().from(schema_1.teams).where((0, drizzle_orm_1.eq)(schema_1.teams.teamNumber, data.teamId));
    });
}
exports.getTeam = getTeam;
function deleteTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        yield drizzle_1.db.delete(schema_1.teams);
    });
}
exports.deleteTeams = deleteTeams;
function addPoints(teamNumber, pointToAdd) {
    return __awaiter(this, void 0, void 0, function* () {
        let team = yield drizzle_1.db.query.points.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.points.teamNumber, teamNumber),
        });
        if (team.length === 0) {
            yield drizzle_1.db.insert(schema_1.points).values({
                teamNumber: teamNumber,
                points: pointToAdd,
            });
        }
        else {
            yield drizzle_1.db
                .update(schema_1.points)
                .set({ points: team[0].points + pointToAdd })
                .where((0, drizzle_orm_1.eq)(schema_1.points.teamNumber, teamNumber));
        }
    });
}
exports.addPoints = addPoints;
