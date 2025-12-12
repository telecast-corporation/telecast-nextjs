
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { title, description, category, city, country } = await request.json();

    // Create a transporter object using the default SMTP transport
    // TODO: Replace with your actual SMTP server details in a secure way (e.g., environment variables)
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com', // Your SMTP server host
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'user@example.com', // Your SMTP username
        pass: 'password', // Your SMTP password
      },
    });

    // Email content
    const mailOptions = {
      from: '"Telecast" <noreply@telecast.ca>', // sender address
      to: 'samueloni0987@gmail.com', // list of receivers
      subject: `New Local News Submission: ${title}`, // Subject line
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Local News Submission</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #121212; font-family: Poppins, sans-serif; color: #E0E0E0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <td align="center" bgcolor="#1E1E1E" style="padding: 40px 0 30px 0; border-radius: 16px 16px 0 0;">
                        <h1 style="color: #FFFFFF; font-weight: 700; margin: 0;">New Local News Submission</h1>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#1E1E1E" style="padding: 40px 30px 40px 30px;">
                        <p style="color: #E0E0E0; font-size: 1rem; line-height: 1.6;">A new local news video has been uploaded.</p>
                        <h2 style="color: #FFFFFF; font-weight: 700;">Details:</h2>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 10px;"><strong>Title:</strong> ${title}</li>
                            <li style="margin-bottom: 10px;"><strong>Description:</strong> ${description}</li>
                            <li style="margin-bottom: 10px;"><strong>Category:</strong> ${category}</li>
                            <li><strong>Location:</strong> ${city}, ${country}</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#1E1E1E" style="padding: 30px 30px 30px 30px; border-radius: 0 0 16px 16px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td width="260" valign="top">
                                    <p style="margin: 0; color: #B0B0B0; font-size: 0.8rem;">Telecast &copy; 2024</p>
                                </td>
                                <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                <td width="260" valign="top" align="right">
                                    <a href="https://telecast.ca" style="color: #3A8DFF; text-decoration: none;">
                                        Visit Telecast
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `,
    };

    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Notification email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    return new NextResponse('Error sending email', { status: 500 });
  }
}
