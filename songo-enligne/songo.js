document.addEventListener("DOMContentLoaded", () => {
    // État initial : 14 trous avec 5 graines
    let board = Array(14).fill(5); 
    let scoreP1 = 0;
    let scoreP2 = 0;
    let currentPlayer = 1; // 1 = Joueur 1, 2 = Joueur 2
    // Configuration pour jeu en ligne
    const API_URL = '/api/game';
    const localPlayer = parseInt(new URLSearchParams(location.search).get('player')) || 0; // 0 = spectateur
    const isOnline = true;

    const holesElements = document.querySelectorAll(".hole");
    const statusText = document.getElementById("status-turn");

    function updateUI() {
        holesElements.forEach(hole => {
            const index = parseInt(hole.getAttribute("data-index"));
            hole.textContent = board[index];
        });
        document.getElementById("score-p1").textContent = scoreP1;
        document.getElementById("score-p2").textContent = scoreP2;
        // Afficher le joueur dont c'est le tour; préciser si c'est le joueur local
        if (localPlayer && localPlayer === currentPlayer) {
            statusText.textContent = `Votre tour (Joueur ${currentPlayer})`;
        } else if (localPlayer === 0) {
            statusText.textContent = `Spectateur - Tour : Joueur ${currentPlayer}`;
        } else {
            statusText.textContent = `Tour : Joueur ${currentPlayer}`;
        }
    }

    holesElements.forEach(hole => {
        hole.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            
            // Validation du tour: le joueur ne peut jouer que dans son camp
            if (currentPlayer === 1 && (index < 0 || index > 6)) return;
            if (currentPlayer === 2 && (index < 7 || index > 13)) return;
            if (board[index] === 0) return;

            // Empêcher les clics si partie terminée
            if (scoreP1 >= 40 || scoreP2 >= 40) return;

            // Si en ligne, n'autoriser le coup que si c'est bien le joueur local
            if (isOnline && localPlayer !== currentPlayer) return;

            sowGraines(index);
        });
    });

    function sowGraines(startIndex) {
        let graines = board[startIndex];
        board[startIndex] = 0;
        let currentIndex = startIndex;

        // Égrenage / Semailles (sens horaire)
        while (graines > 0) {
            currentIndex = (currentIndex - 1 + 14) % 14;
            board[currentIndex]++;
            graines--;
        }

        // Logique de capture: capture en chaîne selon règles Songo (2 ou 3 graines)
        checkCapture(currentIndex);

        // Vérification de la victoire (Fin de partie à 40 graines)
        let isGameOver = (scoreP1 >= 40 || scoreP2 >= 40);

        if (!isGameOver) {
            // Alternance des tours
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        }

        updateUI();

        if (isGameOver) {
            statusText.textContent = `Partie terminée ! Gagnant : Joueur ${scoreP1 >= 40 ? 1 : 2}`;
        }

        // En mode en ligne, sauvegarder l'état sur le serveur après le coup (y compris fin de partie)
        if (isOnline) {
            saveStateToServer();
        }
    }

    function checkCapture(lastIndex) {
        // Capture en chaîne: si le dernier semis atterrit dans le camp adverse,
        // on capture les cases successives vers l'arrière qui contiennent 2 ou 3 graines.
        if (currentPlayer === 1) {
            // Joueur 1 capture dans camp du joueur 2 (7..13)
            if (lastIndex < 7 || lastIndex > 13) return;
            let idx = lastIndex;
            while (idx >= 7 && idx <= 13) {
                if (board[idx] === 2 || board[idx] === 3) {
                    scoreP1 += board[idx];
                    board[idx] = 0;
                    idx--; // continuer vers la case précédente
                } else break;
            }
        } else if (currentPlayer === 2) {
            // Joueur 2 capture dans camp du joueur 1 (0..6)
            if (lastIndex < 0 || lastIndex > 6) return;
            let idx = lastIndex;
            while (idx >= 0 && idx <= 6) {
                if (board[idx] === 2 || board[idx] === 3) {
                    scoreP2 += board[idx];
                    board[idx] = 0;
                    idx--; // continuer vers la case précédente (vers la gauche)
                } else break;
            }
        }
    }

    // ----- Fonctions en ligne (GET/POST vers Vercel) -----
    async function loadStateFromServer() {
        try {
            const res = await fetch(API_URL);
            const json = await res.json();
            if (json.status && json.status === 'error') return;
            if (!json.etat_plateau) return;
            const remoteBoard = Array.isArray(json.etat_plateau) ? json.etat_plateau.map(x=>parseInt(x)) : json.etat_plateau;
            const remoteStr = remoteBoard.join(',');
            const localStr = board.join(',');
            if (remoteStr !== localStr || parseInt(json.tour_joueur) !== currentPlayer || parseInt(json.score_p1) !== scoreP1 || parseInt(json.score_p2) !== scoreP2) {
                board = remoteBoard.slice();
                scoreP1 = parseInt(json.score_p1) || 0;
                scoreP2 = parseInt(json.score_p2) || 0;
                currentPlayer = parseInt(json.tour_joueur) || currentPlayer;
                updateUI();
                
                if (json.statut === 'finished') {
                    statusText.textContent = `Partie terminée ! Gagnant : Joueur ${scoreP1 >= 40 ? 1 : 2}`;
                }
            }
        } catch (e) {
            console.warn('Erreur chargement état serveur', e);
        }
    }

    async function saveStateToServer() {
        try {
            const payload = {
                board: board,
                tour_joueur: currentPlayer,
                score_p1: scoreP1,
                score_p2: scoreP2,
                statut: (scoreP1 >= 40 || scoreP2 >= 40) ? 'finished' : 'active'
            };
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.warn('Erreur sauvegarde serveur', e);
        }
    }

    // Démarrer polling si en ligne
    if (isOnline) {
        loadStateFromServer();
        setInterval(loadStateFromServer, 2000);
    }

    updateUI();
});
