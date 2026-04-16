import { XMLParser } from 'fast-xml-parser';

import { NormalizedArxmlNode } from '../../models/normalizedNode';
import { ArxmlReference } from '../../models/reference';
import { ArxmlFileParseResult } from '../../protocol/dto';
import { IParser } from './parser';

type ParsedEntry = Record<string, unknown>;

function slug(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]+/g, '_');
}

export class JsXmlParser implements IParser {
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
    textNodeName: '#text',
    preserveOrder: false,
    parseTagValue: false,
  });

  async parseFile(fileUri: string, content: string): Promise<ArxmlFileParseResult> {
    const checksum = `${content.length}:${content.slice(0, 64)}`;
    const parsed = this.parser.parse(content) as ParsedEntry;
    const nodes: NormalizedArxmlNode[] = [];
    const references: ArxmlReference[] = [];
    let sequence = 0;

    const visit = (tag: string, value: unknown, xmlPath: string, semanticParentPath: string): string | undefined => {
      if (tag === '?xml') {
        return undefined;
      }

      if (Array.isArray(value)) {
        const arrayChildIds = value
          .map((entry, index) => visit(tag, entry, `${xmlPath}[${index}]`, semanticParentPath))
          .filter((id): id is string => Boolean(id));
        return arrayChildIds[0];
      }

      if (value === null || typeof value !== 'object') {
        return undefined;
      }

      const entry = value as ParsedEntry;
      const attributes = this.extractAttributes(entry);
      const shortName = this.readTextChild(entry, 'SHORT-NAME');
      const displayName = shortName ?? tag;
      const semanticSegment = shortName ?? (this.isStructuralTag(tag) ? '' : tag);
      const normalizedParentPath = semanticParentPath === '/' ? '' : semanticParentPath;
      const semanticPath = semanticSegment
        ? (normalizedParentPath ? `${normalizedParentPath}/${semanticSegment}` : `/${semanticSegment}`)
        : semanticParentPath || '/';
      const nodeId = `${fileUri}#${slug(semanticPath)}#${sequence++}`;
      const childIds: string[] = [];
      const referenceIds: string[] = [];

      const node: NormalizedArxmlNode = {
        id: nodeId,
        workspaceId: 'default-workspace',
        fileUri,
        xmlPath,
        semanticPath,
        module: this.detectModule(tag, semanticPath),
        type: tag,
        category: this.detectCategory(tag),
        shortName,
        displayName,
        attributes,
        childIds,
        referenceIds,
        meta: {
          schemaType: typeof entry['@_DEST'] === 'string' ? String(entry['@_DEST']) : undefined,
          warnings: [],
        },
      };

      nodes.push(node);

      for (const [childTag, childValue] of Object.entries(entry)) {
        if (childTag.startsWith('@_') || childTag === '#text' || childTag === 'SHORT-NAME') {
          continue;
        }

        if (this.isReferenceTag(childTag)) {
          const rawRef = this.readNodeText(childValue);
          if (rawRef) {
            const referenceId = `${nodeId}:ref:${referenceIds.length}`;
            const reference: ArxmlReference = {
              id: referenceId,
              sourceNodeId: nodeId,
              sourceField: childTag,
              targetRef: rawRef,
              arPath: rawRef.startsWith('/') ? rawRef : undefined,
              resolved: false,
              relationType: this.detectRelationType(childTag),
              metadata: typeof (childValue as ParsedEntry)?.['@_DEST'] === 'string'
                ? { destType: String((childValue as ParsedEntry)['@_DEST']) }
                : undefined,
            };
            references.push(reference);
            referenceIds.push(referenceId);
          }
          continue;
        }

        if (this.isTextOnlyNode(childValue)) {
          continue;
        }

        if (Array.isArray(childValue)) {
          for (let index = 0; index < childValue.length; index += 1) {
            const childId = visit(
              childTag,
              childValue[index],
              `${xmlPath}/${childTag}[${index}]`,
              semanticPath
            );
            if (childId) {
              childIds.push(childId);
            }
          }
          continue;
        }

        const childId = visit(childTag, childValue, `${xmlPath}/${childTag}`, semanticPath);
        if (childId) {
          childIds.push(childId);
        }
      }

      return nodeId;
    };

    for (const [tag, value] of Object.entries(parsed)) {
      visit(tag, value, `/${tag}`, '');
    }

    return {
      fileUri,
      checksum,
      parsedAt: Date.now(),
      nodes,
      references,
      diagnostics: [],
    };
  }

  private extractAttributes(entry: ParsedEntry): Record<string, import('../../models/normalizedNode').ArxmlValue> {
    const result: Record<string, import('../../models/normalizedNode').ArxmlValue> = {};

    for (const [key, value] of Object.entries(entry)) {
      if (key.startsWith('@_')) {
        result[key.slice(2)] = { kind: 'string', value: String(value) };
        continue;
      }

      if (key === '#text') {
        result.text = { kind: 'string', value: String(value) };
        continue;
      }

      if (this.isPrimitive(value)) {
        result[key] = { kind: 'string', value: String(value) };
      }
    }

    return result;
  }

  private readTextChild(entry: ParsedEntry, tag: string): string | undefined {
    const value = entry[tag];
    return this.readNodeText(value);
  }

  private readNodeText(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const text = this.readNodeText(item);
        if (text) {
          return text;
        }
      }
      return undefined;
    }

    if (value && typeof value === 'object' && '#text' in (value as ParsedEntry)) {
      return String((value as ParsedEntry)['#text']);
    }

    return undefined;
  }

  private isTextOnlyNode(value: unknown): boolean {
    if (this.isPrimitive(value)) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.every((item) => this.isTextOnlyNode(item));
    }

    if (value && typeof value === 'object') {
      const keys = Object.keys(value as ParsedEntry).filter((key) => !key.startsWith('@_'));
      return keys.length === 1 && keys[0] === '#text';
    }

    return false;
  }

  private isPrimitive(value: unknown): value is string | number | boolean {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
  }

  private isReferenceTag(tag: string): boolean {
    return tag.endsWith('-REF') || tag.endsWith('-TREF') || tag.endsWith('-IREF');
  }

  private detectRelationType(tag: string): ArxmlReference['relationType'] {
    if (tag.includes('DEFINITION')) {
      return 'definition-ref';
    }
    if (tag.includes('IREF')) {
      return 'instance-ref';
    }
    if (tag.includes('REF')) {
      return 'config-ref';
    }
    return 'foreign';
  }

  private detectCategory(tag: string): string {
    if (tag.endsWith('-REF') || tag.endsWith('-TREF') || tag.endsWith('-IREF')) {
      return 'reference';
    }
    if (tag.includes('PACKAGE')) {
      return 'package';
    }
    if (tag.includes('CONTAINER')) {
      return 'container';
    }
    return 'node';
  }

  private detectModule(tag: string, semanticPath: string): NormalizedArxmlNode['module'] {
    const haystack = `${tag} ${semanticPath}`.toLowerCase();
    if (haystack.includes('canif')) {
      return 'CanIf';
    }
    if (haystack.includes('can')) {
      return 'Can';
    }
    if (haystack.includes('dcm')) {
      return 'Dcm';
    }
    if (haystack.includes('pdur')) {
      return 'PduR';
    }
    if (haystack.includes('com')) {
      return 'Com';
    }
    if (haystack.includes('dem')) {
      return 'Dem';
    }
    if (haystack.includes('ecuc')) {
      return 'EcuC';
    }
    if (haystack.includes('/os') || haystack.includes(' os ')) {
      return 'Os';
    }
    return 'Unknown';
  }

  private isStructuralTag(tag: string): boolean {
    return new Set([
      'AUTOSAR',
      'AR-PACKAGES',
      'ELEMENTS',
      'SUB-CONTAINERS',
      'PARAMETER-VALUES',
      'REFERENCE-VALUES',
      'PHYSICAL-CHANNELS',
      'FRAME-TRIGGERINGS',
      'I-SIGNAL-TRIGGERINGS',
      'PDU-TRIGGERINGS',
      'ECUC-CONTAINER-VALUES',
    ]).has(tag);
  }
}
