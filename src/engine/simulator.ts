import { ArchitectureNode, ComponentId, InfrastructureComponent, SimulationMetrics } from '../types/game';

export function calculateSimulationMetrics(
  nodes: ArchitectureNode[],
  components: Record<ComponentId, InfrastructureComponent>,
  targetRps: number,
  trafficPattern: 'constant' | 'spike' | 'retry-storm' = 'constant'
): SimulationMetrics {
  // Empty state handling
  if (!nodes || nodes.length === 0) {
    return {
      requestsPerSecond: 0,
      targetRps,
      latencyMs: 0,
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
      isHealthy: false,
      statusMessage: 'No architecture components on canvas. Place a Client to begin.',
      nodeMetrics: {}
    };
  }

  // 1. Calculate Traffic Modifier based on pattern
  let effectiveTargetRps = targetRps;
  if (trafficPattern === 'spike') {
    effectiveTargetRps = Math.round(targetRps * 1.6);
  } else if (trafficPattern === 'retry-storm') {
    effectiveTargetRps = Math.round(targetRps * 2.2);
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
      isHealthy: false,
      statusMessage: 'System Inactive: Architecture requires a Client component to initiate traffic.',
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
      isHealthy: false,
      statusMessage: 'Unreachable: Client is not connected to any downstream server, load balancer, or gateway.',
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
  const hasLB = reachableNodes.some(n => n.componentId === 'load-balancer');
  const hasGateway = reachableNodes.some(n => n.componentId === 'api-gateway');
  const hasRedis = reachableNodes.some(n => n.componentId === 'redis');
  const hasKafka = reachableNodes.some(n => n.componentId === 'kafka');
  const hasRabbitMQ = reachableNodes.some(n => n.componentId === 'rabbitmq');
  const hasPostgres = reachableNodes.some(n => n.componentId === 'postgresql');
  const hasMongo = reachableNodes.some(n => n.componentId === 'mongodb');
  const hasWorkers = reachableNodes.some(n => n.componentId === 'worker-service');

  // Compute tier nodes
  const computeNodes = reachableNodes.filter(n => 
    n.componentId === 'server' || n.componentId === 'docker-container' || n.componentId === 'k8s-pod'
  );

  // 5. Calculate Traffic Absorption (Edge Caching & Security)
  let trafficAtOrigin = effectiveTargetRps;
  let cacheHitRate = 0;

  // CDN absorbs edge static requests
  if (hasCDN) {
    const cdnAbsorbed = Math.round(trafficAtOrigin * 0.45);
    trafficAtOrigin -= cdnAbsorbed;
    cacheHitRate += 0.35;
  }

  // Redis in-memory cache-aside absorbs repetitive backend read queries
  if (hasRedis) {
    const redisAbsorbed = Math.round(trafficAtOrigin * 0.50);
    trafficAtOrigin -= redisAbsorbed;
    cacheHitRate += 0.50;
  }
  cacheHitRate = Math.min(cacheHitRate, 0.94);

  // Async Queues (Kafka / RabbitMQ) absorb write surges
  let asyncBuffered = false;
  if ((hasKafka || hasRabbitMQ) && hasWorkers) {
    asyncBuffered = true;
    trafficAtOrigin = Math.round(trafficAtOrigin * 0.75); // queue buffers burst
  }

  // 6. Compute Layer Capacity Analysis
  let totalComputeCapacity = 0;
  computeNodes.forEach(node => {
    const comp = components[node.componentId];
    if (comp) {
      totalComputeCapacity += comp.baseCapacity;
    }
  });

  // If there are multiple compute nodes but NO Load Balancer and NO Gateway,
  // traffic cannot be evenly distributed! Single node absorbs all traffic.
  const hasTrafficDistributor = hasLB || hasGateway;
  let effectiveComputeCapacity = totalComputeCapacity;
  if (computeNodes.length > 1 && !hasTrafficDistributor) {
    effectiveComputeCapacity = Math.max(...computeNodes.map(n => components[n.componentId]?.baseCapacity || 100));
  }

  // 7. Database Capacity Analysis
  let dbCapacity = 0;
  const dbNodes = reachableNodes.filter(n => n.componentId === 'postgresql' || n.componentId === 'mongodb');
  dbNodes.forEach(n => {
    dbCapacity += components[n.componentId]?.baseCapacity || 250;
  });

  // 8. Latency Calculation
  // Baseline hops
  let baseLatency = 12; // base network ping
  if (hasWAF) baseLatency += 4;
  if (hasCDN) baseLatency -= 8; // CDN reduces round-trip times
  if (hasGateway) baseLatency += 6;
  if (hasLB) baseLatency += 4;
  if (hasServer) baseLatency += 22;
  if (hasRedis) baseLatency += 2;
  if (hasPostgres) baseLatency += 28;
  if (hasMongo) baseLatency += 22;
  if (hasKafka || hasRabbitMQ) baseLatency += 5;
  baseLatency = Math.max(14, baseLatency);

  // Overload Latency Penalty
  let overloadRatio = 0;
  if (hasServer && effectiveComputeCapacity > 0) {
    overloadRatio = Math.max(0, (trafficAtOrigin - effectiveComputeCapacity) / effectiveComputeCapacity);
  }

  let dbOverloadRatio = 0;
  if (dbNodes.length > 0 && dbCapacity > 0) {
    // Database receives traffic that was not absorbed by Redis
    const dbIncomingTraffic = hasRedis ? Math.round(trafficAtOrigin * 0.25) : trafficAtOrigin;
    if (dbIncomingTraffic > dbCapacity) {
      dbOverloadRatio = (dbIncomingTraffic - dbCapacity) / dbCapacity;
    }
  }

  // 9. Error Rate Calculation
  let errorRate = 0;
  let statusMessage = 'Architecture Operational: System is healthy and serving requests.';
  let isHealthy = true;
  let bottleneckNodeId: string | undefined;

  if (!hasServer && nodes.length > 1 && !hasCDN) {
    errorRate = 1.0;
    isHealthy = false;
    statusMessage = 'No Backend Compute: Client has nowhere to execute application logic. Add an API Server, Container, or Pod.';
  } else if (hasServer && overloadRatio > 0) {
    errorRate = Math.min(0.95, overloadRatio * 0.7);
    isHealthy = errorRate < 0.05;
    statusMessage = `Compute Saturation: Ingress traffic (${effectiveTargetRps} req/s) exceeds server capacity (${effectiveComputeCapacity} req/s). Scale horizontally or add Load Balancer / Caching.`;
    bottleneckNodeId = computeNodes[0]?.instanceId;
  } else if (dbOverloadRatio > 0.2) {
    errorRate = Math.min(0.90, dbOverloadRatio * 0.5);
    isHealthy = false;
    statusMessage = `Database Connection Exhaustion: Direct queries saturated database capacity (${dbCapacity} req/s). Deploy Redis cache-aside to shield database.`;
    bottleneckNodeId = dbNodes[0]?.instanceId;
  } else if (computeNodes.length > 1 && !hasTrafficDistributor) {
    statusMessage = 'Unbalanced Fleet: Multiple servers exist without a Load Balancer or API Gateway. Traffic is skewing to a single instance.';
  }

  // Calculate final Latency Percentiles
  const currentLatency = baseLatency + (overloadRatio * 450) + (dbOverloadRatio * 600);
  const p95Latency = Math.round(currentLatency * 1.45);
  const p99Latency = Math.round(currentLatency * 2.3);

  // CPU and Memory metrics
  const cpuPercent = Math.min(100, Math.round(
    effectiveComputeCapacity > 0 ? (trafficAtOrigin / effectiveComputeCapacity) * 100 : (hasServer ? 100 : 5)
  ));
  const memoryPercent = Math.min(100, Math.round(
    30 + (cacheHitRate * 35) + (overloadRatio * 25)
  ));

  // Max connection calculations
  const maxConnections = dbNodes.length > 0 ? 1000 : 10000;
  const activeConnections = Math.min(
    maxConnections,
    Math.round((trafficAtOrigin * (currentLatency / 1000)) * (hasServer ? computeNodes.length * 12 : 1))
  );

  // Queue Depth
  const queueDepth = asyncBuffered 
    ? Math.max(0, Math.round((trafficAtOrigin - (components['worker-service']?.baseCapacity || 200)) * 2))
    : 0;

  // Node-level breakdown
  const nodeMetrics: SimulationMetrics['nodeMetrics'] = {};
  nodes.forEach(n => {
    const isCompute = n.componentId === 'server' || n.componentId === 'docker-container' || n.componentId === 'k8s-pod';
    const isDb = n.componentId === 'postgresql' || n.componentId === 'mongodb';
    
    nodeMetrics[n.instanceId] = {
      cpu: isCompute ? cpuPercent : (isDb ? Math.min(100, Math.round(dbOverloadRatio * 100 + 35)) : 15),
      memory: isDb ? 65 : (n.componentId === 'redis' ? 78 : 40),
      latency: Math.round(baseLatency),
      rps: isCompute ? Math.round(trafficAtOrigin / (computeNodes.length || 1)) : effectiveTargetRps,
      isOverloaded: isCompute ? (overloadRatio > 0.1) : (isDb ? (dbOverloadRatio > 0.2) : false)
    };
  });

  return {
    requestsPerSecond: Math.round(effectiveTargetRps * (1 - errorRate)),
    targetRps: effectiveTargetRps,
    latencyMs: Math.round(currentLatency),
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
    isHealthy,
    statusMessage,
    bottleneckNodeId,
    nodeMetrics
  };
}
