const { Telegraf, session } = require('telegraf');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const updater = require("./updater");
const updateLink = require("./updatelink");
const archiver  = require("archiver");
const chokidar  = require("chokidar");
const config = require('./config');

// Inisialisasi bot
const bot = new Telegraf(config.BOT_TOKEN);

// Session
bot.use(session({
  defaultSession: () => ({
    waitingFor: null,
    tempFile: null,
    userId: null
  })
}));

// Buat direktori storage
const storagePath = path.join(__dirname, config.STORAGE_PATH);
fs.ensureDirSync(storagePath);

// Buat direktori backup
const backupPath = path.join(__dirname, 'backup');
fs.ensureDirSync(backupPath);

// Variable untuk update
const WAITING_UPDATE_LINK = {};
const UPDATE_FLAG = "./update.flag";

// Database
const dbPath = path.join(storagePath, 'files.json');
let fileDB = [];

if (fs.existsSync(dbPath)) {
  try {
    fileDB = fs.readJsonSync(dbPath);
  } catch (e) {
    fileDB = [];
    fs.writeJsonSync(dbPath, []);
  }
} else {
  fs.writeJsonSync(dbPath, []);
}

function saveDB() {
  fs.writeJsonSync(dbPath, fileDB, { spaces: 2 });
}

// ============= AUTO BACKUP =============
async function autoBackup(sendToOwner = true) {
  try {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFileName = `backup_${dateStr}.json`;
    const backupFilePath = path.join(backupPath, backupFileName);
    
    const backupData = {
      timestamp: now.toISOString(),
      totalFiles: fileDB.length,
      totalUsers: [...new Set(fileDB.map(f => f.userId))].length,
      totalSize: fileDB.reduce((sum, f) => sum + f.size, 0),
      data: fileDB
    };
    
    await fs.writeJson(backupFilePath, backupData, { spaces: 2 });
    
    console.log(`✅ Backup created: ${backupFileName} (${fileDB.length} files)`);
    
    if (sendToOwner && config.OWNER_ID) {
      try {
        const stats = await fs.stat(backupFilePath);
        const fileSize = (stats.size / 1024).toFixed(1);
        
        const caption = `<b>💾 Backup Otomatis</b>

<b>📁 File:</b> ${backupFileName}
<b>📊 Size:</b> ${fileSize} KB
<b>📅 Time:</b> ${now.toLocaleString('id-ID')}
<b>📂 Total Files:</b> ${backupData.totalFiles}
<b>👤 Total Users:</b> ${backupData.totalUsers}
<b>📦 Total Size:</b> ${formatFileSize(backupData.totalSize)}

<i>Backup otomatis dari File Storage Bot</i>`;

        await bot.telegram.sendDocument(
          config.OWNER_ID,
          { source: backupFilePath, filename: backupFileName },
          { 
            caption: caption,
            parse_mode: 'HTML'
          }
        );
        console.log(`📤 Backup sent to owner: ${config.OWNER_ID}`);
      } catch (sendError) {
        console.error('❌ Failed to send backup to owner:', sendError.message);
      }
    }
    
    await cleanupOldBackups(10);
    return backupFileName;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return null;
  }
}

