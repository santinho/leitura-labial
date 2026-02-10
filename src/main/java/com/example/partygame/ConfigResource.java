package com.example.partygame;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.HashMap;
import java.util.Map;

@Path("/api/config")
public class ConfigResource {
    @ConfigProperty(name = "game.mock-enabled", defaultValue = "false")
    boolean mockEnabled;

    @ConfigProperty(name = "game.min-players", defaultValue = "2")
    int minPlayers;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("mockEnabled", mockEnabled);
        config.put("minPlayers", minPlayers);
        return config;
    }
}
