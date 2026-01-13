/**
 * Analytics Utility Functions
 * Calculations and data processing for analytics
 */

import { IncidentStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export interface ResponseTimeMetrics {
  total: number;
  average: number;
  median: number;
  min: number;
  max: number;
  p95: number;
}

export interface AgencyScore {
  agencyId: string;
  agencyName: string;
  score: number;
  incidentsHandled: number;
  avgResponseTime: number;
  resolutionRate: number;
  factors: {
    responseTime: number;
    resolutionRate: number;
    volume: number;
    consistency: number;
  };
}

/**
 * Calculate response time for an incident
 * Returns time in minutes from reported to resolved
 */
export function calculateResponseTime(incident: {
  createdAt: Date;
  dispatchedAt?: Date | null;
  resolvedAt?: Date | null;
  status: IncidentStatus;
}): number | null {
  if (incident.status === IncidentStatus.RESOLVED || incident.status === IncidentStatus.CLOSED) {
    const endTime = incident.resolvedAt || new Date();
    const startTime = incident.createdAt;
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
  }
  return null;
}

/**
 * Calculate resolution rate
 * Returns percentage of incidents that were resolved
 */
export function calculateResolutionRate(incidents: Prisma.incidentsGetPayload<{}>[]): number {
  if (incidents.length === 0) return 0;

  const resolved = incidents.filter(
    (inc) => inc.status === IncidentStatus.RESOLVED || inc.status === IncidentStatus.CLOSED
  ).length;

  return Math.round((resolved / incidents.length) * 100 * 100) / 100; // 2 decimal places
}

/**
 * Calculate agency performance score
 * Weighted score based on multiple factors
 */
export function calculateAgencyScore(agency: {
  id: string;
  name: string;
  incidents: Prisma.incidentsGetPayload<{}>[];
  avgResponseTime: number;
}): AgencyScore {
  const incidents = agency.incidents;
  const resolvedIncidents = incidents.filter(
    (inc) => inc.status === IncidentStatus.RESOLVED || inc.status === IncidentStatus.CLOSED
  );

  const resolutionRate = calculateResolutionRate(incidents);

  // Response time score (inverse - lower is better, max 100)
  const responseTimeScore = Math.max(0, 100 - agency.avgResponseTime / 10);

  // Resolution rate score (direct - higher is better)
  const resolutionRateScore = resolutionRate;

  // Volume score (normalized, max 100)
  const maxVolume = 1000; // Assume max 1000 incidents
  const volumeScore = Math.min(100, (incidents.length / maxVolume) * 100);

  // Consistency score (based on standard deviation of response times)
  const responseTimes = resolvedIncidents
    .map((inc) => calculateResponseTime(inc))
    .filter((time): time is number => time !== null);

  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

  const variance =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) /
        responseTimes.length
      : 0;

  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - stdDev / 5); // Lower std dev = higher score

  // Weighted final score
  const weights = {
    responseTime: 0.3,
    resolutionRate: 0.3,
    volume: 0.2,
    consistency: 0.2,
  };

  const score =
    responseTimeScore * weights.responseTime +
    resolutionRateScore * weights.resolutionRate +
    volumeScore * weights.volume +
    consistencyScore * weights.consistency;

  return {
    agencyId: agency.id,
    agencyName: agency.name,
    score: Math.round(score * 100) / 100,
    incidentsHandled: incidents.length,
    avgResponseTime: agency.avgResponseTime,
    resolutionRate,
    factors: {
      responseTime: Math.round(responseTimeScore * 100) / 100,
      resolutionRate: Math.round(resolutionRateScore * 100) / 100,
      volume: Math.round(volumeScore * 100) / 100,
      consistency: Math.round(consistencyScore * 100) / 100,
    },
  };
}

/**
 * Calculate responder utilization rate
 * Percentage of time spent on assignments vs. available
 */
