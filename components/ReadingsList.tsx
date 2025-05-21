import React from 'react';
import { GlucoseReading } from '../types';

interface ReadingsListProps {
  readings: GlucoseReading[];
  onDeleteReading: (id: string) => void;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  // Aseguramos que la fecha se interprete correctamente como local añadiendo la hora
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', options);
};

// Icono de Papelera para el botón de eliminar
const TrashIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4.5h8V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4.5A1.25 1.25 0 0111.25 3h-2.5A1.25 1.25 0 0110 4.5zM.75 6.75A.75.75 0 000 7.5v9c0 .828.672 1.5 1.5 1.5h17c.828 0 1.5-.672 1.5-1.5v-9a.75.75 0 00-.75-.75h-4.5V6A1.5 1.5 0 0013.5 4.5h-7A1.5 1.5 0 005 6v.75H.75zM5.75 6h8.5V4.5a.75.75 0 00-.75-.75h-7a.75.75 0 00-.75.75V6z" clipRule="evenodd" />
    <path d="M3 9.75A.75.75 0 013.75 9h.5a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-6zm5 0A.75.75 0 018.75 9h.5a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-6zm5 0A.75.75 0 0113.75 9h.5a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-6z" />
  </svg>
);


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
        <h2 className="text-xl font-semibold text-dark mb-4">Historial de Mediciones</h2>
        <p className="text-gray-600 text-center py-4">No hay mediciones registradas aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold text-dark mb-4">Historial de Mediciones</h2>
      <div className="max-h-96 overflow-y-auto" role="region" aria-labelledby="history-heading">
        <ul className="space-y-3">
          {readings.map((reading) => {
            const { textClass, borderClass, label } = getGlucoseLevelStyle(reading.glucoseLevel);
            return (
              <li
                key={reading.id}
                className={`p-3 border border-l-4 ${borderClass} border-gray-200 rounded-md flex items-center justify-between hover:bg-gray-50 transition-colors`}
                aria-label={`Medición: ${reading.glucoseLevel} mg/dL, Estado: ${label}, Fecha: ${formatDate(reading.date)} ${reading.time}`}
              >
                <div className="flex-grow">
                  <div className="flex items-baseline space-x-2">
                    <p className={`text-lg font-semibold ${textClass}`}>{reading.glucoseLevel} mg/dL</p>
                    <p className={`text-xs italic ${textClass}`}>{label}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(reading.date)} - {reading.time}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteReading(reading.id)}
                  className="ml-3 p-2 text-gray-500 hover:text-danger hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-danger transition-colors"
                  aria-label={`Eliminar medición de ${reading.glucoseLevel} mg/dL del ${formatDate(reading.date)}`}
                >
                  <TrashIcon />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ReadingsList;
