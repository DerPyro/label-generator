export type LayerLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type DynamicLayer = 'genetics' | 'thc' | 'cbd';
export type ThresholdTuple = readonly [number, number, number, number, number, number, number];
/** Pack-defined, stable identifier; never a closed set of formats. */
export type LayoutId = string;
export type LabelShape = 'rectangle' | 'circle';
export interface LabelDesign {
  texturePackId: string;
  texturePackVersion: string;
  layoutId: LayoutId;
}
export interface TexturePackLayout {
  id: LayoutId;
  name: string;
  width: number;
  height: number;
  shape: LabelShape;
  preview?: string;
  /** Recommended bleed in mm; trim canvas retains its native aspect ratio. */
  bleedMm?: number;
  layers: { base: string; genetics: string[]; thc: string[]; cbd: string[] };
  typography: Record<string, unknown>;
  masks?: Partial<Record<'base' | DynamicLayer | 'text', string>>;
  layerOrder?: Array<'base' | DynamicLayer | 'text'>;
}
export interface LabelData {
  name: string;
  producer?: string;
  year: number;
  sativa: number;
  indica: number;
  thc: number;
  cbd: number;
}
/** Values are assigned to the first inclusive upper bound. */
export interface LayerThreshold { level: LayerLevel; max: number; }
export interface PackFont { family: string; path: string; weight?: string; }
export interface LayerSource { level: LayerLevel; path: string; label: string; }
export interface TexturePackManifest {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  compatibilityVersion: 1;
  status?: 'placeholder' | 'illustrated';
  preview?: string;
  fonts: PackFont[];
  layerOrder: Array<'base' | DynamicLayer | 'text'>;
  layouts: TexturePackLayout[];
}
