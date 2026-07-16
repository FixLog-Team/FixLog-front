// v0 디자인 데모용 문서 데이터 (문서 목록 테이블 + AI 검색 결과에서 공용)

export type DocStatus = 'published' | 'in-review' | 'draft';

export interface DemoDocument {
  id: string;
  title: string;
  tags: string[];
  owner: string;
  updatedLabel: string;
  status: DocStatus;
  folderPath: string;
  description: string;
  /** AI 검색 결과 매치율 (검색 화면에서 사용) */
  matchPercent?: number;
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: 'payment-error-handling-guide',
    title: 'Payment Error Handling Guide',
    tags: ['payments', 'errors'],
    owner: 'Maria Chen',
    updatedLabel: 'Mar 4, 2026',
    status: 'published',
    folderPath: 'Engineering / Guides',
    description:
      'How the payment service classifies gateway failures, retries idempotent charges, and surfaces actionable errors to the client.',
    matchPercent: 96,
  },
  {
    id: 'driver-onboarding-flow-spec',
    title: 'Driver Onboarding Flow Spec',
    tags: ['onboarding', 'spec'],
    owner: 'Liam Park',
    updatedLabel: 'Feb 27, 2026',
    status: 'in-review',
    folderPath: 'Product / Specs',
    description:
      'End-to-end specification for the driver onboarding flow, including verification steps and edge cases.',
  },
  {
    id: 'release-branch-checklist',
    title: 'Release Branch Checklist',
    tags: ['release', 'qa'],
    owner: 'Sofia Rossi',
    updatedLabel: 'Mar 11, 2026',
    status: 'published',
    folderPath: 'Engineering / Release Notes',
    description:
      'Describes how we cut a release branch, run the QA window, cherry-pick late fixes, and ship to production.',
  },
  {
    id: 'customer-refund-policy',
    title: 'Customer Refund Policy',
    tags: ['refunds', 'policy'],
    owner: 'Noah Kim',
    updatedLabel: 'Jan 19, 2026',
    status: 'published',
    folderPath: 'Policies / Finance',
    description:
      'The official policy for issuing customer refunds, including approval thresholds and timelines.',
  },
  {
    id: 'production-incident-retrospective',
    title: 'Production Incident Retrospective',
    tags: ['incident', 'postmortem'],
    owner: 'Ava Müller',
    updatedLabel: 'Mar 9, 2026',
    status: 'published',
    folderPath: 'Operations / Incidents',
    description:
      'Root cause analysis of the March checkout outage, timeline of events, and the remediation items assigned to each team.',
    matchPercent: 88,
  },
  {
    id: 'new-team-member-onboarding',
    title: 'New Team Member Onboarding',
    tags: ['onboarding', 'people'],
    owner: 'Maria Chen',
    updatedLabel: 'Feb 14, 2026',
    status: 'published',
    folderPath: 'Operations / People',
    description:
      'Checklist and resources for onboarding new team members across engineering and operations.',
  },
  {
    id: 'api-pagination-bug-analysis',
    title: 'API Pagination Bug Analysis',
    tags: ['pagination', 'bug'],
    owner: 'Liam Park',
    updatedLabel: 'Mar 6, 2026',
    status: 'draft',
    folderPath: 'Engineering / Investigations',
    description:
      'Investigation into duplicate records returned by cursor pagination under high write throughput, with a proposed fix.',
  },
  {
    id: 'admin-tool-permission-guide',
    title: 'Admin Tool Permission Guide',
    tags: ['permissions', 'admin'],
    owner: 'Sofia Rossi',
    updatedLabel: 'Feb 22, 2026',
    status: 'published',
    folderPath: 'Engineering / Guides',
    description:
      'Reference for admin tool permission levels and how to grant or revoke access safely.',
  },
];

export function findDemoDocument(id: string): DemoDocument | undefined {
  return DEMO_DOCUMENTS.find((doc) => doc.id === id);
}

export const STATUS_LABEL: Record<DocStatus, string> = {
  published: 'Published',
  'in-review': 'In review',
  draft: 'Draft',
};
