import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es requerido'],  // ← Mensaje personalizado
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },
    username: {
        type: String,
        required: [true, 'El username es requerido'],  // ← Mensaje personalizado
        unique: true,
        trim: true,
        minlength: [3, 'El username debe tener al menos 3 caracteres'],
        maxlength: [20, 'El username no puede tener más de 20 caracteres'],
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],  // ← Mensaje personalizado
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    },
    verified: {
        type: Boolean,           // ¿Boolean?
        default: false,        // ¿true o false por defecto?
    },
    verificationToken: {
        type: String,           // ¿String?
        default: null,
    },
    verificationTokenExpires: {
        type: Date,           // ¿Date?
        default: null,
    }
}, {
    timestamps: true         // ¿true o false?
});

const User = mongoose.model('User', userSchema);  // ¿Qué nombre?
export default User;