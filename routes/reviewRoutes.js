import express from 'express';
import {
    createReview,
    getReviewsByGameId,
    getAllReviews,
    deleteReview,
    editReview,
    getAllStats,
    likes,// ← Agregar import
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', createReview); // ← Agregar ruta para likes
router.get('/:gameId', getReviewsByGameId);
router.get('/', getAllReviews);
router.put('/:id', editReview);  // ← Agregar ruta PUT
router.delete('/:id', deleteReview);
router.put('/:id/likes', likes);
router.get('/stats/bulk', getAllStats); // ← Agregar ruta para likes

export default router;