import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Étape 1 : Autoriser tous les sites à communiquer avec cette API (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Réponse rapide pour les requêtes préliminaires du navigateur (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const gameId = 'songo_partie_actuelle';

    // Étape 2 : Quand un joueur veut LIRE le plateau (GET)
    if (req.method === 'GET') {
        try {
            // On demande à Redis l'état du jeu
            let gameState = await kv.get(gameId);
            
            // Si la partie n'existe pas encore, on crée le plateau initial
            if (!gameState) {
                gameState = {
                    etat_plateau: [5,5,5,5,5,5,5,5,5,5,5,5,5,5], // 14 trous, 5 graines
                    tour_joueur: 1,
                    score_p1: 0,
                    score_p2: 0,
                    statut: 'active'
                };
                await kv.set(gameId, gameState);
            }
            return res.status(200).json(gameState);
        } catch (error) {
            return res.status(500).json({ error: 'Erreur serveur Redis' });
        }
    }

    // Étape 3 : Quand un joueur a joué et veut SAUVEGARDER le plateau (POST)
    if (req.method === 'POST') {
        try {
            const data = req.body;
            // On sauvegarde les nouvelles données envoyées par le joueur
            const newGameState = {
                etat_plateau: data.board,
                tour_joueur: data.tour_joueur,
                score_p1: data.score_p1,
                score_p2: data.score_p2,
                statut: data.statut
            };
            
            await kv.set(gameId, newGameState);
            return res.status(200).json({ status: 'success' });
        } catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
        }
    }

    // Si on essaie de faire autre chose que GET ou POST
    return res.status(405).json({ message: 'Méthode non autorisée' });
}
