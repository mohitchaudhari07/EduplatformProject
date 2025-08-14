exports.courseEnrollmentTemplate = (email, name, courseName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Course Enrollment</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 5px; }
            h1 { color: #4CAF50; }
            p { font-size: 16px; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Enrollment Successful</h1>
            <p>Dear ${name},</p>
            <p>You have been successfully enrolled in the course: ${courseName}.</p>
            <p>We are excited to have you on board and look forward to your participation.</p>
            <div class="footer">
                <p>Thank you for choosing our platform!</p>
            </div>
        </div>
    </body>
    </html>`;
}