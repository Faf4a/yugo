import { readdirSync, statSync } from "fs";
import { join } from "path";
import { Yugo } from "./index";
import { Message } from "oceanic.js";

export async function loadCommands() {
  const commandsPath = join(__dirname, "commands");

  function loadFromDir(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        loadFromDir(fullPath);
      } else if (entry.endsWith(".ts") || entry.endsWith(".js")) {
        const imported = require(fullPath);
        const command = imported.default || imported;
        if (command.name && command.execute) {
          Yugo.commands.set(command.name, command);
          console.log(`Loaded command: ${command.name}`);
        } else {
          throw new Error(
            `Command in ${entry} is missing required properties.`
          );
        }
      }
    }
  }

  loadFromDir(commandsPath);
}

export type Command = {
  name: string;
  description: string;
  usage?: string;
  ownerOnly?: boolean;
  modOnly?: boolean;
  execute: (msg: Message, args: string[]) => Promise<void>;
};
