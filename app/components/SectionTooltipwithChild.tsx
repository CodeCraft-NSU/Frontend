'use client'

import React, { ReactNode, useState } from 'react'

export default function SectionTooltipWithChild({ children }: { children: ReactNode }) {
  const [hover, setHover] = useState(false)

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        marginLeft: '10px',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ❓ 아이콘 */}
      <span
        style={{
          display: 'inline-block',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: '#f87171',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '20px',
          lineHeight: '24px',
          textAlign: 'center',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        ?
      </span>

      {hover && (
        <div
          style={{
            position: 'absolute',
            top: '23px',          // 아래로
            left: '80%',          // 🎯 오른쪽으로 더 치우치게
            transform: 'translateX(-10%)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          {children}
        </div>
      )}
    </span>
  )
}
