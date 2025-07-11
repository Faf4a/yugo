import database from "~misc/db";
import { Command } from "~command";
import { PTERO_API_KEY } from "env";
import { Member } from "oceanic.js";

const command: Command = {
    name: 'create',
    description: 'Create a Pterodactyl server with 120MB RAM, 500MB storage, 25% CPU',
    usage: "create <name>",
    ownerOnly: false,
    async execute(msg, { args }) {
        const member = msg.member as Member;
        const user = database.getUser(member.id);
        if (!user) {
            return msg.reply({
                content: `You must create a Pterodactyl user first using the create command!`
            });
        }

        if (args.length < 1) {
            return msg.reply({
                content: "Please provide a name for your server."
            });
        }
        // "1251992565381857342", "773661503214583808",  nuh uh
        if (!member.roles.some((role) => ["773353340674900029"].includes(role))) {
            return msg.reply({
                content: "You do not quality for a server, either boost the server, donate to use or become an active Staff Member!"
            });
        }

        const existingServer = database.getServer?.(member.id);
        // allow owner to have multiple servers
        if (existingServer && member.id !== "428188716641812481") {
            return msg.reply({
                content: `You already have a server. Only one server per user is allowed.`
            });
        }

        const payload = {
            name: msg.content,
            // @ts-ignore
            user: Number(user.ptero_user_id),
            nest: 5,
            egg: 15,
            docker_image: "ghcr.io/parkervcp/yolks:nodejs_21",
            startup: `if [[ "$PACKAGES" == *"forgescript"* ]]; then echo "Blocked: forgescript is not allowed" && exit 1; fi && \ npm install $PACKAGES && \ node {{STARTUPSCRIPT}}`,
            environment: {
                startupscript: "index.js",
                packages: "aoi.js"
            },
            limits: {
                memory: 120,
                swap: -1,
                disk: 500,
                io: 500,
                cpu: 100
            },
            feature_limits: {
                databases: 0,
                allocations: 1,
                backups: 1
            },
            deploy: {
                locations: [1],
                dedicated_ip: false,
                port_range: []
            }
        };

        const response = await fetch('https://panel.faf4a.xyz/api/application/servers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PTERO_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            body: JSON.stringify(payload)
        });

        const server = await response.json();
        if (!response.ok) {
            const errorMsg = server.errors?.map((e: any) => e.detail).join('\n') || 'Unknown error';
            return msg.reply({
                content: `Failed to create your server:\n${errorMsg}`
            });
        }

        console.log(payload);

        database.addServer(member.id, server.attributes.id);

        const statusMsg = await msg.reply({ content: `One moment..` });

        let pollCount = 0;
        const maxPolls = 24;
        const poll = setInterval(async () => {
            pollCount++;
            try {
                const stateRes = await fetch(`https://panel.faf4a.xyz/api/application/servers/${server.attributes.id}?include=egg,nest,node,user,allocations,variables`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${PTERO_API_KEY}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });
                const stateData = await stateRes.json();
                const installed = stateData?.attributes?.container?.installed;
                const statusText = installed ? 'Installed the server successfully!\nSee it here https://panel.faf4a.xyz' : '⏳ Please wait, installing your server currently...';
                await statusMsg.edit({ content: `Server created!\n${statusText}` });
                if (installed || pollCount >= maxPolls) {
                    clearInterval(poll);
                }
            } catch (err) {
                await statusMsg.edit({ content: `Error fetching server status.` });
                clearInterval(poll);
            }
        }, 5000);
    },
};

export default command;
