import { useState } from 'react'
import { dateKey, formatMonthKO } from '../utils/storage'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar({ storageData, selectedDate, onSelectDate }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d)
    const key = dateKey(date)
    const record = storageData[key]
    cells.push({ d, date, key, prayedCount: record?.prayed?.length || 0 })
  }

  const selKey = selectedDate ? dateKey(selectedDate) : null
  const todayKey = dateKey(today)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #EDE8E0', padding: '18px 20px', marginBottom: 16 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={prevMonth} style={navBtn}>‹</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2A2520' }}>
          {formatMonthKO(viewYear, viewMonth)}
        </div>
        <button onClick={nextMonth} style={navBtn}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 600, padding: '4px 0',
            color: i === 0 ? '#C07070' : i === 6 ? '#7090C0' : '#C0B8A8'
          }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />

          const isToday = cell.key === todayKey
          const isSel = cell.key === selKey
          const dow = cell.date.getDay()

          return (
            <div
              key={cell.key}
              onClick={() => onSelectDate(isSel ? null : cell.date)}
              style={{
                textAlign: 'center', padding: '7px 2px', borderRadius: 10,
                cursor: 'pointer', position: 'relative',
                background: isSel ? '#1E1C18' : isToday ? '#F3EDE3' : 'transparent',
                border: isToday && !isSel ? '1.5px solid #D8C8A8' : '1.5px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                fontSize: 13, fontWeight: isSel || isToday ? 700 : 400,
                color: isSel ? '#FFF' : isToday ? '#8A6A40' : dow === 0 ? '#C07070' : dow === 6 ? '#7090C0' : '#444',
                lineHeight: 1,
              }}>{cell.d}</div>

              {/* Dot indicators */}
              {cell.prayedCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}>
                  {[...Array(Math.min(cell.prayedCount, 3))].map((_, j) => (
                    <div key={j} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: isSel ? '#FFF8' : '#9B7B5A88',
                    }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid #F0ECE5' }}>
        {[
          { color: '#9B7B5A88', label: '기도 기록 있음' },
          { color: '#D8C8A8', label: '오늘', border: true },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, border: border ? `1.5px solid ${color}` : 'none' }} />
            <span style={{ fontSize: 10, color: '#B0A898' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const navBtn = {
  background: 'none', border: '1px solid #E8E4DC',
  borderRadius: 8, padding: '4px 12px',
  cursor: 'pointer', fontSize: 16, color: '#888',
  fontFamily: 'inherit',
}

// ── 백업/복구 컴포넌트
export function BackupRestore({ storageData, onRestore }) {
  const fileInputRef = { current: null }

  const handleExport = () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: '열방을 위한 기도',
      data: storageData,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `열방기도_백업_${new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        // 버전 1 형식 확인
        if (parsed.version === 1 && parsed.data) {
          if (window.confirm(`백업 파일을 복구하시겠습니까?\n(${parsed.exportedAt?.slice(0,10)} 기록)`)) {
            onRestore(parsed.data)
            alert('기도 기록이 복구되었습니다 🙏')
          }
        } else {
          alert('올바른 백업 파일이 아닙니다.')
        }
      } catch {
        alert('파일을 읽는 중 오류가 발생했습니다.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div style={{
      background: '#FFF', borderRadius: 14,
      border: '1px solid #EDE8E0', padding: '16px 18px',
      marginTop: 12,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#B0A898', letterSpacing: '0.08em', marginBottom: 12 }}>
        기도 기록 백업
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleExport}
          style={{
            flex: 1, padding: '10px', borderRadius: 10,
            border: '1.5px solid #E0DACE', background: '#FAF8F4',
            color: '#7A6E60', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          📤 백업 내보내기
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1, padding: '10px', borderRadius: 10,
            border: '1.5px solid #E0DACE', background: '#FAF8F4',
            color: '#7A6E60', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          📥 백업 복구하기
        </button>
      </div>
      <div style={{ fontSize: 10, color: '#C0B8A8', marginTop: 8, lineHeight: 1.6 }}>
        기도 기록을 JSON 파일로 저장하거나 복구합니다.<br />
        기기 변경 또는 앱 재설치 시 사용하세요.
      </div>
      <input
        type="file"
        accept=".json"
        onChange={handleImport}
        ref={el => fileInputRef.current = el}
        style={{ display: 'none' }}
      />
    </div>
  )
}
