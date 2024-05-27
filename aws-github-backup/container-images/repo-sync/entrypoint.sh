#!/bin/bash
set -e

function catch() {
  send_task_failure "Error: L${1//\"/\\\"} ${2//\"/\\\"} (${3//\"/\\\"})"
}

function log() {
  local msg="$1"
  local timestamp=$(date --utc --iso-8601=seconds)
  echo "${timestamp} ${msg}"
}

function send_task_failure() {
  local taskToken="$TASK_TOKEN"
  local error="$1"
  if [ -z "${taskToken}" ]; then
    log "${error}"
  else
    aws stepfunctions send-task-failure --task-token "${taskToken}" --error "${error}"
  fi
}

function send_task_success() {
  local taskToken="$TASK_TOKEN"
  local output="$1"
  if [ -z "${taskToken}" ]; then
    log "${output}"
  else
    aws stepfunctions send-task-success --task-token "${taskToken}" --task-output "${output}"
  fi
}

function gitsync() {
  trap 'catch "${LINENO}" "${BASH_COMMAND}" "$?"' ERR
  cd ${WORK_DIR}

  git config --global credential.helper '!f() { echo "username=token"; echo "password=$GITHUB_TOKEN"; }; f'

  if [ "${FORCE_CLONE}" = "true" ] && [ -d "${GITHUB_REPO}" ]; then
    log "removing existing directory..."
    rm -rf "${GITHUB_REPO}"
  fi

  if [ ! -d "${GITHUB_REPO}" ]; then
    ACTION="clone"
    log "cloning repository..."
    git clone "https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git"
  else
    ACTION="pull"
    log "repository exists. Pulling..."
  fi

  cd "${GITHUB_REPO}"
  git lfs install
  git config --global advice.detachedHead false
  git config --global --add safe.directory "$(pwd)"
  git config lfs.fetchrecentrefsdays 365
  # NOTE: チェックアウト中のコミットに LFS 破損ファイルがある場合に lfs fetch ができないため、
  # 一旦 origin/HEAD を checkout しておく
  git fetch
  if ! git checkout origin/HEAD; then
    log "pulling skipped due to no origin/HEAD."
    ACTION="none"
    return
  fi
  # NOTE: --all で古いオブジェクトが取得できないときに
  # failed to fetch some objects from 'https://github.com/***' が発生するため
  # フォールバックとして少なくとも git lfs fetch だけは実行しておく
  git fetch --all || git fetch
  git lfs fetch --all || git lfs fetch
  # prune は失敗してもバックアップとしては支障ないため無視する
  git fetch --prune || true
  git checkout origin/HEAD || true
}

function main() {
  trap 'catch "${LINENO}" "${BASH_COMMAND}" "$?"' ERR
  start_ms=$(date +%s%3N)

  log "----- Start of main -----"

  log "----- Environments -----"
  log "user: $(id -un) $(id -u)"
  log "group: $(id -gn) $(id -g)"
  log "home: $HOME"

  if [ -z "${GITHUB_TOKEN}" ]; then
    send_task_failure "{ \"error\": \"github token is required.\" }"
    exit 1;
  fi
  # GITHUB_TOKEN が ssm: から始まっていたら ssm から取得する
  if [[ "${GITHUB_TOKEN}" =~ ^ssm: ]]; then
    PARAM_NAME=$(echo ${GITHUB_TOKEN} | cut -d ':' -f 2)
    GITHUB_TOKEN=$(aws ssm get-parameter --with-decryption --query "Parameter.Value" --output text --name "${PARAM_NAME}")
  fi
  log "github token: $(echo ${GITHUB_TOKEN} | cut -c 1-4)****"

  if [ -z "${GITHUB_OWNER}" ]; then
    send_task_failure "{ \"error\": \"owner is required.\" }"
    exit 1;
  fi
  log "owner: ${GITHUB_OWNER}"
  if [ -z "${GITHUB_REPO}" ]; then
    send_task_failure "{ \"error\": \"repo is required.\" }"
    exit 1;
  fi

  log "task token: $(echo ${TASK_TOKEN} | cut -c 1-4)****"
  log "force clone: ${FORCE_CLONE:+false}"
  log "working directory: ${WORK_DIR:-/mnt/efs}"

  log "----- Git -----"
  gitsync

  # FILE_LIST=$(find . -type f -print0 | xargs -0 ls -hs);
  # log "----- File List -----"
  # log "${FILE_LIST}" | jq -R -s -c 'split("\n") | map(select(. != ""))'

  log "----- Result -----"

  DIR=$(pwd)
  log "directory: ${DIR}"

  FILE_COUNT=$(find . -type f | wc -l)
  log "file count: ${FILE_COUNT}"

  TOTAL_SIZE=$(du -sb . | cut -f1)
  log "total size: ${TOTAL_SIZE}"

  BODY="{\"owner\": \"${GITHUB_OWNER}\", \"repo\": \"${GITHUB_REPO}\", \"directory\": \"${DIR}\", \"file_count\": ${FILE_COUNT}, \"total_size\": ${TOTAL_SIZE}, \"action\": \"${ACTION}\"}"
  log "response: ${BODY}"

  send_task_success "${BODY}"

  end_ms=$(date +%s%3N)
  elapsed_ms=$((end_ms - start_ms))
  log "elapsed time: ${elapsed_ms} ms"

  log "----- End of main -----"
}

main
