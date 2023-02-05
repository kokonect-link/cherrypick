#!/bin/bash

PORT=$(yq '.port' /cherrypick/.config/default.yml)
curl -s -S -o /dev/null "http://localhost:${PORT}"
