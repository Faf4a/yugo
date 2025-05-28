import { Message, CreateMessageOptions } from "oceanic.js";
import { codeblock, codeblockInline } from "./codeblock";

declare global {
  interface String {
    codeblock(language?: string): string;
    codeblockInline(language?: string): string;
  }
}

declare module "oceanic.js" {
  interface Message {
    reply(content: CreateMessageOptions): Promise<any>;
  }
}

Object.defineProperty(Message.prototype, "reply", {
  value: function (this: Message, content: CreateMessageOptions) {
    return this.channel!.createMessage({
      messageReference: {
        messageID: this.id,
      },
      ...content,
    });
  },
});

String.prototype.codeblock = function (language: string = "js") {
  return codeblock(this.toString(), language);
};

String.prototype.codeblockInline = function (language: string = "js") {
  return codeblockInline(this.toString(), language);
};
