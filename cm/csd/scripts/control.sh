#!/bin/bash

set -x

# Time marker for both stderr and stdout
date; date 1>&2

# Preference order:
# 1. CBOARD_HOME (set by default_env.sh in the CBoard parcel).
# 2. CDH_CBOARD_HOME (set by cdh_env.sh in the CDH parcel).
# 3. Hardcoded default value (where the Cloudera packages install CBoard).
DEFAULT_CBOARD_HOME=/usr/lib/cboard
CBOARD_HOME=${CBOARD_HOME:-$CDH_CBOARD_HOME}
CBOARD_HOME=${CBOARD_HOME:-$DEFAULT_CBOARD_HOME}

CBOARD_CONF_DIR="$CONF_DIR/cboard-conf"

# Which java to use
if [ -z "$JAVA_HOME" ]; then
  JAVA="java"
else
  JAVA="$JAVA_HOME/bin/java"
fi

# Memory options
if [ -z "$JAVA_HEAP_OPTS" ]; then
  if [ -z "$SERVER_MAX_HEAP_SIZE" ]; then
    JAVA_HEAP_OPTS="-Xms1024m -Xmx2048m"
  else
    JAVA_HEAP_OPTS="-Xmx$SERVER_MAX_HEAP_SIZE"
  fi
fi

# JVM performance options
if [ -z "$JAVA_JVM_PERFORMANCE_OPTS" ]; then
  JAVA_JVM_PERFORMANCE_OPTS="-server -XX:+UseG1GC -XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35 -XX:+DisableExplicitGC -Djava.awt.headless=true"
fi

CBOARD_WEBAPP_NAME=/cboard
CBOARD_WEBAPP_MAIN=org.cboard.web.WebApp
CBOARD_WEBAPP_DIR=$CBOARD_HOME/webapp
CBOARD_LIB_DIR=$CBOARD_HOME/lib/*
CBOARD_RESOURCE_DIR=$CBOARD_HOME/resources
CBOARD_INIT_MAIN=org.cboard.InitMetadata

WEBAPP_ARGS="$CBOARD_WEBAPP_MAIN $SERVER_WEB_PORT $CBOARD_WEBAPP_NAME $CBOARD_WEBAPP_DIR"
JAVA_OPTS="$JAVA $JAVA_HEAP_OPTS $JAVA_JVM_PERFORMANCE_OPTS"
JAVA_CP="-cp $CBOARD_CONF_DIR:$CBOARD_LIB_DIR:$CBOARD_RESOURCE_DIR"

CMD=$1

function log {
  timestamp=$(date)
  echo "$timestamp: $1"       #stdout
  echo "$timestamp: $1" 1>&2; #stderr
}

if [ "start" = "$CMD" ]; then
  log "Starting CBoard Server"
  exec $JAVA_OPTS $JAVA_CP $WEBAPP_ARGS
elif [ "init_metadata" = "$CMD" ]; then
  log "Initing CBoard Metadata"
  exec $JAVA_OPTS $JAVA_CP $CBOARD_INIT_MAIN
else
  log "Don't understand [$CMD]"
fi
