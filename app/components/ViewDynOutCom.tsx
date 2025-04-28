'use client'
import styles from '@/app/css/DynOutCom.module.css'
import DynOutDelbtn from '@/app/components/DynOutDelbtn'
import { useState, useEffect, CSSProperties } from 'react'
import axios from 'axios'
import MsBox from '@/app/json/msBox.json'
import DocumentDownloadBtn from '@/app/components/DocumentDownload'
import DType from '@/app/json/typeBox.json'
import usePermissionGuard from '../util/usePermissionGuard'
import { useRouter } from 'next/navigation'
import { getUnivId } from '../util/storage'
import useSessionGuard from '../util/checkAccount'
import { limitTitle } from '../util/string'
import React from "react";
import { ProvidePlugin } from 'webpack'

type delData = {
    oid: number
    type: string
}
type returnEtc = {
    "RESULT_CODE": number, 
    "RESULT_MSG": string, 
    "PAYLOADS": etcType[]
}
type etcType = {
    file_no: number,
    file_name: string,
    file_path: string,
    file_date: Date,
    s_no: number,
}
type returnOvr = {
    "RESULT_CODE": number, 
    "RESULT_MSG": string, 
    "PAYLOADS": ovrType[]
}
type ovrType = {
    doc_s_no: number,
    doc_s_name: string,
    doc_s_overview: string,
    doc_s_goals: string,
    doc_s_range: string,
    doc_s_outcomes: string,
    doc_s_team: string,
    doc_s_stack: string,
    doc_s_start: string,
    doc_s_end: string
    doc_s_date: Date
}
type returnMm = {
    "RESULT_CODE": number, 
    "RESULT_MSG": string, 
    "PAYLOADS": mmType[]
}
type mmType = {
    doc_m_no: number,
    doc_m_title: string,
    doc_m_date: Date,
    doc_m_loc: string,
    doc_m_member: string,
    doc_m_manager: string,
    doc_m_content: string,
    doc_m_result: string
}
type returnReq = {
    "RESULT_CODE": number, 
    "RESULT_MSG": string, 
    "PAYLOADS": reqType[]
}
type reqType = {
    doc_r_no: number,
    doc_r_f_name: string,
    doc_r_f_content: string,
    doc_r_f_priority: string,
    doc_r_nf_name: string,
    doc_r_nf_content: string,
    doc_r_nf_priority: string,
    doc_r_s_name: string,
    doc_r_s_content: string,
    doc_r_date: Date
}
type returnTest = {
    "RESULT_CODE": number, 
    "RESULT_MSG": string, 
    "PAYLOADS": testType[]
}
type testType = {
    doc_t_no: number,
    doc_t_group1: string,
    doc_t_name: string,
    doc_t_start: string,
    doc_t_end: string,
    doc_t_pass: boolean,
    doc_t_group1no: number
}
type returnReport = {
    "RESULT_CODE": number, 
    "RESULT_MSG": string, 
    "PAYLOADS": reportType[]
}
type reportType = {
    doc_rep_no: number,
    doc_rep_name: string,
    doc_rep_writer: string,
    doc_rep_date: Date,
    doc_rep_pname: string,
    doc_rep_member: string,
    doc_rep_professor: string,
    doc_rep_research: string,
    doc_rep_design: string,
    doc_rep_arch: string,
    doc_rep_result: string,
    doc_rep_conclusion: string
}

type fileType = {
  doc_a_name: string
  doc_a_no: number
  doc_a_path: string
  doc_no: number
  doc_type: number
  p_no: number
}

const convertTeamStringToArray = (teamStr: string): { name: string; role: string }[] => {
  return teamStr.split(",").map(item => {
    const trimmed = item.trim();
    // "이름 (역할)" 형식에 맞게 이름과 역할을 추출 (괄호 사이에 있는 내용을 역할로 가정)
    const match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      return { name: match[1].trim(), role: match[2].trim() };
    } else {
      // 형식에 맞지 않으면 이름만 넣고 역할은 빈 문자열로 처리
      return { name: trimmed, role: "" };
    }
  });
};

function parseParticipants(str: string) {
  return str.split(";").map(item => {
    const [name, studentId] = item.split(",");
    return { name: name.trim(), studentId: studentId.trim() };
  });
}


export async function DownloadFile(doc_a_name: string, doc_a_no: number, doc_type: number, doc_no: number, p_no: number){
  try{
    const formData = new FormData();
    formData.append('doc_a_no', doc_a_no.toString())
    formData.append('doc_type', doc_type.toString())
    formData.append('doc_no', doc_no.toString())
    formData.append('p_no', p_no.toString())
    const response = await axios.post("https://cd-api.chals.kim/api/output/attach_download", formData, {headers:{Authorization: process.env.SECRET_API_KEY}});
    const fileUrl = `/uploads/${doc_a_name}`;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = doc_a_name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }catch(err){}
}

