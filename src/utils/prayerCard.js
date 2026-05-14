// 기도카드 이미지 생성 (9:16 비율)
export async function generatePrayerCard(prayer, date) {
  const { default: html2canvas } = await import('html2canvas')

  // 카드 DOM 생성
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed; left: -9999px; top: -9999px;
    width: 1080px; height: 1920px;
    font-family: 'Pretendard', 'Google Sans', 'Apple SD Gothic Neo', sans-serif;
    background: #FAFAF8;
    overflow: hidden;
  `

  const cat = {
    missionary: { label: '선교사', color: '#9B7B5A' },
    nation:     { label: '나라',   color: '#4E7C6E' },
    mission:    { label: '선교',   color: '#5E5E8A' },
  }[prayer.category] || { label: '기도', color: '#555' }

  const urgencyLabel = { high: '긴급', medium: '중요', low: '지속' }[prayer.urgency] || ''
  const pct = Math.min((prayer.evangelicalRate / 30) * 100, 100).toFixed(1)

  container.innerHTML = `
    <div style="
      width: 1080px; height: 1920px;
      background: #FAFAF8;
      border: 3px solid #E8E4DC;
      display: flex; flex-direction: column;
      position: relative;
    ">
      <!-- Top accent bar -->
      <div style="width: 100%; height: 8px; background: #1E1C18;"></div>

      <!-- Header -->
      <div style="padding: 64px 80px 0; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-size: 26px; letter-spacing: 0.18em; color: #C0B098; font-weight: 500;">PRAYER FOR THE NATIONS</div>
          <div style="font-size: 22px; color: #C0B098; margin-top: 8px;">${date}</div>
        </div>
        <div style="text-align: right;">
          <div style="
            display: inline-block;
            font-size: 22px; font-weight: 600; color: ${cat.color};
            border: 2px solid ${cat.color};
            padding: 6px 24px; border-radius: 99px;
          ">${cat.label}</div>
          ${prayer.unreached ? `<div style="font-size:20px; color:#C07070; margin-top:8px;">미전도 종족</div>` : ''}
        </div>
      </div>

      <!-- Divider -->
      <div style="margin: 48px 80px 0; height: 1px; background: #E8E4DC;"></div>

      <!-- Country -->
      <div style="padding: 56px 80px 0; display: flex; align-items: center; gap: 36px;">
        <div style="font-size: 120px; line-height: 1;">${prayer.flag}</div>
        <div>
          <div style="font-size: 28px; color: #B0A898; letter-spacing: 0.06em; margin-bottom: 10px;">${prayer.region}</div>
          <div style="font-size: 88px; font-weight: 800; color: #1E1C18; letter-spacing: -0.04em; line-height: 1;">${prayer.country}</div>
        </div>
      </div>

      <!-- Info row -->
      <div style="padding: 32px 80px 0; display: flex; gap: 24px;">
        <div style="background: #F0ECE4; border-radius: 12px; padding: 20px 28px; flex: 1;">
          <div style="font-size: 20px; color: #B0A898; margin-bottom: 6px;">인구</div>
          <div style="font-size: 24px; font-weight: 600; color: #3A3530;">${prayer.population}</div>
        </div>
        <div style="background: #F0ECE4; border-radius: 12px; padding: 20px 28px; flex: 2;">
          <div style="font-size: 20px; color: #B0A898; margin-bottom: 6px;">주요 종교</div>
          <div style="font-size: 24px; font-weight: 600; color: #3A3530;">${prayer.religion}</div>
        </div>
      </div>

      <!-- Evangelical rate bar -->
      <div style="padding: 32px 80px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div style="font-size: 22px; color: #B0A898;">복음화율</div>
          <div style="font-size: 26px; font-weight: 700; color: #1E1C18;">${prayer.evangelicalRate}%</div>
        </div>
        <div style="height: 10px; background: #E8E4DC; border-radius: 99px; overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background: ${cat.color}; border-radius: 99px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 16px;">
          <div style="font-size: 20px; color: #B0A898;">교회 수 <span style="color:#3A3530; font-weight:600;">${prayer.churches.toLocaleString()}개</span></div>
          <div style="font-size: 20px; color: #B0A898;">파송 선교사 <span style="color:#3A3530; font-weight:600;">${prayer.missionaries}명</span></div>
        </div>
      </div>

      <!-- Divider -->
      <div style="margin: 48px 80px 0; height: 1px; background: #E8E4DC;"></div>

      <!-- Prayer title -->
      <div style="padding: 48px 80px 0;">
        <div style="font-size: 22px; font-weight: 600; color: ${cat.color}; letter-spacing: 0.1em; margin-bottom: 20px;">오늘의 기도</div>
        <div style="font-size: 46px; font-weight: 800; color: #1E1C18; line-height: 1.35; letter-spacing: -0.02em;">${prayer.title}</div>
      </div>

      <!-- Prayer body -->
      <div style="padding: 36px 80px 0;">
        <div style="font-size: 34px; color: #3A3530; line-height: 1.85; word-break: keep-all;">${prayer.body}</div>
      </div>

      <!-- Scripture -->
      <div style="padding: 40px 80px 0;">
        <div style="
          background: #F0ECE4; border-left: 5px solid ${cat.color};
          padding: 24px 36px; border-radius: 0 12px 12px 0;
        ">
          <div style="font-size: 22px; color: #B0A898; margin-bottom: 8px;">말씀</div>
          <div style="font-size: 28px; color: #5A4E3A; font-style: italic; font-weight: 500;">${prayer.scripture}</div>
        </div>
      </div>

      <!-- Spacer -->
      <div style="flex: 1;"></div>

      <!-- Source & date footer -->
      <div style="padding: 0 80px; margin-bottom: 20px;">
        <div style="height: 1px; background: #E8E4DC; margin-bottom: 28px;"></div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 20px; color: #C0B098; margin-bottom: 6px;">기도자료 출처</div>
            <div style="font-size: 22px; font-weight: 600; color: #7A6E60;">${prayer.prayerSource}</div>
            <div style="font-size: 20px; color: #C0B098; margin-top: 6px;">관련 소식: ${prayer.newsSource} · ${prayer.newsDate}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 48px; font-weight: 900; color: #1E1C18; letter-spacing: -0.04em;">열방을 위한 기도</div>
            <div style="font-size: 20px; color: #C0B098; margin-top: 4px;">nations-prayer.netlify.app</div>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div style="width: 100%; height: 8px; background: #1E1C18;"></div>
    </div>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container.firstChild, {
      width: 1080,
      height: 1920,
      scale: 1,
      useCORS: true,
      backgroundColor: '#FAFAF8',
      logging: false,
    })

    const link = document.createElement('a')
    link.download = `기도카드_${prayer.country}_${date}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    document.body.removeChild(container)
  }
}
