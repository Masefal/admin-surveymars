import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Input password dengan tombol mata untuk menampilkan/menyembunyikan isi. */
export default function PasswordInput({ className = '', wrapperClassName = '', ...props }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className={`relative ${wrapperClassName}`}>
            <input {...props} type={visible ? 'text' : 'password'} className={`${className} pr-12`} />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={visible}
                className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 hover:text-gray-700"
            >
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    );
}
