"use client";

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Loader2, 
  Download, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Set up the PDF.js worker from unpkg CDN for lightweight, zero-config integration
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReactPDFViewerProps {
  url: string;
  title: string;
  onPageCountChange?: (count: number) => void;
}

export default function ReactPDFViewer({ url, title, onPageCountChange }: ReactPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Reset page when URL changes
  useEffect(() => {
    setPageNumber(1);
    setLoading(true);
  }, [url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    if (onPageCountChange) {
      onPageCountChange(numPages);
    }
  }

  function onDocumentLoadError(error: Error) {
    console.error("Failed to load PDF document:", error);
    setLoading(false);
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const next = prevPageNumber + offset;
      if (numPages) {
        return Math.min(Math.max(1, next), numPages);
      }
      return 1;
    });
  };

  const handleZoom = (amount: number) => {
    setScale((prevScale) => Math.min(Math.max(0.5, prevScale + amount), 2.5));
  };

  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950/40 text-foreground">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/35 backdrop-blur-md select-none">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg hover:bg-white/5"
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-semibold text-muted-foreground min-w-[70px] text-center">
            Page {pageNumber} of {numPages || "…"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg hover:bg-white/5"
            disabled={numPages ? pageNumber >= numPages : true}
            onClick={() => changePage(1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg hover:bg-white/5"
            disabled={scale <= 0.5}
            onClick={() => handleZoom(-0.15)}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-[10px] font-bold text-muted-foreground min-w-[36px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg hover:bg-white/5"
            disabled={scale >= 2.5}
            onClick={() => handleZoom(0.15)}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg hover:bg-white/5"
            onClick={handleRotate}
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg hover:bg-white/5"
            onClick={() => window.open(url, "_blank")}
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </div>

      {/* PDF Viewport Area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-neutral-900/60 custom-scrollbar select-text relative">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950/20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              <p className="text-xs text-muted-foreground animate-pulse">Initializing PDF document engine...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center gap-2 max-w-xs text-center p-6 my-auto">
              <p className="text-sm font-bold text-red-400">Unable to render PDF</p>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Please make sure the server is online and you have sufficient permissions to view this asset.
              </p>
            </div>
          }
          className="shadow-2xl border border-white/5 rounded-lg overflow-hidden my-auto"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            loading={
              <div className="flex items-center justify-center w-[300px] h-[400px]">
                <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
              </div>
            }
            className="bg-white"
          />
        </Document>
      </div>
    </div>
  );
}
