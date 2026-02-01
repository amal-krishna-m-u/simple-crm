'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
    onOpenReminders: () => void;
    onOpenCustomers: () => void;
}

export default function Header({ onOpenReminders, onOpenCustomers }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();

    const today = new Date().toLocaleDateString();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    return (
        <header>
            <div>
                <h1 className="app-title">Simple CRM Board</h1>
                <div className="app-subtitle">Leads, follow-ups, payments, reminders.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user && (
                    <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                        Welcome, {user.name || user.email}
                    </span>
                )}
                <div className="today-label">Today: {today}</div>
                <div className="menu-wrap" ref={menuRef}>
                    <button
                        className="btn btn-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        aria-label="Menu"
                        style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                    >
                        <span className="btn-icon">☰</span>
                    </button>
                    {menuOpen && (
                        <div className="menu-panel">
                            <button className="menu-item" onClick={() => { onOpenReminders(); setMenuOpen(false); }}>
                                Reminders
                            </button>
                            <button className="menu-item" onClick={() => { onOpenCustomers(); setMenuOpen(false); }}>
                                Customers List
                            </button>
                            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                            <button className="menu-item" onClick={handleLogout} style={{ color: '#dc2626' }}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
