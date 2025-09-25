import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { LCAInputs } from "./LCADashboard";
import { HelpCircle, Loader2, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserInputModuleProps {
  inputs: LCAInputs;
  onChange: (inputs: LCAInputs) => void;
  onRunLCA: () => void;
  isLoading: boolean;
}

const metalPresets = {
  aluminum: { color: "bg-slate-500", label: "Aluminum (Al)" },
  copper: { color: "bg-orange-500", label: "Copper (Cu)" },
};

const energyPresets = {
  coal: { emissions: "High", color: "bg-linear" },
  grid: { emissions: "Medium", color: "bg-warning" },
  renewables: { emissions: "Low", color: "bg-circular" },
};

export const UserInputModule = ({ inputs, onChange, onRunLCA, isLoading }: UserInputModuleProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    
    if (inputs.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (inputs.transportDistance < 0) {
      newErrors.transportDistance = "Distance cannot be negative";
    }
    if (inputs.transportDistance > 10000) {
      newErrors.transportDistance = "Distance seems unrealistic (>10,000 km)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      onRunLCA();
      toast({
        title: "LCA Analysis Started",
        description: "Running life cycle assessment with current parameters...",
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the input errors before running the analysis.",
        variant: "destructive",
      });
    }
  };

  const updateInput = <K extends keyof LCAInputs>(key: K, value: LCAInputs[K]) => {
    onChange({ ...inputs, [key]: value });
    // Clear error when user fixes it
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Metal Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="metal">Metal Type</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose the metal for LCA analysis</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            {Object.entries(metalPresets).map(([key, preset]) => (
              <Card
                key={key}
                className={`p-3 cursor-pointer transition-all ${
                  inputs.metal === key 
                    ? "border-primary shadow-glow" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => updateInput("metal", key as "aluminum" | "copper")}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${preset.color}`} />
                  <span className="text-sm font-medium">{preset.label}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Material Source */}
        <div className="space-y-2">
          <Label htmlFor="materialSource">Material Source</Label>
          <Select
            value={inputs.materialSource}
            onValueChange={(value) => updateInput("materialSource", value as "primary" | "recycled")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">
                <div className="flex items-center gap-2">
                  Primary (Virgin)
                  <Badge variant="outline" className="text-linear border-linear">High Impact</Badge>
                </div>
              </SelectItem>
              <SelectItem value="recycled">
                <div className="flex items-center gap-2">
                  Recycled
                  <Badge variant="outline" className="text-circular border-circular">Low Impact</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Energy Source */}
        <div className="space-y-2">
          <Label htmlFor="energySource">Energy Source</Label>
          <Select
            value={inputs.energySource}
            onValueChange={(value) => updateInput("energySource", value as "coal" | "grid" | "renewables")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(energyPresets).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${preset.color}`} />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    <Badge variant="outline" className="text-xs">
                      {preset.emissions} CO₂
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transport */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transportMode">Transport Mode</Label>
            <Select
              value={inputs.transportMode}
              onValueChange={(value) => updateInput("transportMode", value as "truck" | "rail" | "ship")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="truck">🚛 Truck</SelectItem>
                <SelectItem value="rail">🚂 Rail</SelectItem>
                <SelectItem value="ship">🚢 Ship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transportDistance">
              Distance ({inputs.transportDistance} km)
              {errors.transportDistance && (
                <span className="text-destructive text-xs ml-2">{errors.transportDistance}</span>
              )}
            </Label>
            <Slider
              value={[inputs.transportDistance]}
              onValueChange={([value]) => updateInput("transportDistance", value)}
              max={5000}
              step={50}
              className="w-full"
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">
            Quantity ({inputs.quantity.toLocaleString()} kg)
            {errors.quantity && (
              <span className="text-destructive text-xs ml-2">{errors.quantity}</span>
            )}
          </Label>
          <Slider
            value={[inputs.quantity]}
            onValueChange={([value]) => updateInput("quantity", value)}
            min={100}
            max={10000}
            step={100}
            className="w-full"
          />
        </div>

        {/* End of Life */}
        <div className="space-y-2">
          <Label htmlFor="endOfLife">End-of-Life Option</Label>
          <Select
            value={inputs.endOfLife}
            onValueChange={(value) => updateInput("endOfLife", value as "landfill" | "recycling")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="landfill">
                <div className="flex items-center gap-2">
                  🗑️ Landfill
                  <Badge variant="outline" className="text-linear border-linear">Linear</Badge>
                </div>
              </SelectItem>
              <SelectItem value="recycling">
                <div className="flex items-center gap-2">
                  ♻️ Recycling
                  <Badge variant="outline" className="text-circular border-circular">Circular</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Run Analysis Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Analysis...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run LCA Analysis
            </>
          )}
        </Button>
      </div>
    </TooltipProvider>
  );
};