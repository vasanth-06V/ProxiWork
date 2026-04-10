// client/src/context/ToastContext.jsx
import { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        // Auto-remove after 3.5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }) {
    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}

const ICONS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

const COLORS = {
    success: { bg: '#052e16', border: '#16a34a', text: '#4ade80' },
    error:   { bg: '#2d0a0a', border: '#dc2626', text: '#f87171' },
    warning: { bg: '#2d1b00', border: '#d97706', text: '#fbbf24' },
    info:    { bg: '#0a1628', border: '#3b82f6', text: '#60a5fa' },
};

function ToastItem({ toast, onRemove }) {
    const color = COLORS[toast.type] || COLORS.info;

    return (
        <div
            onClick={() => onRemove(toast.id)}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: `1px solid ${color.border}`,
                backgroundColor: color.bg,
                color: color.text,
                minWidth: '280px',
                maxWidth: '400px',
                cursor: 'pointer',
                boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
                animation: 'slideInToast 0.3s ease',
                backdropFilter: 'blur(10px)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                lineHeight: '1.4',
            }}
        >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{ICONS[toast.type]}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <span style={{ opacity: 0.6, fontSize: '1rem', flexShrink: 0 }}>✕</span>
        </div>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
