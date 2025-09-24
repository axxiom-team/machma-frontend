import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analysis</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Trends chart will be displayed here
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Patterns visualization will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}