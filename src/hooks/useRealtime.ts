import { useEffect, useState } from 'react';
import webSocketService from '@/services/websocket';

export const useRealtime = (event: string, callback?: (data: any) => void) => {
  const [lastData, setLastData] = useState<any>(null);

  useEffect(() => {
    webSocketService.connect();

    const handleData = (data: any) => {
      setLastData(data);
      if (callback) {
        callback(data);
      }
    };

    webSocketService.on(event, handleData);

    return () => {
      webSocketService.off(event, handleData);
    };
  }, [event, callback]);

  const emit = (data: any) => {
    webSocketService.emit(event, data);
  };

  return { lastData, emit };
};

// Specialized realtime hook (example)
export const useJudgingStatus = (eventId: string) => {
  return useRealtime(`judging-update-${eventId}`);
};
