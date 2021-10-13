SMTPClient = require('emailjs').SMTPClient;
const client = new SMTPClient({
	user: 'savegamesapp',
	password: process.env.EMAIL_PASS,
	host: 'smtp.gmail.com',
    port: 465,
	ssl: true,
});
exports.enviaEmail = (email, username, corpo, assunto) => {
    client.send(
        {
            from: 'SaveGamesApp savegamesapp@gmail.com',
            to: username + ' ' + email,
            subject: assunto,
            attachment: [
                { data: corpo, alternative: true }
            ]
        },
        (err, message) => {
            console.log(err || message);
        }
    );
}