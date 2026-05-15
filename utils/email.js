import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  //1:Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // مهم
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 5000,
  });
  //2:Define email options
  const mailOptions = {
    from: 'Hosam Mostafa <hello@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: ,
  };
  //3:Send the email
  console.log('Sending email...');
  await transporter.sendMail(mailOptions);
  console.log('Email sent!');
};
export default sendEmail;
