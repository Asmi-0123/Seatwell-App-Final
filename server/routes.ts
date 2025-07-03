import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGameSchema, insertTicketSchema, insertTransactionSchema } from "@shared/schema-pg";
import { IncomingForm, type Files, type File } from "formidable";


import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

import { eq } from "drizzle-orm";
import { db } from "./db";
import { siteContent, tickets } from "../shared/schema-pg";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          type: user.type
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);

      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.patch("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gameData = req.body;
      const game = await storage.updateGame(id, gameData);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(400).json({ message: "Failed to update game" });
    }
  });

  app.delete("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGame(id);
      if (!success) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete game" });
    }
  });

  
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/all", async (req, res) => {
  try {
    const allTickets = await db.select().from(tickets);
    res.json(allTickets);
  } catch (err) {
    console.error("Failed to fetch all tickets:", err);
    res.status(500).json({ message: "Failed to fetch all tickets" });
  }
});


  app.get("/api/tickets/game/:gameId", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const tickets = await storage.getTicketsByGame(gameId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets for game" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      console.log("[DEBUG] /api/tickets req.body:", req.body);
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("[ERROR] /api/tickets:", error);
      res.status(400).json({ message: "Invalid ticket data", error: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const updatedTicket = await storage.updateTicket(ticketId, req.body);

      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.post("/api/tickets/:id/purchase", async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { buyerId } = req.body;

    console.log("Purchase request for ticketId:", ticketId, "buyerId:", buyerId);

    const ticket = await storage.getTicket(ticketId);
    console.log("Fetched ticket:", ticket);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status !== "available") {
      console.warn("Ticket is not available:", ticket.status);
      return res.status(400).json({ message: "Ticket is not available" });
    }

    const updatePayload: any = { status: "sold" };
    if (buyerId) updatePayload.buyerId = buyerId;

    const updatedTicket = await storage.updateTicket(ticketId, updatePayload);
    console.log("Updated ticket to sold:", updatedTicket);


    const transactionPayload = {
      ticketId: ticketId,
      buyerId: buyerId || null,
      sellerId: ticket.sellerId,
      amount: ticket.price,
      status: "completed",
    };

    console.log("Creating transaction with:", transactionPayload);

    const transaction = await storage.createTransaction(transactionPayload);

    console.log("Transaction created:", transaction);

    res.json({ ticket: updatedTicket, transaction });
  } catch (error) {
    console.error("Error in /purchase route:", error);
    res.status(500).json({ message: "Failed to purchase ticket", error });
  }
});


  
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map((user: any) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      console.log("Contact form submission:", { name, email, subject, message });
      res.json({ message: "Message sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  
  app.get("/api/games", async (req, res) => {
    const all = await storage.getAllGames();
    res.json(all);
  });

app.post(
  "/api/games",
  (req, res, next) => {
    if (req.body.date instanceof Date) {
      req.body.date = req.body.date.toISOString();
    }

    const result = insertGameSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid game payload",
        error: result.error.issues,
      });
    }

    req.body = result.data;
    next();
  },

  async (req, res) => {
    try {
      const newGame = await storage.createGame(req.body);
      res.status(201).json(newGame);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  }
);


  
  app.put("/api/games/:id", async (req, res) => {
    const id = Number(req.params.id);
    const updated = await storage.updateGame(id, req.body);
    if (!updated) return res.status(404).json({ message: "Game not found" });
    res.json(updated);
  });

  
  app.delete("/api/games/:id", async (req, res) => {
    const id = Number(req.params.id);
    const ok = await storage.deleteGame(id);
    if (!ok) return res.status(404).json({ message: "Game not found" });
    res.json({ success: true });
  });

  app.post("/api/upload-cloudinary", (req, res) => {
  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (_err, _fields, files: Files) => {
    const uploaded = files.file as File | File[];

    if (!uploaded) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filepath = Array.isArray(uploaded)
      ? uploaded[0].filepath
      : uploaded.filepath;

    try {
      const result = await cloudinary.uploader.upload(filepath, {
        folder: "seatwell_games",
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return res.status(500).json({ error: "Image upload failed" });
    }
  });
});


  
  
  app.get("/api/content", async (req, res) => {
    const content = await db.select().from(siteContent);
    res.json(content);
  });

  
  app.get("/api/content/:key", async (req, res) => {
    const { key } = req.params;
    const content = await db.select().from(siteContent).where(eq(siteContent.key, key));
    if (content.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(content[0]);
  });

  
  app.post("/api/content/:key", async (req, res) => {
    const { key } = req.params;
    const { value, type } = req.body;
    const existing = await db.select().from(siteContent).where(eq(siteContent.key, key));
    if (existing.length > 0) {
      await db.update(siteContent).set({ value, type }).where(eq(siteContent.key, key));
    } else {
      await db.insert(siteContent).values({ key, value, type });
    }
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}