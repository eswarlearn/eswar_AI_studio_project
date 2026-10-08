# Complete Software Infrastructure & Networking Roadmap

## Absolute Beginner → Advanced Professional

This roadmap is designed to take a software developer from computer and networking fundamentals to production architecture, cloud, DevOps, CI/CD, and advanced distributed systems.

---

# PHASE 1 — Computer Fundamentals

## Module 1 — How Computers Actually Work

### Topics
- What is a computer?
- CPU
- RAM
- SSD/HDD
- Motherboard
- BIOS/UEFI
- GPU
- Cache Memory
- Registers
- Bus Architecture
- Input Devices
- Output Devices

### Understand
- How programs execute
- How memory works
- What happens when you open Chrome
- Why RAM is fast
- Why SSD is faster than HDD
- How hardware components communicate

---

## Module 2 — Operating Systems

### Topics
- What is an Operating System?
- Kernel
- User Space
- Kernel Space
- Processes
- Threads
- CPU Scheduling
- Context Switching
- Interrupts
- Virtual Memory
- Paging
- Swapping
- File Systems
- Device Drivers
- Permissions
- Users and Groups
- Environment Variables
- Services/Daemons

### Windows
- Task Manager
- Services
- CMD
- PowerShell

### Linux
- `pwd`
- `ls`
- `cd`
- `cp`
- `mv`
- `rm`
- `mkdir`
- `cat`
- `less`
- `grep`
- `find`
- `chmod`
- `chown`
- `ps`
- `top`
- `htop`
- `kill`
- `systemctl`
- `journalctl`
- `netstat`
- `ss`

### Understand
- Why Linux dominates servers
- Why PHP applications commonly run on Linux
- Why Docker relies heavily on Linux concepts
- How an OS manages CPU, memory, files, users, and networking

---

# PHASE 2 — Networking Fundamentals

## Module 3 — What Is Networking?

### Topics
- What is a network?
- Why networks exist
- Network nodes
- LAN
- WAN
- Internet
- Intranet
- Extranet
- ISP
- Router
- Switch
- Hub
- Modem
- Access Point
- Network Interface Card
- Ethernet
- Wi-Fi

### Understand
- How two computers communicate
- How your laptop reaches another computer
- How your laptop eventually reaches Google

---

## Module 4 — IP Addressing

### Topics
- IPv4
- IPv6
- Public IP
- Private IP
- Static IP
- Dynamic IP
- Loopback
- `127.0.0.1`
- `localhost`
- Network Address
- Broadcast Address
- Subnet
- Subnet Mask
- CIDR
- Default Gateway
- NAT
- DHCP

### Questions to Answer
- Why does `localhost` work?
- Why do private IPs often look like `192.168.x.x`?
- Why do devices need IP addresses?
- Why is a public IP required to expose a server to the Internet?
- What happens when your home router performs NAT?

---

## Module 5 — Ports

### Topics
- What is a port?
- Why ports exist
- TCP Ports
- UDP Ports
- Port Binding
- Listening Ports
- Ephemeral Ports
- Port Forwarding
- Firewall Ports

### Important Ports

| Port | Common Use |
|---:|---|
| 20 | FTP Data |
| 21 | FTP |
| 22 | SSH |
| 25 | SMTP |
| 53 | DNS |
| 80 | HTTP |
| 110 | POP3 |
| 143 | IMAP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 27017 | MongoDB |
| 3000 | Common Node.js Development Port |
| 4200 | Common Angular Development Port |
| 5173 | Common Vite Development Port |
| 8080 | Common Alternate HTTP Port |

### Questions
- Why does a server need ports?
- Why can multiple applications run on the same machine?
- Why can't two applications normally listen on the same IP/port combination?
- Why does a Node.js development server often use port 3000?
- Why does HTTPS use port 443?

---

## Module 6 — Client & Server

### Topics
- What is a client?
- What is a server?
- Client-server architecture
- Browser
- Web Server
- Application Server
- Database Server
- File Server
- Mail Server
- API Server

