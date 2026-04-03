import type { Document, Folder } from '@/shared/types/document';

// Mock data with tree structure for document list
export const MOCK_DOCUMENTS: Array<Document | Folder> = [
  {
    id: "1",
    name: "Projects",
    type: "folder",
    isExpanded: true,
    children: [
      {
        id: "1-1",
        name: "FixLog",
        type: "folder",
        children: [
          {
            id: "1-1-1",
            name: "API Authentication Issue",
            type: "document",
            modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
            createdAt: new Date(2024, 0, 12),
          },
          {
            id: "1-1-2",
            name: "Database Schema Design",
            type: "document",
            modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // Today
            createdAt: new Date(2024, 0, 14),
          },
        ],
      },
      {
        id: "1-2",
        name: "Portfolio",
        type: "folder",
        children: [
          {
            id: "1-2-1",
            name: "React Best Practices 2024",
            type: "document",
            modifiedAt: new Date(2024, 0, 15),
            createdAt: new Date(2024, 0, 10),
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Notes",
    type: "folder",
    children: [
      {
        id: "2-1",
        name: "TypeScript Migration Guide",
        type: "document",
        modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        createdAt: new Date(2024, 0, 8),
      },
      {
        id: "2-2",
        name: "Docker Deployment Steps",
        type: "document",
        modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        createdAt: new Date(2024, 0, 5),
      },
    ],
  },
  {
    id: "3",
    name: "Archive",
    type: "folder",
    children: [
      {
        id: "3-1",
        name: "Git Rebase vs Merge",
        type: "document",
        modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
        createdAt: new Date(2024, 0, 1),
      },
      {
        id: "3-2",
        name: "Performance Optimization Checklist",
        type: "document",
        modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        createdAt: new Date(2024, 0, 6),
      },
    ],
  },
  {
    id: "4",
    name: "Git Rebase vs Merge",
    type: "document",
    modifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
    createdAt: new Date(2024, 0, 1),
  },
];
