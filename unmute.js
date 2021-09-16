const ms = require("ms");
const humanizeDuration = require("humanize-duration");
const { MessageEmbed, Permissions } = require("discord.js");
const muterole = require("../../database/models/MuteRoleSchema.js");

module.exports = {
  name: "unmute",
  aliases: ["um"],
  usage: "unmute <@user>",
  category: "Moderation",
  description: "Unmutes a member in your server.",

  run: async (client, message, args) => {

    try {

      let dataRole = await muterole.findOne({
        GuildID: message.guild.id
      });

      if (!dataRole) {
        const noDataRole = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} There is not mute role set in this server.\nType \`setmuterole <@role>\` to setup one.`)

        return message.reply({ embeds: [noDataRole] });
      }

      if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        const noUserPerms = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} You need the **MANAGE_ROLES** permission to use this command.`)

        return message.reply({ embeds: [noUserPerms] });
      }

      if (!message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        const noBotPerms = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} I cannot unmute this user.\nI'm missing the **MANAGE_ROLES** permission.`)

        return message.reply({ embeds: [noBotPerms] });
      }

      const toMute = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!toMute) {
        const noArgs = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} You need to mention a member!\n\nUsage:\n> unmute <@member>`)
        
        return message.reply({ embeds: [noArgs] });
      }

      let mRole = message.guild.roles.cache.find(role => role.id === dataRole.RoleID);
      console.log(mRole)
      if (!mRole) {
        const noRoleFound = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} The mute role is registered in my database, but I couldn't find it on the server, maybe it was deleted.`)
        .setFooter("Note: You can set a new muterole by running the setmuterole command.")
        
        return message.reply({ embeds: [noRoleFound] });
      }

      if(!toMute.roles.cache.has(mRole.id)){
        const hasRole = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} The member **${toMute.user.tag}** is not muted!`)
        
        return message.reply({ embeds: [hasRole] });
      } else {
        await toMute.roles.remove(mRole);

        const userMuted = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.success} **${toMute.user.tag}** has been unmuted successfully.`)
      
        return message.reply({ embeds: [userMuted] })
      }

    } catch (error) {
      console.error(String(error.message))
      const erroEmbed = new MessageEmbed()
      .setColor("RED")
      .setAuthor("An unexpected error ocurred:")
      .setDescription(`\`\`\`${String(error.stack)}\`\`\``)
      message.reply({ embeds: [erroEmbed] })
    }
  }
}