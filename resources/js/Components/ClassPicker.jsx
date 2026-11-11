import React, { useEffect, useState } from 'react';
import { LEVELS, classLevel } from '../format';

const selectClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1b6d39] focus:outline-none focus:ring-1 focus:ring-[#1b6d39] text-sm font-medium disabled:opacity-60';

// Pilih Level dulu (1-6), lalu kelasnya (4A ... 4I). `value` = id kelas.
export default function ClassPicker({ classes = [], value, onChange, required = false, disabled = false }) {
    const selected = classes.find(c => String(c.id) === String(value));
    const [level, setLevel] = useState(selected ? classLevel(selected) : '');

    useEffect(() => {
        if (selected) setLevel(classLevel(selected));
    }, [selected?.id]);

    const options = classes.filter(c => classLevel(c) === level);

    return (
        <div className="grid grid-cols-2 gap-2">
            <select
                aria-label="Level"
                value={level}
                disabled={disabled}
                required={required}
                onChange={(e) => { setLevel(e.target.value); onChange(''); }}
                className={selectClass}
            >
                <option value="">-- Level --</option>
                {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
            </select>
            <select
                aria-label="Kelas"
                value={value || ''}
                disabled={disabled || !level}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                className={selectClass}
            >
                <option value="">{level ? '-- Kelas --' : 'Pilih level dulu'}</option>
                {options.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
    );
}