### Example

```text
Browser
   ↓
Web Server
   ↓
Application Server
   ↓
Database
   ↓
Application Server
   ↓
Web Server
   ↓
Browser
```

### Understand
- Request/response model
- Client responsibilities
- Server responsibilities
- Why servers exist
- Why backend code runs on servers

---

## Module 7 — Network Protocols

### Topics
- HTTP
- HTTPS
- FTP
- SFTP
- SMTP
- POP3
- IMAP
- SSH
- TCP
- UDP
- DNS
- DHCP
- ARP
- ICMP
- NTP
- WebSocket
- gRPC
- MQTT

### Understand
- Why protocols exist
- What problem each protocol solves
- Which protocol is used at which layer
- When to use TCP vs UDP

---

## Module 8 — TCP/IP & OSI

### Topics
- OSI Model
- TCP/IP Model
- Seven OSI Layers
- Encapsulation
- Decapsulation
- Packet
- Frame
- Segment
- Datagram
- MTU
- TCP Three-Way Handshake
- Connection Termination
- TCP Reliability
- Retransmission
- Flow Control
- Congestion Control
- Sliding Window
- TCP Flags
- UDP

### Understand
- What happens to data as it travels through a network
- How TCP establishes a connection
- Why TCP is reliable
- Why UDP is faster but does not provide TCP-style reliability

---

## Module 9 — DNS

### Topics
- What is DNS?
- Domain Name
- DNS Resolver
- Recursive DNS Server
- Authoritative DNS Server
- Root DNS Servers
- TLD Servers
- DNS Cache
- TTL

### DNS Records
- A
- AAAA
- CNAME
- MX
- TXT
- NS
- SRV
- PTR

### Understand
```text
google.com
     ↓
DNS Lookup
     ↓
IP Address
     ↓
Server
```

- How a domain becomes an IP
- DNS resolution flow
- DNS caching
- DNS propagation
- What happens when DNS records change

---

## Module 10 — URLs and Domains

### Topics
- URI
- URL
- URN
- Protocol/Scheme
- Hostname
- Domain
- Subdomain
- TLD
- Path
- Query String
- Fragment
- Port

### Example

```text
https://api.example.com:443/users?id=10#profile
```

Understand every component of this URL.

---

# PHASE 3 — Web Servers

## Module 11 — Apache

### Topics
- Apache Architecture
- Virtual Hosts
- `.htaccess`
- Apache Modules
- Rewrite Rules
- URL Rewriting
- Reverse Proxy
- Logging
- Access Logs
- Error Logs
- Compression
- Caching
- PHP Integration

### Understand
- How Apache receives requests
- How Apache connects to PHP
- How multiple domains can run on one server

---

## Module 12 — Nginx

### Topics
- Nginx Architecture
- Static File Serving
- Reverse Proxy
- Load Balancing
- PHP-FPM
- FastCGI
- SSL/TLS
- Caching
- Compression
- Connection Handling
- Performance

### Understand
```text
Internet
   ↓
Nginx
   ↓
PHP-FPM / Node.js
   ↓
Application
```

---

## Module 13 — IIS

### Topics
- IIS Basics
- Windows Hosting
- Sites
- Application Pools
- Bindings
- IIS Reverse Proxy
- Logs
- SSL

---

# PHASE 4 — Backend Runtimes

## Module 14 — PHP Runtime

### Topics
- PHP Interpreter
- Apache + PHP
- PHP-FPM
- FastCGI
- Request Lifecycle
- PHP Process Model
- Sessions
- Cookies
- Memory
- Output Buffering
- OPcache
- Environment Variables

### Understand
- Why PHP code executes on a server
- What happens when `/index.php` is requested
- How PHP generates an HTTP response

---

## Module 15 — Node.js Runtime

### Topics
- What is Node.js?
- V8 Engine
- libuv
- Event Loop
- Single-Threaded JavaScript Execution
- Worker Threads
- Async Operations
- Callbacks
- Promises
- Streams
- Buffers
- Child Processes
- Cluster
- PM2
- Process Managers

