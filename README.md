# CBoard
#### An **open** BI Dashboard platform that supports **interactive** multi-dimensional report design and data analysis  
Server side framework is Spring+MyBatis and front-end is based on AngularJS1 and Bootstrap. The whole architecture graphic is as below:   

![image](https://yzhang921.gitbooks.io/cboard-git-book/assets/arch.png)

# Screenshot
![image](https://yzhang921.gitbooks.io/cboard-git-book/content/assets/cboard_snapshot.png)

# Near Realtime data refresh  
**Be attention, refresh level is cube level rather than whole dashboard **
![realtime_demo](https://raw.githubusercontent.com/yzhang921/CloudResource/gif/gif/cboard/realtime_dashboard.gif)

# Features Of CBoard
* Simple and beautiful interface and layout
* Lightweight architecture and concise source code, the entire project does not rely on any third-party multi-dimensional analysis tools  
  * Front page style and layout of CBoard is based on [AdminLTE2](https://github.com/almasaeed2010/AdminLTE)  
  * The chart plugin uses [ECharts](http://echarts.baidu.com/)
  * Javascript uses MVVM AngularJS 1.X framework  
* Interactive, drag-and-drop **OLAP** classisc report development experience  
* One dataset, multiple report widgets. Maximize reuse query resoult
* Supports OLAP slice filter operation
* Supports sort multiple columns/rows at the sametime
* Global query cache, to avoid repeated query requests for data
* Support common charts and cross tables
  * Columnar/Stacked vertical and horizontal bar and line mixed chart with dual axis view
  * Pie chart
  * Radar Chart
  * Sanky Chart
  * Funnel Chart
  * KPI Widget
  * Cross-tabulation (Support Drill Down/Roll Up)
  * China Map
  * Bubble Chart
* Support JDBC data connection
* Support Native Elasticsearch connection for version 1.x, 2.x, 5.x
* Support Native Kylin connection for version 1.6
* Support to connect one of the most popular open source multi-dimensional analysis of products **Saiku2**, and will be able to selectively create data and graphics
* Cube level data refresh / realtime chart for quick query
* Easy to implement your own **DataProvider** to connect any data source. Even for expensive commercial BI suite, it's not possible to connect all the NOSQL and NewSQL data source in the era of big data. Due to the schema of NOSQL are various, such as hash tables, arrays, trees, maps, etc., different people using the same NoSQL products designed Schema may vary widely. The user who most familiar with their storage schema are the user themselves. And it's easy to find a Java programmers to code a Class to connect their own data source. So we leave this part of work to the end user with an easy extended data connection framework in CBoard

<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/6037522/19501689/1439ff8c-95da-11e6-9374-750eb6ad82fe.png" width="450">
</div>

## Demo (Click pics for full screen demo!)  
|Load Data from query or DataSet | Basic Operation |
| :-----------: | :------: |
| ![case 0-switchdataload](https://cloud.githubusercontent.com/assets/6037522/21477518/9a874210-cb7d-11e6-9b7e-11721aac322c.gif)       | ![case 1-](https://cloud.githubusercontent.com/assets/6037522/21477521/9c2ead88-cb7d-11e6-9ae4-4c1990f675c2.gif)   |

| Switch Chart Type | Calculated Measure |
| :-----------: | :------: |
| ![case2](https://cloud.githubusercontent.com/assets/6037522/21477522/9de976b2-cb7d-11e6-8217-4290e5ad039b.gif)       | ![case 3-calculatedmeasures 1](https://cloud.githubusercontent.com/assets/6037522/21477523/9f3be54a-cb7d-11e6-882b-ef82bbb5100b.gif)  |

| Add Dashboard Parameters | Use Parameters |
| :-----------: | :------: |
| ![case4-addboardparam](https://cloud.githubusercontent.com/assets/6037522/21478022/74216f2e-cb82-11e6-9612-390a2f93184c.gif)  | ![case4-useparam](https://cloud.githubusercontent.com/assets/6037522/21478021/73f81fe8-cb82-11e6-95ea-d98b43a4abf2.gif)|

## Access Control  
**RBAC** (Role Based Access Control), easy admin and view your users' role and roles' access resource list in one page.  
- Grant roles to user by left **Grant** button.
- Grant access resource to a role by right **Grant** button.
- Resource can only be granted to role. A user can act as more than one roles.

![image](https://yzhang921.gitbooks.io/cboard-git-book/content/assets/UserAdmin_Snap.png)


# Quick start
## Quick Start from docker
We provide a docker image build on centos6 with a sample dataset in it.
```bash
docker pull peterzhang921/cboard:0.4.1
docker run --rm -itd --name=cboard -p 8026:8080 --privileged=true peterzhang921/cboard:0.4.1

# after docker container is start then attach into it and start tomcat server
docker attach cboard
/opt/apache-tomcat/bin/startup.sh

# wait after server successfully started
tail -f /opt/apache-tomcat/logs/catalina.out
```

### Acccess cboard with url http://docker-hostip:8026/cboard

- username: admin , password: root123
- There is no prepared charts and dashboard in it
- Meta data of CBoard is stotred in embedded DB H2 with file storage, user can change or add your own configuration by yourself then build project and docker image again
  - how to rebuild docker
  ```bash
  # use configuration files in h2 folder, use env parameter then all the files in h2 folder will overwrite same files in resource folder
  maven clean package -Denv=h2
  # build docker image
  docker build --network=host -t cboard .
  ```

# Build project by yourself
## Prerequisite
Before the start, make sure you have setup environment:
- JDK version above 1.8
- MySQL
- Maven
- Tomcat
- Phantomjs (for export dashbaord)
- Mail Servier

## How to build project
- 1 Download or git clone project
```
git clone https://github.com/yzhang921/CBoard.git
```
- 2 Install metadata of CBoard (take MySQL database as example)  
    - 2.1 Install demo metadata and sample foodmart db
        - Download [cboard_demo & foodmart](https://www.dropbox.com/sh/zhgysm4ewandmwl/AADC4oPwn34vHv39AJMGzhyia?dl=0)
        - Enter into the path of these two files
        - Use MySQL Command Line tool login and execute
        ```
            source cboard_demo.sql
            source foodmart.sql
        ```
        - After success completed, check if cboard_demo2 and foodmart2 databases have been created
    - 2.2 You can alternative choose start from a blank setting
        ```mysql
            -- CREATE DATEBASE cboard;
            Execute ddl to create metadata table: sql/mysql/mysql.sql
        ```
- 3 Modify metadata connection properties file according to your db environment  
  ```
  CBoard/src/main/resources/config.properties
  ```

  ```pro
  validationQuery=SELECT 1
  jdbc_url=jdbc:mysql://localhost:3306/cboard # set to your metadata db connection url, if you are using demo db, change db name to cboard_demo2
  jdbc_username=root # change to the username/password of your db
  jdbc_password=111111

  # Service configuration
  dataprovider.resultLimit=300000
  admin_user_id=1
  phantomjs_path=D:/phantomjs-2.1.1-windows/bin/phantomjs.exe  # change to the install path of your phantomjs
  web_port=8026 #
  web_context=  # web context name of your app, can be blank for ROOT deploy

  # configuration of Mail service
  mail.smtp.host=127.0.0.1
  mail.smtp.port=8825
  mail.smtp.from=test@test.com
  #mail.smtp.username=test@test.com
  #mail.smtp.password=111111
  #mail.smtp.ssl.checkserveridentity=false

  # Cache Properties if you wanna use redis as cache layer
  cache.redis.hostName=127.0.0.1
  cache.redis.port=6379
  ```

- 4 Comile and package project with Maven
  ```
  cd root path of CBoard
  # Install SQLServer JDBC Driver into your local respository
  mvn install:install-file -Dfile=lib/sqljdbc4-4.0.jar -DgroupId=com.microsoft.sqlserver -DartifactId=sqljdbc4 -Dversion=4.0 -Dpackaging=jar
  mvn clean package
  ```

- 5 Deploy war to Tomcat application
 * Copy **CBoard/target/cboard.war** to **webapp** folder of Tomcat and rename cboard.war would be better to change name to ROOT.war
 * Start up Tomcat

- 6 Access CBoard
```
http://_yourserverip_:8080
Default login username and passwor: admin/root123
```

- 7 For Demo DB user, check and test the source of foodmart
![](https://yzhang921.gitbooks.io/cboard-git-book/content/assets/demo_datasource.png)

# Road Map
All tasks are listed in [Issue Page](https://github.com/yzhang921/CBoard/issues) group by milestone.
Also you can get our development status from [Project Page](https://github.com/yzhang921/CBoard/projects)


## For more detailed Chinese document [CBoard 中文文档](https://www.gitbook.com/book/yzhang921/cboard-git-book/details)
## For more detailed English document [CBoard Wiki](https://github.com/yzhang921/CBoard/wiki/English-Document)


## Contact us
You can create any issue or requirements through the Issue system of github.  
If you like CBoard then use it, contribute to CBoard and **don't forget to star it** :star:  
Waiting for your Contribution and pull request!


# Let us kown you are using CBoard
If your company is using CBoard or prepare to use it, please let us known.
You can check in at this issue page [https://github.com/yzhang921/CBoard/issues/122](https://github.com/yzhang921/CBoard/issues/122)

# Donate (请我们喝咖啡)
![image](https://cloud.githubusercontent.com/assets/6037522/26662085/3eb1f00e-46b4-11e7-900f-77d9b1499f6b.png)


# 相关博文推荐
  [Gitbook文档](https://yzhang921.gitbooks.io/cboard-git-book/content/)
  [villare关于CBoard二次开发的总结](http://blog.csdn.net/villare/article/category/7039297)

# 中国用户QQ交流群（301028618）进群须知
  - 很久很久以前，为了方便CBoard使用者之间沟通，我们一直有一个QQ群，可是沟通效果非常不理想
    - CBoard在数据分析领域的简单、实用、性能方面的特点毋庸置疑，引来了一大批入群者，**短短几个月时间入群人数突破300，登记在册大小企业用户近30余家**，如果贵司正在实用CBoard也请[告诉我们](https://github.com/yzhang921/CBoard/issues/122)
    - 可是99%QQ交流群用户都是僵尸用户，从不发言
    - 偶尔发言也只是单纯的为了找我们解决问题（**甚至大部分问题在使用文档里面有详细说明**），而且当其他人遇到类似问题的时候被帮助过的人却很少站出来互相帮助
    - 其结果就是我一遍遍的回答着用户同样的问题，无奈之下我们暂停了接纳新用户入群
    - 请记住QQ交流群里面的内容是不能检索的，有价值的问题请尽量在[GitHub的Issue系统](https://github.com/yzhang921/CBoard/issues)里面开一个主题存档（GitHub里面关闭和非关闭状态的Issue都是可以检索的）
  - 重启交流群须知
    - 用户交流群是为方便CBoard使用者之间进行沟通，请注意**不是答疑群，请大家能够尽量互相帮助**
    - CBoard只是我们的一个业余项目，我们有自己的日常工作，没有时间一直盯着群里面每个人的发言和问题，开源是为了方便有相同需求的企业，避免大家重复造轮，为行业做一点微薄的贡献
    - 管理员会定义清理最近3个月不曾发言的僵尸用户
    - 有使用方面的问题请先仔细阅读阅档，尝试在文档中找答案
    - 在Issue系统里面搜索看看是否有类似问题
    - 确定是程序上的bug请再GitHub issue系统里面[创建新的issue](https://github.com/yzhang921/CBoard/issues/new)， 参照如何真确提问创建Issue主题
        - What steps will reproduce the problem?（该问题的重现步骤是什么？）
        - What is the expected output? What do you see instead?（你期待的结果是什么？实际看到的又是什么？）
        - What version of the product are you using? On what operating system?（你正在使用产品的哪个版本？在什么操作系统上？）
        - Please provide any additional information below.（如果有的话，请在下面提供更多信息。）
    - 最后喊个口号，开源项目的健康发展需要大家共同的努力，“众人拾柴火焰高”，“人人为我，我为人人”，让我们共同努力打造一个免费好用的开源分析平台