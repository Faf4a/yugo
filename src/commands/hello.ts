import { Command } from "~command";
import { Message } from "oceanic.js";

const command: Command = {
  name: "hello",
  description: "replies with a greeting message",
  ownerOnly: false,
  modOnly: false,
  async execute(msg: Message) {
    await msg!.channel!.createMessage({
      content: `Hello World, ${msg.author.username}!`,
    });
  },
};

export default command;