### Understand
- Why Node.js runs outside the browser
- How Node.js handles network requests
- How asynchronous I/O works
- Why Node.js can handle many concurrent connections

---

## Module 16 — Next.js

### Topics
- React vs Next.js
- Client-Side Rendering
- Server-Side Rendering
- Static Site Generation
- Incremental Static Regeneration
- Hydration
- Server Components
- Client Components
- API Routes
- Route Handlers
- Middleware
- Edge Runtime
- Node.js Runtime
- Deployment

### Understand
- Why some Next.js code runs on the server
- Why some code runs in the browser
- How SSR works
- How Next.js is deployed

---

# PHASE 5 — Web Security

## Module 17 — HTTPS, SSL & TLS

### Topics
- HTTP
- HTTPS
- SSL
- TLS
- TLS Handshake
- Certificates
- Certificate Authorities
- CSR
- Private Key
- Public Key
- Symmetric Encryption
- Asymmetric Encryption
- Hashing
- Digital Signatures
- Certificate Validation
- Certificate Expiration
- Let's Encrypt

### Understand
```text
Browser
   ↓
TLS Handshake
   ↓
Certificate Verification
   ↓
Encrypted Connection
   ↓
HTTPS Request
```

### Important Clarification

SSL is the older technology. Modern HTTPS uses TLS.

---

## Module 18 — SSH

### Topics
- What is SSH?
- Why SSH exists
- SSH Client
- SSH Server
- SSH Port
- Password Authentication
- Public Key Authentication
- Private Key
- Public Key
- SSH Agent
- `ssh`
- `scp`
- `rsync`
- `~/.ssh`
- `authorized_keys`
- SSH Permissions
- Bastion/Jump Hosts

### Understand
- How developers securely access Linux servers
- How SSH keys work
- How deployment servers can securely access machines

---

## Module 19 — Web/Application Security

### Topics
- Authentication
- Authorization
- Cookies
- Sessions
- JWT
- OAuth 2.0
- OpenID Connect
- CORS
- CSRF
- XSS
- SQL Injection
- Command Injection
- Clickjacking
- Security Headers
- Rate Limiting
- Secrets Management
- Password Hashing

---

# PHASE 6 — Databases

## Module 20 — Database Fundamentals

### Databases
- MySQL
- PostgreSQL
- MongoDB
- Redis
- SQLite

### Topics
- Database Server
- Connection
- Port
- Authentication
- Authorization
- Indexes
- Transactions
- Locks
- Replication
- Backups
- Connection Pooling
- Read Replicas
- High Availability

---

# PHASE 7 — Cloud Storage

## Module 21 — AWS S3

### Topics
- What is S3?
- Buckets
- Objects
- Object Keys
- Regions
- Storage Classes
- Versioning
- Lifecycle Policies
- Public vs Private Objects
- Bucket Policies
- IAM
- Access Control
- Pre-Signed URLs
- Multipart Upload
- Static Website Hosting
- Encryption
- S3 Events

### Related
- AWS CloudFront
- CDN
- Cache
- Cache Invalidation

### Understand
```text
Application
    ↓
S3 Bucket
    ↓
Object Storage
    ↓
CloudFront
    ↓
User
```

---

## Module 22 — Azure Blob Storage

### Topics
- Azure Storage Account
- Blob Storage
- Containers
- Blobs
- Access Tiers
- Shared Access Signature
- Access Policies
- Private/Public Access
- Lifecycle Management
- Azure CDN
- Storage Security

---

# PHASE 8 — Hosting & Cloud

## Module 23 — Hosting Models

### Topics
- Shared Hosting
- VPS
- Dedicated Server
- Bare Metal
- Cloud Hosting
- Virtual Machines
- Serverless
- PaaS
- IaaS
- SaaS

### Understand
- What a server actually is
- Physical vs virtual servers
- Why cloud providers use virtualization

---

## Module 24 — Domain to Production Website

