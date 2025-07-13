import { readdir } from "fs/promises";
import { join } from "path";
import { Yugo } from "./index";
import type { ClientEvents } from "oceanic.js";

export type Event = {
  type: "event";
  name: keyof ClientEvents;
  once?: boolean;
  execute: (...args: any[]) => Promise<void> | void;
};

export class EventHandler {
  private readonly eventsPath: string;

  constructor() {
    this.eventsPath = join(__dirname, "events");
  }

  public async loadEvents(): Promise<void> {
    const entries = await readdir(this.eventsPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".js")) continue;
      const imported = await import(join(this.eventsPath, entry.name));
      const event: Event = imported.default || imported;
      if (!event || event.type !== "event" || !event.name || !event.execute) continue;
      if (event.once) {
        Yugo.once(event.name, (...args: any[]) => event.execute(...args));
      } else {
        Yugo.on(event.name, (...args: any[]) => event.execute(...args));
      }
    }
  }
}
