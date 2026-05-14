import { formatDateKO, dateKey } from '../utils/storage'

const CAT = {
  missionary: { label: '선교사', color: '#9B7B5A', bg: '#FBF6F0', border: '#E8D5BB' },
  nation:     { label: '나라',   color: '#4E7C6E', bg: '#F0F6F3', border: '#BAD9CF' },
  mission:    { label: '선교',   color: '#5E5E8A', bg: '#F2F2F8', border: '#C8C8E4' },
}

export default function HistoryView({ date, prayers, storageData }) {
  if (!prayers || prayers.length === 0) return (
    <div style={{ textAlign: 'center', padding: '28px 0', fontSize: 12, color: '#C0B8A8' }}>
      이 날의 기도제목 데이터가 없습니다
    </div>
  )

  const key = dateKey(date)
  const prayedIds = storageData[key]?.prayed || []

  return (
    <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #EDE8E0', padding: '16px 18px', animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#7A6E60', marginBottom: 14 }}>
        {formatDateKO(date)} 기도 기록
      </div>

      {prayers.map((p, i) => {
        const cat = CAT[p.category] || CAT.mission
        const done = prayedIds.includes(p.id || p.country)

        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 0',
            borderBottom: i < prayers.length - 1 ? '1px solid #F0ECE5' : 'none',
          }}>
            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{p.flag}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: cat.color,
                  background: cat.bg, border: `1px solid ${cat.border}`,
                  padding: '1px 7px', borderRadius: 20,
                }}>{cat.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2A2520' }}>{p.country}</span>
              </div>
              <div style={{ fontSize: 12, color: '#777', lineHeight: 1.5 }}>{p.title}</div>
              {done && (
                <div style={{ fontSize: 10, color: '#9B7B5A', marginTop: 4 }}>🙏 기도 완료</div>
              )}
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: done ? '#9B7B5A' : '#F5F3EE',
              border: `1.5px solid ${done ? '#9B7B5A' : '#E0DCD4'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: done ? '#FFF' : '#C0B8A8',
            }}>
              {done ? '✓' : ''}
            </div>
          </div>
        )
      })}

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0ECE5' }}>
        <div style={{ fontSize: 11, color: '#C0B8A8' }}>
          총 {prayers.length}개 중 {prayedIds.length}개 기도 완료
        </div>
      </div>
    </div>
  )
}
