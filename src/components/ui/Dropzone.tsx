import React, { useRef, useState } from 'react';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import { UploadedFile } from '../../types/document';

interface DropzoneProps {
  id: string;
  label: string;
  hint: string;
  files: UploadedFile[];
  onFiles: (files: UploadedFile[]) => void;
  onRemove?: (name: string) => void;
  multiple?: boolean;
  accept?: string;
}

export function Dropzone({ id, label, hint, files, onFiles, onRemove, multiple = false, accept = '.pdf,.doc,.docx' }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const picked = Array.from(list).map((f) => ({ name: f.name, size: f.size, rawFile: f }));
    onFiles(multiple ? picked : picked.slice(0, 1));
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span id={`${id}-label`} className="text-[13px] font-medium text-ink">
          {label}
        </span>
        <span className="text-[12px] text-ink-3">{hint}</span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files);
        }}
        className={`mt-2 flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-8 text-center transition-colors duration-150 ${dragging ? 'border-accent bg-accent-soft' : 'border-line-strong bg-white'}`}>
        
        <UploadIcon className={`h-5 w-5 ${dragging ? 'text-accent' : 'text-ink-3'}`} strokeWidth={1.5} aria-hidden />
        <p className="text-[14px] text-ink-2">
          Drag a file here, or{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-describedby={`${id}-label`}>
            
            browse
          </button>
        </p>
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="sr-only"
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
            handle(e.target.files);
            e.target.value = '';
          }}
          tabIndex={-1} />
        
      </div>
      {files.length > 0 &&
      <ul className="mt-3 divide-y divide-line rounded border border-line bg-white">
          {files.map((f) =>
        <li key={f.name} className="flex items-center gap-3 px-3 py-2.5">
              <FileIcon className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{f.name}</span>
              <span className="font-mono text-[12px] text-ink-3">{Math.max(1, Math.round(f.size / 1024))} KB</span>
              {onRemove &&
          <button
            type="button"
            onClick={() => onRemove(f.name)}
            className="rounded-sm p-1 text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label={`Remove ${f.name}`}>
            
                  <XIcon className="h-3.5 w-3.5" />
                </button>
          }
            </li>
        )}
        </ul>
      }
    </div>);

}