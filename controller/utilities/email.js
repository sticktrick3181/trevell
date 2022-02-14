const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const sibTransport = require("nodemailer-sendinblue-transport");

//how will this new class work
//new Email(user,url).sendWelcome();
//new Email(user,url).sendPasswordReset();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = "trevell (tours & travel) <trevell948@gmail.com>";
  }
  mailTransport() {
    if (process.env.NODE_ENV == "development") {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    //for production
    else
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
  }
  //send the actual email
  async send(template, subject) {
    //render the pug html
    const html = pug.renderFile(
      `${__dirname}/../../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    //define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html),
    };
    //create a transport and send an email
    await this.mailTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send(
      "welcome",
      "Welcome to trevell! We are happy to serve you😊"
    );
  }
  async sendPasswordResetToken() {
    await this.send("passwordReset", "Link to reset your Password");
  }
};
// const sendEmail = async (options) => {
//   //2)Define the email options
//   const mailOptions = {
//     from: "trevell <kalia.ishaan5196@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };
//   //3) Actually send the mail
//   await transporter.sendMail(mailOptions);
// };
