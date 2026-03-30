import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { LOGIN_PAGE_TEXT } from '../constants';
import { useGoogleLogin } from '@/features/auth/login/hooks/use-google-login';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();

  const { startGoogleLogin, isLoading } = useGoogleLogin({
    onSuccess: (data) => {
      console.log('Login success:', data);
      navigate('/documents');
    },
    onError: (error) => {
      console.error('Login error:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const handleGoogleLogin = () => {
    startGoogleLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-[630px] shadow-lg">
        <CardHeader className="space-y-5 text-center">
          <CardTitle className="text-4xl">{LOGIN_PAGE_TEXT.title}</CardTitle>
          <CardDescription className="text-lg">
            {LOGIN_PAGE_TEXT.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg
              className="mr-2 h-6 w-6"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            {LOGIN_PAGE_TEXT.googleButton}
          </Button>
          <p className="text-center text-base text-muted-foreground">
            {LOGIN_PAGE_TEXT.helperText}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
