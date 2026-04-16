export interface VirtualPackageNode {
  id: string;
  name: string;
  packagePath: string;
  parentId?: string;
  childPackageIds: string[];
  memberNodeIds: string[];
}

export class VirtualPackageTreeService {
  private readonly packages = new Map<string, VirtualPackageNode>();

  getPackage(packagePath: string): VirtualPackageNode | undefined {
    return this.packages.get(packagePath);
  }

  upsertPackage(node: VirtualPackageNode): void {
    this.packages.set(node.packagePath, node);
  }
}

