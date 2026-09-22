import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="text-center py-12 md:py-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          VibeBoard에 오신 것을 환영합니다!
        </h1>
        <p className="text-lg text-gray-600">
          최신 웹 기술로 만든 현대적이고 빠른 게시판 사이트입니다.
          <br />
          자유롭게 의견을 나누고 소통해보세요.
        </p>

        <div className="flex gap-4 justify-center pt-6">
          <Link href="/posts" className={buttonVariants({ size: "lg" })}>
            게시판 보기
          </Link>
          <Link href="/posts/create" className={buttonVariants({ variant: "outline", size: "lg" })}>
            글쓰기
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-gray-200">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-indigo-600">⚡ 빠른 속도</h3>
            <p className="text-gray-600 text-sm">
              Next.js와 최신 웹 표준으로 제작되어 빠르고 반응적입니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-indigo-600">🎨 아름다운 디자인</h3>
            <p className="text-gray-600 text-sm">
              shadcn/ui로 구축된 현대적이고 우아한 인터페이스입니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-indigo-600">🔒 안전한 데이터</h3>
            <p className="text-gray-600 text-sm">
              TypeScript로 작성되어 타입 안전성을 보장합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