### Topics
- Buying a Domain
- Domain Registrar
- DNS
- DNS Records
- Public IP
- Hosting
- Server
- Nginx/Apache
- SSL/TLS
- Reverse Proxy
- Application Port
- Firewall
- Deployment
- Environment Variables

### End-to-End

```text
User
 ↓
Domain
 ↓
DNS
 ↓
Public IP
 ↓
Server
 ↓
Nginx
 ↓
Application
 ↓
Database
```

---

# PHASE 9 — Git & Source Control

## Module 25 — Git Fundamentals

### Topics
- Git
- Repository
- Working Tree
- Staging Area
- Commit
- Branch
- Merge
- Rebase
- Remote
- Pull
- Push
- Fetch
- Clone
- Tags
- Merge Conflicts
- Pull Requests
- Code Review

### Platforms
- Bitbucket
- GitHub
- GitLab

---

# PHASE 10 — Docker

## Module 26 — Docker Fundamentals

### Topics
- Containers
- Images
- Docker Engine
- Dockerfile
- Docker Compose
- Volumes
- Networks
- Environment Variables
- Container Lifecycle
- Registry
- Docker Hub
- Build
- Run
- Logs
- Exec
- Inspect
- Port Mapping

### Networking
- Bridge Network
- Host Network
- Container-to-Container Communication
- DNS inside Docker

### Understand
```text
Host Machine
    ↓
Docker Engine
    ↓
Container
    ↓
Application
```

---

# PHASE 11 — CI/CD

## Module 27 — CI/CD Fundamentals

### Topics
- Continuous Integration
- Continuous Delivery
- Continuous Deployment
- Build
- Test
- Package
- Artifact
- Release
- Deploy
- Rollback
- Environment
- Development
- QA
- Staging
- Production

### Typical Flow

```text
Developer
   ↓
Git Push
   ↓
Bitbucket
   ↓
Pipeline
   ↓
Build
   ↓
Tests
   ↓
Artifact
   ↓
Staging
   ↓
Approval
   ↓
Production
```

---

## Module 28 — CI/CD Tools

### Topics
- Bitbucket Pipelines
- GitHub Actions
- GitLab CI/CD
- Azure DevOps
- Jenkins
- CircleCI

### Understand
- Pipeline triggers
- Build agents/runners
- Secrets
- Environment variables
- Artifacts
- Deployment strategies
- Rollbacks

---

# PHASE 12 — DevOps

## Module 29 — Infrastructure as Code

### Topics
- Infrastructure as Code
- Terraform
- Ansible
- CloudFormation
- State
- Providers
- Resources
- Modules
- Variables
- Outputs
- Secrets

### Understand
How infrastructure can be created using code instead of manually clicking through cloud consoles.

---

## Module 30 — Monitoring & Observability

### Topics
- Logging
- Metrics
- Tracing
- Monitoring
- Alerting
- Health Checks
- Application Monitoring
- Server Monitoring
- CPU
- RAM
- Disk
- Network
- Latency
- Error Rate
- Throughput

### Tools
- Prometheus
- Grafana
- ELK Stack
- OpenTelemetry

---

# PHASE 13 — Kubernetes

## Module 31 — Kubernetes Fundamentals

### Topics
- Kubernetes
- Cluster
- Node
- Control Plane
- Pod
- Deployment
- ReplicaSet
- Service
- Ingress
- Namespace
- ConfigMap
- Secret
- Persistent Volume
- Persistent Volume Claim
- StatefulSet
- DaemonSet
- Job
- CronJob

### Advanced
- Helm
- Horizontal Pod Autoscaler
- Kubernetes Networking
- Network Policies
- Service Discovery
- Rolling Updates

---

# PHASE 14 — Scaling

## Module 32 — Application Scaling

### Topics
- Vertical Scaling
- Horizontal Scaling
- Load Balancer
- Reverse Proxy
- Sticky Sessions
- Stateless Applications
- Session Storage
- Redis
- Caching
- CDN
- Rate Limiting
- Connection Pooling
- Queue Systems

