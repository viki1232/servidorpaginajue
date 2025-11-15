import { reduceEachTrailingCommentRange } from 'typescript';
import Review from '../models/reviews.js';

const calcularPromedioJuego = async (game_id) => {
    const reviews = await Review.find({ game_id: parseInt(game_id) });
    const totalReviews = reviews.length;
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? (totalRatings / totalReviews) : 0;

    return {
        average_rating: parseFloat(averageRating.toFixed(2)),
        total_reviews: totalReviews
    };
};
export const createReview = async (req, res) => {
    try {
        const { game_id, user_id, username, rating, comment } = req.body;

        console.log('📝 Datos recibidos:', { game_id, user_id, username, rating, comment });

        // Validar que todos los campos existan
        if (!game_id || !user_id || !rating || !comment) {
            return res.status(400).json({
                error: 'Faltan campos requeridos',
                required: ['game_id', 'user_id', 'rating', 'comment']
            });
        }

        // Crear el review
        const newReview = new Review({
            game_id: parseInt(game_id),
            user_id,
            username: username || 'Anonymous',
            rating: parseInt(rating),
            comment
        });

        // Guardar en MongoDB
        await newReview.save();
        const stats = await calcularPromedioJuego(game_id);
        console.log('✅ Review guardado en DB:', newReview._id);



        res.status(201).json({
            message: 'Review creado exitosamente',
            review: newReview,
            stats: stats

        });


    } catch (error) {
        console.error('❌ Error al crear review:', error);
        res.status(500).json({
            error: 'Error al crear review',
            details: error.message
        });
    }
};

// 🔹 Obtener reviews de un juego específico
export const getReviewsByGameId = async (req, res) => {
    try {
        const { gameId } = req.params;

        const reviews = await Review.find({ game_id: parseInt(gameId) })
            .sort({ created_at: -1 });
        const stats = await calcularPromedioJuego(gameId);

        res.status(200).json({
            reviews: reviews,
            stats: stats

        });

    } catch (error) {
        console.error('❌ Error al obtener reviews:', error);
        res.status(500).json({
            error: 'Error al obtener reviews',
            details: error.message
        });

    }
};

// 🔹 Obtener todos los reviews (opcional)
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ created_at: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('❌ Error al obtener todos los reviews:', error);
        res.status(500).json({
            error: 'Error al obtener reviews',
            details: error.message
        });
    }
};

// 🔹 Eliminar un review (opcional)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return res.status(404).json({ error: 'Review no encontrado' });
        }
        const game_id = deletedReview.game_id;

        const stats = await calcularPromedioJuego(game_id);
        res.status(200).json({
            message: 'Review eliminado exitosamente',
            review: deletedReview,
            stats: stats
        });

    } catch (error) {
        console.error('❌ Error al eliminar review:', error);
        res.status(500).json({
            error: 'Error al eliminar review',
            details: error.message
        });
    }
};

export const editReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        // 🔹 Validación de datos
        if (!rating && !comment) {
            return res.status(400).json({
                error: 'Debes proporcionar al menos rating o comment para actualizar'
            });
        }

        // 🔹 Validar que el rating esté en el rango correcto (si se proporciona)
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                error: 'El rating debe estar entre 1 y 5'
            });
        }

        console.log(`📝 Actualizando review ${id}...`);

        // 🔹 Preparar solo los campos que se van a actualizar
        const updateFields = {};
        if (rating) updateFields.rating = parseInt(rating);
        if (comment) updateFields.comment = comment;


        // 🔹 Actualizar en MongoDB
        const updatedReview = await Review.findByIdAndUpdate(
            id,
            updateFields,
            {
                new: true,        // Devuelve el documento actualizado
                runValidators: true  // Ejecuta las validaciones del modelo
            }
        );

        // 🔹 Verificar si existe
        if (!updatedReview) {
            return res.status(404).json({ error: 'Review no encontrado' });
        }

        console.log('✅ Review actualizado exitosamente');


        res.status(200).json({
            message: 'Review actualizado exitosamente',
            review: updatedReview,

        });

    } catch (error) {
        console.error('❌ Error al actualizar review:', error);
        res.status(500).json({
            error: 'Error al actualizar review',
            details: error.message
        });
    }
};

export const likes = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        console.log('ID recibido:', id);
        console.log('User ID recibido:', user_id);

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ error: 'Review no encontrado' });
        }

        console.log('📊 ANTES - likes:', review.likes, 'likedBy:', review.likedBy);

        // Inicializar si no existe
        if (!review.likedBy) {
            review.likedBy = [];
        }
        if (typeof review.likes !== 'number') {
            review.likes = 0;
        }


        const userIdString = user_id.toString();
        const hasLiked = review.likedBy.some(id => id.toString() === userIdString);

        console.log('¿Usuario ya dio like?', hasLiked);

        if (hasLiked) {

            review.likes = review.likes - 1;
            review.likedBy.pull(user_id);
            console.log('Like removido. Total likes:', review.likes);
        } else {

            review.likes = review.likes + 1;
            review.likedBy.push(user_id);
            console.log('Like agregado. Total likes:', review.likes);
        }

        console.log('📊 DESPUÉS - likes:', review.likes, 'likedBy:', review.likedBy);


        const savedReview = await review.save();
        console.log('💾 GUARDADO - likes:', savedReview.likes, 'likedBy:', savedReview.likedBy);

        res.status(200).json({
            message: hasLiked ? 'Like removido' : 'Like agregado',
            likes: savedReview.likes,
            likedBy: savedReview.likedBy
        });

    } catch (error) {
        console.error('❌ Error en likes:', error);
        res.status(500).json({
            error: 'Error al agregar like',
            details: error.message
        });
    }
};

export const getAllStats = async (req, res) => {
    try {
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: "$game_id",
                    average_rating: { $avg: "$rating" },
                    total_reviews: { $sum: 1 }
                }
            }
        ]);

        // Convertir a objeto { gameId: { average_rating, total_reviews } }
        const statsObject = {};
        stats.forEach(stat => {
            statsObject[stat._id] = {
                average_rating: Math.round(stat.average_rating * 10) / 10,
                total_reviews: stat.total_reviews
            };
        });

        res.json(statsObject);
    } catch (error) {
        console.error('Error obteniendo stats:', error);
        res.status(500).json({ error: error.message });
    }
};