import { Command } from "~command";
import { Message } from "oceanic.js";

const command: Command = {
    name: "ping",
    description: "replies with the client latency",
    ownerOnly: false,
    modOnly: false,
    async execute(msg: Message) {
        await msg!.channel!.createMessage({
            content: `Pong! Latency is ${msg.client.shards.get(0)!.latency
                }ms.`,
        });
    },
};

export default command;


