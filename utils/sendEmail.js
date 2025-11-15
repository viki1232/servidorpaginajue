import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// ✅ CARGAR dotenv PRIMERO
dotenv.config();

console.log('🔧 [sendEmail.js] Configurando Gmail...');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
console.log('🔑 EMAIL_PASS presente:', !!process.env.EMAIL_PASS);
console.log('🔑 EMAIL_PASS longitud:', process.env.EMAIL_PASS?.length);

// Configurar transporter de Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verificar configuración al cargar
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ [sendEmail.js] Error en configuración de Gmail:', error.message);
    } else {
        console.log('✅ [sendEmail.js] Gmail configurado correctamente ✅');
    }
});

export const sendVerificationEmail = async (email, username, token) => {
    console.log('📧 [sendEmail.js] ========== ENVIANDO EMAIL ==========');
    console.log('📧 Para:', email);
    console.log('📧 Username:', username);

    const verificationUrl = `http://localhost:5173/verify/${token}`;

    const mailOptions = {
        from: `"EpicGameHub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '¡Verifica tu cuenta en EpicGameHub! 🎮',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f7fafc;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎮 EpicGameHub</h1>
                </div>
                
                <div style="background-color: white; padding: 30px;">
                    <h2 style="color: #2d3748;">¡Hola, ${username}! 👋</h2>
                    <p style="color: #4a5568; font-size: 16px;">
                        ¡Bienvenido a <strong>EpicGameHub</strong>! Estamos emocionados de tenerte con nosotros.
                    </p>
                    <p style="color: #4a5568; font-size: 16px;">
                        Para completar tu registro, verifica tu dirección de email:
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #667eea; 
                                  color: white; 
                                  padding: 15px 40px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  display: inline-block; 
                                  font-weight: bold; 
                                  font-size: 16px;">
                            ✅ Verificar mi cuenta
                        </a>
                    </div>
                    
                    <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 25px 0;">
                        <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0;">
                            Si el botón no funciona, copia y pega este enlace:
                        </p>
                        <p style="color: #667eea; word-break: break-all; background-color: white; padding: 10px; border-radius: 5px; font-size: 13px; margin: 0;">
                            ${verificationUrl}
                        </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    
                    <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                        ⏱️ Este enlace expira en <strong>15 minutos</strong><br/>
                        Si no solicitaste esta cuenta, ignora este email.
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #a0aec0; font-size: 11px;">
                        © 2025 EpicGameHub. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        console.log('📧 [sendEmail.js] Enviando email con Gmail...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [sendEmail.js] ¡EMAIL ENVIADO EXITOSAMENTE!');
        console.log('✅ Message ID:', info.messageId);
        console.log('📬 Revisa tu bandeja: nikollsalerno@gmail.com');
        return info;
    } catch (error) {
        console.error('❌ [sendEmail.js] Error al enviar:', error.message);
        console.error('❌ Código:', error.code);
        throw error;
    }
};

console.log('✅ [sendEmail.js] Módulo cargado completamente');