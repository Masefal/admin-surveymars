import React from 'react';

export default function StatCard({ title, value, subtitle, subtitleColor }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
            <div className={`text-sm font-medium ${subtitleColor}`}>{subtitle}</div>
        </div>
    );
}