import React from 'react';

export default function StatCard({ title, value, subtitle, subtitleColor }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 font-medium text-sm mb-4">{title}</h3>
            <div className="text-4xl font-black text-gray-900 mb-2">{value}</div>
            <p className={`text-sm font-semibold ${subtitleColor}`}>{subtitle}</p>
        </div>
    );
}