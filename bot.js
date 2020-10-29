require('dotenv').config();
const Discord = require('discord.js');
const Keyv = require('keyv');
const bot = new Discord.Client();
const TOKEN = process.env.BOT_TOKEN;
const dblink = process.env.DB_URL;
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
        msg.member.guild.fetchInvites().then(invites => {
        // This is the *existing* invites for the guild.
        const ei = guildInvites[msg.member.guild.id];
        // Update the cached invites
        guildInvites[msg.member.guild.id] = invites;
        const findVar = invites.find(x => x.code === parsedInvite)

        if (findVar != null && findVar.code == parsedInvite) {
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
      const fromDB = await getFromDB(parsedMessage[1]);
      
      
      if (fromDB == undefined) {
        msg.reply("Sorry that doesn't exist!");
      }
      else {
        msg.reply("The invite code, " + parsedMessage[1] + " is assigned to: " + fromDB);
      }
    }
      
  }

});

bot.on('guildMemberAdd', member => {
    console.log("Guild?")
    
    // To compare, we need to load the current invite list.
    member.guild.fetchInvites().then(async invites => {
    // This is the *existing* invites for the guild.
    const ei = guildInvites[member.guild.id];

    // Update the cached invites
    guildInvites[member.guild.id] = invites;

    // Look through the invites, find the one for which the uses went up.
    const invite = invites.find(i => ei.get(i.code).uses < i.uses);

    console.log(invite.code);

    
    const findRole = await getFromDB(invite.code);
    
    if (findRole != undefined) {
      let role = member.guild.roles.find(x => x.name === findRole);
      member.addRole(role.id);
      console.info("Set " + member.displayName + " to " + role);
    }

    });
});

async function addToDB(invite, role) {
  const database = new Keyv(dblink);
  database.on('error', err => console.error('Keyv connection error:', err));
  try {
    await database.set(invite, role);
    console.log("Added Key to DB")
  }
  catch (error) {
    console.log(error)
    throw(error)
  }
}

async function getFromDB(invite) {
  const database = new Keyv(dblink);
  database.on('error', err => console.error('Keyv connection error:', err));
  try {
    let role = undefined
    await database.get(invite).then(function(result) {role = result});
    console.log(role)
    return role;
  }
  catch (error) {
    console.log(error)
    throw(error)
  }
  
}