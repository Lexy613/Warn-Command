const { MessageEmbed, Permissions } = require("discord.js");
const punishments = require("../../database/models/WarnSchema.js");

module.exports = {
  name: "warn",
  aliases: ["w", "strike"],
  usage: "warn <@user> <reason>",
  category: "Moderation",
  description: "Warn a user in the server.",

  run: async (client, message, args) => {

    try {

      if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        const noUserPerms = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} You need the **MANAGE_ROLES** permission to use this command.`)

        return message.reply({ embeds: [noUserPerms] });
      }

      let toWarn = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!toWarn) {
        const noMember = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} You need to mention a member!\n\nUsage:\n> warn <@member> <reason>`)

        return message.reply({ embeds: [noMember] });
      }

      let reason = args.slice(1).join(" ");
      if (!reason) {
        const noReason = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} Please provide a reason.`)

        return message.reply({ embeds: [noReason] });
      }

      if (toWarn.id === message.author.id) {
        const sameUser = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} You cannot warn yourself!`)
        
        return message.reply({ embeds: [sameUser] });
      };

      if (toWarn.id === client.user.id) {
        const toBot = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} Why me?`)
        
        return message.reply({ embeds: [toBot] });
      }

      if (message.guild.ownerId !== message.author.id && toWarn.roles.highest.comparePositionTo(message.member.roles.highest) >= 0) {
        const roleHierarchy = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.error} Due to your role hierarchy, you cannot warn this user`)
        
        return message.reply({ embeds: [roleHierarchy] });
      }
      
      let que = Math.floor(Math.random() * 9000);
      let so = Math.floor(Math.random() * 189);
      
      const randomID = que * so;
      let dataPunish = await punishments.findOne({
        GuildID: message.guild.id,
        UserID: toWarn.id
      });

      if (dataPunish) {
        dataPunish.Punishments.unshift({
          PunishType: "warn",
          PunishID: randomID,
          Moderator: message.author.tag,
          Reason: reason
        });

        dataPunish.save();

        const savePunish = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.success} \`${randomID}\` - **${toWarn.user.tag}** has been warned.`)

        return message.reply({ embeds: [savePunish] });

      } else if (!dataPunish) {

        let newDataPunish = new punishments({
          GuildID: message.guild.id,
          UserID: toWarn.id,
          Punishments: [{
            PunishType: "warn",
            PunishID: randomID,
            Moderator: message.author.tag,
            Reason: reason 
          }]
        });

        newDataPunish.save();

        const saveDataPunish = new MessageEmbed()
        .setColor("#2f3136")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(`${client.emotes.success} \`${randomID}\` - **${toWarn.user.tag}** has been warned.`)

        return message.reply({ embeds: [saveDataPunish] });
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