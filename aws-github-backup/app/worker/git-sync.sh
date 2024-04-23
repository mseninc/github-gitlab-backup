#!/bin/bash

function git-sync() {
  GITHUB_OWNER=$1
  GITHUB_REPO=$2

  if [ -z "${GITHUB_OWNER}" ]; then
    echo "owner is required." 1>&2;
    return 1;
  fi
  if [ -z "${GITHUB_REPO}" ]; then
    echo "repo is required."
    return 1;
  fi

  REPOID="${GITHUB_OWNER}/${GITHUB_REPO}"

  echo "${REPOID}> Working directory: $(pwd)"

  if [ "${FORCE_CLONE}" = "true" ] && [ -d "${GITHUB_REPO}" ]; then
    echo "${REPOID}> Removing existing directory..."
    rm -rf "${GITHUB_REPO}"
  fi

  if [ -d "${GITHUB_REPO}" ]; then
    ACTION="pull"
    echo "${REPOID}> Repository exists. Pulling..."
    cd "${GITHUB_REPO}"
    git config --global --add safe.directory "$(pwd)"
    git fetch --prune --all
    git lfs fetch --all
    git pull || true
    git config lfs.fetchrecentrefsdays 365
    git lfs prune || true
  else
    ACTION="clone"
    echo "${REPOID}> Cloning repository..."
    git clone "https://github.com/mseninc/${GITHUB_REPO}.git"
    cd "${GITHUB_REPO}"
    git config --global --add safe.directory "$(pwd)"
    echo "${REPOID}> Retrieving LFS objects..."
    git lfs install
    git lfs fetch --all
  fi

  DIR=$(pwd)

  # FILE_LIST=$(find . -type f -print0 | xargs -0 ls -hs);
  # echo "${REPOID}> ----- File List -----"
  # echo "${REPOID}> ${FILE_LIST}" | jq -R -s -c 'split("\n") | map(select(. != ""))'
  # echo "${REPOID}> ----- /File List -----"

  echo "${REPOID}> Directory: ${DIR}"

  FILE_COUNT=$(find . -type f | wc -l)
  echo "${REPOID}> File count: ${FILE_COUNT}"

  TOTAL_SIZE=$(du -sh . | cut -f1)
  echo "${REPOID}> Total size: ${TOTAL_SIZE}"
}
