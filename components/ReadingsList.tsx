
import React from 'react';
import { GlucoseReading } from '../types';

interface ReadingsListProps {
  readings: GlucoseReading[];
  onDeleteReading: (id: string) => void;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', options);
};

const formatTime = (timeString: string) => {
  return timeString;
};

const getGlucoseLevelStyle = (glucoseLevel: number): { textClass: string; borderClass: string; label: string } => {
  if (glucoseLevel < 55) {
    return { textClass: 'text-danger', borderClass: 'border-danger', label: 'Peligro (Hipoglucemia Severa)' };
  } else if (glucoseLevel < 70) {
    return { textClass: 'text-warning', borderClass: 'border-warning', label: 'Riesgo (Hipoglucemia)' };
  } else if (glucoseLevel <= 140) {
    return { textClass: 'text-primary', borderClass: 'border-primary', label: 'Normal' };
  } else if (glucoseLevel <= 180) {
    return { textClass: 'text-warning', borderClass: 'border-warning', label: 'Riesgo (Hiperglucemia Leve)' };
  } else {
    return { textClass: 'text-danger', borderClass: 'border-danger', label: 'Peligro (Hiperglucemia Severa)' };
  }
};

const ReadingsList: React.FC<ReadingsListProps> = ({ readings, onDeleteReading }) => {
  if (readings.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <p className="text-gray-600 text-center">No hay mediciones registradas aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold text-dark mb-4">Historial de Mediciones</h2>
      <ul className="space-y-3">
        {readings.map((reading) => {
          const { textClass, borderClass, label } = getGlucoseLevelStyle(reading.glucoseLevel);
          return (
            <li
              key={reading.id}
              className={`p-4 border border-l-4 ${borderClass} border-gray-200 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors`}
              aria-label={`Medición: ${reading.glucoseLevel} mg/dL, Estado: ${label}`}
            >
              <div className="mb-2 sm:mb-0">
                <p className={`text-lg font-semibold ${textClass}`}>{reading.glucoseLevel} mg/dL</p>
                <p className="text-xs text-gray-500 italic">{label}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(reading.date)} - {formatTime(reading.time)}
                </p>
              </div>
              <button
                onClick={() => onDeleteReading(reading.id)}
                className="mt-2 sm:mt-0 px-3 py-1 bg-danger text-white text-xs font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-danger transition-colors"
                aria-label={`Eliminar medición de ${reading.glucoseLevel} mg/dL del ${formatDate(reading.date)}`}
              >
                Eliminar
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ReadingsList;