export const OutputEtc = ({oid, pid}: {oid: number, pid: number}) => {
    const [data, setData] = useState<etcType>()
    const s_no = getUnivId();
    const router = useRouter();
    
    const formData = new FormData();
    formData.append('pid', pid.toString());

    const loadData = async() => {
        try{
            const response = await axios.post<returnEtc>("https://cd-api.chals.kim/api/output/otherdoc_fetch_all", formData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setData(response.data.PAYLOADS.find((item) => item.file_no.toString() === oid.toString()))
        }catch(err){}
    }

    useEffect(() => {
        loadData()
    },[])

    const readPermission = usePermissionGuard(pid, s_no, {leader: 1, om: [1, 2]}, false)
    const session = useSessionGuard();

    const downloadFile = async() => {
        try{
            const response = await axios.post("https://cd-api.chals.kim/api/output/otherdoc_download", {file_no: oid}, {headers:{Authorization: process.env.SECRET_API_KEY}});

            const fileUrl = `/uploads/${data?.file_name}`;
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = data?.file_name || 'null'
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }catch(err){
        }
    }

    const handleDownload = () => {
        downloadFile();
    }

    return(
        <table className={styles.outTable}>
            <colgroup>
                <col style={{width: `20%`}}/>
                <col style={{width: `cal(100 - 20)%`}}/>
            </colgroup>
            <tbody>
                <tr>
                    <th>제목</th>
                    <td>{data?.file_name}</td>
                </tr>
                <tr>
                    <th>작성자</th>
                    <td>{data?.s_no}</td>
                </tr>
                <tr>
                    <th>게시일</th>
                    <td>{data?.file_date.toString()}</td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <div>
                            {/* <a href='https://google.com' target='_blank' rel='noopener noreferror' style={{textDecoration: 'none', fontSize: '15px'}}>
                                {data?.file_name}
                            </a> */}
                            <button
                                onClick={handleDownload}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#007BFF',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                                >
                                파일 다운로드
                                </button>
                        </div>
                    </td>
                </tr>
                <tr style={{borderBottom: '0'}}>
                    <td colSpan={2} style={{borderBottom: '0'}}>
                        {/* <div style={{margin: 'auto', float: 'right'}}>
                            <div style={{float: 'right'}}><button>수정</button></div>
                            <div style={{float: 'right'}}><DynOutDelbtn data={{type: MsBox.outType.etc.value, oid: data?.file_no ?? -1}} pid={pid}/></div>
                        </div> */}
                    </td>
                </tr>
            </tbody>
            
        </table>
    )
};

export const OutputOvr = ({oid, pid}: {oid: number, pid: number}) => {
  type userList = {
    univ_id: number,
    role: string,
    name: string,
    permission: string
  }
  
  type returnType = {
    "RESULT_CODE": number,
    "RESULT_MSG": string,
    "PAYLOADS": userList[]
  }
    const [edit, setEdit] = useState(false)
    const [data, setData] = useState<ovrType>()
    const postData = {pid: pid};
    const [file, setFile] = useState<fileType[]>([{
      doc_a_name: '',
      doc_a_no: 0,
      doc_a_path: '',
      doc_no: 0,
      doc_type: 0,
      p_no: 0
    }])
    const [title, setTitle] = useState("");
      const [startDate, setStartDate] = useState("");
      const [endDate, setEndDate] = useState("");
      const [createdDate, setCreatedDate] = useState("");
      const [teamMembers, setTeamMembers] = useState([{ name: "", role: "" }]);
      const [overview, setOverview] = useState("");
      const [goal, setGoal] = useState("");
      const [scope, setScope] = useState("");
      const [techStack, setTechStack] = useState(""); // ✅ 기술 스택 추가
      const [expectedOutcomes, setExpectedOutcomes] = useState(""); // ✅ 기대 성과 추가

      const [user, setUser] = useState<userList[]>([{
        univ_id: 0,
        role: '',
        name: '',
        permission: ''
      }]);
    
      useEffect(() => {
        const getTeamData = async() => {
          try{
            const response = await axios.post<returnType>("https://cd-api.chals.kim/api/project/checkuser", {pid: pid}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setUser(response.data.PAYLOADS);
          }catch(err){}
        }
        getTeamData()
      }, [])

    const loadData = async() => {
        
        try{
            const response = await axios.post<returnOvr>("https://cd-api.chals.kim/api/output/ovr_doc_fetch", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const foundData = response.data.PAYLOADS.find(
              (item) => item.doc_s_no.toString() === oid.toString()
            );
            setData(foundData);
            setTitle(foundData?.doc_s_name || '')
            setStartDate(foundData?.doc_s_start || '')
            setEndDate(foundData?.doc_s_end || '')
            setCreatedDate(foundData?.doc_s_date.toString() || '')
            setOverview(foundData?.doc_s_overview || '')
            setGoal(foundData?.doc_s_goals || '')
            setScope(foundData?.doc_s_range || '')
            setTechStack(foundData?.doc_s_stack || '')
            setExpectedOutcomes(foundData?.doc_s_outcomes || '')
            setTeamMembers(convertTeamStringToArray(foundData?.doc_s_team || ''))
        
            const tmpDocId = foundData?.doc_s_no || 0;
            const formData = new FormData();
            formData.append('p_no', pid.toString());
            formData.append('doc_no', tmpDocId.toString());
            formData.append('doc_type', '0');
            const response2 = await axios.post("https://cd-api.chals.kim/api/output/attach_load", formData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setFile(response2.data.PAYLOADS)
            
        }catch(err){}
    }

    const addTeamMember = () => {
      setTeamMembers([...teamMembers, { name: "", role: "" }]);
    };
  
    const removeTeamMember = (index: number) => {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    };
  
    const updateTeamMember = (index: number, field: "name" | "role", value: string) => {
      const updatedMembers = [...teamMembers];
    
      if (field === "name") {
        // 선택한 팀원 정보 가져오기
        const selectedUser = user.find((u) => u.name === value);
        if (selectedUser) {
          updatedMembers[index] = { name: selectedUser.name, role: updatedMembers[index].role };
        }
      } else {
        updatedMembers[index][field] = value;
      }
    
      setTeamMembers(updatedMembers);
    };

    useEffect(() => {
      loadData()
    },[])
    
    const router = useRouter();
    const s_no = getUnivId();
      
      const sectionHeaderStyle: CSSProperties = {
        color: "#4CAF50",
        borderBottom: "1px solid #ddd",
        marginBottom: "10px",
      };
      
      /* ✅ 미리보기 */
      const previewContainerStyle: CSSProperties = { 
        padding: "20px", 
        backgroundColor: "#fff", 
        borderRadius: "8px", 
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "20px"
      };
      
      /* ✅ 테이블 */
      const tableStyle: CSSProperties = { 
        width: "100%", 
        borderCollapse: "collapse", 
        marginBottom: "20px", 
        // tableLayout: "fixed"
      };
      
      const thStyle: CSSProperties = { 
        backgroundColor: "#dbdbdb", 
        padding: "12px", 
        border: "1px solid #000000", 
        textAlign: "center", 
        fontWeight: "bold",
        verticalAlign: "middle", // ✅ 세로 중앙 정렬
        width: "25%",
        whiteSpace: "pre-wrap", // 자동 줄바꿈
        wordWrap: "break-word", // 긴 단어/문장도 줄바꿈
      };
      
      const tdStyle: CSSProperties = { 
        padding: "12px", 
        border: "1px solid #000000", 
        textAlign: "center",
        verticalAlign: "middle", // ✅ 세로 중앙 정렬
        backgroundColor: "#fff", 
        width: "25%",
        whiteSpace: "pre-wrap", // 자동 줄바꿈
        wordWrap: "break-word", // 긴 단어/문장도 줄바꿈
      };
    
      const handleEdit = async() => {
        const data = {
          pname: title,
          pteam: teamMembers.map((tm) => `${tm.name} (${tm.role})`).join(", "),
          poverview: overview,
          poutcomes: expectedOutcomes,
          pgoals: goal,
          pstart: startDate,
          pend: endDate,
          prange: scope,
          pstack: techStack, // ✅ 기술 스택 저장
          pid: pid,
          add_date: createdDate,
          doc_s_no: oid
        };
        try{
          const response = await axios.post("https://cd-api.chals.kim/api/output/ovr_doc_edit", data, {
            headers: { Authorization: process.env.SECRET_API_KEY },
          });
          router.push(`/project-view/${pid}/outputManagement`);
        }catch(err){
          alert('수정 중 오류가 발생했습니다.')
        }
      }










    return(
      (edit) ? (
        <table style={tableStyle}>
            <tbody>
              {/* 프로젝트 기본 정보 */}
              <tr>
                <td style={thStyle}>제 목</td>
                <td colSpan={3} style={tdStyle}><TitleField value={title} setter={setTitle} /></td>
              </tr>
              <tr>
                <td style={thStyle}>프로젝트 시작일</td>
                <td style={tdStyle}><Field type="date" value={startDate} setter={setStartDate} /></td>
                <td style={thStyle}>프로젝트 종료일</td>
                <td style={tdStyle}><Field type="date" value={endDate} setter={setEndDate} /></td>
              </tr>
              <tr>
              <td style={thStyle}>작성일</td>
                 <td colSpan={3} style={tdStyle}><DateField value={createdDate} setter={setCreatedDate} /></td>
                </tr>


              {/* 팀 구성 및 역할 분담 */}
              <tr><td colSpan={4} style={thStyle}>팀 구성 및 역할 분담</td></tr>
{teamMembers.map((member, index) => (
  <tr key={index}>
    <td colSpan={4} style={tdStyle}>
      <div style={teamMemberRowStyle}>
        {/* ✅ 팀원 이름 선택 (드롭다운) */}
        <label>이름:</label>
        <select
          value={member.name}
          onChange={(e) => updateTeamMember(index, "name", e.target.value)}
          style={teamMemberNameStyle}
        >
          <option value="">팀원 선택</option>
          {user.map((u) => (
            <option key={u.univ_id} value={u.name}>
              {u.name}
            </option>
          ))}
        </select>

        {/* ✅ 역할 입력 필드 */}
        <label>역할:</label>
        <input
          type="text"
          value={member.role}
          onChange={(e) => updateTeamMember(index, "role", e.target.value)}
          style={teamMemberRoleStyle}
        />

        {/* 삭제 버튼 */}
        <button onClick={() => removeTeamMember(index)} style={deleteButtonStyle}>삭제</button>
      </div>
    </td>
  </tr>
))}

<tr>
  <td colSpan={4} style={tdStyle}>
    <button onClick={addTeamMember} style={addButtonStyle}>팀원 추가</button>
  </td>
</tr>


              {/* 프로젝트 개요 */}
              <tr><td colSpan={4} style={thStyle}>프로젝트 개요</td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={overview} setter={setOverview} /></td></tr>

              {/* 프로젝트 목표 */}
              <tr><td colSpan={4} style={thStyle}>프로젝트 목표</td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={goal} setter={setGoal} /></td></tr>

              {/* 프로젝트 범위 */}
              <tr><td colSpan={4} style={thStyle}>프로젝트 범위</td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={scope} setter={setScope} /></td></tr>

              {/* ✅ 기술 스택 */}
              <tr><td colSpan={4} style={thStyle}>기술 스택</td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={techStack} setter={setTechStack} /></td></tr>

              {/* ✅ 기대 성과 */}
              <tr><td colSpan={4} style={thStyle}>기대 성과</td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={expectedOutcomes} setter={setExpectedOutcomes} /></td></tr>
              <td colSpan={4}>
                <div style={{float: 'right', padding: '5px'}}><button onClick={() => setEdit(false)}>뒤로가기</button></div>
                <div style={{float: 'right', padding: '5px'}}><button onClick={handleEdit}>저장</button></div>
              </td>
            </tbody>
            
          </table>
      ) : (
      <div style={previewContainerStyle}>
        <h2 style={sectionHeaderStyle}>📄 프로젝트 개요서</h2>
      
      
      <table style={tableStyle}>
        <thead>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
        </thead>
        <tbody>
          <tr>
            <td style={thStyle}>제 목</td>
            <td colSpan={3} style={tdStyle}>{data?.doc_s_name}</td>
          </tr>
          <tr>
            <td style={thStyle}>프로젝트 시작일</td>
            <td style={tdStyle}>{data?.doc_s_start}</td>
            <td rowSpan={2} style={thStyle}>팀 구성 및 역할 분담</td>
            <td rowSpan={2} style={tdStyle}>
              {data?.doc_s_team}
            </td>
          </tr>
          <tr>
            <td style={thStyle}>프로젝트 종료일</td>
            <td style={tdStyle}>{data?.doc_s_end}</td>
          </tr>
          <tr>
            <td style={thStyle}>작성일</td>
            <td colSpan={3} style={tdStyle}>{data?.doc_s_date.toString()}</td>
          </tr>
          <tr>
            <td colSpan={4} style={thStyle}>프로젝트 개요</td>
          </tr>
          <tr>
            <td colSpan={4} style={tdStyle}>{data?.doc_s_overview} </td>
          </tr>
          <tr>
            <td colSpan={4} style={thStyle}>프로젝트 목표</td>
          </tr>
          <tr>
            <td colSpan={4} style={tdStyle}>{data?.doc_s_goals} </td>
          </tr>
          <tr>
            <td colSpan={4} style={thStyle}>프로젝트 범위</td>
          </tr>
          <tr>
            <td colSpan={4} style={tdStyle}>{data?.doc_s_range} </td>
          </tr>
          <tr>
            <td colSpan={4} style={thStyle}>기술 스택 및 도구</td>
          </tr>
          <tr>
            <td colSpan={4} style={tdStyle}>{data?.doc_s_stack} </td>
          </tr>
          <tr>
            <td colSpan={4} style={thStyle}>기대 성과</td>
          </tr>
          <tr>
            <td colSpan={4} style={tdStyle}>{data?.doc_s_outcomes} </td>
          </tr>
          <tr>
            <td colSpan={4} style={thStyle}>추가 파일</td>
          </tr>
          <tr>
            <td colSpan={4} style={tdStyle}>
              {file.map((item, index) => (
                <div key={index}>
                  <a
                    onClick={() => DownloadFile(item.doc_a_name, item.doc_a_no, item.doc_type, item.doc_no, item.p_no)}
                    style={{
                      cursor: 'pointer',
                      color: 'blue',
                      textDecoration: 'underline',
                    }}
                  >
                    {limitTitle(item.doc_a_name, 40)}
                  </a>
                </div>
              ))}
            </td>
          </tr>
          <tr style={{borderBottom: '0'}}>
              <td colSpan={4} style={{borderBottom: '0'}}>
                  <div style={{margin: 'auto', float: 'right'}}>
                      <div style={{float: 'right', padding: '5px'}}><DocumentDownloadBtn d_type={DType.dType.summary} d_no={data?.doc_s_no || 0} d_name={data?.doc_s_name || ''}/></div>
                  </div>
              </td>
          </tr>
        </tbody>
      </table>
      </div>)
        
    )

    
};



const deleteButtonStyle: CSSProperties = { backgroundColor: "#f44336", color: "#fff", border: "none", padding: "8px 12px", cursor: "pointer", borderRadius: "5px", minWidth: "60px" };
const addButtonStyle: CSSProperties = { backgroundColor: "#4CAF50", color: "#fff", border: "none", padding: "10px", cursor: "pointer", borderRadius: "5px", marginTop: "5px" };
const teamMemberRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: "15px", width: "100%", marginBottom: "8px" };


// 수정정 제목,작성일
const TitleField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
  <input type="text" value={value} onChange={(e) => setter(e.target.value)}
    style={{
      width: "97.5%", 
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "12px",
    }}
  />
);

const DateField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
  <input type="date" value={value} onChange={(e) => setter(e.target.value)}
    style={{
      width: "98%", // 
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px"
    }}
  />
);

// 드롭다운 필드
const teamMemberNameStyle: CSSProperties = {
  width: "220px", 
  padding: "18px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const teamMemberRoleStyle: CSSProperties = {
  width: "220px", 
  padding: "18px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};



/* ✅ 공통 입력 필드 */
const Field = ({ value, setter, placeholder, type = "text" }: { value: string; setter: (value: string) => void; placeholder?: string; type?: string }) => (
  <input type={type} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} style={{ width: "94%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
);




/* ✅ 버튼 */
const ActionButton = ({ label, onClick, color }: { label: string; onClick: () => void; color: string }) => (
  <button onClick={onClick} style={{ backgroundColor: color, color: "#fff", padding: "12px 28px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>{label}</button>
);

const formContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '15px',
  width: '90%',
  // maxWidth: '800px',
  padding: '20px',
  backgroundColor: '#f3f4f6',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
} as const;

const fileInputStyle = {
  width: 'calc(100% - 22px)',
  padding: '10px',
  fontSize: '16px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  backgroundColor: '#fff',
} as const;

const uploadButtonStyle = {
  padding: '12px 20px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  fontSize: '16px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  width: '100%',
} as const;


export const OutputMm = ({oid, pid}: {oid: number, pid: number}) => {
    const [edit, setEdit] = useState(false)
    const [data, setData] = useState<mmType>()
    const postData = {pid: pid};
    const router = useRouter();
    const s_no = getUnivId();
    const [file, setFile] = useState<fileType[]>([{
      doc_a_name: '',
      doc_a_no: 0,
      doc_a_path: '',
      doc_no: 0,
      doc_type: 0,
      p_no: 0
    }])
    const [teamList, setTeam] = useState('')
    const [agenda, setAgenda] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [location, setLocation] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [meetingContent, setMeetingContent] = useState("");
  const [meetingResult, setMeetingResult] = useState("");
  const [participants, setParticipants] = useState([{ name: "", studentId: "" }]);

  type userList = {
    univ_id: number,
    role: string,
    name: string,
    permission: string
  }
  
  type returnType = {
    "RESULT_CODE": number,
    "RESULT_MSG": string,
    "PAYLOADS": userList[]
  }

    const loadData = async() => {
        try{
            const response = await axios.post<returnMm>("https://cd-api.chals.kim/api/output/mm_fetch", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const foundData = response.data.PAYLOADS.find((item) => item.doc_m_no.toString() === oid.toString())
            setData(foundData);
            setTeam(foundData?.doc_m_member || '')
            setAgenda(foundData?.doc_m_title || '')
            setMeetingDate(foundData?.doc_m_date.toString() || '')
            setLocation(foundData?.doc_m_loc || '')
            setResponsiblePerson(foundData?.doc_m_manager || '')
            setMeetingContent(foundData?.doc_m_content || '')
            setMeetingResult(foundData?.doc_m_result || '')
            setParticipants(parseParticipants(foundData?.doc_m_member || ''))

            const tmpDocId = foundData?.doc_m_no || 0;
            const formData = new FormData();
            formData.append('p_no', pid.toString());
            formData.append('doc_no', tmpDocId.toString());
            formData.append('doc_type', '1');
            const response2 = await axios.post("https://cd-api.chals.kim/api/output/attach_load", formData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setFile(response2.data.PAYLOADS)
        }catch(err){}
    }

    useEffect(() => {
        loadData()
    },[])

    const [user, setUser] = useState<userList[]>([{
          univ_id: 0,
          role: '',
          name: '',
          permission: ''
        }]);
    
      useEffect(() => {
        const getTeamData = async() => {
          try{
            const response = await axios.post<returnType>("https://cd-api.chals.kim/api/project/checkuser", {pid: pid}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setUser(response.data.PAYLOADS);
          }catch(err){}
        }
        getTeamData()
      }, [])
    
      const handleEdit = async () => {
        const data = {
          main_agenda: agenda,
          date_time: meetingDate,
          location,
          responsible_person: responsiblePerson,
          meeting_content: meetingContent,
          meeting_outcome: meetingResult,
          participants: participants.map((p) => `${p.name},${p.studentId}`).join(";"),
          pid: pid,
          doc_m_no: oid
        };
    
        try {
          const response = await axios.post("https://cd-api.chals.kim/api/output/mm_edit", data, {
            headers: { Authorization: process.env.SECRET_API_KEY },
          });
          router.push(`/project-view/${pid}/outputManagement`);
        } catch (error) {
          alert("저장 중 오류가 발생했습니다.");
        }
      };
    
      const addParticipant = () => {
        setParticipants([...participants, { name: "", studentId: "" }]);
      };
    
      const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
      };
    
      const updateParticipant = (index: number, field: "name" | "studentId", value: string) => {
        const updatedParticipants = [...participants];
      
        if (field === "name") {
          // 선택한 학생 정보 가져오기
          const selectedUser = user.find((u) => u.name === value);
          if (selectedUser) {
            updatedParticipants[index] = { name: selectedUser.name, studentId: String(selectedUser.univ_id) };
          }
        } else {
          updatedParticipants[index][field] = value;
        }
      
        setParticipants(updatedParticipants);
      };
    
    const previewContainerStyle: CSSProperties = { padding: "20px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", marginTop: "20px" };

    const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: "10px" };
    
    const thStyle: CSSProperties = { 
      backgroundColor: "#dbdbdb", 
      padding: "12px", 
      border: "1px solid #000000", 
      textAlign: "center", 
      fontWeight: "bold",
      verticalAlign: "middle",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
    };
    
    const tdStyle: CSSProperties = { 
      padding: "12px", 
      border: "1px solid #000000", 
      textAlign: "center",
      verticalAlign: "middle",
      backgroundColor: "#fff",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
    };

const deleteButtonStyle: CSSProperties = { backgroundColor: "#f44336", color: "#fff", border: "none", padding: "8px 12px", cursor: "pointer", borderRadius: "5px", marginLeft: "25px" };
const addButtonStyle: CSSProperties = { backgroundColor: "#4CAF50", color: "#fff", border: "none", padding: "10px", cursor: "pointer", borderRadius: "5px", marginTop: "5px" };

const participantNameStyle: CSSProperties = {
  width: "250px", 
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const participantIdStyle: CSSProperties = {
  width: "250px", 
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

type FieldProps = {
  label?: string;
  value: string;
  setter: (value: string) => void;
  type?: string;
};


    return(
      (edit) ? (
        <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={thStyle}>안건</td>
            <td colSpan={3} style={tdStyle}><Field value={agenda} setter={setAgenda} /></td>
          </tr>
          <tr>
            <td style={thStyle}>회의 날짜</td>
            <td style={tdStyle}><Field type="date" value={meetingDate} setter={setMeetingDate} /></td>
          </tr>
          <tr>
            <td style={thStyle}>장소</td>
            <td colSpan={3} style={tdStyle}><Field value={location} setter={setLocation} /></td>
          </tr>
          <tr>
            <td style={thStyle}>책임자명</td>
            <td colSpan={3} style={tdStyle}><Field value={responsiblePerson} setter={setResponsiblePerson} /></td>
          </tr>
          <tr><td colSpan={4} style={thStyle}>회의 내용</td></tr>
          <tr><td colSpan={4} style={tdStyle}><TextAreaField value={meetingContent} setter={setMeetingContent} /></td></tr>
          <tr><td colSpan={4} style={thStyle}>회의 결과</td></tr>
          <tr><td colSpan={4} style={tdStyle}><TextAreaField value={meetingResult} setter={setMeetingResult} /></td></tr>

          <tr>
<td style={thStyle}>참석자</td>
<td colSpan={3} style={tdStyle}>
{participants.map((participant, index) => (
  <div key={index} style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
    {/* ✅ 성명 선택 (드롭다운) */}
    <label>성명:</label>
    <select
      value={participant.name}
      onChange={(e) => updateParticipant(index, "name", e.target.value)}
      style={participantNameStyle}
    >
      <option value="">참석자 선택</option>
      {user.map((u) => (
        <option key={u.univ_id} value={u.name}>
          {u.name} {/* ✅ 이름만 표시 */}
        </option>
      ))}
    </select>

    {/* ✅ 학번 자동 입력 */}
    <label>학번:</label>
    <input
      type="text"
      value={participant.studentId}
      readOnly // 학번은 자동 입력
      style={participantIdStyle}
    />

    {/* 삭제 버튼 */}
    <button onClick={() => removeParticipant(index)} style={deleteButtonStyle}>삭제</button>
  </div>
))}

{/* 참석자 추가 버튼 */}
<button onClick={addParticipant} style={addButtonStyle}>참석자 추가</button>
</td>
</tr>
<td colSpan={4}>
<div style={{float: 'right', padding: '5px'}}><button onClick={() => setEdit(false)}>뒤로가기</button></div>
<div style={{float: 'right', padding: '5px'}}><button onClick={handleEdit}>저장</button></div>
</td>
        </tbody>
      </table>
    ) : (
    <div style={previewContainerStyle}>
    <table style={tableStyle}>
      <thead>
        <tr>
          <th colSpan={4} style={thStyle}>회의 정보</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={thStyle}>안건</td>
          <td colSpan={3} style={tdStyle}>{data?.doc_m_title}</td>
        </tr>
        <tr>
          <td style={thStyle}>회의 날짜</td>
          <td style={tdStyle}>{data?.doc_m_date.toString()}</td>
          <td rowSpan={2} style={thStyle}>회의 장소 및 책임자</td>
          <td rowSpan={2} style={tdStyle}>
            <strong>장소:</strong> {data?.doc_m_loc} <br />
            <strong>책임자:</strong> {data?.doc_m_manager}
          </td>
        </tr>
        <tr>
          <td style={thStyle}>작성일</td>
          <td style={tdStyle}>{new Date().toLocaleDateString()}</td>
        </tr>
      </tbody>
    </table>

    {/* ✅ 회의 내용 및 결과 */}
    <table style={tableStyle}>
      <thead>
        <tr>
          <th colSpan={4} style={thStyle}>회의 내용 및 결과</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={4} style={tdStyle}>{data?.doc_m_content}</td>
        </tr>
        <tr>
          <th colSpan={4} style={thStyle}>회의 결과</th>
        </tr>
        <tr>
          <td colSpan={4} style={tdStyle}>{data?.doc_m_result}</td>
        </tr>
      </tbody>
    </table>

    {/* ✅ 참석자 목록 */}
    <h3 style={{ marginTop: "20px", fontSize: "18px", color: "#4CAF50" }}>참석자 목록</h3>
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>이름</th>
          <th style={thStyle}>학번</th>
        </tr>
      </thead>
      <tbody>
        {teamList.length > 0 ? (
          teamList.split(";").map((user, index) => {
            const [name, s_no] = user.split(",")
            return (
              <tr key={index}>
                <td style={tdStyle}>{name}</td>
                <td style={tdStyle}>{s_no}</td>
              </tr>    
            )
          })
        ) : (
          <tr>
            <td colSpan={2} style={tdStyle}>등록된 참석자가 없습니다.</td>
          </tr>
        )}
        <tr>
      <td colSpan={4} style={thStyle}>추가 파일</td>
    </tr>
    <tr>
      <td colSpan={4} style={tdStyle}>
        {file.map((item, index) => (
          <div key={index}>
            <a
              onClick={() => DownloadFile(item.doc_a_name, item.doc_a_no, item.doc_type, item.doc_no, item.p_no)}
              style={{
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              }}
            >
              {limitTitle(item.doc_a_name, 40)}
            </a>
          </div>
        ))}
      </td>
    </tr>
    <tr style={{borderBottom: '0'}}>
        <td colSpan={2} style={{borderBottom: '0'}}>
            <div style={{margin: 'auto', float: 'right'}}>
                <div style={{float: 'right', padding: '5px'}}><DocumentDownloadBtn d_type={DType.dType.meeting_minutes} d_no={data?.doc_m_no || 0} d_name={data?.doc_m_title || ''}/></div>
            </div>
        </td>
    </tr>
      </tbody>
    </table>
  </div>
    )
    )
};





export const OutputTest = ({oid, pid}: {oid: number, pid: number}) => {
  const [edit, setEdit] = useState(false)
  const [data, setData] = useState<testType[]>([]);
  const [defaultData, setDefaultData] = useState<testType[]>([])
  const [testTitle, setTestTitle] = useState('');
    const postData = {pid: pid};

    const loadData = async() => {
        try{
            const response = await axios.post<returnTest>("https://cd-api.chals.kim/api/output/testcase_load", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const findData = response.data.PAYLOADS.find((item) => item.doc_t_no.toString() === oid.toString())
            if (!findData) return;
            setTestTitle(findData.doc_t_group1)
            // 찾은 항목의 group1no와 group1이 모두 같은 항목들을 필터링
            const filteredData = response.data.PAYLOADS.filter(
              (item) =>
                item.doc_t_group1 === findData.doc_t_group1
            );
            const filteredData2 = response.data.PAYLOADS.filter(
              (item) =>
                item.doc_t_group1 !== findData.doc_t_group1
            );
            setData(filteredData);
            setDefaultData(filteredData2)
        }catch(err){}
    }

    useEffect(() => {
      loadData()
  },[])

  const handleSave = async() => {
    const updateData = data.map((item) => ({
      ...item,
      doc_t_group1: testTitle
    }))

    const finalData = [...updateData, ...defaultData]

    try{
      const response = await axios.post("https://cd-api.chals.kim/api/output/testcase_update", {pid: pid, testcases: finalData}, {headers:{Authorization: process.env.SECRET_API_KEY}});
      router.push(`/project-view/${pid}/outputManagement`)
      alert('저장되었습니다.')
    }catch(err){}
  }

    const router = useRouter();
    const s_no = getUnivId();

    const previewContainerStyle: CSSProperties = {
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "20px",
      };
      
      const tableStyle: CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
      };
      
      const thStyle: CSSProperties = { 
        backgroundColor: "#f8f9fa", 
        padding: "12px", 
        border: "1px solid #ddd", 
        textAlign: "center", 
        fontWeight: "bold",
        verticalAlign: "middle", // ✅ 세로 중앙 정렬
        width: "15%",
        fontSize: '12px' 
      };
      
      const tdStyle: CSSProperties = { 
        padding: "12px", 
        border: "1px solid #ddd", 
        textAlign: "center",
        verticalAlign: "middle", // ✅ 세로 중앙 정렬
        backgroundColor: "#fff", 
        width: "15%" ,
        fontSize: '12px'
      };

      const handleInputChange = (
        index: number,
        field: keyof testType,
        value: string
      ) => {
        setData((prevData) => {
          const newData = [...prevData];
          // 만약 boolean 타입이면 변환
          if (field === "doc_t_pass") {
            newData[index] = { ...newData[index], [field]: value === "true" };
          } else {
            newData[index] = { ...newData[index], [field]: value };
          }
          return newData;
        });
      };
    
    return(
      (edit) ? (
      <div style={previewContainerStyle}>
        <h2>ver. 13</h2>
        <div style={{display: 'flex'}}>
          <h2>테스트 그룹: </h2>
            <input 
              value={testTitle}
              disabled
            //   onChange={(e) => setTestTitle(e.target.value)}
              style={{marginLeft: '20px', fontSize: '24px', border: '1px solid #d6d6d6', backgroundColor: '#f7f7f7', borderRadius: '8px', padding: '0 10px'}}
            />
        </div>
        <table style={tableStyle}>
          <tbody>
            {data.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr style={{height: 'auto'}}>
                      <td style={thStyle} >테스트 시작일</td>
                      <td style={tdStyle} >
                        <input
                          type='date'
                          value={item.doc_t_start}
                          onChange={(e) => handleInputChange(index, 'doc_t_start', e.target.value)}
                        />
                      </td>
                      <td style={thStyle} >테스트 종료일</td>
                      <td style={tdStyle} >
                        <input
                          type='date'
                          value={item.doc_t_end}
                          onChange={(e) => handleInputChange(index, 'doc_t_end', e.target.value)}
                        />
                      </td>
                      <td style={thStyle} >통과 여부</td>
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: "bold",
                          color: item.doc_t_pass ? "green" : "red",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.doc_t_pass}
                          onChange={(e) =>
                            handleInputChange(index, "doc_t_pass", e.target.checked ? "true" : "false")
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <th style={thStyle}>테스트 항목</th>
                      <td colSpan={6} style={tdStyle}>
                      <input
                          type='text'
                          value={item.doc_t_name}
                          style={{width: 'calc(100% - 12px)', padding: '5px'}}
                          onChange={(e) => handleInputChange(index, 'doc_t_name', e.target.value)}
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                ))}            
          </tbody>
        </table>
        <div style={{display: 'flex'}}>
                <button onClick={() => setEdit(false)} style={editButtonStyle}>뒤로가기</button>
                <button onClick={handleSave} style={editButtonStyle}>저장</button>
              </div>
      </div>
    ) : (
        <div style={previewContainerStyle}>

        {/* ✅ 테스트 정보 테이블 */}
          <table style={tableStyle}>
              <tbody>
                <td colSpan={6}>
                  <h2 style={{width: '100%'}}>
                    테스트 그룹: {data[0]?.doc_t_group1}
                  </h2>
                </td>
                
                {data.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                    </tr>
                    <tr style={{height: 'auto'}}>
                      <td style={thStyle} >테스트 시작일</td>
                      <td style={tdStyle} >{item.doc_t_start.toString()}</td>
                      <td style={thStyle} >테스트 종료일</td>
                      <td style={tdStyle} >{item.doc_t_end.toString()}</td>
                      <td style={thStyle} >통과 여부</td>
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: "bold",
                          color: item.doc_t_pass ? "green" : "red",
                        }}
                      >
                        {item.doc_t_pass ? "✅ 통과" : "❌ 실패"}
                      </td>
                    </tr>
                    <tr>
                      <th style={thStyle}>테스트 항목</th>
                      <td colSpan={6} style={tdStyle}>
                        {item.doc_t_name}
                      </td>
                    </tr>
                    <tr>
                      
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
      </div>
      )
    )
};



export const OutputReq = ({oid, pid}: {oid: number, pid: number}) => {
    const [edit, setEdit] = useState(false)
    const [data, setData] = useState<reqType>()
    const postData = {pid: pid};
    const [file, setFile] = useState<fileType[]>([{
      doc_a_name: '',
      doc_a_no: 0,
      doc_a_path: '',
      doc_no: 0,
      doc_type: 0,
      p_no: 0
    }])
    const [creationDate, setCreationDate] = useState("");
      const [systemRequirements, setSystemRequirements] = useState("");
      const [systemDes, setSystemDes] = useState("");
      const [functionalRequirements, setFunctionalRequirements] = useState("");
      const [functionalDes, setFunctionalDes] = useState("");
      const [functionalRequirementsPriority, setFunctionalRequirementsPriority] = useState<number>(1);
      const [nonFunctionalRequirements, setNonFunctionalRequirements] = useState("");
      const [nonFunctionalDes, setNonFunctionalDes] = useState("");
      const [nonFunctionalRequirementsPriority, setNonFunctionalRequirementsPriority] = useState<number>(1);

    useEffect(() => {
        loadData()
    },[])

    const handleEdit = async () => {
        const data = {
          feature_name: functionalRequirements,
          description: functionalDes,
          priority: functionalRequirementsPriority,
          non_functional_requirement_name: nonFunctionalRequirements,
          non_functional_description: nonFunctionalDes,
          non_functional_priority: nonFunctionalRequirementsPriority,
          system_item: systemRequirements,
          system_description: systemDes,
          pid: pid,
          doc_r_no: oid,
          add_date: creationDate
        };
    
        try {
          const response = await axios.post("https://cd-api.chals.kim/api/output/reqspec_edit", data, {
            headers: { Authorization: process.env.SECRET_API_KEY },
          });
          router.push(`/project-view/${pid}/outputManagement`);
        } catch (err) {
          alert("저장 중 오류가 발생했습니다.");
        }
      };

    const loadData = async() => {
        try{
            const response = await axios.post<returnReq>("https://cd-api.chals.kim/api/output/reqspec_fetch_all", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const foundData = response.data.PAYLOADS.find((item) => item.doc_r_no.toString() === oid.toString())
            setData(foundData);
            setCreationDate(foundData?.doc_r_date.toString() || '')
            setSystemRequirements(foundData?.doc_r_s_name || '')
            setSystemDes(foundData?.doc_r_s_content || '')
            setFunctionalRequirements(foundData?.doc_r_f_name || '')
            setFunctionalDes(foundData?.doc_r_f_content || '')
            setFunctionalRequirementsPriority(Number(foundData?.doc_r_f_priority) || 0)
            setNonFunctionalRequirements(foundData?.doc_r_nf_name || '')
            setNonFunctionalDes(foundData?.doc_r_nf_content || '')
            setNonFunctionalRequirementsPriority(Number(foundData?.doc_r_nf_priority) || 0)
        
            const tmpDocId = foundData?.doc_r_no || 0;
            const formData = new FormData();
            formData.append('p_no', pid.toString());
            formData.append('doc_no', tmpDocId.toString());
            formData.append('doc_type', '3');
            const response2 = await axios.post("https://cd-api.chals.kim/api/output/attach_load", formData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setFile(response2.data.PAYLOADS)
        }catch(err){}
    }

    const router = useRouter();
    const s_no = getUnivId();

    const previewContainerStyle: CSSProperties = { 
        padding: "20px", 
        backgroundColor: "#fff", 
        borderRadius: "12px", 
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "20px"
      };
      
      const tableStyle: CSSProperties = { 
        width: "100%", 
        borderCollapse: "collapse", 
        marginBottom: "20px", 
      };
      
      const thStyle: CSSProperties = { 
        backgroundColor: "#dbdbdb", 
        padding: "12px", 
        border: "1px solid #000000", 
        textAlign: "center", 
        fontWeight: "bold",
        verticalAlign: "middle",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
      };
      
      const tdStyle: CSSProperties = { 
        padding: "12px", 
        border: "1px solid #000000", 
        textAlign: "center",
        verticalAlign: "middle",
        backgroundColor: "#fff",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
      };
      const sectionThStyle: CSSProperties = { backgroundColor: "#ddd", padding: "14px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
      const selectStyle: CSSProperties = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", cursor: "pointer" };
    return(
      (edit) ? (
      <div style={previewContainerStyle}>
        <table style={tableStyle}>
            <tbody>
              <tr><td colSpan={4} style={sectionThStyle}>📌 기본 정보</td></tr>
              <tr><td style={thStyle}>작성일</td><td colSpan={3} style={tdStyle}><Field type="date" value={creationDate} setter={setCreationDate} /></td></tr>
              <tr><td colSpan={4} style={sectionThStyle}>📌 시스템 요구사항</td></tr>
              <tr><td style={thStyle}>요구사항</td><td colSpan={3} style={tdStyle}><TextAreaField value={systemRequirements} setter={setSystemRequirements} /></td></tr>
              <tr><td style={thStyle}>설명</td><td colSpan={3} style={tdStyle}><TextAreaField value={systemDes} setter={setSystemDes} /></td></tr>
              <tr><td colSpan={4} style={sectionThStyle}>📌 기능 요구사항</td></tr>
              <tr><td style={thStyle}>요구사항</td><td colSpan={3} style={tdStyle}><TextAreaField value={functionalRequirements} setter={setFunctionalRequirements} /></td></tr>
              <tr><td style={thStyle}>설명</td><td colSpan={3} style={tdStyle}><TextAreaField value={functionalDes} setter={setFunctionalDes} /></td></tr>
              <tr><td style={thStyle}>우선순위</td>
                <td colSpan={3} style={tdStyle}>
                  <select value={functionalRequirementsPriority} onChange={(e) => setFunctionalRequirementsPriority(Number(e.target.value))} style={selectStyle}>
                    <option value={1}>낮음 (1)</option>
                    <option value={2}>보통 (2)</option>
                    <option value={3}>높음 (3)</option>
                  </select>
                </td>
              </tr>
              <tr><td colSpan={4} style={sectionThStyle}>📌 비기능 요구사항</td></tr>
              <tr><td style={thStyle}>요구사항</td><td colSpan={3} style={tdStyle}><TextAreaField value={nonFunctionalRequirements} setter={setNonFunctionalRequirements} /></td></tr>
              <tr><td style={thStyle}>설명</td><td colSpan={3} style={tdStyle}><TextAreaField value={nonFunctionalDes} setter={setNonFunctionalDes} /></td></tr>
              <tr><td style={thStyle}>우선순위</td>
                <td colSpan={3} style={tdStyle}>
                  <select value={nonFunctionalRequirementsPriority} onChange={(e) => setNonFunctionalRequirementsPriority(Number(e.target.value))} style={selectStyle}>
                    <option value={1}>낮음 (1)</option>
                    <option value={2}>보통 (2)</option>
                    <option value={3}>높음 (3)</option>
                  </select>
                </td>
              </tr>
              <td colSpan={4}>
              <div style={{float: 'right', padding: '5px'}}><button onClick={() => setEdit(false)}>뒤로가기</button></div>
              <div style={{float: 'right', padding: '5px'}}><button onClick={handleEdit}>저장</button></div>
              </td>
            </tbody>
          </table>
      </div>
    ) : (
        <div style={previewContainerStyle}>
    <table style={tableStyle}>
      <thead>
        <tr>
          <th colSpan={4} style={thStyle}>기본 정보</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={thStyle}>작성일</td>
          <td colSpan={3} style={tdStyle}>{data?.doc_r_date.toString()}</td>
        </tr>
      </tbody>

      <thead>
        <tr>
          <th colSpan={4} style={thStyle}>시스템 요구사항</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={4} style={tdStyle}>{data?.doc_r_s_name}</td>
        </tr>
        <tr>
          <td colSpan={4} style={tdStyle}>{data?.doc_r_s_content}</td>
        </tr>
      </tbody>

      <thead>
        <tr>
          <th colSpan={4} style={thStyle}>기능 요구사항</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={thStyle}>항목</td>
          <td style={tdStyle}>{data?.doc_r_f_name}</td>
          <td style={thStyle}>우선순위</td>
          <td style={{ 
            ...tdStyle, 
            fontWeight: "bold", 
            color: Number(data?.doc_r_f_priority) === 3 ? "#D32F2F" : Number(data?.doc_r_f_priority) === 2 ? "#F57C00" : "#2E7D32",
            backgroundColor: Number(data?.doc_r_f_priority) === 3 ? "#FFEBEE" : Number(data?.doc_r_f_priority) === 2 ? "#FFF3E0" : "#E8F5E9"
          }}>
            {["낮음", "보통", "높음"][Number(data?.doc_r_f_priority) - 1]}
          </td>
        </tr>
        <tr>
          <td colSpan={4} style={tdStyle}>{data?.doc_r_f_content}</td>
        </tr>
      </tbody>

      <thead>
        <tr>
          <th colSpan={4} style={thStyle}>비기능 요구사항</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={thStyle}>항목</td>
          <td style={tdStyle}>{data?.doc_r_nf_name}</td>
          <td style={thStyle}>우선순위</td>
          <td style={{ 
            ...tdStyle, 
            fontWeight: "bold", 
            color: Number(data?.doc_r_nf_priority) === 3 ? "#D32F2F" : Number(data?.doc_r_nf_priority) === 2 ? "#F57C00" : "#2E7D32",
            backgroundColor: Number(data?.doc_r_nf_priority) === 3 ? "#FFEBEE" : Number(data?.doc_r_nf_priority) === 2 ? "#FFF3E0" : "#E8F5E9"
          }}>
            {["낮음", "보통", "높음"][Number(data?.doc_r_nf_priority) - 1]}
          </td>
        </tr>
        <tr>
          <td colSpan={4} style={tdStyle}>{data?.doc_r_nf_content}</td>
        </tr>
        <tr>
      <td colSpan={4} style={thStyle}>추가 파일</td>
    </tr>
    <tr>
      <td colSpan={4} style={tdStyle}>
        {file.map((item, index) => (
          <div key={index}>
            <a
              onClick={() => DownloadFile(item.doc_a_name, item.doc_a_no, item.doc_type, item.doc_no, item.p_no)}
              style={{
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              }}
            >
              {limitTitle(item.doc_a_name, 40)}
            </a>
          </div>
        ))}
      </td>
    </tr>
    <tr style={{borderBottom: '0'}}>
                     <td colSpan={2} style={{borderBottom: '0'}}>
                         <div style={{margin: 'auto', float: 'right'}}>
                             <div style={{float: 'right', padding: '5px'}}><DocumentDownloadBtn d_type={DType.dType.reqspec} d_no={data?.doc_r_no || 0} d_name={data?.doc_r_s_name || ''}/></div>
                         </div>
                     </td>
                 </tr>
      </tbody>
      
    </table>
  </div>
    ))
};

export const OutputReport = ({oid, pid}: {oid: number, pid: number}) => {
    const [edit, setEdit] = useState(false)
    const [data, setData] = useState<reportType>()
    const postData = {pid: pid};
    const [file, setFile] = useState<fileType[]>([{
      doc_a_name: '',
      doc_a_no: 0,
      doc_a_path: '',
      doc_no: 0,
      doc_type: 0,
      p_no: 0
    }])
    const [reportTitle, setReportTitle] = useState("");
      const [projectName, setProjectName] = useState("");
      const [submissionDate, setSubmissionDate] = useState("");
      const [writer, setWriter] = useState("");
      const [teamMembers, setTeamMembers] = useState("");
      const [problemDefinition, setProblemDefinition] = useState("");
      const [researchGoal, setResearchGoal] = useState("");
      const [designProcess, setDesignProcess] = useState("");
      const [systemArchitecture, setSystemArchitecture] = useState("");
      const [experimentResults, setExperimentResults] = useState("");
      const [conclusion, setConclusion] = useState("");

    const loadData = async() => {
        try{
            const response = await axios.post<returnReport>("https://cd-api.chals.kim/api/output/report_fetch_all", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const foundData = response.data.PAYLOADS.find((item) => item.doc_rep_no.toString() === oid.toString())
            setData(foundData);
            setReportTitle(foundData?.doc_rep_name || '')
            setProjectName(foundData?.doc_rep_pname || '')
            setSubmissionDate(foundData?.doc_rep_date.toString() || '')
            setWriter(foundData?.doc_rep_writer || '')
            setTeamMembers(foundData?.doc_rep_member || '')
            const parts = foundData?.doc_rep_research.split("\n") || ''
            setProblemDefinition(parts[0] || "");
            setResearchGoal(parts[1] || "");
            // setProblemDefinition(foundData?.doc_rep_research || '')
            // setResearchGoal(foundData?.doc_rep_research || '')
            setDesignProcess(foundData?.doc_rep_design || '')
            setSystemArchitecture(foundData?.doc_rep_arch || '')
            setExperimentResults(foundData?.doc_rep_result || '')
            setConclusion(foundData?.doc_rep_conclusion || '')
        
            const tmpDocId = foundData?.doc_rep_no || 0;
            const formData = new FormData();
            formData.append('p_no', pid.toString());
            formData.append('doc_no', tmpDocId.toString());
            formData.append('doc_type', '2');
            const response2 = await axios.post("https://cd-api.chals.kim/api/output/attach_load", formData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setFile(response2.data.PAYLOADS)
        }catch(err){}
    }

    useEffect(() => {
      loadData()
  },[])

    const router = useRouter();
    const s_no = getUnivId();

    const handleEdit = async () => {
        const data = {
          rname: reportTitle,
          pname: projectName,
          rdate: submissionDate,
          rwriter: writer,
          pmember: teamMembers,
          pprof: "",
          presearch: `${problemDefinition}\n${researchGoal}`,
          pdesign: designProcess,
          parch: systemArchitecture,
          presult: experimentResults,
          pconc: conclusion,
          pid: pid,
          doc_rep_no: oid
        };
    
        try {
          const response = await axios.post("https://cd-api.chals.kim/api/output/report_edit", data, {
            headers: { Authorization: process.env.SECRET_API_KEY },
          });
          router.push(`/project-view/${pid}/outputManagement`);
        } catch (err) {
          alert("저장 중 오류가 발생했습니다.");
        }
      };

    const previewContainerStyle: CSSProperties = { 
        padding: "20px", 
        backgroundColor: "#fff", 
        borderRadius: "12px", 
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "20px"
      };
      
      const tableStyle: CSSProperties = { 
        width: "100%", 
        borderCollapse: "collapse", 
        marginBottom: "20px", 
      };
      
      const thStyle: CSSProperties = { 
        backgroundColor: "#dbdbdb", 
        padding: "12px", 
        border: "1px solid #000000", 
        textAlign: "center", 
        fontWeight: "bold",
        verticalAlign: "middle",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
      };
      
     


      
      
    
    return(
      (edit) ? (
      <div style={previewContainerStyle}>
        <table style={tableStyle}>
            <tbody>
              <tr><td colSpan={4} style={sectionHeaderStyle}>📌 기본 정보</td></tr>
              <tr>
          <td style={thStyle}>보고서 제목</td>
          <td colSpan={3} style={tdStyle}>
            <input 
              type="text"
              value={reportTitle}
             onChange={(e) => setReportTitle(e.target.value)}
             style={reportTitleStyle}
           />
          </td>
        </tr>
        <tr>
         <td style={thStyle}>프로젝트 명</td>
         <td colSpan={3} style={tdStyle}>
           <input 
              type="text"
             value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={projectNameStyle}
           />
          </td>
        </tr>
              <tr>
                <td style={thStyle}>작성일</td>
                <td style={tdStyle}><Field type="date" value={submissionDate} setter={setSubmissionDate} /></td>
                <td style={thStyle}>작성자</td>
                <td style={tdStyle}><Field value={writer} setter={setWriter} /></td>
              </tr>

            <tr><td colSpan={4} style={sectionHeaderStyle}>📌 보고서 세부 내용</td></tr>
            <tr><td colSpan={4} style={thStyle}>팀원 및 지도 교수</td></tr>
            <tr><td colSpan={4} style={tdStyle}><TextAreaField value={teamMembers} setter={setTeamMembers} /></td></tr>

            <tr><td colSpan={4} style={thStyle}>문제 정의</td></tr>
            <tr><td colSpan={4} style={tdStyle}><TextAreaField value={problemDefinition} setter={setProblemDefinition} /></td></tr>

            <tr><td colSpan={4} style={thStyle}>연구 목표</td></tr>
            <tr><td colSpan={4} style={tdStyle}><TextAreaField value={researchGoal} setter={setResearchGoal} /></td></tr>

            <tr><td colSpan={4} style={thStyle}>설계 및 개발 과정</td></tr>
            <tr><td colSpan={4} style={tdStyle}><TextAreaField value={designProcess} setter={setDesignProcess} /></td></tr>

            <tr><td colSpan={4} style={thStyle}>시스템 아키텍처</td></tr>
            <tr><td colSpan={4} style={tdStyle}><TextAreaField value={systemArchitecture} setter={setSystemArchitecture} /></td></tr>

            <tr><td colSpan={4} style={thStyle}>실험 및 결과</td></tr>
            <tr><td colSpan={4} style={tdStyle}><TextAreaField value={experimentResults} setter={setExperimentResults} /></td></tr>

            <tr><td colSpan={4} style={thStyle}>결론</td></tr>
            <tr><td colSpan={4} style={tdStyle}><TextAreaField value={conclusion} setter={setConclusion} /></td></tr>

              <td colSpan={4}>
        <div style={{float: 'right', padding: '5px'}}><button onClick={() => setEdit(false)}>뒤로가기</button></div>
        <div style={{float: 'right', padding: '5px'}}><button onClick={handleEdit}>저장</button></div>
        </td>
            </tbody>
          </table>
      </div>
    ) : (
        <div style={previewContainerStyle}>

    <table style={tableStyle}>
      <tbody>
        <tr>
          <th style={thStyle}>보고서 제목</th>
          <td colSpan={3} style={tdStyle}>{data?.doc_rep_name}</td>
        </tr>
        <tr>
          <th style={thStyle}>프로젝트 명</th>
          <td style={tdStyle}>{data?.doc_rep_pname}</td>
          <th style={thStyle}>작성일</th>
          <td style={tdStyle}>{data?.doc_rep_date.toString()}</td>
        </tr>
        <tr>
          <th style={thStyle}>작성자</th>
          <td style={tdStyle}>{data?.doc_rep_writer}</td>
          <th style={thStyle}>팀원 및 지도 교수</th>
          <td style={tdStyle}>{`${data?.doc_rep_member}\n${data?.doc_rep_professor}`}</td>
        </tr>
        
      </tbody>
    </table>

    <table style={tableStyle}>
      <tbody>
        <tr><th colSpan={4} style={thStyle}>문제 정의 및 연구 목표</th></tr>
        <tr><td colSpan={4} style={tdStyle}>{data?.doc_rep_research}</td></tr>
        <tr><th colSpan={4} style={thStyle}>설계 및 개발 과정</th></tr>
        <tr><td colSpan={4} style={tdStyle}>{data?.doc_rep_design}</td></tr>
        <tr><th colSpan={4} style={thStyle}>시스템 아키텍처</th></tr>
        <tr><td colSpan={4} style={tdStyle}>{data?.doc_rep_arch}</td></tr>
        <tr><th colSpan={4} style={thStyle}>실험 및 결과</th></tr>
        <tr><td colSpan={4} style={tdStyle}>{data?.doc_rep_result}</td></tr>
        <tr><th colSpan={4} style={thStyle}>결론</th></tr>
        <tr><td colSpan={4} style={tdStyle}>{data?.doc_rep_conclusion}</td></tr>
        
                 <tr>
      <td colSpan={4} style={thStyle}>추가 파일</td>
    </tr>
    <tr>
      <td colSpan={4} style={tdStyle}>
        {file.map((item, index) => (
          <div key={index}>
            <a
              onClick={() => DownloadFile(item.doc_a_name, item.doc_a_no, item.doc_type, item.doc_no, item.p_no)}
              style={{
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              }}
            >
              {limitTitle(item.doc_a_name, 40)}
            </a>
          </div>
        ))}
      </td>
    </tr>
    <tr style={{borderBottom: '0'}}>
                     <td colSpan={2} style={{borderBottom: '0'}}>
                         <div style={{margin: 'auto', float: 'right'}}>
                             <div style={{float: 'right', padding: '5px'}}><DocumentDownloadBtn d_type={DType.dType.report} d_no={data?.doc_rep_no || 0} d_name={data?.doc_rep_name || ''}/></div>
                         </div>
                     </td>
                 </tr>
      </tbody>
      
    </table>
  </div>)
    )
};


const containerStyle: CSSProperties = { display: "flex", flexDirection: "column", width: "100%" };
const layoutStyle: CSSProperties = { display: "flex", width: "100%" };
const contentStyle: CSSProperties = { padding: "20px", backgroundColor: "#fff", maxWidth: "2100px", width: "100%" };
const titleStyle: CSSProperties = { fontSize: "24px", fontWeight: "bold", color: "#4CAF50", textAlign: "center", marginBottom: "20px" };
const sectionHeaderStyle: CSSProperties = { backgroundColor: "#ddd", padding: "14px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
const buttonContainerStyle: CSSProperties = { display: "flex", justifyContent: "center", marginTop: "20px" };
const tdStyle: CSSProperties = { padding: "18px", border: "1px solid black", textAlign: "left" };


  const reportTitleStyle: CSSProperties = {
    width: "97%",  // 전체 너비 사용
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  };
  
  const projectNameStyle: CSSProperties = {
    width: "97%",  // 전체 너비 사용
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  };


  const TextAreaField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
    <textarea 
      value={value}
      onChange={(e) => setter(e.target.value)}
      style={{ width: "98%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", height: "100px" }}
    />
  );




  const editButtonStyle: CSSProperties = {
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "1px solid #ccc",
    padding: "6px 16px",
    height: "35px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    marginLeft: "10px",
    marginTop: "5px",
  };
  
