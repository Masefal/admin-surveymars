import React from 'react';

export default function ActivityItem({ Icon, iconBg, iconColor, title, time }) {
    return (
        <div className="flex gap-4">
            <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}>
                <Icon size={20} />
            </div>
            <div>
                <div className="font-bold text-gray-900 text-sm mb-0.5">{title}</div>
                <div className="text-xs text-gray-500">{time}</div>
            </div>
        </div>
    );
}