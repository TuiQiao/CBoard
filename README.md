# CBoard
#### 一款**开放式**、**免费**BI Dashboard应用
项目底层采用Spring+MyBatis，前端基于AngularJS1和Bootstrap  

![SS](https://raw.githubusercontent.com/yzhang921/CloudResource/gif/gif/cboard/starter.png)

# Features Of CBoard
* 界面和图表美观大方，Bootstrap原生支持**移动端访问**
* 轻量级架构，核心代码简洁，整个项目没有依赖任何第三方多维分析工具
  * **CBoard**前端页面样式与布局基于[AdminLTE2](https://github.com/almasaeed2010/AdminLTE)
  * 图表插件使用[EChart](http://echarts.baidu.com/)
  * JS采用AngularJSMVC框架
* 交互、拖拽式类"OLAP"报表开发体验
* 支持常用图表与表格
  * 柱线图/堆叠柱线图、双轴图
  * 饼图
  * KPI Widget
  * 交叉表格
* 支持JDBC协议的各种数据产品
* 支持读取当今比较流行的开源多维分析产品Saiku2保存的报表、并定能选择性的制数据与图形
* 方便扩展实现自己的DataProvider连接任何数据源

![wiget_overview](https://raw.githubusercontent.com/yzhang921/CloudResource/b460e7b7ed188bb3ea9ced5a9377bab1489c3982/gif/cboard/widget_design_overview.gif)

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

