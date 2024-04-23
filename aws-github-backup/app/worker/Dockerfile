####################################################################
# binary packages
####################################################################
FROM public.ecr.aws/amazonlinux/amazonlinux:2023-minimal AS packages

RUN dnf install -y git git-lfs findutils jq gzip tar \
  && dnf clean all \
  && rm -rf /var/cache/dnf

# Node install
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN source /root/.nvm/nvm.sh && nvm install 20

ENV TASK_ROOT=/var/task
RUN mkdir -p ${TASK_ROOT}
WORKDIR ${TASK_ROOT}
COPY package*.json .

RUN source /root/.nvm/nvm.sh && nvm use 20 && npm install --omit=dev

####################################################################
# builder packages
####################################################################
FROM public.ecr.aws/amazonlinux/amazonlinux:2023-minimal AS builder

COPY --from=packages /usr/bin/find /usr/bin/find
COPY --from=packages /root/.nvm/*.sh /root/.nvm/
COPY --from=packages /root/.nvm/versions /root/.nvm/versions

ENV TASK_ROOT=/var/task
RUN mkdir -p ${TASK_ROOT}
WORKDIR ${TASK_ROOT}
COPY . .

RUN source /root/.nvm/nvm.sh && nvm use 20 && npm install && npm run build

####################################################################
# worker
####################################################################
FROM public.ecr.aws/amazonlinux/amazonlinux:2023-minimal

# 必要なコマンドをコピー
COPY --from=packages /usr/bin/git /usr/bin/git
COPY --from=packages /usr/bin/git-lfs /usr/bin/git-lfs
COPY --from=packages /usr/libexec/git-core/git-remote-https /usr/libexec/git-core/git-remote-https
COPY --from=packages /usr/share/git-core/templates /usr/share/git-core/templates

COPY --from=packages /usr/bin/find /usr/bin/find
COPY --from=packages /usr/bin/xargs /usr/bin/xargs
COPY --from=packages /usr/bin/gzip /usr/bin/gzip
COPY --from=packages /usr/bin/tar /usr/bin/tar

# jq (libjq.so.1 と libonig.so.5 も必要なためコピー)
COPY --from=packages /usr/bin/jq /usr/bin/jq
COPY --from=packages /usr/lib64/libjq.so.1 /usr/lib64/libjq.so.1
COPY --from=packages /usr/lib64/libonig.so.5 /usr/lib64/libonig.so.5

# Node コピー
COPY --from=packages /root/.nvm/*.sh /root/.nvm/
COPY --from=packages /root/.nvm/versions /root/.nvm/versions

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/$TINI_VERSION/tini /tini
RUN chmod +x /tini

ENV TASK_ROOT=/var/task
ENV DATA_ROOT=/mnt/efs

RUN mkdir -p ${TASK_ROOT}
WORKDIR ${TASK_ROOT}

# node_modules コピー
COPY --from=packages /var/task/node_modules /var/task/node_modules
COPY --from=builder /var/task/dist/*.js ${TASK_ROOT}

COPY *.sh ${TASK_ROOT}
RUN chmod +x ${TASK_ROOT}/*.sh

RUN mkdir ${DATA_ROOT}

ENTRYPOINT [ "/var/task/main.sh" ]
