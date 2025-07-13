import { Command } from "~command";
import { PTERO_API_KEY } from "env";
import { Member } from "oceanic.js";
import database from "~misc/db";

const SIX_MONTHS = 1000 * 60 * 60 * 24 * 30 * 6;
const SIXTY_DAYS = 1000 * 60 * 60 * 24 * 60;
const DONATOR_ROLE_IDS = ["773353340674900029", "1251992565381857342", "773661503214583808"];

const command: Command = {
  name: "new",
  description: "Create a Pterodactyl panel user",
  usage: "new",
  category: "Hosting",
  ownerOnly: false,
  async execute(msg, { args }) {
    const member = msg.member as Member;
    const user = member.user;

    const now = Date.now();

    const isDonator = DONATOR_ROLE_IDS.some((roleId) => member.roles.includes(roleId));

    if (!isDonator) {
      const createdAt = new Date(user.createdAt).getTime();
      if (now - createdAt < SIX_MONTHS) {
        return msg.reply({
          content: `Your Discord account must be at least 6 months old to use this command.`,
        });
      }

      const joinedAt = new Date(member.joinedAt as any as Date).getTime();
      if (now - joinedAt < SIXTY_DAYS) {
        return msg.reply({
          content: `You must be a member of this server for at least 60 days before using this command.`,
        });
      }
    }

    const { count: userCount } = database.getAllUsers();
    if (userCount >= 30) {
      return msg.reply({
        content: `The limit of 30 free users has been reached. Please try again later.`,
      });
    }

    const userExists = await database.getUser(member.id);
    if (userExists) {
      return msg.reply({ content: `You already have a Pterodactyl user created!` });
    }

    const username = user.username.replace(/[^a-zA-Z0-9]/g, "");
    const email = `${member.id}@email.com`;
    const password = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 1000);

    member.user
      .createDM()
      .then((dm) =>
        dm.createMessage({
          content:
            `Your Pterodactyl user has been created! Here are your credentials:\n\n` +
            `**Username:** ${username}\n` +
            `**Email:** ${email}\n` +
            `**Password:** ${password}\n\n` +
            `Please change your password after logging in at https://host.faf4a.xyz/`,
        }),
      )
      .catch((err) => {
        return msg.reply({
          content: `Failed to send you a DM with your credentials. Please check your DM settings!`,
        });
      });

    const response = await fetch("https://host.faf4a.xyz/api/application/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PTERO_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json",
      },
      body: JSON.stringify({
        username,
        email,
        first_name: username,
        last_name: username,
        password,
      }),
    });

    const body = await response.json();
    if (!response.ok) {
      const errorMsg = body.errors?.map((e: any) => e.detail).join("\n") || "Unknown error";
      return msg.reply({ content: `Failed to create your Pterodactyl user:\n${errorMsg}` });
    }

    database.addUser(member.id, body.attributes.id, email, username);

    return msg.reply({
      content: `User created! Your credentials have been sent via DM. Please __change__ them after logging in!`,
    });
  },
};

export default command;
