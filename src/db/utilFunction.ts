import { db } from "../drizzle/drizzle";
import { eq } from "drizzle-orm";
import { teamDataType } from "../zod/types";
import { teams, points } from "./schema";

export async function insertTeam(data: teamDataType) {
  await db.insert(teams).values({
    teamNumber: data.teamId,
    teamPassword: data.teamPassword,
  });
}

export async function getTeam(data: teamDataType) {
  return await db.select().from(teams).where(eq(teams.teamNumber, data.teamId));
}

export async function deleteTeams() {
  await db.delete(teams);
}

export async function addPoints(teamNumber: number, pointToAdd: number) {
  let team = await db.query.points.findMany({
    where: eq(points.teamNumber, teamNumber),
  });

  if (team.length === 0) {
    await db.insert(points).values({
      teamNumber: teamNumber,
      points: pointToAdd,
    });
  } else {
    await db
      .update(points)
      .set({ points: team[0].points + pointToAdd })
      .where(eq(points.teamNumber, teamNumber));
  }
}
