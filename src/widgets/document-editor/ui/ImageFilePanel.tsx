import { useRef, useState } from 'react';
import { useBlockNoteEditor } from '@blocknote/react';
import type { FilePanelProps } from '@blocknote/react';
import { ImagePlus, Link2, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils/index';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

type Tab = 'upload' | 'url';

/**
 * 문서 에디터의 이미지 삽입 패널(업로드 / URL). BlockNote 기본 파일 패널 대신
 * 프로젝트 UI(Button/Input/디자인 토큰)에 맞춰 렌더한다.
 * - 업로드: 파일 선택·드래그로 editor.uploadFile(서버 업로드) → 블록 url 설정.
 * - URL: 외부 이미지 주소를 그대로 블록 url 로 설정(임베드).
 * 블록에 url 이 설정되면 패널은 자동으로 닫힌다(FilePanelController).
 */
export function ImageFilePanel({ blockId }: FilePanelProps) {
  const editor = useBlockNoteEditor();
  const [tab, setTab] = useState<Tab>('upload');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const applyUrl = (value: string, name?: string) => {
    editor.updateBlock(blockId, {
      props: name ? { url: value, name } : { url: value },
    });
  };

  const upload = async (file: File) => {
    if (!editor.uploadFile) return;
    setUploading(true);
    try {
      // uploadFile 이 형식·용량 검증과 실패 토스트를 처리한다(DocumentEditor 설정).
      const result = await editor.uploadFile(file, blockId);
      const uploadedUrl = typeof result === 'string' ? result : (result.url as string);
      if (uploadedUrl) applyUrl(uploadedUrl, file.name);
    } catch {
      /* 실패 안내는 uploadFile 내부 토스트가 담당 */
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  const submitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const value = url.trim();
    if (value) applyUrl(value);
  };

  return (
    <div className="w-80 rounded-xl border border-border bg-card p-1.5 shadow-lg">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <TabButton active={tab === 'upload'} onClick={() => setTab('upload')}>
          <ImagePlus className="size-4" />
          업로드
        </TabButton>
        <TabButton active={tab === 'url'} onClick={() => setTab('url')}>
          <Link2 className="size-4" />
          URL
        </TabButton>
      </div>

      <div className="p-2.5">
        {tab === 'upload' ? (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              disabled={uploading}
              className={cn(
                'flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground transition-colors hover:bg-muted',
                dragOver && 'border-primary bg-accent text-foreground',
                uploading && 'cursor-wait opacity-70'
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-5 animate-spin text-primary" />
                  업로드 중…
                </>
              ) : (
                <>
                  <ImagePlus className="size-5 text-primary" />
                  <span>
                    이미지를 드래그하거나{' '}
                    <span className="font-medium text-primary">클릭해 업로드</span>
                  </span>
                  <span className="text-xs">JPG · PNG · GIF · WebP · SVG · 최대 10MB</span>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = '';
              }}
            />
          </>
        ) : (
          <form onSubmit={submitUrl} className="flex flex-col gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="이미지 주소(https://...)를 붙여넣으세요"
              aria-label="이미지 URL"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={!url.trim()} className="w-full">
              임베드
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

/** 패널 상단 탭 버튼. */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
