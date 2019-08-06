# GitHub to GitLab auto-backup

## Summary

- Node.js v10 or later
- [GitHub REST API v3](https://developer.github.com/v3/)
- GitLab CE

## Usage

### Install

Just run `npm install`.

```bash
npm install
```

### Setup .env

```bash
cp .env.sample .env
vi .env
```

Set ALL variables in .env.

### Start backup

```bash
npm start
```

is as same as below.

```bash
node index.js
```

#### force mode

`--force` mode will ignore the previous timestamp to backup all repos forcibly.

```bash
node index.js --force
```

#### dry mode

`--dry` mode will check all of target repos but neither delete projects nor import repos.

```bash
node index.js --dry
```

## License

Copyright (c) 2019 MESN Inc.

Released under the [MIT license](https://opensource.org/licenses/mit-license.php)

