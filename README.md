# 열방을 위한 기도 🌍✝️

매일 새롭게 갱신되는 열방 선교 기도제목 웹앱

## 스택
- **Frontend**: React + Vite
- **Backend**: Netlify Functions (서버리스)
- **AI**: Claude API (claude-haiku — 기도제목 생성)
- **뉴스**: VOM Korea / KWMA RSS 피드
- **이미지**: html2canvas (기도카드 9:16 PNG 저장)
- **폰트**: Pretendard / Google Sans

---

## 배포 방법 (Netlify)

### 1. 저장소 준비
```bash
git init
git add .
git commit -m "init: 열방을 위한 기도 앱"
# GitHub에 새 repo 만들고 push
git remote add origin https://github.com/YOUR_ID/nations-prayer.git
git push -u origin main
```

### 2. Netlify 연결
1. https://app.netlify.com → "Add new site" → "Import an existing project"
2. GitHub 연결 → 방금 만든 repo 선택
3. Build settings 자동 감지됨 (netlify.toml 기준)
4. **"Deploy site"** 클릭

### 3. 환경 변수 설정 (필수!)
Netlify 대시보드 → Site settings → Environment variables → Add variable

| 변수명 | 값 |
|--------|-----|
| `ANTHROPIC_API_KEY` | sk-ant-... (Anthropic Console에서 발급) |
| `ADMIN_PASSWORD` | 본인만 아는 비밀번호 |

### 4. Netlify Functions 의존성
```bash
# netlify/functions 폴더에 package.json 추가
cd netlify/functions
npm init -y
npm install @anthropic-ai/sdk
```

또는 루트 package.json에 이미 포함되어 있으면 Netlify가 자동 설치.

---

## 로컬 개발
```bash
npm install
npm run dev          # 프론트엔드만 (기도제목은 폴백 데이터 사용)

# Netlify CLI 설치 후 Functions 포함 실행:
npm install -g netlify-cli
netlify dev          # http://localhost:8888
```

---

## 환경 변수 없이 테스트
API 연결 전에도 앱은 내장 폴백 데이터(이란/아프가니스탄/북한)로 동작합니다.

---

## 주요 기능
- ✅ 매일 Claude AI가 새로운 기도제목 3개 생성 (선교사/나라/선교)
- ✅ 서버사이드 캐시 — 하루 API 호출 1회 (사용자 수 무관)
- ✅ 관리자 비밀번호로만 강제 재생성 가능
- ✅ 기도 체크 & localStorage 기록
- ✅ 기도 달력 — 월별 기도 기록 시각화
- ✅ 국기 이미지 (flagcdn.com)
- ✅ 나라별 복음화율/교회수/선교사 인포그래픽
- ✅ 관련 소식 + 출처 + 날짜 표시 (신뢰도)
- ✅ 기도카드 9:16 PNG 저장 (스토리/릴스용)

---

## 폴더 구조
```
nations-prayer/
├── netlify/
│   └── functions/
│       └── get-prayers.js    # Claude API + RSS + 캐시
├── src/
│   ├── components/
│   │   ├── PrayerCard.jsx    # 기도 카드 (접기/펼치기)
│   │   ├── Calendar.jsx      # 기도 달력
│   │   └── HistoryView.jsx   # 날짜별 기록
│   ├── utils/
│   │   ├── storage.js        # localStorage 유틸
│   │   └── prayerCard.js     # 이미지 카드 생성 (html2canvas)
│   ├── App.jsx               # 메인 앱
│   └── main.jsx
├── index.html
├── vite.config.js
├── netlify.toml
└── package.json
```
