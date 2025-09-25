import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LCAScenario } from "./LCADashboard";
import { 
  CloudSnow, 
  Zap, 
  Recycle, 
  TrendingUp, 
  TrendingDown, 
  Droplets,
  TreePine 
} from "lucide-react";

interface KPIDashboardProps {
  scenario: LCAScenario;
  isLoading: boolean;
}

interface KPIData {
  co2Footprint: number; // kg CO2-eq
  energyUse: number; // MJ
  recycledContent: number; // %
  waterUse: number; // L
  circularityIndex: number; // %
  costSavings: number; // $
}

export const KPIDashboard = ({ scenario, isLoading }: KPIDashboardProps) => {
  
  // Mock calculation based on scenario inputs
  const calculateKPIs = (scenario: LCAScenario): KPIData => {
    const { inputs } = scenario;
    const baseValues = {
      aluminum: { co2: 11.9, energy: 170, water: 1550 },
      copper: { co2: 4.2, energy: 65, water: 440 }
    };
    
    const base = baseValues[inputs.metal];
    let co2Multiplier = 1;
    let energyMultiplier = 1;
    let waterMultiplier = 1;
    
    // Material source impact
    if (inputs.materialSource === "recycled") {
      co2Multiplier *= 0.15; // 85% reduction for recycled
      energyMultiplier *= 0.05; // 95% reduction for recycled
      waterMultiplier *= 0.3; // 70% reduction for recycled
    }
    
    // Energy source impact
    const energyFactors = { coal: 1.5, grid: 1.0, renewables: 0.1 };
    co2Multiplier *= energyFactors[inputs.energySource];
    
    // Transport impact
    const transportEmissions = inputs.transportDistance * 0.0001; // kg CO2/km
    
    // End of life impact
    const endOfLifeBonus = inputs.endOfLife === "recycling" ? 0.8 : 1.0;
    
    const co2Footprint = (base.co2 * co2Multiplier + transportEmissions) * endOfLifeBonus * inputs.quantity / 1000;
    const energyUse = base.energy * energyMultiplier * inputs.quantity / 1000;
    const waterUse = base.water * waterMultiplier * inputs.quantity / 1000;
    
    const recycledContent = inputs.materialSource === "recycled" ? 85 : 0;
    const circularityIndex = scenario.type === "circular" ? 75 : 25;
    const costSavings = inputs.materialSource === "recycled" ? 1250 : 0;
    
    return {
      co2Footprint: Math.round(co2Footprint * 100) / 100,
      energyUse: Math.round(energyUse * 100) / 100,
      recycledContent,
      waterUse: Math.round(waterUse * 100) / 100,
      circularityIndex,
      costSavings,
    };
  };

  const kpis = calculateKPIs(scenario);
  
  const getImpactColor = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value >= threshold : value <= threshold;
    return isGood ? "text-circular" : "text-linear";
  };

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage <= 33) return "bg-circular";
    if (percentage <= 66) return "bg-warning";
    return "bg-linear";
  };

  return (
    <div className="space-y-6">
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CO2 Footprint */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CloudSnow className="h-4 w-4 text-linear" />
              CO₂ Footprint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${getImpactColor(kpis.co2Footprint, 1000)}`}>
                  {isLoading ? "---" : kpis.co2Footprint.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">kg CO₂-eq</span>
              </div>
              {scenario.type === "circular" && (
                <div className="flex items-center gap-1 text-xs text-circular">
                  <TrendingDown className="h-3 w-3" />
                  65% reduction vs linear
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Energy Use */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              Energy Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${getImpactColor(kpis.energyUse, 50)}`}>
                  {isLoading ? "---" : kpis.energyUse.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">GJ</span>
              </div>
              {scenario.inputs.energySource === "renewables" && (
                <Badge variant="outline" className="text-circular border-circular text-xs">
                  Renewable Energy
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recycled Content */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Recycle className="h-4 w-4 text-circular" />
              Recycled Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${getImpactColor(kpis.recycledContent, 50, true)}`}>
                  {isLoading ? "---" : kpis.recycledContent}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <Progress 
                value={kpis.recycledContent} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Circularity Index */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Recycle className="h-4 w-4 text-primary" />
              Circularity Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {isLoading ? "---" : kpis.circularityIndex}%
                </span>
                <Badge variant={kpis.circularityIndex > 50 ? "default" : "secondary"}>
                  {kpis.circularityIndex > 50 ? "Circular" : "Linear"}
                </Badge>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={kpis.circularityIndex} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Linear</span>
                  <span>Circular</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Usage */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              Water Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${getImpactColor(kpis.waterUse, 500)}`}>
                  {isLoading ? "---" : kpis.waterUse.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">L</span>
              </div>
              {scenario.inputs.materialSource === "recycled" && (
                <div className="flex items-center gap-1 text-xs text-circular">
                  <TrendingDown className="h-3 w-3" />
                  70% water savings
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TreePine className="h-5 w-5 text-circular" />
            Environmental Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Scenario Type</div>
              <Badge variant={scenario.type === "circular" ? "default" : "secondary"} className="w-full">
                {scenario.type === "circular" ? "Circular Economy" : "Linear Economy"}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Cost Impact</div>
              <div className={`font-bold ${kpis.costSavings > 0 ? "text-circular" : "text-muted-foreground"}`}>
                {kpis.costSavings > 0 ? `-$${kpis.costSavings.toLocaleString()}` : "Baseline"}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Material Quality</div>
              <div className="font-bold text-primary">
                {scenario.inputs.materialSource === "recycled" ? "95%" : "100%"}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Circularity Score</div>
              <div className={`font-bold ${kpis.circularityIndex > 50 ? "text-circular" : "text-linear"}`}>
                {kpis.circularityIndex > 50 ? "High" : "Low"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};