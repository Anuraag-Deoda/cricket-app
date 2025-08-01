import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCricketStore } from "@/store/cricket-store";

export default function AnalyticsInterface() {
  const { match, teams } = useCricketStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Run Rate Chart */}
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-line text-cricket-primary mr-2"></i>
              Run Rate Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-cricket-gray">
                <i className="fas fa-chart-area text-4xl mb-2"></i>
                <p>Run Rate Worm Chart</p>
                <p className="text-sm">Real-time chart updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partnership Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-users text-cricket-primary mr-2"></i>
            Partnerships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-cricket-bg rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">
                  {match.currentBatsmen.striker?.name.split(' ').pop()} & {match.currentBatsmen.nonStriker?.name.split(' ').pop()}
                </span>
                <span className="font-source-code text-sm">37*</span>
              </div>
              <div className="flex justify-between text-xs text-cricket-gray">
                <span>26 balls</span>
                <span>RR: 8.5</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">Previous Partnership</span>
                <span className="font-source-code text-sm">45</span>
              </div>
              <div className="flex justify-between text-xs text-cricket-gray">
                <span>32 balls</span>
                <span>RR: 8.4</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wagon Wheel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-chart-pie text-cricket-primary mr-2"></i>
            Shot Map ({match.currentBatsmen.striker?.name.split(' ').pop() || 'Batsman'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-cricket-gray">
              <i className="fas fa-crosshairs text-3xl mb-2"></i>
              <p>Wagon Wheel</p>
              <p className="text-xs">Shot placement visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Momentum Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-bolt text-cricket-primary mr-2"></i>
            Match Momentum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-cricket-gray">
              <i className="fas fa-wave-square text-3xl mb-2"></i>
              <p>Momentum Tracker</p>
              <p className="text-xs">Pressure phases visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bowling Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-baseball-ball text-cricket-primary mr-2"></i>
            Bowling Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {match.currentBowler && (
              <div className="flex items-center justify-between p-3 bg-cricket-bg rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {match.currentBowler.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{match.currentBowler.name.split(' ').pop()}</p>
                    <p className="text-xs text-cricket-gray">2.3-0-18-1</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-source-code text-sm">{(match.currentBowler.economy || 0).toFixed(2)}</p>
                  <p className="text-xs text-cricket-gray">Economy</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Over Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-list-ol text-cricket-primary mr-2"></i>
            Over Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: Math.floor(match.score.overs) + 1 }, (_, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Over {i + 1}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {match.ballHistory
                      .filter((_, index) => Math.floor(index / 6) === i)
                      .reduce((sum, ball) => sum + ball.runs, 0)} runs
                  </span>
                  <span className="text-xs text-cricket-gray">
                    {match.ballHistory
                      .filter((_, index) => Math.floor(index / 6) === i && index < match.ballHistory.length)
                      .filter(ball => ball.isWicket).length} wkts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
