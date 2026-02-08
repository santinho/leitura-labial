package com.example.partygame;

public class Message {
    public String type;
    public String payload;

    public Message() {}
    public Message(String type, String payload) { this.type = type; this.payload = payload; }

    public static Message of(String type, String payload) { return new Message(type, payload); }
}
