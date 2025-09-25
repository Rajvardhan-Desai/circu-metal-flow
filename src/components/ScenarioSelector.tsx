import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LCAScenario } from "./LCADashboard";
import { Recycle, TrendingDown, ArrowRightLeft, Factory } from "lucide-react";

interface ScenarioSelectorProps {
  scenarios: LCAScenario[];
  selectedScenario: number;
  onScenarioChange: (index: number) => void;
  onScenariosUpdate: (scenarios: LCAScenario[]) => void;
}

export const ScenarioSelector = ({
  scenarios,
  selectedScenario,
  onScenarioChange,
  onScenariosUpdate,
}: ScenarioSelectorProps) => {
  const [compareMode, setCompareMode] = useState(false);

  const getScenarioIcon = (type: "conventional" | "circular") => {
    return type === "circular" ? Recycle : Factory;
  };

  const getScenarioColor = (type: "conventional" | "circular") => {
    return type === "circular" ? "circular" : "linear";
  };

  const getImpactPreview = (scenario: LCAScenario) => {
    const isCircular = scenario.type === "circular";
    const recycledContent = scenario.inputs.materialSource === "recycled" ? 85 : 0;
    const co2Reduction = isCircular ? 65 : 0;
    
    return {
      recycledContent,
      co2Reduction,
      energySavings: isCircular ? 45 : 0,
    };
  };

  return (
    <div className="space-y-4">
      {/* Toggle Compare Mode */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scenarios</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCompareMode(!compareMode)}
          className="gap-2"
        >
          <ArrowRightLeft className="h-4 w-4" />
          {compareMode ? "Single View" : "Compare"}
        </Button>
      </div>

      {compareMode ? (
        /* Side-by-Side Comparison */
        <div className="grid grid-cols-2 gap-4">
          {scenarios.map((scenario, index) => {
            const Icon = getScenarioIcon(scenario.type);
            const color = getScenarioColor(scenario.type);
            const impact = getImpactPreview(scenario);
            
            return (
              <Card
                key={index}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedScenario === index
                    ? `border-${color} shadow-glow`
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => onScenarioChange(index)}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 text-${color}`} />
                    <span className="font-medium">{scenario.name}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CO₂ Reduction:</span>
                      <Badge variant={impact.co2Reduction > 0 ? "default" : "secondary"}>
                        {impact.co2Reduction > 0 ? `-${impact.co2Reduction}%` : "Baseline"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recycled Content:</span>
                      <Badge variant="outline">
                        {impact.recycledContent}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className={scenario.inputs.materialSource === "recycled" ? "text-circular border-circular" : ""}
                    >
                      {scenario.inputs.materialSource}
                    </Badge>
                    <Badge variant="outline">
                      {scenario.inputs.energySource}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={scenario.inputs.endOfLife === "recycling" ? "text-circular border-circular" : ""}
                    >
                      {scenario.inputs.endOfLife}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Single Scenario Tabs */
        <Tabs
          value={selectedScenario.toString()}
          onValueChange={(value) => onScenarioChange(parseInt(value))}
        >
          <TabsList className="grid w-full grid-cols-2">
            {scenarios.map((scenario, index) => {
              const Icon = getScenarioIcon(scenario.type);
              return (
                <TabsTrigger key={index} value={index.toString()} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {scenario.type === "circular" ? "Circular" : "Linear"}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {scenarios.map((scenario, index) => {
            const impact = getImpactPreview(scenario);
            return (
              <TabsContent key={index} value={index.toString()} className="mt-4">
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge variant={scenario.type === "circular" ? "default" : "secondary"}>
                        {scenario.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-circular">
                          {impact.co2Reduction}%
                        </div>
                        <div className="text-xs text-muted-foreground">CO₂ Reduction</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-primary">
                          {impact.recycledContent}%
                        </div>
                        <div className="text-xs text-muted-foreground">Recycled Content</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-accent">
                          {impact.energySavings}%
                        </div>
                        <div className="text-xs text-muted-foreground">Energy Savings</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {scenario.inputs.metal}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={scenario.inputs.materialSource === "recycled" ? "text-circular border-circular" : ""}
                      >
                        {scenario.inputs.materialSource} material
                      </Badge>
                      <Badge variant="outline">
                        {scenario.inputs.energySource} energy
                      </Badge>
                      <Badge
                        variant="outline"
                        className={scenario.inputs.endOfLife === "recycling" ? "text-circular border-circular" : ""}
                      >
                        {scenario.inputs.endOfLife}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Environmental Impact Indicator */}
      <Card className="p-3 bg-gradient-to-r from-circular/10 to-primary/10">
        <div className="flex items-center gap-2 text-sm">
          <TrendingDown className="h-4 w-4 text-circular" />
          <span className="font-medium">Impact Comparison:</span>
          <span className="text-muted-foreground">
            Circular economy approaches can reduce environmental impact by up to 65%
          </span>
        </div>
      </Card>
    </div>
  );
};