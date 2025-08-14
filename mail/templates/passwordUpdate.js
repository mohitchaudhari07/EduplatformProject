exports.passwordUpdateTemplate = (email, name) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Update</title>
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
            <h1>Password Updated Successfully</h1>
            <p>Dear ${name},</p>
            <p>Your password has been successfully updated.</p>
            <p>If you did not request this change, please contact support immediately.</p>
            <div class="footer">
                <p>Thank you for using our service!</p>
            </div>
        </div>
    </body>
    </html>`;
}