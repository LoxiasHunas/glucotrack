
export interface GlucoseReading {
  id: string;
  glucoseLevel: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timestamp: number; // Combined date and time for sorting
}

export type NotificationType = 'success' | 'error';

export interface NotificationMessage {
  id: string;
  message: string;
  type: NotificationType;
}
    
