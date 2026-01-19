'use client';

/**
 * Enhanced Chart Component
 * Professional charts with government-grade styling, interactivity, and real-time updates
 */

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Maximize2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/accessibility/keyboard';

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'histogram';

interface ChartProps {
  type: ChartType;
  data: any[];
  config: {
    dataKey: string;
    nameKey?: string;
    xKey?: string;
    yKey?: string;
    colors?: string[];
    title?: string;
    description?: string;
  };
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  exportable?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function Chart({
  type,
  data,
  config,
  title,
  description,
  height = 300,
  showLegend = true,
  showGrid = true,
  exportable = true,
}: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const reducedMotion = prefersReducedMotion();

  const handleExport = () => {
    if (!chartRef.current) return;

    // Create canvas from SVG
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title || 'chart'}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const colors = config.colors || DEFAULT_COLORS;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Trigger refresh (parent component should handle this)
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleFullscreen = () => {
    if (!chartRef.current) return;
    if (!isFullscreen) {
      chartRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Enhanced tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-popover p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted))"
                opacity={0.3}
              />
            )}
            <XAxis
              dataKey={config.xKey || config.nameKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ r: 5, fill: colors[0] }}
              activeDot={{ r: 7 }}
              animationDuration={reducedMotion ? 0 : 1000}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted))"
                opacity={0.3}
              />
            )}
            <XAxis
              dataKey={config.xKey || config.nameKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
            <Bar
              dataKey={config.dataKey}
              fill={colors[0]}
              radius={[8, 8, 0, 0]}
              animationDuration={reducedMotion ? 0 : 1000}
            />
          </BarChart>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={type === 'donut' ? 80 : 100}
              innerRadius={type === 'donut' ? 60 : 0}
              fill="#8884d8"
              dataKey={config.dataKey}
              nameKey={config.nameKey || 'name'}
              animationDuration={reducedMotion ? 0 : 1000}
            >
              {data.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted))"
                opacity={0.3}
              />
            )}
            <XAxis
              dataKey={config.xKey || config.nameKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
              strokeWidth={2}
              animationDuration={reducedMotion ? 0 : 1000}
            />
          </AreaChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-2 shadow-lg transition-all duration-200 hover:shadow-xl">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {title && (
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
            )}
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
              aria-label="Refresh chart"
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="h-8 w-8"
              aria-label="Fullscreen chart"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {exportable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
                className="h-8 w-8"
                aria-label="Export chart"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <motion.div
          ref={chartRef}
          style={{ width: '100%', height }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? {} : { duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}

