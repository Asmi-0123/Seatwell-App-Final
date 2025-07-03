
import { db } from "./db";
import {
  users,
  games,
  tickets,
  transactions,
  type InsertUser,
  type InsertGame,
  type InsertTicket,
  type InsertTransaction,
  type User,
  type Game,
  type Ticket,
  type Transaction,
} from "@shared/schema-pg";
import { eq, inArray, and, isNotNull } from "drizzle-orm";


export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  getGame(id: number): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: number): Promise<boolean>;

  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketsByGame(gameId: number): Promise<Ticket[]>;
  getTicketsBySeller(sellerId: number): Promise<Ticket[]>;
  getAllTickets(): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;

  getTransaction(id: number): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}


export class PgStorage implements IStorage {
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user as typeof users.$inferInsert).returning();
    return result[0];
  }

  
  async getGame(id: number): Promise<Game | undefined> {
    const result = await db.select().from(games).where(eq(games.id, id));
    return result[0];
  }

  async getAllGames(): Promise<Game[]> {
    return db.select().from(games).orderBy(games.date);
  }

  async createGame(game: InsertGame): Promise<Game> {
    const result = await db.insert(games).values(game as typeof games.$inferInsert).returning();
    return result[0];
  }

  async updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined> {
    const result = await db
      .update(games)
      .set(game)
      .where(eq(games.id, id))
      .returning();
    return result[0];
  }

  async deleteGame(id: number): Promise<boolean> {
  try {
    
    const relatedTickets = await db.select({ id: tickets.id }).from(tickets).where(eq(tickets.gameId, id));
    const ticketIds = relatedTickets.map(t => t.id);

    
    if (ticketIds.length > 0) {
      await db.delete(transactions).where(inArray(transactions.ticketId, ticketIds));
    }

    
    await db.delete(tickets).where(eq(tickets.gameId, id));

    
    const result = await db.delete(games).where(eq(games.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    console.error("Failed to delete game:", error);
    throw error;
  }
}
  
  async getTicket(id: number): Promise<Ticket | undefined> {
    const result = await db.select().from(tickets).where(eq(tickets.id, id));
    return result[0];
  }

  async getTicketsByGame(gameId: number): Promise<Ticket[]> {
    
    return db.select().from(tickets).where(
      and(
        eq(tickets.gameId, gameId),
        eq(tickets.status, "available"),
        isNotNull(tickets.sellerId)
      )
    );
  }

  async getTicketsBySeller(sellerId: number): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.sellerId, sellerId));
  }

  async getAllTickets(): Promise<Ticket[]> {
    
    return db.select().from(tickets).where(
      and(
        eq(tickets.status, "available"),
        isNotNull(tickets.sellerId)
      )
    );
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const result = await db.insert(tickets).values(ticket as typeof tickets.$inferInsert).returning();
    return result[0];
  }

  async updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const result = await db
      .update(tickets)
      .set(ticket)
      .where(eq(tickets.id, id))
      .returning();
    return result[0];
  }

  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    return result[0];
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction as typeof transactions.$inferInsert).returning();
    return result[0];
  }
}

export const storage = new PgStorage();
