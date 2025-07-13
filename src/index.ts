import "./misc/prototypes";

import { Client, Message as OceanicMessage } from "oceanic.js";
import { DISCORD_TOKEN } from "./env";
import { CommandHandler } from "./command";
import type { Command } from "./command";
import database from "~misc/db";

export interface YugoClient extends Client {
  prefix: string;
  commands: {
    cmds: Map<string, any>;
    interaction: Map<string, any>;
    alwaysRespond: Map<string, any>;
    [key: string]: any;
  };
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

Yugo.prefix = "!";
Yugo.commands = {
  cmds: new Map<string, any>(),
  interaction: new Map<string, any>(),
  alwaysRespond: new Map<string, any>(),
};

Yugo.config = {
  ownerId: "",
  moderationWhitelist: [
    "773353342415929344", // Admin
    "1285267083789078539", // Moderator
    "1182044186262900786", // Community Manager
    "1182041892607758396", // Core Developer
  ],
};

Yugo.once("ready", async () => {
  console.log("Hello World");
  console.log("Waiting for commands..");

  await Yugo.rest.oauth
    .getApplication()
    .then((app) => (Yugo.config.ownerId = app.team?.owner?.id || app.owner?.id || ""));

  const commandHandler = new CommandHandler();
  await commandHandler.loadCommands();

  await database.start();

  console.log(`Ready! Logged in as ${Yugo.user.username} (${Yugo.user.id})`);
});

Yugo.on("messageCreate", (msg) => handleCreateMessage(msg));

async function handleCreateMessage(msg: OceanicMessage) {
  if (msg.author.bot) return;
  if (!msg.member) return;

  const originalMessage = msg.content.toLowerCase();

  Yugo.commands.alwaysRespond.forEach((command) => {
    const args = originalMessage.split(/\s+/);
    command.execute(msg, { args, isAlwaysResponse: true });
  });

  if (![...Yugo.prefix].some((p) => originalMessage.toLowerCase().startsWith(p))) return;

  const prefix = Yugo.prefix;
  if (!msg.content.startsWith(prefix)) return;
  const content = msg.content.slice(prefix.length).trim();

  if (!content) return;

  const args = content.split(/\s+/);

  let commandName = args[0]?.toLowerCase() || "";
  let multi = args.length > 1 ? `${args[0].toLowerCase()} ${args[1].toLowerCase()}` : "";
  let command: Command | undefined = undefined;
  if (multi && Yugo.commands.cmds.has(multi)) {
    commandName = multi;
    command = Yugo.commands.cmds.get(multi);
    args.splice(0, 2);
  } else {
    command = Yugo.commands.cmds.get(commandName);
    args.splice(0, 1);
  }
  if (!command) return msg.createReaction("❓");

  if (command.ownerOnly && msg.author.id !== Yugo.config.ownerId) {
    return msg.createReaction("👑");
  }

  if (
    command.modOnly &&
    !msg.member.roles.some((r) => Yugo.config.moderationWhitelist.includes(r))
  ) {
    return msg.createReaction("🚫");
  }

  msg.rawContent = msg.content;
  msg.content = content.replace(command.name, "").trim();

  try {
    await command.execute(msg, { args });
  } catch (error: Error | any) {
    console.error(`Something exploded in ${commandName}:`, error.message);
    msg.createReaction("⚠️");
  }
}

Yugo.connect().catch((error) => {
  console.error("Connection to Discord EXPLODED:", error);
  process.exit(1);
});
