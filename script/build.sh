#!/bin/bash

echo '编译静态页面'
cd staticDevelopment
npm run build

cd ../
echo '清除缓存'
rm -rf utils/static

echo '将项目文件 cp 到部署目录'
mkdir -p utils/static
cp -r staticDevelopment/build/ utils/static