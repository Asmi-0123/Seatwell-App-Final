import { pgTable as table, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const users = table("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  type: text("type").notNull().default("buyer"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});


export const games = table("games", {
  id: serial("id").primaryKey(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  date: text("date").notNull(),
  venue: text("venue").notNull(),
  status: text("status").notNull().default("upcoming"),
  image: text("image"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});


export const tickets = table("tickets", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  buyerId: integer("buyer_id").references(() => users.id),
  seatNumber: text("seat_number").notNull(),
  price: integer("price").notNull(),
  status: text("status").notNull().default("available"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  soldAt: text("sold_at"),
});


export const transactions = table("transactions", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  buyerId: integer("buyer_id").references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});


export const siteContent = table("site_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull(),
});


export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  type: true,
});

export const insertGameSchema = createInsertSchema(games).pick({
  homeTeam: true,
  awayTeam: true,
  date: true,
  venue: true,
  status: true,
  image: true,
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  gameId: true,
  sellerId: true,
  seatNumber: true,
  price: true,
  status: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  ticketId: true,
  buyerId: z.number().nullable().optional(),
  sellerId: true,
  amount: true,
  status: true,
});

export const insertSiteContentSchema = createInsertSchema(siteContent).pick({
  key: true,
  value: true,
  type: true,
});


export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;
