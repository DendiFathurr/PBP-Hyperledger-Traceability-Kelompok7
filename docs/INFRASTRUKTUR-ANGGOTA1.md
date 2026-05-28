# 📋 Dokumentasi Infrastruktur & DevOps — Anggota 1

## Studi Kasus: Sistem Traceability Logistik Ekspor-Impor

**Platform:** Hyperledger Fabric v2.2  
**Tipe Jaringan:** Permissioned Enterprise Blockchain (Konsorsium B2B)  
**Domain:** `logistik.com`

---

## 1. Deskripsi Peran

Anggota 1 bertanggung jawab atas seluruh infrastruktur jaringan blockchain, meliputi:

1. **Konfigurasi kriptografi (MSP/Sertifikat)** — Pembuatan identitas digital untuk semua node menggunakan `cryptogen`
2. **Konfigurasi channel & konsensus** — Mendefinisikan organisasi, policies, dan mekanisme konsensus via `configtx.yaml`
3. **Orkestrasi container** — Menyusun `docker-compose.yaml` untuk menjalankan seluruh komponen jaringan
4. **Generate artifacts** — Genesis block, channel transaction, dan anchor peer updates

---

## 2. Arsitektur Jaringan

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Docker Network: fabric_network                    │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │              ORDERING SERVICE (EtcdRaft)                 │      │
│   │          orderer.logistik.com : 7050                     │      │
│   └──────────────────────┬───────────────────────────────────┘      │
│                          │                                          │
│       ┌──────────────────┴──────────────────┐                       │
│       │                                     │                       │
│   ┌───▼──────────────────────┐   ┌──────────▼───────────────────┐   │
│   │   ORG1 EKSPORTIR         │   │   ORG2 IMPORTIR              │   │
│   │                          │   │                               │   │
│   │  ┌─────────────────┐     │   │  ┌─────────────────┐         │   │
│   │  │ CA Org1 : 7054  │     │   │  │ CA Org2 : 8054  │         │   │
│   │  └─────────────────┘     │   │  └─────────────────┘         │   │
│   │                          │   │                               │   │
│   │  ┌─────────────────┐     │   │  ┌─────────────────┐         │   │
│   │  │ Peer0    : 7051 │     │   │  │ Peer0    : 9051 │         │   │
│   │  │ CC       : 7052 │     │   │  │ CC       : 9052 │         │   │
│   │  └────────┬────────┘     │   │  └────────┬────────┘         │   │
│   │           │              │   │           │                   │   │
│   │  ┌────────▼────────┐     │   │  ┌────────▼────────┐         │   │
│   │  │ CouchDB0 :5984  │     │   │  │ CouchDB1 :6984  │         │   │
│   │  └─────────────────┘     │   │  └─────────────────┘         │   │
│   └──────────────────────────┘   └───────────────────────────────┘   │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │                CLI (fabric-tools:2.2)                    │      │
│   │   → Channel management, Chaincode lifecycle              │      │
│   └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Mapping Organisasi ke Studi Kasus

| Organisasi | MSP ID | Peran Bisnis | Deskripsi |
|---|---|---|---|
| **Org1Eksportir** | `Org1EksportirMSP` | Eksportir | Pihak pengirim barang, mendaftarkan container & pengiriman |
| **Org2Importir** | `Org2ImportirMSP` | Importir | Pihak penerima barang, memverifikasi & menerima pengiriman |
| **OrdererOrg** | `OrdererMSP` | Ordering Service | Mengatur urutan transaksi menggunakan EtcdRaft consensus |

---

## 3. File Konfigurasi

### 3.1. `cryptogen.yaml` — Konfigurasi Kriptografi

**Lokasi:** `/home/ervan/api-fabric/jp8-pbp/cryptogen.yaml`

**Fungsi:** Mendefinisikan struktur organisasi untuk generate material kriptografi (sertifikat X.509, private key) menggunakan tool `cryptogen`.

```yaml
OrdererOrgs:
  - Name: Orderer
    Domain: logistik.com
    EnableNodeOUs: true        # Memisahkan peran: admin, peer, client, orderer
    Specs:
      - Hostname: orderer      # → orderer.logistik.com

PeerOrgs:
  - Name: Org1Eksportir
    Domain: org1eksportir.logistik.com
    EnableNodeOUs: true
    Template:
      Count: 1                 # 1 peer node per organisasi
    Users:
      Count: 1                 # 1 regular user + 1 Admin (otomatis)

  - Name: Org2Importir
    Domain: org2importir.logistik.com
    EnableNodeOUs: true
    Template:
      Count: 1
    Users:
      Count: 1
```

**Perintah generate:**
```bash
export PATH=/home/ervan/fabric-samples/bin:$PATH
cryptogen generate --config=./cryptogen.yaml --output=./crypto-config
```

