#!/usr/bin/env bash
set -o errexit
. ./dockrc.sh

set -o xtrace

# Reset the volumes
docker-compose down

# Update docker
#docker-compose pull

# Start the server for testing
docker-compose up -d
docker-compose logs -f | egrep -v 'Produced block 0' &
sleep 2


alacli wallet create --to-console
alacli wallet import --private-key 5HzzqBmg4DeneRqNRznPiBubRDGEPdcVjGZCTMGjGJWJubKm2Pe

# Create accounts must happen before alaio.system is installed

# Test accounts (for alaexplorerjs-v16.0.9)
alacli create account alaio inita $owner_pubkey $active_pubkey
alacli create account alaio initb $owner_pubkey $active_pubkey
alacli create account alaio initc $owner_pubkey $active_pubkey

# System accounts for Alanoded
alacli create account alaio alaio.bpay $owner_pubkey $active_pubkey
alacli create account alaio alaio.msig $owner_pubkey $active_pubkey
alacli create account alaio alaio.names $owner_pubkey $active_pubkey
alacli create account alaio alaio.ram $owner_pubkey $active_pubkey
alacli create account alaio alaio.ramfee $owner_pubkey $active_pubkey
alacli create account alaio alaio.saving $owner_pubkey $active_pubkey
alacli create account alaio alaio.stake $owner_pubkey $active_pubkey
alacli create account alaio alaio.token $owner_pubkey $active_pubkey
alacli create account alaio alaio.vpay $owner_pubkey $active_pubkey

alacli set contract alaio.msig contracts/alaio.msig -p alaio.msig@active

# Deploy, create and issue SYS token to alaio.token
# alacli create account alaio alaio.token $owner_pubkey $active_pubkey
alacli set contract alaio.token contracts/alaio.token -p alaio.token@active
alacli push action alaio.token create\
  '{"issuer":"alaio.token", "maximum_supply": "1000000000.0000 SYS"}' -p alaio.token@active
alacli push action alaio.token issue\
  '{"to":"alaio.token", "quantity": "10000.0000 SYS", "memo": "issue"}' -p alaio.token@active

# Either the alaio.bios or alaio.system contract may be deployed to the alaio
# account.  System contain everything bios has but adds additional constraints
# such as ram and cpu limits.
# alaio.* accounts  allowed only until alaio.system is deployed
alacli set contract alaio contracts/alaio.bios -p alaio@active

# SYS (main token)
alacli transfer alaio.token alaio '1000 SYS'
alacli transfer alaio.token inita '1000 SYS'
alacli transfer alaio.token initb '1000 SYS'
alacli transfer alaio.token initc '1000 SYS'

# User-issued asset
alacli push action alaio.token create\
  '{"issuer":"alaio.token", "maximum_supply": "1000000000.000 PHI"}' -p alaio.token@active
alacli push action alaio.token issue\
  '{"to":"alaio.token", "quantity": "10000.000 PHI", "memo": "issue"}' -p alaio.token@active
alacli transfer alaio.token inita '100 PHI'
alacli transfer alaio.token initb '100 PHI'

# Custom asset
alacli create account alaio currency $owner_pubkey $active_pubkey
alacli set contract currency contracts/alaio.token -p currency@active
alacli push action currency create\
  '{"issuer":"currency", "maximum_supply": "1000000000.0000 CUR"}' -p currency@active
alacli push action currency issue '{"to":"currency", "quantity": "10000.0000 CUR", "memo": "issue"}' -p currency@active

alacli push action currency transfer\
  '{"from":"currency", "to": "inita", "quantity": "100.0000 CUR", "memo": "issue"}' -p currency
