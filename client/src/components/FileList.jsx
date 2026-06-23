import React from 'react';
import { FileSpreadsheet, Trash2 } from 'lucide-react';

export default function FileList({ files, activeId, onSelect, onDelete }) {
  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm mt-4">
        <FileSpreadsheet size={32} className="mx-auto mb-2 opacity-40" />
        <p>Chưa có file nào</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onSelect(file.id)}
          className={`
            flex items-center gap-2 p-2 rounded-lg cursor-pointer group mb-1 transition-colors
            ${activeId === file.id
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'hover:bg-gray-50 text-gray-700 border border-transparent'
            }
          `}
        >
          <FileSpreadsheet
            size={16}
            className={`flex-shrink-0 ${activeId === file.id ? 'text-green-600' : 'text-gray-400'}`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate font-medium" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {new Date(file.updated_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
