import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserInputModule } from "./UserInputModule";
import { ScenarioSelector } from "./ScenarioSelector";
import { SankeyVisualization } from "./SankeyVisualization";
import { KPIDashboard } from "./KPIDashboard";
import { ReportGenerator } from "./ReportGenerator";
import { Recycle, Zap, Factory } from "lucide-react";

export interface LCAInputs {
  metal: "aluminum" | "copper";
  materialSource: "primary" | "recycled";
  energySource: "coal" | "grid" | "renewables";
  transportMode: "truck" | "rail" | "ship";
  transportDistance: number;
  endOfLife: "landfill" | "recycling";
  quantity: number;
}

export interface LCAScenario {
  name: string;
  type: "conventional" | "circular";
  inputs: LCAInputs;
}

const defaultInputs: LCAInputs = {
  metal: "aluminum",
  materialSource: "primary",
  energySource: "grid",
  transportMode: "truck",
  transportDistance: 500,
  endOfLife: "recycling",
  quantity: 1000,
};

export const LCADashboard = () => {
  const [currentInputs, setCurrentInputs] = useState<LCAInputs>(defaultInputs);
  const [scenarios, setScenarios] = useState<LCAScenario[]>([
    {
      name: "Conventional (Linear)",
      type: "conventional",
      inputs: { ...defaultInputs, materialSource: "primary", endOfLife: "landfill" },
    },
    {
      name: "Circular Economy",
      type: "circular", 
      inputs: { ...defaultInputs, materialSource: "recycled", endOfLife: "recycling" },
    },
  ]);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [isRunningLCA, setIsRunningLCA] = useState(false);

  const handleInputChange = (newInputs: LCAInputs) => {
    setCurrentInputs(newInputs);
    // Update the selected scenario
    const updatedScenarios = [...scenarios];
    updatedScenarios[selectedScenario].inputs = newInputs;
    setScenarios(updatedScenarios);
  };

  const handleRunLCA = async () => {
    setIsRunningLCA(true);
    // Simulate API call to Rust backend
    try {
      // POST to /run_lca endpoint
      const response = await fetch('/api/run_lca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInputs),
      });
      // For demo purposes, we'll just simulate the delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log("Using mock data for demo");
    } finally {
      setIsRunningLCA(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card/90 backdrop-blur-sm border-b shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Recycle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                AI-Driven LCA Platform
              </h1>
              <p className="text-sm text-muted-foreground">
                Life Cycle Assessment for Metals Circularity
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* User Input Module */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-primary" />
                  Process Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserInputModule
                  inputs={currentInputs}
                  onChange={handleInputChange}
                  onRunLCA={handleRunLCA}
                  isLoading={isRunningLCA}
                />
              </CardContent>
            </Card>

            {/* Scenario Selection */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Scenario Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScenarioSelector
                  scenarios={scenarios}
                  selectedScenario={selectedScenario}
                  onScenarioChange={setSelectedScenario}
                  onScenariosUpdate={setScenarios}
                />
              </CardContent>
            </Card>

            {/* Report Generator */}
            <ReportGenerator />
          </div>

          {/* Right Panel - Visualizations */}
          <div className="space-y-6">
            {/* KPI Dashboard */}
            <KPIDashboard
              scenario={scenarios[selectedScenario]}
              isLoading={isRunningLCA}
            />

            {/* Sankey Visualization */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Material & Energy Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <SankeyVisualization
                  scenario={scenarios[selectedScenario]}
                  isLoading={isRunningLCA}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};