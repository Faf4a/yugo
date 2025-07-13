import type { Event } from "../event";
import { type Member } from "oceanic.js";
import database from "~misc/db";

const event: Event = {
    type: "event",
    name: "guildMemberRemove",
    async execute(member: Member) {
        const roles = member.roles;

        database.execute(`CREATE TABLE IF NOT EXISTS user_roles (discord_id TEXT PRIMARY KEY, roles TEXT)`);

        database.execute(
            `INSERT INTO user_roles (discord_id, roles) VALUES (?, ?) ON CONFLICT(discord_id) DO UPDATE SET roles=excluded.roles`,
            [String(member.id), JSON.stringify(roles)]
        );
    }
};

export default event;
