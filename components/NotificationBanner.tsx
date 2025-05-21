
import React from 'react';
import { NotificationMessage, NotificationType } from '../types';

interface NotificationBannerProps {
  notification: NotificationMessage | null;
  onClose: () => void;
}

const IconSuccess: React.FC = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
  </svg>
);

const IconError: React.FC = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
  </svg>
);

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const baseClasses = "fixed top-5 right-5 flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg z-50";
  const typeClasses: Record<NotificationType, string> = {
    success: "text-green-800 bg-green-100 dark:bg-green-200 dark:text-green-800",
    error: "text-red-800 bg-red-100 dark:bg-red-200 dark:text-red-800",
  };

  const Icon = notification.type === 'success' ? IconSuccess : IconError;

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]}`} role="alert">
      <Icon />
      <span className="sr-only">{notification.type === 'success' ? 'Éxito' : 'Error'}</span>
      <div className="ml-3 text-sm font-medium">{notification.message}</div>
      <button
        type="button"
        className={`ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-500 hover:bg-green-200 focus:ring-green-400 dark:bg-green-200 dark:text-green-600 dark:hover:bg-green-300' 
            : 'bg-red-100 text-red-500 hover:bg-red-200 focus:ring-red-400 dark:bg-red-200 dark:text-red-600 dark:hover:bg-red-300'
        }`}
        onClick={onClose}
        aria-label="Cerrar"
      >
        <span className="sr-only">Cerrar</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </div>
  );
};

export default NotificationBanner;
    
