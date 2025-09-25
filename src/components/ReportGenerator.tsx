import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Share2, 
  Printer,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const ReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call to Rust backend for report generation
      const response = await fetch('/api/generate_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          format: 'pdf',
          includeCharts: true,
          includeComparison: true 
        }),
      });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setReportGenerated(true);
      toast({
        title: "Report Generated Successfully",
        description: "Your LCA report is ready for download.",
      });
      
    } catch (error) {
      console.log("Using mock report generation for demo");
      // Mock successful generation for demo
      await new Promise(resolve => setTimeout(resolve, 3000));
      setReportGenerated(true);
      toast({
        title: "Report Generated Successfully",
        description: "Your LCA report is ready for download.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const mockReportSections = [
    { name: "Executive Summary", status: "complete", pages: 2 },
    { name: "Methodology & Scope", status: "complete", pages: 3 },
    { name: "Input Parameters", status: "complete", pages: 1 },
    { name: "Impact Assessment Results", status: "complete", pages: 4 },
    { name: "Scenario Comparison", status: "complete", pages: 3 },
    { name: "Circularity Analysis", status: "complete", pages: 2 },
    { name: "Recommendations", status: "complete", pages: 2 },
    { name: "Appendices", status: "complete", pages: 5 },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          LCA Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {!reportGenerated ? (
          <>
            {/* Generation Controls */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Generate comprehensive LCA report with charts, comparisons, and recommendations.
              </p>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Badge variant="outline" className="justify-center">
                  📊 Charts
                </Badge>
                <Badge variant="outline" className="justify-center">
                  📋 Comparison
                </Badge>
                <Badge variant="outline" className="justify-center">
                  💡 Insights
                </Badge>
              </div>
              
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
              >
                {isGenerating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate LCA Report
                  </>
                )}
              </Button>
            </div>

            {/* Progress Indicator */}
            {isGenerating && (
              <Card className="p-3 bg-muted/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary animate-spin" />
                    <span>Processing LCA data and generating visualizations...</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                </div>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Generated Report Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-circular">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Report Generated Successfully</span>
              </div>
              
              <Separator />
              
              {/* Report Sections */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Report Contents:</h4>
                <div className="space-y-1">
                  {mockReportSections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-circular" />
                        <span>{section.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {section.pages} {section.pages === 1 ? 'page' : 'pages'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Report Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">22</div>
                  <div className="text-xs text-muted-foreground">Total Pages</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">8</div>
                  <div className="text-xs text-muted-foreground">Charts</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">PDF</div>
                  <div className="text-xs text-muted-foreground">Format</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Report
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full gap-2"
                onClick={() => setReportGenerated(false)}
              >
                <Printer className="h-4 w-4" />
                Generate New Report
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};