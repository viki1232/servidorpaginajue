import mongoose from 'mongoose';

const perfilSchema = new mongoose.Schema({
    game_id: {
        type: Number,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: 'Anonymous'
    },
    game_title: {
        type: String,
        default: 'Unknown Game'
    },
    game_price: {
        type: Number,
        default: 0
    },
    game_image: {
        type: String,
        default: ''
    },
    added_at: {
        type: Date,
        default: Date.now
    },
    completado: {
        type: Boolean, default: false
    },
    fecha_completado: {
        type: Date, default: null
    },
    horas_jugadas: {
        type: Number, default: 0
    }
});

// Índice único para evitar duplicados
perfilSchema.index({ game_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('Perfil', perfilSchema);