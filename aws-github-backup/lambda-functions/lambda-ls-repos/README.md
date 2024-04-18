ビルド

```
DOCKER_BUILDKIT=0 docker build -t repo-sync .
```

ローカル実行

```
docker run --rm --platform linux/amd64 -p 9000:8080 repo-sync
```

関数リクエスト

```
curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{ "owner": "mseninc", "repo" : isms-reports" }'
```

```json
{"statusCode":200,"body":{"owner":"mseninc","repo":"isms-reports","directory":"/mnt/efs/isms-reports","file_count":39,"total_size":60662221,"action":"clone"}}
```
