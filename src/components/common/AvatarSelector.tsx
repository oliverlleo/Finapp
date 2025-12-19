import React, { useState } from 'react';
import { User, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useFinanceStore } from '../../store/useFinanceStore';

const GENERIC_AVATARS = [
  // Female (Notionists Style)
  "https://api.dicebear.com/9.x/notionists/svg?seed=Felix",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Lola",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Molly",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Coco",
  // Male (Notionists Style)
  "https://api.dicebear.com/9.x/notionists/svg?seed=Jack",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Leo",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Max",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Bear",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Oscar",
  // Neutral (Bottts Style - Robots/Neutral)
  "https://api.dicebear.com/9.x/bottts/svg?seed=Sky",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Echo",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Jazz",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Pixel",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Data"
];

interface AvatarSelectorProps {
  currentAvatar: string;
  onAvatarChange: (url: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ currentAvatar, onAvatarChange }) => {
  const { uploadAvatar } = useFinanceStore();
  const [avatarMode, setAvatarMode] = useState<'upload' | 'gallery' | 'link'>('upload');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const url = await uploadAvatar(file);
      setUploading(false);
      if (url) {
        onAvatarChange(url);
      } else {
        alert('Erro ao fazer upload da imagem.');
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      <div className="flex-shrink-0">
        {currentAvatar ? (
          <img src={currentAvatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-gray-200" />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            <User className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setAvatarMode('upload')}
            className={clsx(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              avatarMode === 'upload' ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setAvatarMode('gallery')}
            className={clsx(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              avatarMode === 'gallery' ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Galeria
          </button>
          <button
            type="button"
            onClick={() => setAvatarMode('link')}
            className={clsx(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              avatarMode === 'link' ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Link
          </button>
        </div>

        {avatarMode === 'upload' && (
          <div className="mt-2">
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>{uploading ? 'Enviando...' : 'Upload um arquivo'}</span>
                    <input type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
              </div>
            </div>
          </div>
        )}

        {avatarMode === 'gallery' && (
          <div className="mt-2 grid grid-cols-5 gap-2">
            {GENERIC_AVATARS.map((url, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onAvatarChange(url)}
                className={clsx(
                  "relative h-12 w-12 rounded-full overflow-hidden border-2 hover:opacity-80 transition-opacity",
                  currentAvatar === url ? "border-indigo-500 ring-2 ring-indigo-500 ring-offset-2" : "border-transparent"
                )}
              >
                <img src={url} alt={`Avatar ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {avatarMode === 'link' && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={currentAvatar}
                onChange={(e) => onAvatarChange(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://exemplo.com/avatar.jpg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
