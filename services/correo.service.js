const nodemailer = require('nodemailer')
require('dotenv').config();
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    async enviarCorreoRecuperacion(destinatario, nombre, codigo) {
        const mailOptions = {
            from: 'LUMO CAR SUPPORT <lumocarsupport@gmail.com>',
            to: destinatario,
            subject: "Restablecer contraseña",
            html:  `<h1> Hola, ${nombre}</h1><br><br>
            <p>Tu código para restablecer tu contraseña es:<p>
            <br><br>
            <h2>${codigo}</h2>
            <br><br>
            <p>Atentamente</p>
            <br>
            <p>El equipo de LUMO CAR</p>`
        }

        try {
            const info = await this.transporter.sendMail(mailOptions)
            console.log('Correo Enviado: ', info);
            return true
        } catch (error) {
            console.log(error);
            return false            
        }
    }
}

module.exports = new EmailService()