
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { title, description, category, videoUrl, locationCity, locationCountry } = await request.json();

    // Validate input
    if (!title || !description || !category || !videoUrl || !locationCity || !locationCountry) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    const tempId = `temp_${Date.now()}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "samueloni0987@gmail.com",
        pass: "xyui vocx jhyf lxhn",
      },
    });

    const approveLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/local-news/approve?id=${tempId}`;
    const rejectLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/local-news/reject?id=${tempId}`;

    const mailOptions = {
        from: '"Telecast" <samueloni0987@gmail.com>',
        to: ' sswbsam@gmail.com',
        subject: `New EventSubmission: ${title}`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New EventSubmission</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #121212; font-family: Poppins, sans-serif; color: #E0E0E0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <td align="center" bgcolor="#1E1E1E" style="padding: 40px 0 30px 0; border-radius: 16px 16px 0 0;">
                        <h1 style="color: #FFFFFF; font-weight: 700; margin: 0;">New EventSubmission</h1>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#1E1E1E" style="padding: 40px 30px 40px 30px;">
                        <p style="color: #E0E0E0; font-size: 1rem; line-height: 1.6;">A new Eventvideo has been uploaded.</p>
                        <h2 style="color: #FFFFFF; font-weight: 700;">Details:</h2>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 10px;"><strong>Title:</strong> ${title}</li>
                            <li style="margin-bottom: 10px;"><strong>Description:</strong> ${description}</li>
                            <li style="margin-bottom: 10px;"><strong>Category:</strong> ${category}</li>
                            <li><strong>Location:</strong> ${locationCity}, ${locationCountry}</li>
                        </ul>
                        <p style="margin-top: 20px;">
                          <a href="${approveLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve</a>
                          <a href="${rejectLink}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reject</a>
                        </p>
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

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    console.error('Error in notify route:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
