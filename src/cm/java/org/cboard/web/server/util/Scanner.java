package org.cboard.web.server.util;

import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

public abstract class Scanner {
    private Timer timer;
    private TimerTask task;
    private File rootDir;
    private int interval;
    private boolean running = false;
    private final Map<String, TimeSize> preScan = new HashMap();
    private final Map<String, TimeSize> curScan = new HashMap();

    public Scanner(String rootDir, int interval) {
        if(!StringUtils.hasLength(rootDir)) {
            throw new IllegalArgumentException("The parameter rootDir can not be blank.");
        } else {
            this.rootDir = new File(rootDir);
            if(!this.rootDir.isDirectory()) {
                throw new IllegalArgumentException("The directory " + rootDir + " is not exists.");
            } else if(interval <= 0) {
                throw new IllegalArgumentException("The parameter interval must more than zero.");
            } else {
                this.interval = interval;
            }
        }
    }

    public abstract void onChange();

    private void working() {
        this.scan(this.rootDir);
        this.compare();
        this.preScan.clear();
        this.preScan.putAll(this.curScan);
        this.curScan.clear();
    }

    private void scan(File file) {
        if(file != null && file.exists()) {
            if(file.isFile()) {
                try {
                    this.curScan.put(file.getCanonicalPath(), new TimeSize(file.lastModified(), file.length()));
                } catch (IOException var7) {
                    var7.printStackTrace();
                }
            } else if(file.isDirectory()) {
                File[] fs = file.listFiles();
                if(fs != null) {
                    File[] arr$ = fs;
                    int len$ = fs.length;

                    for(int i$ = 0; i$ < len$; ++i$) {
                        File f = arr$[i$];
                        this.scan(f);
                    }
                }
            }

        }
    }

    private void compare() {
        if(this.preScan.size() != 0) {
            if(!this.preScan.equals(this.curScan)) {
                this.onChange();
            }

        }
    }

    public void start() {
        if(!this.running) {
            this.timer = new Timer("JFinal-Scanner", true);
            this.task = new TimerTask() {
                public void run() {
                    Scanner.this.working();
                }
            };
            this.timer.schedule(this.task, 1010L * (long)this.interval, 1010L * (long)this.interval);
            this.running = true;
        }

    }

    public void stop() {
        if(this.running) {
            this.timer.cancel();
            this.task.cancel();
            this.running = false;
        }

    }
}
