import express from 'express';
import {
    createPost,
    getAllPosts,
    toggleLike,
    deletePost,
    addReply,
    deleteReply
} from '../controllers/comunidadController.js';

const router = express.Router();

router.post('/', createPost);
router.get('/', getAllPosts);
router.put('/:id/like', toggleLike);
router.delete('/:id', deletePost);
router.post('/:id/replies', addReply);
router.delete('/:postId/replies/:replyId', deleteReply);

export default router;