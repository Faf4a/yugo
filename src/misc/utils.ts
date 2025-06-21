import type { Member, Message } from "oceanic.js";

export function getHighestRole({ guild, roles }: Member) {
  if (!roles.length) return null;

  const memberRoles = roles.map((r) => guild.roles.get(r)!);

  return memberRoles.reduce((a, b) => (a.position > b.position ? a : b));
}

export async function resolveTarget(
  resolveable: string,
  { guild, channel, messageReference }: Message,
) { 
  if (!guild || !channel) return null;

  if (messageReference && messageReference.messageID) {
    const message = await channel.getMessage(messageReference.messageID);
    if (!message) return null;
    return message.author;
  }

  const mentionMatch = resolveable.match(/^<@!?(\d+)>$/);
  if (mentionMatch) {
    const id = mentionMatch[1];
    return guild.members.get(id);
  }

  return guild.members.find(
    (x) =>
      x.username.toLowerCase() === resolveable.toLowerCase() ||
      x.id === resolveable ||
      x.displayName.toLowerCase() === resolveable.toLowerCase(),
  );
}
