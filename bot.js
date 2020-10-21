require('dotenv').config();
const Discord = require('discord.js');
const Keyv = require('keyv')
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const inviteProperties = {};
const guildInvites = {};
const wait = require('util').promisify(setTimeout);

const dblink = process.env.DB_URL;
const Keyv = new Keyv(dblink);

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

bot.on('message', async msg => {
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


        // To compare, we need to load the current invite list.
        member.guild.fetchInvites().then(invites => {
        // This is the *existing* invites for the guild.
        const ei = guildInvites[member.guild.id];
  
        // Update the cached invites
        guildInvites[member.guild.id] = invites;
        
        if (ei.indexOf(parsedInvite) !== -1) {
          addToDB(parsedInvite, parsedRole);
          msg.reply("Users joining from invite " + parsedInvite + " will now be set to " + parsedRole + " on server entry!");
        }

        else {
          msg.reply("Sorry! " + parsedInvite + " doesn't exist on this server!");
        }
      }); 
      }
      
    } 
  }

  else if (msg.content.startsWith('!showMeRole')) {
    var parsedMessage = msg.content.split(" ");

    if (parsedMessage < 2) {
      msg.reply("Incorrect parameters! Usage: !setInviteRole [Invite ID]")
    }

    else {
      var fromDB = getFromDB(parsedMessage[1])
      if (fromDB == undefined) {
        msg.reply("Sorry that doesn't exist!");
      }
      else {
        msg.reply(fromDB);
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
    

    const findRole = getFromDB(invite.code)
    if (findRole != undefined) {
      const role = member.guild.roles.find(x => x.name === findRole);
      member.addRole(role.id);
      console.info("Set " + member.displayName + " to " + role);
    }

    });
});

async function addToDB(invite, role) {
  await Keyv.set(invite, role);
}

async function getFromDB(invite) {
  role = await Keyv.get(invite);
  return role;
}