require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, Collection, EmbedBuilder } = require('discord.js'); 
const db = require('croxydb');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // Girenleri ve çıkanları takip etmek için bu izin şart
  ]
});

client.commands = new Collection();

const moderasyon = require('./commands/moderasyon');
const genel = require('./commands/genel');
const otorol = require('./commands/otorol');
const hosgeldin = require('./commands/hosgeldin'); 
const allCommands = [...moderasyon, ...genel, ...otorol, ...hosgeldin];

const slashData = [];
for (const cmd of allCommands) {
  client.commands.set(cmd.data.name, cmd);
  slashData.push(cmd.data.toJSON());
}

client.once('ready', async () => {
  console.log(`[BAŞARILI] ${client.user.tag} aktif!`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    const sunucuId = client.guilds.cache.first().id; 
    await rest.put(Routes.applicationGuildCommands(client.user.id, sunucuId), { body: slashData });
    console.log('[BAŞARILI] Tüm komutlar sunucuya yüklendi!');
  } catch (err) {
    console.error('Hata:', err);
  }
});

// BİRİ SUNUCUYA GİRDİĞİNDE (Hoş geldin ve Otorol)
client.on('guildMemberAdd', async (member) => {
  const otorolId = db.get(`otorol_${member.guild.id}`);
  if (otorolId) {
    try {
      await member.roles.add(otorolId);
    } catch (error) {
      console.error('Otorol verilemedi.');
    }
  }

  const kanalId = db.get(`hosgeldinKanal_${member.guild.id}`);
  if (kanalId) {
    const kanal = member.guild.channels.cache.get(kanalId);
    if (kanal) {
      const embed = new EmbedBuilder()
        .setTitle('🎉 Sunucuya Yeni Biri Katıldı!')
        .setDescription(`Aramıza hoş geldin <@${member.id}>! Seninle birlikte **${member.guild.memberCount}** kişi olduk.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor('#2ecc71'); // Yeşil renk

      kanal.send({ content: `Hoş geldin dostum <@${member.id}>!`, embeds: [embed] });
    }
  }
});

// BİRİ SUNUCUDAN ÇIKTIĞINDA (Görüşürüz Mesajı) - YENİ EKLENEN KISIM
client.on('guildMemberRemove', async (member) => {
  const kanalId = db.get(`gorusuruzKanal_${member.guild.id}`);
  if (kanalId) {
    const kanal = member.guild.channels.cache.get(kanalId);
    if (kanal) {
      const embed = new EmbedBuilder()
        .setTitle('👋 Birisi Sunucudan Ayrıldı')
        .setDescription(`Görüşürüz **${member.user.username}**... Sen gittikten sonra **${member.guild.memberCount}** kişi kaldık.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor('#e74c3c'); // Kırmızı renk

      kanal.send({ embeds: [embed] });
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    await interaction.reply({ content: 'Bu komut çalıştırılırken bir hata oluştu.', ephemeral: true });
  }
});
// --- WEB PANELİ SİSTEMİ ---
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); 

// SİTEYE GİRİLDİĞİNDE:
app.get('/', (req, res) => {
  const sunucu = client.guilds.cache.first(); 
  let roller = [];
  let kanallar = [];
  let aktifOtorol = null;
  let aktifHosgeldin = null;
  let aktifGorusuruz = null; // YENİ EKLENDİ

  if (sunucu) {
    roller = sunucu.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name }));
    aktifOtorol = db.get(`otorol_${sunucu.id}`);

    kanallar = sunucu.channels.cache.filter(c => c.type === 0).map(c => ({ id: c.id, name: c.name }));
    aktifHosgeldin = db.get(`hosgeldinKanal_${sunucu.id}`);
    aktifGorusuruz = db.get(`gorusuruzKanal_${sunucu.id}`); // YENİ EKLENDİ
  }

  res.render('index', { bot: client, sunucu, roller, aktifOtorol, kanallar, aktifHosgeldin, aktifGorusuruz }); 
});

// OTOROL KAYDET BUTONU
app.post('/ayarlar/otorol', (req, res) => {
  const sunucu = client.guilds.cache.first();
  const secilenRol = req.body.otorol;
  if (sunucu && secilenRol) db.set(`otorol_${sunucu.id}`, secilenRol);
  else if (sunucu && !secilenRol) db.delete(`otorol_${sunucu.id}`);
  res.redirect('/'); 
});

// HOŞ GELDİN KANALI KAYDET BUTONU
app.post('/ayarlar/hosgeldin', (req, res) => {
  const sunucu = client.guilds.cache.first();
  const secilenKanal = req.body.hosgeldin;
  if (sunucu && secilenKanal) db.set(`hosgeldinKanal_${sunucu.id}`, secilenKanal);
  else if (sunucu && !secilenKanal) db.delete(`hosgeldinKanal_${sunucu.id}`);
  res.redirect('/'); 
});

// GÖRÜŞÜRÜZ KANALI KAYDET BUTONU (YENİ EKLENDİ)
app.post('/ayarlar/gorusuruz', (req, res) => {
  const sunucu = client.guilds.cache.first();
  const secilenKanal = req.body.gorusuruz;
  if (sunucu && secilenKanal) db.set(`gorusuruzKanal_${sunucu.id}`, secilenKanal);
  else if (sunucu && !secilenKanal) db.delete(`gorusuruzKanal_${sunucu.id}`);
  res.redirect('/'); 
});
// Render'ın otomatik port atayabilmesi için ayar
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[BAŞARILI] Web paneli ${port} portunda aktif!`);
});
// --------------------------
client.login(process.env.DISCORD_TOKEN);