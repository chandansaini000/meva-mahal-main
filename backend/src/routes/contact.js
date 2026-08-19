import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Name, email and message are required",
      });
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      text: `
New Contact Message

Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    res.json({
      ok: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact email error:", error);

    res.status(500).json({
      error: "Failed to send message",
    });
  }
});

export default router;