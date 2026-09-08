import { X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaPreviewProps {
  url: string;
  type: "image" | "video";
  onRemove?: () => void;
  className?: string;
  showControls?: boolean;
}

const MediaPreview = ({
  url,
  type,
  onRemove,
  className,
  showControls = true,
}: MediaPreviewProps) => {
  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-muted", className)}>
      {type === "image" ? (
        <img src={url} alt="Media" className="w-full h-full object-cover" />
      ) : (
        <video src={url} controls={showControls} className="w-full h-full object-cover" />
      )}

      {onRemove && (
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 w-6 h-6"
          onClick={onRemove}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default MediaPreview;
