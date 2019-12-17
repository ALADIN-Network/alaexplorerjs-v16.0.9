Dockerized alaio instance for development and testing.  This container
is designed to reset its blockchain and wallet state upon shutdown.

# Start alanoded

Starting and stopping an alaio instance:

```js
./up.sh
docker-compose down
```

# Load commands like `alacli`

```bash
. ./dockrc.sh
```

The [ALAIO developer docs](https://developers.ala.io/alaio-alanode/docs/docker-quickstart) uses a `alacli` alias too.  If you see “No such container: alaio”, run ‘unalias alacli’ and try again.

# Unit Test

Run all unit test in a temporary instance.  Note, this script will run
`npm install` in the alaexplorerjs16 directory.

`./run_tests.sh`

# Running container

After ./up.sh

```bash
docker exec docker_alanoded_1 ls /opt/alaio/bin
docker exec docker_alanoded_1 ls /contracts
docker cp docker_alanoded_1:/opt/alaio/bin/alanode .

# Or setup an environment:
. ./dockerc.sh
kalad ls /opt/alaio/bin
alacli --help
```

# Stopped container

```bash
# Note, update release
docker run --rm -it alaio/ala:latest ls /opt/alaio/bin
docker run -v "$(pwd):/share" --rm -it alaio/ala:latest cp /opt/alaio/bin/alanode /share
```

