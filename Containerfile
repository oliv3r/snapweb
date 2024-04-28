# SPDX-License-Identifier: GPL-3.0-or-later
#
# Copyright (C) 2024 Olliver Schinagl <oliver@schinagl.nl>

ARG ALPINE_VERSION="latest"
ARG TARGET_ARCH="library"

FROM docker.io/${TARGET_ARCH}/alpine:${ALPINE_VERSION} AS builder

WORKDIR /src

COPY . /src/

RUN apk add --no-cache \
        'git' \
        'klibc-dash' \
        'npm' \
    && \
    cp -a "/usr/lib/klibc-$(uname -m)/" '/snapcast/' && \
    npm clean-install \
        --no-audit \
        --no-fund \
        --verbose \
    && \
    npm run build && \
    mv '/src/dist/' '/snapcast/snapweb'

#Snapweb
FROM scratch AS snapweb

LABEL maintainer="Olliver Schinagl <oliver@schinagl.nl>"

VOLUME /snapweb

COPY --from=builder "/snapcast/" "/"

CMD exit 0
