import { pgTable, text, timestamp, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('admin'), // 'super_admin' or 'admin'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pools = pgTable('pools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const participants = pgTable('participants', {
  id: text('id').primaryKey(),
  poolId: text('pool_id').references(() => pools.id).notNull(),
  name: text('name').notNull(),
  totalPoints: integer('total_points').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  apiId: integer('api_id').unique(), // nullable for manual teams
  name: text('name').notNull(),
  logoUrl: text('logo_url').notNull(),
  country: text('country'),
});

export const matches = pgTable('matches', {
  id: text('id').primaryKey(),
  apiId: integer('api_id').unique(), // nullable for manual matches
  leagueId: integer('league_id'),
  homeTeamId: text('home_team_id').references(() => teams.id).notNull(),
  awayTeamId: text('away_team_id').references(() => teams.id).notNull(),
  matchDate: timestamp('match_date').notNull(),
  status: text('status').notNull(), // NS, 1H, HT, 2H, ET, FT, etc.
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  homeScoreHt: integer('home_score_ht'),
  awayScoreHt: integer('away_score_ht'),
  isManual: boolean('is_manual').default(false).notNull(),
  venue: text('venue'),
  round: text('round'),
  season: integer('season'),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
});

export const poolMatches = pgTable('pool_matches', {
  poolId: text('pool_id').references(() => pools.id).notNull(),
  matchId: text('match_id').references(() => matches.id).notNull(),
}, (t) => [
  primaryKey({ columns: [t.poolId, t.matchId] }),
]);

export const predictions = pgTable('predictions', {
  id: text('id').primaryKey(),
  participantId: text('participant_id').references(() => participants.id).notNull(),
  matchId: text('match_id').references(() => matches.id).notNull(),
  poolId: text('pool_id').references(() => pools.id).notNull(),
  predictedHome: integer('predicted_home').notNull(),
  predictedAway: integer('predicted_away').notNull(),
  pointsEarned: integer('points_earned').default(0).notNull(),
  isScored: boolean('is_scored').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
