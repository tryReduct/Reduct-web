// 1) a drop-to-upload zone (react-drag-drop-files)
import { useRef, useState, useEffect } from "react";

const fileTypes = ["video/mp4","video/quicktime","video/x-msvideo","image/png","image/jpeg"]; // MIME types for MP4, MOV, AVI, PNG, JPG

export default function MediaBin({ onImport }: { onImport: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  let dragCounter = 0;

  // Reset isDragging on window resize to prevent stuck highlight
  useEffect(() => {
    const handleResize = () => setIsDragging(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter = 0;
    const files = Array.from(e.dataTransfer.files).filter(file => fileTypes.includes(file.type));
    if (files.length > 0) {
      onImport(files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).filter(file => fileTypes.includes(file.type)) : [];
    if (files.length > 0) {
      onImport(files);
    }
    if (inputRef.current) inputRef.current.value = ""; // reset for next upload
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isDragging ? '3px dashed #007bff' : '2px dashed #ccc',
        backgroundColor: isDragging ? '#f0f8ff' : 'transparent',
        transition: 'border-color 0.2s, background-color 0.2s',
        cursor: 'pointer',
        position: 'relative',
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
      }}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={fileTypes.join(",")}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div style={{width: '100%'}} >
        {isDragging ? "Drop files to upload" : "Click or drag & drop media files here"}
      </div>
    </div>
  );
}
