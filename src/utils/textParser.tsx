import React from "react";

export const renderMessageContent = (content: string) => {
  const gifRegex = /\[GIF:(.*?)\]/g;
  const parts = content.split(gifRegex);

  if (parts.length === 1) return <span className="whitespace-pre-wrap">{content}</span>;

  return (
    <div className="flex flex-col gap-2">
      {parts.map((part, index) => {
        if (part.startsWith("http")) {
          return (
            <img
              key={index}
              src={part}
              alt="GIF Animado"
              className="rounded-lg max-w-[200px] shadow-sm border border-gray-100 dark:border-gray-700"
              loading="lazy"
            />
          );
        }
        if (part.trim() !== "") {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {part}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
};
