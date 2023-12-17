const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    // service: 'Gmail',
    port: 587,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    secureConnection: false,
    //Activate in gmail "less secure app" option
  });
  // 2) define the email options
  const mailOptions = {
    from: 'Rahul Aggarwal',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) activity send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
