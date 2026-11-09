import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, X } from 'lucide-react';

/** QR berisi tautan kuis; bisa dipindai dari HP atau diunduh sebagai PNG untuk dicetak/dikirim. */
export default function QrShareModal({ url, title, code, onClose }) {
    const wrapRef = useRef(null);

    const handleDownload = () => {
        const canvas = wrapRef.current?.querySelector('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `QR-Kuis-${code || 'kuis'}.png`;
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div role="dialog" aria-modal="true" aria-label="QR Code kuis" className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">QR Code Kuis</h3>
                    <button onClick={onClose} aria-label="Tutup" className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="p-5 flex flex-col items-center text-center gap-3">
                    <div ref={wrapRef} className="p-3 bg-white rounded-xl border border-gray-100">
                        {/* Resolusi tinggi supaya tetap tajam saat dicetak; ditampilkan mengecil di layar */}
                        <QRCodeCanvas value={url} size={512} marginSize={2} level="M" style={{ width: 240, height: 240 }} />
                    </div>
                    <div className="font-bold text-gray-900 text-sm break-words">{title}</div>
                    {code && <div className="text-xs text-gray-500">Kode kuis: <span className="font-mono font-bold text-gray-800 tracking-widest">{code}</span></div>}
                    <div className="text-[11px] text-gray-400 break-all">{url}</div>
                    <p className="text-xs text-gray-500">Pindai dengan kamera HP untuk membuka kuis. Siswa tetap memverifikasi nama dan NISN.</p>
                    <button onClick={handleDownload} className="w-full bg-[#1b6d39] hover:bg-[#14532b] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                        <Download size={18} /> Unduh QR (PNG)
                    </button>
                </div>
            </div>
        </div>
    );
}
