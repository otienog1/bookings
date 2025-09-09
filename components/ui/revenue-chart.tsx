'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, ChevronDown } from 'lucide-react';
import { useState, useMemo, useRef, useCallback } from 'react';

interface BookingTrendData {
  month: string;
  pax: number;
  bookings: number;
  date: string;
}

interface DailyTrendData {
  day: string;
  pax: number;
  bookings: number;
  date: string;
}

interface BookingTrendsChartProps {
  data?: BookingTrendData[] | null;
  dailyData?: DailyTrendData[] | null;
}

export function BookingTrendsChart({ data, dailyData }: BookingTrendsChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 28 Days');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use provided data or fallback to empty array
  const allTrendsData = useMemo(() => data || [], [data]);
  
  // Get daily data from props (real database data)
  const getDailyData = useCallback((): DailyTrendData[] => {
    return dailyData || [];
  }, [dailyData]);

  // Filter data based on selected period
  const trendsData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    switch (selectedPeriod) {
      case 'Last 28 Days':
        return getDailyData();
      case 'Last 3 Months':
        // Generate last 3 months including current month
        const threeMonthsResult: BookingTrendData[] = [];
        
        // Generate months from oldest to newest, including current month
        for (let i = 2; i >= 0; i--) {
          const targetDate = new Date(currentYear, currentMonth, 1);
          targetDate.setMonth(targetDate.getMonth() - i);
          
          const targetYear = targetDate.getFullYear();
          const targetMonth = targetDate.getMonth();
          
          const dateKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
          const monthName = targetDate.toLocaleDateString('en', { month: 'short' });
          
          const existingData = allTrendsData?.find(item => item.date === dateKey);
          
          threeMonthsResult.push(existingData || {
            month: monthName,
            pax: 0,
            bookings: 0,
            date: dateKey
          });
        }
        
        return threeMonthsResult;
      case 'Last 6 Months':
        // Generate last 6 months including current month
        const sixMonthsResult: BookingTrendData[] = [];
        
        // Generate months from oldest to newest, including current month
        for (let i = 5; i >= 0; i--) {
          const targetDate = new Date(currentYear, currentMonth, 1);
          targetDate.setMonth(targetDate.getMonth() - i);
          
          const targetYear = targetDate.getFullYear();
          const targetMonth = targetDate.getMonth();
          
          const dateKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
          const monthName = targetDate.toLocaleDateString('en', { month: 'short' });
          
          const existingData = allTrendsData?.find(item => item.date === dateKey);
          
          sixMonthsResult.push(existingData || {
            month: monthName,
            pax: 0,
            bookings: 0,
            date: dateKey
          });
        }
        
        return sixMonthsResult;
      case 'Last 365 Days':
        if (!allTrendsData || allTrendsData.length === 0) return [];
        const threeHundredSixtyFiveDaysAgo = new Date();
        threeHundredSixtyFiveDaysAgo.setDate(threeHundredSixtyFiveDaysAgo.getDate() - 365);
        return allTrendsData.filter(item => {
          try {
            const itemDate = new Date(item.date + '-01');
            return itemDate >= threeHundredSixtyFiveDaysAgo;
          } catch {
            return false;
          }
        });
      default:
        return allTrendsData || [];
    }
  }, [allTrendsData, getDailyData, selectedPeriod]);
  
  // Handle empty data case
  if (trendsData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-lg font-semibold">Booking Trends</CardTitle>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Monthly passenger and booking trends for 2024
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No booking data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rawMaxValue = trendsData.length > 0 ? Math.max(...trendsData.map(d => d.pax)) : 0;
  const rawMinValue = trendsData.length > 0 ? Math.min(...trendsData.map(d => d.pax)) : 0;
  
  // Handle case where all values are the same (including zero)
  const maxValue = rawMaxValue === rawMinValue ? Math.max(rawMaxValue, 10) : rawMaxValue;
  const minValue = rawMaxValue === rawMinValue ? 0 : rawMinValue;
  const chartHeight = 320; // Increased from 200
  const chartWidth = 800; // Increased from 600
  const padding = 50; // Increased from 40
  
  // Create smooth curve path
  const createSmoothPath = () => {
    if (trendsData.length === 0) return '';
    
    const points = trendsData.map((data, index) => {
      const xPos = trendsData.length > 1 
        ? padding + (index / (trendsData.length - 1)) * (chartWidth - 2 * padding)
        : padding + (chartWidth - 2 * padding) / 2; // Center single point
      
      const valueRange = maxValue - minValue;
      const yPos = valueRange > 0 
        ? padding + (1 - (data.pax - minValue) / valueRange) * (chartHeight - 2 * padding)
        : padding + (chartHeight - 2 * padding) / 2; // Center if no range
      
      return { x: xPos, y: yPos };
    });

    if (points.length < 2) {
      // Single point - create a small horizontal line
      const point = points[0];
      return `M ${point.x - 10},${point.y} L ${point.x + 10},${point.y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      // Create smooth curves using quadratic bezier
      const cpx = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
      const cpy = prevPoint.y;
      
      path += ` Q ${cpx},${cpy} ${currentPoint.x},${currentPoint.y}`;
    }
    
    return path;
  };

  const linePath = createSmoothPath();
  const areaPath = linePath ? linePath + ` L ${padding + (chartWidth - 2 * padding)},${chartHeight - padding} L ${padding},${chartHeight - padding} Z` : '';

  // Calculate data points for hover detection
  const dataPoints = trendsData.map((data, index) => {
    const xPos = trendsData.length > 1 
      ? padding + (index / (trendsData.length - 1)) * (chartWidth - 2 * padding)
      : padding + (chartWidth - 2 * padding) / 2;
    
    const valueRange = maxValue - minValue;
    const yPos = valueRange > 0 
      ? padding + (1 - (data.pax - minValue) / valueRange) * (chartHeight - 2 * padding)
      : padding + (chartHeight - 2 * padding) / 2;
    
    return { x: xPos, y: yPos, data };
  });

  // Handle mouse move for hover detection
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to SVG coordinates
    const svgX = (x / rect.width) * chartWidth;
    const svgY = (y / rect.height) * (chartHeight + 40);
    
    // Find closest point
    let closestIndex = -1;
    let minDistance = Infinity;
    
    dataPoints.forEach((point, index) => {
      const distance = Math.sqrt(Math.pow(svgX - point.x, 2) + Math.pow(svgY - point.y, 2));
      if (distance < minDistance && distance < 30) { // 30px threshold
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    if (closestIndex !== -1) {
      setHoveredPoint({
        index: closestIndex,
        x: event.clientX,
        y: event.clientY
      });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-lg font-semibold">Booking Trends</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                {selectedPeriod}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPeriod('Last 28 Days')}>
                Last 28 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod('Last 3 Months')}>
                Last 3 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod('Last 6 Months')}>
                Last 6 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod('Last 365 Days')}>
                Last 365 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod('All Time')}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedPeriod === 'Last 28 Days' 
            ? 'Daily passenger and booking trends for the last 28 days' 
            : 'Monthly passenger and booking trends'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Area Chart */}
        <div className="relative w-full" style={{ height: `${chartHeight + 60}px` }}>
          <svg 
            ref={svgRef}
            className="w-full h-full cursor-pointer" 
            viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="revenueLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="50%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
              <linearGradient id="revenueAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={padding}
                y1={padding + ratio * (chartHeight - 2 * padding)}
                x2={chartWidth - padding}
                y2={padding + ratio * (chartHeight - 2 * padding)}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
            ))}
            
            {/* Vertical grid lines */}
            {trendsData.map((_, index) => {
              const isDaily = selectedPeriod === 'Last 28 Days';
              const showGridLine = isDaily ? index % 7 === 0 : index % 3 === 0; // Weekly grid for daily view, every 3 months for monthly
              
              if (showGridLine) {
                const divisor = Math.max(trendsData.length - 1, 1); // Prevent division by zero
                const x = padding + (index / divisor) * (chartWidth - 2 * padding);
                return (
                  <line
                    key={index}
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={chartHeight - padding}
                    stroke="currentColor"
                    strokeOpacity="0.05"
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })}
            
            {/* Area fill */}
            <path
              d={areaPath}
              fill="url(#revenueAreaGradient)"
              className="drop-shadow-sm"
            />
            
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#revenueLineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
            
            
            {/* X-axis labels */}
            {trendsData.map((data, index) => {
              const divisor = Math.max(trendsData.length - 1, 1); // Prevent division by zero
              const x = padding + (index / divisor) * (chartWidth - 2 * padding);
              const isDaily = selectedPeriod === 'Last 28 Days';
              const showLabel = isDaily ? (index % 4 === 0 || index === trendsData.length - 1) : true; // Show every 4th day for daily view
              
              if (!showLabel) return null;
              
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize={isDaily ? "10" : "12"}
                  fill="currentColor"
                  opacity="0.6"
                  className="font-medium"
                >
                  {isDaily ? (data as DailyTrendData).day : (data as BookingTrendData).month}
                </text>
              );
            })}
            
            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = minValue + ratio * (maxValue - minValue);
              const y = padding + (1 - ratio) * (chartHeight - 2 * padding);
              return (
                <text
                  key={ratio}
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="currentColor"
                  opacity="0.5"
                >
                  {Math.round(value)}
                </text>
              );
            })}
            
            {/* Hover points */}
            {dataPoints.map((point, index) => (
              <circle
                key={`hover-point-${index}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="white"
                stroke="url(#revenueLineGradient)"
                strokeWidth="3"
                opacity={hoveredPoint?.index === index ? 1 : 0}
                className="transition-opacity duration-200"
              />
            ))}
          </svg>
          
          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="fixed z-50 bg-black/90 text-white px-2 py-1 rounded text-xs pointer-events-none"
              style={{
                left: hoveredPoint.x + 15,
                top: hoveredPoint.y + 15
              }}
            >
              <div className="font-medium">
                {selectedPeriod === 'Last 28 Days' 
                  ? (dataPoints[hoveredPoint.index].data as DailyTrendData).day
                  : (dataPoints[hoveredPoint.index].data as BookingTrendData).month}
              </div>
              <div className="text-blue-300">
                Pax: {dataPoints[hoveredPoint.index].data.pax}
              </div>
              <div className="text-green-300">
                Bookings: {dataPoints[hoveredPoint.index].data.bookings}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}