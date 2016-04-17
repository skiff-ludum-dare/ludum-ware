#!/bin/bash
npm run build
tar -zcf dist.tar.gz dist/
scp dist.tar.gz terrormorph@139.59.164.110:~
ssh terrormorph@139.59.164.110 "tar -zxf dist.tar.gz && mv public last && mv dist public && rm -Rf last"
