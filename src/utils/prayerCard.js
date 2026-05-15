// 기도카드 v8 — Apple + Airbnb 디자인 시스템
// 컬러: Apple 차콜 + Airbnb 포인트 컬러 계열
// 신뢰감 있는 저널/매거진 스타일

const W = 1080
const PAD = 80
const INNER = W - PAD * 2

// ── 카테고리별 포인트 컬러 (Airbnb 영감)
const THEME = {
  missionary: {
    accent:     '#C13B3B',   // 딥 레드 — 긴급함, 순교, 헌신
    accentSoft: '#F9ECEC',
    accentMid:  '#E8C4C4',
    label: '선교사',
  },
  nation: {
    accent:     '#1A6B9A',   // 딥 블루 — 신뢰, 나라, 안정
    accentSoft: '#EAF2F8',
    accentMid:  '#B8D4E8',
    label: '나라',
  },
  mission: {
    accent:     '#1E7E5E',   // 딥 그린 — 생명, 선교, 소망
    accentSoft: '#EAF4EF',
    accentMid:  '#B8DDD0',
    label: '선교',
  },
}

// ── 컬러 팔레트 (Apple HIG 기반)
const C = {
  white:      '#FFFFFF',
  bg:         '#FFFFFF',
  gray50:     '#F5F5F7',   // Apple 라이트 배경
  gray100:    '#E8E8ED',
  gray200:    '#D2D2D7',
  gray400:    '#86868B',   // Apple secondary label
  gray600:    '#515154',   // Apple tertiary label  
  gray800:    '#1D1D1F',   // Apple primary label
  black:      '#000000',
}

// ── 타이포그래피 스케일 (Apple SF Pro 기반 비율)
const T = {
  caption2:  { font: '400 20px Pretendard, -apple-system, sans-serif', lh: 28 },
  caption1:  { font: '500 22px Pretendard, -apple-system, sans-serif', lh: 32 },
  footnote:  { font: '400 26px Pretendard, -apple-system, sans-serif', lh: 38 },
  body:      { font: '400 32px Pretendard, -apple-system, sans-serif', lh: 50 },
  callout:   { font: '400 36px Pretendard, -apple-system, sans-serif', lh: 56 },
  subhead:   { font: '600 30px Pretendard, -apple-system, sans-serif', lh: 44 },
  headline:  { font: '700 52px Pretendard, -apple-system, sans-serif', lh: 72 },
  title2:    { font: '700 64px Pretendard, -apple-system, sans-serif', lh: 84 },
  title1:    { font: '800 80px Pretendard, -apple-system, sans-serif', lh: 100 },
  largeTitle:{ font: '900 92px Pretendard, -apple-system, sans-serif', lh: 112 },
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function getLines(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line); line = w
    } else { line = test }
  }
  if (line) lines.push(line)
  return lines
}

function draw(ctx, style, color, text, x, y, maxW, opts = {}) {
  ctx.font = style.font
  ctx.fillStyle = color
  if (opts.align) ctx.textAlign = opts.align
  const lines = getLines(ctx, text, maxW)
  if (opts.measure) { ctx.textAlign = 'left'; return lines.length * style.lh }
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * style.lh))
  if (opts.align) ctx.textAlign = 'left'
  return lines.length * style.lh
}

function measure(ctx, style, text, maxW) {
  ctx.font = style.font
  return getLines(ctx, text, maxW).length * style.lh
}

function divider(ctx, y, x1 = PAD, x2 = W - PAD, color = C.gray100, w = 1) {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = w
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke()
  ctx.restore()
}

