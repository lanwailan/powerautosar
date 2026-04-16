declare module 'fast-xml-parser' {
  export interface X2jOptions {
    ignoreAttributes?: boolean;
    attributeNamePrefix?: string;
    trimValues?: boolean;
    textNodeName?: string;
    preserveOrder?: boolean;
    parseTagValue?: boolean;
  }

  export class XMLParser {
    constructor(options?: X2jOptions);
    parse(xmlData: string): unknown;
  }
}
