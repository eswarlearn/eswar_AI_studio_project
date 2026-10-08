import { ArchitectureNode, ComponentId, InfrastructureComponent, SimulationMetrics, VisualPacket } from '../types/game';

export function calculateSimulationMetrics(
  nodes: ArchitectureNode[],
  components: Record<ComponentId, InfrastructureComponent>,
  targetRps: number,
  trafficPattern: 'constant' | 'spike' | 'retry-storm' = 'constant',
  chaosInjections: string[] = []
): SimulationMetrics {
  // Empty state handling
  if (!nodes || nodes.length === 0) {
    return {
      requestsPerSecond: 0,
      targetRps,
      latencyMs: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      errorRate: 1.0,
      cpuPercent: 0,
      memoryPercent: 0,
      activeConnections: 0,
      maxConnections: 100,
      queueDepth: 0,
      cacheHitRate: 0,
      hourlyCost: 0,
      revenuePerHour: 0,
      netProfitPerHour: 0,
      errorBudgetPercent: 100,
      sloCompliance: 0,
      isHealthy: false,
      statusMessage: 'No architecture components on canvas. Place a Client to begin.',
      activeChaosInjections: chaosInjections,
      representativePackets: [],
      nodeMetrics: {}
    };
  }

  // 1. Calculate Traffic Modifier based on pattern & Chaos
  let effectiveTargetRps = targetRps;
  if (trafficPattern === 'spike') {
    effectiveTargetRps = Math.round(targetRps * 1.6);
  } else if (trafficPattern === 'retry-storm') {
    effectiveTargetRps = Math.round(targetRps * 2.2);
  }

  // Chaos: DDoS volumetric flood
  const isDdosActive = chaosInjections.includes('ddos-flood');
  if (isDdosActive) {
    effectiveTargetRps += 35000;
  }

  // 2. Tally total hourly cost and component inventories
  let totalCost = 0;
  const nodeMap = new Map<string, ArchitectureNode>();
  const nodesByComponent: Partial<Record<ComponentId, ArchitectureNode[]>> = {};

  nodes.forEach(node => {
    nodeMap.set(node.instanceId, node);
    const comp = components[node.componentId];
    if (comp) {
      totalCost += comp.baseCost;
    }
    if (!nodesByComponent[node.componentId]) {
      nodesByComponent[node.componentId] = [];
    }
    nodesByComponent[node.componentId]!.push(node);
  });

  // 3. Topology validation: Client existence and connectivity
  const clientNodes = nodesByComponent['client'] || [];
  const hasClient = clientNodes.length > 0;
  
  if (!hasClient) {
    return {
      requestsPerSecond: 0,
      targetRps: effectiveTargetRps,
      latencyMs: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      errorRate: 1.0,
      cpuPercent: 0,
      memoryPercent: 0,
      activeConnections: 0,
      maxConnections: 100,
      queueDepth: 0,
      cacheHitRate: 0,
      hourlyCost: totalCost,
      revenuePerHour: 0,
      netProfitPerHour: -totalCost,
      errorBudgetPercent: 0,
      sloCompliance: 0,
      isHealthy: false,
      statusMessage: 'System Inactive: Architecture requires a Client component to initiate traffic.',
      activeChaosInjections: chaosInjections,
      representativePackets: [],
      nodeMetrics: {}
    };
  }

  // Check if client is connected to anything
  const clientConnected = clientNodes.some(c => (c.connections && c.connections.length > 0));
  if (!clientConnected && nodes.length > 1) {
    return {
      requestsPerSecond: 0,
      targetRps: effectiveTargetRps,
      latencyMs: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      errorRate: 1.0,
      cpuPercent: 0,
      memoryPercent: 0,
      activeConnections: 0,
      maxConnections: 100,
      queueDepth: 0,
      cacheHitRate: 0,
      hourlyCost: totalCost,
      revenuePerHour: 0,
      netProfitPerHour: -totalCost,
      errorBudgetPercent: 0,
      sloCompliance: 0,
      isHealthy: false,
      statusMessage: 'Unreachable: Client is not connected to any downstream server, load balancer, or gateway.',
      activeChaosInjections: chaosInjections,
      representativePackets: [],
      nodeMetrics: {}
    };
  }

  // 4. Trace reachable path from client
  const visited = new Set<string>();
  const reachableNodeIds = new Set<string>();
  const queue: string[] = [];

  clientNodes.forEach(c => {
    queue.push(c.instanceId);
    reachableNodeIds.add(c.instanceId);
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentNode = nodeMap.get(currentId);
    if (currentNode && currentNode.connections) {
      for (const targetId of currentNode.connections) {
        reachableNodeIds.add(targetId);
        if (!visited.has(targetId)) {
          queue.push(targetId);
        }
      }
    }
  }

  // Reachable component subsets
  const reachableNodes = nodes.filter(n => reachableNodeIds.has(n.instanceId));
  const hasServer = reachableNodes.some(n => 
    n.componentId === 'server' || n.componentId === 'docker-container' || n.componentId === 'k8s-pod'
  );
  const hasCDN = reachableNodes.some(n => n.componentId === 'cdn');
  const hasWAF = reachableNodes.some(n => n.componentId === 'waf-firewall');
  const hasNginx = reachableNodes.some(n => n.componentId === 'nginx-reverse-proxy');
  const hasLB = reachableNodes.some(n => n.componentId === 'load-balancer');
  const hasGateway = reachableNodes.some(n => n.componentId === 'api-gateway');
  const hasRedis = reachableNodes.some(n => n.componentId === 'redis');
  const hasKafka = reachableNodes.some(n => n.componentId === 'kafka');
  const hasRabbitMQ = reachableNodes.some(n => n.componentId === 'rabbitmq');
  const hasPostgres = reachableNodes.some(n => n.componentId === 'postgresql');
  const hasMongo = reachableNodes.some(n => n.componentId === 'mongodb');
  const hasS3 = reachableNodes.some(n => n.componentId === 's3-storage');
  const hasWorkers = reachableNodes.some(n => n.componentId === 'worker-service');
  const hasCircuitBreaker = reachableNodes.some(n => n.componentId === 'circuit-breaker');
  const hasDLQ = reachableNodes.some(n => n.componentId === 'dead-letter-queue');
  const hasServiceMesh = reachableNodes.some(n => n.componentId === 'service-mesh');

  // Compute tier nodes
  let computeNodes = reachableNodes.filter(n => 
    n.componentId === 'server' || n.componentId === 'docker-container' || n.componentId === 'k8s-pod'
  );

  // Chaos: Kill API Pod / Crash
  const isKillApiActive = chaosInjections.includes('kill-api');
  if (isKillApiActive && computeNodes.length > 0) {
    // 50% capacity loss or drop one compute node
    computeNodes = computeNodes.slice(1);
  }

  // 5. Calculate Traffic Absorption (Edge Caching, Security & WAF)
  let trafficAtOrigin = effectiveTargetRps;
  let cacheHitRate = 0;

  // WAF shields from DDoS and SQLi attacks
  if (isDdosActive) {
    if (hasWAF) {
      // WAF blocks 90% of malicious volumetric traffic
      trafficAtOrigin -= 32000;
    }
  }

  // CDN absorbs edge static requests
  if (hasCDN) {
    const cdnAbsorbed = Math.round(trafficAtOrigin * 0.45);
    trafficAtOrigin -= cdnAbsorbed;
    cacheHitRate += 0.35;
  }

  // Nginx reverse proxy micro-caching
  if (hasNginx) {
    const nginxAbsorbed = Math.round(trafficAtOrigin * 0.20);
    trafficAtOrigin -= nginxAbsorbed;
    cacheHitRate += 0.15;
  }

  // S3 storage absorbs static media & document writes
  if (hasS3) {
    trafficAtOrigin = Math.round(trafficAtOrigin * 0.88);
  }

  // Redis in-memory cache-aside absorbs repetitive backend read queries
  const isCacheFlushed = chaosInjections.includes('flush-cache');
  if (hasRedis && !isCacheFlushed) {
    const redisNode = reachableNodes.find(n => n.componentId === 'redis');
    let redisEfficacy = 0.50;
    if (redisNode?.cacheConfig?.strategy === 'cache-aside') redisEfficacy = 0.65;
    if (redisNode?.cacheConfig?.strategy === 'write-through') redisEfficacy = 0.45;

    const redisAbsorbed = Math.round(trafficAtOrigin * redisEfficacy);
    trafficAtOrigin -= redisAbsorbed;
    cacheHitRate += redisEfficacy;
  }
  cacheHitRate = Math.min(cacheHitRate, 0.95);

  // Async Queues (Kafka / RabbitMQ) absorb write surges
  let asyncBuffered = false;
  if ((hasKafka || hasRabbitMQ) && hasWorkers) {
    asyncBuffered = true;
    trafficAtOrigin = Math.round(trafficAtOrigin * 0.70); // queue buffers burst
  }

  // 6. Compute Layer Capacity Analysis
  let totalComputeCapacity = 0;
  computeNodes.forEach(node => {
    const comp = components[node.componentId];
    if (comp) {
      let cap = comp.baseCapacity;
      // Protocol efficiency bonus: gRPC and HTTP/2 multiplexing handles 2x more capacity
      if (node.protocol === 'gRPC') cap = Math.round(cap * 2.2);
      else if (node.protocol === 'HTTP/2' || node.protocol === 'HTTP/3') cap = Math.round(cap * 1.5);
      totalComputeCapacity += cap;
    }
  });

  const hasTrafficDistributor = hasLB || hasGateway || hasNginx;
  let effectiveComputeCapacity = totalComputeCapacity;
  if (computeNodes.length > 1 && !hasTrafficDistributor) {
    effectiveComputeCapacity = Math.max(...computeNodes.map(n => components[n.componentId]?.baseCapacity || 100));
  }

  // 7. Database Capacity Analysis
  let dbCapacity = 0;
  const dbNodes = reachableNodes.filter(n => n.componentId === 'postgresql' || n.componentId === 'mongodb');
  dbNodes.forEach(n => {
    let cap = components[n.componentId]?.baseCapacity || 250;
    // Database indexing and connection pooling optimizations
    const dbConfig = n.databaseConfig;
    if (dbConfig?.indexes && dbConfig.indexes.length > 0) {
      cap = Math.round(cap * 1.8); // Indexes increase query throughput
    }
    if (dbConfig?.readReplicas && dbConfig.readReplicas > 1) {
      cap += (dbConfig.readReplicas - 1) * 200; // Read replicas absorb read load
    }
    dbCapacity += cap;
  });

  // 8. Latency Calculation
  let baseLatency = 12; // base network ping
  if (hasWAF) baseLatency += 3;
  if (hasCDN) baseLatency -= 8;
  if (hasNginx) baseLatency -= 4; // TLS offloading and connection reuse
  if (hasGateway) baseLatency += 5;
  if (hasLB) baseLatency += 3;
  if (hasServer) baseLatency += 20;
  if (hasRedis && !isCacheFlushed) baseLatency += 2;
  if (hasPostgres) {
    const pgNode = reachableNodes.find(n => n.componentId === 'postgresql');
    // If table has indexes, latency drops from 35ms to 8ms
    baseLatency += (pgNode?.databaseConfig?.indexes && pgNode.databaseConfig.indexes.length > 0) ? 8 : 35;
  }
  if (hasMongo) baseLatency += 18;
  if (hasKafka || hasRabbitMQ) baseLatency += 4;
  if (hasServiceMesh) baseLatency += 2; // mTLS sidecar hop

  // Chaos: Database Lock Contention / Latency Injection
  const isDbLatencyActive = chaosInjections.includes('db-latency');
  if (isDbLatencyActive && dbNodes.length > 0) {
    baseLatency += 450;
  }

  // Chaos: Network Partition
  const isNetworkPartitionActive = chaosInjections.includes('network-partition');
  if (isNetworkPartitionActive) {
    baseLatency += hasServiceMesh ? 40 : 350;
  }

  baseLatency = Math.max(8, baseLatency);

  // Overload Latency Penalty
  let overloadRatio = 0;
  if (hasServer && effectiveComputeCapacity > 0) {
    overloadRatio = Math.max(0, (trafficAtOrigin - effectiveComputeCapacity) / effectiveComputeCapacity);
  }

  let dbOverloadRatio = 0;
  if (dbNodes.length > 0 && dbCapacity > 0) {
    const dbIncomingTraffic = (hasRedis && !isCacheFlushed) ? Math.round(trafficAtOrigin * 0.25) : trafficAtOrigin;
    if (dbIncomingTraffic > dbCapacity) {
      dbOverloadRatio = (dbIncomingTraffic - dbCapacity) / dbCapacity;
    }
  }

  // 9. Error Rate Calculation & Resilience
  let errorRate = 0;
  let statusMessage = 'Architecture Operational: System is healthy and serving requests.';
  let isHealthy = true;
  let bottleneckNodeId: string | undefined;

  // Chaos: Poison Pill message in queue
  const isPoisonPillActive = chaosInjections.includes('poison-pill');
  if (isPoisonPillActive && (hasKafka || hasRabbitMQ)) {
    if (hasDLQ) {
      statusMessage = 'Poison Pill Quarantined: Dead Letter Queue safely isolated corrupt messages without worker crash.';
    } else {
      errorRate += 0.45;
      isHealthy = false;
      statusMessage = 'Worker CrashLoopBackOff: Poison pill message caused recursive consumer failure. Add Dead Letter Queue (DLQ).';
      bottleneckNodeId = reachableNodes.find(n => n.componentId === 'worker-service')?.instanceId;
    }
  }

  if (isDdosActive && !hasWAF) {
    errorRate = Math.min(0.98, errorRate + 0.65);
    isHealthy = false;
    statusMessage = 'DDoS Saturation: Layer 7 HTTP flood overwhelmed ingress. Deploy WAF & DDoS Shield to filter botnet traffic.';
  }

  if (isNetworkPartitionActive && !hasServiceMesh && !hasCircuitBreaker) {
    errorRate = Math.min(0.95, errorRate + 0.40);
    isHealthy = false;
    statusMessage = 'Split-Brain / Network Partition: Cross-service calls timing out. Implement Service Mesh / Circuit Breaker with fallback.';
  }

  if (!hasServer && nodes.length > 1 && !hasCDN) {
    errorRate = 1.0;
    isHealthy = false;
    statusMessage = 'No Backend Compute: Client has nowhere to execute application logic. Add an API Server, Container, or Pod.';
  } else if (hasServer && overloadRatio > 0) {
    // If circuit breaker is present, it trips to prevent server crash
    if (hasCircuitBreaker) {
      errorRate = Math.min(0.35, overloadRatio * 0.4);
      statusMessage = 'Circuit Breaker Active: Tripped OPEN to shed load and protect downstream databases from cascading 504s.';
    } else {
      errorRate = Math.min(0.95, overloadRatio * 0.7);
      statusMessage = `Compute Saturation: Ingress traffic (${effectiveTargetRps} req/s) exceeds server capacity (${effectiveComputeCapacity} req/s). Scale horizontally or add Load Balancer / Caching.`;
      bottleneckNodeId = computeNodes[0]?.instanceId;
    }
    isHealthy = errorRate < 0.05;
  } else if (dbOverloadRatio > 0.2) {
    errorRate = Math.min(0.90, dbOverloadRatio * 0.5);
    isHealthy = false;
    statusMessage = `Database Connection Exhaustion: Direct queries saturated database capacity (${dbCapacity} req/s). Deploy Redis cache-aside or read replicas.`;
    bottleneckNodeId = dbNodes[0]?.instanceId;
  } else if (computeNodes.length > 1 && !hasTrafficDistributor) {
    statusMessage = 'Unbalanced Fleet: Multiple servers exist without a Load Balancer or Reverse Proxy. Traffic is skewing to a single instance.';
  }

  // Calculate final Latency Percentiles
  const currentLatency = baseLatency + (overloadRatio * 380) + (dbOverloadRatio * 520);
  const p50Latency = Math.round(currentLatency * 0.85);
  const p95Latency = Math.round(currentLatency * 1.45);
  const p99Latency = Math.round(currentLatency * 2.2);

  // CPU and Memory metrics
  const cpuPercent = Math.min(100, Math.round(
    effectiveComputeCapacity > 0 ? (trafficAtOrigin / effectiveComputeCapacity) * 100 : (hasServer ? 100 : 5)
  ));
  const memoryPercent = Math.min(100, Math.round(
    25 + (cacheHitRate * 35) + (overloadRatio * 25)
  ));

  // Max connections & active connections
  const maxConnections = dbNodes.length > 0 ? 1500 : 12000;
  const activeConnections = Math.min(
    maxConnections,
    Math.round((trafficAtOrigin * (currentLatency / 1000)) * (hasServer ? Math.max(1, computeNodes.length * 8) : 1))
  );

  // Queue Depth
  const queueDepth = asyncBuffered 
    ? Math.max(0, Math.round((trafficAtOrigin - (components['worker-service']?.baseCapacity || 200)) * 2.5))
    : 0;

  // Economy & SLO
  const successRps = Math.round(effectiveTargetRps * (1 - errorRate));
  const revenuePerHour = Math.round(successRps * 3600 * 0.000035); // ~$0.12 per 1,000 successful transactions
  const netProfitPerHour = revenuePerHour - totalCost;
  const sloCompliance = Math.max(0, Math.min(100, Math.round((1 - errorRate) * 1000) / 10));
  const errorBudgetPercent = Math.max(0, Math.min(100, Math.round((1 - (errorRate / 0.005)) * 100)));

  // Generate Representative Visual Packets
  const representativePackets: VisualPacket[] = [];
  let packetCounter = 1;

  reachableNodes.forEach(source => {
    if (source.connections && source.connections.length > 0) {
      source.connections.forEach(targetId => {
        const targetNode = nodeMap.get(targetId);
        if (!targetNode) return;

        let type: VisualPacket['type'] = 'get';
        let label = 'GET /api/data';

        if (isDdosActive && source.componentId === 'client') {
          type = 'malicious';
          label = 'DDoS SYN Flood';
        } else if (targetNode.componentId === 'kafka' || targetNode.componentId === 'rabbitmq') {
          type = 'kafka';
          label = isPoisonPillActive ? 'POISON_PILL' : 'OrderEvent.json';
        } else if (source.protocol === 'gRPC' || targetNode.protocol === 'gRPC') {
          type = 'grpc';
          label = 'rpc ProcessOrder()';
        } else if (source.protocol === 'WebSocket' || targetNode.protocol === 'WebSocket') {
          type = 'websocket';
          label = 'WSS Stream';
        } else if (targetNode.componentId === 'postgresql' || targetNode.componentId === 'mongodb') {
          type = 'post';
          label = 'SQL INSERT';
        }

        representativePackets.push({
          id: `pkt-${packetCounter++}-${source.instanceId}-${targetId}`,
          fromNodeId: source.instanceId,
          toNodeId: targetId,
          type,
          label,
          progress: (packetCounter * 0.23) % 1,
          speed: type === 'grpc' ? 2.2 : (type === 'malicious' ? 2.5 : 1.4)
        });
      });
    }
  });

  // Node-level breakdown
  const nodeMetrics: SimulationMetrics['nodeMetrics'] = {};
  nodes.forEach(n => {
    const isCompute = n.componentId === 'server' || n.componentId === 'docker-container' || n.componentId === 'k8s-pod';
    const isDb = n.componentId === 'postgresql' || n.componentId === 'mongodb';
    
    nodeMetrics[n.instanceId] = {
      cpu: isCompute ? cpuPercent : (isDb ? Math.min(100, Math.round(dbOverloadRatio * 100 + 35)) : 15),
      memory: isDb ? 65 : (n.componentId === 'redis' ? (isCacheFlushed ? 5 : 75) : 38),
      latency: Math.round(baseLatency),
      rps: isCompute ? Math.round(trafficAtOrigin / Math.max(1, computeNodes.length)) : effectiveTargetRps,
      isOverloaded: isCompute ? (overloadRatio > 0.1) : (isDb ? (dbOverloadRatio > 0.2) : false)
    };
  });

  return {
    requestsPerSecond: successRps,
    targetRps: effectiveTargetRps,
    latencyMs: Math.round(currentLatency),
    p50LatencyMs: p50Latency,
    p95LatencyMs: p95Latency,
    p99LatencyMs: p99Latency,
    errorRate: Math.max(0, Math.min(1, errorRate)),
    cpuPercent,
    memoryPercent,
    activeConnections,
    maxConnections,
    queueDepth,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    hourlyCost: totalCost,
    revenuePerHour,
    netProfitPerHour,
    errorBudgetPercent,
    sloCompliance,
    isHealthy,
    statusMessage,
    bottleneckNodeId,
    activeChaosInjections: chaosInjections,
    representativePackets,
    nodeMetrics
  };
}
