FROM public.ecr.aws/lambda/provided:al2023 AS src

RUN dnf install -y git git-lfs findutils jq gzip \
  && dnf clean all \
  && rm -rf /var/cache/dnf


FROM public.ecr.aws/lambda/provided:al2023

# 必要なコマンドをコピー
COPY --from=src /usr/bin/git /usr/bin/git
COPY --from=src /usr/bin/git-lfs /usr/bin/git-lfs
COPY --from=src /usr/libexec/git-core/git-remote-https /usr/libexec/git-core/git-remote-https
COPY --from=src /usr/share/git-core/templates /usr/share/git-core/templates

COPY --from=src /usr/bin/find /usr/bin/find
COPY --from=src /usr/bin/xargs /usr/bin/xargs
COPY --from=src /usr/bin/gzip /usr/bin/gzip

# jq (libjq.so.1 と libonig.so.5 も必要なためコピー)
COPY --from=src /usr/bin/jq /usr/bin/jq
COPY --from=src /usr/lib64/libjq.so.1 /usr/lib64/libjq.so.1
COPY --from=src /usr/lib64/libonig.so.5 /usr/lib64/libonig.so.5

COPY bootstrap ${LAMBDA_RUNTIME_DIR}
COPY *.sh ${LAMBDA_TASK_ROOT}

RUN chmod +x ${LAMBDA_RUNTIME_DIR}/bootstrap \
  && chmod +x ${LAMBDA_TASK_ROOT}/*.sh

# HOME を設定しておかないと Lambda 実行時に $HOME not set になる
ENV HOME /tmp

RUN mkdir /mnt/efs

CMD [ "main.handler" ]


