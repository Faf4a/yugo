import sql from "better-sqlite3";

class Database {
  public db: sql.Database;

  constructor() {
    this.db = new sql("database.db");
    this.db.pragma("journal_mode = WAL");
  }

  start() {
    this.db
      .prepare(
        `
            CREATE TABLE IF NOT EXISTS ptero_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_id TEXT UNIQUE NOT NULL,
                ptero_user_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                email TEXT NOT NULL,
                username TEXT NOT NULL
            )
        `,
      )
      .run();
    this.db
      .prepare(
        `
            CREATE TABLE IF NOT EXISTS ptero_servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_id TEXT NOT NULL,
                ptero_server_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `,
      )
      .run();
  }

  getUser(discordId: string) {
    return this.db.prepare("SELECT * FROM ptero_users WHERE discord_id = ?").get(discordId);
  }

  addUser(discordId: string, pteroUserId: string, email: string, username: string) {
    this.db
      .prepare(
        "INSERT INTO ptero_users (discord_id, ptero_user_id, email, username) VALUES (?, ?, ?, ?)",
      )
      .run(discordId, pteroUserId, email, username);
  }

  getServer(discordId: string) {
    return this.db.prepare("SELECT * FROM ptero_servers WHERE discord_id = ?").get(discordId);
  }

  addServer(discordId: string, pteroServerId: string) {
    this.db
      .prepare("INSERT INTO ptero_servers (discord_id, ptero_server_id) VALUES (?, ?)")
      .run(discordId, pteroServerId);
  }

  deleteUser(discordId: string) {
    this.db.prepare("DELETE FROM ptero_users WHERE discord_id = ?").run(discordId);
  }

  deleteServer(discordId: string) {
    this.db.prepare("DELETE FROM ptero_servers WHERE discord_id = ?").run(discordId);
  }

  getAllUsers() {
    const users = this.db.prepare("SELECT * FROM ptero_users").all();
    return {
      count: users.length,
      list: users,
    };
  }

  execute(query: string, params: any[] = []) {
    if (!query || typeof query !== "string") {
      throw new Error("Expected a query string to execute.");
    }
    return this.db.prepare(query).run(...params);
  }

  close() {
    this.db.close();
  }
}

const database = new Database();
export default database;
