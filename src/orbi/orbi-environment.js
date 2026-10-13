import { CubeUVReflectionMapping, ImageLoader, LinearFilter, SRGBColorSpace, Texture } from 'three';

const studioImages = new Map();

export async function loadOrbiEnvironment(url = '/orbi/orbi-studio-cubeuv.webp') {
  // This lossless WebP contains the original three-card studio's prefiltered PMREM, baked
  // with Three r186, size 256 and sigma .09. Its sRGB pixels retain the original
  // render target's row order and all roughness levels; no GPU filtering pass
  // is needed at startup or after a context restore.
  if (!studioImages.has(url)) {
    studioImages.set(url,new ImageLoader().loadAsync(url).catch(error => {
      studioImages.delete(url);
      throw error;
    }));
  }
  // Share decoded pixels, not disposable textures. Each renderer can release or
  // restore its own GPU resources without invalidating another live avatar.
  const texture = new Texture(await studioImages.get(url));
  texture.name = 'Orbi baked studio';
  texture.mapping = CubeUVReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
