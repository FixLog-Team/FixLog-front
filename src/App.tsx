import { RouterProvider } from 'react-router-dom';
import { OverlayProvider } from 'overlay-kit';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { router } from '@/app/router';
import { Toaster } from '@/shared/ui/toast';

function App() {
  return (
    <QueryProvider>
      <OverlayProvider>
        <RouterProvider router={router} />
        {/* 라우터 밖에 두어 페이지 이동 후에도 토스트가 유지되도록 한다. */}
        <Toaster />
      </OverlayProvider>
    </QueryProvider>
  );
}

export default App;
