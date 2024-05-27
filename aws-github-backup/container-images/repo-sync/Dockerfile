####################################################################
# binary packages
####################################################################
FROM public.ecr.aws/amazonlinux/amazonlinux:2023-minimal AS packages

RUN dnf install -y git git-lfs findutils jq gzip python \
  && dnf clean all \
  && rm -rf /var/cache/dnf

RUN ls -l /usr/lib

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

# jq (libjq.so.1 と libonig.so.5 も必要なためコピー)
COPY --from=packages /usr/bin/jq /usr/bin/jq
COPY --from=packages /usr/lib64/libjq.so.1 /usr/lib64/libjq.so.1
COPY --from=packages /usr/lib64/libonig.so.5 /usr/lib64/libonig.so.5

# AWS CLI インストール
COPY --from=packages /usr/bin/python /usr/bin/python
COPY --from=packages /usr/lib64/libpython* /usr/lib64/
COPY --from=packages /usr/lib64/python3.9 /usr/lib64/python3.9
COPY --from=packages /usr/lib/python3.9 /usr/lib/python3.9
COPY --from=packages /usr/lib64/libexpat.so.1 /usr/lib64/libexpat.so.1

RUN python -m pip install awscli

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/$TINI_VERSION/tini /tini
RUN chmod +x /tini

ENV TASK_ROOT=/var/task
ENV DATA_ROOT=/mnt/efs

RUN mkdir -p ${TASK_ROOT}
RUN mkdir -p ${DATA_ROOT}

WORKDIR ${TASK_ROOT}
COPY *.sh ${TASK_ROOT}
RUN chmod +x ${TASK_ROOT}/*.sh

ENTRYPOINT [ "/var/task/entrypoint.sh" ]


