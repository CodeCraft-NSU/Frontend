'use client'
import LLMManagement from '@/app/components/LLMManagement'
import MainHeader from '@/app/components/ViewMainHeader'
import MainSide from '@/app/components/ViewMainSide'
import PJDelBtn from '@/app/components/ProjectDeleteBtn'
import { getUnivId } from '@/app/util/storage'
import usePermissionGuard from '@/app/util/usePermissionGuard'
import axios from 'axios'
import { useState, useEffect, CSSProperties } from 'react'
import { useRouter } from 'next/navigation'


type ccp = {
    pid: number
    univ_id: number
    msg: string
    ver: number
}

type cppPayload = {
    RESULT_CODE: number
    RESULT_MSG: string
    PAYLOAD: cppList[]
}

type cppList = {
    p_no: number
    ver: number
    date: string
    s_no: number
    msg: string
}

export interface PJItem {
    pid: number
    pname: string
    pdetails: string
    psize: number
    pperiod: string
    pmm: string
    wizard: number
    profno: number
    profname: string
    subno: number
}

type returnPJ = {
    RESULT_CODE: number
    RESULT_MSG: string
    PAYLOAD: {Result : PJItem[]}
}

type subjectPayload = {
    RESULT_CODE: number,
    RESULT_MSG: string,
    PAYLOAD: {
        Result: subjectType[]
    }
}

type subjectType = {
    subj_no: number
    subj_name: string
}

type profPayload = {
    RESULT_CODE: number,
    RESULT_MSG: string,
    PAYLOAD: {
        Result: profType[]
    }
}

type profType = {
    f_no: number
    f_name: string
}

type expPayload = {
    RESULT_CODE: number,
    RESULT_MSG: string,
    PAYLOAD: {
        Result: expType[]
    }
}

type expType = {
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

export function Modal({
    isOpen,
    closeModal,
    children
  }: {
    isOpen: boolean;
    closeModal: () => void;
    children?: React.ReactNode;
  }) {
    return (
      isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9998, // ✅ 모달 최상단 유지
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '25px 30px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              width: '100%',
              maxWidth: '500px',
              position: 'relative',
              zIndex: 10000
            }}
          >
            {/* X 버튼 */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '12px',
                fontSize: '18px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            {children}
          </div>
        </div>
      )
    );
  }
  

function splitPperiod(pperiod: string): { startDate: string; endDate: string } {
    const parts = pperiod.split("-");
    if (parts.length === 6) {
      const startDate = parts.slice(0, 3).join("-");
      const endDate = parts.slice(3).join("-");
      return { startDate, endDate };
    }
    return { startDate: "", endDate: "" };
}

