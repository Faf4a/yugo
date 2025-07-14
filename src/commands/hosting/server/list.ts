import { Command } from "~command";
import { PTERO_API_KEY } from "env";
import { resolveTarget } from "~misc/utils";
import database from "~misc/db";
import { ComponentTypes, ButtonStyles, MessageFlags } from "oceanic.js";
import type { Message, Member, User, ContainerComponent } from "oceanic.js";

const command: Command = {
    name: "server list",
    description: "List all Pterodactyl servers for a user.",
    usage: "server list [user]",
    category: "Hosting",
    ownerOnly: false,
    async execute(msg: Message, { args }) {
        let target;
        if (args.length > 0) {
            const resolved = await resolveTarget(args[0], msg);
            if (!resolved) {
                return msg.reply({ content: "Could not resolve the user." });
            }
            target = resolved;
        }
        target = target || (msg.member as Member | User);
        const userRow = database.getUser(target.id);
        if (!userRow) {
            return msg.reply({ content: `No Pterodactyl user found for <@${target.id}>.` });
        }

        const panelUserId = Number((userRow as any).ptero_user_id);

        const res = await fetch("https://host.faf4a.xyz/api/application/servers?per_page=100", {
            headers: {
                Authorization: `Bearer ${PTERO_API_KEY}`,
                Accept: "Application/vnd.pterodactyl.v1+json",
            },
        }).catch((err) => {
            console.error("Failed to fetch servers:", err);
            return msg.reply({ content: "Failed to fetch servers from the panel." });
        });

        if (!res.ok) {
            return msg.reply({ content: "Failed to fetch servers from the panel." });
        }
        const data = await res.json();
        const servers = (data.data || []).filter(
            (s: any) => String(s.attributes.user) === String(panelUserId),
        );

        if (servers.length === 0) {
            return msg.reply({ content: `No servers found for <@${target.id}>.` });
        }

        const serverList = servers.map((s: any) => {
            return {
                type: ComponentTypes.SECTION,
                accessory: {
                    type: ComponentTypes.BUTTON,
                    style: ButtonStyles.LINK,
                    url: `https://host.faf4a.xyz/server/${s.attributes.identifier}`,
                    label: "View Server",
                },
                components: [
                    {
                        type: ComponentTypes.TEXT_DISPLAY,
                        content: `**${s.attributes.name}** \`${s.attributes.identifier}\``,
                    },
                ],
            };
        });

        await msg.reply({
            flags: MessageFlags.IS_COMPONENTS_V2,
            allowedMentions: {
                users: [target.id],
                roles: [],
                everyone: false,
            },
            components: [
                {
                    type: ComponentTypes.CONTAINER,
                    accentColor: 0x00bfff,
                    components: [

                        {
                            type: ComponentTypes.TEXT_DISPLAY,
                            content: `### Servers for <@${target.id}> (${servers.length}/1)`,
                        },
                        ...serverList
                    ],
                },
            ],
        });
    },
};

export default command;
