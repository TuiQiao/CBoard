
[https://github.com/cloudera/cm_ext/wiki](https://github.com/cloudera/cm_ext/wiki)

## csd

#### 1、校验sdl文件
```bash
java -jar .\cm\doc\schema-validator-5.12.1.jar -s .\cm\csd\descriptor\service.sdl
```

#### 2、编译并打包CSD
```bash
cd .\cm\csd
jar -cvf .\..\..\target\CBOARD-0.4.2.jar *
```

### 注意事项
#### 1、scripts下的脚本执行不能是后台运行
#### 2、cboard需要jdk1.8及以上
#### 3、所有shell文件必须转成unix格式


## parcels

#### 1、校验parcel.json文件
```bash
java -jar .\cm\doc\schema-validator-5.12.1.jar -p .\cm\parcels\meta\parcel.json
```

#### 2、校验alternatives.json文件
```bash
java -jar .\cm\doc\schema-validator-5.12.1.jar -a .\cm\parcels\meta\alternatives.json
```

#### 3、校验parcel包
```bash
java -jar .\cm\doc\schema-validator-5.12.1.jar -f .\target\CM\parcels\CBOARD-0.4.2-el6.parcel
```

#### 4、生成manifest.json文件
```bash
python .\cm\doc\make_manifest.py .\target\CM\parcels\
```

## 其他

### JAVA升级至JDK8
可以[全局配置]：主机 > 配置 > 高级 > Java 主目录 > /usr/java/jdk1.8.0_161 
<br/>也<br/>
可以[单独配置]：CBoard > 配置 > 服务范围 > 高级 > CBoard 服务环境高级配置代码段（安全阀） > JAVA_HOME=/usr/java/jdk1.8.0_161

### 必须在Linux环境下才能生成parcel的manifest.json文件
mvn clean verify -Pcm
#### 注：在windows上检查parcel和生成manifest.json有问题

### 所有shell文件必须转成unix格式
dos2unix cm/parcels/bin/control
dos2unix cm/parcels/lib/cboard/bin/control.sh
dos2unix cm/parcels/meta/default_env.sh
dos2unix cm/csd/scripts/control.sh

### 使用新的parcel之前需要清空本地缓存
rm -rf /opt/cloudera/parcel-cache/CBOARD*
rm -rf /opt/cloudera/parcels/.flood/CBOARD*

### 使用新的CSD之前需要清空本地缓存
rm -rf /var/run/cloudera-scm-agent/process/*
