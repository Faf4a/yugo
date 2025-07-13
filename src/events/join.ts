import type { Event } from "../event";
import { type Member, TextChannel } from "oceanic.js";
import database from "~misc/db";

const event: Event = {
    type: "event",
    name: "guildMemberAdd",
    async execute(member: Member) {
        // #general
        const channelId = "832704676096245800";
        const channel = member.guild.channels.get(channelId);
        const row = database.db.prepare("SELECT roles FROM user_roles WHERE discord_id = ?").get(member.id) as { roles: string } | undefined;
        if (row && row.roles && member.id !== "1270081976669573293") {
            await (channel as TextChannel).createMessage({
                content: `Glad to have you back, <@${member.id}>! <:aoiBirdv1:1252332474600783983>`
            });

            try {
                const roles: string[] = JSON.parse(row.roles);
                const assignable = roles.filter(rid => member.guild.roles.has(rid));
                if (assignable.length > 0) {
                    await member.edit({ roles: assignable, reason: "Automatically assigning previously assigned roles" });
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            await (channel as TextChannel).createMessage({
                content: `Welcome to the server, <@${member.id}>! <:aoiBirdv1:1252332474600783983>`
            });
        }
    }
};

export default event;
