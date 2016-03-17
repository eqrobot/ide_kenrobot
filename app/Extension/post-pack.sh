#!/bin/bash

DIR=`pwd`

cd `dirname $0`

EXT_NAME="KenExt"

rm -rf pack pack.pem

chmod 755 pack.crx
chown root:root pack.crx

mv pack.crx ${EXT_NAME}.crx

zip ${EXT_NAME}.zip ${EXT_NAME}.crx
mv ${EXT_NAME}.zip ../../public/download/
mv ${EXT_NAME}.crx ../../public/download/

rm -rf ${EXT_NAME}.crx
cp update.xml ../../public/extension-update.xml


#回到之前的目录
cd ${DIR}

exit 0
