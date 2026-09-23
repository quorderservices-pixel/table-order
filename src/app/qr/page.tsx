'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function TableQRGenerator() {
  const [tableCount, setTableCount] = useState(10);
  const baseUrl = 'https://table-order-eight-sandy.vercel.app';

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-neutral-100 p-8 text-neutral-900 font-sans print:p-0 print:bg-white">
      {/* Controls - Hidden when printing */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 print:hidden">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Table QR Generator</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Generate and print scan-to-order table stickers.
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <label className="text-sm font-semibold flex items-center gap-2">
            Tables:
            <input
              type="number"
              min="1"
              max="50"
              value={tableCount}
              onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2.5 py-1.5 border border-neutral-300 rounded-lg text-center font-bold"
            />
          </label>

          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
          >
            Print Stickers
          </button>
        </div>
      </div>

      {/* Printable Cards Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {tables.map((tableNum) => {
          const tableUrl = `${baseUrl}/?table=${tableNum}`;

          return (
            <div
              key={tableNum}
              className="bg-white border-2 border-dashed border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-between text-center shadow-sm break-inside-avoid print:border-neutral-400 print:shadow-none"
            >
              <div className="mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  Scan to Order
                </span>
                <h2 className="text-3xl font-black text-neutral-950 mt-1">
                  Table {tableNum}
                </h2>
              </div>

              <div className="p-3 bg-white border border-neutral-100 rounded-xl shadow-inner mb-4">
                <QRCodeSVG
                  value={tableUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-neutral-500 text-xs font-medium">
                <p>Point phone camera to view menu</p>
                <p className="font-mono text-[10px] text-neutral-400 mt-1 truncate max-w-[200px]">
                  {tableUrl}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}