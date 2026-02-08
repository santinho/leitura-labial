# 🎬 Leitura Labial - Party Game

Um jogo multiplayer divertido onde os jogadores precisam adivinhar o que foi dito em vídeos sem áudio!

## 📝 Como Funciona

1. **Lobby**: Os jogadores entram em uma sala e aguardam o líder (primeiro jogador) iniciar o jogo
2. **Gravação**: Em cada rodada, um jogador é sorteado para gravar um vídeo falando uma frase aleatória
3. **Visualização**: Os outros jogadores assistem o vídeo SEM ÁUDIO 3 vezes
4. **Adivinhação**: Cada jogador digita o que acha que foi dito no vídeo
5. **Pontuação**: Quem se aproximar mais da frase correta ganha pontos proporcionais ao acerto
6. **Rodadas**: Todos os jogadores gravam um vídeo até o fim do jogo
7. **Vencedor**: Quem tiver mais pontos ao final vence!

## 🎮 Características

- Interface intuitiva e responsiva
- Suporte para múltiplos jogadores
- Sistema de pontuação baseado em acurácia
- Gravação de vídeo com câmera (ou modo simulado)
- WebSocket mockado para simular funcionalidade multiplayer

## 🚀 Tecnologias

### Backend (Estrutura preparada)
- Java 17+
- Quarkus Framework
- WebSocket (preparado para implementação futura)

### Frontend
- HTML5
- CSS3
- JavaScript ES6+
- MediaRecorder API para gravação de vídeo

## 🏃 Como Executar

### Modo de Desenvolvimento

```bash
./mvnw compile quarkus:dev
```

Acesse: http://localhost:8080

### Build para Produção

```bash
./mvnw package
java -jar target/quarkus-app/quarkus-run.jar
```

## 🎯 Funcionalidades Implementadas

### Frontend (100% Funcional com Mock)
- ✅ Tela de login
- ✅ Criação e entrada em salas
- ✅ Lobby de espera
- ✅ Sistema de liderança
- ✅ Gravação de vídeo
- ✅ Visualização de vídeos
- ✅ Sistema de tentativas (3 visualizações)
- ✅ Entrada de palpites
- ✅ Cálculo de pontuação
- ✅ Placar em tempo real
- ✅ Resultados por rodada
- ✅ Tela de resultado final
- ✅ WebSocket mockado

### Backend (Preparado para Implementação)
- ⏳ WebSocket endpoints
- ⏳ Gerenciamento de salas
- ⏳ Sincronização de jogadores
- ⏳ Processamento de vídeos
- ⏳ Remoção de áudio dos vídeos
- ⏳ Armazenamento temporário

## 📱 Modo Mock

O jogo atualmente funciona em modo **mock** (simulado), o que significa:

- Não há comunicação real com servidor
- Jogadores adicionais são simulados automaticamente
- As respostas dos outros jogadores são geradas aleatoriamente
- Perfeito para testar e demonstrar o fluxo do jogo
- Funciona completamente offline

## 🔮 Próximos Passos

Para implementar o backend real em Quarkus:

1. Criar endpoints WebSocket para gerenciamento de salas
2. Implementar lógica de sincronização entre jogadores
3. Adicionar processamento de vídeos (upload e remoção de áudio)
4. Implementar armazenamento temporário (Redis ou similar)
5. Adicionar sistema de persistência para histórico
6. Implementar chat em tempo real
7. Adicionar sistema de ranking global

## 📄 Licença

Este projeto é de código aberto.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
