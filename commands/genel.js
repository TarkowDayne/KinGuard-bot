const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription('Kullanıcının profil fotoğrafını gösterir.')
      .addUserOption(opt => opt.setName('kullanici').setDescription('Avatarı bakılacak üye')),
    async execute(interaction) {
      const user = interaction.options.getUser('kullanici') || interaction.user;
      const embed = new EmbedBuilder()
        .setTitle(`${user.username} Profil Fotoğrafı`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setColor('#5865F2');
      await interaction.reply({ embeds: [embed] });
    }
  }
];