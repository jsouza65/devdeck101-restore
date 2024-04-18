'use client';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface FilePreview {
  file: Blob;
  preview: string;
}

export default function ImageUploadPlaceholder() {
  const [isMounted, setIsMounted] = useState(false);
  const [file, setFile] = useState<FilePreview | null>(null);
  const [fileToProcess, setFileToProcess] = useState<{
    path: string;
  } | null>(null);
  const [restoredFile, setRestoredFile] = useState<FilePreview | null>(null);

  const onDrop = useCallback(async (acceptFiles: File[]) => {
    try {
      const file = acceptFiles[0];
      setFile({
        file, preview: URL.createObjectURL(file)
      });

      const image = process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER;
      const processing = process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_PROCESSING;

      const supabase = createClientComponentClient();
      const { data, error } = await supabase.storage.from(image)
        .upload(`${processing}/${acceptFiles[0].name}`,
          acceptFiles[0]
        );
      if (!error) {
        setFileToProcess(data);
      };
    } catch (error) {
      console.log('ImageUploadPlaceholder.onDrop', error);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (file) URL.revokeObjectURL(file.preview);
      if (restoredFile) URL.revokeObjectURL(restoredFile.preview);
    }
  }, [file, restoredFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'] }
  });

  const handleDialogOpenChange = async (isOpen: boolean) => {
    console.log('isOpen', isOpen);
  }

  const handleEnhance = async () => {
    try {
      if (!fileToProcess) return;
      const supabase = createClientComponentClient();
      const { data: { publicUrl } } = await supabase.storage.from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER)
        .getPublicUrl(fileToProcess?.path);
      console.log('publicUrl', publicUrl);

      const res = await fetch('/api/ai/replicate', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: publicUrl }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      console.log('ImageUploadPlaceholder.handleEnhance', error);
    }
  }

  if (!isMounted) return null;

  return (
    <div className="flex h-[150px] w-full shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-10 w-10 text-muted-foreground"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="11" r="1" />
          <path d="M11 17a1 1 0 0 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5ZM8 14a5 5 0 1 1 8 0" />
          <path d="M17 18.5a9 9 0 1 0-10 0" />
        </svg>

        <h3 className="mt-4 text-lg font-semibold">Adicione uma foto</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          A foto que será melhorada pela IA
        </p>
        <Dialog onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="relative">
              Traga seu passado a vida
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicione a foto</DialogTitle>
              <DialogDescription>
                Copie e cole sua foto para melhorar
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                {!file && (
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {
                      isDragActive ? (
                        <p className='flex items-center justify-center bg-blue-100 opacity-70 border border-dashed border-blue-300 p-6 h-36 rounded-md'>Coloque sua foto aqui...</p>
                      ) : (
                        <p className='flex items-center justify-center bg-blue-100 opacity-70 border border-dashed border-blue-300 p-6 h-36 rounded-md'>Arraste ou clique para selecionar a imagem...</p>
                      )
                    }
                  </div>
                )}
                <div className='flex flex-col items-center justify-evenly sm:flex-row gap-2'>
                  {file && (
                    <div className='flex flex-row flex-wrap drop-shadow-md'>
                      <div className='flex w-48 h-48 relative'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt='preview'
                          src={file.preview}
                          className='w-48 h-48 object-contain rounded-md'
                          onLoad={() => URL.revokeObjectURL(file.preview)}
                        />
                      </div>
                    </div>
                  )}
                  {restoredFile && (
                    <div className='flex flex-row flex-wrap drop-shadow-md'>
                      <div className='flex w-48 h-48 relative'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt='preview'
                          src={restoredFile.preview}
                          className='w-60 h-60 object-contain rounded-md'
                          onLoad={() => URL.revokeObjectURL(restoredFile.preview)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEnhance}>Melhorar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
