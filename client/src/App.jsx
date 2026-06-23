import React, { useState, useEffect } from 'react';
import { listFiles, deleteFile } from './api';
import FileList from './components/FileList';
import SpreadsheetEditor from './components/SpreadsheetEditor';
import UploadModal from './components/UploadModal';
import { FileSpreadsheet, Plus, PanelLeftClose, PanelLeft } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null); // { id, name }
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadFiles = async () => {
    try {
      const { data } = await listFiles();
      setFiles(data);
    } catch {
      console.error('Failed to load files');
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleSelect = (id) => {
    const file = files.find((f) => f.id === id);
    if (file) setActiveFile({ id: file.id, name: file.name });
  };

  const handleUploadSuccess = (file) => {
    loadFiles();
    setActiveFile({ id: file.id, name: file.name });
    setShowUpload(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa file này? Hành động không thể hoàn tác.')) return;
    await deleteFile(id);
    if (activeFile?.id === id) setActiveFile(null);
    loadFiles();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-0'}
          flex-shrink-0 transition-all duration-200 overflow-hidden
          bg-white border-r border-gray-200 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Excel Portal</h1>
              <p className="text-xs text-gray-400">Spreadsheet trên web</p>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="w-full flex items-center gap-2 justify-center bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={16} />
            Thêm Spreadsheet
          </button>
        </div>

        {/* File list */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Files ({files.length})
          </p>
          <FileList
            files={files}
            activeId={activeFile?.id}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title={sidebarOpen ? 'Đóng sidebar' : 'Mở sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {activeFile?.name || 'Excel Portal'}
          </span>
        </header>

        {/* Spreadsheet area */}
        <main className="flex-1 overflow-hidden">
          {activeFile ? (
            <SpreadsheetEditor
              key={activeFile.id}
              fileId={activeFile.id}
              fileName={activeFile.name}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FileSpreadsheet size={40} className="text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Bắt đầu với Excel Portal
                </h2>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  Upload file Excel (.xlsx, .xls, .csv) hoặc tạo spreadsheet trống để bắt đầu chỉnh sửa trực tiếp trên web.
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  <Plus size={18} />
                  Thêm Spreadsheet
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onSuccess={handleUploadSuccess} />
      )}
    </div>
  );
}
