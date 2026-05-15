import { useState } from 'react'
import { generatePrayerCard } from '../utils/prayerCard'
import { dateKey } from '../utils/storage'

const CAT = {
  missionary: { label: '선교사', color: '#C13B3B', bg: '#F9ECEC', border: '#E8C4C4' },
  nation:     { label: '나라',   color: '#1A6B9A', bg: '#EAF2F8', border: '#B8D4E8' },
  mission:    { label: '선교',   color: '#1E7E5E', bg: '#EAF4EF', border: '#B8DDD0' },
}

const URGENCY = {
  high:   { label: '긴급', color: '#B85450' },
  medium: { label: '중요', color: '#9B7B5A' },
  low:    { label: '지속', color: '#4E7C6E' },
}

function MiniBar({ value, max = 30, color, label, suffix = '%' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#AAA' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 5, background: '#EDEBE6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

export default function PrayerCard({ prayer, prayed, onToggle, idx, todayStr }) {
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const cat = CAT[prayer.category] || CAT.mission
  const urg = URGENCY[prayer.urgency] || URGENCY.medium

  const handleDownload = async (e) => {
    e.stopPropagation()
    setDownloading(true)
    try {
      await generatePrayerCard(prayer, todayStr)
    } catch (err) {
      alert('카드 생성 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{
      background: '#FFF',
      border: `1px solid ${open ? cat.border : '#EDEAE3'}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: open ? '0 6px 24px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease',
      animation: `fadeUp 0.45s ease ${idx * 0.1}s both`,
    }}>
      {/* Top accent */}
      <div style={{ height: 3, background: cat.color, opacity: 0.7 }} />

      {/* Header — clickable */}
      <div onClick={() => setOpen(!open)} style={{ padding: '18px 20px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 11 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`, padding: '2px 9px', borderRadius: 20 }}>
                {cat.label}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: urg.color, background: '#FAF8F4', border: `1px solid ${urg.color}30`, padding: '2px 9px', borderRadius: 20 }}>
                {urg.label}
              </span>
              {prayer.unreached && (
                <span style={{ fontSize: 10, color: '#999', background: '#F5F5F5', border: '1px solid #E8E8E8', padding: '2px 9px', borderRadius: 20 }}>
                  미전도
                </span>
              )}
            </div>

            {/* Flag + Country */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <img
                src={`https://flagcdn.com/w40/${getCountryCode(prayer.countryEn)}.png`}
                srcSet={`https://flagcdn.com/w80/${getCountryCode(prayer.countryEn)}.png 2x`}
                alt={prayer.country}
                width={28} height={20}
                style={{ borderRadius: 3, objectFit: 'cover', border: '1px solid #E8E4DC', flexShrink: 0 }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <div>
                <div style={{ fontSize: 10, color: '#C0B8A8' }}>{prayer.region}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1E1C18', letterSpacing: '-0.03em' }}>{prayer.country}</div>
              </div>
            </div>

            {/* Title */}
            <div style={{ fontSize: 14, fontWeight: 600, color: '#3A3530', lineHeight: 1.5 }}>
              {prayer.title}
            </div>
          </div>

          {/* Chevron */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: open ? cat.bg : '#F7F5F0',
            border: `1px solid ${open ? cat.border : '#E8E4DC'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.25s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke={open ? cat.color : '#AAA'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: '1px solid #F0ECE5' }}>

          {/* Country info */}
          <div style={{ padding: '16px 20px', background: cat.bg }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: cat.color, marginBottom: 10 }}>나라 정보</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {[['인구', prayer.population], ['주요 종교', prayer.religion]].map(([l, v]) => (
                <div key={l} style={{ background: '#FFF', border: `1px solid ${cat.border}`, borderRadius: 8, padding: '7px 12px', flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 9, color: '#BBB', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#444' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Infographic */}
            <div style={{ background: '#FFF', border: `1px solid ${cat.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
                {[
                  { l: '복음화율', v: `${prayer.evangelicalRate}%` },
                  { l: '교회 수', v: prayer.churches >= 10000 ? `${(prayer.churches/10000).toFixed(0)}만+` : `${prayer.churches.toLocaleString()}개` },
                  { l: '파송 선교사', v: `${prayer.missionaries}명` },
                ].map(({ l, v }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: cat.color }}>{v}</div>
                    <div style={{ fontSize: 9, color: '#AAA', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <MiniBar value={prayer.evangelicalRate} max={30} color={cat.color} label="복음화율 (전 세계 평균 ~33%)" />
              <MiniBar value={Math.min(prayer.missionaries, 1000)} max={1000} color="#A0B8C8" label="파송 선교사 (1,000명 기준)" suffix="명" />
            </div>

            {prayer.countryInfo && (
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.75, margin: 0 }}>{prayer.countryInfo}</p>
            )}
          </div>

          {/* Prayer */}
          <div style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#B0A898', marginBottom: 10 }}>오늘의 기도</div>
            <p style={{ fontSize: 14, color: '#2A2520', lineHeight: 1.9, marginBottom: 16, wordBreak: 'keep-all' }}>
              {prayer.body}
            </p>

            {/* Scripture */}
            <div style={{ background: '#FAF8F3', borderLeft: `3px solid ${cat.color}`, padding: '12px 14px', borderRadius: '0 8px 8px 0', marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: '#C0B098', letterSpacing: '0.06em', marginBottom: 8 }}>말씀 · 개역개정</div>
              {prayer.scriptureText && (
                <div style={{ fontSize: 13, color: '#3A3020', lineHeight: 1.8, marginBottom: 8, wordBreak: 'keep-all' }}>
                  &ldquo;{prayer.scriptureText}&rdquo;
                </div>
              )}
              <div style={{ fontSize: 11, color: '#A09070', fontWeight: 600 }}>— {prayer.scripture}</div>
            </div>

            {/* News */}
            <div style={{ background: '#F7F8FC', border: '1px solid #E4E8F0', borderRadius: 10, padding: '11px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: '#A8B0C8', letterSpacing: '0.06em', marginBottom: 6 }}>📰 관련 소식</div>
              <p style={{ fontSize: 12, color: '#505070', lineHeight: 1.75, margin: '0 0 6px', wordBreak: 'keep-all' }}>{prayer.news}</p>
              <div style={{ fontSize: 10, color: '#A8B0C8' }}>
                출처: <strong style={{ color: '#7880A0' }}>{prayer.newsSource}</strong>
                <span style={{ margin: '0 6px', color: '#D0D4E0' }}>·</span>
                {prayer.newsDate}
              </div>
            </div>

            {/* Source */}
            <div style={{ fontSize: 10, color: '#C8C0B4', marginBottom: 16 }}>
              기도자료: <span style={{ color: '#A09080' }}>{prayer.prayerSource}</span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  background: 'transparent',
                  border: '1.5px solid #D8D2C8',
                  color: '#888', padding: '8px 16px',
                  borderRadius: 24, fontSize: 12, fontWeight: 500,
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  opacity: downloading ? 0.6 : 1,
                }}
              >
                {downloading ? '생성 중…' : '📥 카드 저장'}
              </button>
              <button
                onClick={() => onToggle(prayer.id || prayer.country)}
                style={{
                  background: prayed ? cat.color : 'transparent',
                  border: `1.5px solid ${prayed ? cat.color : '#D8D2C8'}`,
                  color: prayed ? '#FFF' : '#888',
                  padding: '8px 20px', borderRadius: 24,
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                {prayed ? '🙏 기도했습니다' : '기도하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// countryEn → ISO 2자리 코드 변환
function getCountryCode(countryEn = '') {
  const map = {
    'Iran': 'ir', 'Afghanistan': 'af', 'North Korea': 'kp', 'China': 'cn',
    'India': 'in', 'Indonesia': 'id', 'Ethiopia': 'et', 'Myanmar': 'mm',
    'Morocco': 'ma', 'Japan': 'jp', 'Somalia': 'so', 'Brazil': 'br',
    'Pakistan': 'pk', 'Saudi Arabia': 'sa', 'Turkey': 'tr', 'Egypt': 'eg',
    'Nigeria': 'ng', 'Sudan': 'sd', 'Syria': 'sy', 'Iraq': 'iq',
    'Yemen': 'ye', 'Libya': 'ly', 'Algeria': 'dz', 'Tunisia': 'tn',
    'Bangladesh': 'bd', 'Nepal': 'np', 'Sri Lanka': 'lk', 'Cambodia': 'kh',
    'Vietnam': 'vn', 'Thailand': 'th', 'Laos': 'la', 'Mongolia': 'mn',
    'Kazakhstan': 'kz', 'Uzbekistan': 'uz', 'Tajikistan': 'tj',
    'Kyrgyzstan': 'kg', 'Turkmenistan': 'tm', 'Azerbaijan': 'az',
    'Kenya': 'ke', 'Tanzania': 'tz', 'Uganda': 'ug', 'Rwanda': 'rw',
    'Ghana': 'gh', 'Senegal': 'sn', 'Mali': 'ml', 'Burkina Faso': 'bf',
    'Niger': 'ne', 'Chad': 'td', 'Guinea': 'gn', 'Sierra Leone': 'sl',
  }
  return map[countryEn] || 'un'
}
