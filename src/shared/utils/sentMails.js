const nodemailer = require("nodemailer");
const emailConfig = require("../../config/gmailSmtp.config");

const _sendEmail = async (_emailDetails) => {
  try {
    console.log('Mail Sent Details = >',_emailDetails)
    let transporter = nodemailer.createTransport({
      service: emailConfig.service,
      host: emailConfig.hostname,
      port: emailConfig.port,
      secure: false,
      auth: {
        user: emailConfig.username,
        pass: emailConfig.password,
      },
    });

    let mailOptions = {
      from: emailConfig.fromMail,
      to: _emailDetails.toMail,
      subject: _emailDetails.subject,
      text: _emailDetails.text,
      html: _emailDetails.content,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { _sendEmail };
