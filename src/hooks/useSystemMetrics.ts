
import { useState, useEffect } from 'react';

interface SystemMetric {
  value: number;
  status: 'normal' | 'warning' | 'critical';
}

export const useSystemMetrics = () => {
  const [cpuUsage, setCpuUsage] = useState<SystemMetric>({ value: 0, status: 'normal' });
  const [memoryUsage, setMemoryUsage] = useState<SystemMetric>({ value: 0, status: 'normal' });
  const [storageUsage, setStorageUsage] = useState<SystemMetric>({ value: 0, status: 'normal' });
  const [modelName, setModelName] = useState<string>('');
  const [modelStatus, setModelStatus] = useState<'idle' | 'processing' | 'error'>('idle');

  useEffect(() => {
    const updateMetrics = async () => {
      // Get memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        if (memory) {
          const usedHeapSize = memory.usedJSHeapSize;
          const totalHeapSize = memory.jsHeapSizeLimit;
          const memoryPercentage = Math.round((usedHeapSize / totalHeapSize) * 100);

          setMemoryUsage({
            value: memoryPercentage,
            status: memoryPercentage > 80 ? 'critical' : memoryPercentage > 60 ? 'warning' : 'normal'
          });
        }
      }

      // Check Ollama API connection
      try {
        // Check if Ollama is running locally
        const response = await fetch('http://localhost:11434/api/version');
        if (response.ok) {
          const data = await response.json();
          setModelName(`Ollama (r3b3l-4f-godmode)`);
          setModelStatus('idle');
          console.log('Ollama version:', data.version);
        } else {
          setModelStatus('error');
          console.error('Ollama API returned an error');
        }
      } catch (err) {
        console.error("Ollama API connection error:", err);
        setModelStatus('error');
      }

      // Estimate CPU usage through task timing
      const start = performance.now();
      let sum = 0;
      for (let i = 0; i < 100000; i++) {
        sum += Math.random();
      }
      const end = performance.now();
      const cpuLoad = Math.min(100, Math.round((end - start) / 2));

      setCpuUsage({
        value: cpuLoad,
        status: cpuLoad > 80 ? 'critical' : cpuLoad > 60 ? 'warning' : 'normal'
      });

      // Estimate storage usage through navigator.storage
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const percentage = Math.round((estimate.usage || 0) / (estimate.quota || 1) * 100);
          setStorageUsage({
            value: percentage,
            status: percentage > 80 ? 'critical' : percentage > 60 ? 'warning' : 'normal'
          });
        } catch (error) {
          console.error('Storage estimation failed:', error);
        }
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  return {
    cpuUsage,
    memoryUsage,
    storageUsage,
    modelName,
    modelStatus
  };
};
