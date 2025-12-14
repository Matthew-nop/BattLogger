#!/bin/bash

# SITE_PATH must have leading '/'
USER="battlogger"
SITE_NAME="battlogger"
SITE_PATH="/dist/battlogger"
SERVICE_DESCRIPTION="Service to run BattLogger website"

# Elevate with sudo if not root
[ "$UID" -eq 0 ] || exec sudo "$0" "$@"

SITE_DIRNAME=$(dirname "${SITE_PATH}")
SERVICE_NAME="website-${SITE_NAME}"

useradd -U -m "${USER}"

test -d "${SITE_DIRNAME}" || mkdir -p "${SITE_DIRNAME}"
test -d "${SITE_PATH}" || rm -rf "${SITE_PATH}"

cp -r dist "${SITE_PATH}"

chown -R ${USER}:${USER} ${SITE_PATH}
chmod -R 700 ${SITE_PATH}

echo """
[Unit]
Description=${SERVICE_DESCRIPTION}
After=network.target

[Service]
Restart=always
User=${USER}
Group=${USER}
ExecStart=/usr/bin/node ${SITE_PATH}/backend/server.js

[Install]
WantedBy=multi-user.target
""" > /etc/systemd/system/${SERVICE_NAME}.service

systemctl daemon-reload
systemctl start website-stage
systemctl enable website-stage

