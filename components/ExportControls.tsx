import React, { useState, useMemo } from 'react';
import { GlucoseReading } from '../types';

interface ExportControlsProps {
  readings: GlucoseReading[];
}

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MONTH_NAMES_UPPERCASE = MONTH_NAMES.map(name => name.toUpperCase());

// Icono de Impresora
const PrinterIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5 4V3a2 2 0 012-2h6a2 2 0 012 2v1h2a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h2zm10 2H5v6h10V6zm-3 7a1 1 0 011 1v2h-4v-2a1 1 0 011-1h2zM3 3a1 1 0 00-1 1v1h1V3z" clipRule="evenodd" />
  </svg>
);


const ExportControls: React.FC<ExportControlsProps> = ({ readings }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); 

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const availableYears = useMemo(() => {
    if (!readings || readings.length === 0) {
      return [currentYear.toString()];
    }
    const years = new Set(readings.map(r => r.date.substring(0, 4)));
    years.add(currentYear.toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [readings, currentYear]);

  const formatShortDateForTxt = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  
  const handleDownload = () => {
    const filteredReadings = readings.filter(r => {
      return r.date.startsWith(`${selectedYear}-${selectedMonth}`);
    });

    if (filteredReadings.length === 0) {
      alert(`No hay mediciones registradas para ${MONTH_NAMES[parseInt(selectedMonth, 10) - 1]} de ${selectedYear}.`);
      return;
    }

    filteredReadings.sort((a,b) => a.timestamp - b.timestamp);

    let txtContent = `Informe de Glucosa: ${MONTH_NAMES[parseInt(selectedMonth, 10) - 1]} ${selectedYear}\n`;
    txtContent += "=================================\n";
    
    filteredReadings.forEach(r => {
      txtContent += `${formatShortDateForTxt(r.date)} ${r.time} - Nivel: ${r.glucoseLevel} mg/dL\n`;
    });
    
    txtContent += "=================================\n";
    txtContent += `Total de mediciones: ${filteredReadings.length}\n`;

    const monthNameForFile = MONTH_NAMES_UPPERCASE[parseInt(selectedMonth, 10) - 1];
    const fileName = `mediciones_glucosa_${monthNameForFile}_${selectedYear}.txt`;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold text-dark mb-4">Exportar Mediciones</h2>
      <div className="flex flex-wrap items-end gap-3"> {/* Updated for better wrapping and single-line attempt */}
        <div className="flex-1 basis-[140px] min-w-[120px]"> {/* Mes */}
          <label htmlFor="exportMonth" className="block text-sm font-medium text-gray-700">
            Mes
          </label>
          <select
            id="exportMonth"
            name="exportMonth"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={index} value={(index + 1).toString().padStart(2, '0')}>
                {name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 basis-[100px] min-w-[90px]"> {/* Año */}
          <label htmlFor="exportYear" className="block text-sm font-medium text-gray-700">
            Año
          </label>
          <select
            id="exportYear"
            name="exportYear"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 basis-[150px] min-w-[140px]"> {/* Botón */}
          <button
            type="button"
            onClick={handleDownload}
            aria-label={`Descargar mediciones de ${MONTH_NAMES[parseInt(selectedMonth, 10) - 1]} de ${selectedYear} como archivo TXT`}
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          >
            <PrinterIcon className="w-5 h-5 mr-2" />
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
