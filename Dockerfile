FROM tomcat
RUN rm -rf /usr/local/tomcat/webapps/ROOT
ADD target/cboard.war /usr/local/tomcat/webapps/ROOT.war
