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
  typography: { fields: TextField[]; decorations: Decoration[] };
  masks?: Partial<Record<'base' | DynamicLayer | 'text', string>>;
  zIndex: Record<'base' | DynamicLayer, number>;
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
  compatibilityVersion: 2;
  status?: 'placeholder' | 'illustrated';
  preview?: string;
  fonts: PackFont[];
  layouts: TexturePackLayout[];
}

export interface Shadow { color: string; blur?: number; offsetX?: number; offsetY?: number; }
export interface Transform { x: number; y: number; rotation?: number; opacity?: number; zIndex: number; }
export interface Decoration extends Transform {
  id: string;
  type: 'sprite' | 'rect';
  /** Text-field ID only; chains and cycles are forbidden. */
  relativeTo?: string;
  width: number;
  height: number;
  anchorX?: number;
  anchorY?: number;
  scale?: number;
  /** Required for sprites; pack-relative PNG. */
  asset?: string;
  /** Required for rects. */
  color?: string;
  padding?: number;
  radius?: number;
  border?: { color: string; width: number };
  shadow?: Shadow;
}
export interface ArcPath {
  type: 'arc';
  centerX: number;
  centerY: number;
  radius: number;
  /** Degrees: 0 right, 90 down. Equal angles describe a full circle. */
  startAngle: number;
  endAngle: number;
  direction: 'clockwise' | 'counterclockwise';
}
export interface TextField extends Omit<Transform, 'x' | 'y'> {
  id: string;
  source: keyof LabelData | 'static';
  text?: string;
  font: string;
  fontSize: number;
  minFontSize?: number;
  maxFontSize?: number;
  fontWeight?: number;
  color: string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  /** Required for straight text, forbidden with path. */
  x?: number;
  y?: number;
  path?: ArcPath;
  maxWidth?: number;
  maxHeight?: number;
  maxLines?: number;
  wrap?: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  shadow?: Shadow;
  background?: Decoration;
  format?: 'raw' | 'percent' | 'year-full' | 'year-short';
  prefix?: string;
  suffix?: string;
}
