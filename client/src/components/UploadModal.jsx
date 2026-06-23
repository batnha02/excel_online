import React, { useState, useRef } from 'react';
import { uploadFile, createBlank } from '../api';
import { X, FileSpreadsheet, Loader2, FilePlus } from 'lucide-react';

export default function UploadModal({ onClose, onSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Chỉ hỗ trợ file .xlsx, .xls, .csv');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await uploadFile(fd);
      onSuccess(data);
    } catch (e) {
      setError('Upload thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateBlank = async () => {
    const name = (newName.trim() || 'Untitled') + '.xlsx';
    setUploading(true);
    try {
      const { data } = await createBlank(name);
      onSuccess(data);
    } catch (e) {
      setError('Tạo file thất bại.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Thêm Spreadsheet</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Upload area */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${dragging ? 'border-green-500 bg-green-50 scale-[1.01]' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'}
            `}
          >
            {uploading ? (
              <Loader2 className="animate-spin text-green-600 mx-auto mb-3" size={36} />
            ) : (
              <FileSpreadsheet className="text-green-500 mx-auto mb-3" size={36} />
            )}
            <p className="text-gray-700 font-medium mb-1">
              {uploading ? 'Đang xử lý file...' : 'Kéo thả file vào đây'}
            </p>
            <p className="text-gray-400 text-sm">hoặc click để chọn file</p>
            <p className="text-gray-300 text-xs mt-2">Hỗ trợ .xlsx · .xls · .csv (tối đa 50MB)</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">hoặc</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Create blank */}
          {showNewForm ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tên spreadsheet..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBlank()}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateBlank}
                  disabled={uploading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Tạo mới
                </button>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FilePlus size={16} />
              Tạo spreadsheet trống
            </button>
          )}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}
