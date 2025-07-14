import database from "~misc/db";
import { Command } from "~command";
import { PTERO_API_KEY } from "env";
import { Member } from "oceanic.js";

const command: Command = {
  name: "server create",
  description: "Create a Pterodactyl server",
  usage: "server create <name>",
  category: "Hosting",
  ownerOnly: false,
  async execute(msg, { args }) {
    const member = msg.member as Member;
    const user = database.getUser(member.id);
    if (!user) {
      return msg.reply({
        content: `You must create a Pterodactyl user first using the \`!new\` command!`,
      });
    }

    
    const DONATOR_ROLE_IDS = ["773353340674900029", "1251992565381857342", "773661503214583808"];
    const isDonator = member.roles.some((role: string) => DONATOR_ROLE_IDS.includes(role));
    if (!isDonator) {
      return msg.reply({
        content: `Currently limited to Donators and Boosters, you know what you have to do ;9`,
      });
    }
    

    if (args.length < 1) {
      return msg.reply({
        content: "Please provide a name for your server.",
      });
    }

    const existingServer = database.getServer?.(member.id);
    if (existingServer && member.id !== "428188716641812481") {
      return msg.reply({
        content: `You already have a server. Only one server per user is allowed currently.`,
      });
    }

    const payload = {
      name: msg.content,
      user: Number((user as any).ptero_user_id),
      nest: 5,
      egg: 15,
      docker_image: "ghcr.io/zastinian/esdock:nodejs_20",
      startup: '[[ ! -d .git && -n "${USERNAME}" && -n "${ACCESS_TOKEN}" && -n "${GIT_ADDRESS}" ]] && git clone -b "${BRANCH}" https://${USERNAME}:${ACCESS_TOKEN}@${GIT_ADDRESS#https://} repo; cd repo; [[ "${AUTO_UPDATE}" == "1" && -d .git ]] && git pull; [[ -n "${UNNODE_PACKAGES}" ]] && /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; [[ -f package.json ]] && /usr/local/bin/npm install; [[ -n "${NODE_PACKAGES}" ]] && /usr/local/bin/npm install ${NODE_PACKAGES}; eval "${COMMAND}"',
      environment: {
        startupscript: "index.js",
        packages: "aoi.js",
        COMMAND: "node index.js",
        USER_UPLOAD: false,
        AUTO_UPDATE: false,
      },
      limits: {
        memory: 150,
        swap: -1,
        disk: 800,
        io: 500,
        cpu: 100,
      },
      feature_limits: {
        databases: 0,
        allocations: 1,
        backups: 1,
      },
      deploy: {
        locations: [1],
        dedicated_ip: false,
        port_range: [],
        tags: [],
      },
    };

    const response = await fetch("https://host.faf4a.xyz/api/application/servers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PTERO_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json",
      },
      body: JSON.stringify(payload),
    });

    const server = await response.json();
    if (!response.ok) {
      const errorMsg = server.errors?.map((e: any) => e.detail).join("\n") || "Unknown error";
      return msg.reply({
        content: `Failed to create your server:\n${errorMsg}`,
      });
    }


    database.addServer(member.id, server.attributes.id);

    const statusMsg = await msg.reply({
      embeds: [
        {
          title: "Server Creation",
          description: "⏳ Please wait, installing your server currently...",
          color: 0xffff00, // Yellow
        },
      ],
    });

    let pollCount = 0;
    const maxPolls = 5;
    const poll = setInterval(async () => {
      pollCount++;
      try {
        const stateRes = await fetch(
          `https://host.faf4a.xyz/api/application/servers/${server.attributes.id}?include=egg,nest,node,user,allocations,variables`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${PTERO_API_KEY}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        );
        const stateData = await stateRes.json();
        const installed = stateData?.attributes?.container?.installed;

        if (installed) {
          await statusMsg.edit({
            embeds: [
              {
                title: "Server Created!",
                description: `✅ Installed the server successfully!\n[View your server here](https://host.faf4a.xyz/server/${server.attributes.identifier})`,
                color: 0x00ff00, // Green
                fields: [
                  { name: "Name", value: stateData.attributes.name, inline: true },
                  {
                    name: "Memory",
                    value: `${stateData.attributes.limits.memory} MB`,
                    inline: true,
                  },
                  { name: "Disk", value: `${stateData.attributes.limits.disk} MB`, inline: true },
                  { name: "CPU", value: `${stateData.attributes.limits.cpu}%`, inline: true },
                  { name: "Egg", value: "Node.js", inline: true },
                  {
                    name: "Image",
                    value: `\`${stateData.attributes.container.image}\``,
                    inline: true,
                  },
                ],
                footer: {
                  text: "Only aoi.js & discord.js bots are allowed to be hosted on this server. Breaking this rule will result in a ban from the hosting service and deletion of your server.",
                },
              },
            ],
          });
          clearInterval(poll);
        } else if (pollCount >= maxPolls) {
          await statusMsg.edit({
            embeds: [
              {
                title: "Server Creation Failed",
                description: "❌ Server installation timed out or failed.",
                color: 0xff0000, // Red
              },
            ],
          });
          clearInterval(poll);
        } else {
          await statusMsg.edit({
            embeds: [
              {
                title: "Server Creation",
                description: "⏳ Please wait, installing your server currently...",
                color: 0xffff00, // Yellow
              },
            ],
          });
        }
      } catch (err) {
        await statusMsg.edit({
          embeds: [
            {
              title: "Server Creation Failed",
              description: "❌ Error fetching server status.",
              color: 0xff0000, // Red
            },
          ],
        });
        clearInterval(poll);
      }
    }, 10000);
  },
};

export default command;
