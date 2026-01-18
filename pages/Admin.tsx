import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Activity, DollarSign, Search, Shield, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import CaseList from '../components/admin/CaseList';
import CaseEditor from '../components/admin/CaseEditor';
import { Case } from '../types';

// Mock data until backend is ready
const MOCK_USERS = [
    { id: '1', email: 'doctor@example.com', role: 'doctor', status: 'active', joined: '2024-01-15' },
    { id: '2', email: 'student@example.com', role: 'student', status: 'active', joined: '2024-02-01' },
    { id: '3', email: 'inactive@example.com', role: 'student', status: 'suspended', joined: '2023-12-10' },
];

export default function Admin() {
    const { user, isAdmin, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'cases'>('users');

    // Case Editor State
    const [isEditingCase, setIsEditingCase] = useState(false);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);

    // User State
    const [users, setUsers] = useState(MOCK_USERS);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Protect Route
    if (!loading && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.includes(searchTerm.toLowerCase())
    );

    // Render Case Editor Mode
    if (isEditingCase) {
        return (
            <CaseEditor
                initialData={selectedCase}
                onSave={() => setIsEditingCase(false)}
                onCancel={() => setIsEditingCase(false)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500">Platform overview and management</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                        <Shield size={12} /> Admin Mode
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'users' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Users size={18} /> Users
                </button>
                <button
                    onClick={() => setActiveTab('cases')}
                    className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'cases' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FileText size={18} /> Case Library
                </button>
            </div>

            {activeTab === 'users' && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Total Users</p>
                                <h3 className="text-2xl font-bold text-slate-800">{users.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Active Sessions</p>
                                <h3 className="text-2xl font-bold text-slate-800">12</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Revenue (MTD)</p>
                                <h3 className="text-2xl font-bold text-slate-800">$1,250</h3>
                            </div>
                        </div>
                    </div>

                    {/* User Management */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-slate-800 text-lg">User Management</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">User</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Joined</th>
                                        <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className="capitalize bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500">{u.role}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {u.status === 'active' ? (
                                                        <>
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                            <span className="text-emerald-600 font-bold text-xs uppercase">Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                                            <span className="text-red-600 font-bold text-xs uppercase">Suspended</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">{u.joined}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="text-slate-400 hover:text-red-500 font-medium text-xs">Manage</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'cases' && (
                <CaseList
                    onEdit={(c) => { setSelectedCase(c); setIsEditingCase(true); }}
                    onCreate={() => { setSelectedCase(null); setIsEditingCase(true); }}
                />
            )}
        </div>
    );
}
