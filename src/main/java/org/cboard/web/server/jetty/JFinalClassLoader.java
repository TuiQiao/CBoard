package org.cboard.web.server.jetty;

import java.io.File;
import java.io.IOException;
import org.eclipse.jetty.util.resource.Resource;
import org.eclipse.jetty.webapp.WebAppClassLoader;
import org.eclipse.jetty.webapp.WebAppContext;

class JFinalClassLoader extends WebAppClassLoader {
    private boolean initialized = false;

    public JFinalClassLoader(WebAppContext context, String classPath) throws IOException {
        super(context);
        if(classPath != null) {
            String[] tokens = classPath.split(String.valueOf(File.pathSeparatorChar));
            String[] arr$ = tokens;
            int len$ = tokens.length;

            for(int i$ = 0; i$ < len$; ++i$) {
                String entry = arr$[i$];
                String path = entry;
                if(entry.startsWith("-y-") || entry.startsWith("-n-")) {
                    path = entry.substring(3);
                }

                if(!entry.startsWith("-n-")) {
                    super.addClassPath(path);
                }
            }
        }

        this.initialized = true;
    }

    public Class loadClass(String name) throws ClassNotFoundException {
        try {
            return this.loadClass(name, false);
        } catch (NoClassDefFoundError var3) {
            throw new ClassNotFoundException(name);
        }
    }

    public void addClassPath(String classPath) throws IOException {
        if(!this.initialized || classPath.endsWith("WEB-INF/classes/")) {
            super.addClassPath(classPath);
        }
    }

    public void addJars(Resource jars) {
        if(!this.initialized) {
            super.addJars(jars);
        }
    }
}
