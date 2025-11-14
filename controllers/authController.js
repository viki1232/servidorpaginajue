import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';  // ✅ Importar JWT
import nodemailer from 'nodemailer';
import { sendVerificationEmail } from '../utils/sendEmail.js';

// ✅ Función auxiliar FUERA de las otras funciones
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Función para registrar usuario
export const signup = async (req, res) => {
    console.log('🔵 INICIO DE SIGNUP');

    try {
        const { email, username, password } = req.body;
        console.log('📝 Datos recibidos:', { email, username, password: '***' });

        // Validar formato de contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            console.log('❌ Contraseña no válida');
            return res.status(400).json({
                error: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)'
            });
        }
        console.log('✅ Contraseña válida');

        if (!email || !username || !password) {
            console.log('❌ Faltan campos');
            return res.status(400).json({
                error: 'Todos los campos son requeridos'
            });
        }
        console.log('✅ Todos los campos presentes');

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            console.log('❌ Email ya existe');
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }
        console.log('✅ Email disponible');

        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            console.log('❌ Username ya existe');
            return res.status(400).json({
                error: 'El username ya está en uso'
            });
        }
        console.log('✅ Username disponible');

        console.log('🔐 Hasheando contraseña...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✅ Contraseña hasheada');

        console.log('🎲 Generando token de verificación...');
        const verificationToken = crypto.randomBytes(32).toString('hex');
        console.log('✅ Token generado:', verificationToken);

        console.log('💾 Creando usuario en DB...');
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires: Date.now() + 15 * 60 * 1000
        });

        await newUser.save();
        console.log('✅ Usuario guardado en DB');

        // ========== ENVÍO DE EMAIL ==========
        console.log('📧 ========== INICIO ENVÍO EMAIL ==========');
        console.log('📧 Email destino:', email);
        console.log('📧 Username:', username);
        console.log('📧 Token:', verificationToken);

        try {
            console.log('📧 Llamando a sendVerificationEmail...');
            await sendVerificationEmail(email, username, verificationToken);
            console.log('✅ ========== EMAIL ENVIADO EXITOSAMENTE ==========');
        } catch (emailError) {
            console.error('❌ ========== ERROR AL ENVIAR EMAIL ==========');
            console.error('Error completo:', emailError);
            console.error('Mensaje:', emailError.message);
            if (emailError.response) {
                console.error('Response body:', emailError.response.body);
            }
            console.error('Stack:', emailError.stack);
            // NO fallar el registro si el email falla
        }
        console.log('📧 ========== FIN PROCESO EMAIL ==========');

        console.log('✅ SIGNUP COMPLETADO - Enviando respuesta');
        res.status(201).json({
            message: 'Usuario registrado. Revisa tu email para verificar tu cuenta.'
        });

    } catch (error) {
        console.error('❌ ERROR GENERAL EN SIGNUP:', error);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            error: 'Error al registrar usuario',
            details: error.message
        });
    }
};

// Función para login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!user.verified) {
            return res.status(403).json({
                error: 'Debes verificar tu email primero. Revisa tu bandeja de entrada.'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = generateToken(user._id);

        res.json({
            message: 'Login exitoso',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                verified: user.verified
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

// Función para verificar email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Token inválido o expirado. Solicita un nuevo email de verificación.'
            });
        }

        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        res.status(200).json({
            message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.'
        });

    } catch (error) {
        console.error('Error en verifyEmail:', error);
        res.status(500).json({
            error: 'Error al verificar email'
        });
    }
};

// Función para logout
export const logout = async (req, res) => {
    try {
        res.json({ message: 'Logout exitoso' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error al cerrar sesión' });
    }
};

// Función para reenviar verificación
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email requerido' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (user.verified) {
            return res.status(400).json({ error: 'El email ya está verificado' });
        }

        // Generar nuevo token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + (15 * 60 * 1000);

        await user.save();

        // TODO: Enviar email de verificación aquí
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // tu correo
                pass: process.env.EMAIL_PASS  // tu contraseña o app password
            }
        });

        const verificationLink = `https://tu-dominio.com/verify?token=${verificationToken}`;

        await transporter.sendMail({
            from: `"Soporte SmartLink" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Verifica tu cuenta',
            html: `
    <h2>Hola ${user.username}</h2>
    <p>Por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
    <a href="${verificationLink}">${verificationLink}</a>
    <p>Este enlace expirará en 15 minutos.</p>
  `
        });

        res.json({
            message: 'Email de verificación reenviado. Revisa tu bandeja de entrada.',
            debug: { token: verificationToken }
        });

    } catch (error) {
        console.error('Error en resendVerification:', error);
        res.status(500).json({ error: 'Error al reenviar verificación' });
    }
};