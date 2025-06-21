import { Command } from "~command";
import { ButtonStyles, ComponentTypes, Message, MessageFlags } from "oceanic.js";
  import { apiRequest, type Root, type FunctionData } from "~misc/api";

const command: Command = {
  name: "function",
  description: "replies with function data",
  alwaysRespond: {
    dupe: true,
  },
  async execute(msg: Message, { isAlwaysResponse }) {
    if (isAlwaysResponse && !msg.content.startsWith("$")) return;

    const functionDataRequest = await apiRequest("function", msg.content).catch(() => {
      return undefined;
    });

    if (!functionDataRequest) {
      const request: Root = await apiRequest("find", msg.content).catch((e) => {
        return msg.reply({
          content: e.message,
        });
      });

      return msg.reply({
        flags: MessageFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: ComponentTypes.CONTAINER,
            // red red (actually red)
            accentColor: 0xf44336,
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
                    content: `## Function not found\nDid you maybe mean one of these?`,
                  },
                ],
              },
              {
                type: ComponentTypes.TEXT_DISPLAY,
                content:
                  (request.functions?.map((f) => `- \`${f}\``).join(",\n") ||
                    "No functions match that query, are you sure it exists?") +
                  "\n\n### Not on the list? \n Try searching for it on the [aoi.js website](https://aoi.js.org), or suggest it to us <#1199204494781722674>!",
              },
              {
                type: ComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: ComponentTypes.BUTTON,
                    style: ButtonStyles.DANGER,
                    label: "x Delete",
                    customID: `delete_${msg.author.id}`,
                    disabled: true,
                  },
                ],
              },
            ],
          },
        ],
      });
    }

    if (!functionDataRequest.data || Array.isArray(functionDataRequest.data)) {
      return msg.reply({
        content: "Function data is invalid or ambiguous.",
      });
    }
    const functionData: FunctionData = functionDataRequest.data;

    return msg.reply({
      flags: MessageFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: ComponentTypes.CONTAINER,
          // green green (not green actually)
          accentColor: 0x3d5393,
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
                  content: `## ${functionData.function}\n${functionData.description}`,
                },
              ],
            },
            // @ts-ignore
            ...(functionData.example
              ? [
                  {
                    type: ComponentTypes.TEXT_DISPLAY,
                    content: `## Usage:\n\`\`\`php\n${functionData.usage.replace(
                      /`/g,
                      "",
                    )}\`\`\`\n## Example:\n${functionData.example.length > 2000
                      ? "Example is too long to display, please use the documentation." : functionData.example}`,
                  },
                ]
              : [
                  {
                    type: ComponentTypes.TEXT_DISPLAY,
                    content: `## Usage:\n\`\`\`php\n${functionData.usage.replace(/`/g, "")}\`\`\``,
                  },
                  {
                    type: ComponentTypes.SECTION,
                    accessory: {
                      type: ComponentTypes.BUTTON,
                      style: ButtonStyles.LINK,
                      label: "Contribute!",
                      url: "https://github.com/aoijs/website",
                    },
                    components: [
                      {
                        type: ComponentTypes.TEXT_DISPLAY,
                        content: `## Example\nNothing here yet for the example, want to change that?`,
                      },
                    ],
                  },
                ]),
            {
              // @ts-ignore
              type: ComponentTypes.ACTION_ROW,
              components: [
                {
                  type: ComponentTypes.BUTTON,
                  style: ButtonStyles.LINK,
                  label: "Documentation",
                  url: functionData.documentation ?? "https://google.com",
                  disabled: !functionData.documentation,
                },
                {
                  type: ComponentTypes.BUTTON,
                  style: ButtonStyles.LINK,
                  label: "Source Code",
                  url: functionData["source-code"] ?? "https://google.com",
                  disabled: !functionData["source-code"],
                },
                {
                  type: ComponentTypes.BUTTON,
                  style: ButtonStyles.DANGER,
                  label: "x Delete",
                  customID: `delete_${msg.author.id}`,
                  disabled: true,
                },
              ],
            },
          ],  
        },
      ],
    });
  },
};

export default command;