### Message Systems
- RabbitMQ
- Kafka

### Understand
How one server becomes multiple servers.

```text
                 ┌── Server 1
User → LB ───────┼── Server 2
                 └── Server 3
```

---

# PHASE 15 — Production Architecture

## Module 33 — High Availability & Deployment Strategies

### Topics
- High Availability
- Failover
- Redundancy
- Replication
- Backups
- Disaster Recovery
- Recovery Point Objective
- Recovery Time Objective
- Blue-Green Deployment
- Canary Deployment
- Rolling Deployment
- Zero-Downtime Deployment
- Rollback

---

# PHASE 16 — Software Architecture

## Module 34 — Application Architecture

### Topics
- Monolithic Architecture
- Modular Monolith
- Microservices
- Service-Oriented Architecture
- REST APIs
- GraphQL
- gRPC
- WebSockets
- API Gateway
- Authentication Service
- Authorization
- Service Discovery
- Event-Driven Architecture
- Message Brokers
- CQRS
- Saga Pattern

---

# PHASE 17 — Cloud Networking

## Module 35 — AWS/Azure Networking

### Topics
- VPC
- Virtual Network
- Subnets
- Public Subnet
- Private Subnet
- Route Tables
- Internet Gateway
- NAT Gateway
- Security Groups
- Network ACLs
- Firewalls
- Load Balancers
- Private Endpoints
- VPN
- Peering
- DNS
- Availability Zones
- Regions

### Understand

```text
Internet
   ↓
Load Balancer
   ↓
Public Subnet
   ↓
Private Application Servers
   ↓
Private Database
```

---

# PHASE 18 — Advanced Security & Infrastructure

## Module 36 — Advanced Security

### Topics
- Web Application Firewall
- DDoS Protection
- Firewall
- VPN
- Zero Trust
- Network Segmentation
- IAM
- Least Privilege
- Secrets Management
- Key Management
- Encryption at Rest
- Encryption in Transit
- Security Auditing
- Vulnerability Scanning

---

# PHASE 19 — Distributed Systems

## Module 37 — Distributed Systems Fundamentals

### Topics
- Distributed Systems
- CAP Theorem
- Consistency
- Availability
- Partition Tolerance
- Strong Consistency
- Eventual Consistency
- Distributed Transactions
- Distributed Locks
- Leader Election
- Replication
- Sharding
- Partitioning
- Consensus
- Idempotency
- Retries
- Timeouts
- Circuit Breakers
- Backpressure

---

# PHASE 20 — Advanced Networking & Infrastructure

## Module 38 — Advanced Networking

### Topics
- Reverse Proxy
- Forward Proxy
- Load Balancer
- Layer 4 Load Balancing
- Layer 7 Load Balancing
- Service Mesh
- Envoy
- Istio
- Linkerd
- Network Policies
- BGP Basics
- Routing
- NAT
- VPN
- Tunneling
- DNS Advanced Concepts
- Anycast
- CDN Architecture
- Edge Computing

---

# PHASE 21 — Performance Engineering

## Module 39 — Performance

### Topics
- Latency
- Throughput
- Requests Per Second
- CPU Profiling
- Memory Profiling
- Network Latency
- Database Latency
- Query Optimization
- Connection Pooling
- Caching
- CDN
- Compression
- HTTP/2
- HTTP/3
- QUIC
- Keep-Alive
- Load Testing
- Stress Testing
- Capacity Planning

---

# PHASE 22 — Complete Production Lifecycle

## Module 40 — From Code to Production

You should be able to understand and perform the complete lifecycle:

### Step 1 — Development

```text
Developer
   ↓
Local Machine
   ↓
Code
```

### Step 2 — Git

```text
Code
 ↓
Git
 ↓
Bitbucket/GitHub/GitLab
```

### Step 3 — CI

```text
Push
 ↓
Pipeline
 ↓
Build
 ↓
Test
 ↓
Package
```

### Step 4 — Infrastructure

