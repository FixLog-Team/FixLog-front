// v0 디자인 데모용 정적 데이터 (실제 API 연동 전까지 사용)

export interface WorkspaceProfile {
  name: string;
  company: string;
  deploymentType: string;
  region: string;
  environment: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

export const CURRENT_WORKSPACE: WorkspaceProfile = {
  name: "FixLog Document",
  company: "FixLog Team.",
  deploymentType: "Dedicated Off-premises environment",
  region: "US East (Virginia)",
  environment: "Production",
};

export const CURRENT_USER: UserProfile = {
  name: "Maria Chen",
  email: "maria@acme.co",
};
