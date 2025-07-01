import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { useLogoUpload } from '@/hooks/useLogoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const LogoUpload: React.FC = () => {
  const { profile } = useAuth();
  const { uploadLogo, deleteLogo, uploading, error } = useLogoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    const result = await uploadLogo(file);
    
    if (result.success) {
      toast.success('Logo enviada com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao fazer upload da logo');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDeleteLogo = async () => {
    const result = await deleteLogo();
    
    if (result.success) {
      toast.success('Logo removida com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao remover logo');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Logo da Empresa</h3>
            <p className="text-sm text-gray-600">
              Faça upload da logo da sua empresa. Máximo 5MB, apenas imagens.
            </p>
          </div>

          {profile?.logo_url ? (
            // Mostrar logo atual
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={profile.logo_url}
                  alt="Logo da empresa"
                  className="max-w-xs max-h-32 object-contain border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Alterar Logo
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteLogo}
                  disabled={uploading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            // Área de upload
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center space-y-4">
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Adicione a logo da sua empresa
                  </p>
                  <p className="text-sm text-gray-600">
                    Arraste e solte uma imagem ou clique para selecionar
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>• Formatos aceitos: JPG, PNG, GIF, SVG</p>
            <p>• Tamanho máximo: 5MB</p>
            <p>• Recomendado: imagens em alta resolução para melhor qualidade</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};