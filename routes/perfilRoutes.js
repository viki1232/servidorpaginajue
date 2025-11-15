import express from 'express';
import {
    createJuego, getUserGames, deleteUserGame, juegocompleto, marcarCompletado, agregarHoras
} from '../controllers/juegosController.js';

const router = express.Router();

// ✅ Agregar juego al perfil
router.post('/perfil/games', createJuego);

// ✅ Obtener juegos del usuario
router.get('/perfil/games/:user_id', getUserGames);

// ✅ Eliminar juego del perfil
router.delete('/perfil/games/:user_id/:game_id', deleteUserGame);

router.get('/perfil/juegos', juegocompleto);
router.post('/perfil/juego/:user_id/:game_id/completado', marcarCompletado);
router.post('/perfil/juego/:user_id/:game_id/horas', agregarHoras);


export default router;