import React, { useState } from 'react';
import { User, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useFinanceStore } from '../../store/useFinanceStore';

const GENERIC_AVATARS = [
  "https://images.unsplash.com/photo-1750535135593-3a8e5def331d?w=400&q=80",
  "https://images.unsplash.com/photo-1750535135451-7c20e24b60c1?w=400&q=80",
  "https://images.unsplash.com/photo-1750535135733-4ade39b4d487?w=400&q=80",
  "https://images.unsplash.com/photo-1701615004837-40d8573b6652?w=400&q=80",
  "https://images.unsplash.com/photo-1651346158507-a2810590687f?w=400&q=80",
  "https://images.unsplash.com/photo-1599566147214-ce487862ea4f?w=400&q=80",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80",
  "https://images.unsplash.com/photo-1707912079134-becf5a3598e2?w=400&q=80",
  "https://images.unsplash.com/photo-1706606999710-72658165a73d?w=400&q=80",
  "https://images.unsplash.com/photo-1732020858816-93c130ab8f49?w=400&q=80"
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
    <div className="flex items-start gap-6">
      <div className="flex-shrink-0">
        {currentAvatar ? (
          <img src={currentAvatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-gray-200" />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            <User className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex gap-2 mb-4">
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
