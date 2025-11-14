import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import reviewRoutes from './routes/reviewRoutes.js';
import perfilRoutes from './routes/perfilRoutes.js';
import comunityRoutes from './routes/comunityRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });


app.use('/api/auth', authRoutes);
app.use('/api', perfilRoutes);

// Ruta raíz (opcional)
app.get('/', (req, res) => {
    res.json({
        message: 'API funcionando',
        endpoints: {
            test: '/api/auth/test',
            signup: '/api/auth/signup',
            login: '/api/auth/login'
        }
    });
});
app.use('/api/reviews', reviewRoutes);
app.use('/api/comunity', comunityRoutes);
app.use('/api/games', gameRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});