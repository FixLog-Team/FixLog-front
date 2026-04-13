export interface Document {
  id: string;
  name: string;
  type: 'document';
  modifiedAt: Date;
  createdAt: Date;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  type: 'folder';
  parentId?: string;
  children?: Array<Folder | Document>;
  isExpanded?: boolean;
}

export interface TreeItem {
  id: string;
  name: string;
  type: 'folder' | 'document';
  modifiedAt?: Date;
  children?: TreeItem[];
  isExpanded?: boolean;
}
