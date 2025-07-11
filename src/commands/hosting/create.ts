import database from "~misc/db";
import { Command } from "~command";
import { PTERO_API_KEY } from "env";
import { Member } from "oceanic.js";

const command: Command = {
    name: 'user new',
    description: 'Create a Pterodactyl panel user (one per Discord user)',
    usage: "user new",
    ownerOnly: false,
    async execute(msg, { args }) {

        const member = msg.member as Member;
        const userExists = await database.getUser(member.id);

        if (userExists) {
            return msg.reply({
                content: `You already have a Pterodactyl user created!`
            });
        }

        const username = member.username;
        const email = `${member.id}@email.com`;
        const password = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 1000);

        const response = await fetch('https://panel.faf4a.xyz/api/application/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PTERO_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            body: JSON.stringify({
                username,
                email: email,
                first_name: username,
                last_name: username,
                password,
            })
        });

        const user = await response.json();

        if (!response.ok) {
            const errorMsg = user.errors?.map((e: any) => e.detail).join('\n') || 'Unknown error';
            return msg.reply({
                content: `Failed to create your Pterodactyl user:\n${errorMsg}`
            });
        }

        console.log(user);

        member.user.createDM().then(dm => dm.createMessage({
            content: `Your Pterodactyl user has been created! Here are your credentials:\n\n` +
                `**Username:** ${username}\n` +
                `**Email:** ${email}\n` +
                `**Password:** ${password}\n\n` +
                `Please change your password after logging in at https://panel.faf4a.xyz/`
        })).catch((err: any) => {
            console.error(`Failed to send DM to ${member.username}:`, err.message || err);
            return msg.reply({
                content: `Failed to send you a Direct Message with your credentials. Please check your DM settings!`
            });
        });

        database.addUser(member.id, user.attributes.id, email, username);

        return msg.reply({
            content: `User created! Your credentials have been sent to you via Direct Message. Please __change__ them after logging in!`,
        })

    },
}

export default command;