import { Message, ComponentTypes, MessageFlags } from "oceanic.js";
import { Command } from "~command";
import type { YugoClient } from "index";

// Helper to build the help header section
function buildHelpHeader(msg: Message, excludeHints = false) {
  return {
    type: ComponentTypes.CONTAINER,
    components: [
      {
        type: ComponentTypes.SECTION,
        accessory: {
          type: ComponentTypes.THUMBNAIL,
          media: {
            url: msg.guild?.iconURL() as any as string,
          },
        },
        components: [
          {
            type: ComponentTypes.TEXT_DISPLAY,
            content:
              `## Help Command\n\nUse \`a!help <command>\` to get help for a specific command. ${!excludeHints ? "\n\n-# 👑 owner only\n-# 🛡 mod only" : ""}`,
          },
        ],
      },
    ],
  };
}

function buildCommandList(msg: Message, commands: Map<string, Command>) {
  return {
    type: ComponentTypes.CONTAINER,
    components: [
      {
        type: ComponentTypes.TEXT_DISPLAY,
        content: Array.from(commands.values())
          .map((cmd: Command) => {
            let prefix = cmd.ownerOnly
              ? "👑"
              : cmd.modOnly
              ? "🛡"
              : "<:space:908036292900687922>";
            let desc = `a!${cmd.name}`;
            return `${prefix} \`${desc}\`: ${cmd.description}`;
          })
          .join("\n"),
      },
    ],
  };
}

// Helper to build the details for a specific command
function buildCommandDetail(cmd: Command) {
  return {
    type: ComponentTypes.CONTAINER,
    components: [
      {
        type: ComponentTypes.TEXT_DISPLAY,
        content: `## ${cmd.name} \n${cmd.description}\n## Usage:\n\`\`\`a!${
          cmd.usage ?? cmd.name
        }\`\`\`\n${cmd.ownerOnly ? "-# 👑 owner only" : cmd.modOnly ? "-# 🛡 mod only" : ""}`,
      },
    ],
  };
}

// Helper to build the "not found" message
function buildNotFound() {
  return {
    type: ComponentTypes.CONTAINER,
    components: [
      {
        type: ComponentTypes.TEXT_DISPLAY,
        content: "-# The command you searched for doesn't exist!",
      },
    ],
  };
}

const command: Command = {
  name: "help",
  description: "Get a list of commands or help for a specific command.",
  usage: "help [command]",
  ownerOnly: false,
  modOnly: false,
  async execute(msg: Message) {
    let arg = msg.content?.trim();

    const commands = (msg.client as YugoClient).commands;

    if (arg) {
      const cmd = commands.get(arg);
      if (!cmd) {
        msg.reply({
          flags: MessageFlags.IS_COMPONENTS_V2,
          components: [
            // @ts-ignore
            buildHelpHeader(msg),
            // @ts-ignore

            buildCommandList(msg, commands),
            // @ts-ignore
            buildNotFound(),
          ],
        });
        return;
      }
      msg.reply({
        flags: MessageFlags.IS_COMPONENTS_V2,
        // @ts-ignore
        components: [buildHelpHeader(msg, true), buildCommandDetail(cmd)],
      });
      return;
    }

    msg.reply({
      flags: MessageFlags.IS_COMPONENTS_V2,
      // @ts-ignore
      components: [buildHelpHeader(msg), buildCommandList(msg, commands)],
    });
  },
};

export default command;
