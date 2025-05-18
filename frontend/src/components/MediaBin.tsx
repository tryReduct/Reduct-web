// 1) a drop-to-upload zone (react-drag-drop-files)
import { useRef, useState, useEffect } from "react";
import { useDrag } from 'react-dnd';

// Supported formats dictionary
const SUPPORTED_FORMATS = {
    "Video": [
        "mp4", "mov", "mxf", "avi", "mkv", "flv", "mpeg", "mpg", "m4v",
        "wmv", "3gp", "vob", "mts", "m2ts", "webm", "r3d", "xavc"
    ],
    "Audio": [
        "mp3", "wav", "aac", "aiff", "ogg", "m4a", "wma"
    ],
    "Image": [
        "jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "psd", "heic"
    ],
    "Sequence & Project Files": [
        "prproj", "xml", "aaf", "edl", "omf"
    ],
    "Camera Raw Formats": [
        "cr2", "nef", "dng", "arw", "orf", "rw2"
    ]
};

// Flatten the supported formats into a single set
const ALLOWED_EXTENSIONS = new Set<string>();
Object.values(SUPPORTED_FORMATS).forEach(formats => {
    formats.forEach(format => ALLOWED_EXTENSIONS.add(format));
});

// Create MIME type mapping for common formats
const MIME_TYPES = {
    // Video
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'webm': 'video/webm',
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg',
    'm4v': 'video/x-m4v',
    'wmv': 'video/x-ms-wmv',
    '3gp': 'video/3gpp',
    'flv': 'video/x-flv',
    'mkv': 'video/x-matroska',
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    'wma': 'audio/x-ms-wma',
    // Image
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    'psd': 'image/vnd.adobe.photoshop',
    'heic': 'image/heic'
};

interface UploadedFile {
  file: File;
  preview: string;
}

interface DraggableMediaItemProps {
  uploadedFile: UploadedFile;
  index: number;
}

const DraggableMediaItem = ({ uploadedFile, index }: DraggableMediaItemProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'media',
    item: { media: uploadedFile },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag as any}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      {uploadedFile.file.type.startsWith('image/') ? (
        <img
          src={uploadedFile.preview}
          alt={uploadedFile.file.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : uploadedFile.file.type.startsWith('video/') ? (
        <video
          src={uploadedFile.preview}
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px'
        }}>
          📄
        </div>
      )}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {uploadedFile.file.name}
      </div>
    </div>
  );
};

export default function MediaBin({ onImport }: { onImport: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

// Cleanup preview URLs **once** when the component unmounts
useEffect(() => {
  return () => {
    uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
  };
  // no deps ⇢ run only on unmount
}, []);

  // Reset isDragging on window resize to prevent stuck highlight
  useEffect(() => {
    const handleResize = () => {
      setIsDragging(false);
      dragCounterRef.current = 0;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const isValidFile = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension !== undefined && ALLOWED_EXTENSIONS.has(extension);
  };

  const createPreview = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      return URL.createObjectURL(file);
    }
    // Return a default icon for other file types
    return '/file-icon.png'; // You'll need to add this icon to your public folder
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus(`Successfully uploaded ${file.name}`);
        const preview = createPreview(file);
        setUploadedFiles(prev => [...prev, { file, preview }]);
        onImport([file]); // Notify parent component about the new file
      } else {
        setUploadStatus(`Error uploading ${file.name}: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus(`Error uploading ${file.name}: ${error}`);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    
    const files = Array.from(e.dataTransfer.files).filter(isValidFile);
    
    if (files.length > 0) {
      setUploadStatus('Uploading files...');
      await Promise.all(files.map(uploadFile));
    } else {
      const formatList = Object.entries(SUPPORTED_FORMATS)
        .map(([category, formats]) => `${category}: ${formats.join(', ')}`)
        .join('\n');
      setUploadStatus(`No valid files dropped. Supported formats:\n${formatList}`);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).filter(isValidFile) : [];
    if (files.length > 0) {
      setUploadStatus('Uploading files...');
      for (const file of files) {
        await uploadFile(file);
      }
    }
    if (inputRef.current) inputRef.current.value = ""; // reset for next upload
  };

  // Create accept string for input element
const acceptString = [
  ...Object.values(MIME_TYPES),            // mapped MIME types
  ...Array.from(ALLOWED_EXTENSIONS).map(e => `.${e}`) // explicit extensions
].join(',');

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          width: '100%',
          height: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: isDragging ? '3px dashed #007bff' : '2px dashed #ccc',
          backgroundColor: isDragging ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
          transition: 'all 0.2s ease-in-out',
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
          accept={acceptString}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div style={{width: '100%'}} >
          {isDragging ? "Drop files to upload" : uploadedFiles.length === 0 ? "Click or drag & drop media files here" : ""}
        </div>
        {uploadStatus && (
          <div style={{ 
            marginTop: '10px', 
            fontSize: '14px',
            color: uploadStatus.includes('Error') ? '#ff4444' : '#44ff44',
            whiteSpace: 'pre-line'
          }}>
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {uploadedFiles.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '16px',
          padding: '16px',
          overflowY: 'auto',
          maxHeight: 'calc(100% - 200px)'
        }}>
          {uploadedFiles.map((uploadedFile, index) => (
            <DraggableMediaItem
              key={index}
              uploadedFile={uploadedFile}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
