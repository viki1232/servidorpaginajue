import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    game_id: {
        type: Number,
        required: [true, 'Game ID es requerido']
    },
    user_id: {
        type: String,
        required: [true, 'User ID es requerido']
    },
    username: {
        type: String,
        required: [true, 'Username es requerido'],
        default: 'Anonymous'
    },
    rating: {
        type: Number,
        required: [true, 'Rating es requerido'],
        min: [1, 'Rating mínimo es 1'],
        max: [5, 'Rating máximo es 5']
    },
    comment: {
        type: String,
        required: [true, 'Comentario es requerido'],

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
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;