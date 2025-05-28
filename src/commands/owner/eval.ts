// Modified version of Vendicated's eval command
// https://codeberg.org/vee/bot

import { Command } from "~command";
import { inspect } from "~misc/inspect";

const command: Command = {
  name: "eval",
  description: "evaluates code",
  usage: "eval <code>",
  ownerOnly: true,
  modOnly: false,
  async execute(msg) {
    const code = msg.content;
    const console: any = {
      _lines: [] as string[],
      _log(...things: string[]) {
        this._lines.push(
          ...things
            .map((x) => inspect(x, { getters: true }))
            .join(" ")
            .split("\n")
        );
      },
    };
    console.log =
      console.error =
      console.warn =
      console.info =
        console._log.bind(console);

    const { client, channel, author, content, guild, member } = msg;
    const yugo = msg.client;
    const fs = require("fs");
    const http = require("http");
    const https = require("https");
    const crypto = require("crypto");
    const net = require("net");
    const path = require("path");
    const util = require("util");
    const assert = require("assert");
    const os = require("os");
    const oceanic = require("oceanic.js");

    let script = code.replace(/(^`{3}(js|javascript)?|`{3}$)/g, "");
    if (script.includes("await")) script = `(async () => { ${script} })()`;

    try {
      var result = await eval(script);
    } catch (e: Error | any) {
      var result = e;
    }

    const res = inspect(result, { getters: true }).slice(0, 2000);

    let output = String(res).codeblock("js");
    const consoleOutput = console._lines
      .join("\n")
      .slice(0, Math.max(0, 1990 - output.length));

    if (consoleOutput) output += `\n${String(consoleOutput).codeblock("js")}`;

    return msg.reply({
      content: output,
    });
  },
};

export default command;
