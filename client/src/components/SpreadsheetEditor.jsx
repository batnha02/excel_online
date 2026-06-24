import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import { getFile, saveFile, downloadFile } from '../api';
import { Save, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SpreadsheetEditor({ fileId, fileName }) {
  const [sheets, setSheets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState('saved'); // 'saved' | 'unsaved' | 'saving' | 'error'
  const sheetsRef = useRef(null);
  const saveTimerRef = useRef(null);
  // FortuneSheet fires onChange immediately on mount before processing data.
  // Block auto-save until after initialization completes to prevent overwriting loaded data.
  const savingEnabledRef = useRef(false);

  useEffect(() => {
    savingEnabledRef.current = false;
    clearTimeout(saveTimerRef.current);
    setLoading(true);
    setSheets(null);
    getFile(fileId)
      .then(({ data }) => {
        setSheets(data.sheets);
        sheetsRef.current = data.sheets;
        setSaveState('saved');
      })
      .catch(() => setSaveState('error'))
      .finally(() => setLoading(false));
  }, [fileId]);

  // Enable saving after Workbook has mounted and FortuneSheet finishes its initial onChange calls
  useEffect(() => {
    if (!sheets) return;
    const timer = setTimeout(() => {
      savingEnabledRef.current = true;
    }, 1000);
    return () => clearTimeout(timer);
  }, [sheets]);

  const handleChange = useCallback((data) => {
    if (!savingEnabledRef.current) return;
    sheetsRef.current = data;
    setSaveState('unsaved');
    // Auto-save after 3 seconds of inactivity
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 3000);
  }, [fileId]);

  const handleSave = useCallback(async () => {
    if (!sheetsRef.current) return;
    clearTimeout(saveTimerRef.current);
    setSaveState('saving');
    try {
      await saveFile(fileId, sheetsRef.current);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [fileId]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearTimeout(saveTimerRef.current);
    };
  }, [handleSave]);

  const handleDownload = () => downloadFile(fileId, fileName);

  const StatusIcon = () => {
    if (saveState === 'saving') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (saveState === 'saved') return <CheckCircle size={14} className="text-green-500" />;
    if (saveState === 'error') return <AlertCircle size={14} className="text-red-500" />;
    return null;
  };

  const statusText = {
    saved: 'Đã lưu',
    unsaved: 'Chưa lưu',
    saving: 'Đang lưu...',
    error: 'Lỗi lưu file',
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-green-600 mx-auto mb-3" size={36} />
          <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-1">
          <StatusIcon />
          <span className={saveState === 'unsaved' ? 'text-amber-600' : saveState === 'error' ? 'text-red-500' : ''}>
            {statusText[saveState]}
          </span>
          {saveState === 'unsaved' && (
            <span className="text-gray-400 text-xs ml-1">(tự động lưu sau 3s)</span>
          )}
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Download size={14} />
          Tải xuống Excel
        </button>
        <button
          onClick={handleSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saveState === 'saving'
            ? <Loader2 size={14} className="animate-spin" />
            : <Save size={14} />
          }
          Lưu (Ctrl+S)
        </button>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-hidden">
        {sheets && (
          <Workbook
            data={sheets}
            onChange={handleChange}
            style={{ height: '100%', width: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
