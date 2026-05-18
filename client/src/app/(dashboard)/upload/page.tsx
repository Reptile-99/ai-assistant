"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  File,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  CloudUpload,
  Sparkles,
  Eye,
  Trash2,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/services/api.client";
import { useToast } from "@/hooks/use-toast";
import { DocumentPreview } from "@/components/dashboard/DocumentPreview";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
}

interface Document {
  _id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  pageCount: number;
  createdAt: string;
}

const FileIcon = ({ name }: { name: string }) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="w-6 h-6 text-red-400" />;
  if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) return <Image className="w-6 h-6 text-blue-400" />;
  return <File className="w-6 h-6 text-muted-foreground" />;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      const response = await api.get("/documents");
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile.file);
    formData.append("title", uploadFile.file.name);

    try {
      const response = await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
          );
        },
      });

      if (response.data.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "done", progress: 100 } : f
          )
        );
        fetchDocuments();
        toast({ title: "Success", description: `${uploadFile.file.name} uploaded successfully` });
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "error",
                error: error.response?.data?.error || "Upload failed",
              }
            : f
        )
      );
      toast({ title: "Upload failed", description: `Failed to upload ${uploadFile.file.name}`, variant: "destructive" });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      progress: 0,
      status: "uploading",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach(uploadFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      toast({ title: "Document deleted", description: "The file has been removed from your library." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black mb-2"
        >
          Study Library
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Upload and manage your study materials. AI will automatically index them for search and chat.
        </motion.p>
      </div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative group border-2 border-dashed rounded-[2.5rem] p-16 text-center cursor-pointer transition-all duration-500 overflow-hidden",
            isDragActive
              ? "border-violet-500 bg-violet-500/10 scale-[1.02] shadow-2xl shadow-violet-500/20"
              : "border-white/10 hover:border-violet-500/50 hover:bg-white/5 shadow-xl"
          )}
        >
          <input {...getInputProps()} />
          
          {/* Animated background particles for dropzone */}
          <AnimatePresence>
            {isDragActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-20, 20],
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    className="absolute bg-violet-500/20 w-32 h-32 rounded-full blur-3xl"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ 
              scale: isDragActive ? 1.15 : 1,
              rotate: isDragActive ? 5 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-500",
              isDragActive ? "gradient-primary shadow-2xl shadow-violet-500/50 text-white" : "bg-secondary text-muted-foreground group-hover:text-violet-400 group-hover:scale-110"
            )}
          >
            <CloudUpload className="w-12 h-12" />
          </motion.div>

          <div className="relative z-10">
            {isDragActive ? (
              <motion.p 
                initial={{ scale: 0.9 }} 
                animate={{ scale: 1 }} 
                className="text-2xl font-black text-violet-400"
              >
                Release to Upload
              </motion.p>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-3">Drop your PDFs here</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Upload research papers, textbooks, or notes. We&apos;ll handle the analysis.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" className="rounded-2xl px-8 h-12 border-white/10 hover:bg-white/5 transition-all">
                    Browse Files
                  </Button>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center">
                        <FileText className="w-4 h-4 text-violet-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Uploading Progress List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold flex items-center gap-2">
                Active Uploads
                <Badge variant="secondary" className="rounded-full px-2 py-0 h-5">
                  {files.length}
                </Badge>
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiles([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
            
            <div className="grid gap-3">
              {files.map((uf) => (
                <motion.div
                  key={uf.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-4 flex items-center gap-4 group border border-white/5 hover:border-violet-500/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-violet-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold truncate">{uf.file.name}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(uf.progress)}%</span>
                    </div>
                    <Progress value={uf.progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center gap-2">
                    {uf.status === "done" ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </motion.div>
                    ) : uf.status === "error" ? (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(uf.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Library List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black flex items-center gap-2">
            My Documents
            <Badge variant="outline" className="rounded-full border-white/10">
              {documents.length}
            </Badge>
          </h3>
          <div className="flex items-center gap-2">
             {/* Filter/Search could go here */}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-[2rem] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 glass rounded-[3rem] border-dashed border-white/10"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No documents found in your library.</p>
            <Button variant="link" className="text-violet-400 mt-2">Learn more about AI Analysis</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, i) => (
              <motion.div
                key={doc._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="group relative glass rounded-[2rem] p-6 border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <FileText className="w-7 h-7 text-red-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-10">
                    <h4 className="font-bold text-lg truncate mb-1">{doc.title}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {formatBytes(doc.fileSize)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {doc.pageCount} pages
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-xl border border-white/10 hover:bg-violet-500 hover:text-white transition-all shadow-lg"
                    title="Summarize with AI"
                    onClick={() => router.push(`/summarize?doc=${doc._id}`)}
                  >
                    <BrainCircuit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-xl border border-white/10 hover:bg-violet-500 hover:text-white transition-all shadow-lg"
                    onClick={() => setPreviewDoc({ title: doc.title, url: doc.fileUrl })}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-xl border border-white/10 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    onClick={() => handleDeleteDocument(doc._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <DocumentPreview
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || ""}
        url={previewDoc?.url || ""}
      />

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Card className="rounded-[2.5rem] border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-32 h-32 text-violet-400 blur-sm" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex gap-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/30 shadow-inner">
                <Sparkles className="w-7 h-7 text-violet-300" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-violet-200">AI Intelligence Active</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Every PDF you upload is processed through our RAG engine. 
                  We extract text, identify key concepts, and prepare your materials for 
                  instant querying and flashcard generation.
                </p>
                <div className="flex gap-4 mt-6">
                  <Badge variant="secondary" className="bg-white/5 border-white/10 px-3 py-1">OCR Supported</Badge>
                  <Badge variant="secondary" className="bg-white/5 border-white/10 px-3 py-1">Multi-Document Search</Badge>
                  <Badge variant="secondary" className="bg-white/5 border-white/10 px-3 py-1">Instant Citations</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
