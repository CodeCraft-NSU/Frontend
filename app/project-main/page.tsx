"use client";

import MainHeader from "@/app/components/MainHeader";
import MainSide from "@/app/components/MainSide";
import TodoList from "@/app/components/Todo";
import LLMChat from "@/app/components/LLMChat";
import axios from "axios";
import { useEffect, useState } from "react";
import { getToken, getUnivId, getUserId } from "../util/storage";
import { useRouter } from "next/navigation";
import useSessionGuard from "../util/checkAccount";

type wbsRatio = {
  group1no: number;
  group1: string;
  ratio: number;
};

type projectType = {
  p_no: number
  p_name: string
  p_content: string
  p_method: string
  p_memcount: number
  p_start: string
  p_end: string
  p_wizard: number
  subj_no: number
  dno: number
  f_no: number
}

export default function Main(props: any) {
  const [ratio, setRatio] = useState<wbsRatio[]>([]);
  const [showMine, setShowMine] = useState(false);
  const [showPopup, setShowPopup] = useState(true); // ✅ 팝업 상태 추가
  const [exproject, setExpProject] = useState<projectType[]>([{
    p_no: 0,
    p_name: '',
    p_content: '',
    p_method: '',
    p_memcount: 0,
    p_start: '',
    p_end: '',
    p_wizard: 0,
    subj_no: 0,
    dno: 0,
    f_no: 0
  }])
  const router = useRouter()
  const [myDno, setMyDno] = useState(0)
  const uid = getUnivId()

  const session = useSessionGuard()

  useEffect(() => {
    const loadPro = async() => {
      try{
        const response = await axios.post(
          "https://cd-api.chals.kim/api/project/load_exp",
          {},
          { headers: { Authorization: process.env.SECRET_API_KEY } }
        );
        // const tmp: projectType[] = response.data.PAYLOAD.Result
        setExpProject(response.data.PAYLOAD.Result)
      }catch(err){}
    }
    const loadDno = async() => {
      try{
        const response = await axios.post(
          "https://cd-api.chals.kim/api/acc/load_acc",
          {univ_id: uid},
          { headers: { Authorization: process.env.SECRET_API_KEY } }
        );
        setMyDno(response.data.PAYLOAD.Result.dno);
      }catch(err){}
    }
    loadPro();
    loadDno()
  }, [])

  useEffect(() => {
    console.log(myDno)
  }, [myDno])

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleClick = (pid: number) => {
    
    router.push(`/project-view/${pid}/main`)
  }

  const filtered = exproject.filter((p) =>
    showMine ? p.dno === myDno : true
  );

  return (
    <div style={{ height: "100vh"}}>
      {/* 메인 헤더 */}
      <MainHeader pid={0} />

      {/* Body */}
      <div style={{ backgroundColor: "#f9f9f9", display: "flex", flex: 1, height: 'calc(100% - 100px)'}}>
        {/* 왼쪽 사이드 */}
        <MainSide pid={0} />

        {/* 메인 페이지 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "10px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* 페이지 위 : 진척도 */}
          <div style={{ display: "flex", gap: "10px", height: "30%" }}>
            {/* 진척도 섹션 */}
            <div
              style={{
                flex: 7,
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "#f0f7ff",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {Array.from({ length: Math.ceil(ratio.length / 3) }, (_, rowIndex) => (
                  <div key={rowIndex} style={{ display: "flex", width: "100%", flex: 1 }}>
                    {ratio.slice(rowIndex * 3, rowIndex * 3 + 3).map((item, colIndex) => (
                      <div
                        key={colIndex}
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "24px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                          margin: "2px",
                        }}
                      >
                        {item.group1}: {item.ratio}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Todo List 섹션 */}
            <div
              style={{
                flex: 4,
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}>Todo List</div>
              <div style={{ borderBottom: "2px solid #ddd", marginBottom: "5px" }}></div>
              {/* <TodoList p_id={projectId || 0} /> */}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", height: '70%'}}>
            {/* 프로젝트 */}
            <div
              style={{
                flex: 1, 
                padding: "10px",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                overflowY: 'auto',
              }}
            >
              {session === 1 ? (
                <div>
                  <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}>종료된 프로젝트 열람</div>
                  <label style={{ fontSize: "14px" }}>
                      <input
                        type="checkbox"
                        checked={showMine}
                        onChange={(e) => setShowMine(e.target.checked)}
                        style={{ marginRight: "6px" }}
                      />
                      나의 학과 프로젝트만 보기
                    </label>
                  <div style={{ borderBottom: "2px solid #ddd", marginBottom: "10px" }}></div> {/**밑줄 */}
                  <div style={{height: '80%', width: '95%'}}>
                    {filtered.map((item, index) => (
                      <div 
                        key={index} 
                        style={{width: '100%', minHeight: '70px', padding: '7px', cursor: 'pointer', border: '1px solid #000', borderRadius: '10px', display: "flex", flexDirection: "column", marginBottom: '7px'}}
                        onClick={() => handleClick(item.p_no)}
                      >
                        <span style={{marginBottom: '10px'}}>{item.p_name}</span>
                        <span>개발 방법론: {item.p_method === '0' ? "폭포수" : (item.p_method === '1' ? '애자일' : '기타')}</span>
                        <span>{`기간: ${item.p_start} ~ ${item.p_end}`}</span>
                      </div>
                    ))}
                    {filtered.length === 0 && (
                      <div style={{ textAlign: "center", color: "#888" }}>
                        {showMine
                          ? "내 학과의 종료된 프로젝트가 없습니다."
                          : "종료된 프로젝트가 없습니다."}
                      </div>
                    )}
                  </div> 
                </div>
            ) : (
            <div></div>
            )}
                 
            </div>

            {/* LLM 섹션 */}
            <div
              style={{
                flex: 3, 
                padding: "10px",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}>PMS Advisor</div>
              <div style={{ borderBottom: "2px solid #ddd", marginBottom: "10px" }}></div>
              <div style={{ fontSize: "14px", color: "#777", height: '100%' }}>
                {/* <LLMChat pid = {props.params.id} /> */}
              </div>
            </div>
          </div>

          {/* 팝업 창 */}
          {showPopup && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: '9999'
              }}
            >
              <div
                style={{
                  width: "400px",
                  backgroundColor: "#ffffff",
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                <h2 style={{ color: "#333", fontSize: "22px", marginBottom: "15px" }}>📌 프로젝트 선택</h2>
                <p style={{ color: "#666", fontSize: "16px", marginBottom: "20px" }}>
                  현재 페이지는 임시 페이지입니다. <br />
                  새 프로젝트를 생성하거나 상단 탭에있는 기존 프로젝트를 선택하세요.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>

                   

                  <button
                    onClick={handleClosePopup}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#ccc",
                      color: "#333",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
