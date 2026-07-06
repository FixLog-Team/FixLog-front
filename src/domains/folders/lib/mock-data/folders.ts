// v0 디자인 데모용 폴더 데이터 (사이드바 FOLDERS 섹션 + 문서 목록 테이블)

export interface DemoFolder {
  id: string;
  name: string;
  itemCount: number;
  updatedLabel: string;
}

export const DEMO_FOLDERS: DemoFolder[] = [
  { id: 'product', name: 'Product', itemCount: 18, updatedLabel: '2 days ago' },
  { id: 'engineering', name: 'Engineering', itemCount: 42, updatedLabel: '3 hours ago' },
  { id: 'operations', name: 'Operations', itemCount: 24, updatedLabel: 'Yesterday' },
  { id: 'customer-support', name: 'Customer Support', itemCount: 31, updatedLabel: '1 day ago' },
  { id: 'release-notes', name: 'Release Notes', itemCount: 12, updatedLabel: '5 hours ago' },
  { id: 'policies', name: 'Policies', itemCount: 9, updatedLabel: '1 week ago' },
];
