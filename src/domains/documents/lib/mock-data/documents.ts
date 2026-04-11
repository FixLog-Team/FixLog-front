import type { Document, Folder } from '@/domains/documents/types/document';
import { TIME_MS } from '@/shared/constants/time';

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
            modifiedAt: new Date(Date.now() - TIME_MS.DAY),
            createdAt: new Date(2024, 0, 12),
          },
          {
            id: "1-1-2",
            name: "Database Schema Design",
            type: "document",
            modifiedAt: new Date(Date.now() - TIME_MS.HOUR * 2),
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
        modifiedAt: new Date(Date.now() - TIME_MS.DAY * 3),
        createdAt: new Date(2024, 0, 8),
      },
      {
        id: "2-2",
        name: "Docker Deployment Steps",
        type: "document",
        modifiedAt: new Date(Date.now() - TIME_MS.WEEK),
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
        modifiedAt: new Date(Date.now() - TIME_MS.WEEK * 2),
        createdAt: new Date(2024, 0, 1),
      },
      {
        id: "3-2",
        name: "Performance Optimization Checklist",
        type: "document",
        modifiedAt: new Date(Date.now() - TIME_MS.DAY * 5),
        createdAt: new Date(2024, 0, 6),
      },
    ],
  },
  {
    id: "4",
    name: "Git Rebase vs Merge",
    type: "document",
    modifiedAt: new Date(Date.now() - TIME_MS.WEEK * 2),
    createdAt: new Date(2024, 0, 1),
  },
];
