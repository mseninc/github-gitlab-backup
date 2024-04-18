#!/bin/bash

function handler() {
  echo "----- Start of handler -----" 1>&2;

  cd /mnt/efs
  echo "Working directory: $(pwd)" 1>&2;

  RESULT=$(find . -maxdepth 1 -type d | cut -c 3- | grep -v '^[.]' | sort | jq -R -s -c 'split("\n") | map(select(. != ""
))')
  echo "Result: ${RESULT}" 1>&2;

  COUNT=$(echo $RESULT | jq '. | length')

  BODY="{\"items\": ${RESULT}, \"count\": ${COUNT}}"
  echo "Response body: ${BODY}" 1>&2;

  RESPONSE=$(echo "{ \"statusCode\": 200, \"body\": ${BODY}}" | jq -c .)
  echo $RESPONSE

  echo "----- End of handler -----" 1>&2;
}
