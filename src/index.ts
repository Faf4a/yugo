import "./misc/prototypes";

import { Client, Message as OceanicMessage } from "oceanic.js";
import { DISCORD_TOKEN } from "./env";
import { loadCommands } from "./command";
import type { Command } from "./command";

export interface YugoClient extends Client {
  prefix: string;
  commands: Map<string, any>;
  config: {
    ownerId: string;
    moderationWhitelist: string[];
  };
}

declare module "oceanic.js" {
  interface Message {
    rawContent: string;
    content: string;
  }
}

export const Yugo = new Client({
  auth: "Bot " + DISCORD_TOKEN,
  gateway: { intents: ["ALL"] },
  allowedMentions: {
    everyone: false,
    repliedUser: true,
    roles: false,
    users: false,
  },
}) as YugoClient;

Yugo.prefix = "a!";
Yugo.commands = new Map<string, any>();
Yugo.config = {
  ownerId: "",
  moderationWhitelist: [
    "1285267083789078539", // Moderator
    "1182044186262900786", // Community Manager
    "1182041892607758396", // Core Developer
  ],
};

Yugo.once("ready", async () => {
  console.log("Hello World");
  console.log("Waiting for commands..");

  // Fetch ownerId from Discord API
  await Yugo.rest.oauth
    .getApplication()
    .then(
      (app) =>
        (Yugo.config.ownerId = app.team?.owner?.id || app.owner?.id || "")
    );

  await loadCommands();

  console.log(`Ready! Logged in as ${Yugo.user.username} (${Yugo.user.id})`);
});

Yugo.on("messageCreate", (msg) => handleCreateMessage(msg));

async function handleCreateMessage(msg: OceanicMessage) {
  if (msg.author.bot) return;
  if (!msg.member) return;

  const originalMessage = msg.content.toLowerCase();

  if (![...Yugo.prefix].some((p) => originalMessage.startsWith(p))) return;

  const prefix = Yugo.prefix;
  if (!msg.content.startsWith(prefix)) return;
  const content = msg.content.slice(prefix.length).trim();

  if (!content) return;
  const args = content.split(/\s+/);

  const commandName = args.shift()?.toLowerCase();

  const command: Command = Yugo.commands.get(commandName as string);
  if (!command) return msg.createReaction("❓");

  if (command.ownerOnly && msg.author.id !== Yugo.config.ownerId) {
    return msg.createReaction("👑");
  }

  if (
    command.modOnly &&
    !msg.member.roles.some((r) => r in Yugo.config.moderationWhitelist)
  ) {
    return msg.createReaction("🚫");
  }

  msg.rawContent = msg.content;
  msg.content = content.replace(command.name, "").trim();

  try {
    await command.execute(msg, args);
  } catch (error: Error | any) {
    console.error(`Something exploded in ${commandName}:`, error.message);
    msg.createReaction("⚠️");
  }
}

Yugo.connect().catch((error) => {
  console.error("Connection to Discord EXPLODED:", error);
  process.exit(1);
});
