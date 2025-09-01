 
 
export type AssetType = 'image' | 'audio' | 'video' | 'font' | 'shader' | 'zip' | 'other';

export interface AssetConfigItem {
  id: string;
  url: string;
  dest?: string;
  type?: AssetType;
  license?: string;
  checksum?: string;
  extract?: boolean;
  flatten?: boolean;
  extractToGames?: boolean;
  gameSlug?: string;
}

export interface AssetRecord {
  id: string;
  type: AssetType | 'game';
  src: string;
  file: string;
  license?: string;
  bytes: number;
  sha256: string;
}

export type AssetMap = Record<string, AssetRecord>;

export interface AssetLookup {
  (id: string): string | null;
  raw: AssetMap;
  has: (id: string) => boolean;
  info: (id: string) => AssetRecord | null;
}
