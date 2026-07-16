import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { documentsApi } from '@/domains/documents/api/documents.api';
import type { DocumentDto } from '@/domains/documents/types/document';

export function DocumentDetailPage() {
  // State
  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  // Functions
  const formatDate = (iso: string | null) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Effects
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await documentsApi.getDocument(documentId);
        setDocument(data);
      } catch (error) {
        console.error('Failed to load document:', error);
        setDocument(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Document Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The document you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Documents</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {document.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Created {formatDate(document.createTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Modified {formatDate(document.updateTime)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content (본문 평문 미리보기 — 서버가 blocks 에서 추출한 plainText) */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
              {document.plainText ?? '(내용 없음)'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
