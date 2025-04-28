require("dotenv").config();
const Imap = require("imap");
const simpleParser = require("mailparser").simpleParser;

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

function openInbox(cb) {
  imap.openBox("INBOX", false, cb);
}

imap.once("ready", () => {
  openInbox((err, box) => {
    if (err) throw err;
    console.log("✅ Connected to Gmail, watching for new emails...");

    imap.on("mail", () => {
      const fetch = imap.seq.fetch(`${box.messages.total}:*`, {
        bodies: "",
        struct: true,
        markSeen: true,
      });

      fetch.on("message", (msg) => {
        msg.on("body", async (stream) => {
          const parsed = await simpleParser(stream);
          console.log("\n📬 New Email Received!");
          console.log("From:", parsed.from?.text);
          console.log("Subject:", parsed.subject);
          console.log("Body:", parsed.text);
        });
      });
    });
  });
});

imap.once("error", (err) => {
  console.error("❌ IMAP Error:", err);
});

imap.once("end", () => {
  console.log("Connection closed");
});

imap.connect();
