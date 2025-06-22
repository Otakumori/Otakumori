'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.UploadError = exports.UPLOAD_CONFIGS = void 0;
exports.validateFile = validateFile;
exports.processImage = processImage;
exports.saveFile = saveFile;
exports.generateFilename = generateFilename;
exports.handleFileUpload = handleFileUpload;
exports.uploadToCloud = uploadToCloud;
exports.cleanupOldFiles = cleanupOldFiles;
exports.getFileInfo = getFileInfo;
const promises_1 = require('fs/promises');
const path_1 = require('path');
const sharp_1 = __importDefault(require('sharp'));
exports.UPLOAD_CONFIGS = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 512,
    maxHeight: 512,
    quality: 85,
  },
  achievement: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/svg+xml'],
    maxWidth: 128,
    maxHeight: 128,
    quality: 90,
  },
  product: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
  },
  content: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 85,
  },
};
class UploadError extends Error {
  code;
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'UploadError';
  }
}
exports.UploadError = UploadError;
async function validateFile(file, config) {
  // Check file size
  if (file.size > config.maxSize) {
    throw new UploadError(
      `File size exceeds maximum allowed size of ${config.maxSize / (1024 * 1024)}MB`,
      'FILE_TOO_LARGE'
    );
  }
  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    throw new UploadError(
      `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`,
      'INVALID_FILE_TYPE'
    );
  }
}
async function processImage(buffer, config) {
  let image = (0, sharp_1.default)(buffer);
  // Resize if dimensions are specified
  if (config.maxWidth || config.maxHeight) {
    image = image.resize(config.maxWidth, config.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  // Convert to WebP for better compression
  if (config.quality) {
    image = image.webp({ quality: config.quality });
  }
  return image.toBuffer();
}
async function saveFile(buffer, filename, directory) {
  const uploadDir = (0, path_1.join)(process.cwd(), 'public', 'uploads', directory);
  // Create directory if it doesn't exist
  await (0, promises_1.mkdir)(uploadDir, { recursive: true });
  const filepath = (0, path_1.join)(uploadDir, filename);
  await (0, promises_1.writeFile)(filepath, buffer);
  return `/uploads/${directory}/${filename}`;
}
function generateFilename(originalName, prefix) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const base = prefix ? `${prefix}_` : '';
  return `${base}${timestamp}_${random}.${extension}`;
}
async function handleFileUpload(request, config, directory, prefix) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      throw new UploadError('No file provided', 'NO_FILE');
    }
    // Validate file
    await validateFile(file, config);
    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Process image if it's an image file
    let processedBuffer = buffer;
    if (file.type.startsWith('image/')) {
      processedBuffer = await processImage(buffer, config);
    }
    // Generate filename
    const filename = generateFilename(file.name, prefix);
    // Save file
    const url = await saveFile(processedBuffer, filename, directory);
    return { url, filename };
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError('Failed to upload file', 'UPLOAD_FAILED');
  }
}
// Cloud storage integration (example with AWS S3)
async function uploadToCloud(buffer, filename, directory) {
  // This is a placeholder for cloud storage integration
  // In production, you would use AWS S3, Cloudinary, or similar
  // For now, we'll save locally and return the path
  return await saveFile(buffer, filename, directory);
}
// Cleanup function for removing old files
async function cleanupOldFiles(
  directory,
  maxAge = 24 * 60 * 60 * 1000 // 24 hours
) {
  // This would clean up old temporary files
  // Implementation depends on your storage solution
  console.log(`Cleaning up old files in ${directory}`);
}
// Get file info
async function getFileInfo(filepath) {
  const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
  const stats = await fs.stat(filepath);
  const info = {
    size: stats.size,
    type: 'unknown',
  };
  // Get image dimensions if it's an image
  if (filepath.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    try {
      const metadata = await (0, sharp_1.default)(filepath).metadata();
      info.dimensions = {
        width: metadata.width,
        height: metadata.height,
      };
      info.type = metadata.format;
    } catch (error) {
      console.error('Failed to get image metadata:', error);
    }
  }
  return info;
}
