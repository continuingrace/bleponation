// 기도카드 이미지 생성 - 동적 레이아웃 (9:16)
const W = 1080
const PAD = 72
const accent_colors = {
  missionary: '#9B7B5A',
  nation: '#4E7C6E',
  mission: '#5E5E8A',
}
const cat_labels = {
  missionary: '선교사',
  nation: '나라',
  mission: '선교',
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

// 텍스트를 maxWidth에 맞게 줄 배열로 분리
function getLines(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

// 여러 줄 텍스트 그리기 → 실제 그려진 높이 반환
function drawText(ctx, text, x, y, maxWidth, lineHeight, draw = true) {
  const lines = getLines(ctx, text, maxWidth)
  if (draw) lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
  return lines.length * lineHeight
}

export async function generatePrayerCard(prayer, date) {
  // 1패스: 전체 높이 계산
  const measureCanvas = document.createElement('canvas')
  measureCanvas.width = W
  measureCanvas.height = 100
  const mCtx = measureCanvas.getContext('2d')

  const accent = accent_colors[prayer.category] || '#9B7B5A'
  const catLabel = cat_labels[prayer.category] || '기도'
  const INNER = W - PAD * 2
  const LH_BODY = 58
  const LH_SMALL = 44

  // 각 섹션 높이 측정
  mCtx.font = '800 52px Pretendard, Apple SD Gothic Neo, sans-serif'
  const titleH = drawText(mCtx, prayer.title || '', PAD, 0, INNER, 64, false)

  mCtx.font = '400 34px Pretendard, Apple SD Gothic Neo, sans-serif'
  const bodyH = drawText(mCtx, prayer.body || '', PAD, 0, INNER, LH_BODY, false)

  mCtx.font = '400 28px Pretendard, Apple SD Gothic Neo, sans-serif'
  const scripTextH = prayer.scriptureText
    ? drawText(mCtx, `"${prayer.scriptureText}"`, PAD + 24, 0, INNER - 48, 42, false)
    : 0
  const scripBoxH = 40 + scripTextH + 52  // label + text + ref

  mCtx.font = '400 26px Pretendard, Apple SD Gothic Neo, sans-serif'
  const newsH = prayer.news
    ? drawText(mCtx, prayer.news, PAD + 24, 0, INNER - 48, 40, false)
    : 0
  const newsBoxH = newsH > 0 ? 36 + newsH + 44 : 0

  // 전체 높이 계산
  const HEADER_H = 180      // 상단바+헤더+구분선
  const COUNTRY_H = 220     // 국기+국가명
  const INFO_H = 110        // 인구/종교 박스
  const BAR_H = 90          // 복음화율 바
  const DIVIDER_H = 60      // 구분선+여백
  const PRAYER_LABEL_H = 60
  const FOOTER_H = 200      // 출처+앱명+하단바

  const totalH = HEADER_H + COUNTRY_H + INFO_H + BAR_H + DIVIDER_H +
    PRAYER_LABEL_H + titleH + 40 + bodyH + 50 +
    scripBoxH + 40 + (newsBoxH > 0 ? newsBoxH + 40 : 0) +
    FOOTER_H

  const H = Math.max(totalH, 1600)

  // 실제 캔버스
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // 배경
  ctx.fillStyle = '#FAFAF8'
  ctx.fillRect(0, 0, W, H)

  // 테두리
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, W - 3, H - 3)

  // 상단 바
  ctx.fillStyle = '#1E1C18'
  ctx.fillRect(0, 0, W, 10)

  let y = 60

  // 헤더
  ctx.fillStyle = '#C0B098'
  ctx.font = '500 24px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText('PRAYER FOR THE NATIONS', PAD, y)
  ctx.fillText(date, PAD, y + 36)

  // 카테고리 배지
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  roundRect(ctx, W - PAD - 150, y - 6, 150, 48, 24)
  ctx.stroke()
  ctx.fillStyle = accent
  ctx.font = '600 24px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(catLabel, W - PAD - 75, y + 24)
  ctx.textAlign = 'left'

  y += 70

  // 구분선
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
  y += 36

  // 국기
  ctx.font = '110px serif'
  ctx.fillText(prayer.flag || '🌍', PAD, y + 90)

  // 지역 + 국가명
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 28px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText(prayer.region || '', PAD + 148, y + 36)
  ctx.fillStyle = '#1E1C18'
  ctx.font = '900 88px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText(prayer.country || '', PAD + 148, y + 116)
  y += 150

  // 구분선
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
  y += 28

  // 인구 / 종교 박스
  ctx.fillStyle = '#F0ECE4'
  roundRect(ctx, PAD, y, 290, 82, 10); ctx.fill()
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 20px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText('인구', PAD + 18, y + 30)
  ctx.fillStyle = '#3A3530'
  ctx.font = '600 22px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText((prayer.population || '-').substring(0, 10), PAD + 18, y + 60)

  ctx.fillStyle = '#F0ECE4'
  roundRect(ctx, PAD + 310, y, INNER - 310, 82, 10); ctx.fill()
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 20px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText('주요 종교', PAD + 328, y + 30)
  ctx.fillStyle = '#3A3530'
  ctx.font = '600 22px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText((prayer.religion || '-').substring(0, 20), PAD + 328, y + 60)
  y += 100

  // 복음화율 바
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 22px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText('복음화율', PAD, y + 24)
  ctx.fillStyle = '#1E1C18'
  ctx.font = '700 26px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`${prayer.evangelicalRate}%`, W - PAD, y + 24)
  ctx.textAlign = 'left'
  y += 34

  ctx.fillStyle = '#E8E4DC'
  roundRect(ctx, PAD, y, INNER, 10, 5); ctx.fill()
  const pct = Math.min((prayer.evangelicalRate || 0) / 30, 1)
  ctx.fillStyle = accent
  if (pct > 0) { roundRect(ctx, PAD, y, INNER * pct, 10, 5); ctx.fill() }
  y += 20

  ctx.fillStyle = '#B0A898'
  ctx.font = '400 20px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText(`교회 수  ${(prayer.churches || 0).toLocaleString()}개`, PAD, y + 28)
  ctx.textAlign = 'right'
  ctx.fillText(`파송 선교사  ${prayer.missionaries || 0}명`, W - PAD, y + 28)
  ctx.textAlign = 'left'
  y += 52

  // 구분선
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
  y += 40

  // 기도 라벨
  ctx.fillStyle = accent
  ctx.font = '700 20px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText('오늘의 기도', PAD, y)
  y += 44

  // 기도 제목
  ctx.fillStyle = '#1E1C18'
  ctx.font = '800 52px Pretendard, Apple SD Gothic Neo, sans-serif'
  y += drawText(ctx, prayer.title || '', PAD, y, INNER, 64)
  y += 36

  // 기도 본문
  ctx.fillStyle = '#3A3530'
  ctx.font = '400 34px Pretendard, Apple SD Gothic Neo, sans-serif'
  y += drawText(ctx, prayer.body || '', PAD, y, INNER, LH_BODY)
  y += 48

  // 말씀 박스
  const scripStartY = y
  ctx.fillStyle = accent
  ctx.fillRect(PAD, scripStartY, 5, scripBoxH)
  ctx.fillStyle = '#F5F2EC'
  ctx.fillRect(PAD + 5, scripStartY, INNER - 5, scripBoxH)

  y += 28
  ctx.fillStyle = '#C0B098'
  ctx.font = '400 20px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText('말씀 · 개역개정', PAD + 24, y)
  y += 36

  if (prayer.scriptureText) {
    ctx.fillStyle = '#3A3020'
    ctx.font = '400 28px Pretendard, Apple SD Gothic Neo, sans-serif'
    y += drawText(ctx, `"${prayer.scriptureText}"`, PAD + 24, y, INNER - 48, 42)
    y += 12
  }

  ctx.fillStyle = '#A09070'
  ctx.font = '600 24px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`— ${prayer.scripture || ''}`, W - PAD - 10, y)
  ctx.textAlign = 'left'
  y = scripStartY + scripBoxH + 40

  // 관련 소식 박스
  if (prayer.news && newsBoxH > 0) {
    const newsStartY = y
    ctx.fillStyle = '#F2F4F8'
    roundRect(ctx, PAD, newsStartY, INNER, newsBoxH, 12); ctx.fill()
    y += 28
    ctx.fillStyle = '#A8B0C8'
    ctx.font = '600 20px Pretendard, Apple SD Gothic Neo, sans-serif'
    ctx.fillText('📰 관련 소식', PAD + 20, y)
    y += 36
    ctx.fillStyle = '#505070'
    ctx.font = '400 26px Pretendard, Apple SD Gothic Neo, sans-serif'
    y += drawText(ctx, prayer.news, PAD + 20, y, INNER - 40, 40)
    y += 10
    ctx.fillStyle = '#A8B0C8'
    ctx.font = '400 20px Pretendard, Apple SD Gothic Neo, sans-serif'
    ctx.fillText(`출처: ${prayer.newsSource || ''} · ${prayer.newsDate || ''}`, PAD + 20, y)
    y = newsStartY + newsBoxH + 40
  }

  // 구분선
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
  y += 30

  // 출처
  ctx.fillStyle = '#C0B098'
  ctx.font = '400 20px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText(`기도자료: ${prayer.prayerSource || ''}`, PAD, y + 26)
  ctx.fillText(`소식 출처: ${prayer.newsSource || ''} · ${prayer.newsDate || ''}`, PAD, y + 56)

  // 앱 이름
  ctx.fillStyle = '#1E1C18'
  ctx.font = '900 42px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('열방을 위한 기도', W - PAD, y + 36)
  ctx.fillStyle = '#C0B098'
  ctx.font = '400 20px Pretendard, Apple SD Gothic Neo, sans-serif'
  ctx.fillText('bleponation.netlify.app', W - PAD, y + 64)
  ctx.textAlign = 'left'

  y += 90

  // 하단 바
  ctx.fillStyle = '#1E1C18'
  ctx.fillRect(0, H - 10, W, 10)

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
