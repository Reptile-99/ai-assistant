"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function DocumentPreview({ isOpen, onClose, title, url }: DocumentPreviewProps) {
  // Ensure url is absolute for the iframe
  const previewUrl = url.startsWith('http') ? url : `http://localhost:5000/${url.replace(/\\/g, '/')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-card border border-white/10 rounded-[2rem] shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 md:px-8 md:py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate pr-4">{title}</h3>
                  <p className="text-xs text-muted-foreground">Document Preview</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild title="Open in new tab">
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-secondary/30 relative">
              <iframe
                src={previewUrl}
                className="w-full h-full border-none"
                title={title}
              />
              
              {/* Fallback/Loading message hidden by iframe if successful */}
              <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-8 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground max-w-xs">
                  If the PDF doesn&apos;t load, your browser might not support inline viewing.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href={previewUrl} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
