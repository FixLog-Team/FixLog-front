export interface FolderItem {
  folderId: string;
  workspaceId: string;
  parentId: string | null;
  folderName: string;
  ordinal: number;
  createUser: string;
  createTime: string;
  updateUser: string | null;
  updateTime: string;
}

export interface DocumentItem {
  documentId: string;
  folderId: string;
  workspaceId: string;
  title: string;
  ordinal: number;
  createUser: string;
  createTime: string;
  updateUser: string | null;
  updateTime: string;
}

export interface FolderPathItem {
  folderId: string;
  folderName: string;
}

export interface FolderContentsResponse {
  code: string;
  message: string;
  result: {
    folders: FolderItem[];
    documents: DocumentItem[];
  };
}