**Hasil:** 85 file sertifikat dalam struktur `crypto-config/`

### Struktur Crypto Material yang Dihasilkan

```
crypto-config/
├── ordererOrganizations/logistik.com/
│   ├── ca/                           → Root CA certificate & private key
│   ├── msp/
│   │   ├── admincerts/               → Admin certificates
│   │   ├── cacerts/                  → CA certificates
│   │   └── tlscacerts/               → TLS CA certificates
│   ├── orderers/orderer.logistik.com/
│   │   ├── msp/
│   │   │   ├── cacerts/              → CA cert (ca.logistik.com-cert.pem)
│   │   │   ├── keystore/             → Private key (priv_sk)
│   │   │   ├── signcerts/            → Signing cert (orderer.logistik.com-cert.pem)
│   │   │   └── tlscacerts/           → TLS CA cert
│   │   └── tls/
│   │       ├── ca.crt                → TLS CA certificate
│   │       ├── server.crt            → TLS server certificate
│   │       └── server.key            → TLS server private key
│   ├── tlsca/                        → TLS CA certificate & key
│   └── users/Admin@logistik.com/
│       ├── msp/                      → Admin MSP identity
│       └── tls/                      → Admin TLS certificates
│
├── peerOrganizations/org1eksportir.logistik.com/
│   ├── ca/
│   │   ├── ca.org1eksportir.logistik.com-cert.pem
│   │   └── priv_sk
│   ├── msp/
│   │   ├── config.yaml               → NodeOUs configuration
│   │   ├── admincerts/
│   │   ├── cacerts/
│   │   └── tlscacerts/
│   ├── peers/peer0.org1eksportir.logistik.com/
│   │   ├── msp/  (signcerts, keystore, cacerts, tlscacerts, config.yaml)
│   │   └── tls/  (server.crt, server.key, ca.crt)
│   ├── tlsca/
│   └── users/
│       ├── Admin@org1eksportir.logistik.com/ (msp + tls)
│       └── User1@org1eksportir.logistik.com/ (msp + tls)
│
└── peerOrganizations/org2importir.logistik.com/
    └── (struktur identik dengan Org1Eksportir)
```

---

### 3.2. `configtx.yaml` — Konfigurasi Channel & Konsensus

**Lokasi:** `/home/ervan/api-fabric/jp8-pbp/configtx.yaml`

**Fungsi:** Mendefinisikan organisasi, policies, capabilities, dan profiles untuk generate genesis block dan channel transactions.

#### Komponen Utama:

**a) Organizations & Policies:**

| Organisasi | MSP ID | Policy Readers | Policy Writers | Policy Admins |
|---|---|---|---|---|
| OrdererOrg | OrdererMSP | `OR('OrdererMSP.member')` | `OR('OrdererMSP.member')` | `OR('OrdererMSP.admin')` |
| Org1Eksportir | Org1EksportirMSP | `OR(admin, peer, client)` | `OR(admin, client)` | `OR(admin)` |
| Org2Importir | Org2ImportirMSP | `OR(admin, peer, client)` | `OR(admin, client)` | `OR(admin)` |

**b) Consensus & Ordering:**

| Parameter | Nilai | Penjelasan |
|---|---|---|
| OrdererType | **EtcdRaft** | Consensus protocol crash fault tolerant |
| BatchTimeout | 2s | Waktu tunggu sebelum membuat blok |
| MaxMessageCount | 10 | Maks transaksi per blok |
| AbsoluteMaxBytes | 99 MB | Ukuran maks blok |
| PreferredMaxBytes | 512 KB | Ukuran preferensi blok |

**c) Anchor Peers:**

| Organisasi | Host | Port |
|---|---|---|
| Org1Eksportir | peer0.org1eksportir.logistik.com | 7051 |
| Org2Importir | peer0.org2importir.logistik.com | 9051 |

**d) Capabilities:** Channel V2_0, Orderer V2_0, Application V2_0

**e) Profiles:**
- `TwoOrgsOrdererGenesis` — Untuk generate genesis block (system channel)
- `TwoOrgsChannel` — Untuk generate channel transaction (application channel)

---

### 3.3. `docker-compose.yaml` — Orkestrasi Container

**Lokasi:** `/home/ervan/api-fabric/jp8-pbp/docker-compose.yaml`

**Fungsi:** Mendefinisikan dan menjalankan seluruh service Hyperledger Fabric dalam container Docker.

#### Daftar Services (8 Container):

