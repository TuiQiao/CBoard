package org.cboard.web;

import org.cboard.web.server.IServer;
import org.cboard.web.server.ServerFactory;

public class WebApp {
    public WebApp() {
    }

    public static void main(String[] args) {
        int port = 9080;
        if(args.length > 0) {
            port = Integer.parseInt(args[0]);
        }

        String ctxPath = "/";
        if(args.length > 1) {
            ctxPath = args[1];
        }

        String webAppDir = "./web";
        if(args.length > 2) {
            webAppDir = args[2];
        }

        IServer server = ServerFactory.getServer(webAppDir, port, ctxPath, 0);
        server.start();
    }
}
