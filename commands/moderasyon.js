const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [
  // 1. BAN KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Belirtilen kullanıcıyı sunucudan yasaklar.')
      .addUserOption(opt => opt.setName('kullanici').setDescription('Yasaklanacak üye').setRequired(true))
      .addStringOption(opt => opt.setName('sebep').setDescription('Yasaklama sebebi'))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
      const user = interaction.options.getUser('kullanici');
      const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';
      await interaction.guild.members.ban(user, { reason: sebep });
      await interaction.reply({ content: `🔨 **${user.tag}** sunucudan yasaklandı. Sebep: *${sebep}*` });
    }
  },
  // 2. KICK KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Belirtilen kullanıcıyı sunucudan atar.')
      .addUserOption(opt => opt.setName('kullanici').setDescription('Atılacak üye').setRequired(true))
      .addStringOption(opt => opt.setName('sebep').setDescription('Atılma sebebi'))
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
      const user = interaction.options.getUser('kullanici');
      const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';
      await interaction.guild.members.kick(user, sebep);
      await interaction.reply({ content: `👞 **${user.tag}** sunucudan atıldı. Sebep: *${sebep}*` });
    }
  },
  // 3. TEMİZLE KOMUTU
  {
    data: new SlashCommandBuilder()
      .setName('temizle')
      .setDescription('Kanaldaki mesajları toplu siler.')
      .addIntegerOption(opt => opt.setName('sayi').setDescription('Silinecek mesaj sayısı (1-100)').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
      const sayi = interaction.options.getInteger('sayi');
      await interaction.channel.bulkDelete(sayi, true);
      await interaction.reply({ content: `🧹 **${sayi}** adet mesaj temizlendi!`, ephemeral: true });
    }
  },
  // 4. SİL KOMUTU (Temizle ile birebir aynı işi yapar)
  {
    data: new SlashCommandBuilder()
      .setName('sil')
      .setDescription('Kanaldaki mesajları toplu siler.')
      .addIntegerOption(opt => opt.setName('sayi').setDescription('Silinecek mesaj sayısı (1-100)').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
      const sayi = interaction.options.getInteger('sayi');
      await interaction.channel.bulkDelete(sayi, true);
      await interaction.reply({ content: `🧹 **${sayi}** adet mesaj silindi!`, ephemeral: true });
    }
  }
];