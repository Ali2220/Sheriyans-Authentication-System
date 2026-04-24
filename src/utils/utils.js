export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPHtml(otp) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p style="font-size: 18px; color: #555;">Use the following OTP to complete your verification process:</p>
        <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 20px 0;">${otp}</div>
        <p style="font-size: 14px; color: #999;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
    </div>
</body>
</html>`;
}
