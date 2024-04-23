#!/bin/bash

set -e

log() {
  local msg="$1"
  local timestamp=$(date --utc --iso-8601=seconds)
  echo "${timestamp} ${msg}"
}

catch() {
  echo "Error: L${1//\"/\\\"} ${2//\"/\\\"} (${3//\"/\\\"})" 1>&2;
}
trap 'catch "${LINENO}" "${BASH_COMMAND}" "$?"' ERR

# 処理開始時のタイムスタンプ(ミリ秒)を取得
start_ms=$(date +%s%3N)

log "----- Start of worker -----"

log "----- Environments -----"

log "User: $(id -un) $(id -u)"
log "Group: $(id -gn) $(id -g)"
log "Home: $HOME"

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "Error: GITHUB_TOKEN is required." 1>&2;
  exit 1;
fi
log "GITHUB_TOKEN: $(echo ${GITHUB_TOKEN} | cut -c 1-4)****"

if [ -z "${GITHUB_OWNER}" ]; then
  echo "Error: GITHUB_OWNER is required." 1>&2;
  exit 1;
fi
log "GITHUB_OWNER: ${GITHUB_OWNER}"

log "----- Fetch repo info -----"

source $HOME/.nvm/nvm.sh
nvm use 20
node -v
REPOS_FILE=/var/task/repos.json
node /var/task/index.js ${GITHUB_OWNER} ${REPOS_FILE}

readarray -t REPOS < ${REPOS_FILE}

git config --global credential.helper '!f() { echo "username=token"; echo "password=$GITHUB_TOKEN"; }; f'

. ./git-sync.sh

TARGET_DIR=/mnt/efs
cd $TARGET_DIR

N=1

for REPO in "${REPOS[@]}"; do
  log "----- ${N}: Syncing $REPO -----"
  # カレントディレクトリをリセット
  cd $TARGET_DIR
  git-sync $GITHUB_OWNER $REPO
  N=$((N+1))
done

log "----- Result -----"

# 処理完了後のディレクトリ一覧を表示
cd $TARGET_DIR
du --max-depth=1 -ah | sort -k2

# 処理終了時のタイムスタンプを取得
end_ms=$(date +%s%3N)
# 処理時間(ミリ秒)を計算
elapsed_ms=$((end_ms - start_ms))

log "----- End of worker -----"
