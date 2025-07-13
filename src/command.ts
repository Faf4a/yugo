import { readdir } from "fs/promises";
import { join } from "path";
import { Yugo } from "./index";
import { Message } from "oceanic.js";

type ReloadResult = {
  success: boolean;
  failures: Map<string, string>;
};

export class CommandHandler {
  private readonly commandsPath: string;

  constructor() {
    this.commandsPath = join(__dirname, "commands");
  }

  private async loadFromDir(
    dir: string,
    failures: Map<string, string> = new Map(),
  ): Promise<Map<string, string>> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      const tasks = entries.map(async (entry) => {
        const fullPath = join(dir, entry.name);
        const relativePath = fullPath.split("commands\\")[1];

        if (entry.isDirectory()) {
          await this.loadFromDir(fullPath, failures);
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
          try {
            const imported = await import(fullPath);
            const command = imported.default || imported;
            if (!command.category) command.category = "Other";
            if (command.name && command.execute) {
              if (command.interaction) {
                Yugo.commands.interaction.set(command.name, command);
              } else if (command.alwaysRespond) {
                if (command.alwaysRespond.dupe) {
                  Yugo.commands.cmds.set(command.name, command);
                }
                Yugo.commands.alwaysRespond.set(command.name, command);
              } else {
                Yugo.commands.cmds.set(command.name, command);
              }
              console.log(`Loaded command: ${command.name}`);
            } else {
              failures.set(relativePath, "Missing required properties (name or execute)");
            }
          } catch (error: any) {
            console.error(`Failed to load command from ${relativePath}:`, error);
            failures.set(relativePath, error.message || "Unknown error during import");
          }
        }
      });
      await Promise.all(tasks);
      return failures;
    } catch (error: any) {
      const dirName = dir.split("commands\\")[1] || "commands";
      failures.set(dirName, `failed to read directory: ${error.message}`);
      return failures;
    }
  }

  public async loadCommands(): Promise<void> {
    await this.loadFromDir(this.commandsPath);
  }

  public async reload(): Promise<ReloadResult> {
    try {
      Yugo.commands.interaction.clear();
      Yugo.commands.alwaysRespond.clear();
      Yugo.commands.cmds.clear();

      Object.keys(require.cache).forEach((key) => {
        if (key.includes("commands")) {
          delete require.cache[key];
        }
      });

      const failures = await this.loadFromDir(this.commandsPath);

      return {
        success: failures.size === 0,
        failures,
      };
    } catch (e: any) {
      return {
        success: false,
        failures: new Map([["general", e.message || "Unknown error"]]),
      };
    }
  }
}

export type Command = {
  name: string;
  description: string;
  usage?: string;
  category?: "Hosting" | "Moderation" | "Utility" | "Other";
  ownerOnly?: boolean;
  modOnly?: boolean;
  alwaysRespond?: {
    dupe?: boolean;
  };
  execute: (msg: Message, options: { args: string[]; isAlwaysResponse?: boolean }) => Promise<void>;
};
