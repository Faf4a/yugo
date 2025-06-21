import { Member } from "oceanic.js";
import { Command } from "~command";
import { getHighestRole, resolveTarget } from "~misc/utils";

const command: Command = {
  name: "ban",
  description: "ban someone",
  usage: "ban <member> <deletiondays?> <reason?>",
  modOnly: true,
  async execute(msg, { args }) {
    const member: Member = msg!.member as any as Member;

    if (!member) return msg.createReaction("❌");

    if (!msg.messageReference && !args[0]) {
      return msg.createReaction("❓");
    }

    const target: Member | null = await resolveTarget(args[0], msg) as any as Member;

    if (!target) return msg.createReaction("❓");
    if (target.id === member.id) return msg.createReaction("👀");

    const targetRoles = target.roles.map((r) => msg.guild!.roles.get(r)!);

    if (targetRoles.some((r) => r.permissions.has("ADMINISTRATOR"))) return msg.createReaction("🚫");

    const highestRole = getHighestRole(member);
    const highestTargetRole = getHighestRole(target);

    if (!highestRole || !highestTargetRole || highestTargetRole.position >= highestRole.position)
      return msg.createReaction("🚫");

    let deletionDays = 0;
    let reason = "";
    if (args[1] && /^\d+$/.test(args[1]) && parseInt(args[1]) < 7) {
      deletionDays = parseInt(args[1]);
      reason = args.slice(2).join(" ");
    } else {
      reason = args.slice(1).join(" ");
    }

    if (msg.messageReference && msg.messageReference.messageID) {
      const refMsg = await msg.channel!.getMessage(msg.messageReference.messageID).catch(() => null);
      await target.ban({
        reason: reason ? reason : `Banned for message: ${refMsg ? refMsg.content : "No message reference"} - ${msg.author.username} (${msg.author.id})`,
        // @ts-ignore
        deleteMessageDays: deletionDays,
      });
    } else {
      await target.ban({
        reason: reason ? `${reason} - ${msg.author.username} (${msg.author.id})` : `${msg.author.username} (${msg.author.id})`,
        // @ts-ignore
        deleteMessageDays: deletionDays,
      });
    }

    return msg.reply({
      content: `Done!\n\nBanned **${target.username}** (<@${target.id}>)`
    })
  },
};

export default command;
