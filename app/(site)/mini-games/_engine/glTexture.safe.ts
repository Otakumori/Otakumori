export interface TextureOptions {
  minFilter?: number;
  magFilter?: number;
  wrapS?: number;
  wrapT?: number;
  generateMipmaps?: boolean;
  }

export function createTexture(
  gl: WebGL2RenderingContext,
  url: string,
  options: TextureOptions = {},
): Promise<WebGLTexture> {
  return new Promise((resolve, reject) => {
    const {
      minFilter = gl.LINEAR_MIPMAP_LINEAR,
      magFilter = gl.LINEAR,
      wrapS = gl.CLAMP_TO_EDGE,
      wrapT = gl.CLAMP_TO_EDGE,
      generateMipmaps = true,
    } = options;

    const texture = gl.createTexture();
    if (!texture) {
      reject(new Error('Failed to create texture'));
      return;
    }

    // Upload temporary 1x1 pixel to prevent black texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255]),
    );

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    // Load the actual image
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Check if image dimensions are power of 2
      const isPowerOf2 = (value: number) => (value & (value - 1)) === 0;
      const isPOT = isPowerOf2(image.width) && isPowerOf2(image.height);

      if (isPOT && generateMipmaps) {
        // Upload image and generate mipmaps
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // Upload image without mipmaps
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      }

      resolve(texture);
    };

    image.onerror = () => {
      reject(new Error(`Failed to load texture: ${url}`));
    };

    image.src = url;
  });
}

// Alternative using createImageBitmap for better performance
export function createTextureFromImageBitmap(
  gl: WebGL2RenderingContext,
  imageBitmap: ImageBitmap,
  options: TextureOptions = {},
): WebGLTexture {
  const {
    minFilter = gl.LINEAR_MIPMAP_LINEAR,
    magFilter = gl.LINEAR,
    wrapS = gl.CLAMP_TO_EDGE,
    wrapT = gl.CLAMP_TO_EDGE,
    generateMipmaps = true,
  } = options;

  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Failed to create texture');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

  if (generateMipmaps) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  return texture;
}

// Load texture using createImageBitmap
export async function createTextureFromUrl(
  gl: WebGL2RenderingContext,
  url: string,
  options: TextureOptions = {},
): Promise<WebGLTexture> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    return createTextureFromImageBitmap(gl, imageBitmap, options);
  } catch (error) {
    throw new Error(`Failed to load texture from URL: ${url}. ${error}`);
  }
}
