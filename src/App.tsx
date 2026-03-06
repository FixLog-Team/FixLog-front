import { RouterProvider } from 'react-router-dom';
import { OverlayProvider } from 'overlay-kit';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { router } from '@/app/router';

function App() {
  return (
    <QueryProvider>
      <OverlayProvider>
        <RouterProvider router={router} />
      </OverlayProvider>
    </QueryProvider>
  );
}

export default App;