```text
Cloud
 ↓
VPC
 ↓
Subnet
 ↓
Server
 ↓
Security
```

### Step 5 — Deployment

```text
Pipeline
 ↓
Artifact/Image
 ↓
Server/Container/Kubernetes
 ↓
Application
```

### Step 6 — Networking

```text
Domain
 ↓
DNS
 ↓
Load Balancer
 ↓
Reverse Proxy
 ↓
Application
```

### Step 7 — Storage

```text
Application
 ↓
S3 / Azure Blob
 ↓
CDN
 ↓
User
```

### Step 8 — Database

```text
Application
 ↓
Database
 ↓
Cache
```

### Step 9 — Security

```text
HTTPS
TLS
IAM
Firewall
Secrets
Authentication
Authorization
```

### Step 10 — Operations

```text
Logs
 ↓
Metrics
 ↓
Tracing
 ↓
Alerts
 ↓
Incident Response
```

---

# PHASE 23 — Senior/5-Year Engineer Level

## Module 41 — Advanced Professional Concepts

### Identity & Security
- OAuth 2.0
- OpenID Connect
- SAML
- IAM
- RBAC
- ABAC
- Zero Trust

### Infrastructure
- Kubernetes
- Service Mesh
- Infrastructure as Code
- Terraform
- Ansible
- Cloud Architecture

### Distributed Systems
- CAP Theorem
- Consistency Models
- Distributed Transactions
- Consensus
- Sharding
- Replication
- Event Streaming

### Reliability
- SRE Fundamentals
- SLIs
- SLOs
- SLAs
- Error Budgets
- Incident Management
- Disaster Recovery

### Performance
- Capacity Planning
- Load Testing
- Bottleneck Analysis
- Caching Strategies
- Database Optimization
- Network Optimization

### Cost
- Cloud Cost Optimization
- Resource Right-Sizing
- Storage Optimization
- Compute Optimization
- CDN Optimization

---

# Final Practical Project

After learning the theory, build a complete production-style application.

## Architecture

```text
                         Internet
                            │
                            ▼
                         Domain
                            │
                            ▼
                           DNS
                            │
                            ▼
                      Load Balancer
                            │
                            ▼
                         Nginx
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
          React/Next.js             Node/PHP
             Frontend               Backend
                                        │
                        ┌───────────────┼───────────────┐
                        ▼               ▼               ▼
                     MySQL          MongoDB           Redis
                        │
                        │
                        ▼
                    S3 / Azure
                        │
                        ▼
                       CDN
```

## Deployment

```text
Developer
    ↓
Git
    ↓
Bitbucket
    ↓
CI/CD Pipeline
    ↓
Build
    ↓
Tests
    ↓
Docker Image
    ↓
Container Registry
    ↓
Production
    ↓
Kubernetes / VM
```

---

# Final Goal

By completing this roadmap, you should be able to explain and practically work with:

- Computers
- Operating Systems
- Linux
- Networking
- IP Addresses
- Ports
- TCP/IP
- DNS
- HTTP/HTTPS
- SSL/TLS
- SSH
- Apache
- Nginx
- PHP-FPM
- Node.js
- Next.js
- Databases
- S3
- Azure Blob Storage
- Domains
- Cloud
- Git
- Bitbucket
- Docker
- Kubernetes
- CI/CD
- DevOps
- Terraform
- Monitoring
- Logging
- Load Balancing
- Caching
- CDN
- Security
- Scaling
- Distributed Systems
- Production Deployment
- High Availability
- Disaster Recovery
- Performance Engineering

Most importantly, you should be able to trace a request from:

```text
User
 ↓
Browser
 ↓
DNS
 ↓
Internet
 ↓
IP
 ↓
Port
 ↓
Firewall
 ↓
Load Balancer
 ↓
Nginx/Apache
 ↓
PHP/Node.js/Next.js
 ↓
Redis
 ↓
Database
 ↓
S3/Azure
 ↓
Response
 ↓
Browser
```

and understand **what happens at every step**.
