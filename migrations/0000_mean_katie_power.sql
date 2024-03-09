CREATE TABLE `points` (
	`team_number` integer PRIMARY KEY NOT NULL,
	`points` integer NOT NULL,
	FOREIGN KEY (`team_number`) REFERENCES `teams`(`team_number`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quiz` (
	`quiz_number` text PRIMARY KEY NOT NULL,
	`quiz_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`team_number` integer PRIMARY KEY NOT NULL,
	`team_password` text NOT NULL
);
