import { db } from "../server/db";
import { users, games, tickets, transactions } from "../shared/schema-pg";
import { type InsertTicket } from "../shared/schema-pg";
import { eq } from "drizzle-orm";

console.log("Seed script started...");

console.log("Deleting existing data...");
await db.delete(transactions);
await db.delete(tickets);
await db.delete(games);
await db.delete(users);
console.log("Tables cleared.");

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seed() {
  console.log("Seeding users...");
  const userData = [
    { username: "admin", email: "admin@seatwell.ch", password: "admin123", type: "admin" },
    { username: "seasonal.holder", email: "seasonal@club.ch", password: "demo", type: "seller" },
    { username: "max.mustermann", email: "max@seatwell.ch", password: "demo", type: "seller" },
    { username: "anna.weber", email: "anna@seatwell.ch", password: "demo", type: "buyer" },
  ];

  await db.insert(users).values(userData as typeof users.$inferInsert[]);
  console.log(`Inserted ${userData.length} users.`);

  const insertedUsers = await db.select().from(users);
  const seller = insertedUsers.find(u => u.email === "seasonal@club.ch");
  const buyer = insertedUsers.find(u => u.type === "buyer");

  if (!seller || !buyer) {
    console.error("Required users missing. Cannot seed.");
    return;
  }

  console.log("Seeding games...");
  const gameData = [
    {
      homeTeam: "HC Davos",
      awayTeam: "EV Zug",
      date: new Date("2024-12-30T20:00:00Z").toISOString(),
      venue: "Vaillant Arena",
      status: "upcoming",
      image: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/HC_Davos_logo.svg/1200px-HC_Davos_logo.svg.png",
    },
    {
      homeTeam: "SC Bern",
      awayTeam: "Genève-Servette",
      date: new Date("2025-01-03T19:45:00Z").toISOString(),
      venue: "PostFinance Arena",
      status: "upcoming",
      image: "https://upload.wikimedia.org/wikipedia/en/thumb/7/70/SC_Bern_logo.svg/1200px-SC_Bern_logo.svg.png",
    },
    {
      homeTeam: "ZSC Lions",
      awayTeam: "EHC Biel",
      date: new Date("2025-01-05T19:45:00Z").toISOString(),
      venue: "Swiss Life Arena",
      status: "upcoming",
      image: null,
    },
    {
      homeTeam: "EHC Kloten",
      awayTeam: "HC Lugano",
      date: new Date("2025-01-10T20:00:00Z").toISOString(),
      venue: "SWISS Arena",
      status: "upcoming",
      image: null,
    },
    {
      homeTeam: "Fribourg-Gottéron",
      awayTeam: "Lausanne HC",
      date: new Date("2025-01-14T19:45:00Z").toISOString(),
      venue: "BCF Arena",
      status: "upcoming",
      image: "https://content.sportslogos.net/logos/116/3499/full/8865__hc_fribourg-gotteron-primary-2016.png",
    },
    {
      homeTeam: "Lausanne HC",
      awayTeam: "HC Ambri-Piotta",
      date: new Date("2025-01-17T19:45:00Z").toISOString(),
      venue: "Vaudoise Arena",
      status: "upcoming",
      image: "https://play-lh.googleusercontent.com/K2G4Zh-OGUS08tvpjaNSMzu-IGpGlCBxqe44iIJLRF_7D4EX7QLPT6h6COP5_ZGJ-5U",
    },
    {
      homeTeam: "Genève-Servette",
      awayTeam: "SC Rapperswil-Jona Lakers",
      date: new Date("2025-01-19T20:00:00Z").toISOString(),
      venue: "Patinoire des Vernets",
      status: "upcoming",
      image: "https://www.swisshockeynews.ch/images/IMAGES/Club-Logos/Gameday/NL/rapperswil-genf.jpg",
    },
    {
      homeTeam: "HC Ambri-Piotta",
      awayTeam: "ZSC Lions",
      date: new Date("2025-01-22T20:00:00Z").toISOString(),
      venue: "Gottardo Arena",
      status: "upcoming",
      image: null,
    },
    {
      homeTeam: "EV Zug",
      awayTeam: "EHC Kloten",
      date: new Date("2025-01-25T19:45:00Z").toISOString(),
      venue: "Bossard Arena",
      status: "upcoming",
      image: null,
    },
    {
      homeTeam: "EHC Biel",
      awayTeam: "HC Davos",
      date: new Date("2025-01-28T19:45:00Z").toISOString(),
      venue: "Tissot Arena",
      status: "upcoming",
      image: null,
    },
  ];

  await db.insert(games).values(gameData as typeof games.$inferInsert[]);
  const insertedGames = await db.select().from(games);
  console.log(`Inserted ${insertedGames.length} games.`);

  console.log("Skipping ticket generation");

  console.log("Seeding demo transactions...");
  const soldTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.status, "sold"));

  const selectedTickets = pickRandom(soldTickets, 30);

  const transactionData = selectedTickets.map((ticket, idx) => ({
    ticketId: ticket.id,
    buyerId: buyer.id,
    sellerId: ticket.sellerId,
    amount: Math.floor(ticket.price * 0.75),
    status: "completed",
    createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
  }));

  if (transactionData.length > 0) {
    await db.insert(transactions).values(transactionData as typeof transactions.$inferInsert[]);
    console.log(`Inserted ${transactionData.length} transactions.`);
  } else {
    console.log("No sold tickets found to seed transactions.");
  }

  console.log("Seed complete!");
}

seed().finally(() => process.exit());
