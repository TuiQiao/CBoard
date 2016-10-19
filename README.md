# CBoard
#### 一款**开放式**、**免费**BI Dashboard应用
项目底层采用Spring+MyBatis，前端基于AngularJS1和Bootstrap  

![image](https://cloud.githubusercontent.com/assets/6037522/19503349/9604c366-95e5-11e6-8318-2e53d2451019.png)  

# 截图
![SS](https://raw.githubusercontent.com/yzhang921/CloudResource/gif/gif/cboard/starter.png)


# Features Of CBoard
* 界面和图表美观大方，Bootstrap原生支持**移动端访问**
* 架构轻量级，核心代码简洁，整个项目没有依赖任何第三方多维分析工具
  * **CBoard**前端页面样式与布局基于[AdminLTE2](https://github.com/almasaeed2010/AdminLTE)
  * 图表插件使用[EChart](http://echarts.baidu.com/)
  * JS采用MVVM AngularJS1.X框架
* 交互、拖拽式类"OLAP"报表开发体验  
![wiget_overview](https://raw.githubusercontent.com/yzhang921/CloudResource/b460e7b7ed188bb3ea9ced5a9377bab1489c3982/gif/cboard/widget_design_overview.gif)
* 基于数据集的报表设计，一次数据集获取生成多张图表  
![image](https://cloud.githubusercontent.com/assets/6037522/19502570/70af928a-95e0-11e6-846e-5ae46dbb1b85.png)  
* OLAP切片过滤操作  
<img src="https://cloud.githubusercontent.com/assets/6037522/19502732/806b1086-95e1-11e6-940f-ab1a18bbff77.png" width="450">
* 全局查询缓存，避免多次请求重复的数据查询
* 支持常用图表与表格
  * 柱线图/堆叠柱线图、双轴图
  * 饼图
  * KPI Widget
  * 交叉表格
* 支持JDBC协议的各种数据产品
* 支持读取当今比较流行的开源多维分析产品Saiku2保存的报表、并定能选择性的制数据与图形
* 方便扩展实现自己的DataProvider连接任何数据源. 即便是昂贵的商业BI套件想要囊括大数据时代所有的数据源连接都是不可能做到的，在NoSQL领域中，传统观念中的Schema可以通过不同的数据结构来实现，如散列表、数组、树、图等等，不同的人使用相同的NoSQL产品设计出来的Schema都可能千差万别，最熟悉这种存储结构的是用户自己，让用户找一个Java程序员写个Class连接自己的数据源却很容易做到的, 为此我们把这种需求开放给用户自己实现，我们的愿景是让用户在CBoard大架构下轻松的接入自己的各种数据源。  
![image](https://cloud.githubusercontent.com/assets/6037522/19501689/1439ff8c-95da-11e6-9374-750eb6ad82fe.png)




## 项目构建
1 准备CBoard元数据库
```mysql
以MySQL为例
-- CREATE DATEBASE cboard;
执行元数据表创建脚本: sql/mysql/mysql.sql
```
2 修改元数据配置文件
```
CBoard\src\main\resources\config.properties
```
```pro
validationQuery=SELECT 1
jdbc_url=jdbc:mysql://localhost:3306/cboard
jdbc_username=root
jdbc_password=111111
```
3 Maven 编译打包
```
cd进入项目根目录
# Install SQLServer JDBC Driver into your local respository
mvn install:install-file -Dfile=lib\sqljdbc4-4.0.jar -DgroupId=com.microsoft.sqlserver -DartifactId=sqljdbc4 -Dversion=4.0 -Dpackaging=jar
mvn clean package
```
4 部署war到tomcat容器
 * 拷贝CBoard\target\cboard.war到tomcat的webapp目录，修改cboard.war名为ROOT.war，**以ROOT应用部署，否则应用会报错**
 * 启动tomcat

## 访问CBoard
```
http://_yourserverip_:8080
默认登录用户名密码: admin/root123
```


## 项目详细介绍与使用请移步[CBoard Wiki](https://github.com/yzhang921/CBoard/wiki)


## 联系我们
欢迎大家通过GitHub Issue系统反馈Bug与需求、提Pull Request
CBoard交流群讨论QQ群: 301028618
EMail: peter.zhang921@gmail.com, g.yuanyf@gmail.com
