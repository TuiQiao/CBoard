package org.cboard.web.server.jetty;

import org.cboard.web.server.IServer;

import java.io.File;
import java.io.IOException;
import java.net.DatagramSocket;
import java.net.ServerSocket;
import java.util.logging.Logger;

import org.cboard.web.server.util.Scanner;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.SessionManager;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.server.session.HashSessionManager;
import org.eclipse.jetty.server.session.SessionHandler;
import org.eclipse.jetty.webapp.WebAppContext;
import org.springframework.util.StringUtils;

public class JettyServer implements IServer {
    private String webAppDir;
    private int port;
    private String context;
    private int scanIntervalSeconds;
    private boolean running = false;
    private Server server;
    private WebAppContext webApp;
    protected Logger logger = Logger.getLogger("JettyServer");

    public JettyServer(String webAppDir, int port, String context, int scanIntervalSeconds) {
        if(webAppDir == null) {
            throw new IllegalStateException("Invalid webAppDir of web server: " + webAppDir);
        } else if(port >= 0 && port <= 65536) {
            if(!StringUtils.hasLength(context)) {
                throw new IllegalStateException("Invalid context of web server: " + context);
            } else {
                this.webAppDir = webAppDir;
                this.port = port;
                this.context = context;
                this.scanIntervalSeconds = scanIntervalSeconds;
            }
        } else {
            throw new IllegalArgumentException("Invalid port of web server: " + port);
        }
    }

    public void start() {
        if(!this.running) {
            try {
                this.doStart();
            } catch (Exception var2) {
                var2.printStackTrace();
            }

            this.running = true;
        }

    }

    public void stop() {
        if(this.running) {
            try {
                this.server.stop();
            } catch (Exception var2) {
                var2.printStackTrace();
            }

            this.running = false;
        }

    }

    private String getRootClassPath() {
        String rootClassPath;
        try {
            String e = Thread.currentThread().getContextClassLoader().getResource("").toURI().getPath();
            rootClassPath = (new File(e)).getAbsolutePath();
        } catch (Exception var4) {
            String path = this.getClass().getClassLoader().getResource("").getPath();
            rootClassPath = (new File(path)).getAbsolutePath();
        }

        return ".";
    }

    private void doStart() {
        if(!available(this.port)) {
            throw new IllegalStateException("port: " + this.port + " already in use!");
        } else {
            this.deleteSessionData();
            this.logger.info("Starting http Server...");
            this.server = new Server();
            SelectChannelConnector connector = new SelectChannelConnector();
            connector.setPort(this.port);
            this.server.addConnector(connector);
            this.webApp = new WebAppContext();
            this.webApp.setContextPath(this.context);
            this.webApp.setResourceBase(this.webAppDir);
            this.webApp.setInitParameter("org.eclipse.jetty.servlet.Default.dirAllowed", "false");
            this.webApp.setInitParameter("org.eclipse.jetty.servlet.Default.useFileMappedBuffer", "false");
            this.persistSession(this.webApp);
            this.server.setHandler(this.webApp);
            this.changeClassLoader(this.webApp);
            if(this.scanIntervalSeconds > 0) {
                Scanner e = new Scanner(this.getRootClassPath(), this.scanIntervalSeconds) {
                    public void onChange() {
                        try {
                            System.err.println("\nLoading changes ......");
                            JettyServer.this.webApp.stop();
                            JFinalClassLoader e = new JFinalClassLoader(JettyServer.this.webApp, JettyServer.this.getClassPath());
                            JettyServer.this.webApp.setClassLoader(e);
                            JettyServer.this.webApp.start();
                            System.err.println("Loading complete.");
                        } catch (Exception var2) {
                            System.err.println("Error reconfiguring/restarting webapp after change in watched files");
                            var2.printStackTrace();
                        }

                    }
                };
                System.out.println("Starting scanner at interval of " + this.scanIntervalSeconds + " seconds.");
                e.start();
            }

            try {
                this.server.start();
                this.logger.info("Server running at http://0.0.0.0:" + this.port + this.context);
                this.server.join();
            } catch (Exception var3) {
                var3.printStackTrace();
                System.exit(100);
            }

        }
    }

    private void changeClassLoader(WebAppContext webApp) {
        try {
            String e = this.getClassPath();
            JFinalClassLoader wacl = new JFinalClassLoader(webApp, e);
            wacl.addClassPath(e);
        } catch (IOException var4) {
            var4.printStackTrace();
        }

    }

    private String getClassPath() {
        return System.getProperty("java.class.path");
    }

    private void deleteSessionData() {
        try {
            (new File(this.getStoreDir())).delete();
        } catch (Exception var2) {
            ;
        }

    }

    private String getStoreDir() {
        String storeDir = this.webAppDir + "/../session_data" + this.context;
        if("\\".equals(File.separator)) {
            storeDir = storeDir.replaceAll("/", "\\\\");
        }

        return storeDir;
    }

    private void persistSession(WebAppContext webApp) {
        String storeDir = this.getStoreDir();
        SessionManager sm = webApp.getSessionHandler().getSessionManager();
        if(sm instanceof HashSessionManager) {
            ((HashSessionManager)sm).setStoreDirectory(new File(storeDir));
        } else {
            HashSessionManager hsm = new HashSessionManager();
            hsm.setStoreDirectory(new File(storeDir));
            SessionHandler sh = new SessionHandler();
            sh.setSessionManager(hsm);
            webApp.setSessionHandler(sh);
        }
    }

    private static boolean available(int port) {
        if(port <= 0) {
            throw new IllegalArgumentException("Invalid start port: " + port);
        } else {
            ServerSocket ss = null;
            DatagramSocket ds = null;

            try {
                ss = new ServerSocket(port);
                ss.setReuseAddress(true);
                ds = new DatagramSocket(port);
                ds.setReuseAddress(true);
                boolean e = true;
                return e;
            } catch (IOException var13) {
                ;
            } finally {
                if(ds != null) {
                    ds.close();
                }

                if(ss != null) {
                    try {
                        ss.close();
                    } catch (IOException var12) {
                        ;
                    }
                }

            }

            return false;
        }
    }
}
