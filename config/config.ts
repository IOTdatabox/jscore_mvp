export const config = {
    jwt: {
        secret: process.env.JWT_SECRET,
        resetPasswordExpirationMinutes: process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
        verifyEmailExpirationMinutes: process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
        twoFactorExpirationMinutes: process.env.JWT_TWO_FACTOR_EXPIRATION_MINUTES,
    },
    app: {
        url: process.env.HOME_URL,
    },
}