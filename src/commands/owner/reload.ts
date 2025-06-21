import { Message } from "oceanic.js";
import { Command, CommandHandler } from "~command";

const command: Command = {
  name: "reload",
  description: "Reloads all commands",
  ownerOnly: true,
  async execute(msg: Message) {
    try {
      const commands = new CommandHandler();
      const result = await commands.reload();

      if (result.success) {
        await msg.reply({
          content: "done! reloaded all commands successfully.",
        });
      } else {
        let response = "";
        result.failures.forEach((error: any, command: any) => {
          response += error;
        });
        await msg.reply({
          content: String(response).codeblock("ansi"),
        });
      }
    } catch (error) {
      await msg.reply({
        content: String(error).codeblock("diff"),
      });
    }
  },
};

export default command;
