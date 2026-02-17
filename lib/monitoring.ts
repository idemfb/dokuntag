/**
 * Monitoring & Observability Service
 * Tracks metrics, performance, and errors
 */

import { logInfo, logWarn, logError } from './logger';

export interface Metric {
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  labels?: Record<string, string>;
  timestamp: number;
}

export class MetricsCollector {
  private static metrics: Map<string, Metric[]> = new Map();
  private static timers: Map<string, number> = new Map();

  /**
   * Increment counter
   */
  static incrementCounter(name: string, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const metrics = this.metrics.get(key) || [];
    
    metrics.push({
      name,
      value: 1,
      type: 'counter',
      labels,
      timestamp: Date.now(),
    });

    this.metrics.set(key, metrics);
  }

  /**
   * Decrement counter
   */
  static decrementCounter(name: string, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const metrics = this.metrics.get(key) || [];
    
    metrics.push({
      name,
      value: -1,
      type: 'counter',
      labels,
      timestamp: Date.now(),
    });

    this.metrics.set(key, metrics);
  }

  /**
   * Record gauge (point-in-time value)
   */
  static recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const metrics = this.metrics.get(key) || [];
    
    metrics.push({
      name,
      value,
      type: 'gauge',
      labels,
      timestamp: Date.now(),
    });

    this.metrics.set(key, metrics);
  }

  /**
   * Start timer
   */
  static startTimer(timerId: string): void {
    this.timers.set(timerId, Date.now());
  }

  /**
   * End timer and record histogram
   */
  static endTimer(name: string, timerId: string, labels?: Record<string, string>): void {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      logWarn('TIMER_NOT_FOUND', { timerId });
      return;
    }

    const duration = Date.now() - startTime;
    const key = this.getMetricKey(name, labels);
    const metrics = this.metrics.get(key) || [];

    metrics.push({
      name,
      value: duration,
      type: 'histogram',
      labels,
      timestamp: Date.now(),
    });

    this.metrics.set(key, metrics);
    this.timers.delete(timerId);
  }

  /**
   * Get all metrics summary
   */
  static getSummary(maxAge?: number): Record<string, any> {
    const summary: Record<string, any> = {};
    const cutoffTime = maxAge ? Date.now() - maxAge : 0;

    for (const [key, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter((m) => m.timestamp >= cutoffTime);

      if (filtered.length === 0) continue;

      if (filtered[0].type === 'counter') {
        summary[key] = filtered.reduce((sum, m) => sum + m.value, 0);
      } else if (filtered[0].type === 'gauge') {
        summary[key] = filtered[filtered.length - 1].value;
      } else if (filtered[0].type === 'histogram') {
        const values = filtered.map((m) => m.value);
        summary[key] = {
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          p50: this.percentile(values, 0.5),
          p95: this.percentile(values, 0.95),
          p99: this.percentile(values, 0.99),
        };
      }
    }

    return summary;
  }

  /**
   * Clear old metrics
   */
  static cleanup(maxAge: number = 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAge;
    let cleaned = 0;

    for (const [key, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter((m) => m.timestamp >= cutoffTime);
      if (filtered.length === 0) {
        this.metrics.delete(key);
      } else if (filtered.length < metrics.length) {
        this.metrics.set(key, filtered);
      }
      cleaned += metrics.length - filtered.length;
    }

    if (cleaned > 0) {
      logInfo('METRICS_CLEANED', { cleaned });
    }
  }

  /**
   * Helper: Calculate percentile
   */
  private static percentile(values: number[], p: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Helper: Generate metric key
   */
  private static getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}

/**
 * Observable function decorator - tracks execution time and errors
 */
export function observable(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const timerId = `${name}:${Date.now()}:${Math.random()}`;
      MetricsCollector.startTimer(timerId);
      MetricsCollector.incrementCounter(`${name}_calls`);

      try {
        const result = await originalMethod.apply(this, args);
        MetricsCollector.endTimer(`${name}_duration`, timerId);
        MetricsCollector.incrementCounter(`${name}_success`);
        return result;
      } catch (error) {
        MetricsCollector.incrementCounter(`${name}_error`);
        logError('OBSERVABLE_FUNCTION_ERROR', { name, error });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Performance monitoring middleware
 */
export class PerformanceMonitor {
  /**
   * Track request performance
   */
  static trackRequestTiming(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    MetricsCollector.incrementCounter('http_requests', { method, path });
    MetricsCollector.recordGauge(`http_request_duration_${statusCode}`, duration, { method, path });

    if (statusCode >= 500) {
      MetricsCollector.incrementCounter('http_errors_5xx', { method, path });
    } else if (statusCode >= 400) {
      MetricsCollector.incrementCounter('http_errors_4xx', { method, path });
    }
  }

  /**
   * Track database operation
   */
  static trackDatabaseOperation(operation: string, duration: number, success: boolean): void {
    MetricsCollector.recordGauge(`db_operation_duration`, duration, { operation });
    
    if (success) {
      MetricsCollector.incrementCounter(`db_${operation}_success`);
    } else {
      MetricsCollector.incrementCounter(`db_${operation}_error`);
    }
  }

  /**
   * Track business event
   */
  static trackBusinessEvent(event: string, metadata?: Record<string, any>): void {
    MetricsCollector.incrementCounter(event, {
      ...metadata,
    });

    logInfo('BUSINESS_EVENT_TRACKED', { event, metadata });
  }
}

// Periodic cleanup
setInterval(() => {
  MetricsCollector.cleanup(60 * 60 * 1000); // Keep 1 hour of data
}, 30 * 60 * 1000); // Cleanup every 30 minutes
