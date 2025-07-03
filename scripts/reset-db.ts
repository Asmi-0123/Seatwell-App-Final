import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function resetDb() {

  await sql`DROP TABLE IF EXISTS site_content, transactions, tickets, games, users CASCADE;`;


  await sql`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      type TEXT NOT NULL,
      createdAt TEXT
    );
  `;


  await sql`
    CREATE TABLE games (
      id SERIAL PRIMARY KEY,
      homeTeam TEXT NOT NULL,
      awayTeam TEXT NOT NULL,
      date TEXT NOT NULL,
      venue TEXT NOT NULL,
      status TEXT,
      image TEXT,
      createdAt TEXT
    );
  `;


  await sql`
    CREATE TABLE tickets (
      id SERIAL PRIMARY KEY,
      gameId INTEGER NOT NULL REFERENCES games(id),
      sellerId INTEGER REFERENCES users(id),
      buyerId INTEGER REFERENCES users(id),
      seatNumber TEXT NOT NULL,
      price INTEGER NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT,
      soldAt TEXT
    );
  `;


  await sql`
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      ticketId INTEGER REFERENCES tickets(id),
      buyerId INTEGER REFERENCES users(id),
      sellerId INTEGER REFERENCES users(id),
      amount INTEGER NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT
    );
  `;


  await sql`
    CREATE TABLE site_content (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      type TEXT NOT NULL
    );
  `;

  await sql.end();
}

resetDb().then(() => {
  console.log("Database reset complete.");
  process.exit(0);
});
