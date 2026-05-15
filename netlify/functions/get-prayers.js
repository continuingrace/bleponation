// netlify/functions/get-prayers.js
// 하루 1회 Claude API 호출 후 캐시 저장
// 관리자 비밀번호로만 강제 재생성 가능

const Anthropic = require("@anthropic-ai/sdk");

// In-memory cache (Netlify Functions warm instance 기준)
// 실제 운영 시 KV store 또는 파일 캐시 권장
let cache = { date: null, data: null };

function getTodayKST() {
  return new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).replace(/\. /g, "-").replace(".", "");
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const params = event.queryStringParameters || {};
  const forceRefresh = params.admin_key === process.env.ADMIN_PASSWORD;
  const todayKST = getTodayKST();

  // 캐시 유효하면 반환
  if (!forceRefresh && cache.date === todayKST && cache.data) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ...cache.data, cached: true }),
    };
  }

  // RSS 뉴스 수집 (병렬)
  let newsItems = [];
  try {
    const RSS_FEEDS = [
      "https://api.rss2json.com/v1/api.json?rss_url=https://vomkorea.com/feed",
      "https://api.rss2json.com/v1/api.json?rss_url=https://kwma.org/feed",
    ];
    const results = await Promise.allSettled(
      RSS_FEEDS.map(url =>
        fetch(url, { signal: AbortSignal.timeout(4000) })
          .then(r => r.json())
          .then(d => (d.items || []).slice(0, 3))
      )
    );
    newsItems = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value)
      .map(item => `- ${item.title} (${(item.pubDate || "").slice(0, 10)}) [${item.link}]`)
      .slice(0, 6);
  } catch {}

  const newsContext = newsItems.length
    ? `\n\n최근 선교 뉴스 (참고용):\n${newsItems.join("\n")}`
    : "";

  // Claude API 호출
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const today = todayKST;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: `당신은 복음주의 세계 선교 전문가입니다. 오늘(${today}) 열방 기도제목 3개를 생성하세요.${newsContext}

반드시 순수 JSON만 출력하세요 (마크다운 없이):

{
  "date": "${today}",
  "intro": "오늘의 열방 묵상 한 문장 (25자 이내)",
  "prayers": [
    {
      "category": "missionary",
      "country": "국가명",
      "countryEn": "영문국가명",
      "flag": "국기이모지",
      "region": "대륙/지역",
      "population": "인구 (예: 약 8,870만 명)",
      "religion": "주요종교와 비율 (예: 이슬람 98%)",
      "evangelicalRate": 0.3,
      "churches": 300,
      "missionaries": 12,
      "unreached": true,
      "title": "기도제목 제목 (18자 이내)",
      "body": "구체적 기도 내용 (100~130자, 현지 선교 상황 반영)",
      "countryInfo": "선교적 배경 설명 (60~80자)",
      "news": "최근 관련 소식 (50~70자)",
      "newsSource": "출처 기관명",
      "newsDate": "YYYY-MM 형식 날짜",
      "scripture": "성경 책명 장:절 (예: 마태복음 9:37-38)",
      "scriptureText": "개역개정 성경 본문 (예: 추수할 것은 많되 일꾼이 적으니 그러므로 추수하는 주인에게 청하여 추수할 일꾼들을 보내 주소서 하라)",
      "prayerSource": "Operation World 또는 Joshua Project 또는 OMF International Korea 또는 GMS 총회선교회 또는 KWMA 또는 순교자의 소리",
      "urgency": "high"
    },
    {
      "category": "nation",
      "country": "국가명",
      "countryEn": "영문국가명",
      "flag": "국기이모지",
      "region": "대륙/지역",
      "population": "인구",
      "religion": "주요종교와 비율",
      "evangelicalRate": 2.1,
      "churches": 5000,
      "missionaries": 200,
      "unreached": false,
      "title": "기도제목 제목",
      "body": "구체적 기도 내용",
      "countryInfo": "선교적 배경 설명",
      "news": "최근 관련 소식",
      "newsSource": "출처 기관명",
      "newsDate": "YYYY-MM 형식 날짜",
      "scripture": "성경 책명 장:절",
      "scriptureText": "개역개정 성경 본문",
      "prayerSource": "기도자료 출처",
      "urgency": "medium"
    },
    {
      "category": "mission",
      "country": "국가명 또는 종족명",
      "countryEn": "영문국가명",
      "flag": "국기이모지",
      "region": "대륙/지역",
      "population": "인구 또는 종족 규모",
      "religion": "주요종교와 비율",
      "evangelicalRate": 0.05,
      "churches": 20,
      "missionaries": 5,
      "unreached": true,
      "title": "기도제목 제목",
      "body": "구체적 기도 내용",
      "countryInfo": "선교적 배경 설명",
      "news": "최근 관련 소식",
      "newsSource": "출처 기관명",
      "newsDate": "YYYY-MM 형식 날짜",
      "scripture": "성경 책명 장:절",
      "scriptureText": "개역개정 성경 본문",
      "prayerSource": "기도자료 출처",
      "urgency": "high"
    }
  ]
}

요구사항:
- 날짜 ${today}를 시드로 매일 다른 나라 선택
- 실제 미전도 종족/박해 국가 반영
- newsDate는 최근 6개월 이내
- category는 반드시 missionary, nation, mission 각 하나씩
- scriptureText: 개역개정 본문 정확히 (짧은 구절 1~2절로 제한)
- JSON만 출력, 마크다운 없이`
      }]
    });

    let raw = message.content[0].text.replace(/```json|```/g, "").trim();
    // JSON이 잘린 경우 복구 시도
    if (!raw.endsWith('}')) {
      const lastBrace = raw.lastIndexOf('}');
      if (lastBrace > 0) raw = raw.substring(0, lastBrace + 1);
      // prayers 배열이 닫히지 않은 경우
      const lastBracket = raw.lastIndexOf(']');
      if (lastBracket < 0) raw = raw + ']}';
      else if (!raw.includes(']}')) raw = raw + ']}';
    }
    const data = JSON.parse(raw);
    // prayers가 3개 미만이면 에러
    if (!data.prayers || data.prayers.length < 1) {
      throw new Error('prayers 데이터 부족');
    }

    // 캐시 저장
    cache = { date: todayKST, data };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ...data, cached: false }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "생성 실패", detail: err.message }),
    };
  }
};
