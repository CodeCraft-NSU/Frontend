'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import MainHeader from '@/app/components/MainHeader';
import MainSide from '@/app/components/MainSide';
import DocumentTable2 from '@/app/components/DocumentTable2';
import SectionTooltip from '@/app/components/SectionTooltip';
import { getToken, getUserId } from '@/app/util/storage';

// ---------------- 타입 / 상수 ----------------

type Checklist = {
  plan: number; require: number; design: number; progress: number;
  scm: number; cooperation: number; quality: number; tech: number;
  presentation: number; completion: number; pid: number;
};

type StudentEval = { id: number; name: string; score: number; comment: string; submitted: boolean; };
type TeamMember = { univ_id: number; name: string; role: string; permission: string; };
type commentType = { p_no: number; p_name: string; s_no: number; s_name: string; comment: null | string; }
type newCommentType = { p_no: number; p_name: string; s_no: number; s_name: string; comment: string; }
type wbsRatio = { group1no: number; group1: string; ratio: number; };

const gradeItems: { key: keyof Omit<Checklist, 'pid'>; label: string; tooltip: string; }[] = [
  { key: 'plan', label: '기획 및 자료조사', tooltip: '프로젝트 기획 및 초기 자료조사 완성도를 평가합니다.' },
  { key: 'require', label: '요구분석', tooltip: '요구사항 도출 및 분석 정확도를 평가합니다.' },
  { key: 'design', label: '설계', tooltip: '시스템 및 소프트웨어 설계의 논리성과 완성도를 평가합니다.' },
  { key: 'progress', label: '진척관리', tooltip: '프로젝트 일정 및 작업 진척도 관리 능력을 평가합니다.' },
  { key: 'scm', label: '형상관리(버전)', tooltip: '버전 관리 및 형상관리 도구 활용 능력을 평가합니다.' },
  { key: 'cooperation', label: '협력성(회의록)', tooltip: '팀 내 협력성 및 회의록 관리 수준을 평가합니다.' },
  { key: 'quality', label: '품질관리', tooltip: '프로젝트 결과물 품질 관리 수준을 평가합니다.' },
  { key: 'tech', label: '기술성', tooltip: '기술 난이도 및 기술적 문제 해결 능력을 평가합니다.' },
  { key: 'presentation', label: '발표', tooltip: '프로젝트 발표 준비 및 전달 능력을 평가합니다.' },
  { key: 'completion', label: '완성도', tooltip: '프로젝트 전체 결과물 완성도를 종합적으로 평가합니다.' },
];

// ---------------- 컴포넌트 ----------------

