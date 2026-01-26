import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";

interface PortfolioChartProps {
  totalBalance: number;
}

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

const PortfolioChart = ({ totalBalance }: PortfolioChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1W");

  // Generate mock historical data based on total balance
  const generateChartData = () => {
    const dataPoints = selectedTimeframe === "1D" ? 24 : 
                       selectedTimeframe === "1W" ? 7 :
                       selectedTimeframe === "1M" ? 30 :
                       selectedTimeframe === "3M" ? 90 :
                       selectedTimeframe === "1Y" ? 365 : 730;
    
    const data = [];
    let value = totalBalance * 0.85;
    
    for (let i = 0; i < dataPoints; i++) {
      const change = (Math.random() - 0.45) * (totalBalance * 0.02);
      value = Math.max(0, value + change);
      data.push({
        time: i,
        value: value,
      });
    }
    
    // Ensure last point is close to current balance
    data[data.length - 1].value = totalBalance;
    
    return data;
  };

  const chartData = generateChartData();
  const startValue = chartData[0]?.value || 0;
  const percentChange = startValue > 0 ? ((totalBalance - startValue) / startValue * 100) : 0;
  const isPositive = percentChange >= 0;

  if (totalBalance === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Portfolio Performance</h3>
        <div className="h-40 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No portfolio data yet. Start by receiving some crypto!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Portfolio Performance</h3>
          <p className={`text-sm ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? "+" : ""}{percentChange.toFixed(2)}% this {selectedTimeframe.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedTimeframe === tf
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-sm font-medium text-foreground">
                        ${(payload[0].value as number).toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PortfolioChart;
