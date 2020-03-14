#!/usr/bin/env bash
#
# Test script for build environments.
# Originally based on code by OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/scripts/coverage.sh
#

NODE_BIN=node_modules/.bin

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup()
{
    # Kill the ganache instance that we started (if we started one and if it's still running).
    if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
        kill -9 $ganache_pid
    fi
}

if ! [ -x "$(command -v nc)" ]; then
    echo 'Error: netcat is not installed.' >&2
    exit 1
fi

if [ "$SOLIDITY_COVERAGE" = true ]; then
    ganache_port=8555
else
    ganache_port=8545
fi

ganache_running()
{
    nc -z localhost "$ganache_port"
}

start_ganache()
{
    # We define 10 accounts with balance 1M ether, needed for high-value tests.
    local accounts=(
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501200,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501201,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501202,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501203,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501204,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501205,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501206,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501207,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501208,1000000000000000000000000"
        --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501209,1000000000000000000000000"
    )

    if [ "$SOLIDITY_COVERAGE" = true ]; then
        $NODE_BIN/testrpc-sc --gasLimit 0xfffffffffff --port "$ganache_port" "${accounts[@]}" > /dev/null &
    else
        $NODE_BIN/ganache-cli --gasLimit 0xfffffffffff "${accounts[@]}" > /dev/null &
    fi

    sleep 10

    ganache_pid=$!
}

if ganache_running; then
    echo "Using existing ganache instance"
else
    echo "Starting our own ganache instance"
    start_ganache
fi

if [ "$SOLC_NIGHTLY" = true ]; then
    echo "Downloading solc nightly"
    wget -q https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/soljson-nightly.js -O /tmp/soljson.js && find . -name soljson.js -exec cp /tmp/soljson.js {} \;
fi

$NODE_BIN/truffle version

if [ "$SOLIDITY_COVERAGE" = true ]; then
    $NODE_BIN/solidity-coverage

    if [ "$CONTINUOUS_INTEGRATION" = true ]; then
        cat coverage/lcov.info | $NODE_BIN/coveralls
    fi
else
    $NODE_BIN/truffle test "$@" --network=build
fi