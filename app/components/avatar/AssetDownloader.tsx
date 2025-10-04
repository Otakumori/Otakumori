'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AssetDownloaderProps {
  config: any;
  className?: string;
}

export function AssetDownloader({ config, className = '' }: AssetDownloaderProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>('');
  const [exportQuality, setExportQuality] = useState<'low' | 'medium' | 'high'>('medium');

  const formats = [
    {
      id: 'glb',
      name: 'GLB (3D Model)',
      description: 'Universal 3D format for games and VR',
      icon: '',
    },
    {
      id: 'fbx',
      name: 'FBX (3D Model)',
      description: 'Industry standard for animation',
      icon: '',
    },
    {
      id: 'obj',
      name: 'OBJ (3D Model)',
      description: 'Simple 3D format for 3D printing',
      icon: '️',
    },
    { id: 'png', name: 'PNG (Image)', description: 'High-quality 2D render', icon: '️' },
    { id: 'jpg', name: 'JPG (Image)', description: 'Compressed 2D render', icon: '' },
    { id: 'svg', name: 'SVG (Vector)', description: 'Scalable vector graphics', icon: '' },
  ];

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportFormat(format);

    try {
      const response = await fetch('/api/v1/avatar/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          quality: exportQuality,
          includeAssets: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const result = await response.json();

      if (result.ok) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = `avatar-${format}-${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportFormat('');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Export Avatar</h3>
        <p className="text-zinc-300 text-sm">
          Download your avatar in various formats for use in other applications
        </p>
      </div>

      {/* Quality Settings */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <h4 className="font-medium text-white mb-3">Export Quality</h4>
        <div className="flex space-x-2">
          {[
            { id: 'low', label: 'Low', description: 'Fast, smaller files' },
            { id: 'medium', label: 'Medium', description: 'Balanced quality' },
            { id: 'high', label: 'High', description: 'Best quality, larger files' },
          ].map((quality) => (
            <button
              key={quality.id}
              onClick={() => setExportQuality(quality.id as any)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                exportQuality === quality.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20'
              }`}
            >
              {quality.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formats.map((format) => (
          <motion.div
            key={format.id}
            className="bg-white/10 rounded-lg p-4 border border-white/20 hover:border-pink-500/50 transition-all duration-200 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleExport(format.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{format.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{format.name}</h4>
                <p className="text-sm text-zinc-400 mb-3">{format.description}</p>

                {isExporting && exportFormat === format.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-pink-400 text-sm">Exporting...</span>
                  </div>
                ) : (
                  <button className="px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors">
                    Download
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Information */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-200 mb-2">Usage Tips</h4>
        <ul className="text-sm text-blue-100 space-y-1">
          <li>• GLB format works best for web and VR applications</li>
          <li>• FBX format is ideal for animation software like Blender or Maya</li>
          <li>• OBJ format is perfect for 3D printing</li>
          <li>• PNG/JPG formats are great for social media and presentations</li>
          <li>• SVG format is scalable and perfect for web graphics</li>
        </ul>
      </div>
    </div>
  );
}

export default AssetDownloader;
