'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PasskeyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => Promise<string>;
}

const PasskeyOverlay = ({ isOpen, onClose, onGenerate }: PasskeyOverlayProps) => {
  const [passkey, setPasskey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const newPasskey = await onGenerate();
      setPasskey(newPasskey);
      toast.success('Passkey generated successfully');
    } catch (error) {
      console.error('Error generating passkey:', error);
      toast.error('Failed to generate passkey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(passkey);
    toast.success('Passkey copied to clipboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Passkey</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              This passkey can be used for secure access to admin features.
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={passkey}
                readOnly
                placeholder="Click generate to create a passkey"
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={!passkey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Generate New</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasskeyOverlay; 