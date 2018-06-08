#!/bin/bash

if [ -z "$CBOARD_HOME" ]; then
  export CBOARD_HOME="$(cd "`dirname "$0"`"/..; pwd)"
fi

PORT=9080
NAME=cboard
WEBAPP_MAIN=org.cboard.web.WebApp
WEBAPP_DIR=$CBOARD_HOME/webapp
LIB_DIR=$CBOARD_HOME/lib/*
CONF_DIR=$CBOARD_HOME/conf
RESOURCES_DIR=$CBOARD_HOME/resources
INIT_MAIN=org.cboard.InitMetadata

# Which java to use
if [ -z "$JAVA_HOME" ]; then
  JAVA="java"
else
  JAVA="$JAVA_HOME/bin/java"
fi

# Memory options
if [ -z "$JAVA_HEAP_OPTS" ]; then
  JAVA_HEAP_OPTS="-Xms1024m -Xmx2048m"
fi

# JVM performance options
if [ -z "$JAVA_JVM_PERFORMANCE_OPTS" ]; then
  JAVA_JVM_PERFORMANCE_OPTS="-server -XX:+UseG1GC -XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35 -XX:+DisableExplicitGC -Djava.awt.headless=true"
fi

psid=0

checkpid(){
	javaps=`ps -ef | grep java | grep $WEBAPP_MAIN | grep $NAME`
	if [ -n "$javaps" ]; then
		psid=`echo $javaps | awk '{print $2}'`
	else
		psid=0
	fi
}

start(){
	checkpid

	if [ $psid -ne 0 ]; then
		echo "============================================================"
		echo "WARN: $NAME already started!(pid=$psid)"
		echo "============================================================"
	else
		echo -n "Starting $NAME ...."
		nohup $JAVA $JAVA_HEAP_OPTS $JAVA_JVM_PERFORMANCE_OPTS -cp $CONF_DIR:$LIB_DIR:$RESOURCES_DIR $WEBAPP_MAIN $PORT /$NAME $WEBAPP_DIR >/dev/null 2>&1 &
		#$JAVA $JAVA_HEAP_OPTS $JAVA_JVM_PERFORMANCE_OPTS -cp $CONF_DIR:$LIB_DIR:$RESOURCES_DIR $WEBAPP_MAIN $PORT /$NAME $WEBAPP_DIR

		checkpid

		if [ $psid -ne 0 ]; then
			echo "(pid=$psid)[ok]"
		else
			echo "[failed]"
		fi
	fi
}

stop(){
	checkpid

	if [ $psid -ne 0 ]; then
		echo -n "Stopping $NAME ....(pid=$psid)"
		#su - $RUNNING_USER -c "kill -9 $psid"
		kill -9 $psid

		if [ $? -eq 0 ]; then
			echo "[ok]"
		else
			echo "[failed]"
		fi

		checkpid

		if [ $psid -ne 0 ]; then
			stop
		fi

	else
		echo "============================================================"
		echo "WARN: $NAME is not running"
		echo "============================================================"
	fi
}

status(){
	checkpid

	if [ $psid -ne 0 ]; then
		echo "$NAME (pid  $psid) is running..."
	else
		echo "$NAME is stopping..."
	fi
}

init(){
    echo -n "Initing $NAME Metadata ...."
    $JAVA $JAVA_HEAP_OPTS $JAVA_JVM_PERFORMANCE_OPTS -cp $CONF_DIR:$LIB_DIR:$RESOURCES_DIR $INIT_MAIN
}

case "$1" in
	'start')
	start
	;;
	'stop')
	stop
	;;
	'status')
	status
	;;
    'init')
    init
    ;;
	*)

echo "usage: $0 {start|stop|status|init}"
exit 1
esac
exit 0