# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입/로그인
2. 새 프로젝트 생성
3. 프로젝트명을 "vibeboard"로 설정
4. 데이터베이스 암호를 설정하고 기억해두기
5. 프로젝트 생성 완료 대기 (몇 분 소요)

## 2. 데이터베이스 테이블 생성

1. Supabase 대시보드에서 "SQL Editor" 섹션으로 이동
2. "New Query" 버튼 클릭
3. `supabase/migrations/01_create_tables.sql` 파일의 전체 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 테이블 생성

또는 Supabase CLI를 사용:
```bash
supabase db push
```

## 3. 환경 변수 설정

1. Supabase 프로젝트 대시보드에서 "Settings" → "API" 메뉴 클릭
2. "Project URL"과 "anon public" 키 복사

3. 프로젝트 루트에 `.env.local` 파일 생성 (`.env.local.example` 참고):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

⚠️ **주의**: `.env.local` 파일은 `.gitignore`에 이미 등록되어 있습니다. 절대 GitHub에 커밋하지 마세요!

## 4. 로컬에서 테스트

1. 개발 서버 시작:
```bash
npm run dev
```

2. 브라우저에서 `http://localhost:3000` 열기

3. 게시글 작성, 수정, 삭제, 댓글 기능이 정상 작동하는지 확인

## 5. Supabase 대시보드에서 데이터 확인

1. Supabase 대시보드의 "Table Editor" 섹션으로 이동
2. `posts` 테이블과 `comments` 테이블 확인
3. 작성한 게시글과 댓글이 저장되어 있는지 확인

## 데이터베이스 구조

### posts 테이블
- `id` (UUID): 게시글 고유 ID
- `title` (VARCHAR(200)): 게시글 제목
- `content` (TEXT): 게시글 내용
- `author` (VARCHAR(50)): 작성자
- `tags` (TEXT[]): 태그 배열
- `view_count` (INTEGER): 조회수
- `comment_count` (INTEGER): 댓글 수
- `created_at` (TIMESTAMP): 생성 시간
- `updated_at` (TIMESTAMP): 수정 시간

### comments 테이블
- `id` (UUID): 댓글 고유 ID
- `post_id` (UUID): 해당 게시글의 ID
- `author` (VARCHAR(50)): 댓글 작성자
- `content` (VARCHAR(500)): 댓글 내용
- `created_at` (TIMESTAMP): 생성 시간
- `updated_at` (TIMESTAMP): 수정 시간

## 주요 특징

✅ **자동 ID 생성**: UUID로 자동 생성  
✅ **타임스탬프**: 자동으로 생성/수정 시간 기록  
✅ **외래키 제약**: 게시글 삭제 시 관련 댓글 자동 삭제  
✅ **인덱스**: 쿼리 성능 최적화를 위한 인덱스 생성  
✅ **RLS 보안**: Row Level Security 정책 적용  

## 문제 해결

### "Missing Supabase environment variables" 오류
→ `.env.local` 파일이 존재하고 올바른 값이 입력되어 있는지 확인

### 테이블이 안 보임
→ Supabase 대시보드에서 올바른 데이터베이스와 스키마를 선택했는지 확인

### CORS 오류
→ Supabase 대시보드의 "Settings" → "API" → "CORS" 설정에서 localhost 주소 추가

## 프로덕션 배포

1. 호스팅 서비스(Vercel 등)에 환경 변수 설정
2. `.env.local` 파일의 값을 프로덕션 환경에 추가
3. 배포 진행

더 자세한 정보는 [Supabase 문서](https://supabase.com/docs)를 참조하세요.
