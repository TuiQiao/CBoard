package org.cboard.web.server;

import org.cboard.web.server.jetty.JettyServer;

public class ServerFactory {
    private static final int DEFAULT_PORT = 80;
    private static final int DEFAULT_SCANINTERVALSECONDS = 5;

    private ServerFactory() {
    }

    public static IServer getServer(String webAppDir, int port, String context, int scanIntervalSeconds) {
        return new JettyServer(webAppDir, port, context, scanIntervalSeconds);
    }

    public static IServer getServer(String webAppDir) {
        return new JettyServer(webAppDir, 80, "/", 5);
    }
}
