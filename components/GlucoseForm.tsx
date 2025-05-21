
import React, { useState, useCallback } from 'react';
import { GlucoseReading } from '../types';

interface GlucoseFormProps {
  onAddReading: (reading: Omit<GlucoseReading, 'id' | 'timestamp'> & { timestamp?: number }) => void;
}

const GlucoseForm: React.FC<GlucoseFormProps> = ({ onAddReading }) => {
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [glucoseLevel, setGlucoseLevel] = useState<string>('');
  const [date, setDate] = useState<string>(getCurrentDate());
  const [time, setTime] = useState<string>(getCurrentTime());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const level = parseFloat(glucoseLevel);
    if (isNaN(level) || level <= 0) {
      setError('El nivel de glucosa debe ser un número positivo.');
      return;
    }
    if (!date) {
      setError('Por favor, seleccione una fecha.');
      return;
    }
    if (!time) {
      setError('Por favor, seleccione una hora.');
      return;
    }

    onAddReading({ glucoseLevel: level, date, time });
    setGlucoseLevel('');
    // Optionally reset date and time or keep them for next entry
    // setDate(getCurrentDate());
    // setTime(getCurrentTime());
  }, [glucoseLevel, date, time, onAddReading]);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-dark mb-4">Nueva Medición de Glucosa</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="glucoseLevel" className="block text-sm font-medium text-gray-700">
          Nivel de Glucosa (mg/dL)
        </label>
        <input
          type="number"
          id="glucoseLevel"
          value={glucoseLevel}
          onChange={(e) => setGlucoseLevel(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="Ej: 120"
          required
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Fecha
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
          Hora
        </label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Guardar Medición
      </button>
    </form>
  );
};

export default GlucoseForm;
    
