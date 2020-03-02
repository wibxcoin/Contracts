#!/bin/bash

sudo mv -v build temp_build
mkdir -p build/contracts && cp -v ./temp_build/contracts/*.json ./build/contracts

echo "Fixed!"