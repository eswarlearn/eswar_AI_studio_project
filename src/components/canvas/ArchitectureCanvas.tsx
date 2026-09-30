import React, { useState, useRef, useEffect } from 'react';
import { ArchitectureNode, ComponentId, InfrastructureComponent, SimulationMetrics } from '../../types/game';
import { INFRASTRUCTURE_COMPONENTS } from '../../data/components';
import { 
  Globe, Server, Database, Layers, Radio, Shield, 
  Activity, Cpu, Box, Trash2, ArrowRight, X, AlertCircle, CheckCircle2 
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
  const canvasRef = useRef<HTMLDivElement>(null);

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
    const newX = Math.max(20, Math.min(rect.width - 180, (e.clientX - rect.left) - dragOffset.x));
    const newY = Math.max(20, Math.min(rect.height - 100, (e.clientY - rect.top) - dragOffset.y));

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
    const posX = 100 + (offsetIndex % 4) * 190;
    const posY = 120 + Math.floor(offsetIndex / 4) * 130;

    const newNode: ArchitectureNode = {
      instanceId,
      componentId: comp.id,
      label: existingCount > 0 ? `${comp.name} #${existingCount + 1}` : comp.name,
      position: { x: Math.min(posX, 700), y: Math.min(posY, 350) },
      connections: []
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
    // Remove node and all references in connections
    const updated = nodes
      .filter(n => n.instanceId !== instanceId)
      .map(n => ({
        ...n,
        connections: (n.connections || []).filter(id => id !== instanceId)
      }));
    onNodesChange(updated);
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
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
      if (onSelectNode) onSelectNode(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Component Palette Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Palette
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
                  title={`${comp.name} - $${comp.baseCost}/hr - ${comp.description}`}
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
              <span>Click input port on target node</span>
              <button 
                onClick={() => setConnectingSourceId(null)}
                className="hover:text-white ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
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
        className="relative flex-1 min-h-[460px] bg-slate-950 bg-grid-dots overflow-hidden select-none"
      >
        {/* SVG Wiring Layer */}
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

              // Node dimensions are approx 160px width, 72px height
              const startX = sourceNode.position.x + 160;
              const startY = sourceNode.position.y + 36;
              const endX = targetNode.position.x;
              const endY = targetNode.position.y + 36;

              const deltaX = Math.abs(endX - startX);
              const controlPointOffset = Math.max(deltaX * 0.45, 50);

              const pathData = `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
              const isOverloaded = metrics.errorRate > 0.05;

              return (
                <g key={`${sourceNode.instanceId}->${targetId}`} className="group pointer-events-auto">
                  {/* Invisible thicker path for easier clicking */}
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
                  {/* Glowing Animated Data Packet */}
                  {metrics.isHealthy && (
                    <circle
                      r="4.5"
                      fill={isOverloaded ? "#EF4444" : "#60A5FA"}
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
            <p className="text-sm font-medium text-slate-300 mb-1">Canvas is Ready for Architecture</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Click components from the palette above to place them, then drag wires from output ports to connect your backend topology.
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
              className={`absolute z-20 w-40 rounded-lg p-2.5 transition-shadow cursor-grab active:cursor-grabbing border ${
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
              <div className="flex items-center justify-between mb-1.5">
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

              {/* Node Metric Line */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums">
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
      </div>
    </div>
  );
};

// Reusable component icon renderer
export const ComponentIcon: React.FC<{ category: string; compId?: string; className?: string }> = ({ 
  category, 
  compId, 
  className = "w-4 h-4" 
}) => {
  if (compId === 'client') return <Globe className={className} />;
  if (compId === 'dns') return <Globe className={className} />;
  if (compId === 'cdn') return <Globe className={className} />;
  if (compId === 'load-balancer') return <Layers className={className} />;
  if (compId === 'api-gateway') return <Layers className={className} />;
  if (compId === 'server') return <Server className={className} />;
  if (compId === 'docker-container') return <Box className={className} />;
  if (compId === 'k8s-pod') return <Box className={className} />;
  if (compId === 'redis') return <Database className={className} />;
  if (compId === 'postgresql') return <Database className={className} />;
  if (compId === 'mongodb') return <Database className={className} />;
  if (compId === 'kafka') return <Radio className={className} />;
  if (compId === 'rabbitmq') return <Radio className={className} />;
  if (compId === 'telemetry-collector') return <Activity className={className} />;
  if (compId === 'waf-firewall') return <Shield className={className} />;
  if (compId === 'worker-service') return <Cpu className={className} />;
  return <Server className={className} />;
};
