#!/bin/bash

function handler() {
  echo "----- Start of handler -----" 1>&2;

  function catch() {
    echo "Error: L${1//\"/\\\"} ${2//\"/\\\"} (${3//\"/\\\"})" 1>&2;
  }

  set -e
  trap 'catch "${LINENO}" "${BASH_COMMAND}" "$?"' ERR

  echo "----- Environments -----" 1>&2;

  echo "User: $(id -un) $(id -u)" 1>&2;
  echo "Group: $(id -gn) $(id -g)" 1>&2;
  echo "Home: $HOME" 1>&2;

  if [ -z "${GIT_PASSWORD}" ]; then
    echo "Error: Git password is required." 1>&2;
    exit 1;
  fi
  echo "Git password: $(echo ${GIT_PASSWORD} | cut -c 1-4)****" 1>&2;
  echo "----- /Environments -----" 1>&2;

  echo "----- Event data -----" 1>&2;
  EVENT_DATA=$1
  echo "$EVENT_DATA" 1>&2;
  echo "----- /Event data -----" 1>&2;

  # イベントデータを jq でパースして変数に格納
  GITHUB_OWNER=$(echo $EVENT_DATA | jq -r '.owner // empty')
  GITHUB_REPO=$(echo $EVENT_DATA | jq -r '.repo // empty')
  FORCE_CLONE=$(echo $EVENT_DATA | jq -r '.forceClone // empty')

  if [ -z "${GITHUB_OWNER}" ]; then
    echo "{ \"statusCode\": 400, \"body\": { \"error\": \"owner is required.\" } }"
    exit 0;
  fi
  if [ -z "${GITHUB_REPO}" ]; then
    echo "{ \"statusCode\": 400, \"body\": { \"error\": \"repo is required.\" } }"
    exit 0;
  fi

  echo "----- Parameters -----" 1>&2;
  echo "owner: ${GITHUB_OWNER}" 1>&2;
  echo "repo: ${GITHUB_REPO}" 1>&2;
  echo "force clone: ${FORCE_CLONE}" 1>&2;
  echo "----- /Parameters -----" 1>&2;

  echo "----- Processing -----" 1>&2;

  cd /mnt/efs
  echo "Working directory: $(pwd)" 1>&2;

  git config --global credential.helper '!f() { echo "username=$GIT_USERNAME"; echo "password=$GIT_PASSWORD"; }; f'

  if [ "${FORCE_CLONE}" = "true" ] && [ -d "${GITHUB_REPO}" ]; then
    echo "Removing existing directory..." 1>&2;
    rm -rf "${GITHUB_REPO}" 1>&2;
  fi

  if [ -d "${GITHUB_REPO}" ]; then
    ACTION="pull"
    echo "Repository exists. Pulling..." 1>&2;
    cd "${GITHUB_REPO}" 1>&2;
    git config --global --add safe.directory "$(pwd)"
    git fetch --prune --all 1>&2;
    git lfs fetch --all 1>&2;
    git pull 1>&2;
    git config lfs.fetchrecentrefsdays 365 1>&2;
    git lfs prune 1>&2;
  else
    ACTION="clone"
    echo "Cloning repository..." 1>&2;
    git clone "https://github.com/mseninc/${GITHUB_REPO}.git" 1>&2;
    cd "${GITHUB_REPO}" 1>&2;
    git config --global --add safe.directory "$(pwd)"
    echo "Retrieving LFS objects..." 1>&2;
    git lfs install 1>&2;
    git lfs fetch --all 1>&2;
  fi

  echo "----- /Processing -----" 1>&2;

  DIR=$(pwd)

  FILE_LIST=$(find . -type f -print0 | xargs -0 ls -hs);
  echo "----- File List -----" 1>&2;
  echo "${FILE_LIST}" | jq -R -s -c 'split("\n") | map(select(. != ""))' 1>&2;
  echo "----- /File List -----" 1>&2;

  echo "----- Result -----" 1>&2;

  echo "Directory: ${DIR}" 1>&2;

  FILE_COUNT=$(find . -type f | wc -l)
  echo "File count: ${FILE_COUNT}" 1>&2;

  TOTAL_SIZE=$(du -sb . | cut -f1)
  echo "Total size: ${TOTAL_SIZE}" 1>&2;

  BODY="{\"owner\": \"${GITHUB_OWNER}\", \"repo\": \"${GITHUB_REPO}\", \"directory\": \"${DIR}\", \"file_count\": ${FILE_COUNT}, \"total_size\": ${TOTAL_SIZE}, \"action\": \"${ACTION}\"}"
  echo "Response body: ${BODY}" 1>&2;

  echo "----- /Result -----" 1>&2;

  RESPONSE=$(echo "{ \"statusCode\": 200, \"body\": ${BODY}}" | jq -c .)
  echo $RESPONSE

  echo "----- End of handler -----" 1>&2;
}
