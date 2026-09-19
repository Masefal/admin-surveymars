import React from 'react';

export default function ActivityItem({ Icon, iconBg, iconColor, title, time }) {
    return (
        <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-gray-900 font-semibold text-sm mb-0.5">{title}</p>
                <p className="text-gray-400 text-xs font-medium">{time}</p>
            </div>
        </div>
    );
}