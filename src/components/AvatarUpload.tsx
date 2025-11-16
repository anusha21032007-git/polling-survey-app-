import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Upload } from 'lucide-react';
import { showError } from '@/utils/toast';

interface AvatarUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ url, onUpload, size = 128 }) => {
  const { user } = useSupabaseSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAvatarUrl(url);
  }, [url]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      if (!user) {
        throw new Error('You must be logged in to upload an avatar.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (!data.publicUrl) {
        throw new Error("Could not get public URL for uploaded avatar.");
      }

      setAvatarUrl(data.publicUrl);
      onUpload(data.publicUrl);

    } catch (error) {
      showError((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar style={{ height: size, width: size }} className="ring-2 ring-primary/20">
        <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
        <AvatarFallback style={{ height: size, width: size, fontSize: size / 2 }}>
          <User />
        </AvatarFallback>
      </Avatar>
      <div>
        <Button asChild variant="outline">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </label>
        </Button>
        <Input
          id="avatar-upload"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default AvatarUpload;