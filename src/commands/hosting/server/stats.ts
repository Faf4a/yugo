import { PTERO_API_KEY } from "env";
import { Command } from "~command";
import type { NodesList, ServersList } from "~types";

const NODE_STATUS = {
    online: "🟢",
    wings_offline: "🟡",
    offline: "🔴",
    maintenance: "⚪"
};

async function checkWingsStatus(nodeFqdn: string): Promise<boolean> {
    try {
        const res = await fetch(`http://${nodeFqdn}:8080/api/system`, {
            headers: {
                "Authorization": `Bearer ${PTERO_API_KEY}`,
                "Accept": "Application/vnd.pterodactyl.v1+json"
            },
            method: "GET",
        });
        return res.status === 401 || res.status === 400 || res.status === 200;
    } catch (err) {
        return false;
    }
};

async function checkPanelStatus(): Promise<boolean> {
    try {
        const res = await fetch("https://host.faf4a.xyz/");
        return res.status === 200;
    } catch (err) {
        return false;
    }
};

const command: Command = {
    name: "server stats",
    description: "Show all nodes and the amount of servers currently used.",
    usage: "server stats",
    category: "Hosting",
    ownerOnly: false,
    async execute(msg) {
        const res = await fetch("https://host.faf4a.xyz/api/application/nodes", {
            headers: {
                "Authorization": `Bearer ${PTERO_API_KEY}`,
                "Accept": "Application/vnd.pterodactyl.v1+json"
            }
        }).catch(err => {
            console.error("Failed to fetch nodes:", err);
            return msg.reply({ content: "Failed to fetch node stats." });
        });

        const data: NodesList = await res.json();
        if (!res.ok) {
            return msg.reply({ content: "Failed to fetch node stats." });
        }
        const nodes = data.data || [];

        const resServers = await fetch("https://host.faf4a.xyz/api/application/servers", {
            headers: {
                "Authorization": `Bearer ${PTERO_API_KEY}`,
                "Accept": "Application/vnd.pterodactyl.v1+json"
            }
        }).catch(err => {
            console.error("Failed to fetch servers:", err);
            return msg.reply({ content: "Failed to fetch server stats." });
        });
        const dataServers: ServersList = await resServers.json();
        const servers = dataServers.data || [];
        const serversPerNode: Record<string, number> = {};
        for (const server of servers) {
            const nodeId = server.attributes.node;
            serversPerNode[nodeId] = (serversPerNode[nodeId] || 0) + 1;
        }

        // @ts-ignore
        const wingsStatusResults = await Promise.all(nodes.map(node =>
            checkWingsStatus(node.attributes.fqdn)
        ));

        let fields: any[] = [];


        const panelOnline = await checkPanelStatus();

        if (!panelOnline) {
            fields.push({
                name: "🔴 [Offline] Panel",
                value: "",
                inline: false
            });
        } else {
            fields.push({
                name: "🟢 [Online] Panel",
                value: "",
                inline: false
            });
        }

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const wingsOnline = wingsStatusResults[i];

            let status = NODE_STATUS.maintenance;

            if (node.attributes.maintenance_mode) {
                status = NODE_STATUS.maintenance + " [Maintenance Mode]";
            } else if (!wingsOnline) {
                status = NODE_STATUS.wings_offline + " [WINGS Offline]";
            } else {
                status = NODE_STATUS.online + " [Online]";
            }

            // @ts-ignore
            const ramUsed = (node.attributes.allocated_resources?.memory as number) || 0;
            const ramTotal = node.attributes.memory || 0;
            const ramPercent = ramTotal ? (ramUsed / ramTotal) * 100 : 0;
            // @ts-ignore
            const diskUsed = (node.attributes.allocated_resources?.disk as number) || 0;
            const diskTotal = node.attributes.disk || 0;
            const diskPercent = diskTotal ? (diskUsed / diskTotal) * 100 : 0;
            const usageString = `Servers: ${serversPerNode[node.attributes.id] || 0}\nRAM: ${ramUsed} / ${ramTotal} MB (${ramPercent.toFixed(1)}%)\nStorage: ${diskUsed} / ${diskTotal} MB (${diskPercent.toFixed(1)}%)`;

            let nodeName = node.attributes.fqdn;
            if (node.attributes.maintenance_mode) {
                nodeName = `${NODE_STATUS.maintenance} ${nodeName}`;
            }

            fields.push({
                name: `${status} ${nodeName}`,
                value: usageString,
                inline: nodeName === "n1.faf4a.xyz" ? false : true
            });
        }

        await msg.reply({
            embeds: [{
                title: "Node Stats",
                description: "Status of all nodes, server usage, and resources.",
                color: 0x00ff99,
                fields
            }]
        });
    }
};

export default command;
