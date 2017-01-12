# CBoard
#### An **open** BI Dashboard platform that supports **interactive** multi-dimensional report design and data analysis  
Server side framework is Spring+MyBatis and front-end is based on AngularJS1 and Bootstrap. The whole architecture graphic is as below:   

![image](https://cloud.githubusercontent.com/assets/6037522/19718976/654610b2-9b9a-11e6-8a19-97de7df42b5b.png)

# Screenshot
![image](https://cloud.githubusercontent.com/assets/6037522/21757656/0828c2d6-d66d-11e6-95c5-4d0cb2f6b5b1.png)

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
* One dataset, multiple report widgets. Maximize reuse query resoult. **But, the first and foremost survival rule in CBoard is make the dataset used in CBoard small using aggregate. Don't worry the source data can be very big. You don't need so many dimension in one chart**
<div align="center">
![image](https://cloud.githubusercontent.com/assets/6037522/20123306/429b8f8c-a659-11e6-9954-8f9352d3d9ef.png)
</div>
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
  * Cross-tabulation
  * China Map (中国地图, 下一个版本将会支持动态三级下钻, 敬请期待)
  * Other graphs is coming soon
* Support JDBC data connection
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

![image](https://cloud.githubusercontent.com/assets/6037522/21757747/4c5e8dae-d66e-11e6-994d-6725f3d08d1c.png)

## 中国用户可以访问百度网盘下载已经编译好的包
1 百度网盘地址 [http://pan.baidu.com/s/1slRKJCT](http://pan.baidu.com/s/1slRKJCT)
2 进入 0.2.1 目录，下面有两个文件
- cboard.war 这个war包只是单纯的对项目做了编译
- apache-tomcat-8.0.28-cboard.zip 捆绑了tomcat的包，需要更改一些元数据库连接配置，建立元数据表和库就可以直接运行了

3 元数据库Setup过程参考下面的英文文档2, 3步

## How to build project
Before the start, make sure you have setup environment:
- JDK version above 1.8
- MySQL
- Maven
- Tomcat
1 Download or git clone project
```
git clone https://github.com/yzhang921/CBoard.git
```
2 Install metadata of CBoard
```mysql
 take MySQL database as example
-- CREATE DATEBASE cboard;
Execute ddl to create metadata table: _sql/mysql/mysql.sql_
```
3 Modify metadata connection properties file according to your db environment  
```
CBoard/src/main/resources/config.properties
```
```pro
validationQuery=SELECT 1
jdbc_url=jdbc:mysql://localhost:3306/cboard
jdbc_username=root
jdbc_password=111111
```
4 Comile and package project with Maven
```
cd root path of CBoard
# Install SQLServer JDBC Driver into your local respository
mvn install:install-file -Dfile=lib/sqljdbc4-4.0.jar -DgroupId=com.microsoft.sqlserver -DartifactId=sqljdbc4 -Dversion=4.0 -Dpackaging=jar
mvn clean package
```

5 Deploy war to Tomcat application
 * Copy **CBoard/target/cboard.war** to **webapp** folder of Tomcat and rename cboard.war to ROOT.war, **Make sure deploy app as ROOT, Otherwise the application will not work**
 * Start up Tomcat

## Access CBoard
```
http://_yourserverip_:8080
Default login username and passwor: admin/root123
```

# Road Map
All tasks are listed in [Issue Page](https://github.com/yzhang921/CBoard/issues) group by milestone.
Also you can get our development status from [Project Page](https://github.com/yzhang921/CBoard/projects)


## For more detailed Chinese document [CBoard 中文文档](https://github.com/yzhang921/CBoard/wiki/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3)
## For more detailed English document [CBoard Wiki](https://github.com/yzhang921/CBoard/wiki/English-Document)



## Contact us
You can create any issue or requirements through the Issue system of github.  
If you like CBoard then use it, contribute to CBoard and **don't forget to star it** :star:  
Waiting for your Contribution and pull request!

CBoard QQ Group for Chinese: 301028618  
Email: peter.zhang921@gmail.com, g.yuanyf@gmail.com  
**Front-end question**：fine0830@outlook.com
