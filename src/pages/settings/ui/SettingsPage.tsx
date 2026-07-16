import { Database, HardDrive, Globe, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { PageHeader } from '@/shared/ui/page-header';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { CURRENT_WORKSPACE } from '@/domains/user/lib/mock-data/current-user';

const INFRASTRUCTURE = [
  {
    icon: Database,
    title: 'Dedicated database',
    description: 'PostgreSQL 16 · isolated instance',
  },
  {
    icon: HardDrive,
    title: 'Dedicated storage',
    description: 'Encrypted object store · 500 GB',
  },
  {
    icon: Globe,
    title: 'Private deployment URL',
    description: 'acme.fixlog.internal',
  },
  {
    icon: ShieldCheck,
    title: 'Backup status',
    description: 'Last backup 2 hours ago',
  },
];

export function SettingsPage() {
  return (
    <AppShell header={<PageHeader title="Workspace Settings" />}>
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {/* Workspace profile */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            Workspace profile
          </h2>
          <div className="mt-5 flex gap-5">
            <Avatar
              name={CURRENT_WORKSPACE.name}
              size="lg"
              className="rounded-xl bg-primary"
            />
            <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Workspace name" value={CURRENT_WORKSPACE.name} />
              <Field label="Company" value={CURRENT_WORKSPACE.company} />
              <Field
                label="Deployment type"
                value={CURRENT_WORKSPACE.deploymentType}
              />
              <Field label="Region" value={CURRENT_WORKSPACE.region} />
              <div>
                <p className="text-xs text-muted-foreground">Environment</p>
                <Badge variant="published" className="mt-1.5">
                  {CURRENT_WORKSPACE.environment}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Infrastructure */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            Infrastructure
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This workspace runs in its own dedicated, on-premise environment.
          </p>
          <div className="mt-4 divide-y divide-border">
            {INFRASTRUCTURE.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <item.icon className="size-4 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Badge variant="published">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