| # | Service | Container Name | Image | Port | Fungsi |
|---|---|---|---|---|---|
| 1 | Orderer | `orderer.logistik.com` | `fabric-orderer:2.2` | 7050 | Ordering service, mengatur urutan transaksi |
| 2 | CA Org1 | `ca.org1eksportir.logistik.com` | `fabric-ca:1.5` | 7054 | Certificate Authority untuk Org1 |
| 3 | CA Org2 | `ca.org2importir.logistik.com` | `fabric-ca:1.5` | 8054 | Certificate Authority untuk Org2 |
| 4 | CouchDB0 | `couchdb0` | `couchdb:3.1.1` | 5984 | State database untuk Org1 |
| 5 | CouchDB1 | `couchdb1` | `couchdb:3.1.1` | 6984 | State database untuk Org2 |
| 6 | Peer Org1 | `peer0.org1eksportir.logistik.com` | `fabric-peer:2.2` | 7051 | Peer node Eksportir |
| 7 | Peer Org2 | `peer0.org2importir.logistik.com` | `fabric-peer:2.2` | 9051 | Peer node Importir |
| 8 | CLI | `cli` | `fabric-tools:2.2` | — | Tool untuk manage channel & chaincode |

#### Fitur Keamanan & Performa:

- **TLS Enabled** — Semua komunikasi antar-node terenkripsi
- **EtcdRaft Consensus** — Enterprise-grade crash fault tolerant
- **CouchDB** — State database mendukung rich query (JSON query)
- **Gossip Protocol** — Peer discovery & data dissemination otomatis
- **Docker Named Volumes** — Persistensi data ledger antar restart
- **Network Isolation** — Semua container dalam 1 Docker network terisolasi

#### Dependency Chain:

```
CA Org1 ──────────────────────────────────┐
CA Org2 ──────────────────────────────────┤
CouchDB0 → Peer0 Org1 ──┐                │
CouchDB1 → Peer0 Org2 ──┤                │
Orderer ─────────────────┼──→ CLI         │
                         └────────────────┘
```

---

## 4. Channel Artifacts

**Lokasi:** `channel-artifacts/`

### File yang di-generate:

| File | Ukuran | Fungsi | Perintah Generate |
|---|---|---|---|
| `genesis.block` | 20,288 bytes | System channel genesis block | `configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block` |
| `mychannel.tx` | 471 bytes | Channel creation transaction | `configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/mychannel.tx -channelID mychannel` |
| `Org1EksportirMSPanchors.tx` | 334 bytes | Anchor peer update Org1 | `configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1EksportirMSPanchors.tx -channelID mychannel -asOrg Org1Eksportir` |
| `Org2ImportirMSPanchors.tx` | 331 bytes | Anchor peer update Org2 | `configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2ImportirMSPanchors.tx -channelID mychannel -asOrg Org2Importir` |

---

## 5. Langkah Deployment

### Prasyarat
- Docker Engine ≥ 20.x
- Docker Compose ≥ v2
- Hyperledger Fabric Binaries v2.2 (di `fabric-samples/bin/`)

### Step-by-step:

```bash
# Set PATH ke Fabric binaries
export PATH=/home/ervan/fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=/home/ervan/api-fabric/jp8-pbp

# ──────────────────────────────────────────────────────────
# STEP 1: Generate Crypto Material (jika belum ada)
# ──────────────────────────────────────────────────────────
cryptogen generate --config=./cryptogen.yaml --output=./crypto-config

# ──────────────────────────────────────────────────────────
# STEP 2: Generate Genesis Block
# ──────────────────────────────────────────────────────────
configtxgen -profile TwoOrgsOrdererGenesis \
  -channelID system-channel \
  -outputBlock ./channel-artifacts/genesis.block

# ──────────────────────────────────────────────────────────
# STEP 3: Generate Channel Transaction
# ──────────────────────────────────────────────────────────
configtxgen -profile TwoOrgsChannel \
  -outputCreateChannelTx ./channel-artifacts/mychannel.tx \
  -channelID mychannel

# ──────────────────────────────────────────────────────────
# STEP 4: Generate Anchor Peer Updates
# ──────────────────────────────────────────────────────────
configtxgen -profile TwoOrgsChannel \
  -outputAnchorPeersUpdate ./channel-artifacts/Org1EksportirMSPanchors.tx \
  -channelID mychannel -asOrg Org1Eksportir

configtxgen -profile TwoOrgsChannel \
  -outputAnchorPeersUpdate ./channel-artifacts/Org2ImportirMSPanchors.tx \
  -channelID mychannel -asOrg Org2Importir

# ──────────────────────────────────────────────────────────
# STEP 5: Start Docker Network
# ──────────────────────────────────────────────────────────
docker-compose up -d

# Verifikasi semua container berjalan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Operasional Channel (via CLI Container):

```bash
# Masuk ke CLI container
docker exec -it cli bash

# ──────────────────────────────────────────────────────────
# STEP 6: Create Channel
# ──────────────────────────────────────────────────────────
peer channel create -o orderer.logistik.com:7050 -c mychannel \
  -f ./channel-artifacts/mychannel.tx \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/logistik.com/orderers/orderer.logistik.com/msp/tlscacerts/tlsca.logistik.com-cert.pem

