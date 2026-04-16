import { ArxmlFileParseResult } from '../../protocol/dto';

export interface IParser {
  parseFile(fileUri: string, content: string): Promise<ArxmlFileParseResult>;
}

