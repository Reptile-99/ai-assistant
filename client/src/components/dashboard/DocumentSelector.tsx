'use client';

import { motion } from 'framer-motion';
import { FileText, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Document } from '@/services/ai.service';

interface DocumentSelectorProps {
  documents: Document[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function DocumentSelector({
  documents,
  selectedId,
  onChange,
  disabled,
}: DocumentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = documents.find((d) => d._id === selectedId);
  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <motion.button
        whileTap={{ scale: 0.99 }}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 text-left',
          'bg-secondary/50 border-border hover:border-violet-500/40 hover:bg-secondary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'border-violet-500/60 bg-secondary ring-1 ring-violet-500/20'
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <p className="text-sm font-semibold truncate">{selected.title}</p>
              <p className="text-xs text-muted-foreground">
                {selected.pageCount} pages · {formatBytes(selected.fileSize)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {documents.length === 0 ? 'No documents uploaded yet' : 'Select a document…'}
            </p>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="absolute top-full left-0 right-0 mt-2 z-50 glass rounded-2xl border border-border shadow-2xl overflow-hidden"
        >
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50">
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                placeholder="Search documents…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No results</p>
            ) : (
              filtered.map((doc) => (
                <motion.button
                  key={doc._id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onChange(doc._id);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                    doc._id === selectedId
                      ? 'bg-violet-500/15 border border-violet-500/25 text-violet-300'
                      : 'hover:bg-secondary text-foreground/80 hover:text-foreground'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.pageCount} pages · {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {doc._id === selectedId && (
                    <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                  )}
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpen(false);
            setSearch('');
          }}
        />
      )}
    </div>
  );
}
