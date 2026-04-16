import { ArPath, ArPathResolutionResult, ArxmlReference } from '../../models/reference';

export interface IArPathResolver {
  parse(path: string): ArPath;
  resolve(path: string): ArPathResolutionResult;
  resolveForReference(ref: ArxmlReference): ArPathResolutionResult;
}

export class ArPathResolver implements IArPathResolver {
  parse(path: string): ArPath {
    const normalized = path.trim();
    const segments = normalized.split('/').filter(Boolean);

    return {
      raw: path,
      segments,
      normalized,
      packagePath: segments.slice(0, -1).join('/'),
      leafName: segments.at(-1) ?? '',
      absolute: normalized.startsWith('/'),
    };
  }

  resolve(path: string): ArPathResolutionResult {
    return {
      arPath: this.parse(path),
      resolved: false,
      reason: 'PARTIAL_IMPORT',
    };
  }

  resolveForReference(ref: ArxmlReference): ArPathResolutionResult {
    return this.resolve(ref.arPath ?? ref.targetRef);
  }
}

