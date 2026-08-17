import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image, Video, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploadProps {
  bucket: string;
  onUpload: (url: string, type: "image" | "video" | "file") => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  preview?: boolean;
}

const FileUpload = ({
  bucket,
  onUpload,
  accept = "image/*,video/*",
  maxSize = 10,
  className,
  preview = true,
}: FileUploadProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | "file" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileType = (mimeType: string): "image" | "video" | "file" => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "file";
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer upload");
      return;
    }

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const fileType = getFileType(file.type);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      // Set preview
      if (preview) {
        setPreviewUrl(publicUrl);
        setPreviewType(fileType);
      }

      onUpload(publicUrl, fileType);
      toast.success("Upload concluído!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erro no upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  }, [user, bucket, maxSize, preview, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview */}
      {preview && previewUrl && (
        <div className="relative rounded-lg overflow-hidden bg-muted">
          {previewType === "image" && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-64 object-contain"
            />
          )}
          {previewType === "video" && (
            <video
              src={previewUrl}
              controls
              className="w-full max-h-64"
            />
          )}
          {previewType === "file" && (
            <div className="p-4 flex items-center gap-3">
              <File className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm truncate">{previewUrl.split("/").pop()}</span>
            </div>
          )}
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 w-8 h-8"
            onClick={clearPreview}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      {(!preview || !previewUrl) && (
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer",
            "hover:border-primary/50 transition-colors",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2 text-muted-foreground">
                <Image className="w-6 h-6" />
                <Video className="w-6 h-6" />
                <File className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Clique ou arraste um arquivo
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
