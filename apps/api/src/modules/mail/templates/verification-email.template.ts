export function verificationEmailContent(verificationLink: string) {
  return {
    subject: 'Verify your email',
    html: `
            <p>Welcome to Mental Journal.</p>
            <p><a href="${verificationLink}">Click here to verify your email</a></p>
            <p>If you did not create an account, you can ignore this email.</p>
        `,
    text: `Verify your email: ${verificationLink}`,
  };
}
