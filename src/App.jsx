import { useState, useEffect, useCallback } from 'react'
import PrayerCard from './components/PrayerCard'
import Calendar, { BackupRestore } from './components/Calendar'
import HistoryView from './components/HistoryView'
import { loadStorage, saveStorage, dateKey, formatDateKO } from './utils/storage'

// ─── STYLES ──────────────────────────────────────────────────────────────────
const globalStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  button { font-family: 'Pretendard', 'Google Sans', sans-serif; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
`

// ─── FALLBACK DATA (오프라인 또는 API 실패 시) ───────────────────────────────
const FALLBACK = {
  date: dateKey(),
  intro: '오늘도 열방 가운데 하나님의 나라가 임하기를 기도합니다',
  prayers: [
    {
      id: 'iran', category: 'missionary', country: '이란', countryEn: 'Iran',
      flag: '🇮🇷', region: '중동', population: '약 8,870만 명',
      religion: '이슬람(시아파) 98%', evangelicalRate: 0.3, churches: 300, missionaries: 12,
      unreached: true, urgency: 'high',
      title: '지하 교회를 위한 보호',
      body: '이란 내 가정교회 성도들이 당국의 감시와 체포 위협 속에서도 믿음을 지키고, 무슬림 배경 신자들이 담대히 설 수 있도록 기도합니다.',
      countryInfo: '이란은 세계에서 가장 빠르게 기독교가 성장하는 나라 중 하나입니다. 수천 개의 가정교회가 지하에서 운영 중입니다.',
      news: '2024년 이란 당국이 수도 테헤란과 이스파한에서 가정교회 지도자 수십 명을 체포했습니다.',
      newsSource: '순교자의 소리 Korea', newsDate: '2024-11',
      scripture: '마태복음 10:28', scriptureText: '몸은 죽여도 영혼은 능히 죽이지 못하는 자들을 두려워하지 말고 오직 몸과 영혼을 능히 지옥에 멸하실 수 있는 이를 두려워하라', prayerSource: 'Operation World',
    },
    {
      id: 'afghanistan', category: 'nation', country: '아프가니스탄', countryEn: 'Afghanistan',
      flag: '🇦🇫', region: '중앙아시아', population: '약 4,200만 명',
      religion: '이슬람 99.9%', evangelicalRate: 0.01, churches: 10, missionaries: 3,
      unreached: true, urgency: 'high',
      title: '탈레반 통치 하 성도들',
      body: '2021년 탈레반 재집권 이후 모든 교회가 강제 폐쇄된 아프가니스탄에서 비밀리에 신앙을 지키는 성도들의 안전과 복음 전파를 위해 기도합니다.',
      countryInfo: '아프가니스탄은 세계에서 기독교인에게 가장 위험한 나라 1위입니다. 성경 소지만으로도 사형에 처할 수 있습니다.',
      news: '오픈도어즈 2025 박해지수에서 아프가니스탄은 3년 연속 최상위를 기록했습니다.',
      newsSource: 'Open Doors Korea', newsDate: '2025-01',
      scripture: '요한복음 16:33', scriptureText: '이것을 너희에게 이르는 것은 너희로 내 안에서 평안을 누리게 하려 함이라 세상에서는 너희가 환난을 당하나 담대하라 내가 세상을 이기었노라', prayerSource: 'Operation World',
    },
    {
      id: 'north_korea', category: 'mission', country: '북한', countryEn: 'North Korea',
      flag: '🇰🇵', region: '동아시아', population: '약 2,600만 명',
      religion: '주체사상(무신론)', evangelicalRate: 0.1, churches: 5, missionaries: 0,
      unreached: true, urgency: 'high',
      title: '비밀 성도와 선교 통로',
      body: '한반도 북쪽 동포들 가운데 비밀 신자들이 서로 격려하며, 라디오 방송·탈북자 네트워크를 통한 복음 통로가 계속 열리도록 기도합니다.',
      countryInfo: '북한은 지구상 마지막 완전 폐쇄 국가입니다. 성경 소지 시 정치범 수용소 수감이 가능합니다.',
      news: '극동방송(FEBC)이 2024년 북한을 향한 한국어 라디오 방송을 하루 20시간으로 확대했습니다.',
      newsSource: '극동방송 / GMS', newsDate: '2024-09',
      scripture: '이사야 60:2', scriptureText: '보라 어둠이 땅을 덮을 것이며 캄캄함이 만민을 가리려니와 오직 여호와께서 네 위에 임하실 것이며 그의 영광이 네 위에 나타나리니', prayerSource: 'GMS 총회선교회',
    },
  ],
}

// ─── API CALL ────────────────────────────────────────────────────────────────
async function fetchPrayers(adminKey = '') {
  const url = adminKey
    ? `/api/get-prayers?admin_key=${encodeURIComponent(adminKey)}`
    : '/api/get-prayers'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('today')
  const [prayers, setPrayers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [storageData, setStorageData] = useState(() => loadStorage())
  const [selectedDate, setSelectedDate] = useState(null)

  // Admin
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [adminError, setAdminError] = useState('')
  const [generating, setGenerating] = useState(false)

  const today = new Date()
  const todayStr = dateKey(today)
  const todayPrayers = prayers?.prayers || []
  const todayPrayed = storageData[todayStr]?.prayed || []

  // 로컬 캐시 키
  const localCacheKey = `prayer_data_${todayStr}`

  // 기도제목 불러오기
  const loadPrayers = useCallback(async (adminKey = '') => {
    // 로컬 캐시 확인 (강제 갱신 아닐 때)
    if (!adminKey) {
      try {
        const cached = localStorage.getItem(localCacheKey)
        if (cached) {
          setPrayers(JSON.parse(cached))
          setLoading(false)
          return
        }
      } catch {}
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchPrayers(adminKey)
      setPrayers(data)
      // 로컬에도 캐시
      try { localStorage.setItem(localCacheKey, JSON.stringify(data)) } catch {}
    } catch (err) {
      console.error(err)
      // API 실패 시 폴백 데이터 사용
      if (!prayers) {
        setPrayers(FALLBACK)
        setError('서버 연결 실패 — 기본 기도제목을 표시합니다')
      }
    } finally {
      setLoading(false)
    }
  }, [localCacheKey])

  useEffect(() => { loadPrayers() }, [loadPrayers])

  // 기도 토글
  const handleToggle = (prayerId) => {
    setStorageData(prev => {
      const next = { ...prev }
      if (!next[todayStr]) next[todayStr] = { prayed: [] }
      const list = next[todayStr].prayed
      next[todayStr].prayed = list.includes(prayerId)
        ? list.filter(id => id !== prayerId)
        : [...list, prayerId]
      saveStorage(next)
      return next
    })
  }

  // 백업 복구
  const handleRestore = (restoredData) => {
    setStorageData(restoredData)
    saveStorage(restoredData)
  }

  // 관리자 새로 생성
  const handleAdminGenerate = async () => {
    if (!adminKey.trim()) { setAdminError('비밀번호를 입력하세요'); return }
    setGenerating(true)
    setAdminError('')
    try {
      await loadPrayers(adminKey)
      setShowAdminModal(false)
      setAdminKey('')
    } catch {
      setAdminError('비밀번호가 올바르지 않거나 생성에 실패했습니다')
    } finally {
      setGenerating(false)
    }
  }

  // 달력에서 날짜 선택 시 해당 날 데이터
  const selectedPrayers = selectedDate && dateKey(selectedDate) === todayStr
    ? todayPrayers
    : null  // 과거 날짜는 캐시에서 복원 (추후 확장 가능)

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: "'Pretendard', 'Google Sans', 'Apple SD Gothic Neo', sans-serif" }}>
      <style>{globalStyles}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '44px 16px 80px' }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 32, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#C0B098', fontWeight: 600, marginBottom: 8 }}>
            PRAYER FOR THE NATIONS
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#1E1C18', letterSpacing: '-0.04em', marginBottom: 8 }}>
            열방을 위한 기도
          </h1>
          <p style={{ fontSize: 12, color: '#B0A898', fontStyle: 'italic', lineHeight: 1.7 }}>
            "온 땅이 주를 경배하고 주를 찬양하며" — 시편 66:4
          </p>
        </div>

        {/* ── TODAY STATUS BAR ── */}
        <div style={{
          background: '#FFF', borderRadius: 14,
          border: '1px solid #EDE8E0', padding: '14px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, animation: 'fadeUp 0.5s ease 0.05s both',
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#C0B8A8', marginBottom: 3 }}>{formatDateKO(today)}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3A3530' }}>
              오늘 {todayPrayed.length}/3 기도 완료
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Progress circles */}
            <div style={{ display: 'flex', gap: 5 }}>
              {['#7247C8', '#7247C8', '#7247C8'].map((color, i) => {
                const p = todayPrayers[i]
                const done = p && todayPrayed.includes(p.id || p.country)
                return (
                  <div key={i} style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: done ? color : '#F0ECE5',
                    border: `2px solid ${done ? color : '#E0DACE'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#FFF', fontWeight: 700,
                    transition: 'all 0.2s',
                  }}>
                    {done ? '✓' : ''}
                  </div>
                )
              })}
            </div>

            {/* Admin button */}
            <button
              onClick={() => setShowAdminModal(true)}
              title="관리자 — 새로 생성"
              style={{
                background: 'transparent', border: '1.5px solid #E0DACE',
                borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                fontSize: 14, color: '#B0A898',
              }}
            >↺</button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: '#FEF3F0', border: '1px solid #F0C8B8',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            fontSize: 12, color: '#9A5040',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{
          display: 'flex', background: '#EDEAE2', borderRadius: 12,
          padding: 3, marginBottom: 20, animation: 'fadeUp 0.5s ease 0.1s both',
        }}>
          {[['today', '오늘의 기도'], ['calendar', '기도 달력']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSelectedDate(null) }}
              style={{
                flex: 1, padding: '9px', borderRadius: 10, border: 'none',
                cursor: 'pointer',
                background: tab === id ? '#FFF' : 'transparent',
                color: tab === id ? '#2A2520' : '#AAA',
                fontSize: 13, fontWeight: tab === id ? 700 : 500,
                boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >{label}</button>
          ))}
        </div>

        {/* ── TODAY TAB ── */}
        {tab === 'today' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Intro */}
            {prayers?.intro && !loading && (
              <div style={{
                background: '#FFFDF9', border: '1px solid #EDE8DF',
                borderRadius: 12, padding: '13px 16px', textAlign: 'center',
                animation: 'fadeUp 0.5s ease 0.1s both',
              }}>
                <p style={{ fontSize: 13, color: '#8A7D6E', lineHeight: 1.7, fontStyle: 'italic' }}>
                  🕊 {prayers.intro}
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    height: 100, borderRadius: 16, background: '#F2EFE9',
                    animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
                    opacity: 0.6,
                  }} />
                ))}
              </div>
            )}

            {/* Cards */}
            {!loading && todayPrayers.map((p, i) => (
              <PrayerCard
                key={p.id || i}
                prayer={p}
                prayed={todayPrayed.includes(p.id || p.country)}
                onToggle={handleToggle}
                idx={i}
                todayStr={todayStr}
              />
            ))}

            {/* Sources */}
            {!loading && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ fontSize: 11, color: '#B0A898', textAlign: 'center', padding: '10px', cursor: 'pointer', listStyle: 'none' }}>
                  ▾ 기도 자료 출처
                </summary>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                  {[
                    ['🌍', 'Operation World', 'https://operationworld.org'],
                    ['🕊️', 'Joshua Project', 'https://joshuaproject.net'],
                    ['✝️', 'OMF International Korea', 'https://omf.org/kr'],
                    ['⛪', 'GMS 총회선교회', 'https://gms.kr'],
                    ['🤝', 'KWMA', 'https://kwma.org'],
                    ['🕯️', '순교자의 소리', 'https://vomkorea.com'],
                  ].map(([icon, name, url]) => (
                    <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '9px 12px', background: '#FFF',
                        border: '1px solid #EDE8E0', borderRadius: 10,
                        textDecoration: 'none', color: '#666', fontSize: 11, fontWeight: 500,
                      }}
                    >{icon} {name}</a>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {tab === 'calendar' && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Calendar
              storageData={storageData}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            {selectedDate
              ? <HistoryView date={selectedDate} prayers={selectedPrayers} storageData={storageData} />
              : <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: '#C0B8A8' }}>
                  날짜를 선택하면 그 날의 기도 기록을 볼 수 있습니다
                </div>
            }
            <BackupRestore storageData={storageData} onRestore={handleRestore} />
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 40, textAlign: 'center', borderTop: '1px solid #EDE8E0', paddingTop: 20 }}>
          <p style={{ fontSize: 10, color: '#C8C0B4', lineHeight: 2 }}>
            기도제목은 매일 자정 자동 갱신됩니다<br />
            Operation World · Joshua Project · OMF · GMS · KWMA · VOM 자료 기반
          </p>
        </div>
      </div>

      {/* ── ADMIN MODAL ── */}
      {showAdminModal && (
        <div
          onClick={() => { setShowAdminModal(false); setAdminKey(''); setAdminError('') }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFF', borderRadius: 20, padding: '28px 24px',
              width: '100%', maxWidth: 360,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E1C18', marginBottom: 6 }}>관리자 — 새로 생성</h2>
            <p style={{ fontSize: 12, color: '#AAA', marginBottom: 20, lineHeight: 1.6 }}>
              오늘의 기도제목을 Claude AI로 새로 생성합니다.<br />
              관리자 비밀번호를 입력하세요.
            </p>
            <input
              type="password"
              placeholder="관리자 비밀번호"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminGenerate()}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${adminError ? '#E07070' : '#E0DACE'}`,
                fontSize: 14, fontFamily: 'inherit',
                outline: 'none', marginBottom: adminError ? 8 : 16,
                background: '#FAF8F4',
              }}
            />
            {adminError && (
              <div style={{ fontSize: 11, color: '#C07060', marginBottom: 14 }}>{adminError}</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowAdminModal(false); setAdminKey(''); setAdminError('') }}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10,
                  border: '1.5px solid #E0DACE', background: 'transparent',
                  color: '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >취소</button>
              <button
                onClick={handleAdminGenerate}
                disabled={generating}
                style={{
                  flex: 2, padding: '11px', borderRadius: 10,
                  border: 'none', background: generating ? '#C0B8A8' : '#1E1C18',
                  color: '#FFF', fontSize: 13, fontWeight: 700,
                  cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {generating && <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>↺</span>}
                {generating ? '생성 중…' : '새로 생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
