## CBoard
CBoard is not only a analysis platform that supports interactive multi-dimensional report design and data analysis for user, but also a BI product development platform for developer.
Powered by [Shanhai Chuguo Information and Technology Co., Ltd.](http://www.chuguotech.com/)
- **Normal User** can analysis your data or design a report by simple drag and drop operation
- **Developer** can extend any type of your data datasource that you can connect by Java program

<div style="text-align:center">
  <img class="img-responsive" src="https://user-images.githubusercontent.com/6037522/42865027-ef625120-8a9a-11e8-9982-50630902d263.png"  />
</div>

## Who is using CBoard
If you wish your company's logo show on our home page, please [sign in here](https://github.com/TuiQiao/CBoard/issues/122) provide a logo pic with transparent background
<div style="text-align:center">
  <img class="img-responsive" src="https://user-images.githubusercontent.com/6037522/42865039-fd217ad4-8a9a-11e8-9762-d6ded70dc843.png"  />
</div>

## Architecture
Light weight architecture, common technology stack, **self designed multi-dimension engine**, clear optimization rule, small application running on your big data stack!
<div style="text-align:center">
  <img class="img-responsive" src="https://user-images.githubusercontent.com/6037522/42865071-0c268402-8a9b-11e8-81b3-53fe8020bb17.png"  />
</div>


## Features

* Simple and beautiful interface and layout
* Interactive, drag-and-drop OLAP classisc report development experience
* One dataset, multiple report widgets. Maximize reuse query result
* Cube level data refresh / realtime chart for quick query
* Role Based Access Control
* More than 20 chart types and dashboard insight or email report
* Multiple types data source connection
  * Support JDBC data connection (Almost all kinds database that has implemented JDBC protocal)
  * Support Native Elasticsearch connection for version 1.x, 2.x, 5.x
  * Support Native Kylin connection for version 1.6
* Lightweight architecture and concise source code, the entire project does not rely on any third-party multi-dimensional analysis tools, if you are struggling in Mondrain, CBoard could be a nice alternative for you.
* Easy to implement your own DataProvider to connect any data source. Even for expensive commercial BI suite, it's not possible to connect all the NOSQL and NewSQL data source in the era of big data. Due to the schema of NOSQL are various, such as hash tables, arrays, trees, maps, etc., different people using the same NoSQL products designed Schema may vary widely. The user who most familiar with their storage schema are the user themselves. And it's easy to find a Java programmers to code a Class to connect their own data source. So we leave this part of work to the end user with an easy extended data connection framework in CBoard

### Community Edition V.S. Enterprise Edition

Features | Community Edition | Enterprise Edition
---|:---:|:---:
Multiple kinds of data source plugins | :white_check_mark: | :white_check_mark: 
Drag-and-drop self-service multidimensional analysis |:white_check_mark: | :white_check_mark: 
More than 20 kinds of chart type |:white_check_mark: | :white_check_mark: + 明细表 + GIS中国地图
Dashboard |:white_check_mark: | :white_check_mark: 
Near-realtime data refresh |:white_check_mark: | :white_check_mark: 
Dashboard Layout | Layout by row and column, view and design are seperated | Free layout and live preview
Dashboard parameter | Common filter | Add date range filter, checkbox, searchable dropdown selector filter, keyword input filter
Cockpit Dashboard | :x: | :white_check_mark: 
Chart link | Design for developers, simple support based on raw data columns |Design for data analyst, complete chart linkage mechanism to support linkage to datasets, billboards
Inline chart | :x: All charts must first be saved and managed in the **Widget Config** design area. | Support insert inline chart in dashboard.
Send report email |:white_check_mark: | :white_check_mark: 
Regroup dimension members | :x: | :white_check_mark: 
Cusomize sort dimension members  | :x: | :white_check_mark: 
Chart tunning | Simple supported | More powerful and easy to use
Detail data table | :x: | :white_check_mark: 
GIS Map chart on detail data | :x: | :white_check_mark: 
Data Security | Chart level Control | :star::star: Data cell level control and support role based data access control
Folder based resource managment system | :x: Only support virtual path based folder | OS likly file system solution. ACL can be managed by folder
Advantage Cross Table | :x: | :star::star: Supports advanced calculations such as year-on-year, aspect ratio, percentage, totals, subtotals, cell conditional styles 
Dashboard iframe integeration  | :x: | Iframe external system integration with parameter control 
SDK integeration Support | :x: | :white_check_mark: 
Front-end Technology Stack | AngularJS | VueJS + ES6 + Webpack
Professional Technology Support | :x: | :white_check_mark: Escort your production environment
Road Map | :x: Maintenance-oriented | Customer-oriented Road map 


功能 | 社区版 | 企业版
---|:---:|:---:
多种数据源接入| :white_check_mark: | :white_check_mark: 
拖拽式自助多维分析|:white_check_mark: | :white_check_mark: 
20多种图形展示|:white_check_mark: | :white_check_mark: + 明细表 + GIS中国地图
数据仪表盘|:white_check_mark: | :white_check_mark: 
仪表盘图表定时刷新 |:white_check_mark: | :white_check_mark: 
看板布局 | 简单行列编辑，先保存再预览 | 所见即所得体检的自由布局
看板参数 | 通用按钮看板参数 | 日期范围过滤, 复选框, 可搜索下拉选择器与关键词搜索
全屏驾驶舱，监控大屏 | :x: | 完善自适应与高度可订制大屏设计
图表联动 | 面向开发人员，基于原始数据列的简单支持 | 完善的图表联动机制，支持联动到数据集、面向业务人员的简单配置
内联图表| :x: 所有图表必须先在图表设计区设计保存管理 | 可以直接在数据看板设计图表单个图表、看板、外部系统
报表邮件发送|:white_check_mark: | :white_check_mark: 
维度成员自定义分组 | :x: | :white_check_mark: 
维度成员自定义排序 | :x: | :white_check_mark: 
图表微调 | 支持简单的图表微调 | 增强
明细表 | :x: | :white_check_mark: 
基于明细数据的GIS地图 | :x: | :white_check_mark: 
数据权限控制| 图表级 | :star::star: 单元格级别基于角色的权限控制
基于文件夹的资源管理方案 | :x: 虚拟目录无文件夹方案 | 类似操作系统的统一实体文件夹资源方案
高级交叉表 | :x: | :star::star: 支持同比、环比、占比、总计、小计等高级计算，单元格条件样式 
IFrame外部系统集成  | :x: | 支持看板级别IFrame集成，可传参
SDK级别外部集成  | :x: | :white_check_mark: 便于个性化集成
前端技术架构 | AngularJS | VueJS + ES6 + Webpack，优化首页加载速度，更适应于云端部署
专业权威技术支持 | :x: | :white_check_mark: 为您的生产环境保驾护航
研发计划 | :x: 维护为主 | 贴近企业实际需求的长期产品研发计划 

> More enterprise features please access our homepage: [上海楚果信息技术有限公司](http://www.chuguotech.com/)


## Issues

If you like our product, you can start from our community version. With the support of commercialization of products, we will do our best to maintain the stability of the community version.
In future, without affecting the company's business, it will gradually open more basic development infrastructure.
Any bugs or question please feel free to post at Github[Issue system](https://github.com/TuiQiao/CBoard/issues)

## 正在招聘
我们正在寻找在相关领域有技术有热情的**前端开发**小伙伴, 与**产品销售**小伙伴, 如果您看好公司发展前景, 请将您的简历发送到: *hr@chuguotech.com*, 如果你足够优秀有机会成为我们技术合伙人哦!
[职位链接](http://www.chuguotech.com/2)

## More Document
- [帮助文档](http://peter_zhang921.gitee.io/cboard_docsify/#/zh-cn/)
- [Document](https://tuiqiao.github.io/CBoardDoc/#/en-us/)

## Gitter交流 

- 交流群须知
    - 在讨论相关问题之前，请务必自己阅读[官方文档](http://peter_zhang921.gitee.io/cboard_docsify/#/zh-cn/), 相信大部分问题您都能在文档中找到答案
    - 用户交流群是为方便CBoard使用者之间进行沟通，请注意**不是答疑群，请大家能够尽量互相帮助**
    - 管理员会定义清理最近3个月不曾发言的僵尸用户
    - 在Issue系统里面搜索看看是否有类似问题
    - 确定是程序上的bug请再GitHub issue系统里面[创建新的issue](https://github.com/TuiQiao/CBoard/issues/new)， 参照如何真确提问创建Issue主题
        - What steps will reproduce the problem?（该问题的重现步骤是什么？）
        - What is the expected output? What do you see instead?（你期待的结果是什么？实际看到的又是什么？）
        - What version of the product are you using? On what operating system?（你正在使用产品的哪个版本？在什么操作系统上？）
        - Please provide any additional information below.（如果有的话，请在下面提供更多信息。）

[![Gitter](https://badges.gitter.im/tuiqiao_cboard/community.svg)](https://gitter.im/tuiqiao_cboard/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)