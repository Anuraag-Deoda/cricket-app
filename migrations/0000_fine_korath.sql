CREATE TABLE `ai_commentary` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`ball_id` text NOT NULL,
	`content` text NOT NULL,
	`ai_provider` text NOT NULL,
	`token_usage` integer,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ball_id`) REFERENCES `balls`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `balls` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`over_id` text NOT NULL,
	`ball_number` integer NOT NULL,
	`batsman_id` text NOT NULL,
	`bowler_id` text NOT NULL,
	`runs` integer NOT NULL,
	`extras` integer DEFAULT 0,
	`extra_type` text,
	`is_wicket` integer DEFAULT false,
	`wicket_type` text,
	`dismissed_player_id` text,
	`commentary` text,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`over_id`) REFERENCES `overs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`batsman_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bowler_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dismissed_player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `innings` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`batting_team_id` text NOT NULL,
	`bowling_team_id` text NOT NULL,
	`innings_number` integer NOT NULL,
	`total_runs` integer DEFAULT 0,
	`total_wickets` integer DEFAULT 0,
	`total_overs` real DEFAULT 0,
	`total_balls` integer DEFAULT 0,
	`extras` integer DEFAULT 0,
	`is_completed` integer DEFAULT false,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`batting_team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bowling_team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match_awards` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`player_id` text NOT NULL,
	`award_type` text NOT NULL,
	`reasoning` text,
	`highlight_moment` text,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`team1_id` text NOT NULL,
	`team2_id` text NOT NULL,
	`format` text NOT NULL,
	`overs_per_innings` integer NOT NULL,
	`pitch_type` text,
	`toss_winner_id` text,
	`toss_decision` text,
	`current_innings` integer DEFAULT 1,
	`status` text DEFAULT 'upcoming',
	`target` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`team1_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team2_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`toss_winner_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `overs` (
	`id` text PRIMARY KEY NOT NULL,
	`innings_id` text NOT NULL,
	`over_number` integer NOT NULL,
	`bowler_id` text NOT NULL,
	`runs` integer DEFAULT 0,
	`wickets` integer DEFAULT 0,
	`extras` integer DEFAULT 0,
	`is_completed` integer DEFAULT false,
	FOREIGN KEY (`innings_id`) REFERENCES `innings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bowler_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `partnerships` (
	`id` text PRIMARY KEY NOT NULL,
	`innings_id` text NOT NULL,
	`batsman1_id` text NOT NULL,
	`batsman2_id` text NOT NULL,
	`runs` integer DEFAULT 0,
	`balls` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	FOREIGN KEY (`innings_id`) REFERENCES `innings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`batsman1_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`batsman2_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`batting_style` text,
	`bowling_style` text,
	`skill_rating` integer DEFAULT 50,
	`form_rating` integer DEFAULT 0,
	`batting_average` real DEFAULT 0,
	`strike_rate` real DEFAULT 0,
	`bowling_average` real DEFAULT 0,
	`economy` real DEFAULT 0,
	`fifties` integer DEFAULT 0,
	`hundreds` integer DEFAULT 0,
	`wickets` integer DEFAULT 0,
	`appearances` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`logo` text,
	`country` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
