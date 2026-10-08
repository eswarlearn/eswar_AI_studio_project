import React, { useState, useRef } from 'react';
import { ArchitectureNode, ComponentId, InfrastructureComponent, SimulationMetrics } from '../../types/game';
import { INFRASTRUCTURE_COMPONENTS } from '../../data/components';
import { 
  Globe, Server, Database, Layers, Radio, Shield, 
  Activity, Cpu, Box, Trash2, X, Sliders, HardDrive, Key, Settings, AlertTriangle, CheckCircle2
} from 'lucide-react';

interface ArchitectureCanvasProps {
  nodes: ArchitectureNode[];
  metrics: SimulationMetrics;
  allowedComponents: ComponentId[];
  onNodesChange: (newNodes: ArchitectureNode[]) => void;
  onSelectNode?: (node: ArchitectureNode | null) => void;
}

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  nodes,
  metrics,
  allowedComponents,
  onNodesChange,
  onSelectNode
}) => {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find(n => n.instanceId === selectedInstanceId) || null;

  // Handle Dragging existing node on canvas
  const handleMouseDown = (e: React.MouseEvent, node: ArchitectureNode) => {
    e.stopPropagation();
    setSelectedInstanceId(node.instanceId);
    if (onSelectNode) onSelectNode(node);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingNodeId(node.instanceId);
      setDragOffset({
        x: (e.clientX - rect.left) - node.position.x,
        y: (e.clientY - rect.top) - node.position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 200, (e.clientX - rect.left) - dragOffset.x));
    const newY = Math.max(20, Math.min(rect.height - 110, (e.clientY - rect.top) - dragOffset.y));

    // Snap to 10px grid
    const snappedX = Math.round(newX / 10) * 10;
    const snappedY = Math.round(newY / 10) * 10;

    onNodesChange(
      nodes.map(n => (n.instanceId === draggingNodeId ? { ...n, position: { x: snappedX, y: snappedY } } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Add component from tray
  const handleAddComponent = (comp: InfrastructureComponent) => {
    const existingCount = nodes.filter(n => n.componentId === comp.id).length;
    const instanceId = `${comp.id}-${Date.now().toString(36).slice(-4)}`;
    
    // Position intelligently
    const offsetIndex = nodes.length;
    const posX = 100 + (offsetIndex % 4) * 200;
    const posY = 100 + Math.floor(offsetIndex / 4) * 140;

    const newNode: ArchitectureNode = {
      instanceId,
      componentId: comp.id,
      label: existingCount > 0 ? `${comp.name} #${existingCount + 1}` : comp.name,
      position: { x: Math.min(posX, 750), y: Math.min(posY, 350) },
      connections: [],
      protocol: comp.category === 'messaging' ? 'Kafka' : (comp.id === 'server' || comp.id === 'k8s-pod' ? 'HTTP/2' : 'HTTP/1.1'),
      databaseConfig: comp.category === 'storage' ? {
        primaryKey: 'id',
        indexes: ['user_id', 'created_at'],
        isolationLevel: 'READ_COMMITTED',
        connectionPoolSize: 25,
        readReplicas: 1
      } : undefined,
      cacheConfig: comp.id === 'redis' ? {
        strategy: 'cache-aside',
        ttlSeconds: 300,
        evictionPolicy: 'LRU'
      } : undefined,
      queueConfig: comp.category === 'messaging' ? {
        partitions: 8,
        consumerGroup: 'worker-fleet',
        deliverySemantics: 'at-least-once',
        hasDeadLetterQueue: true
      } : undefined
    };

    onNodesChange([...nodes, newNode]);
    setSelectedInstanceId(instanceId);
    if (onSelectNode) onSelectNode(newNode);
  };

  // Handle connection start and end
  const handlePortClick = (e: React.MouseEvent, instanceId: string, isOutput: boolean) => {
    e.stopPropagation();
    if (isOutput) {
      if (connectingSourceId === instanceId) {
        setConnectingSourceId(null);
      } else {
        setConnectingSourceId(instanceId);
      }
    } else {
      // Connect to target input
      if (connectingSourceId && connectingSourceId !== instanceId) {
        const sourceNode = nodes.find(n => n.instanceId === connectingSourceId);
        if (sourceNode) {
          const currentConns = sourceNode.connections || [];
          if (!currentConns.includes(instanceId)) {
            const updated = nodes.map(n => 
              n.instanceId === connectingSourceId
                ? { ...n, connections: [...currentConns, instanceId] }
                : n
            );
            onNodesChange(updated);
          }
        }
        setConnectingSourceId(null);
      }
    }
  };

  // Delete node
  const handleDeleteNode = (instanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = nodes
      .filter(n => n.instanceId !== instanceId)
      .map(n => ({
        ...n,
        connections: (n.connections || []).filter(id => id !== instanceId)
      }));
    onNodesChange(updated);
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
      setShowConfigDrawer(false);
      if (onSelectNode) onSelectNode(null);
    }
  };

  // Remove connection
  const handleRemoveConnection = (sourceId: string, targetId: string) => {
    const updated = nodes.map(n => 
      n.instanceId === sourceId
        ? { ...n, connections: (n.connections || []).filter(id => id !== targetId) }
        : n
    );
    onNodesChange(updated);
  };

  // Clear all
  const handleClearAll = () => {
    if (nodes.length > 0 && window.confirm('Clear all components from canvas?')) {
      onNodesChange([]);
      setSelectedInstanceId(null);
      setShowConfigDrawer(false);
      if (onSelectNode) onSelectNode(null);
    }
  };

  // Update node config
  const handleUpdateSelectedNode = (patch: Partial<ArchitectureNode>) => {
    if (!selectedInstanceId) return;
    onNodesChange(
      nodes.map(n => (n.instanceId === selectedInstanceId ? { ...n, ...patch } : n))
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative">
      {/* Component Palette Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Infrastructure Palette
          </span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {allowedComponents.map(compId => {
              const comp = INFRASTRUCTURE_COMPONENTS[compId];
              if (!comp) return null;
              return (
                <button
                  key={compId}
                  onClick={() => handleAddComponent(comp)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-md border border-slate-800 hover:border-slate-700 text-xs font-medium transition-all group whitespace-nowrap active:scale-95 shadow-sm"
                  title={`${comp.name} ($${comp.baseCost}/hr) - ${comp.description}`}
                >
                  <ComponentIcon category={comp.category} compId={comp.id} className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                  <span>{comp.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">(${comp.baseCost})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connectingSourceId && (
            <div className="flex items-center gap-1 text-xs text-amber-400 animate-pulse bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
              <span>Click target input port</span>
              <button 
                onClick={() => setConnectingSourceId(null)}
                className="hover:text-white ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {selectedNode && (
            <button
              onClick={() => setShowConfigDrawer(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded border border-blue-500 transition-colors shadow-sm"
            >
              <Sliders className="w-3 h-3" />
              <span>Configure Node</span>
            </button>
          )}
          <button
            onClick={handleClearAll}
            disabled={nodes.length === 0}
            className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Clear Canvas
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => {
          setSelectedInstanceId(null);
          setConnectingSourceId(null);
          if (onSelectNode) onSelectNode(null);
        }}
        className="relative flex-1 min-h-[480px] bg-slate-950 bg-grid-dots overflow-hidden select-none"
      >
        {/* SVG Wiring Layer & Animated Particles */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="wireGradientNormal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="wireGradientOverload" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {nodes.map(sourceNode => {
            if (!sourceNode.connections) return null;
            return sourceNode.connections.map(targetId => {
              const targetNode = nodes.find(n => n.instanceId === targetId);
              if (!targetNode) return null;

              const startX = sourceNode.position.x + 175;
              const startY = sourceNode.position.y + 38;
              const endX = targetNode.position.x;
              const endY = targetNode.position.y + 38;

              const deltaX = Math.abs(endX - startX);
              const controlPointOffset = Math.max(deltaX * 0.45, 50);

              const pathData = `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
              const isOverloaded = metrics.errorRate > 0.05;

              // Find representative packets traveling this route
              const packetsOnRoute = (metrics.representativePackets || []).filter(
                p => p.fromNodeId === sourceNode.instanceId && p.toNodeId === targetId
              );

              return (
                <g key={`${sourceNode.instanceId}->${targetId}`} className="group pointer-events-auto">
                  {/* Invisible thicker path for clicking to delete connection */}
                  <path
                    d={pathData}
                    stroke="transparent"
                    strokeWidth="14"
                    fill="none"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveConnection(sourceNode.instanceId, targetId);
                    }}
                  />
                  {/* Visual Wire Cable */}
                  <path
                    d={pathData}
                    stroke={isOverloaded ? "url(#wireGradientOverload)" : "url(#wireGradientNormal)"}
                    strokeWidth={metrics.isHealthy ? "2.5" : "1.8"}
                    strokeDasharray={metrics.isHealthy ? "none" : "4,4"}
                    fill="none"
                    className="transition-colors"
                  />
                  {/* Real-time Multi-Colored Animated Data Packets */}
                  {packetsOnRoute.length > 0 ? (
                    packetsOnRoute.map((pkt, idx) => {
                      const color = 
                        pkt.type === 'malicious' ? '#EF4444' :
                        pkt.type === 'grpc' ? '#06B6D4' :
                        pkt.type === 'websocket' ? '#A855F7' :
                        pkt.type === 'kafka' ? '#F97316' :
                        pkt.type === 'post' ? '#EAB308' : '#3B82F6';

                      return (
                        <circle
                          key={pkt.id || idx}
                          r="4.5"
                          fill={color}
                          className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                        >
                          <animateMotion
                            path={pathData}
                            dur={`${Math.max(0.7, 2.2 / (pkt.speed || 1))}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      );
                    })
                  ) : metrics.isHealthy && (
                    <circle
                      r="4"
                      fill="#60A5FA"
                      className="filter drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]"
                    >
                      <animateMotion
                        path={pathData}
                        dur={`${Math.max(0.6, Math.min(2.5, metrics.latencyMs / 40))}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            });
          })}
        </svg>

        {/* Empty Canvas Placeholder */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-500 pointer-events-none">
            <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mb-3 text-slate-400">
              <Cpu className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300 mb-1">Canvas is Ready for Infrastructure</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Place components from the palette above, wire connections from output ports, and configure data protocols to defend against traffic spikes.
            </p>
          </div>
        )}

        {/* Render Architecture Nodes */}
        {nodes.map(node => {
          const comp = INFRASTRUCTURE_COMPONENTS[node.componentId] || {
            name: node.componentId,
            category: 'compute',
            baseCost: 0,
            baseCapacity: 100
          };
          const isSelected = selectedInstanceId === node.instanceId;
          const isConnectingSource = connectingSourceId === node.instanceId;
          const nodeMetric = metrics.nodeMetrics[node.instanceId];
          const isOverloaded = nodeMetric?.isOverloaded || false;

          return (
            <div
              key={node.instanceId}
              onMouseDown={(e) => handleMouseDown(e, node)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInstanceId(node.instanceId);
                if (onSelectNode) onSelectNode(node);
              }}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`
              }}
              className={`absolute z-20 w-44 rounded-lg p-2.5 transition-shadow cursor-grab active:cursor-grabbing border ${
                isSelected
                  ? 'border-blue-500 bg-slate-900/95 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                  : isOverloaded
                  ? 'border-red-500/80 bg-slate-900/90 shadow-md shadow-red-500/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/85'
              }`}
            >
              {/* Input Port (Left Handle) */}
              <div
                onClick={(e) => handlePortClick(e, node.instanceId, false)}
                title="Connect wire to this input"
                className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  connectingSourceId && connectingSourceId !== node.instanceId
                    ? 'border-cyan-400 bg-cyan-950 scale-125 animate-pulse cursor-pointer'
                    : 'border-slate-700 bg-slate-950 hover:border-blue-400 hover:scale-110'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>

              {/* Node Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <div className={`p-1 rounded ${isOverloaded ? 'bg-red-950 text-red-400' : 'bg-slate-800 text-blue-400'}`}>
                    <ComponentIcon category={comp.category} compId={node.componentId} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-100 truncate">
                    {node.label || comp.name}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteNode(node.instanceId, e)}
                  title="Remove component"
                  className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Protocol / Configuration Tags */}
              <div className="flex items-center gap-1 my-1 overflow-x-hidden">
                {node.protocol && (
                  <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">
                    {node.protocol}
                  </span>
                )}
                {node.databaseConfig?.indexes && node.databaseConfig.indexes.length > 0 && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    INDEXED
                  </span>
                )}
                {node.cacheConfig?.strategy && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {node.cacheConfig.strategy.toUpperCase()}
                  </span>
                )}
                {node.queueConfig?.hasDeadLetterQueue && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                    DLQ
                  </span>
                )}
              </div>

              {/* Node Metric Line */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums pt-0.5 border-t border-slate-800/50">
                <span>CPU: {nodeMetric?.cpu || 0}%</span>
                <span>${comp.baseCost}/hr</span>
              </div>

              {/* Output Port (Right Handle) */}
              <div
                onClick={(e) => handlePortClick(e, node.instanceId, true)}
                title="Click to start connection wire"
                className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                  isConnectingSource
                    ? 'border-amber-400 bg-amber-950 ring-2 ring-amber-400/50 scale-125'
                    : 'border-slate-700 bg-slate-950 hover:border-blue-400 hover:scale-110'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isConnectingSource ? 'bg-amber-400' : 'bg-blue-400'}`} />
              </div>
            </div>
          );
        })}

        {/* Node Configuration Inspector Drawer */}
        {showConfigDrawer && selectedNode && (
          <div className="absolute right-3 top-3 bottom-3 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl z-30 flex flex-col gap-3 overflow-y-auto animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Node Configuration</h3>
              </div>
              <button 
                onClick={() => setShowConfigDrawer(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Configure data contracts, protocol parameters, and operational behavior for <span className="font-semibold text-white">{selectedNode.label}</span>.
            </div>

            {/* Protocol Setting */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Wire Protocol</label>
              <select
                value={selectedNode.protocol || 'HTTP/1.1'}
                onChange={(e) => handleUpdateSelectedNode({ protocol: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded p-1.5 font-mono"
              >
                <option value="HTTP/1.1">HTTP/1.1 (Standard REST)</option>
                <option value="HTTP/2">HTTP/2 (Multiplexed Streams)</option>
                <option value="HTTP/3">HTTP/3 (QUIC / 0-RTT Handshake)</option>
                <option value="gRPC">gRPC (Binary Protobuf Streams)</option>
                <option value="WebSocket">WebSocket (Full-Duplex Persistent)</option>
                <option value="Kafka">Kafka Native Commit Log</option>
                <option value="AMQP">AMQP 0-9-1 Message Broker</option>
              </select>
            </div>

            {/* Database Settings */}
            {(selectedNode.componentId === 'postgresql' || selectedNode.componentId === 'mongodb') && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Database Internals</span>
                <div>
                  <label className="text-[11px] text-slate-400">Indexed Columns</label>
                  <input
                    type="text"
                    defaultValue={selectedNode.databaseConfig?.indexes?.join(', ') || 'user_id, created_at'}
                    onChange={(e) => {
                      const indexes = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      handleUpdateSelectedNode({
                        databaseConfig: { ...selectedNode.databaseConfig, indexes }
                      });
                    }}
                    placeholder="e.g. user_id, status"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 text-xs text-white rounded p-1.5 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">B-tree indexes cut query latency from 35ms to 8ms.</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Pool Size</label>
                    <input
                      type="number"
                      defaultValue={selectedNode.databaseConfig?.connectionPoolSize || 25}
                      onChange={(e) => handleUpdateSelectedNode({
                        databaseConfig: { ...selectedNode.databaseConfig, connectionPoolSize: Number(e.target.value) }
                      })}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 text-xs text-white rounded p-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Read Replicas</label>
                    <input
                      type="number"
                      defaultValue={selectedNode.databaseConfig?.readReplicas || 1}
                      min={1}
                      max={5}
                      onChange={(e) => handleUpdateSelectedNode({
                        databaseConfig: { ...selectedNode.databaseConfig, readReplicas: Number(e.target.value) }
                      })}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 text-xs text-white rounded p-1 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Redis Cache Settings */}
            {selectedNode.componentId === 'redis' && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">Cache Configuration</span>
                <div>
                  <label className="text-[11px] text-slate-400">Caching Strategy</label>
                  <select
                    value={selectedNode.cacheConfig?.strategy || 'cache-aside'}
                    onChange={(e) => handleUpdateSelectedNode({
                      cacheConfig: { ...selectedNode.cacheConfig, strategy: e.target.value as any }
                    })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 text-xs text-white rounded p-1.5 font-mono"
                  >
                    <option value="cache-aside">Cache-Aside (High Read Throughput)</option>
                    <option value="write-through">Write-Through (Immediate Consistency)</option>
                    <option value="write-behind">Write-Behind (Asynchronous DB Flush)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400">TTL (seconds)</label>
                    <input
                      type="number"
                      defaultValue={selectedNode.cacheConfig?.ttlSeconds || 300}
                      onChange={(e) => handleUpdateSelectedNode({
                        cacheConfig: { ...selectedNode.cacheConfig, ttlSeconds: Number(e.target.value) }
                      })}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 text-xs text-white rounded p-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Eviction</label>
                    <select
                      value={selectedNode.cacheConfig?.evictionPolicy || 'LRU'}
                      onChange={(e) => handleUpdateSelectedNode({
                        cacheConfig: { ...selectedNode.cacheConfig, evictionPolicy: e.target.value as any }
                      })}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 text-xs text-white rounded p-1 font-mono"
                    >
                      <option value="LRU">LRU (Least Recently Used)</option>
                      <option value="LFU">LFU (Least Frequently Used)</option>
                      <option value="FIFO">FIFO</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Kafka / Queue Settings */}
            {(selectedNode.componentId === 'kafka' || selectedNode.componentId === 'rabbitmq') && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Event Stream Tuning</span>
                <div>
                  <label className="text-[11px] text-slate-400">Partitions</label>
                  <input
                    type="number"
                    defaultValue={selectedNode.queueConfig?.partitions || 8}
                    onChange={(e) => handleUpdateSelectedNode({
                      queueConfig: { ...selectedNode.queueConfig, partitions: Number(e.target.value) }
                    })}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 text-xs text-white rounded p-1.5 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Partitions determine maximum concurrent worker consumers.</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    defaultChecked={selectedNode.queueConfig?.hasDeadLetterQueue ?? true}
                    onChange={(e) => handleUpdateSelectedNode({
                      queueConfig: { ...selectedNode.queueConfig, hasDeadLetterQueue: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-700"
                  />
                  <span>Dead Letter Queue (Quarantine poison pills)</span>
                </label>
              </div>
            )}

            <button
              onClick={() => setShowConfigDrawer(false)}
              className="mt-auto w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs transition-colors shadow-sm"
            >
              Apply & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable component icon renderer
export const ComponentIcon: React.FC<{ category: string; compId?: string; className?: string }> = ({ 
  compId, 
  className = "w-4 h-4" 
}) => {
  if (compId === 'client') return <Globe className={className} />;
  if (compId === 'dns') return <Globe className={className} />;
  if (compId === 'cdn') return <Globe className={className} />;
  if (compId === 'nginx-reverse-proxy') return <Layers className={className} />;
  if (compId === 'load-balancer') return <Layers className={className} />;
  if (compId === 'api-gateway') return <Layers className={className} />;
  if (compId === 'server') return <Server className={className} />;
  if (compId === 'docker-container') return <Box className={className} />;
  if (compId === 'k8s-pod') return <Box className={className} />;
  if (compId === 'redis') return <Database className={className} />;
  if (compId === 'postgresql') return <Database className={className} />;
  if (compId === 'mongodb') return <Database className={className} />;
  if (compId === 's3-storage') return <HardDrive className={className} />;
  if (compId === 'kafka') return <Radio className={className} />;
  if (compId === 'rabbitmq') return <Radio className={className} />;
  if (compId === 'dead-letter-queue') return <Radio className={className} />;
  if (compId === 'circuit-breaker') return <Shield className={className} />;
  if (compId === 'service-mesh') return <Layers className={className} />;
  if (compId === 'telemetry-collector') return <Activity className={className} />;
  if (compId === 'waf-firewall') return <Shield className={className} />;
  if (compId === 'worker-service') return <Cpu className={className} />;
  return <Server className={className} />;
};
