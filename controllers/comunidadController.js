import Community from '../models/comunity.js';

// Crear post principal
export const createPost = async (req, res) => {
    try {
        const { user_id, username, comment, image_url } = req.body;

        if (!user_id || !comment) {
            return res.status(400).json({
                error: 'Faltan campos requeridos',
                required: ['user_id', 'comment']
            });
        }

        const newPost = new Community({
            user_id,
            username: username || 'Anonymous',
            comment,
            image_url: image_url || null
        });

        await newPost.save();
        console.log('✅ Post guardado:', newPost._id);

        res.status(201).json({
            message: 'Post creado exitosamente',
            post: newPost
        });

    } catch (error) {
        console.error('❌ Error al crear post:', error);
        res.status(500).json({
            error: 'Error al crear post',
            details: error.message
        });
    }
};

// ✅ NUEVO: Agregar respuesta a un post
export const addReply = async (req, res) => {
    try {
        const { id } = req.params;  // ID del post
        const { user_id, username, comment } = req.body;

        if (!user_id || !comment) {
            return res.status(400).json({
                error: 'Faltan campos requeridos',
                required: ['user_id', 'comment']
            });
        }

        const post = await Community.findById(id);

        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        // ✅ Agregar reply al array
        post.replies.push({
            user_id,
            username: username || 'Anonymous',
            comment,
            created_at: new Date()
        });

        await post.save();

        res.status(201).json({
            message: 'Respuesta agregada exitosamente',
            post: post
        });

    } catch (error) {
        console.error('❌ Error al agregar reply:', error);
        res.status(500).json({
            error: 'Error al agregar respuesta',
            details: error.message
        });
    }
};

// ✅ NUEVO: Eliminar una respuesta
export const deleteReply = async (req, res) => {
    try {
        const { postId, replyId } = req.params;

        const post = await Community.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        // ✅ Filtrar y eliminar el reply
        post.replies = post.replies.filter(
            reply => reply._id.toString() !== replyId
        );

        await post.save();

        res.status(200).json({
            message: 'Respuesta eliminada exitosamente',
            post: post
        });

    } catch (error) {
        console.error('❌ Error al eliminar reply:', error);
        res.status(500).json({
            error: 'Error al eliminar respuesta',
            details: error.message
        });
    }
};

// Obtener todos los posts con sus replies
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Community.find()
            .sort({ created_at: -1 })
            .limit(50);

        res.status(200).json({
            message: 'Posts obtenidos exitosamente',
            posts: posts
        });

    } catch (error) {
        console.error('❌ Error al obtener posts:', error);
        res.status(500).json({
            error: 'Error al obtener posts',
            details: error.message
        });
    }
};

// Dar/quitar like
export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        const post = await Community.findById(id);

        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        if (!post.likedBy) post.likedBy = [];
        if (typeof post.likes !== 'number') post.likes = 0;

        const hasLiked = post.likedBy.includes(user_id);

        if (hasLiked) {
            post.likes -= 1;
            post.likedBy = post.likedBy.filter(id => id !== user_id);
        } else {
            post.likes += 1;
            post.likedBy.push(user_id);
        }

        await post.save();

        res.status(200).json({
            message: hasLiked ? 'Like removido' : 'Like agregado',
            likes: post.likes
        });

    } catch (error) {
        console.error('❌ Error en likes:', error);
        res.status(500).json({
            error: 'Error al procesar like',
            details: error.message
        });
    }
};

// Eliminar post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPost = await Community.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        res.status(200).json({
            message: 'Post eliminado exitosamente',
            post: deletedPost
        });

    } catch (error) {
        console.error('❌ Error al eliminar post:', error);
        res.status(500).json({
            error: 'Error al eliminar post',
            details: error.message
        });
    }
};