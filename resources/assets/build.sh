#!/bin/bash

DIR=`pwd`

PACK="../../public/assets"

cd `dirname $0`

rm -rf ${PACK}

r.js -o build.js

cd ${PACK}
rm -rf build.* *.rb *.sh .sass-cache css/*.scss css/base css/component css/helper css/layout css/theme

#回到之前的目录
cd ${DIR}

exit 0