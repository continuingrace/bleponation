// 기도카드 이미지 생성 - Canvas API 직접 사용 (모바일 호환)
// 9:16 비율 (1080 x 1920)

const W = 1080
const H = 1920

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split('')
  let line = ''
  let lines = []
  
  // 한국어는 글자 단위로 줄바꿈
  const chars = text.split('')
  let currentLine = ''
  
  for (let i = 0; i < chars.length; i++) {
    const testLine = currentLine + chars[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine)
      currentLine = chars[i]
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  
  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight)
  })
  
  return lines.length
}

function wrapWords(ctx, text, x, y, maxWidth, lineHeight) {
  // 띄어쓰기 기준 줄바꿈 (한국어 어절 단위)
  const words = text.split(' ')
  let line = ''
  let lines = []

  for (let i = 0; i < words.length; i++) {
    const testLine = line + (line ? ' ' : '') + words[i]
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = words[i]
    } else {
      line = testLine
    }
  }
  if (line) lines.push(line)

  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
  return lines.length
}

export async function generatePrayerCard(prayer, date) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const CAT_COLOR = {
    missionary: '#9B7B5A',
    nation: '#4E7C6E',
    mission: '#5E5E8A',
  }
  const CAT_LABEL = {
    missionary: '선교사',
    nation: '나라',
    mission: '선교',
  }

  const accent = CAT_COLOR[prayer.category] || '#9B7B5A'
  const catLabel = CAT_LABEL[prayer.category] || '기도'
  const PAD = 80

  // ── 배경
  ctx.fillStyle = '#FAFAF8'
  ctx.fillRect(0, 0, W, H)

  // ── 테두리
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, W - 3, H - 3)

  // ── 상단 바
  ctx.fillStyle = '#1E1C18'
  ctx.fillRect(0, 0, W, 10)

  // ── 하단 바
  ctx.fillStyle = '#1E1C18'
  ctx.fillRect(0, H - 10, W, 10)

  // ── 헤더: PRAYER FOR THE NATIONS
  ctx.fillStyle = '#C0B098'
  ctx.font = '500 28px "Pretendard", "Apple SD Gothic Neo", sans-serif'
  ctx.letterSpacing = '8px'
  ctx.fillText('PRAYER FOR THE NATIONS', PAD, 90)
  ctx.letterSpacing = '0px'

  // ── 날짜
  ctx.fillStyle = '#C0B098'
  ctx.font = '400 26px "Pretendard", sans-serif'
  ctx.fillText(date, PAD, 130)

  // ── 카테고리 배지
  const badgeX = W - PAD - 160
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  roundRect(ctx, badgeX, 70, 160, 50, 25)
  ctx.stroke()
  ctx.fillStyle = accent
  ctx.font = '600 26px "Pretendard", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(catLabel, badgeX + 80, 102)
  ctx.textAlign = 'left'

  // ── 구분선
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, 160)
  ctx.lineTo(W - PAD, 160)
  ctx.stroke()

  // ── 국기 이모지
  ctx.font = '120px serif'
  ctx.fillText(prayer.flag || '🌍', PAD, 320)

  // ── 지역
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 30px "Pretendard", sans-serif'
  ctx.fillText(prayer.region || '', PAD + 160, 255)

  // ── 국가명
  ctx.fillStyle = '#1E1C18'
  ctx.font = '900 96px "Pretendard", sans-serif'
  ctx.fillText(prayer.country || '', PAD + 160, 340)

  // ── 구분선
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, 380)
  ctx.lineTo(W - PAD, 380)
  ctx.stroke()

  // ── 나라 정보 박스
  const infoY = 400
  // 인구
  ctx.fillStyle = '#F0ECE4'
  roundRect(ctx, PAD, infoY, 300, 90, 12)
  ctx.fill()
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 22px "Pretendard", sans-serif'
  ctx.fillText('인구', PAD + 20, infoY + 35)
  ctx.fillStyle = '#3A3530'
  ctx.font = '600 24px "Pretendard", sans-serif'
  ctx.fillText(prayer.population || '-', PAD + 20, infoY + 65)

  // 종교
  ctx.fillStyle = '#F0ECE4'
  roundRect(ctx, PAD + 320, infoY, 540, 90, 12)
  ctx.fill()
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 22px "Pretendard", sans-serif'
  ctx.fillText('주요 종교', PAD + 340, infoY + 35)
  ctx.fillStyle = '#3A3530'
  ctx.font = '600 24px "Pretendard", sans-serif'
  ctx.fillText((prayer.religion || '-').substring(0, 18), PAD + 340, infoY + 65)

  // ── 복음화율 바
  const barY = 530
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 24px "Pretendard", sans-serif'
  ctx.fillText('복음화율', PAD, barY)
  ctx.fillStyle = '#1E1C18'
  ctx.font = '700 28px "Pretendard", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`${prayer.evangelicalRate}%`, W - PAD, barY)
  ctx.textAlign = 'left'

  // 바 배경
  ctx.fillStyle = '#E8E4DC'
  roundRect(ctx, PAD, barY + 14, W - PAD * 2, 12, 6)
  ctx.fill()
  // 바 채움
  const pct = Math.min((prayer.evangelicalRate / 30), 1)
  ctx.fillStyle = accent
  roundRect(ctx, PAD, barY + 14, (W - PAD * 2) * pct, 12, 6)
  ctx.fill()

  // 교회/선교사
  ctx.fillStyle = '#B0A898'
  ctx.font = '400 22px "Pretendard", sans-serif'
  ctx.fillText(`교회 수  ${(prayer.churches || 0).toLocaleString()}개`, PAD, barY + 52)
  ctx.textAlign = 'right'
  ctx.fillText(`파송 선교사  ${prayer.missionaries || 0}명`, W - PAD, barY + 52)
  ctx.textAlign = 'left'

  // ── 구분선
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, 630)
  ctx.lineTo(W - PAD, 630)
  ctx.stroke()

  // ── 기도제목 라벨
  ctx.fillStyle = accent
  ctx.font = '700 22px "Pretendard", sans-serif'
  ctx.letterSpacing = '3px'
  ctx.fillText('오늘의 기도', PAD, 680)
  ctx.letterSpacing = '0px'

  // ── 기도제목 제목
  ctx.fillStyle = '#1E1C18'
  ctx.font = '800 52px "Pretendard", sans-serif'
  const titleLines = wrapWords(ctx, prayer.title || '', PAD, 740, W - PAD * 2, 65)

  // ── 기도 본문
  const bodyY = 740 + titleLines * 65 + 30
  ctx.fillStyle = '#3A3530'
  ctx.font = '400 34px "Pretendard", sans-serif'
  const bodyLines = wrapWords(ctx, prayer.body || '', PAD, bodyY, W - PAD * 2, 56)

  // ── 말씀 박스
  const scripY = bodyY + bodyLines * 56 + 40
  ctx.fillStyle = '#F0ECE4'
  roundRect(ctx, PAD, scripY, W - PAD * 2, 160, 12)
  ctx.fill()
  // 왼쪽 라인
  ctx.fillStyle = accent
  ctx.fillRect(PAD, scripY, 5, 160)

  ctx.fillStyle = '#C0B098'
  ctx.font = '400 20px "Pretendard", sans-serif'
  ctx.fillText('말씀 · 개역개정', PAD + 24, scripY + 36)

  if (prayer.scriptureText) {
    ctx.fillStyle = '#3A3020'
    ctx.font = '400 28px "Pretendard", sans-serif'
    wrapWords(ctx, `"${prayer.scriptureText}"`, PAD + 24, scripY + 72, W - PAD * 2 - 48, 40)
  }

  ctx.fillStyle = '#A09070'
  ctx.font = '600 24px "Pretendard", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`— ${prayer.scripture || ''}`, W - PAD - 10, scripY + 148)
  ctx.textAlign = 'left'

  // ── 하단 구분선
  ctx.strokeStyle = '#E8E4DC'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, H - 160)
  ctx.lineTo(W - PAD, H - 160)
  ctx.stroke()

  // ── 출처
  ctx.fillStyle = '#C0B098'
  ctx.font = '400 22px "Pretendard", sans-serif'
  ctx.fillText(`기도자료: ${prayer.prayerSource || ''}`, PAD, H - 120)
  ctx.fillText(`소식 출처: ${prayer.newsSource || ''} · ${prayer.newsDate || ''}`, PAD, H - 86)

  // ── 앱 이름
  ctx.fillStyle = '#1E1C18'
  ctx.font = '900 44px "Pretendard", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('열방을 위한 기도', W - PAD, H - 100)
  ctx.fillStyle = '#C0B098'
  ctx.font = '400 22px "Pretendard", sans-serif'
  ctx.fillText('bleponation.netlify.app', W - PAD, H - 62)
  ctx.textAlign = 'left'

  // ── 저장
  const link = document.createElement('a')
  link.download = `기도카드_${prayer.country}_${date}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// 둥근 사각형 헬퍼
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
