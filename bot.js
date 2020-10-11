require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const inviteProperties = {};
const guildInvites = {};
const wait = require('util').promisify(setTimeout);

bot.login(TOKEN);

bot.on('ready', () => {
  wait(1000);
  console.info(`Logged in as ${bot.user.tag}!`);


  bot.guilds.forEach(g => {
    g.fetchInvites().then(invites => {
      guildInvites[g.id] = invites;
    });
  });
});

bot.on('message', msg => {
  if (msg.content.toLowerCase().includes('pledge')) {
    msg.reply('Excuse me, I think the term you meant to use was ***associate member*** >:(');

  } 
  else if (msg.content.startsWith('!setInviteRole')) {
    if (msg.member.guild.me.hasPermission('ADMINISTRATOR')) {
      var parsedMessage = msg.content.split(" ");

      if (parsedMessage < 3) {
        msg.reply("Incorrect parameters! Usage: !setInviteRole [Role] [Invite ID]")
      }

      else {
        var parsedRole = parsedMessage[1];
        var parsedInvite = parsedMessage[2];

        inviteProperties[parsedInvite] = parsedRole;
        msg.reply("Users joining from invite " + parsedInvite + " will now be set to " + parsedRole + " on server entry!");
      }
      
    } 
  }
});

bot.on('guildMemberAdd', async member => {
    // To compare, we need to load the current invite list.
    member.guild.fetchInvites().then(invites => {
    // This is the *existing* invites for the guild.
    const ei = guildInvites[member.guild.id];

    // Update the cached invites
    guildInvites[member.guild.id] = invites;

    // Look through the invites, find the one for which the uses went up.
    const invite = invites.find(i => ei.get(i.code).uses < i.uses);

    console.log(invite.code);

    if (inviteProperties[invite.code] != undefined) {
      const role = member.guild.roles.find(x => x.name === inviteProperties[invite.code]);
      member.addRole(role.id)
      console.info("Set " + member.displayName + " to " + role);
    }
    });
});