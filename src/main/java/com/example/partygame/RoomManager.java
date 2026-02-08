package com.example.partygame;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class RoomManager {
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();

    @ConfigProperty(name = "game.min-players", defaultValue = "2")
    int minPlayers;

    public void joinRoom(String roomId, Session session) {
        Room room = rooms.computeIfAbsent(roomId, Room::new);
        room.addPlayer(session);
        room.sendRoster(minPlayers);
    }

    public void leaveRoom(String roomId, Session session) {
        Room room = rooms.get(roomId);
        if (room == null) return;
        room.removePlayer(session);
        if (room.isEmpty()) {
            rooms.remove(roomId);
            return;
        }
        room.sendRoster(minPlayers);
    }

    public void handleMessage(String roomId, Session session, String messageJson) {
        try {
            Message msg = mapper.readValue(messageJson, Message.class);
            Room room = rooms.get(roomId);
            if (room == null) return;
            switch (msg.type) {
                case "setName": {
                    String name = mapper.readTree(msg.payload).get("name").asText();
                    room.setPlayerName(session, name);
                    room.sendRoster(minPlayers);
                    break;
                }
                case "start": {
                    String error = room.startGame(session, minPlayers);
                    if (error != null) {
                        room.sendTo(session, Message.of("error", "{\"message\":\"" + error + "\"}"));
                        return;
                    }
                    room.sendToAll(Message.of("gameStarted", "{}"));
                    room.requestNextRecorder();
                    break;
                }
                case "uploadVideo":
                    room.handleUpload(session, msg.payload);
                    break;
                case "submitGuess":
                    room.handleGuess(session, msg.payload);
                    break;
                default:
                    break;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static class Room {
        final String id;
        final Map<Session, Player> players = new ConcurrentHashMap<>();
        final List<Session> joinOrder = Collections.synchronizedList(new ArrayList<>());
        final Queue<Session> turnQueue = new LinkedList<>();

        boolean gameStarted = false;
        Session currentRecorderSession = null;
        String currentPhrase = null;
        final Map<Session, List<Guess>> guesses = new ConcurrentHashMap<>();

        Room(String id) { this.id = id; }

        void addPlayer(Session session) {
            if (players.containsKey(session)) return;
            String name = "Player" + (players.size() + 1);
            boolean leader = players.isEmpty();
            Player player = new Player(name, leader);
            players.put(session, player);
            joinOrder.add(session);
        }

        void removePlayer(Session session) {
            Player removed = players.remove(session);
            joinOrder.remove(session);
            if (removed != null && removed.isLeader) {
                promoteNextLeader();
            }
        }

        boolean isEmpty() { return players.isEmpty(); }

        void setPlayerName(Session session, String desiredName) {
            Player player = players.get(session);
            if (player == null) return;
            String unique = ensureUniqueName(desiredName, session);
            player.name = unique;
        }

        String ensureUniqueName(String name, Session session) {
            String base = name == null || name.trim().isEmpty() ? "Player" : name.trim();
            String candidate = base;
            int i = 2;
            while (nameExists(candidate, session)) {
                candidate = base + "-" + i;
                i++;
            }
            return candidate;
        }

        boolean nameExists(String name, Session session) {
            for (Map.Entry<Session, Player> entry : players.entrySet()) {
                if (entry.getKey() == session) continue;
                if (entry.getValue().name.equalsIgnoreCase(name)) return true;
            }
            return false;
        }

        void promoteNextLeader() {
            for (Session session : joinOrder) {
                Player player = players.get(session);
                if (player != null) {
                    player.isLeader = true;
                    break;
                }
            }
        }

        void sendRoster(int minPlayers) {
            try {
                List<Map<String, Object>> list = new ArrayList<>();
                String leaderName = null;
                for (Player player : players.values()) {
                    Map<String, Object> p = new HashMap<>();
                    p.put("name", player.name);
                    p.put("isLeader", player.isLeader);
                    if (player.isLeader) leaderName = player.name;
                    list.add(p);
                }
                Map<String, Object> payload = new HashMap<>();
                payload.put("players", list);
                payload.put("leader", leaderName);
                payload.put("count", players.size());
                payload.put("minPlayers", minPlayers);
                sendToAll(Message.of("roster", new ObjectMapper().writeValueAsString(payload)));
            } catch (Exception ignored) {}
        }

        String startGame(Session session, int minPlayers) {
            Player player = players.get(session);
            if (player == null || !player.isLeader) return "Somente o líder pode iniciar o jogo.";
            if (players.size() < minPlayers) return "É necessário pelo menos " + minPlayers + " jogadores.";
            if (gameStarted) return null;

            gameStarted = true;
            turnQueue.clear();
            synchronized (joinOrder) {
                turnQueue.addAll(joinOrder);
            }
            return null;
        }

        void requestNextRecorder() {
            Session next = turnQueue.poll();
            if (next == null) {
                sendToAll(Message.of("gameOver", scoresJson()));
                return;
            }
            currentRecorderSession = next;
            Player player = players.get(next);
            String name = player != null ? player.name : "Jogador";
            sendToAll(Message.of("requestRecord", "{\"player\":\"" + name + "\"}"));
        }

        void handleUpload(Session session, String payloadJson) {
            try {
                Map<String, String> p = new ObjectMapper().readValue(payloadJson, Map.class);
                String phrase = p.get("phrase");
                currentPhrase = phrase;
                String videoData = p.get("videoData");
                Player player = players.get(session);
                if (player == null) return;

                Map<String, String> videoInfo = new HashMap<>();
                videoInfo.put("videoData", videoData);
                videoInfo.put("player", player.name);
                sendToAll(Message.of("videoAvailable", new ObjectMapper().writeValueAsString(videoInfo)));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        void handleGuess(Session session, String payloadJson) {
            try {
                if (session == currentRecorderSession) return;
                Map<String, String> p = new ObjectMapper().readValue(payloadJson, Map.class);
                Player guesser = players.get(session);
                String guess = p.get("guess");
                if (currentRecorderSession == null || guesser == null) return;

                guesses.computeIfAbsent(currentRecorderSession, k -> Collections.synchronizedList(new ArrayList<>()))
                        .add(new Guess(guesser.name, guess));

                Map<String, String> guessInfo = new HashMap<>();
                guessInfo.put("playerName", guesser.name);
                guessInfo.put("guess", guess);
                sendToAll(Message.of("guessReceived", new ObjectMapper().writeValueAsString(guessInfo)));

                int expected = Math.max(0, players.size() - 1);
                if (guesses.get(currentRecorderSession).size() >= expected) {
                    scoreRound(currentRecorderSession);
                    guesses.remove(currentRecorderSession);
                    requestNextRecorder();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        void scoreRound(Session recorderSession) {
            List<Guess> list = guesses.getOrDefault(recorderSession, Collections.emptyList());
            String correct = currentPhrase != null ? currentPhrase : "";

            Map<String, Integer> roundScores = new HashMap<>();
            for (Guess entry : list) {
                int score = calculateSimilarity(correct.toLowerCase(), entry.guess.toLowerCase());
                roundScores.put(entry.playerName, score);
                for (Player player : players.values()) {
                    if (player.name.equals(entry.playerName)) {
                        player.score += score;
                        break;
                    }
                }
            }

            Player recorder = players.get(recorderSession);
            int recorderBonus = roundScores.values().stream().mapToInt(Integer::intValue).sum() / 10;
            if (recorder != null) recorder.score += recorderBonus;

            try {
                Map<String, Object> result = new HashMap<>();
                result.put("scores", scoresMap());
                result.put("phrase", correct);
                result.put("roundScores", roundScores);
                sendToAll(Message.of("roundComplete", new ObjectMapper().writeValueAsString(result)));
            } catch (Exception ignored) {}
        }

        int calculateSimilarity(String correct, String guess) {
            if (correct.equals(guess)) return 100;
            String[] correctWords = correct.split("\\s+");
            String[] guessWords = guess.split("\\s+");

            int matches = 0;
            for (String cw : correctWords) {
                for (String gw : guessWords) {
                    if (cw.equals(gw)) {
                        matches++;
                        break;
                    }
                }
            }
            return Math.min(100, (int) ((matches / (double) correctWords.length) * 100));
        }

        String scoresJson() {
            try { return new ObjectMapper().writeValueAsString(scoresMap()); }
            catch (Exception e) { return "{}"; }
        }

        Map<String, Integer> scoresMap() {
            Map<String, Integer> map = new HashMap<>();
            for (Player player : players.values()) {
                map.put(player.name, player.score);
            }
            return map;
        }

        void sendTo(Session session, Message m) {
            try {
                String json = new ObjectMapper().writeValueAsString(m);
                session.getBasicRemote().sendText(json);
            } catch (Exception ignored) {}
        }

        void sendToAll(Message m) {
            String json;
            try { json = new ObjectMapper().writeValueAsString(m); }
            catch (Exception e) { return; }
            for (Session session : players.keySet()) {
                try { session.getBasicRemote().sendText(json); } catch (IOException ignored) {}
            }
        }
    }

    private static class Player {
        String name;
        boolean isLeader;
        int score = 0;

        Player(String name, boolean isLeader) {
            this.name = name;
            this.isLeader = isLeader;
        }
    }

    private static class Guess {
        final String playerName;
        final String guess;

        Guess(String playerName, String guess) {
            this.playerName = playerName;
            this.guess = guess;
        }
    }
}
