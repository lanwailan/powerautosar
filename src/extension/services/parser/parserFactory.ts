import { IParser } from './parser';
import { JsXmlParser } from './jsXmlParser';

export function createDefaultParser(): IParser {
  return new JsXmlParser();
}

