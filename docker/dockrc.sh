# Root key (for ALA8dM36QedcUfPTNF7maThtRqHP5xvCqMsYiHUz1Rz7sPfhvCYuo)
# 5HzzqBmg4DeneRqNRznPiBubRDGEPdcVjGZCTMGjGJWJubKm2Pe

# Root public key (ALA..5CV)
export owner_pubkey=ALA8dM36QedcUfPTNF7maThtRqHP5xvCqMsYiHUz1Rz7sPfhvCYuo
export active_pubkey=ALA8dM36QedcUfPTNF7maThtRqHP5xvCqMsYiHUz1Rz7sPfhvCYuo

function alacli() {
  docker exec docker_kalad_1 alacli -u http://alanoded:8888 --wallet-url http://localhost:8900 "$@"
}

function kalad() {
  docker exec docker_alanoded_1 kalad "$@"
}

function pkill() {
  docker exec docker_alanoded_1 pkill "$@"
}
