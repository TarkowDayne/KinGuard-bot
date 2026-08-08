const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('croxydb');

module.exports = [
  // 1. Hoş Geldin Kanalını Ayarlama
  {
    data: new SlashCommandBuilder()
      .setName('hosgeldin-ayarla')
      .setDescription('Sunucuya yeni biri katıldığında karşılama mesajı atılacak kanalı ayarlar.')
      .addChannelOption(opt => 
        opt.setName('kanal')
          .setDescription('Karşılama mesajlarının atılacağı kanal')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      const kanal = interaction.options.getChannel('kanal');
      db.set(`hosgeldinKanal_${interaction.guild.id}`, kanal.id);
      await interaction.reply({ content: `✅ Hoş geldin mesajları artık <#${kanal.id}> kanalına atılacak!`, ephemeral: true });
    }
  },
  
  // 2. Hoş Geldin Sistemini Kapatma
  {
    data: new SlashCommandBuilder()
      .setName('hosgeldin-kapat')
      .setDescription('Hoş geldin mesajı sistemini kapatır.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      db.delete(`hosgeldinKanal_${interaction.guild.id}`);
      await interaction.reply({ content: `❌ Hoş geldin sistemi başarıyla kapatıldı!`, ephemeral: true });
    }
  },

  // 3. Görüşürüz Kanalını Ayarlama (YENİ)
  {
    data: new SlashCommandBuilder()
      .setName('gorusuruz-ayarla')
      .setDescription('Sunucudan biri ayrıldığında veda mesajı atılacak kanalı ayarlar.')
      .addChannelOption(opt => 
        opt.setName('kanal')
          .setDescription('Veda mesajlarının atılacağı kanal')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      const kanal = interaction.options.getChannel('kanal');
      db.set(`gorusuruzKanal_${interaction.guild.id}`, kanal.id);
      await interaction.reply({ content: `✅ Veda (görüşürüz) mesajları artık <#${kanal.id}> kanalına atılacak!`, ephemeral: true });
    }
  },

  // 4. Görüşürüz Sistemini Kapatma (YENİ)
  {
    data: new SlashCommandBuilder()
      .setName('gorusuruz-kapat')
      .setDescription('Veda mesajı sistemini kapatır.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
      db.delete(`gorusuruzKanal_${interaction.guild.id}`);
      await interaction.reply({ content: `❌ Veda sistemi başarıyla kapatıldı!`, ephemeral: true });
    }
  }
];