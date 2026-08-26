FROM node:22.19.0-bookworm-slim

ARG PI_VERSION=0.84.3
ARG PERMISSION_SYSTEM_VERSION=27.0.1
RUN npm install --global \
    "@earendil-works/pi-coding-agent@${PI_VERSION}" \
    "@gotgenes/pi-permission-system@${PERMISSION_SYSTEM_VERSION}" \
    "tree-sitter-bash@0.25.1" \
    "web-tree-sitter@0.26.9" \
    "zod@4.4.3" \
    && npm cache clean --force

RUN mkdir -p /home/pi
USER node
WORKDIR /workspace

ENTRYPOINT ["pi"]
