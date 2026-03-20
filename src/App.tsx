import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, HardDrive, CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FileMetadata {
  _id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  uploadDate: string;
}

export default function App() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccess("File uploaded successfully!");
        fetchFiles();
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const data = await response.json();
        setError(data.error || "Upload failed.");
      }
    } catch (err) {
      setError("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500 rounded-lg text-white">
              <HardDrive size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">MongoFile Hub</h1>
          </div>
          <p className="text-zinc-500">Secure file upload service with MongoDB metadata storage.</p>
        </header>

        <section className="grid md:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm sticky top-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload size={18} className="text-emerald-500" />
                Upload File
              </h2>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="relative group">
                  <input
                    type="file"
                    name="file"
                    ref={fileInputRef}
                    className="hidden"
                    id="file-upload"
                    onChange={() => setError(null)}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                      <p className="text-xs text-zinc-500">Click to select file</p>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-zinc-900 text-white py-2.5 rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload to Server"
                  )}
                </button>
              </form>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm flex items-start gap-2 border border-emerald-100"
                  >
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Files List Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 border-bottom border-zinc-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText size={18} className="text-emerald-500" />
                  Stored Metadata
                </h2>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-500 rounded-full">
                  {files.length} Files
                </span>
              </div>

              <div className="divide-y divide-zinc-100">
                {files.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText size={20} className="text-zinc-300" />
                    </div>
                    <p className="text-zinc-400 text-sm">No files uploaded yet.</p>
                  </div>
                ) : (
                  files.map((file) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={file._id}
                      className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-zinc-900 truncate max-w-[200px] md:max-w-[300px]">
                            {file.originalname}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                              {file.mimetype.split("/")[1] || "file"}
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-[10px] text-zinc-500">{formatSize(file.size)}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(file.uploadDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* MongoDB Status Warning */}
            {!process.env.MONGODB_URI || process.env.MONGODB_URI === "YOUR_MONGODB_URI" ? (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">MongoDB Not Connected</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Metadata is currently not being persisted. Please add your <code>MONGODB_URI</code> in the app settings to enable database storage.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
