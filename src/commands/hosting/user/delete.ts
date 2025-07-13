import { Command } from "~command";
import { PTERO_API_KEY } from "env";
import database from "~misc/db";

const command: Command = {
  name: "delete user",
  description:
    "Delete a user from the Pterodactyl panel, provide 'true' as second argument to delete only from the database",
  usage: "delete user <user_id> (db_only)",
  category: "Hosting",
  ownerOnly: true,
  async execute(msg, { args }) {
    if (!args || args.length < 1) {
      return msg.reply({ content: "Usage: `!delete user <discord_id> (db_only)`" });
    }

    const targetId = args[0];
    const dbOnly = args[1] === "true";

    if (dbOnly) {
      database.deleteUser(targetId);
      return msg.reply({ content: `User deleted from the database only.` });
    }

    const user = database.getUser(targetId);
    if (!user) {
      return msg.reply({ content: `No user found in the database.` });
    }

    const servers = database.db
      .prepare("SELECT * FROM ptero_servers WHERE discord_id = ?")
      .all(targetId);
    for (const server of servers) {
      try {
        await fetch(
          `https://host.faf4a.xyz/api/application/servers/${(server as any).ptero_server_id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${PTERO_API_KEY}`,
              Accept: "Application/vnd.pterodactyl.v1+json",
            },
          },
        );
      } catch (err) {
        console.error(`Failed to delete server ${(server as any).ptero_server_id}:`, err);
      }
      database.deleteServer(targetId);
    }

    try {
      // @ts-ignore
      await fetch(`https://host.faf4a.xyz/api/application/users/${user.ptero_user_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${PTERO_API_KEY}`,
          Accept: "Application/vnd.pterodactyl.v1+json",
        },
      });
    } catch (err) {
      // @ts-ignore
      console.error(`Failed to delete user ${user.ptero_user_id}:`, err);
    }

    database.deleteUser(targetId);

    return msg.reply({ content: `User and all their servers/data have been deleted.` });
  },
};

export default command;
