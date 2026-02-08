package com.example.partygame;

import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import jakarta.inject.Inject;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

@ServerEndpoint("/ws/game/{room}")
public class GameSocket {
    private static final Logger log = Logger.getLogger(GameSocket.class.getName());

    @Inject
    RoomManager manager;

    @OnOpen
    public void onOpen(Session session, @PathParam("room") String room) {
        manager.joinRoom(room, session);
    }

    @OnMessage
    public void onMessage(Session session, String message, @PathParam("room") String room) {
        // message is JSON; hand off to RoomManager
        manager.handleMessage(room, session, message);
    }

    @OnClose
    public void onClose(Session session, @PathParam("room") String room) {
        manager.leaveRoom(room, session);
    }

    @OnError
    public void onError(Session session, Throwable thr, @PathParam("room") String room) {
        log.log(Level.WARNING, "WebSocket error in room " + room, thr);
        try {
            session.close();
        } catch (IOException e) {
            log.log(Level.SEVERE, "Error closing session", e);
        }
    }
}
