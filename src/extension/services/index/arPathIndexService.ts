export class ArPathIndexService {
  private readonly index = new Map<string, string[]>();

  get(path: string): string[] {
    return this.index.get(path) ?? [];
  }

  set(path: string, nodeIds: string[]): void {
    this.index.set(path, nodeIds);
  }
}

