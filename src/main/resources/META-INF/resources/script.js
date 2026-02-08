class LipReadingGame {
    constructor() {
        this.roomCode = null;
        this.playerName = null;
        this.isLeader = false;
        this.players = [];
        this.currentRound = 0;
        this.totalRounds = 0;
        this.scores = {};
        this.currentPhrase = null;
        this.currentVideoPlayer = null;
        this.viewCount = 0;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordedVideoBlob = null;
        this.mockVideos = {};
        this.socket = null;
        this.connected = false;
        this.ignoreSocketClose = false;
        this.config = {
            mockEnabled: true,
            minPlayers: 2
        };
        
        this.phrases = [
            "O cachorro late à noite na rua",
            "A lua brilha forte no céu azul",
            "Café quente faz bem pela manhã cedo",
            "Vamos passear no parque amanhã de tarde",
            "O livro está na mesa da sala",
            "Gosto muito de pizza com queijo derretido",
            "O sol nasce cedo todos os dias",
            "Adoro caminhar na praia ao entardecer"
        ];
        
        this.initializeEventListeners();
        this.loadConfig().finally(() => this.showLoginScreen());
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/config', { cache: 'no-store' });
            if (!response.ok) return;
            const data = await response.json();
            if (typeof data.mockEnabled === 'boolean') this.config.mockEnabled = data.mockEnabled;
            if (Number.isInteger(data.minPlayers)) this.config.minPlayers = data.minPlayers;
        } catch (error) {
            console.warn('Não foi possível carregar configuração do servidor. Usando padrão.', error);
        }
    }

    initializeEventListeners() {
        document.getElementById('joinRoom').addEventListener('click', () => this.joinRoom());
        document.getElementById('createRoom').addEventListener('click', () => this.createRoom());
        document.getElementById('roomCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('leaveLobby').addEventListener('click', () => this.leaveLobby());
        
        document.getElementById('startRecording').addEventListener('click', () => this.startRecording());
        document.getElementById('stopRecording').addEventListener('click', () => this.stopRecording());
        document.getElementById('submitVideo').addEventListener('click', () => this.submitVideo());
        
        document.getElementById('playVideo').addEventListener('click', () => this.playVideo());
        document.getElementById('submitGuess').addEventListener('click', () => this.submitGuess());
        document.getElementById('continueGame').addEventListener('click', () => this.nextRound());
        document.getElementById('backToLobby').addEventListener('click', () => this.backToLobby());
    }

    showLoginScreen() {
        this.hideAllScreens();
        document.getElementById('loginScreen').classList.remove('hidden');
    }

    showLobbyScreen() {
        this.hideAllScreens();
        document.getElementById('lobbyScreen').classList.remove('hidden');
        this.updateLobby();
    }

    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('gameScreen').classList.remove('hidden');
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    }

    hideAllPhases() {
        document.querySelectorAll('.game-phase').forEach(phase => phase.classList.add('hidden'));
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    createRoom() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            alert('Por favor, digite seu nome');
            return;
        }
        
        this.roomCode = this.generateRoomCode();
        this.playerName = playerName;
        this.isLeader = false;
        this.players = [];
        this.scores = {};

        if (this.config.mockEnabled) {
            this.isLeader = true;
            this.players = [{ name: playerName, id: 'player1', isLeader: true }];
            this.scores[playerName] = 0;
            this.mockAddPlayers();
            this.showLobbyScreen();
        } else {
            this.connectAndJoin();
        }
    }

    joinRoom() {
        const roomCode = document.getElementById('roomCode').value.trim();
        const playerName = document.getElementById('playerName').value.trim();
        
        if (!roomCode || !playerName) {
            alert('Por favor, preencha o código da sala e seu nome');
            return;
        }
        
        this.roomCode = roomCode;
        this.playerName = playerName;
        this.isLeader = false;
        this.players = [];
        this.scores = {};

        if (this.config.mockEnabled) {
            this.isLeader = true;
            this.players = [
                { name: playerName, id: 'player1', isLeader: true }
            ];
            this.scores[playerName] = 0;
            this.mockAddPlayers();
            this.showLobbyScreen();
        } else {
            this.connectAndJoin();
        }
    }

    connectAndJoin() {
        this.connectWebSocket(this.roomCode)
            .then(() => {
                this.sendMessage('setName', { name: this.playerName });
                this.showLobbyScreen();
            })
            .catch(() => {
                alert('Não foi possível conectar ao servidor.');
                this.showLoginScreen();
            });
    }

    connectWebSocket(roomCode) {
        return new Promise((resolve, reject) => {
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const url = `${protocol}://${window.location.host}/ws/game/${encodeURIComponent(roomCode)}`;
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                this.connected = true;
                resolve();
            };
            this.socket.onerror = () => reject();
            this.socket.onmessage = (event) => this.handleServerMessage(event.data);
            this.socket.onclose = () => {
                this.connected = false;
                if (this.ignoreSocketClose) {
                    this.ignoreSocketClose = false;
                    return;
                }
                if (!this.config.mockEnabled) {
                    alert('Conexão encerrada.');
                    this.showLoginScreen();
                    this.resetGame();
                }
            };
        });
    }

    closeSocket() {
        if (this.socket) {
            this.ignoreSocketClose = true;
            this.socket.close();
            this.socket = null;
            this.connected = false;
        }
    }

    sendMessage(type, payloadObj) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        const message = {
            type,
            payload: JSON.stringify(payloadObj || {})
        };
        this.socket.send(JSON.stringify(message));
    }

    handleServerMessage(data) {
        let msg;
        try {
            msg = JSON.parse(data);
        } catch (e) {
            return;
        }
        let payload = {};
        try {
            payload = msg.payload ? JSON.parse(msg.payload) : {};
        } catch (e) {
            payload = {};
        }

        switch (msg.type) {
            case 'roster':
                this.players = payload.players || [];
                this.isLeader = this.players.some(p => p.name === this.playerName && p.isLeader);
                this.updateLobby();
                this.players.forEach(p => { this.scores[p.name] = this.scores[p.name] || 0; });
                break;
            case 'gameStarted':
                this.totalRounds = this.players.length;
                this.currentRound = 0;
                this.showGameScreen();
                this.updateScoreboard();
                this.showWaitingPhase('Aguardando o primeiro jogador gravar o vídeo...');
                break;
            case 'requestRecord':
                this.currentVideoPlayer = { name: payload.player };
                if (this.currentRound < this.totalRounds) {
                    this.currentRound += 1;
                }
                document.getElementById('currentRound').textContent = this.currentRound;
                document.getElementById('totalRounds').textContent = this.totalRounds;
                this.viewCount = 0;
                if (payload.player === this.playerName) {
                    this.currentPhrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
                    this.showRecordingPhase();
                } else {
                    this.showWaitingPhase(`Aguardando ${payload.player} gravar o vídeo...`);
                }
                break;
            case 'videoAvailable':
                this.currentVideoPlayer = { name: payload.player };
                this.viewCount = 0;
                this.mockVideos[payload.player] = payload.videoData;
                if (payload.player === this.playerName) {
                    this.showWaitingPhase('Vídeo enviado! Aguardando outros jogadores...');
                } else {
                    this.showWatchingPhase();
                }
                break;
            case 'roundComplete':
                this.scores = payload.scores || {};
                this.currentPhrase = payload.phrase || this.currentPhrase;
                this.showResultsPhase();
                break;
            case 'gameOver':
                this.scores = payload || {};
                this.showFinalResults();
                break;
            case 'error':
                if (payload.message) alert(payload.message);
                break;
            default:
                break;
        }
    }

    mockAddPlayers() {
        setTimeout(() => {
            if (this.players.length < 4) {
                const names = ['Maria', 'Pedro', 'Ana', 'Carlos'];
                const newName = names[this.players.length - 1];
                if (newName && !this.players.find(p => p.name === newName)) {
                    this.players.push({ 
                        name: newName, 
                        id: 'player' + (this.players.length + 1), 
                        isLeader: false 
                    });
                    this.scores[newName] = 0;
                    this.updateLobby();
                }
            }
        }, 2000);
        
        setTimeout(() => {
            if (this.players.length < 4) {
                const names = ['Maria', 'Pedro', 'Ana', 'Carlos'];
                const newName = names[this.players.length - 1];
                if (newName && !this.players.find(p => p.name === newName)) {
                    this.players.push({ 
                        name: newName, 
                        id: 'player' + (this.players.length + 1), 
                        isLeader: false 
                    });
                    this.scores[newName] = 0;
                    this.updateLobby();
                }
            }
        }, 4000);
    }

    updateLobby() {
        document.getElementById('lobbyRoomCode').textContent = this.roomCode;
        document.getElementById('lobbyPlayerName').textContent = this.playerName;
        document.getElementById('playerCount').textContent = this.players.length;
        
        if (this.isLeader) {
            document.getElementById('leaderBadge').classList.remove('hidden');
            document.getElementById('startGame').disabled = this.players.length < this.config.minPlayers;
            document.getElementById('startGame').style.display = '';
        } else {
            document.getElementById('leaderBadge').classList.add('hidden');
            document.getElementById('startGame').style.display = 'none';
        }
        
        const playersList = document.getElementById('playersWaitingList');
        playersList.innerHTML = '';
        this.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-item' + (player.isLeader ? ' leader' : '');
            playerDiv.innerHTML = `
                <span>${player.name} ${player.isLeader ? '👑' : ''}</span>
            `;
            playersList.appendChild(playerDiv);
        });
    }

    leaveLobby() {
        if (!this.config.mockEnabled) {
            this.closeSocket();
        }
        this.showLoginScreen();
        this.resetGame();
    }

    startGame() {
        if (!this.isLeader || this.players.length < this.config.minPlayers) {
            alert(`É necessário pelo menos ${this.config.minPlayers} jogadores para começar`);
            return;
        }

        if (this.config.mockEnabled) {
            this.totalRounds = this.players.length;
            this.currentRound = 1;
            this.showGameScreen();
            this.updateScoreboard();
            this.startRound();
        } else {
            this.sendMessage('start', {});
        }
    }

    startRound() {
        document.getElementById('gameRoomCode').textContent = this.roomCode;
        document.getElementById('currentRound').textContent = this.currentRound;
        document.getElementById('totalRounds').textContent = this.totalRounds;
        
        const roundPlayerIndex = (this.currentRound - 1) % this.players.length;
        this.currentVideoPlayer = this.players[roundPlayerIndex];
        this.currentPhrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        
        this.viewCount = 0;
        
        if (this.currentVideoPlayer.name === this.playerName) {
            this.showRecordingPhase();
        } else {
            this.showWaitingPhase(`Aguardando ${this.currentVideoPlayer.name} gravar o vídeo...`);
            setTimeout(() => {
                this.mockVideoRecorded();
            }, 3000);
        }
    }

    showRecordingPhase() {
        this.hideAllPhases();
        document.getElementById('recordingPhase').classList.remove('hidden');
        document.getElementById('phraseToRecord').textContent = this.currentPhrase;
        
        this.startCamera();
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const preview = document.getElementById('recordPreview');
            preview.srcObject = stream;
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            alert('Não foi possível acessar a câmera. O jogo continuará em modo simulado.');
        }
    }

    async startRecording() {
        try {
            const stream = document.getElementById('recordPreview').srcObject;
            if (!stream) {
                alert('Câmera não disponível. Simulando gravação...');
                this.simulateRecording();
                return;
            }
            
            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.recordedVideoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
                document.getElementById('submitVideo').classList.remove('hidden');
            };
            
            this.mediaRecorder.start();
            document.getElementById('startRecording').classList.add('hidden');
            document.getElementById('stopRecording').classList.remove('hidden');
            
        } catch (error) {
            console.error('Erro ao gravar:', error);
            this.simulateRecording();
        }
    }

    simulateRecording() {
        document.getElementById('startRecording').classList.add('hidden');
        document.getElementById('stopRecording').classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('stopRecording').classList.add('hidden');
            document.getElementById('submitVideo').classList.remove('hidden');
        }, 2000);
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            const stream = document.getElementById('recordPreview').srcObject;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
        
        document.getElementById('stopRecording').classList.add('hidden');
        document.getElementById('submitVideo').classList.remove('hidden');
    }

    submitVideo() {
        if (this.config.mockEnabled) {
            if (this.recordedVideoBlob) {
                this.mockVideos[this.currentVideoPlayer.name] = URL.createObjectURL(this.recordedVideoBlob);
            }
            this.showWaitingPhase('Vídeo enviado! Aguardando outros jogadores...');
            setTimeout(() => {
                this.showWatchingPhase();
            }, 2000);
            return;
        }

        if (!this.recordedVideoBlob) {
            alert('Nenhum vídeo gravado.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const videoData = reader.result;
            this.sendMessage('uploadVideo', { phrase: this.currentPhrase, videoData });
            this.showWaitingPhase('Vídeo enviado! Aguardando outros jogadores...');
        };
        reader.readAsDataURL(this.recordedVideoBlob);
    }

    mockVideoRecorded() {
        this.showWatchingPhase();
    }

    showWaitingPhase(message) {
        this.hideAllPhases();
        document.getElementById('waitingPhase').classList.remove('hidden');
        document.getElementById('waitingMessage').textContent = message;
    }

    showWatchingPhase() {
        this.hideAllPhases();
        document.getElementById('watchingPhase').classList.remove('hidden');
        document.getElementById('videoPlayerName').textContent = this.currentVideoPlayer.name;
        document.getElementById('viewCount').textContent = this.viewCount;
        
        const videoElement = document.getElementById('gameVideo');
        if (this.mockVideos[this.currentVideoPlayer.name]) {
            videoElement.src = this.mockVideos[this.currentVideoPlayer.name];
        } else {
            videoElement.removeAttribute('src');
        }
        
        if (this.viewCount >= 3) {
            document.getElementById('playVideo').disabled = true;
            document.getElementById('playVideo').textContent = '✓ Visualizações completas';
            setTimeout(() => this.showGuessingPhase(), 1500);
        }
    }

    playVideo() {
        if (this.viewCount >= 3) return;
        
        const videoElement = document.getElementById('gameVideo');
        videoElement.play();
        this.viewCount++;
        document.getElementById('viewCount').textContent = this.viewCount;
        
        videoElement.onended = () => {
            if (this.viewCount >= 3) {
                document.getElementById('playVideo').disabled = true;
                document.getElementById('playVideo').textContent = '✓ Visualizações completas';
                setTimeout(() => this.showGuessingPhase(), 1500);
            }
        };
    }

    showGuessingPhase() {
        this.hideAllPhases();
        document.getElementById('guessingPhase').classList.remove('hidden');
        document.getElementById('guessInput').value = '';
        document.getElementById('guessInput').focus();
    }

    submitGuess() {
        const guess = document.getElementById('guessInput').value.trim();
        if (!guess) {
            alert('Por favor, digite sua resposta');
            return;
        }

        if (this.config.mockEnabled) {
            const accuracy = this.calculateAccuracy(this.currentPhrase, guess);
            this.scores[this.playerName] += accuracy;
            this.showWaitingPhase('Resposta enviada! Aguardando outros jogadores...');
            setTimeout(() => {
                this.mockOtherPlayersGuess();
                this.showResultsPhase();
            }, 2000);
        } else {
            this.sendMessage('submitGuess', { guess });
            this.showWaitingPhase('Resposta enviada! Aguardando outros jogadores...');
        }
    }

    mockOtherPlayersGuess() {
        this.players.forEach(player => {
            if (player.name !== this.playerName && player.name !== this.currentVideoPlayer.name) {
                const randomAccuracy = Math.floor(Math.random() * 70) + 10;
                this.scores[player.name] += randomAccuracy;
            }
        });
    }

    calculateAccuracy(correct, guess) {
        const correctWords = correct.toLowerCase().split(' ');
        const guessWords = guess.toLowerCase().split(' ');
        
        let matches = 0;
        correctWords.forEach(word => {
            if (guessWords.includes(word)) {
                matches++;
            }
        });
        
        return Math.round((matches / correctWords.length) * 100);
    }

    showResultsPhase() {
        this.hideAllPhases();
        document.getElementById('resultsPhase').classList.remove('hidden');
        document.getElementById('correctPhrase').textContent = this.currentPhrase;
        
        const resultsList = document.getElementById('roundResultsList');
        resultsList.innerHTML = '';
        
        const sortedPlayers = [...this.players]
            .filter(p => p.name !== this.currentVideoPlayer.name)
            .sort((a, b) => (this.scores[b.name] || 0) - (this.scores[a.name] || 0));
        
        sortedPlayers.forEach(player => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            resultDiv.innerHTML = `
                <div>
                    <strong>${player.name}</strong>
                    <p class="accuracy">Pontuação: ${this.scores[player.name] || 0} pontos</p>
                </div>
            `;
            resultsList.appendChild(resultDiv);
        });
        
        this.updateScoreboard();
        
        if (this.config.mockEnabled) {
            if (this.currentRound >= this.totalRounds) {
                document.getElementById('continueGame').textContent = 'Ver Resultado Final';
            } else {
                document.getElementById('continueGame').textContent = 'Próxima Rodada';
            }
        } else {
            document.getElementById('continueGame').textContent = 'Aguardar Próxima Rodada';
        }
    }

    nextRound() {
        if (this.config.mockEnabled) {
            if (this.currentRound >= this.totalRounds) {
                this.showFinalResults();
            } else {
                this.currentRound++;
                this.startRound();
            }
        } else {
            this.showWaitingPhase('Aguardando a próxima rodada...');
        }
    }

    showFinalResults() {
        this.hideAllPhases();
        document.getElementById('finalResultsPhase').classList.remove('hidden');
        
        const sortedPlayers = [...this.players].sort((a, b) => (this.scores[b.name] || 0) - (this.scores[a.name] || 0));
        const winner = sortedPlayers[0];
        
        document.getElementById('winnerName').textContent = `🏆 ${winner.name} Venceu!`;
        document.getElementById('winnerScore').textContent = `${this.scores[winner.name] || 0} pontos`;
        
        const finalScoreboard = document.getElementById('finalScoreboardList');
        finalScoreboard.innerHTML = '';
        
        sortedPlayers.forEach((player, index) => {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'score-item';
            scoreDiv.innerHTML = `
                <span>${index + 1}º - ${player.name}</span>
                <strong>${this.scores[player.name] || 0} pontos</strong>
            `;
            finalScoreboard.appendChild(scoreDiv);
        });
    }

    updateScoreboard() {
        const scoreboard = document.getElementById('scoreboardList');
        scoreboard.innerHTML = '';
        
        const sortedPlayers = [...this.players].sort((a, b) => (this.scores[b.name] || 0) - (this.scores[a.name] || 0));
        
        sortedPlayers.forEach(player => {
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'score-item' + (player.name === this.playerName ? ' current-player' : '');
            scoreDiv.innerHTML = `
                <span>${player.name}</span>
                <strong>${this.scores[player.name] || 0} pts</strong>
            `;
            scoreboard.appendChild(scoreDiv);
        });
    }

    backToLobby() {
        if (!this.config.mockEnabled) {
            this.closeSocket();
        }
        this.resetGame();
        this.showLoginScreen();
    }

    resetGame() {
        this.currentRound = 0;
        this.totalRounds = 0;
        this.scores = {};
        this.players = [];
        this.currentPhrase = null;
        this.currentVideoPlayer = null;
        this.viewCount = 0;
        this.mockVideos = {};
    }
}

const game = new LipReadingGame();