export default function GradePage({ params }: { params: { id: number } }) {
  const router = useRouter();

  // 상태 관리
  const [grade, setGrade] = useState<Checklist>({ plan: 0, require: 0, design: 0, progress: 0, scm: 0, cooperation: 0, quality: 0, tech: 0, presentation: 0, completion: 0, pid: params.id });
  const [progressRatio, setProgressRatio] = useState(0);
  const [wbsList, setWbsList] = useState<wbsRatio[]>([]);
  const [noData, setNoData] = useState(false);
  const [commentList, setCommentList] = useState<newCommentType[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const totalScore = gradeItems.reduce((sum, item) => sum + grade[item.key], 0);
  const totalMax = gradeItems.length * 100;

  // ---------------- API 호출 ----------------

  const fetchGrade = async () => {
    try {
      const { data } = await axios.post("https://cd-api.chals.kim/api/grade/load", { pid: params.id }, { headers: { Authorization: process.env.SECRET_API_KEY } });
      const res = data?.PAYLOAD?.Result;
      if (res) {
        setGrade({
          plan: res.g_plan, require: res.g_require, design: res.g_design,
          progress: res.g_progress, scm: res.g_scm, cooperation: res.g_cooperation,
          quality: res.g_quality, tech: res.g_tech, presentation: res.g_presentation,
          completion: res.g_completion, pid: res.p_no
        });
      }
    } catch (err) {
      console.error("📦 평가 데이터 불러오기 실패", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data } = await axios.post("https://cd-api.chals.kim/api/wbs/fetch_all", { pid: params.id }, { headers: { Authorization: process.env.SECRET_API_KEY } });
      const values = data.PAYLOADS.map((item: { ratio: number }) => item.ratio);
      const average = values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
      setProgressRatio(Math.round(average) || 0);
    } catch (err) {
      console.error("📦 전체 진척도 불러오기 실패", err);
    }
  };

  const fetchWBSRatio = async () => {
    try {
      const { data } = await axios.post("https://cd-api.chals.kim/api/wbs/load_ratio", { pid: params.id }, { headers: { Authorization: process.env.SECRET_API_KEY } });
      const tmp = data.RESULT_MSG;
      setWbsList(tmp);
      if (tmp.length === 1 && tmp[0].group1 === '') setNoData(true);
    } catch (err) {
      console.error("📦 WBS 세부 진척도 불러오기 실패", err);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await axios.post("https://cd-api.chals.kim/api/grade/comment_load_project", { univ_id: 0, pid: params.id, comment: '' }, { headers: { Authorization: process.env.SECRET_API_KEY } });
      const mapped = data.PAYLOAD.Result.map((cmt: commentType) => ({ ...cmt, comment: cmt.comment ?? '' }));
      setCommentList(mapped);
    } catch (err) {
      console.error("📦 학생 코멘트 불러오기 실패", err);
    }
  };

  const checkSession = async () => {
    try {
      const user_id = getUserId();
      const token = getToken();
      await axios.post("https://cd-api.chals.kim/api/prof/checksession", { user_id, token }, { headers: { Authorization: process.env.SECRET_API_KEY } });
    } catch (err) {
      alert("정상적이지 않은 접근입니다.");
      router.push(`/project-main/${params.id}/main`);
    }
  };

  // ---------------- 저장 핸들러 ----------------

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
  
    try {
      // 1차 시도: 점수 assign 저장
      await axios.post("https://cd-api.chals.kim/api/grade/assign", grade, {
        headers: { Authorization: process.env.SECRET_API_KEY }
      });
    } catch (err) {
      try {
        // assign 실패 시: 점수 edit 수정
        await axios.post("https://cd-api.chals.kim/api/grade/edit", grade, {
          headers: { Authorization: process.env.SECRET_API_KEY }
        });
      } catch (err2) {
        console.error("점수 저장/수정 실패:", err2);
        alert("❌ 점수 저장에 실패했습니다.");
        setIsSaving(false);
        return;
      }
    }
  
    try {
      // 학생 코멘트 저장 (commentList 없으면 skip)
      if (commentList && commentList.length > 0) {
        await Promise.all(commentList.map((student) =>
          axios.post("https://cd-api.chals.kim/api/grade/comment_add",
            {
              univ_id: student.s_no,
              pid: params.id,
              comment: student.comment
            },
            { headers: { Authorization: process.env.SECRET_API_KEY } }
          )
        ));
      }
      alert("✅ 학생 평가 저장 완료");
    } catch (commentErr) {
      console.error("학생 평가 저장 실패:", commentErr);
      alert("❌ 학생 평가 저장 실패");
    } finally {
      setIsSaving(false);
    }
  };
  

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.post("https://cd-api.chals.kim/api/grade/delete", grade, {
        headers: { Authorization: process.env.SECRET_API_KEY }
      });
      alert("🗑️ 삭제 완료");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("❌ 삭제 실패");
    }
  };
  

  // ---------------- 초기 로딩 ----------------

  useEffect(() => {
    checkSession();
    fetchGrade();
    fetchProgress();
    fetchWBSRatio();
    fetchComments();
  }, []);

  // ---------------- 화면 렌더링 ----------------

  return (
    <div>
      <MainHeader pid={params.id} />
      <div style={{ display: 'flex' }}>
        {/* 왼쪽 사이드 메뉴 */}
        <MainSide pid={params.id} />
  
        {/* 가운데 메인 컨텐츠 */}
        <div style={{ flex: 2, padding: '2rem', backgroundColor: '#fff', minHeight: '100vh' }}>
          {/* --- 1. 점수 입력 --- */}
          <h1>📊 프로젝트 평가 <SectionTooltip message="프로젝트에 대한 전반적인 평가를 입력하세요." /></h1>
  
          {/* 점수 카드 */}
      
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginTop: '20px' }}>
  {gradeItems.map(item => (
    <div key={item.key} style={{
      backgroundColor: '#ffffff',
      padding: '16px',
      borderRadius: '10px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '120px',
      justifyContent: 'space-between',
      border: '1px solid #e0e0e0',
    }}>
      
      {/* 라벨 + 툴팁 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
        {item.label}
        <SectionTooltip message={item.tooltip} />
      </div>

      {/* 입력 + /100점 한줄 정렬 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
        <input 
          type="number"
          placeholder="0~100"
          value={grade[item.key] === 0 ? '' : grade[item.key]}
          onChange={(e) => {
            const inputValue = e.target.value;
            const val = inputValue === '' ? 0 : Math.min(100, Math.max(0, Number(inputValue)));
            setGrade({ ...grade, [item.key]: val });
          }}
          style={{
            width: '90px',
            height: '36px',
            padding: '6px 10px',
            fontSize: '14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#4db8ff')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
        />
        <span style={{ fontSize: '13px', color: '#666' }}>/ 100점</span>
      </div>

    </div>
  ))}
</div>

  
          {/* --- 2. 프로젝트 진척도 요약 --- */}
          <div style={{ marginTop: '50px' }}>
            <h2>📘 프로젝트 진척도 요약 <SectionTooltip message="전체 작업 진척도의 평균치를 나타냅니다." /></h2>
  
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px', gap: '40px', alignItems: 'center' }}>
              {/* 원형 평균 진척도 */}
              <div style={{
                width: '160px', height: '160px', borderRadius: '50%', border: '12px solid #4db8ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold'
              }}>
                {progressRatio}%
              </div>
  
              {/* 세부 WBS 막대 */}
              <div style={{ flex: 1, minWidth: '300px' }}>
  {noData ? (
    <div style={{ textAlign: 'center', fontSize: '16px', color: '#999' }}>
      🚧 아직 WBS가 없습니다.
    </div>
  ) : (
    wbsList.map((wbs, idx) => (  // ← 여기 괄호만!
      <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
        
        {/* WBS 그룹 이름 */}
        <div style={{ fontWeight: 'bold', minWidth: '80px', flexShrink: 0 }}>
          {wbs.group1}
        </div>

        {/* 막대 Progress Bar */}
        <div style={{ flex: 1, backgroundColor: '#eee', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${wbs.ratio}%`,
            height: '100%',
            backgroundColor: '#4db8ff',
            transition: 'width 0.3s ease-in-out'
          }} />
        </div>

        {/* 세부 퍼센트 텍스트 */}
        <div style={{ width: '40px', textAlign: 'right', fontSize: '14px', color: '#333' }}>
          {wbs.ratio}%
        </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
  
          {/* --- 3. 저장/삭제 버튼 --- */}
          <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
            <button onClick={handleSave} style={{ flex: 1, backgroundColor: '#4CAF50', color: '#fff', padding: '14px 0', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              💾 저장
            </button>
            <button onClick={handleDelete} style={{ flex: 1, backgroundColor: '#f44336', color: '#fff', padding: '14px 0', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              🗑️ 삭제
            </button>
          </div>
        </div>
  
       {/* 오른쪽 산출물 + 코멘트 사이드바 */}
<div style={{
  flex: 1.3,
  padding: '2rem',
  borderLeft: '1px solid #eee',
  backgroundColor: '#fafafa',
  height: '100vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '30px'   // 산출물과 코멘트 사이 여백
}}>

  {/* 관련 산출물 */}
  <div style={{
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  }}>
    <h3>📁 관련 산출물</h3>
    <DocumentTable2 pid={params.id} />
  </div>

  {/* 학생별 코멘트 입력 */}
  <div style={{
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  }}>
    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
      👨‍🏫 학생별 코멘트 입력 <SectionTooltip message="학생 개별 피드백을 작성합니다." />
    </h3>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
      {commentList.map((student, idx) => (
        <div key={idx} style={{
          backgroundColor: '#f9f9f9',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>{student.s_name}</div>
          <textarea
            value={student.comment}
            onChange={(e) => {
              const updated = [...commentList];
              updated[idx].comment = e.target.value;
              setCommentList(updated);
            }}
            placeholder="피드백을 작성하세요"
            style={{
              width: '95%',
              minHeight: '70px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              padding: '8px',
              fontSize: '13px',
              resize: 'vertical',
            }}
          />
        </div>
      ))}
    </div>
  </div>

   </div>
  </div>
  </div>
  )}