import { integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const discoverySignals = pgTable('discovery_signals', {
  visitorId: uuid('visitor_id').notNull(),
  discoveryId: text('discovery_id').notNull(),
  mode: text('mode').notNull(),
  topic: text('topic').notNull(),
  tags: jsonb('tags').$type<string[]>().notNull(),
  status: text('status').notNull().default('shown'),
  shownCount: integer('shown_count').notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [primaryKey({ columns: [table.visitorId, table.discoveryId] })])
