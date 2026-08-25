FROM node:22.19.0-bookworm-slim

ARG PI_VERSION=0.84.3
RUN npm install --global "@earendil-works/pi-coding-agent@${PI_VERSION}" \
    && npm cache clean --force

RUN mkdir -p /home/pi
USER node
WORKDIR /workspace

ENTRYPOINT ["pi"]
