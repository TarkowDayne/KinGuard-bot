const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('croxydb'); // Veritabanımızı projeye dahil ettik

module.exports = [
  // 1. Otorol Ayarlama Komutu
  {
    data: new SlashCommandBuilder()
      .setName('otorol-ayarla')
      .setDescription('Sunucuya katılanlara verilecek otomatik rolü ayarlar.')
      .addRoleOption(opt => opt.setName('rol').setDescription('Verilecek rolü seçin').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Sadece Rol Yönet yetkisi olanlar kullanabilir
    async execute(interaction) {
      const rol = interaction.options.getRole('rol');
      
      // Ayarlanan rolü veritabanına kaydediyoruz
      db.set(`otorol_${interaction.guild.id}`, rol.id);
      
      await interaction.reply({ content: `✅ Oto-rol başarıyla ayarlandı! Artık sunucuya katılanlara <@&${rol.id}> rolü verilecek.`, ephemeral: true });
    }
  },
  
  // 2. Otorol Kapatma Komutu
  {
    data: new SlashCommandBuilder()
      .setName('otorol-kapat')
      .setDescription('Oto-rol sistemini kapatır.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
      // Veritabanındaki rol kaydını siliyoruz
      db.delete(`otorol_${interaction.guild.id}`);
      await interaction.reply({ content: `❌ Oto-rol sistemi başarıyla kapatıldı!`, ephemeral: true });
    }
  }
];