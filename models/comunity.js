// models/comunidad.js (o community.js)
import mongoose from 'mongoose';

// ✅ Schema para las respuestas
const replySchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: 'Anonymous'
    },
    comment: {
        type: String,
        required: true,
        maxlength: 300
    },
    created_at: {
        type: Date,
        default: Date.now
    
    },
    image_url: {
        type: String,
        default: null
    },

    likes: {
        type: Number,
        default: 0
    },
    likedBy: {
        type: [String],
        default: []
    },
});

// ✅ Schema principal con replies
const comunidadSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: 'Anonymous'
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
    image_url: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: {
        type: [String],
        default: []
    },
    replies: [replySchema]  // ✅ Esto es lo importante
});

const Comunidad = mongoose.model('Comunidad', comunidadSchema);
export default Comunidad;