import { SourceRange } from './diagnostics';

export interface RawXmlNode {
  tag: string;
  attributes: Record<string, string>;
  text?: string;
  children: RawXmlNode[];
  position?: SourceRange;
}
