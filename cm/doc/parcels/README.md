#### 1、校验parcel.json文件
![](/cm/doc/parcels/1校验parcel.json文件.png) 
```bash
java -jar .\cm\doc\schema-validator-5.12.1.jar -p .\cm\parcels\meta\parcel.json
```

#### 2、校验alternatives.json文件
![](/cm/doc/parcels/2校验alternatives.json文件.png) 
```bash
java -jar .\cm\doc\schema-validator-5.12.1.jar -a .\cm\parcels\meta\alternatives.json
```

#### 3、校验parcel包
![](/cm/doc/parcels/3校验parcel包.png) 
```bash
java -jar .\cm\doc\schema-validator-5.12.1.jar -f .\target\CM\parcels\CBOARD-0.4.2-el6.parcel
```

#### 4、生成manifest.json文件
![](/cm/doc/parcels/4生成manifest.json文件.png) 
```bash
python .\cm\doc\make_manifest.py .\target\CM\parcels\
```

## 注意事项
#### 1、所有shell文件必须转成unix格式