async function cleanupOldBackups(keepCount = 10) {
  try {
    const files = await fs.readdir(backupPath);
    const backupFiles = files
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .sort();
    
    if (backupFiles.length > keepCount) {
      const filesToDelete = backupFiles.slice(0, backupFiles.length - keepCount);
      for (const file of filesToDelete) {
        await fs.remove(path.join(backupPath, file));
        console.log(`🗑️ Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up backups:', error);
  }
}

async function restoreBackup(backupFile) {
  try {
    const backupFilePath = path.join(backupPath, backupFile);
    if (!fs.existsSync(backupFilePath)) {
      throw new Error('Backup file not found');
    }
    
    const backupData = await fs.readJson(backupFilePath);
    fileDB = backupData.data || [];
    saveDB();
    
    console.log(`✅ Restored from backup: ${backupFile} (${fileDB.length} files)`);
    return true;
  } catch (error) {
    console.error('❌ Restore failed:', error);
    return false;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidFormat(extension) {
  return config.ALLOWED_FORMATS.includes(extension.toLowerCase());
}

function getFileCategory(extension) {
  const categories = {
    documents: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'md'],
    images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    videos: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'],
    audios: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'],
    archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    others: ['json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'go', 'rs']
  };
  
  for (const [category, formats] of Object.entries(categories)) {
    if (formats.includes(extension.toLowerCase())) {
      return category;
    }
  }
  return 'others';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function createInlineKeyboard(buttons, isEven = true) {
  const keyboard = [];
  let row = [];
  const columns = isEven ? 2 : 1;
  
  buttons.forEach((btn, index) => {
    row.push(btn);
    if ((index + 1) % columns === 0 || index === buttons.length - 1) {
      keyboard.push(row);
      row = [];
    }
  });
  
  return { inline_keyboard: keyboard };
}

// ============= MENU UTAMA =============
function getMainMenu() {
  const buttons = [
    { text: '📤 Simpan File', callback_data: 'save_file', style: 'success' },
    { text: '📋 List File', callback_data: 'list_files', style: 'success' },
    { text: '🗑️ Hapus File', callback_data: 'delete_file', style: 'primary' },
    { text: '📊 Statistik', callback_data: 'stats', style: 'primary' }
  ];
  
  if (config.OWNER_ID) {
    buttons.push({ text: '💾 Backup', callback_data: 'backup_menu', style: 'danger' });
  }
  
  return createInlineKeyboard(buttons, true);
}

function getCancelKeyboard() {
  return createInlineKeyboard([
    { text: '</> Back', callback_data: 'cancel_save', style: 'danger' }
  ], true);
}

// Fungsi untuk edit caption dengan aman
async function safeEditCaption(ctx, caption, options = {}) {
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      const msg = ctx.callbackQuery.message;
      
      if (msg.caption !== undefined) {
        await ctx.editMessageCaption(caption, {
          parse_mode: 'HTML',
          reply_markup: options.reply_markup || getMainMenu()
        });
        return true;
      } else if (msg.text !== undefined) {
        await ctx.editMessageText(caption, {
          parse_mode: 'HTML',
          reply_markup: options.reply_markup || getMainMenu()
        });
        return true;
      } else {
        await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
          caption: caption,
          parse_mode: 'HTML',
          reply_markup: options.reply_markup || getMainMenu()
        });
        return false;
      }
    } else {
      await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: options.reply_markup || getMainMenu()
      });
      return false;
    }
  } catch (error) {
    console.log('Edit failed, sending new message:', error.message);
    await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: options.reply_markup || getMainMenu()
    });
    return false;
  }
}

// Fungsi kembali ke menu - dengan opsi silent (tanpa pesan)
async function backToMenu(ctx, silent = false) {
  ctx.session.waitingFor = null;
  ctx.session.tempFile = null;
  
  const userId = ctx.from.id;
  const userFiles = fileDB.filter(f => f.userId === userId);
  const totalUsers = [...new Set(fileDB.map(f => f.userId))].length;
  
  let html = '';
  if (!silent) {
    html = `<blockquote><b>📁 Selamat datang di File Storage Bot!</b></blockquote>
<blockquote><b>👤 User ID:</b> <code>${userId}</code>
📁 <b>File Anda:</b> ${userFiles.length} file
👥 <b>Total Users: ${totalUsers}</b></blockquote>
<blockquote expandable><b>📤 Simpan file dengan nama custom
📋 Lihat dan unduh file tersimpan
🗑️ Hapus file yang tidak diperlukan</b></blockquote>
<blockquote><i>Semua file Anda aman dan privat!</i></blockquote>`;
  } else {
    // Tampilkan menu tanpa pesan tambahan (hanya judul singkat)
    html = `<blockquote><b>📁 Selamat datang di File Storage Bot!</b></blockquote>
<blockquote><b>👤 User ID:</b> <code>${userId}</code>
📁 <b>File Anda:</b> ${userFiles.length} file
👥 <b>Total Users: ${totalUsers}</b></blockquote>
<blockquote expandable><b>📤 Simpan file dengan nama custom
📋 Lihat dan unduh file tersimpan
🗑️ Hapus file yang tidak diperlukan</b></blockquote>
<blockquote><i>Semua file Anda aman dan privat!</i></blockquote>`;
  }

  await safeEditCaption(ctx, html, {
    reply_markup: getMainMenu()
  });
}

// ============= START =============
bot.start(async (ctx) => {
  ctx.session.waitingFor = null;
  ctx.session.tempFile = null;
  
  const userId = ctx.from.id;
  const userFiles = fileDB.filter(f => f.userId === userId);
  const totalUsers = [...new Set(fileDB.map(f => f.userId))].length;
  
  const html = `
<blockquote><b>📁 Selamat datang di File Storage Bot!</b></blockquote>
<blockquote><b>👤 User ID :</b> <code>${userId}</code>
📁 <b>File Anda :</b> ${userFiles.length} file
👥 <b>Total Users : ${totalUsers}</b></blockquote>
<blockquote expandable><b>📤 Simpan file dengan nama custom
📋 Lihat dan unduh file tersimpan
🗑️ Hapus file yang tidak diperlukan</b></blockquote>
<blockquote><i>Semua file Anda aman dan privat!</i></blockquote>`;

  await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
    caption: html,
    parse_mode: 'HTML',
    reply_markup: getMainMenu()
  });
});

// ============= SAVE FILE =============
bot.action('save_file', async (ctx) => {
  await ctx.answerCbQuery();
  
  ctx.session.waitingFor = 'file';
  ctx.session.userId = ctx.from.id;
  
  const html = `
<blockquote><b>📤 Kirim file yang ingin disimpan</b></blockquote>
<blockquote><b>Kirim file untuk di save ke database</b>
<i>Klik Batal untuk membatalkan</i></blockquote>`;

  await safeEditCaption(ctx, html, {
    reply_markup: getCancelKeyboard()
  });
});

// ============= COMMAND UPDATE =============
bot.command("cekupdate", async (ctx) => {
  if (Number(ctx.from.id) !== Number(config.OWNER_ID)) return;
  await updater.checkUpdate(ctx, bot, config);
});

bot.command("setlinkupdate", async (ctx) => {
  if (Number(ctx.from.id) !== Number(config.OWNER_ID)) return;
  WAITING_UPDATE_LINK[ctx.from.id] = true;
  await ctx.reply("Kirim link raw.github untuk update");
});

bot.on("text", async (ctx, next) => {
  const userId = Number(ctx.from.id);
  if (!WAITING_UPDATE_LINK[userId]) return next();
  delete WAITING_UPDATE_LINK[userId];
  const newLink = ctx.message.text.trim();
  await updateLink.setUpdateLink(ctx, newLink);
  await ctx.reply("✅ Link berhasil diubah");
});

// ============= HANDLE FILE =============
bot.on(['document', 'photo', 'video', 'audio'], async (ctx) => {
  if (!ctx.session.waitingFor || ctx.session.waitingFor !== 'file') {
    const html = '📤 <b>Gunakan tombol "Simpan File" untuk menyimpan</b>';
    return ctx.replyWithPhoto(config.THUMBNAIL_URL, {
      caption: html,
      parse_mode: 'HTML',
      reply_markup: getMainMenu()
    });
  }

  try {
    const message = ctx.message;
    let fileId, fileSize, fileExtension, originalName;

    if (message.document) {
      fileId = message.document.file_id;
      fileSize = message.document.file_size;
      originalName = message.document.file_name || 'document';
      fileExtension = path.extname(originalName).slice(1) || 'unknown';
    } else if (message.photo) {
      const photo = message.photo[message.photo.length - 1];
      fileId = photo.file_id;
      fileSize = photo.file_size;
      originalName = `photo_${Date.now()}.jpg`;
      fileExtension = 'jpg';
    } else if (message.video) {
      fileId = message.video.file_id;
      fileSize = message.video.file_size;
      originalName = message.video.file_name || `video_${Date.now()}.mp4`;
      fileExtension = path.extname(originalName).slice(1) || 'mp4';
    } else if (message.audio) {
      fileId = message.audio.file_id;
      fileSize = message.audio.file_size;
      originalName = message.audio.file_name || `audio_${Date.now()}.mp3`;
      fileExtension = path.extname(originalName).slice(1) || 'mp3';
    } else {
      throw new Error('Format tidak didukung');
    }

    if (!isValidFormat(fileExtension)) {
      const formats = config.ALLOWED_FORMATS.join(', ');
      const html = `<b>❌ Format tidak didukung!</b>\n\nFormat yang didukung:\n${formats}`;
      await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
        caption: html,
        parse_mode: 'HTML',
        reply_markup: getMainMenu()
      });
      ctx.session.waitingFor = null;
      return;
    }

    const maxBytes = config.MAX_FILE_SIZE * 1024 * 1024;
    if (fileSize > maxBytes) {
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(1);
      const html = `<blockquote><b>❌ Ukuran terlalu besar!</b></blockquote>
<blockquote><b>Maksimal : ${config.MAX_FILE_SIZE}MB\nUkuran Anda : ${sizeMB}MB</b></blockquote>`;
      await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
        caption: html,
        parse_mode: 'HTML',
        reply_markup: getMainMenu()
      });
      ctx.session.waitingFor = null;
      return;
    }

    ctx.session.tempFile = {
      fileId,
      fileSize,
      fileExtension,
      originalName,
      caption: message.caption || ''
    };

    ctx.session.waitingFor = 'name';
    
    const html = `
<blockquote><b>✏️ Beri nama untuk file ini</b></blockquote>
Kirimkan nama
Contoh : sc enc`;

    await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
      caption: html,
      parse_mode: 'HTML',
      reply_markup: getCancelKeyboard()
    });
    
  } catch (error) {
    console.error('Error:', error);
    const html = `<b>❌ Error:</b> ${error.message}`;
    await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
      caption: html,
      parse_mode: 'HTML',
      reply_markup: getMainMenu()
    });
    ctx.session.waitingFor = null;
  }
});

// ============= HANDLE NAME =============
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  if (text.startsWith('/')) return;
  
  if (ctx.session.waitingFor === 'name') {
    const fileName = text.trim();
    
    if (fileName.length < 1 || fileName.length > 50) {
      await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
        caption: '<b>❌ Nama harus 1-50 karakter</b>\n\nKirim nama baru:',
        parse_mode: 'HTML'
      });
      return;
    }
    
    const userId = ctx.from.id;
    const existingFile = fileDB.find(f => f.userId === userId && f.name === fileName);
    
    if (existingFile) {
      await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
        caption: '<b>❌ Nama sudah digunakan!</b>\n\nSilakan gunakan nama lain:',
        parse_mode: 'HTML'
      });
      return;
    }
    
    try {
      const tempFile = ctx.session.tempFile;
      const fileInfo = await ctx.telegram.getFile(tempFile.fileId);
      
      const storedName = `${Date.now()}_${fileName}.${tempFile.fileExtension}`;
      const filePath = path.join(storagePath, storedName);
      
      const fileLink = await ctx.telegram.getFileLink(tempFile.fileId);
      const response = await fetch(fileLink);
      const buffer = await response.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(buffer));
      
      const fileData = {
        id: generateId(),
        userId: userId,
        name: fileName,
        storedName: storedName,
        originalName: tempFile.originalName,
        size: tempFile.fileSize,
        extension: tempFile.fileExtension,
        category: getFileCategory(tempFile.fileExtension),
        date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        description: tempFile.caption || ''
      };
      
      fileDB.push(fileData);
      saveDB();
      
      // Backup (tetap jalan, tidak tampilkan notifikasi)
      await autoBackup(true);
      
      // Langsung kembali ke menu tanpa pesan
      await backToMenu(ctx, true);
      
      ctx.session.waitingFor = null;
      ctx.session.tempFile = null;
      
    } catch (error) {
      console.error('Error saving:', error);
      const html = `<b>❌ Error:</b> ${error.message}`;
      await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
        caption: html,
        parse_mode: 'HTML',
        reply_markup: getMainMenu()
      });
      ctx.session.waitingFor = null;
    }
  }
});

// ============= CANCEL =============
bot.action('cancel_save', async (ctx) => {
  await ctx.answerCbQuery();
  await backToMenu(ctx, true);
});

// ============= LIST FILES =============
bot.action('list_files', async (ctx) => {
  await ctx.answerCbQuery();
  
  const userId = ctx.from.id;
  const userFiles = fileDB.filter(f => f.userId === userId);
  
  if (userFiles.length === 0) {
    await backToMenu(ctx, false); // tampilkan pesan "belum ada file"
    return;
  }
  
  const buttons = [];
  userFiles.forEach(file => {
    buttons.push({
      text: `📁 ${file.name}`,
      callback_data: `view_${file.id}`
    });
  });
  
  buttons.push({ text: '≪ Back ≫', callback_data: 'back_to_menu', style: 'primary' });
  
  const isEven = userFiles.length % 2 === 0;
  
  const html = `
<blockquote><b>📋 Daftar File Anda (${userFiles.length})</b></blockquote>
<blockquote><b>Klik Button Untuk Mengunduh File :</b></blockquote>`;

  await safeEditCaption(ctx, html, {
    reply_markup: createInlineKeyboard(buttons, isEven)
  });
});

// ============= VIEW FILE =============
bot.action(/view_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  
  const fileId = ctx.match[1];
  const userId = ctx.from.id;
  
  const file = fileDB.find(f => f.id === fileId && f.userId === userId);
  
  if (!file) {
    await backToMenu(ctx, false);
    return;
  }
  
  const filePath = path.join(storagePath, file.storedName);
  
  if (!fs.existsSync(filePath)) {
    await backToMenu(ctx, false);
    return;
  }
  
  try {
    // Kirim file langsung tanpa caption tambahan
    await ctx.replyWithDocument(
      { source: filePath, filename: `${file.name}.${file.extension}` },
      {
        caption: `<b>📄 ${file.name}</b>\n<b>📊 Ukuran:</b> ${formatFileSize(file.size)}`,
        parse_mode: 'HTML'
      }
    );
    
    // Kembali ke menu tanpa pesan
    await backToMenu(ctx, true);
    
  } catch (error) {
    console.error('Error:', error);
    await backToMenu(ctx, false);
  }
});

// ============= DELETE FILE =============
bot.action('delete_file', async (ctx) => {
  await ctx.answerCbQuery();
  
  const userId = ctx.from.id;
  const userFiles = fileDB.filter(f => f.userId === userId);
  
  if (userFiles.length === 0) {
    await backToMenu(ctx, false);
    return;
  }
  
  const buttons = [];
  userFiles.forEach(file => {
    buttons.push({
      text: `🗑️ ${file.name}`,
      callback_data: `delete_confirm_${file.id}`
    });
  });
  
  buttons.push({ text: '</> Back', callback_data: 'back_to_menu', style: 'danger' });
  
  const isEven = userFiles.length % 2 === 0;
  
  await safeEditCaption(ctx, `<blockquote><b>🗑️ Pilih file yang akan dihapus:</b></blockquote>`, {
    reply_markup: createInlineKeyboard(buttons, isEven)
  });
});

// ============= DELETE CONFIRM =============
bot.action(/delete_confirm_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  
  const fileId = ctx.match[1];
  const userId = ctx.from.id;
  
  const file = fileDB.find(f => f.id === fileId && f.userId === userId);
  
  if (!file) {
    await backToMenu(ctx, false);
    return;
  }
  
  const html = `
<blockquote><b>⚠️ Konfirmasi Hapus</b></blockquote>
<blockquote>Yakin ingin menghapus:
<b>📁 ${file.name}</b></blockquote>
<blockquote><i>File akan dihapus permanen!</i></blockquote>`;

  await safeEditCaption(ctx, html, {
    reply_markup: createInlineKeyboard([
      { text: '☑︎', callback_data: `delete_yes_${file.id}`, style: 'success' },
      { text: '❌', callback_data: `delete_no_${file.id}`, style: 'danger' }
    ], 2)
  });
});

// ============= DELETE YES =============
bot.action(/delete_yes_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  
  const fileId = ctx.match[1];
  const userId = ctx.from.id;
  
  const fileIndex = fileDB.findIndex(f => f.id === fileId && f.userId === userId);
  
  if (fileIndex === -1) {
    await backToMenu(ctx, false);
    return;
  }
  
  const file = fileDB[fileIndex];
  const filePath = path.join(storagePath, file.storedName);
  
  try {
    if (fs.existsSync(filePath)) {
      await fs.remove(filePath);
    }
    
    fileDB.splice(fileIndex, 1);
    saveDB();
    
    await autoBackup(true);
    
    // Kembali ke menu tanpa pesan
    await backToMenu(ctx, true);
    
  } catch (error) {
    console.error('Error:', error);
    await backToMenu(ctx, false);
  }
});

// ============= DELETE NO =============
bot.action(/delete_no_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  await backToMenu(ctx, true);
});

// ============= STATISTICS =============
bot.action('stats', async (ctx) => {
  await ctx.answerCbQuery();
  
  const userId = ctx.from.id;
  const userFiles = fileDB.filter(f => f.userId === userId);
  
  if (userFiles.length === 0) {
    await backToMenu(ctx, false);
    return;
  }
  
  const totalSize = userFiles.reduce((sum, f) => sum + f.size, 0);
  const categories = {};
  userFiles.forEach(f => {
    categories[f.category] = (categories[f.category] || 0) + 1;
  });
  
  let message = `<b>📊 Statistik Penyimpanan Anda</b>\n\n`;
  message += `<b>📁 Total:</b> ${userFiles.length} file\n`;
  message += `<b>📦 Total size:</b> ${formatFileSize(totalSize)}\n`;
  message += `<b>🗂️ Rata-rata:</b> ${formatFileSize(totalSize / userFiles.length)}\n\n`;
  message += `<b>Kategori:</b>\n`;
  
  const emojiMap = {
    documents: '📄',
    images: '🖼️',
    videos: '🎬',
    audios: '🎵',
    archives: '📦',
    others: '📁'
  };
  
  for (const [category, count] of Object.entries(categories)) {
    const emoji = emojiMap[category] || '📁';
    message += `${emoji} ${category}: ${count} file\n`;
  }
  
  message += `\n<b>📅 File Terbaru:</b>\n`;
  const sorted = [...userFiles].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.slice(0, 5).forEach((f, i) => {
    message += `${i + 1}. ${f.name} (${formatFileSize(f.size)})\n`;
  });
  
  message += `\n<i>Klik tombol di bawah untuk kembali:</i>`;

  await safeEditCaption(ctx, message, {
    reply_markup: createInlineKeyboard([
      { text: '</> Back', callback_data: 'back_to_menu' }
    ], 1)
  });
});

// ============= BACKUP MENU =============
bot.action('backup_menu', async (ctx) => {
  await ctx.answerCbQuery();
  
  if (ctx.from.id.toString() !== config.OWNER_ID) {
    await backToMenu(ctx, false);
    return;
  }
  
  try {
    const backupFiles = await fs.readdir(backupPath);
    const backupList = backupFiles
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    const totalUsers = [...new Set(fileDB.map(f => f.userId))].length;
    
    let html = `<b>💾 Manajemen Backup</b>\n\n`;
    html += `<b>Total Backup:</b> ${backupList.length}\n`;
    html += `<b>Total File:</b> ${fileDB.length}\n`;
    html += `<b>Total Users:</b> ${totalUsers}\n\n`;
    
    if (backupList.length === 0) {
      html += '<i>Belum ada backup</i>';
    } else {
      html += '<b>Daftar Backup:</b>\n';
      backupList.slice(0, 10).forEach((file, i) => {
        const size = (fs.statSync(path.join(backupPath, file)).size / 1024).toFixed(1);
        html += `${i + 1}. ${file} (${size}KB)\n`;
      });
      
      if (backupList.length > 10) {
        html += `\n<i>... dan ${backupList.length - 10} backup lainnya</i>`;
      }
    }
    
    html += `\n\n<i>Pilih aksi di bawah:</i>`;
    
    const buttons = [
      { text: '🔄 Backup Now', callback_data: 'backup_now', style: 'success' },
      { text: '📥 Restore Backup', callback_data: 'restore_backup', style: 'success' },
      { text: '📤 Kirim Backup', callback_data: 'send_backup', style: 'primary' },
      { text: '🏠 Menu Utama', callback_data: 'back_to_menu', style: 'primary' }
    ];
    
    await safeEditCaption(ctx, html, {
      reply_markup: createInlineKeyboard(buttons, 2)
    });
    
  } catch (error) {
    console.error('Error:', error);
    await backToMenu(ctx, false);
  }
});

// ============= BACKUP NOW =============
bot.action('backup_now', async (ctx) => {
  await ctx.answerCbQuery();
  
  if (ctx.from.id.toString() !== config.OWNER_ID) {
    await backToMenu(ctx, false);
    return;
  }
  
  await autoBackup(true);
  // Langsung kembali ke menu tanpa pesan
  await backToMenu(ctx, true);
});

// ============= SEND BACKUP =============
bot.action('send_backup', async (ctx) => {
  await ctx.answerCbQuery();
  
  if (ctx.from.id.toString() !== config.OWNER_ID) {
    await backToMenu(ctx, false);
    return;
  }
  
  try {
    const backupFiles = await fs.readdir(backupPath);
    const backupList = backupFiles
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (backupList.length === 0) {
      await backToMenu(ctx, false);
      return;
    }
    
    const buttons = backupList.slice(0, 10).map(file => ({
      text: `📤 ${file}`,
      callback_data: `send_backup_file_${file}`
    }));
    
    buttons.push({ text: '</> Back', callback_data: 'backup_menu' });
    
    const html = `<b>📤 Pilih backup yang akan dikirim:</b>\n\n<i>Backup akan dikirim ke owner</i>`;

    await safeEditCaption(ctx, html, {
      reply_markup: createInlineKeyboard(buttons, 1)
    });
    
  } catch (error) {
    console.error('Error:', error);
    await backToMenu(ctx, false);
  }
});

// ============= SEND BACKUP FILE =============
bot.action(/send_backup_file_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  
  if (ctx.from.id.toString() !== config.OWNER_ID) {
    await backToMenu(ctx, false);
    return;
  }
  
  const backupFile = ctx.match[1];
  const backupFilePath = path.join(backupPath, backupFile);
  
  try {
    if (!fs.existsSync(backupFilePath)) {
      await backToMenu(ctx, false);
      return;
    }
    
    const stats = await fs.stat(backupFilePath);
    const fileSize = (stats.size / 1024).toFixed(1);
    
    const caption = `<b>📤 Backup Manual</b>\n\n<b>📁 File:</b> ${backupFile}\n<b>📊 Size:</b> ${fileSize} KB\n<b>📅 Dikirim:</b> ${new Date().toLocaleString('id-ID')}\n\n<i>Backup dari File Storage Bot</i>`;

    await ctx.replyWithDocument(
      { source: backupFilePath, filename: backupFile },
      { 
        caption: caption,
        parse_mode: 'HTML'
      }
    );
    
    // Kembali ke menu setelah kirim backup
    await backToMenu(ctx, true);
    
  } catch (error) {
    console.error('Error:', error);
    await backToMenu(ctx, false);
  }
});

// ============= RESTORE BACKUP =============
bot.action('restore_backup', async (ctx) => {
  await ctx.answerCbQuery();
  
  if (ctx.from.id.toString() !== config.OWNER_ID) {
    await backToMenu(ctx, false);
    return;
  }
  
  try {
    const backupFiles = await fs.readdir(backupPath);
    const backupList = backupFiles
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (backupList.length === 0) {
      await backToMenu(ctx, false);
      return;
    }
    
    const buttons = backupList.slice(0, 10).map(file => ({
      text: `📂 ${file}`,
      callback_data: `restore_${file}`
    }));
    
    buttons.push({ text: '</> Back', callback_data: 'backup_menu' });
    
    const html = `<b>📥 Pilih backup untuk direstore:</b>\n\n⚠️ <i>Restore akan mengganti data saat ini!</i>\n<i>Pastikan Anda sudah backup data terbaru.</i>`;

    await safeEditCaption(ctx, html, {
      reply_markup: createInlineKeyboard(buttons, 1)
    });
    
  } catch (error) {
    console.error('Error:', error);
    await backToMenu(ctx, false);
  }
});

// ============= RESTORE SPECIFIC BACKUP =============
bot.action(/restore_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  
  if (ctx.from.id.toString() !== config.OWNER_ID) {
    await backToMenu(ctx, false);
    return;
  }
  
  const backupFile = ctx.match[1];
  
  const html = `<b>⚠️ Konfirmasi Restore</b>\n\nYakin ingin merestore:\n📁 ${backupFile}\n\n<i>Data saat ini akan diganti!</i>`;

  await safeEditCaption(ctx, html, {
    reply_markup: createInlineKeyboard([
      { text: '☑︎', callback_data: `restore_confirm_${backupFile}`, style: 'primary' },
      { text: '❌', callback_data: 'backup_menu', style: 'danger' }
    ], 2)
  });
});

// ============= RESTORE CONFIRM =============
bot.action(/restore_confirm_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  
  if (ctx.from.id.toString() !== config.OWNER_ID) {
    await backToMenu(ctx, false);
    return;
  }
  
  const backupFile = ctx.match[1];
  
  try {
    await autoBackup(true);
    const success = await restoreBackup(backupFile);
    
    // Kembali ke menu tanpa pesan (baik sukses atau gagal)
    await backToMenu(ctx, true);
    
  } catch (error) {
    console.error('Error:', error);
    await backToMenu(ctx, false);
  }
});

// ============= BACK TO MENU =============
bot.action('back_to_menu', async (ctx) => {
  await ctx.answerCbQuery();
  await backToMenu(ctx, true);
});

// ============= HANDLE TEXT =============
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  if (ctx.session.waitingFor === 'name') return;
  if (text.startsWith('/')) return;
  
  await ctx.replyWithPhoto(config.THUMBNAIL_URL, {
    caption: '<b>📤 Gunakan tombol di bawah</b>',
    parse_mode: 'HTML',
    reply_markup: getMainMenu()
  });
});

// ============= ERROR HANDLING =============
bot.catch((err, ctx) => {
  console.error('Error:', err);
  ctx.replyWithPhoto(config.THUMBNAIL_URL, {
    caption: `<b>❌ Error:</b> ${err.message}`,
    parse_mode: 'HTML',
    reply_markup: getMainMenu()
  }).catch(() => {});
});

// ============= START =============
bot.launch()
  .then(() => {
    console.log('🤖 Bot started!');
    console.log(`📁 Storage: ${storagePath}`);
    console.log(`💾 Backup: ${backupPath}`);
    console.log(`📊 Files: ${fileDB.length}`);
    console.log(`👤 Owner ID: ${config.OWNER_ID}`);
    console.log(`🖼️ Thumbnail: ${config.THUMBNAIL_URL}`);
    console.log('✅ Privacy/User Isolation ENABLED');
  })
  .catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;