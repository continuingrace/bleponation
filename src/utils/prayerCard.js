// 기도카드 — 새 탭에서 HTML 카드 페이지 열기
// 실제 렌더링된 HTML 그대로 보여주고, 사용자가 직접 저장

const CAT_LABEL = {
  missionary: '선교사',
  nation: '나라',
  mission: '선교',
}

export function openPrayerCard(prayer, date) {
  const catLabel = CAT_LABEL[prayer.category] || '기도'
  const pct = Math.min((prayer.evangelicalRate || 0) / 30 * 100, 100).toFixed(1)

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=390, initial-scale=1.0" />
  <title>기도카드 — ${prayer.country}</title>
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #F0F0F0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 24px 0 40px;
      font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      width: 390px;
      background: #FFFFFF;
      padding: 0;
      position: relative;
    }
    .section { padding: 0 22px; }

    /* 헤더 */
    .header {
      padding: 22px 22px 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .pray-label {
      font-size: 11px;
      font-weight: 700;
      color: #7247C8;
      letter-spacing: 2.5px;
      line-height: 1.5;
      margin-bottom: 3px;
    }
    .date {
      font-size: 12px;
      font-weight: 300;
      color: #6C6C6C;
    }
    .badge {
      background: #7247C8;
      color: #FFF;
      font-size: 13px;
      font-weight: 600;
      padding: 5px 18px;
      border-radius: 999px;
      white-space: nowrap;
      margin-top: 2px;
    }

    /* 구분선 */
    .divider {
      height: 1px;
      background: #E8E8E8;
      margin: 0 22px;
    }

    /* 국가 섹션 */
    .country-section {
      padding: 20px 22px 16px;
    }
    .region {
      font-size: 13px;
      font-weight: 700;
      color: #3A3A3A;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .country-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .flag-img {
      width: 56px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #E8E8E8;
      flex-shrink: 0;
    }
    .country-names {
      display: flex;
      align-items: baseline;
      gap: 10px;
      flex-wrap: wrap;
    }
    .country-ko {
      font-family: 'Google Sans', 'Pretendard', sans-serif;
      font-size: 38px;
      font-weight: 600;
      color: #3A3A3A;
      line-height: 1;
    }
    .country-en {
      font-family: 'Google Sans', 'Pretendard', sans-serif;
      font-size: 18px;
      font-weight: 300;
      color: rgba(58,58,58,0.38);
      line-height: 1;
      letter-spacing: 0.3px;
    }

    /* 인포 */
    .info-section {
      padding: 16px 22px 0;
    }
    .info-row {
      display: flex;
      gap: 20px;
      margin-bottom: 14px;
    }
    .info-col { flex: 1; }
    .info-label {
      font-size: 12px;
      font-weight: 700;
      color: #7247C8;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 13px;
      font-weight: 500;
      color: #6C6C6C;
    }

    /* 복음화율 */
    .bar-section {
      padding: 4px 22px 16px;
    }
    .bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .bar-label {
      font-size: 12px;
      font-weight: 700;
      color: #7247C8;
    }
    .bar-pct {
      font-size: 13px;
      font-weight: 600;
      color: #191919;
    }
    .bar-bg {
      height: 5px;
      background: #E0E0E0;
      border-radius: 99px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .bar-fill {
      height: 100%;
      background: #7247C8;
      border-radius: 99px;
    }
    .bar-sub {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #9A9A9A;
    }

    /* 기도 섹션 */
    .prayer-section {
      padding: 16px 22px 0;
    }
    .prayer-label {
      font-size: 12px;
      font-weight: 700;
      color: #7247C8;
      margin-bottom: 8px;
    }
    .prayer-title {
      font-size: 26px;
      font-weight: 700;
      color: #7247C8;
      line-height: 1.35;
      margin-bottom: 14px;
      word-break: keep-all;
    }
    .prayer-body {
      font-size: 15px;
      font-weight: 500;
      color: #6C6C6C;
      line-height: 1.75;
      letter-spacing: -0.3px;
      word-break: keep-all;
    }

    /* 말씀 블록 */
    .scripture-block {
      margin: 18px 22px 0;
      background: #7247C8;
      border-radius: 8px;
      padding: 18px 20px;
    }
    .scripture-label {
      font-size: 12px;
      font-weight: 700;
      color: #FFF;
      margin-bottom: 10px;
    }
    .scripture-text {
      font-size: 14px;
      font-weight: 500;
      color: #FFF;
      line-height: 1.7;
      letter-spacing: -0.3px;
      margin-bottom: 10px;
      word-break: keep-all;
    }
    .scripture-ref {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,0.8);
      text-align: right;
      letter-spacing: -0.2px;
    }

    /* 뉴스 블록 */
    .news-block {
      margin: 12px 22px 0;
      background: #E0E0E0;
      border-radius: 8px;
      padding: 16px 20px;
    }
    .news-label {
      font-size: 12px;
      font-weight: 700;
      color: #6C6C6C;
      margin-bottom: 8px;
    }
    .news-text {
      font-size: 13px;
      font-weight: 500;
      color: #6C6C6C;
      line-height: 1.7;
      letter-spacing: -0.3px;
      margin-bottom: 8px;
      word-break: keep-all;
    }
    .news-source {
      font-size: 11px;
      color: #9A9A9A;
      text-align: right;
      letter-spacing: -0.2px;
    }

    /* 푸터 */
    .footer {
      padding: 16px 22px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left {
      font-size: 10px;
      color: #9A9A9A;
      line-height: 1.8;
    }
    .footer-right { text-align: right; }
    .footer-app {
      font-size: 12px;
      font-weight: 700;
      color: #7247C8;
    }
    .footer-url {
      font-size: 10px;
      color: #9A9A9A;
    }

    /* 저장 안내 */
    .save-guide {
      width: 390px;
      margin-top: 16px;
      background: #FFF;
      border-radius: 12px;
      padding: 14px 18px;
      text-align: center;
      font-size: 12px;
      color: #888;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <div>
    <div class="card">

      <!-- 헤더 -->
      <div class="header">
        <div>
          <div class="pray-label">PRAY FOR THE NATIONS</div>
          <div class="date">${date}</div>
        </div>
        <div class="badge">${catLabel}</div>
      </div>

      <div class="divider"></div>

      <!-- 국가 -->
      <div class="country-section">
        <div class="region">${prayer.region || ''}</div>
        <div class="country-row">
          <img
            class="flag-img"
            src="https://flagcdn.com/w80/${getCountryCode(prayer.countryEn)}.png"
            onerror="this.style.display='none'"
            alt="${prayer.country}"
          />
          <div class="country-names">
            <span class="country-ko">${prayer.country || ''}</span>
            <span class="country-en">${prayer.countryEn || ''}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 인구/종교 -->
      <div class="info-section">
        <div class="info-row">
          <div class="info-col">
            <div class="info-label">인구 수</div>
            <div class="info-value">${prayer.population || '-'}</div>
          </div>
          <div class="info-col">
            <div class="info-label">종교 분포</div>
            <div class="info-value">${prayer.religion || '-'}</div>
          </div>
        </div>
      </div>

      <!-- 복음화율 바 -->
      <div class="bar-section">
        <div class="bar-header">
          <span class="bar-label">복음화율</span>
          <span class="bar-pct">${prayer.evangelicalRate || 0}%</span>
        </div>
        <div class="bar-bg">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="bar-sub">
          <span>교회: 약 ${(prayer.churches || 0).toLocaleString()}</span>
          <span>파송 선교사: 약 ${prayer.missionaries || 0}명</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 기도 -->
      <div class="prayer-section">
        <div class="prayer-label">오늘의 기도</div>
        <div class="prayer-title">${prayer.title || ''}</div>
        <div class="prayer-body">${prayer.body || ''}</div>
      </div>

      <!-- 말씀 블록 -->
      <div class="scripture-block">
        <div class="scripture-label">말씀 · 개역개정</div>
        <div class="scripture-text">${prayer.scriptureText ? `"${prayer.scriptureText}"` : ''}</div>
        <div class="scripture-ref">${prayer.scripture || ''}</div>
      </div>

      ${prayer.news ? `
      <!-- 뉴스 블록 -->
      <div class="news-block">
        <div class="news-label">관련 소식</div>
        <div class="news-text">${prayer.news}</div>
        <div class="news-source">출처: ${prayer.newsSource || ''} / ${prayer.newsDate || ''}</div>
      </div>
      ` : ''}

      <div class="divider" style="margin-top:16px"></div>

      <!-- 푸터 -->
      <div class="footer">
        <div class="footer-left">
          기도 자료: ${prayer.prayerSource || ''}<br/>
          관련 소식: ${prayer.newsSource || ''}
        </div>
        <div class="footer-right">
          <div class="footer-app">열방을 위한 기도</div>
          <div class="footer-url">bleponation.netlify.app</div>
        </div>
      </div>

    </div>

    <div class="save-guide">
      📸 <strong>스크린샷</strong>으로 저장하세요<br/>
      <span style="color:#AAA;font-size:11px;">전원 버튼 + 볼륨 올리기 (iPhone)<br/>이후 사진 앱에서 카드 영역만 크롭</span>
    </div>
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

function getCountryCode(countryEn = '') {
  const map = {
    'Iran': 'ir', 'Afghanistan': 'af', 'North Korea': 'kp', 'China': 'cn',
    'India': 'in', 'Indonesia': 'id', 'Ethiopia': 'et', 'Myanmar': 'mm',
    'Morocco': 'ma', 'Japan': 'jp', 'Somalia': 'so', 'Brazil': 'br',
    'Pakistan': 'pk', 'Saudi Arabia': 'sa', 'Turkey': 'tr', 'Egypt': 'eg',
    'Nigeria': 'ng', 'Sudan': 'sd', 'Syria': 'sy', 'Iraq': 'iq',
    'Yemen': 'ye', 'Ukraine': 'ua', 'Russia': 'ru', 'Cambodia': 'kh',
    'Vietnam': 'vn', 'Thailand': 'th', 'Laos': 'la', 'Mongolia': 'mn',
    'Kazakhstan': 'kz', 'Uzbekistan': 'uz',
    'Russia': 'ru', 'Ukraine': 'ua', 'Belarus': 'by', 'Georgia': 'ge',
    'Armenia': 'am', 'Kyrgyzstan': 'kg', 'Tajikistan': 'tj',
    'Turkmenistan': 'tm', 'Azerbaijan': 'az', 'Moldova': 'md',
    'Cuba': 'cu', 'Venezuela': 've', 'Colombia': 'co', 'Peru': 'pe',
    'Chile': 'cl', 'Argentina': 'ar', 'Mexico': 'mx',
    'South Africa': 'za', 'Zimbabwe': 'zw', 'Mozambique': 'mz',
    'Angola': 'ao', 'Congo': 'cd', 'Cameroon': 'cm', 'Libya': 'ly',
    'Algeria': 'dz', 'Tunisia': 'tn', 'Mali': 'ml', 'Niger': 'ne',
    'Senegal': 'sn', 'Ghana': 'gh', 'Burkina Faso': 'bf', 'Chad': 'td',
    'Philippines': 'ph', 'Malaysia': 'my', 'Singapore': 'sg',
    'Sri Lanka': 'lk', 'Bhutan': 'bt', 'Maldives': 'mv',
    'Israel': 'il', 'Palestine': 'ps', 'Jordan': 'jo', 'Lebanon': 'lb',
    'Kuwait': 'kw', 'Qatar': 'qa', 'UAE': 'ae', 'Oman': 'om', 'Bahrain': 'bh', 'Bangladesh': 'bd', 'Nepal': 'np',
  }
  return map[countryEn] || 'un'
}
