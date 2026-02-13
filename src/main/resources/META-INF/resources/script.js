class LipReadingGame {
    constructor() {
        this.appVersion = '2026-02-10.1';
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
        this.returnLobbyTimer = null;
        this.returnLobbySeconds = 0;
        this.socket = null;
        this.connected = false;
        this.ignoreSocketClose = false;
        this.pendingRequestRecord = null;
        this.pendingGameOver = null;
        this.pendingReturnToLobby = false;
        this.roundTotalsSnapshot = {};
        this.roundGuesses = {};
        this.roundScores = {};
        this.resultsHoldActive = false;
        this.resultsHoldTimer = null;
        this.resultsHoldInterval = null;
        this.guessingPhaseActive = false;
        this.finalResultsActive = false;
        this.turnTimeout = null;
        this.turnInterval = null;
        this.turnRemainingSeconds = 0;
        this.autoSubmitOnStop = false;
        this.maxTurnMs = 30000;
        this.guessTimeout = null;
        this.guessInterval = null;
        this.guessRemainingSeconds = 0;
        this.maxGuessMs = 30000;
        this.autoPlayInProgress = false;
        this.config = {
            mockEnabled: false,
            minPlayers: 2
        };
        
        this.phrases = [
            "O pato pediu um pix para a lagoa",
            "Minha planta pediu férias e foi pra sombra",
            "O gato acha que é gerente do sofá",
            "A geladeira faz dieta de madrugada",
            "O Wi-Fi some quando a visita chega",
            "O cachorro assistiu novela e chorou",
            "Meu relógio atrasa de propósito",
            "O teclado engoliu uma letra e fugiu",
            "A cadeira range porque tem segredos",
            "A pizza chegou fria e filosofou",
            "O celular tem ciúmes do carregador",
            "O ventilador virou DJ no calor",
            "A torradeira aplaudiu meu pão",
            "Meu guarda-chuva perdeu o voo",
            "O elevador pensa que é montanha-russa",
            "A meia sumida abriu uma startup",
            "O controle remoto tirou folga",
            "O abacate fez yoga na salada",
            "O leite fugiu do cereal apavorado",
            "A caneta acabou a tinta no autógrafo",
            "O espelho acordou de mau humor",
            "O micro-ondas apitou só para conversar",
            "Minha mochila tem GPS e sumiu",
            "O travesseiro roubou meu despertador",
            "A janela cochichou com o vento",
            "Meu café fez reunião com o açúcar",
            "O peixe pediu Uber para o aquário",
            "A banana escorregou de propósito",
            "O sapato chiou porque estava tímido",
            "O bolo pediu bis, já era o primeiro",
            "A televisão piscou e contou piada",
            "O carregador se esconde quando preciso",
            "A bicicleta ficou com medo da ladeira",
            "A panela fez greve e não quis ferver",
            "O livro riu da própria capa",
            "O mouse fugiu do tapete",
            "A campainha tocou sozinha e pediu desculpas",
            "O sorvete derreteu de ansiedade",
            "O pente falou que hoje é dia de folga",
            "A luz piscou para me dar bom dia",
            "O chinelo pediu férias do piso",
            "O sofá engoliu uma pipoca e sorriu",
            "A tomada bocejou quando liguei a TV",
            "O casaco ficou com frio no armário",
            "O caderno guardou segredo na última página",
            "A mochila fez alongamento antes da escola",
            "O travesseiro pediu café e mais cinco minutos",
            "A colher dançou com o copo",
            "O fogão piscou e apagou por timidez",
            "A borracha apagou a própria autoestima",
            "O lápis ficou ponta-cabeça",
            "A régua se achou por estar alinhada",
            "O quadro branco ficou ofendido com o marcador",
            "O teclado pediu silêncio para digitar",
            "O grampo fugiu do papel",
            "A gaveta engoliu as chaves e fez mistério",
            "O lençol virou capa de super-herói",
            "O relógio despertou antes do sol",
            "A escova de dentes cantou no banho",
            "O shampoo fez espuma de festa",
            "A toalha deu tchau para a secadora",
            "O espremedor espirrou suco",
            "O copo tropeçou na mesa",
            "A panela de pressão contou fofoca",
            "O garfo se perdeu na gaveta",
            "A frigideira chiou porque estava brava",
            "O liquidificador quis virar ventilador",
            "O sabão fez bolhas de alegria",
            "A vassoura virou microfone",
            "O tapete fingiu ser grama",
            "A cortina fez cosplay de fantasma",
            "O varal pendurou minhas ideias",
            "A bicicleta tirou selfie com a rua",
            "O pneu cansou da subida",
            "O patins pediu capacete emprestado",
            "O quadro de fotos piscou para mim",
            "A almofada contou piada interna",
            "O rádio sussurrou uma música antiga",
            "A lâmpada teve um insight",
            "O ar-condicionado fez sauna",
            "A rua pediu silêncio para dormir",
            "O semáforo piscou em ritmo de festa",
            "A calçada tropeçou no meu passo",
            "O elevador fez amizade com o térreo",
            "O escorredor chorou por estar cheio",
            "A chaleira apitou um segredo",
            "O freezer sonhou com o verão",
            "A pia cantou desafinada",
            "O espelho tirou minha foto mental",
            "O calendário pulou um dia de preguiça",
            "O despertador brigou com o soneca",
            "O livro abriu boquinha para bocejar",
            "A mochila fez check-in na porta",
            "O ferro passou de raiva",
            "A sandália pediu pra ir de carro",
            "O ventilador fez vento tímido",
            "A janela abriu um sorriso",
            "O chuveiro ficou com medo do frio",
            "A tomada pediu desculpas pelo choque",
            "O microfone ficou rouco sem show",
            "O travesseiro abriu uma empresa de cochilos",
            "A torrada pediu autógrafo do queijo",
            "O cabo USB só encaixa do lado errado",
            "A escada suspirou no terceiro degrau",
            "O chapéu se perdeu num desfile",
            "A mala fez check-out sozinha",
            "O relógio cansou de correr atrás do tempo",
            "O ventilador fez penteado no gato",
            "O chinelo deu meia-volta no corredor",
            "A caneca ficou triste sem café",
            "O telefone caiu no sono e desligou",
            "O fósforo se achou uma estrela",
            "A gelatina tremeu de emoção",
            "O fogão pediu licença para acender",
            "O alarme tocou e pediu silêncio",
            "A mochila entrou no ônibus errado",
            "O cabide se vestiu de manhã",
            "A bandeja derrubou os próprios planos",
            "O cinto apertou a agenda",
            "A janela fechou de ciúmes do vento",
            "O ventilador espirrou poeira",
            "O carregador reclamou da tomada concorrente",
            "A régua se curvou de vergonha",
            "O rascunho virou poema sem querer",
            "A calculadora perdeu a conta",
            "O calendário marcou reunião no sábado",
            "O teclado clicou só para chamar atenção",
            "O mouse fez mochilão pela mesa",
            "A tela piscou e fingiu travar",
            "O pendrive sumiu na festa da mochila",
            "O celular pediu intervalo do grupo",
            "A bateria fugiu no meio do jogo",
            "O fone de ouvido virou nó artístico",
            "A playlist trocou a música no refrão",
            "O alto-falante sussurrou com vergonha",
            "O micro-ondas pediu bis do jantar",
            "A panela escorregou na espuma",
            "O filtro de água contou segredo",
            "A chaleira assobiou uma melodia",
            "O copo d'água fez natação sincronizada",
            "A colher preferiu colher conversas",
            "O garfo se enrolou com o espaguete",
            "A faca pediu licença para cortar",
            "A tábua de cortar fez greve",
            "O pão se escondeu do tostador",
            "O ovo ensaiou uma fuga na frigideira",
            "O macarrão fez trança no prato",
            "A salada pediu um casaco",
            "A pipoca estourou de felicidade",
            "O sorvete caiu de alegria",
            "A sobremesa fez fila no freezer",
            "O brigadeiro virou celebridade",
            "A colher de pau virou diretora",
            "O guardanapo dobrou as regras",
            "O forno abriu a porta sozinho",
            "A pia entupiu de saudade",
            "O filtro de café tirou férias",
            "O açúcar fugiu do potinho",
            "O saleiro ficou com ciúmes da pimenta",
            "A pimenta espirrou pimenta",
            "O limão fez careta antes de cair",
            "A laranja perdeu o sorriso",
            "O tomate achou que era maçã",
            "A maçã ficou vermelha de vergonha",
            "O bolo se vestiu de aniversário",
            "A vela chorou cera",
            "O balão subiu e voltou com fofoca",
            "O confete escondeu a bagunça",
            "O presente embrulhou a surpresa errada",
            "O laço ficou com nó na garganta",
            "A cadeira pediu ticket de estacionamento",
            "O banco levantou e saiu",
            "A mesa cochichou com a cadeira",
            "O quadro caiu no momento errado",
            "A porta rangiu de emoção",
            "A fechadura pediu senha mais forte",
            "A chave tirou folga do chaveiro",
            "O tapete fez yoga no corredor",
            "A cortina dançou no vento",
            "O espelho praticou caretas",
            "A lâmpada piscou em código Morse",
            "O interruptor virou DJ do quarto",
            "O ventilador pediu autógrafo da brisa",
            "O sofá engoliu o controle de novo",
            "O controle remoto pediu localização",
            "A estante cochilou com os livros",
            "O livro abriu na página errada",
            "A página virou sozinha e se arrependeu",
            "O marcador se perdeu no capítulo",
            "O caderno fez resenha do dia",
            "A caneta falhou no momento dramático",
            "O lápis pediu para apontar ideias",
            "A borracha apagou a própria sombra",
            "O apontador engoliu o lápis inteiro",
            "A mochila colecionou bilhetes secretos",
            "O guarda-chuva ensaiou uma coreografia",
            "A chuva esqueceu de chover",
            "O céu fez uma selfie com as nuvens",
            "A nuvem fez formato de sapo",
            "O sol piscou de canto de olho",
            "A lua bocejou no meio do filme",
            "A estrela caiu para tirar férias",
            "O vento assobiou desafinado",
            "A árvore contou história para as folhas",
            "A folha decidiu mudar de galho",
            "O passarinho fez reunião de condomínio",
            "O cachorro pediu senha do Wi-Fi",
            "O gato ignorou o relógio de novo",
            "O peixe tentou escapar do filtro",
            "A tartaruga pediu turbo",
            "O coelho perdeu o ônibus",
            "A formiga organizou um buffet",
            "A abelha fez zigue-zague com estilo"
        ];
        
        this.initializeEventListeners();
        this.renderVersion();
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
        
        document.getElementById('playVideo').addEventListener('click', () => this.playVideo());
        document.getElementById('submitGuess').addEventListener('click', () => this.submitGuess());
        document.getElementById('continueGame').addEventListener('click', () => this.nextRound());
        document.getElementById('backToLobby').addEventListener('click', () => this.backToLobby());
    }

    renderVersion() {
        const versionEl = document.getElementById('appVersion');
        if (!versionEl) return;
        versionEl.textContent = `versao ${this.appVersion}`;
        versionEl.classList.remove('hidden');
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
        const roomEl = document.getElementById('gameRoomCode');
        if (roomEl) {
            roomEl.textContent = this.roomCode || '';
        }
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
                const roomEl = document.getElementById('gameRoomCode');
                if (roomEl) {
                    roomEl.textContent = this.roomCode || '';
                }
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
                if (this.resultsHoldActive) {
                    this.pendingRequestRecord = payload;
                    break;
                }
                this.handleRequestRecord(payload);
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
            case 'noVideo':
                this.scores = payload.scores || {};
                this.updateScoreboard();
                this.showWaitingPhase(`Tempo esgotado! ${payload.player} não enviou vídeo. Todos ganharam +40 pontos (exceto ${payload.player}).`);
                break;
            case 'roundComplete':
                this.scores = payload.scores || {};
                this.currentPhrase = payload.phrase || this.currentPhrase;
                this.roundGuesses = payload.roundGuesses || {};
                this.roundScores = payload.roundScores || {};
                this.showResultsPhase();
                break;
            case 'gameOver':
                if (this.resultsHoldActive) {
                    this.pendingGameOver = payload || {};
                    break;
                }
                this.scores = payload || {};
                this.finalResultsActive = true;
                this.showFinalResults();
                this.startReturnLobbyCountdown(10);
                break;
            case 'returnToLobby':
                if (this.pendingGameOver || this.resultsHoldActive || this.finalResultsActive || this.returnLobbySeconds > 0) {
                    this.pendingReturnToLobby = true;
                    break;
                }
                this.resetForLobby();
                this.showLobbyScreen();
                this.updateLobby();
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

        this.roundTotalsSnapshot = { ...this.scores };
        
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
        this.recordedChunks = [];
        this.recordedVideoBlob = null;
        this.autoSubmitOnStop = false;
        this.stopTurnTimer();
        const startBtn = document.getElementById('startRecording');
        const stopBtn = document.getElementById('stopRecording');
        if (startBtn) startBtn.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.add('hidden');
        this.startCamera();
        this.startTurnTimer();
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
                if (this.autoSubmitOnStop) {
                    this.autoSubmitOnStop = false;
                    this.handleAutoSubmit();
                    return;
                }
                this.submitVideo();
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
            this.submitVideo();
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
        if (!this.autoSubmitOnStop && !this.mediaRecorder) {
            this.submitVideo();
        }
    }

    handleAutoSubmit() {
        if (this.recordedVideoBlob && this.recordedVideoBlob.size > 0) {
            this.submitVideo();
            return;
        }
        this.handleNoVideo();
    }

    handleNoVideo() {
        this.stopTurnTimer();
        if (this.config.mockEnabled) {
            this.players.forEach(player => {
                if (player.name !== this.currentVideoPlayer.name) {
                    this.scores[player.name] = (this.scores[player.name] || 0) + 40;
                }
            });
            this.updateScoreboard();
            this.showWaitingPhase(`Tempo esgotado! ${this.currentVideoPlayer.name} não enviou vídeo. Todos ganharam +40 pontos (exceto ${this.currentVideoPlayer.name}).`);
            setTimeout(() => this.nextRound(), 2000);
            return;
        }
        this.sendMessage('noVideo', {});
        this.showWaitingPhase('Tempo esgotado! Nenhum vídeo enviado.');
    }

    submitVideo() {
        this.stopTurnTimer();
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

        if (!this.recordedVideoBlob || this.recordedVideoBlob.size === 0) {
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
        this.guessingPhaseActive = false;

        const playButton = document.getElementById('playVideo');
        if (playButton) {
            playButton.disabled = true;
            playButton.textContent = '▶️ Assistir';
            playButton.classList.add('hidden');
        }
        
        const videoElement = document.getElementById('gameVideo');
        if (this.mockVideos[this.currentVideoPlayer.name]) {
            videoElement.src = this.mockVideos[this.currentVideoPlayer.name];
        } else {
            videoElement.removeAttribute('src');
        }

        this.startAutoPlayback();
    }

    startAutoPlayback() {
        if (this.autoPlayInProgress) return;
        this.autoPlayInProgress = true;

        const videoElement = document.getElementById('gameVideo');
        const playOnce = () => {
            if (this.viewCount >= 3) {
                this.autoPlayInProgress = false;
                setTimeout(() => this.showGuessingPhase(), 1500);
                return;
            }

            const finalizeView = () => {
                if (this.viewCount < 3) {
                    this.viewCount += 1;
                    document.getElementById('viewCount').textContent = this.viewCount;
                }
                if (this.viewCount >= 3) {
                    this.autoPlayInProgress = false;
                    setTimeout(() => this.showGuessingPhase(), 1500);
                    return;
                }
                setTimeout(playOnce, 500);
            };

            const hasSrc = !!videoElement.getAttribute('src');
            if (hasSrc) {
                try {
                    videoElement.currentTime = 0;
                } catch (e) {}
                videoElement.onended = () => finalizeView();
                videoElement.play().catch(() => {
                    setTimeout(finalizeView, 800);
                });
            } else if (this.config.mockEnabled) {
                setTimeout(finalizeView, 800);
            } else {
                setTimeout(finalizeView, 800);
            }
        };

        playOnce();
    }

    showGuessingPhase() {
        if (this.guessingPhaseActive) {
            const input = document.getElementById('guessInput');
            if (input) input.focus();
            return;
        }
        this.guessingPhaseActive = true;
        this.hideAllPhases();
        document.getElementById('guessingPhase').classList.remove('hidden');
        document.getElementById('guessInput').value = '';
        document.getElementById('guessInput').focus();
        this.startGuessTimer();
    }

    submitGuess(force = false) {
        const guess = document.getElementById('guessInput').value.trim();
        if (!guess && !force) {
            alert('Por favor, digite sua resposta');
            return;
        }
        this.stopGuessTimer();

        if (this.config.mockEnabled) {
            const accuracy = guess ? this.calculateAccuracy(this.currentPhrase, guess) : 0;
            this.scores[this.playerName] += accuracy;
            this.roundGuesses[this.playerName] = guess || '';
            this.showWaitingPhase('Resposta enviada! Aguardando outros jogadores...');
            setTimeout(() => {
                this.mockOtherPlayersGuess();
                this.showResultsPhase();
            }, 2000);
        } else {
            this.sendMessage('submitGuess', { guess: guess || '' });
            this.showWaitingPhase('Resposta enviada! Aguardando outros jogadores...');
        }
    }

    mockOtherPlayersGuess() {
        this.players.forEach(player => {
            if (player.name !== this.playerName && player.name !== this.currentVideoPlayer.name) {
                const randomAccuracy = Math.floor(Math.random() * 70) + 10;
                this.scores[player.name] += randomAccuracy;
                this.roundGuesses[player.name] = this.generateMockGuess();
            }
        });
    }

    generateMockGuess() {
        if (!this.currentPhrase) return '...';
        const words = this.currentPhrase.split(' ');
        if (words.length <= 2) return this.currentPhrase;
        const cut = Math.max(2, Math.floor(words.length * 0.6));
        return words.slice(0, cut).join(' ');
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

        const roundDeltas = this.computeRoundDeltas(this.scores);
        
        const sortedPlayers = [...this.players]
            .sort((a, b) => (roundDeltas[b.name] || 0) - (roundDeltas[a.name] || 0));
        
        sortedPlayers.forEach(player => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';

            const nameEl = document.createElement('strong');
            nameEl.textContent = player.name;

            const guessEl = document.createElement('p');
            guessEl.className = 'guess';
            const isRecorder = this.currentVideoPlayer && player.name === this.currentVideoPlayer.name;
            const guessText = isRecorder ? 'Gravou o vídeo' : (this.roundGuesses[player.name] || '—');
            guessEl.textContent = `Chute: ${guessText}`;

            const pointsEl = document.createElement('p');
            pointsEl.className = 'accuracy';
            pointsEl.textContent = `Pontos da rodada: ${roundDeltas[player.name] || 0}`;

            resultDiv.appendChild(nameEl);
            resultDiv.appendChild(guessEl);
            resultDiv.appendChild(pointsEl);

            if (isRecorder) {
                const recorderScores = this.players
                    .filter(p => p.name !== player.name)
                    .map(p => this.roundScores[p.name] || 0);
                const totalBonus = recorderScores.reduce((sum, val) => sum + val, 0);
                const breakdown = recorderScores.length ? recorderScores.map(val => `+${val}`).join(' ') : '+0';
                const bonusEl = document.createElement('p');
                bonusEl.className = 'accuracy';
                bonusEl.textContent = `Bônus: ${breakdown} = ${totalBonus}`;
                resultDiv.appendChild(bonusEl);
            }
            resultsList.appendChild(resultDiv);
        });
        
        this.updateScoreboard();

        this.startResultsHold();
    }

    handleRequestRecord(payload) {
        this.currentVideoPlayer = { name: payload.player };
        if (this.currentRound < this.totalRounds) {
            this.currentRound += 1;
        }
        document.getElementById('currentRound').textContent = this.currentRound;
        document.getElementById('totalRounds').textContent = this.totalRounds;
        this.viewCount = 0;

        this.roundTotalsSnapshot = { ...this.scores };

        if (payload.player === this.playerName) {
            this.currentPhrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
            this.showRecordingPhase();
        } else {
            this.showWaitingPhase(`Aguardando ${payload.player} gravar o vídeo...`);
        }
    }

    computeRoundDeltas(totalScores) {
        const deltas = {};
        this.players.forEach(player => {
            const before = this.roundTotalsSnapshot[player.name] || 0;
            const after = totalScores[player.name] || 0;
            deltas[player.name] = Math.max(0, after - before);
        });
        return deltas;
    }

    startResultsHold() {
        this.resultsHoldActive = true;
        if (this.resultsHoldTimer) {
            clearTimeout(this.resultsHoldTimer);
            this.resultsHoldTimer = null;
        }
        if (this.resultsHoldInterval) {
            clearInterval(this.resultsHoldInterval);
            this.resultsHoldInterval = null;
        }

        const button = document.getElementById('continueGame');
        let remaining = 18;
        if (button) {
            button.disabled = true;
            button.textContent = `Próxima gravação em ${remaining}s`;
        }

        this.resultsHoldInterval = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) return;
            if (button) {
                button.textContent = `Próxima gravação em ${remaining}s`;
            }
        }, 1000);

        this.resultsHoldTimer = setTimeout(() => {
            if (this.resultsHoldInterval) {
                clearInterval(this.resultsHoldInterval);
                this.resultsHoldInterval = null;
            }
            this.resultsHoldActive = false;
            if (this.config.mockEnabled) {
                this.nextRound();
                return;
            }
            if (this.pendingGameOver) {
                this.scores = this.pendingGameOver;
                this.pendingGameOver = null;
                this.showFinalResults();
                this.startReturnLobbyCountdown(10);
                return;
            }
            if (this.pendingRequestRecord) {
                const pending = this.pendingRequestRecord;
                this.pendingRequestRecord = null;
                this.handleRequestRecord(pending);
                return;
            }
            if (button) {
                button.textContent = 'Aguardando próxima rodada...';
            }
        }, 18000);
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

        this.updateReturnLobbyLabel();
    }

    updateScoreboard() {
        const scoreboard = document.getElementById('scoreboardList');
        scoreboard.innerHTML = '';

        const playerCountEl = document.getElementById('gamePlayerCount');
        if (playerCountEl) {
            playerCountEl.textContent = this.players.length;
        }
        
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

    startReturnLobbyCountdown(seconds) {
        this.returnLobbySeconds = seconds;
        if (this.returnLobbyTimer) {
            clearInterval(this.returnLobbyTimer);
        }
        this.updateReturnLobbyLabel();
        this.returnLobbyTimer = setInterval(() => {
            this.returnLobbySeconds -= 1;
            if (this.returnLobbySeconds <= 0) {
                clearInterval(this.returnLobbyTimer);
                this.returnLobbyTimer = null;
                if (this.pendingReturnToLobby) {
                    this.pendingReturnToLobby = false;
                    this.resetForLobby();
                    this.showLobbyScreen();
                    this.updateLobby();
                }
                return;
            }
            this.updateReturnLobbyLabel();
        }, 1000);
    }

    updateReturnLobbyLabel() {
        const label = document.getElementById('returnLobbyLabel');
        if (!label) return;
        if (this.returnLobbySeconds > 0) {
            label.textContent = `Retornando ao lobby em ${this.returnLobbySeconds} segundos`;
        } else {
            label.textContent = '';
        }
    }

    resetForLobby() {
        if (this.returnLobbyTimer) {
            clearInterval(this.returnLobbyTimer);
            this.returnLobbyTimer = null;
        }
        if (this.resultsHoldTimer) {
            clearTimeout(this.resultsHoldTimer);
            this.resultsHoldTimer = null;
        }
        if (this.resultsHoldInterval) {
            clearInterval(this.resultsHoldInterval);
            this.resultsHoldInterval = null;
        }
        this.stopTurnTimer();
        this.stopGuessTimer();
        this.resultsHoldActive = false;
        this.pendingRequestRecord = null;
        this.pendingGameOver = null;
        this.pendingReturnToLobby = false;
        this.finalResultsActive = false;
        this.returnLobbySeconds = 0;
        this.currentRound = 0;
        this.totalRounds = 0;
        this.scores = {};
        this.currentPhrase = null;
        this.currentVideoPlayer = null;
        this.viewCount = 0;
        this.mockVideos = {};
        this.recordedChunks = [];
        this.recordedVideoBlob = null;

        const gameVideo = document.getElementById('gameVideo');
        if (gameVideo) {
            gameVideo.removeAttribute('src');
        }

        const preview = document.getElementById('recordPreview');
        if (preview && preview.srcObject) {
            preview.srcObject.getTracks().forEach(track => track.stop());
            preview.srcObject = null;
        }

        this.updateReturnLobbyLabel();
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
        this.pendingRequestRecord = null;
        this.pendingGameOver = null;
        this.pendingReturnToLobby = false;
        this.roundTotalsSnapshot = {};
        this.roundGuesses = {};
        this.roundScores = {};
        this.resultsHoldActive = false;
        this.guessingPhaseActive = false;
        this.finalResultsActive = false;
        this.turnTimeout = null;
        this.turnInterval = null;
        this.turnRemainingSeconds = 0;
        this.autoSubmitOnStop = false;
        this.stopGuessTimer();
        this.guessRemainingSeconds = 0;
        this.guessTimeout = null;
        this.guessInterval = null;
        this.guessRemainingSeconds = 0;
        this.autoPlayInProgress = false;
    }

    startGuessTimer() {
        this.stopGuessTimer();
        this.guessRemainingSeconds = Math.ceil(this.maxGuessMs / 1000);
        const timerEl = document.getElementById('guessTimer');
        if (timerEl) {
            timerEl.textContent = this.guessRemainingSeconds;
        }
        this.guessInterval = setInterval(() => {
            this.guessRemainingSeconds -= 1;
            if (timerEl) {
                timerEl.textContent = Math.max(this.guessRemainingSeconds, 0);
            }
            if (this.guessRemainingSeconds <= 0 && this.guessInterval) {
                clearInterval(this.guessInterval);
                this.guessInterval = null;
            }
        }, 1000);
        this.guessTimeout = setTimeout(() => this.handleGuessTimeout(), this.maxGuessMs);
    }

    stopGuessTimer() {
        if (this.guessTimeout) {
            clearTimeout(this.guessTimeout);
            this.guessTimeout = null;
        }
        if (this.guessInterval) {
            clearInterval(this.guessInterval);
            this.guessInterval = null;
        }
    }

    handleGuessTimeout() {
        this.submitGuess(true);
    }

    startTurnTimer() {
        this.stopTurnTimer();
        this.turnRemainingSeconds = Math.ceil(this.maxTurnMs / 1000);
        const timerEl = document.getElementById('recordingTimer');
        if (timerEl) {
            timerEl.textContent = this.turnRemainingSeconds;
        }
        this.turnInterval = setInterval(() => {
            this.turnRemainingSeconds -= 1;
            if (timerEl) {
                timerEl.textContent = Math.max(this.turnRemainingSeconds, 0);
            }
            if (this.turnRemainingSeconds <= 0 && this.turnInterval) {
                clearInterval(this.turnInterval);
                this.turnInterval = null;
            }
        }, 1000);
        this.turnTimeout = setTimeout(() => this.handleTurnTimeout(), this.maxTurnMs);
    }

    stopTurnTimer() {
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout);
            this.turnTimeout = null;
        }
        if (this.turnInterval) {
            clearInterval(this.turnInterval);
            this.turnInterval = null;
        }
    }

    handleTurnTimeout() {
        this.stopTurnTimer();
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.autoSubmitOnStop = true;
            this.stopRecording();
            return;
        }
        if (this.recordedVideoBlob && this.recordedVideoBlob.size > 0) {
            this.submitVideo();
            return;
        }
        this.handleNoVideo();
    }
}

const game = new LipReadingGame();
