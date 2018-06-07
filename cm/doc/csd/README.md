#### 1、校验sdl文件
![](/cm/doc/csd/1校验sdl文件.png) 
```bash
java -jar .\cm\doc\schema-validator-5.12.1.jar -s .\cm\csd\descriptor\service.sdl
```

#### 2、编译并打包CSD
![](/cm/doc/csd/2csd打成jar包.png) 
```bash
cd .\cm\csd
jar -cvf .\..\..\target\CBOARD-0.4.2.jar *
```

#### 扩展1、转换文件为UNIX格式
![](/cm/doc/csd/转换文件为UNIX格式.png) 
```bash
yum -y install dos2unix
dos2unix control.sh
```

## 注意事项
#### 1、scripts下的脚本执行不能是后台运行
#### 2、cboard需要jdk1.8及以上
#### 3、所有shell文件必须转成unix格式