# ──────────────────────────────────────────────────────────
# STEP 7: Join Channel — Org1 Eksportir
# ──────────────────────────────────────────────────────────
peer channel join -b mychannel.block

# ──────────────────────────────────────────────────────────
# STEP 8: Update Anchor Peer — Org1 Eksportir
# ──────────────────────────────────────────────────────────
peer channel update -o orderer.logistik.com:7050 -c mychannel \
  -f ./channel-artifacts/Org1EksportirMSPanchors.tx \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/logistik.com/orderers/orderer.logistik.com/msp/tlscacerts/tlsca.logistik.com-cert.pem

# ──────────────────────────────────────────────────────────
# STEP 9: Join Channel — Org2 Importir (switch environment)
# ──────────────────────────────────────────────────────────
export CORE_PEER_ADDRESS=peer0.org2importir.logistik.com:9051
export CORE_PEER_LOCALMSPID=Org2ImportirMSP
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2importir.logistik.com/users/Admin@org2importir.logistik.com/msp
export CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2importir.logistik.com/peers/peer0.org2importir.logistik.com/tls/server.crt
export CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2importir.logistik.com/peers/peer0.org2importir.logistik.com/tls/server.key
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2importir.logistik.com/peers/peer0.org2importir.logistik.com/tls/ca.crt

peer channel join -b mychannel.block

# ──────────────────────────────────────────────────────────
# STEP 10: Update Anchor Peer — Org2 Importir
# ──────────────────────────────────────────────────────────
peer channel update -o orderer.logistik.com:7050 -c mychannel \
  -f ./channel-artifacts/Org2ImportirMSPanchors.tx \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/logistik.com/orderers/orderer.logistik.com/msp/tlscacerts/tlsca.logistik.com-cert.pem
```

---

## 6. Perintah Berguna

```bash
# Melihat status semua container
docker ps

# Melihat log orderer
docker logs orderer.logistik.com

# Melihat log peer Org1
docker logs peer0.org1eksportir.logistik.com

# Mematikan network
docker-compose down

# Mematikan network + hapus volume (reset total)
docker-compose down -v

# Masuk ke CouchDB Org1 (browser)
# http://localhost:5984/_utils  (admin/adminpw)

# Masuk ke CouchDB Org2 (browser)
# http://localhost:6984/_utils  (admin/adminpw)
```

---

## 7. Struktur Direktori Lengkap

```
jp8-pbp/
├── cryptogen.yaml                    → Konfigurasi pembuatan sertifikat
├── configtx.yaml                     → Konfigurasi channel & konsensus
├── docker-compose.yaml               → Orkestrasi 8 container Docker
│
├── crypto-config/                    → Material kriptografi (85 file)
│   ├── ordererOrganizations/
│   │   └── logistik.com/             → Orderer MSP & TLS certs
│   └── peerOrganizations/
│       ├── org1eksportir.logistik.com/  → Eksportir MSP & TLS certs
│       └── org2importir.logistik.com/   → Importir MSP & TLS certs
│
├── channel-artifacts/                → Artifacts channel
│   ├── genesis.block                 → Genesis block (system channel)
│   ├── mychannel.tx                  → Channel creation transaction
│   ├── Org1EksportirMSPanchors.tx    → Anchor peer update Org1
│   └── Org2ImportirMSPanchors.tx     → Anchor peer update Org2
│
├── fabric-samples/                   → Hyperledger Fabric samples & binaries
│   └── bin/                          → cryptogen, configtxgen, peer, orderer, dll
│
└── PBP-Hyperledger-Traceability-Kelompok7/
    ├── backend/                      → REST API (Express.js + Fabric SDK)
    ├── chaincode/                    → Smart contract (Go)
    ├── docs/                         → Dokumentasi
    └── frontend/                     → Web interface
```

---

## 8. Port Mapping

| Port | Service | Protokol | Akses |
|---|---|---|---|
| 7050 | Orderer | gRPC + TLS | Internal network |
| 7051 | Peer0 Org1 Eksportir | gRPC + TLS | Internal + SDK |
| 7054 | CA Org1 Eksportir | HTTPS | Enrollment/Registration |
| 8054 | CA Org2 Importir | HTTPS | Enrollment/Registration |
| 9051 | Peer0 Org2 Importir | gRPC + TLS | Internal + SDK |
| 5984 | CouchDB Org1 | HTTP | Web UI (admin/adminpw) |
| 6984 | CouchDB Org2 | HTTP | Web UI (admin/adminpw) |

---

*Dokumen ini dibuat sebagai deliverable Anggota 1 (Infrastruktur & DevOps) — Tugas PBP Hyperledger Fabric Traceability*
