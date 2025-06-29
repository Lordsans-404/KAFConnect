"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SimpleCreateMaterialDialogProps = {
  children: ReactNode;
  token: string;
};

export function MaterialDialog({ children, token }: SimpleCreateMaterialDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMaterialUrl("");
    setFile(null);
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const newErrors: { [key: string]: string } = {};
    if (!title) newErrors.title = "Judul tidak boleh kosong.";
    if (!description) newErrors.description = "Deskripsi tidak boleh kosong.";
    if (!file && !materialUrl) {
      newErrors.file = "Anda harus menyediakan file atau URL.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (materialUrl) {
      formData.append("materialUrl", materialUrl);
    }
    if (file) {
      formData.append("file", file);
    }
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/new-material`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },  
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Saya juga perbaiki ini agar lebih ringkas
        alert(errorData.message || "Gagal membuat materi."); 
        return;
      }
      
      const result = await response.json();
      alert(`Materi "${result.title}" berhasil dibuat.`);

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Tidak dapat terhubung ke server.";
      alert(`Terjadi kesalahan: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetForm();
        }
        setOpen(isOpen);
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Buat Materi Baru (Simple)</DialogTitle>
          <DialogDescription>
            Isi detail di bawah ini. Anda bisa mengunggah file atau menautkan URL.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Materi</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Pengenalan NestJS"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara singkat isi dari materi ini."
              className="resize-none"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">Unggah File (Opsional)</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={!!materialUrl}
            />
            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
          </div>
          
          <div className="text-center text-xs text-slate-500">ATAU</div>

          <div className="space-y-2">
            <Label htmlFor="material-url">URL Materi (Opsional)</Label>
            <Input
              id="material-url"
              type="url"
              value={materialUrl}
              onChange={(e) => setMaterialUrl(e.target.value)}
              placeholder="https://docs.nestjs.com"
              disabled={!!file}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Materi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}