import express from 'express';
import {
    signup,
    login,
    verifyEmail,
    resendVerification
} from '../controllers/authController.js';

const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ message: 'Rutas de autenticación funcionando' });
});

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);

router.post('/resend-verification', resendVerification);

export default router; 