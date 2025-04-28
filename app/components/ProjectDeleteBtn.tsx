'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { getUnivId } from "../util/storage"
import SectionTooltip from "@/app/components/SectionTooltip"

const PJDelBtn = ({ pid }: { pid: number }) => {
  const [text, setText] = useState('');
  const router = useRouter();
  const deleteText = "삭제하겠습니다.";
  const s_no = getUnivId();

  const handleDelete = async () => {
    if (text !== deleteText) {
      alert("삭제 텍스트가 일치하지 않습니다.");
      return;
    }

    if (!window.confirm("정말로 삭제하시겠습니까?")) return;

    const data = { pid, univ_id: s_no };

    try {
      await axios.post("https://cd-api.chals.kim/api/project/delete", data, {
        headers: { Authorization: process.env.SECRET_API_KEY },
      });
      alert("삭제가 완료되었습니다.");
      router.push('/');
    } catch (err) {
      alert("삭제 실패. 관리자에게 문의해주세요.");
    }
  };

  return (
    <div
      style={{
        width: '75%',
        margin: '60px auto 80px',
        backgroundColor: '#fff',
        padding: '40px 50px',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      }}
    >
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        🗑️ 프로젝트 삭제 <SectionTooltip message="해당 프로젝트를 삭제하는 곳입니다." />
      </h2>

      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '20px',
          backgroundColor: '#fefefe',
          fontSize: '15px',
          lineHeight: 1.6,
          marginBottom: '20px',
          whiteSpace: 'pre-wrap',
        }}
      >
        <strong>⚠️ 삭제 안내:</strong><br />
        프로젝트를 정말로 삭제하시겠습니까?<br />
        삭제를 진행하려면 <span style={{ color: 'red', fontWeight: 600 }}>{`"${deleteText}"`}</span> 라고 입력 후, 아래 버튼을 눌러주세요.
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="삭제 확인 텍스트를 입력하세요."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flexGrow: 1,
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '14px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleDelete}
          disabled={text !== deleteText}
          style={{
            backgroundColor: text !== deleteText ? '#f9c9c9' : '#FF4D4D',
            border: 'none',
            padding: '12px 18px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 600,
            cursor: text !== deleteText ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'background 0.3s',
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default PJDelBtn;
