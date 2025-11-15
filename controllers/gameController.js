// server/controllers/gameController.js
import Game from '../models/game.js';

// Obtener todos los juegos
export const getAllGames = async (req, res) => {
    try {
        const games = await Game.find().sort({ created_at: -1 });
        res.json(games);
    } catch (error) {
        console.error('Error obteniendo juegos:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener un juego por ID
export const getGameById = async (req, res) => {
    try {
        const { id } = req.params;
        const game = await Game.findOne({ id: parseInt(id) });

        if (!game) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }

        res.json(game);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear juego
export const createGame = async (req, res) => {
    try {
        const { title, description, price, category, image_url } = req.body;

        // Obtener el último ID
        const lastGame = await Game.findOne().sort({ id: -1 });
        const newId = lastGame ? lastGame.id + 1 : 1;

        const newGame = new Game({
            id: newId,
            title,
            description,
            price,
            category,
            image_url
        });

        await newGame.save();

        res.status(201).json({
            message: 'Juego creado exitosamente',
            game: newGame
        });
    } catch (error) {
        console.error('Error creando juego:', error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar juego
export const updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updated_at: Date.now()
        };

        const updatedGame = await Game.findOneAndUpdate(
            { id: parseInt(id) },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedGame) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }

        res.json({
            message: 'Juego actualizado',
            game: updatedGame
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar juego
export const deleteGame = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedGame = await Game.findOneAndDelete({ id: parseInt(id) });

        if (!deletedGame) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }

        res.json({
            message: 'Juego eliminado',
            game: deletedGame
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};