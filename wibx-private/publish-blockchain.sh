#!/bin/bash

VERSION=`node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)"`
echo "Deploying NACS-PRIVATE version $VERSION..."

# Check if the card exists...
echo "Checking business card..."
composer card list | grep 'admin@nacs-private' &> /dev/null
if [ $? == 0 ]; then
    composer card delete -c admin@nacs-private
    echo "Card removed!"
fi

# Check if fabric is running...
echo "Checking Fabric instance..."
docker ps | grep 'fabric' &> /dev/null
if [ $? != 0 ]; then
    echo "Fabric is not running!"
    exit
fi

echo "Cleaning..."
rm -rfv build lib/*.js
mkdir -p build
cd build

echo "Deploying..."
yarn build && composer archive create -t dir -n ../ && \
composer network install --card PeerAdmin@hlfv1 --archiveFile nacs-private@$VERSION.bna && \
composer network start --networkName nacs-private --networkVersion $VERSION \
--networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card && \
composer card import --file networkadmin.card && \
composer network ping --card admin@nacs-private