export async function generatePrayerCard(prayer, date) {
  const theme = THEME[prayer.category] || THEME.mission
  const acc = theme.accent
  const accSoft = theme.accentSoft
  const accMid = theme.accentMid

  // ── 높이 측정
  const mc = document.createElement('canvas')
  mc.width = W; mc.height = 100
  const mx = mc.getContext('2d')

  const titleH   = measure(mx, T.title2,  prayer.title || '',                         INNER)
  const bodyH    = measure(mx, T.callout,  prayer.body || '',                          INNER)
  const scripH   = prayer.scriptureText
    ? measure(mx, T.body, `"${prayer.scriptureText}"`, INNER - 64) : 0
  const newsH    = prayer.news
    ? measure(mx, T.footnote, prayer.news, INNER - 64) : 0

  const SP = 32   // 박스 내부 패딩

  // 박스 높이
  const scripBoxH = SP + T.caption1.lh + 16 + scripH + 16 + T.subhead.lh + SP
  const newsBoxH  = newsH > 0
    ? SP + T.caption1.lh + 16 + newsH + 12 + T.caption2.lh + SP : 0

  // 전체 높이 계산
  const sections = [
    8,           // 상단 accent 바
    80,          // 상단 여백
    T.caption1.lh + 8 + T.caption2.lh,  // header text
    56,          // header 하단 여백
    1,           // divider
    52,          // divider 여백
    148,         // 국기 + 국가명 영역
    56,          // 국가명 하단 여백
    1,           // divider
    48,          // divider 여백
    90,          // 인포 박스
    40,          // 인포 하단
    T.caption2.lh + 14 + 10 + T.caption2.lh + 32, // 복음화율 바
    1,           // divider
    60,          // divider 여백
    T.caption1.lh,  // 기도 라벨
    28,          // 라벨 하단
    titleH,      // 제목
    48,          // 제목 하단
    bodyH,       // 본문
    60,          // 본문 하단
    scripBoxH,   // 말씀 박스
    newsH > 0 ? 44 : 0,
    newsBoxH,    // 뉴스 박스
    newsH > 0 ? 44 : 0,
    1,           // footer divider
    44,          // footer 여백
    80,          // footer
    64,          // footer 하단 여백
    8,           // 하단 바
  ]

  const H = sections.reduce((a, b) => a + b, 0)

  // ── 실제 렌더링
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // 배경 흰색
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)

  // ── 상단 accent 컬러 바 (Airbnb 스타일)
  ctx.fillStyle = acc
  ctx.fillRect(0, 0, W, 8)

  let y = 8 + 80

  // ── 헤더 영역
  // 좌: PRAYER FOR THE NATIONS + 날짜
  ctx.font = T.caption1.font
  ctx.fillStyle = C.gray400
  ctx.letterSpacing = '4px'
  ctx.fillText('PRAYER FOR THE NATIONS', PAD, y)
  ctx.letterSpacing = '0px'
  y += T.caption1.lh + 8
  ctx.font = T.caption2.font
  ctx.fillStyle = C.gray400
  ctx.fillText(date, PAD, y)

  // 우: 카테고리 pill 배지 — 완전 둥근 pill (radius = 높이/2)
  const BADGE_H = 52
  const BADGE_W = 156
  const BADGE_R = BADGE_H / 2   // 완전 pill
  const BADGE_X = W - PAD - BADGE_W
  const BADGE_Y = 8 + 80 - 12
  ctx.fillStyle = acc
  roundRect(ctx, BADGE_X, BADGE_Y, BADGE_W, BADGE_H, BADGE_R)
  ctx.fill()
  ctx.fillStyle = C.white
  ctx.font = '700 24px Pretendard, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(theme.label, BADGE_X + BADGE_W / 2, BADGE_Y + 34)
  ctx.textAlign = 'left'

  y += T.caption2.lh + 56

  // ── 구분선
  divider(ctx, y)
  y += 52

  // ── 국가 섹션
  // 국기 이모지
  ctx.font = '96px serif'
  ctx.fillText(prayer.flag || '🌍', PAD, y + 96)

  // 지역명 + 국가명 — 국기 오른쪽, 수직 중앙 정렬
  const regionTextY = y + 28
  ctx.font = '400 26px Pretendard, -apple-system, sans-serif'
  ctx.fillStyle = C.gray400
  ctx.fillText(prayer.region || '', PAD + 128, regionTextY)

  const countryTextY = regionTextY + 16 + 88
  ctx.font = T.largeTitle.font
  ctx.fillStyle = C.gray800
  ctx.fillText(prayer.country || '', PAD + 128, countryTextY)

  // 국기 수직 중앙: 지역+국가명 그룹 기준
  const groupTop = regionTextY - 24
  const groupBot = countryTextY + 8
  const flagCenterY = (groupTop + groupBot) / 2
  ctx.font = '96px serif'
  ctx.fillText(prayer.flag || '🌍', PAD, flagCenterY + 34)

  y += 148 + 56

  // ── 구분선
  divider(ctx, y)
  y += 48

  // ── 인포 박스 2개 (인구 / 종교)
  const BOX_H = 90
  const B1W = 270, B2W = INNER - B1W - 20
  const BOX_PV = 16, BOX_PH = 22  // 상하/좌우 동일 패딩

  // 인구 박스
  ctx.fillStyle = C.gray50
  roundRect(ctx, PAD, y, B1W, BOX_H, 14); ctx.fill()
  ctx.font = T.caption2.font; ctx.fillStyle = C.gray400
  ctx.fillText('인구', PAD + BOX_PH, y + BOX_PV + 22)
  ctx.font = T.subhead.font; ctx.fillStyle = C.gray800
  ctx.fillText((prayer.population || '-').substring(0, 9), PAD + BOX_PH, y + BOX_PV + 22 + 36)

  // 종교 박스
  ctx.fillStyle = C.gray50
  roundRect(ctx, PAD + B1W + 20, y, B2W, BOX_H, 14); ctx.fill()
  ctx.font = T.caption2.font; ctx.fillStyle = C.gray400
  ctx.fillText('주요 종교', PAD + B1W + 20 + BOX_PH, y + BOX_PV + 22)
  ctx.font = T.subhead.font; ctx.fillStyle = C.gray800
  ctx.fillText((prayer.religion || '-').substring(0, 20), PAD + B1W + 20 + BOX_PH, y + BOX_PV + 22 + 36)

  y += BOX_H + 40

  // ── 복음화율 바
  ctx.font = T.caption2.font; ctx.fillStyle = C.gray600
  ctx.fillText('복음화율', PAD, y + 24)
  ctx.font = T.subhead.font; ctx.fillStyle = acc
  ctx.textAlign = 'right'
  ctx.fillText(`${prayer.evangelicalRate || 0}%`, W - PAD, y + 24)
  ctx.textAlign = 'left'
  y += 38

  // 바 배경
  ctx.fillStyle = C.gray100
  roundRect(ctx, PAD, y, INNER, 10, 5); ctx.fill()
  // 바 채움
  const pct = Math.min((prayer.evangelicalRate || 0) / 30, 1)
  if (pct > 0.01) {
    ctx.fillStyle = acc
    roundRect(ctx, PAD, y, Math.max(INNER * pct, 20), 10, 5); ctx.fill()
  }
  y += 24

  ctx.font = T.caption2.font; ctx.fillStyle = C.gray400
  ctx.fillText(`교회  ${(prayer.churches || 0).toLocaleString()}개`, PAD, y + 26)
  ctx.textAlign = 'right'
  ctx.fillText(`파송 선교사  ${prayer.missionaries || 0}명`, W - PAD, y + 26)
  ctx.textAlign = 'left'
  y += T.caption2.lh + 32

  // ── 구분선
  divider(ctx, y)
  y += 60

  // ── 기도 라벨 (accent 컬러)
  ctx.font = '700 20px Pretendard, -apple-system, sans-serif'
  ctx.fillStyle = acc
  ctx.letterSpacing = '3px'
  ctx.fillText('오늘의 기도', PAD, y)
  ctx.letterSpacing = '0px'
  y += T.caption1.lh + 28

  // ── 기도 제목
  ctx.fillStyle = C.gray800
  y += draw(ctx, T.title2, C.gray800, prayer.title || '', PAD, y, INNER)
  y += 48

  // ── 기도 본문
  y += draw(ctx, T.callout, C.gray600, prayer.body || '', PAD, y, INNER)
  y += 60

  // ── 말씀 박스
  const SBSP = 32
  const sbTop = y
  // 왼쪽 라인
  ctx.fillStyle = acc
  ctx.fillRect(PAD, sbTop, 5, scripBoxH)
  // 배경
  ctx.fillStyle = accSoft
  ctx.fillRect(PAD + 5, sbTop, INNER - 5, scripBoxH)

  y += SBSP
  ctx.font = '600 20px Pretendard, -apple-system, sans-serif'
  ctx.fillStyle = acc
  ctx.letterSpacing = '1px'
  ctx.fillText('말씀 · 개역개정', PAD + SBSP, y)
  ctx.letterSpacing = '0px'
  y += T.caption1.lh + 16

  if (prayer.scriptureText) {
    ctx.fillStyle = C.gray800
    ctx.font = T.body.font
    y += draw(ctx, T.body, C.gray800, `"${prayer.scriptureText}"`, PAD + SBSP, y, INNER - SBSP * 2)
    y += 16
  }

  ctx.font = T.subhead.font
  ctx.fillStyle = C.gray600
  ctx.textAlign = 'right'
  ctx.fillText(`— ${prayer.scripture || ''}`, W - PAD - SBSP, y)
  ctx.textAlign = 'left'
  y = sbTop + scripBoxH

  // ── 관련 소식 박스
  if (prayer.news && newsBoxH > 0) {
    y += 44
    const NBSP = 28
    const nbTop = y
    ctx.fillStyle = C.gray50
    ctx.strokeStyle = C.gray100
    ctx.lineWidth = 1
    roundRect(ctx, PAD, nbTop, INNER, newsBoxH, 14)
    ctx.fill(); ctx.stroke()

    y += NBSP
    ctx.font = '600 20px Pretendard, -apple-system, sans-serif'
    ctx.fillStyle = C.gray400
    ctx.fillText('📰  관련 소식', PAD + NBSP, y)
    y += T.caption1.lh + 16

    ctx.fillStyle = C.gray600
    y += draw(ctx, T.footnote, C.gray600, prayer.news, PAD + NBSP, y, INNER - NBSP * 2)
    y += 12

    ctx.font = T.caption2.font
    ctx.fillStyle = C.gray400
    ctx.fillText(`출처: ${prayer.newsSource || ''} · ${prayer.newsDate || ''}`, PAD + NBSP, y)
    y = nbTop + newsBoxH + 44
  } else {
    y += 44
  }

  // ── 푸터 구분선
  divider(ctx, y, 0, W, C.gray200, 1)
  y += 44

  // 출처 (좌)
  ctx.font = T.caption2.font; ctx.fillStyle = C.gray400
  ctx.fillText(`기도자료: ${prayer.prayerSource || ''}`, PAD, y + 26)
  ctx.fillText(`소식 출처: ${prayer.newsSource || ''} · ${prayer.newsDate || ''}`, PAD, y + 56)

  // 앱명 (우) — 작고 절제됨
  ctx.font = '500 26px Pretendard, -apple-system, sans-serif'
  ctx.fillStyle = C.gray800
  ctx.textAlign = 'right'
  ctx.fillText('열방을 위한 기도', W - PAD, y + 30)
  ctx.font = T.caption2.font
  ctx.fillStyle = C.gray400
  ctx.fillText('bleponation.netlify.app', W - PAD, y + 58)
  ctx.textAlign = 'left'

  y += 80 + 64

  // ── 하단 accent 바
  ctx.fillStyle = acc
  ctx.fillRect(0, H - 8, W, 8)

  // 저장
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `기도카드_${prayer.country}_${date}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