export function calculateUtilizationRate(responder: {
  assignments: Array<{
    dispatchedAt: Date;
    completedAt?: Date | null;
    status: string;
  }>;
  totalHours: number; // Total hours in period
}): number {
  if (responder.totalHours === 0) return 0;

  const activeHours = responder.assignments.reduce((total, assignment) => {
    if (assignment.status === 'completed' && assignment.completedAt) {
      const start = assignment.dispatchedAt.getTime();
      const end = assignment.completedAt.getTime();
      return total + (end - start) / (1000 * 60 * 60); // Convert to hours
    }
    return total;
  }, 0);

  return Math.round((activeHours / responder.totalHours) * 100 * 100) / 100;
}

/**
 * Detect anomalies in data
 * Flags unusual patterns using statistical methods
 */
export function detectAnomalies(
  data: number[],
  threshold: number = 2
): Array<{ index: number; value: number; zScore: number }> {
  if (data.length < 3) return [];

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  const anomalies: Array<{ index: number; value: number; zScore: number }> = [];

  data.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > threshold) {
      anomalies.push({ index, value, zScore: Math.round(zScore * 100) / 100 });
    }
  });

  return anomalies;
}

/**
 * Generate trends from time series data
 * Calculates moving averages and trend direction
 */
export function generateTrends(
  data: Array<{ date: Date; value: number }>,
  windowSize: number = 7
): {
  movingAverage: Array<{ date: Date; value: number }>;
  trend: 'up' | 'down' | 'stable';
  trendStrength: number;
} {
  if (data.length < windowSize) {
    return {
      movingAverage: data,
      trend: 'stable',
      trendStrength: 0,
    };
  }

  const movingAverage: Array<{ date: Date; value: number }> = [];

  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    const avg = window.reduce((sum, item) => sum + item.value, 0) / windowSize;
    movingAverage.push({
      date: data[i].date,
      value: Math.round(avg * 100) / 100,
    });
  }

  // Calculate trend
  if (movingAverage.length < 2) {
    return {
      movingAverage,
      trend: 'stable',
      trendStrength: 0,
    };
  }

  const firstHalf = movingAverage.slice(0, Math.floor(movingAverage.length / 2));
  const secondHalf = movingAverage.slice(Math.floor(movingAverage.length / 2));

  const firstAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  const trendStrength = Math.abs(change);

  let trend: 'up' | 'down' | 'stable';
  if (change > 5) {
    trend = 'up';
  } else if (change < -5) {
    trend = 'down';
  } else {
    trend = 'stable';
  }

  return {
    movingAverage,
    trend,
    trendStrength: Math.round(trendStrength * 100) / 100,
  };
}

/**
 * Calculate response time distribution metrics
 */
export function calculateResponseTimeDistribution(
  incidents: Array<{ createdAt: Date; resolvedAt?: Date | null; status: IncidentStatus }>
): ResponseTimeMetrics {
  const responseTimes = incidents
    .map((inc) => calculateResponseTime(inc))
    .filter((time): time is number => time !== null)
    .sort((a, b) => a - b);

  if (responseTimes.length === 0) {
    return {
      total: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      p95: 0,
    };
  }

  const total = responseTimes.length;
  const average = responseTimes.reduce((sum, time) => sum + time, 0) / total;
  const median = responseTimes[Math.floor(total / 2)];
  const min = responseTimes[0];
  const max = responseTimes[total - 1];
  const p95Index = Math.floor(total * 0.95);
  const p95 = responseTimes[p95Index] || max;

  return {
    total,
    average: Math.round(average * 100) / 100,
    median: Math.round(median * 100) / 100,
    min,
    max,
    p95: Math.round(p95 * 100) / 100,
  };
}

/**
 * Group incidents by time period
 */
export function groupByTimePeriod(
  incidents: Prisma.incidentsGetPayload<{}>[],
  period: 'hour' | 'day' | 'week' | 'month'
): Map<string, number> {
  const grouped = new Map<string, number>();

  incidents.forEach((incident) => {
    const date = new Date(incident.createdAt);
    let key: string;

    switch (period) {
      case 'hour':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 6) / 7)).padStart(2, '0')}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    grouped.set(key, (grouped.get(key) || 0) + 1);
  });

  return grouped;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}
