import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LCAScenario } from "./LCADashboard";
import { Loader2, ArrowRight, Recycle, Factory, Zap, Truck } from "lucide-react";

interface SankeyVisualizationProps {
  scenario: LCAScenario;
  isLoading: boolean;
}

interface FlowData {
  from: string;
  to: string;
  value: number;
  type: "primary" | "recycled" | "energy" | "transport" | "waste" | "circular";
  icon?: any;
}

export const SankeyVisualization = ({ scenario, isLoading }: SankeyVisualizationProps) => {
  
  const generateFlowData = (scenario: LCAScenario): FlowData[] => {
    const { inputs } = scenario;
    const baseQuantity = inputs.quantity / 1000; // Convert to tons
    
    const flows: FlowData[] = [];
    
    // Material input flows
    if (inputs.materialSource === "primary") {
      flows.push({
        from: "Raw Materials",
        to: "Production",
        value: baseQuantity,
        type: "primary",
        icon: Factory,
      });
    } else {
      flows.push({
        from: "Recycled Materials",
        to: "Production",
        value: baseQuantity * 0.85,
        type: "recycled",
        icon: Recycle,
      });
      flows.push({
        from: "Raw Materials",
        to: "Production",
        value: baseQuantity * 0.15,
        type: "primary",
        icon: Factory,
      });
    }
    
    // Energy flows
    const energyAmount = inputs.metal === "aluminum" ? baseQuantity * 15 : baseQuantity * 6;
    flows.push({
      from: `${inputs.energySource} Energy`,
      to: "Production",
      value: energyAmount,
      type: "energy",
      icon: Zap,
    });
    
    // Transport flows
    flows.push({
      from: "Production",
      to: "Distribution",
      value: baseQuantity,
      type: "transport",
      icon: Truck,
    });
    
    // End-of-life flows
    flows.push({
      from: "Distribution",
      to: "Use Phase",
      value: baseQuantity,
      type: "primary",
    });
    
    if (inputs.endOfLife === "recycling") {
      flows.push({
        from: "Use Phase",
        to: "Recycling",
        value: baseQuantity * 0.9,
        type: "circular",
        icon: Recycle,
      });
      flows.push({
        from: "Use Phase",
        to: "Waste",
        value: baseQuantity * 0.1,
        type: "waste",
      });
      flows.push({
        from: "Recycling",
        to: "Recycled Materials",
        value: baseQuantity * 0.85,
        type: "circular",
        icon: Recycle,
      });
    } else {
      flows.push({
        from: "Use Phase",
        to: "Waste",
        value: baseQuantity,
        type: "waste",
      });
    }
    
    return flows;
  };

  const flows = generateFlowData(scenario);
  
  const getFlowColor = (type: FlowData["type"]) => {
    const colors = {
      primary: "border-linear bg-linear/20",
      recycled: "border-circular bg-circular/20",
      energy: "border-warning bg-warning/20",
      transport: "border-muted bg-muted/40",
      waste: "border-destructive bg-destructive/20",
      circular: "border-circular bg-circular/30",
    };
    return colors[type];
  };

  const getFlowTextColor = (type: FlowData["type"]) => {
    const colors = {
      primary: "text-linear",
      recycled: "text-circular",
      energy: "text-warning",
      transport: "text-muted-foreground",
      waste: "text-destructive",
      circular: "text-circular",
    };
    return colors[type];
  };

  // Group flows by stage
  const stages = [
    { name: "Inputs", flows: flows.filter(f => f.to === "Production") },
    { name: "Production", flows: flows.filter(f => f.from === "Production") },
    { name: "Distribution", flows: flows.filter(f => f.from === "Distribution") },
    { name: "End of Life", flows: flows.filter(f => f.from === "Use Phase") },
    { name: "Recovery", flows: flows.filter(f => f.from === "Recycling") },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Calculating material flows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flow Visualization */}
      <div className="relative bg-gradient-to-r from-background to-muted/20 rounded-lg p-6 min-h-96">
        <div className="grid grid-cols-5 gap-4 h-full">
          {stages.map((stage, stageIndex) => (
            <div key={stage.name} className="flex flex-col">
              <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">
                {stage.name}
              </h4>
              
              <div className="flex-1 space-y-2">
                {stage.flows.map((flow, flowIndex) => {
                  const Icon = flow.icon;
                  return (
                    <div key={flowIndex} className="space-y-1">
                      <Card className={`p-3 ${getFlowColor(flow.type)} transition-all hover:scale-105`}>
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className={`h-4 w-4 ${getFlowTextColor(flow.type)}`} />}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${getFlowTextColor(flow.type)}`}>
                              {flow.from === "Production" ? flow.to : flow.from}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {flow.value.toFixed(1)} {flow.type === "energy" ? "GJ" : "tons"}
                            </div>
                          </div>
                        </div>
                      </Card>
                      
                      {/* Flow Arrow */}
                      {stageIndex < stages.length - 1 && (
                        <div className="flex justify-center">
                          <ArrowRight className={`h-4 w-4 ${getFlowTextColor(flow.type)}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Circular Flow Indicators */}
        {scenario.type === "circular" && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              {/* Circular flow curve from recycling back to inputs */}
              <path
                d="M 400 300 Q 200 100 100 200"
                stroke="hsl(var(--circular))"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                className="animate-pulse"
              />
              <text x="200" y="120" className="text-xs fill-circular font-medium">
                Circular Loop
              </text>
            </svg>
          </div>
        )}
      </div>

      {/* Flow Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { type: "primary", label: "Virgin Materials", icon: Factory },
          { type: "recycled", label: "Recycled Materials", icon: Recycle },
          { type: "energy", label: "Energy Input", icon: Zap },
          { type: "transport", label: "Transport", icon: Truck },
          { type: "circular", label: "Circular Flow", icon: Recycle },
          { type: "waste", label: "Waste/Landfill", icon: null },
        ].map(({ type, label, icon: Icon }) => {
          const hasFlow = flows.some(f => f.type === type);
          if (!hasFlow && type !== "waste") return null;
          
          return (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border-2 ${getFlowColor(type as FlowData["type"])}`} />
              {Icon && <Icon className={`h-4 w-4 ${getFlowTextColor(type as FlowData["type"])}`} />}
              <span className="text-sm">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Circularity Metrics */}
      <Card className="p-4 bg-gradient-to-r from-circular/10 to-primary/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground">Material Loops</div>
            <div className="text-lg font-bold text-circular">
              {scenario.inputs.endOfLife === "recycling" ? "1" : "0"}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Recovery Rate</div>
            <div className="text-lg font-bold text-primary">
              {scenario.inputs.endOfLife === "recycling" ? "90%" : "0%"}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Linear Flows</div>
            <div className="text-lg font-bold text-linear">
              {scenario.type === "circular" ? "25%" : "100%"}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Efficiency</div>
            <Badge variant={scenario.type === "circular" ? "default" : "secondary"}>
              {scenario.type === "circular" ? "High" : "Low"}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};