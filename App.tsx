
import React, { useState, useEffect, useCallback } from 'react';
import { GlucoseReading, NotificationMessage } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import GlucoseForm from './components/GlucoseForm';
import ReadingsList from './components/ReadingsList';
import NotificationBanner from './components/NotificationBanner';

const App: React.FC = () => {
  const [readings, setReadings] = useLocalStorage<GlucoseReading[]>('glucoseReadings', []);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    const id = new Date().getTime().toString();
    setNotification({ id, message, type });
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddReading = useCallback((newReadingData: Omit<GlucoseReading, 'id' | 'timestamp'>) => {
    try {
      const timestamp = new Date(`${newReadingData.date}T${newReadingData.time}`).getTime();
      if (isNaN(timestamp)) {
        throw new Error('Fecha u hora inválida.');
      }
      const newReading: GlucoseReading = {
        ...newReadingData,
        id: timestamp.toString() + Math.random().toString(36).substring(2,9), // More unique ID
        timestamp,
      };
      
      setReadings(prevReadings => {
        const updatedReadings = [...prevReadings, newReading];
        // Sort by timestamp descending (most recent first)
        updatedReadings.sort((a, b) => b.timestamp - a.timestamp);
        return updatedReadings;
      });
      showNotification('Medición guardada exitosamente.', 'success');
    } catch (error) {
      console.error("Error adding reading:", error);
      showNotification(error instanceof Error ? error.message : 'Error al guardar la medición.', 'error');
    }
  }, [setReadings, showNotification]);

  const handleDeleteReading = useCallback((id: string) => {
    setReadings(prevReadings => prevReadings.filter(reading => reading.id !== id));
    showNotification('Medición eliminada.', 'success');
  }, [setReadings, showNotification]);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Ensure readings are always sorted for display
  const sortedReadings = React.useMemo(() => {
    return [...readings].sort((a, b) => b.timestamp - a.timestamp);
  }, [readings]);

  return (
    <div className="min-h-screen bg-light text-dark flex flex-col items-center py-8 px-4">
      <NotificationBanner notification={notification} onClose={closeNotification} />
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">Registro de Glucosa</h1>
        <p className="text-gray-600 mt-2">Mantén un control de tus niveles de glucosa de forma sencilla.</p>
      </header>
      
      <main className="w-full max-w-lg">
        <GlucoseForm onAddReading={handleAddReading} />
        <ReadingsList readings={sortedReadings} onDeleteReading={handleDeleteReading} />
      </main>

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Glucose Logger. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
    