export default function ProjectManage(props: any){
    const [isLoading, setIsLoading] = useState(false);
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<cppList | null>(null);
    const [page, setPage] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
    const [log, setLog] = useState('');
    const [subjectList, setSubjectList] = useState<subjectType[]>([{subj_name: "Loading...", subj_no: 0}])
    const [profList, setProfList] = useState<profType[]>([{f_no: 0, f_name: "Loading..."}])
    const router = useRouter();
    const [logList, setLogList] = useState<cppList[]>([{
        p_no: props.params.id,
        ver: -1,
        date: "",
        s_no: -1,
        msg: ""
    }]);
    const [pj, setPJ] = useState<expType>({
        p_no: 0,
        p_name: "",
        p_content: "",
        p_method: "",
        p_memcount: 0,
        p_start: "",
        p_end: "",
        p_wizard: 0,
        subj_no: 0,
        dno: 0,
        f_no: 0
    })
    
    const s_no = getUnivId()

    const loadLogList = async() => {
        const data: ccp = {
            pid: props.params.id,
            univ_id: s_no,
            msg: '',
            ver: 0
        }
        try{
            const response = await axios.post<cppPayload>("https://cd-api.chals.kim/api/ccp/load_history", data, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setLogList(response.data.PAYLOAD)
        }catch(err){}
    }

    const defaultProject: expType = {
        p_no: 0,
        p_name: "",
        p_content: "",
        p_method: "",
        p_memcount: 0,
        p_start: "",
        p_end: "",
        p_wizard: 0,
        subj_no: 0,
        dno: 0,
        f_no: 0
      }

    const loadProject = async() => {
        try{
            const responseType = await axios.post<expPayload>("https://cd-api.chals.kim/api/project/load_exp", {}, {headers:{Authorization: process.env.SECRET_API_KEY}});

            console.log(responseType)
            const tmpPJ = responseType.data.PAYLOAD.Result.find(item => item.p_no === Number(props.params.id)) || defaultProject
            setPJ(tmpPJ)
        }catch(err){}
    }

    const loadSubject = async() => {
        try{
            const response = await axios.post<subjectPayload>("https://cd-api.chals.kim/api/subject/load_all", {}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const result = response.data.PAYLOAD.Result;
            setSubjectList(Array.isArray(result) ? result : []);
        }catch(err){}
    }

    const loadProf = async() => {
        try{
            const response = await axios.post<profPayload>("https://cd-api.chals.kim/api/acc/load_prof", {subj_no: pj.subj_no}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setProfList(response.data.PAYLOAD.Result)
        }catch(err){}
    }

    const pageList = ['수정 및 삭제', '불러오기 / 저장하기']

    useEffect(() => {
        if(page === 0){
            loadProject()
            loadSubject()
        }
        if(page === 1){
            loadLogList()
        }
    }, [page])

    useEffect(() => {
        if(pj.subj_no !== 0){
            loadProf()
        }
    }, [pj.subj_no])

    return(
        <div>
            {/*메인 헤더*/}
            <MainHeader pid = {props.params.id}/>

            {/*body*/}
            <div style={{display: 'flex'}}> 

                {/*왼쪽 사이드*/}
                <MainSide pid = {props.params.id}/>

                {/*메인 페이지*/}
                <div style={{height: 'calc(100vh - 105px)', width: 'calc(90% - 200px)', display: 'flex', flexDirection: 'column', margin: '0', float: 'left'}}>
                {/* 🔧 리디자인된 탭 UI */}
                <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '16px',
                    backgroundColor: '#ffffff',
                    borderBottom: '2px solid #e5e7eb',
                    padding: '12px 0',
                    width: '100%',
                    maxWidth: '900px',
                    margin: '0 auto',
                    marginTop: '30px'
                }}
                >
                {pageList.map((menu, index) => {
                    const isActive = page === index;
                    return (
                    <button
                        key={index}
                        onClick={() => setPage(index)}
                        style={{
                        padding: '10px 24px',
                        fontSize: '15px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#22c55e' : '#6b7280',
                        backgroundColor: isActive ? '#f0fdf4' : '#f9fafb',
                        border: '1px solid',
                        borderColor: isActive ? '#22c55e' : '#e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        {menu}
                    </button>
                    );
                })}
                </div>

                    {(() => {
                        switch (page) {
                            case 0:
                                return (
                                    <div style={{height: '100%', overflowY: 'auto'}}>
                                        <div style={{
                                            width: '75%',
                                            margin: '40px auto',
                                            backgroundColor: '#fff',
                                            padding: '40px 50px',
                                            borderRadius: '16px',
                                            boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                                            }}>
                                            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px' }}>
                                                🛠️ 프로젝트 수정
                                            </h1>

                                            <form style={{marginTop: '10px'}}>
                                                <div style={{ marginBottom: '15px' }}>
                                                    <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>프로젝트 이름:</label>
                                                    <input
                                                        type="text"
                                                        value={pj.p_name}
                                                        disabled
                                                        // onChange={(e) => setPJ({ ...pj, pname: e.target.value})}
                                                        required
                                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                    />
                                                </div>
                                                <div style={{ marginBottom: '15px' }}>
                                                    <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>프로젝트 설명:</label>
                                                    <textarea
                                                        value={pj.p_content}
                                                        disabled
                                                        // onChange={(e) => setPJ({ ...pj, pdetails: e.target.value})}
                                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', resize: 'vertical' }}
                                                    ></textarea>
                                                </div>
                                                <div style={{display: 'flex'}}>
                                                    <div style={{ marginBottom: '15px', width: '45%', marginRight: '10%' }}>
                                                        <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>인원:</label>
                                                        <input
                                                            type="number"
                                                            disabled
                                                            value={pj.p_memcount}
                                                            // onChange={(e) => setPJ({ ...pj, psize: Number(e.target.value)})}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                        />
                                                    </div>
                                                    <div style={{ marginBottom: '15px', width: '45%' }}>
                                                        <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>개발 방법론:</label>
                                                        <select
                                                            value={pj.p_method}
                                                            disabled
                                                            // onChange={(e) => setPJ({...pj, pmm: e.target.value})}
                                                            style={{ width: 'calc(100% + 24px)', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#ffffff' }}
                                                        >
                                                            <option value={'0'}>폭포수 모델</option>
                                                            <option value={'1'}>에자일 모델</option>
                                                            <option value={'2'}>기타</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{display: 'flex'}}>
                                                    <div style={{ marginBottom: '15px', width: '45%', marginRight: '10%' }}>
                                                        <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>시작일:</label>
                                                        <input
                                                            type="date"
                                                            value={pj.p_start}
                                                            disabled
                                                            // onChange={(e) => setStartDate(e.target.value)}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                        />
                                                    </div>
                                                    <div style={{ marginBottom: '15px', width: '45%', }}>
                                                        <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>마감일:</label>
                                                        <input
                                                            type="date"
                                                            value={pj.p_end}
                                                            disabled
                                                            // onChange={(e) => setEndDate(e.target.value)}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{display: 'flex'}}>
                                                    <div style={{ marginBottom: '15px', width: '45%', marginRight: '10%' }}>
                                                        <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>강의:</label>
                                                        <select
                                                            value={pj.subj_no}
                                                            disabled
                                                            // onChange={(e) => setPJ({...pj, subno: Number(e.target.value)})}
                                                            style={{ width: 'calc(100% + 24px)', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#ffffff' }}
                                                        >
                                                            {Array.isArray(subjectList) &&
                                                                subjectList.map((tmp) => (
                                                                    <option key={tmp.subj_no} value={tmp.subj_no}>
                                                                        {tmp.subj_name}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                    <div style={{ marginBottom: '15px', width: '45%', }}>
                                                        <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>담당 교수:</label>
                                                        <select
                                                            value={pj.f_no}
                                                            disabled
                                                            // onChange={(e) => setPJ({...pj, profno: Number(e.target.value)})}
                                                            style={{ width: 'calc(100% + 24px)', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#ffffff' }}
                                                        >
                                                            {Array.isArray(profList) &&
                                                                profList.map((item) => (
                                                                    <option key={item.f_no} value={item.f_no}>
                                                                        {item.f_name}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                </div>
                                                

                                            </form>
                                        </div>
                                        {/* <PJDelBtn pid = {props.params.id}/> */}
                                    </div>
                                )
                            case 1:
                                return (
                                    <div style={{width: '70%', minHeight: '700px',margin: '0 auto', display: 'flex', flexDirection: 'column', marginBottom: '0', overflowY: 'auto', marginTop: '30px'}}>
                                        {/**export 버튼 */}
                                        <div style={{position: 'relative', width: '100%', minHeight: '33px',border: '0px solid #000', borderRadius: '5px', }}>
                                        <button
                                            // onClick={() => setExportModalOpen(true)}
                                            style={{
                                                position: 'absolute',
                                                right: '0',
                                                backgroundColor: '#22c55e', // PMS 메인 그린
                                                color: '#fff',
                                                padding: '10px 20px',
                                                fontSize: '15px',
                                                fontWeight: 600,
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                                                transition: 'background 0.2s, transform 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#16a34a'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#22c55e'}
                                            >
                                            📦 프로젝트 저장하기
                                            </button>

                                            <Modal isOpen={isExportModalOpen} closeModal={() => setExportModalOpen(false)}>
                                            <div
                                                style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '20px',
                                                width: '100%',
                                                padding: '10px 5px',
                                                }}
                                            >
                                                <h2
                                                style={{
                                                    fontSize: '22px',
                                                    fontWeight: 600,
                                                    color: '#222',
                                                    margin: 0,
                                                }}
                                                >
                                                📌 프로젝트 저장하기
                                                </h2>

                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    placeholder="설명 및 변경사항을 입력해주세요."
                                                    value={log}
                                                    disabled
                                                    // onChange={(e) => setLog(e.target.value)}
                                                    style={{
                                                    flexGrow: 1,
                                                    padding: '10px 14px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '8px',
                                                    fontSize: '15px',
                                                    outline: 'none',
                                                    }}
                                                />
                                                <button
                                                    // onClick={handleSubmit}
                                                    disabled={isLoading}
                                                    style={{
                                                    backgroundColor: isLoading ? '#b0e0b0' : '#90ee90',
                                                    border: '1px solid #4CAF50',
                                                    padding: '10px 16px',
                                                    borderRadius: '8px',
                                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                                    fontWeight: 'bold',
                                                    color: '#000',
                                                    boxShadow: '1px 1px 3px rgba(0,0,0,0.1)',
                                                    transition: 'background 0.2s',
                                                    }}
                                                >
                                                    확인
                                                </button>
                                                </div>
                                            </div>
                                            </Modal>

                                        </div>

                                        {/**import 리스트 및 버튼 */}
                                        <div style={{
                                        width: '92%',
                                        display: 'flex',
                                         flexDirection: 'column',
                                         paddingLeft: '8%',
                                         paddingTop: '20px',
                                         position: 'relative',
                                         zIndex: 1  // ✅ 중요: 카드 영역의 zIndex를 낮게 설정
                                        }}>
                                        <div style={{
                                            padding: '30px',
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                            marginTop: '30px'
                                            }}>
                                            <h2 style={{
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                                color: '#333',
                                                marginBottom: '20px'
                                            }}>📜 프로젝트 변경 이력</h2>

                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '20px',
                                                borderLeft: '3px solid #4b8df8',
                                                paddingLeft: '20px',
                                                position: 'relative'
                                            }}>
                                                {logList
                                                .filter(log => log.ver !== -1)
                                                .sort((a, b) => b.ver - a.ver)
                                                .map((log, idx) => (
                                                    <div
                                                    key={idx}
                                                    // onClick={() => {
                                                    //     setSelectedLog(log);
                                                    //     setImportModalOpen(true);
                                                    // }}
                                                    style={{
                                                        position: 'relative',
                                                        backgroundColor: '#f9f9f9',
                                                        padding: '14px 18px',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                                        transition: '0.3s',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eef4ff'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                                    >
                                                    {/* 타임라인 점 */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '-30px',
                                                        top: '20px',
                                                        width: '14px',
                                                        height: '14px',
                                                        backgroundColor: '#4b8df8',
                                                        borderRadius: '50%',
                                                        border: '2px solid #fff',
                                                        boxShadow: '0 0 0 2px #4b8df8'
                                                    }}></div>

                                                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                                        ver.{log.ver} | {log.msg}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                                        수정자: {log.s_no} · {log.date.replace("T", " ")}
                                                        
                                                    </div>
                                                    </div>
                                                ))}
                                            </div>
                                            </div>
                                                {isImportModalOpen && selectedLog && (
                                                    <Modal isOpen={isImportModalOpen} closeModal={() => { setImportModalOpen(false); setSelectedLog(null); }}>
                                                    <div style={{ padding: "10px 30px" }}>
                                                        <h3 style={modalTitleStyle}>수정 내역</h3>
                                                        <div style={{ display: "flex", flexDirection: "column", paddingLeft: "20px" }}>
                                                            <div style={modalFieldStyle}>
                                                                <strong>버전: </strong>
                                                                {selectedLog.ver}
                                                            </div>
                                                            <div style={modalFieldStyle}>
                                                                <strong>수정자: </strong>
                                                                {selectedLog.s_no}
                                                            </div>
                                                            <div style={modalFieldStyle}>
                                                                <strong>수정 날짜: </strong>
                                                                {selectedLog.date}
                                                            </div>
                                                            <div style={modalFieldStyle}>
                                                                <strong>수정 사항: </strong>
                                                                {selectedLog.msg}
                                                            </div>
                                                            <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
                                                                <button 
                                                                // onClick={handleImport}
                                                                disabled={isLoading}
                                                                style={{backgroundColor: isLoading ? '#ccc' : 'lightgreen', padding: '5px 10px', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer'}}
                                                                >
                                                                    불러오기
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    </Modal>
                                                )}
                                        </div>
                                    </div>
                                )
                            default:
                                return (
                                    <div>default</div>
                                )
                        }
                    })()}
                    
                </div>
            </div>
        </div>
    )
}
  
  const modalTitleStyle: CSSProperties = {
    marginBottom: "15px",
    marginTop: '15px',
    fontSize: "30px",
    fontWeight: "bold",
  };
  
  const modalFieldStyle: CSSProperties = {
    marginBottom: "10px",
    fontSize: "16px",
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: '#333',
    fontSize: '14px',
  };
  
  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
    outline: 'none',
  };
  