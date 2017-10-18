FROM centos:6.9

WORKDIR /root

RUN mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup \
    && curl -o /etc/yum.repos.d/CentOS6-Base-163.repo http://mirrors.163.com/.help/CentOS6-Base-163.repo \
    && yum clean all && yum makecache

RUN yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel wget vim

# Donwload resources
# local http resources
#RUN mkdir install \
#    && wget http://10.15.110.8/tomcat/apache-tomcat-8.5.23.tar.gz -P install \
#    && wget http://10.15.110.8/etc/phantomjs-2.1.1-linux-i686.tar.bz2 -P install

# remote download
RUN wget http://mirror.bit.edu.cn/apache/tomcat/tomcat-8/v8.5.23/bin/apache-tomcat-8.5.23-windows-x64.zip -P install \
    && wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-i686.tar.bz2 -P install

RUN tar -zxf install/apache-tomcat-8.5.23.tar.gz -C /opt \
    && tar -jxf install/phantomjs-2.1.1-linux-i686.tar.bz2 -C /opt \
    && ln -s /opt/apache-tomcat-8.5.23 /opt/apache-tomcat \
    && ln -s /opt/phantomjs-2.1.1-linux-i686 /opt/phantomjs-2.1.1

# install Chinese font
RUN yum install -y bitmap-fonts bitmap-fonts-cjk

# phantomjs requirements
RUN yum install -y glibc.i686 zlib.i686 fontconfig freetype freetype-devel fontconfig-devel libstdc++ libfreetype.so.6 libfontconfig.so.1 libstdc++.so.6

ADD cboard.war /opt/apache-tomcat/webapps/cboard.war

CMD ["/bin/bash"]

# docker build --network=host -t cboard .
# docker run --rm -itd --name=cboard -p 8026:8080 --privileged=true cboard