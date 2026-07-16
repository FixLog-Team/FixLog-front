import { Sparkles, X } from 'lucide-react';

interface AiSummaryPanelProps {
  open: boolean;
  isLoading: boolean;
  summary?: string;
  isError: boolean;
  onClose: () => void;
}

/**
 * AI 요약 결과 모달. (안드로이드 sheet_ai_summary 의 웹 대응)
 * 최신 본문 저장 → 요약 요청 동안 로딩, 완료 시 요약 텍스트, 실패 시 안내를 보여준다.
 */
export function AiSummaryPanel({ open, isLoading, summary, isError, onClose }: AiSummaryPanelProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[80vh] flex flex-col bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <Sparkles size={18} className="text-blue-600" />
            <span>AI 요약</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-3 text-gray-600">
              <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span>요약 중…</span>
            </div>
          ) : isError ? (
            <p className="text-gray-600">AI 요약에 실패했습니다. 잠시 후 다시 시도해 주세요.</p>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
              {summary && summary.trim().length > 0 ? summary : '요약 결과가 비어 있습니다.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
