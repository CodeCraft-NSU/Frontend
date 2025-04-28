"use client";

import { CSSProperties, useState, useEffect, useRef } from "react";
import MainHeader from "@/app/components/MainHeader";
import MainSide from "@/app/components/MainSide";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getUnivId } from "@/app/util/storage";
import usePermissionGuard from "@/app/util/usePermissionGuard";
import SectionTooltip from "@/app/components/SectionTooltip"


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

export default function ProjectOverview(props: any) {
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
  

  const router = useRouter();
  const s_no = getUnivId();

  const [user, setUser] = useState<userList[]>([{
    univ_id: 0,
    role: '',
    name: '',
    permission: ''
  }]);

  useEffect(() => {
    const getTeamData = async() => {
      try{
        const response = await axios.post<returnType>("https://cd-api.chals.kim/api/project/checkuser", {pid: props.params.id}, {headers:{Authorization: process.env.SECRET_API_KEY}});
        setUser(response.data.PAYLOADS);
      }catch(err){}
    }
    getTeamData()
  }, [])

  usePermissionGuard(props.params.id, s_no, { leader: 1, od: 1 }, true);

  const handleSave = async () => {
    const data = {
      pname: title,
      pteam: teamMembers.map((tm) => `${tm.name} (${tm.role})`).join(", "),
      poverview: overview,
      poutcomes: expectedOutcomes,
      pgoals: goal,
      pstart: startDate,
      pend: endDate,
      pcreated: createdDate,
      prange: scope,
      pstack: techStack, // ✅ 기술 스택 저장
      pid: props.params.id,
      add_date: createdDate
    };

    if (Object.values(data).some((value) => !value)) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post("https://cd-api.chals.kim/api/output/ovr_doc_add", data, {
        headers: { Authorization: process.env.SECRET_API_KEY },
      });
      const tmpDoc = response.data.PAYLOADS.doc_s_no
      handleUploadFile(tmpDoc)
      // router.push(`/project-main/${props.params.id}/outputManagement`);
    } catch (err) {
      alert("문서 저장 중 오류가 발생했습니다.");
    }
  };

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

  const [tmpfile, setFile] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleResetFile = () => {
    setFile([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setFile(Array.from(e.target.files));
    }
  };

  const handleUploadFile = async (doc_id: number) => {
    if (tmpfile.length === 0) {
        router.push(`/project-main/${props.params.id}/outputManagement`);
        return;
    }
    const tmppid: number = props.params.id;
    const tmpunivid = getUnivId();
    const formData = new FormData();
    tmpfile.forEach((file) => {
        formData.append('files', file);
    });
    formData.append('p_no', tmppid.toString());
    formData.append('doc_no', doc_id.toString())
    formData.append('doc_type', '0')
    formData.append('univ_id', tmpunivid.toString());

    try {
        const response = await axios.post(
            'https://cd-api.chals.kim/api/output/attach_add',
            formData,
            { headers: { Authorization: process.env.SECRET_API_KEY } }
        );
            router.push(`/project-main/${props.params.id}/outputManagement`);
    } catch (err) {
        alert('❌ 파일 업로드 실패');
    }
  };

  return (
    <div style={outerContainerStyle}>
      <MainHeader pid={props.params.id} />
      <div style={layoutContainerStyle}>
        <MainSide pid={props.params.id} />
        <div style={contentContainerStyle}>
        <h2 style={sectionHeaderStyle}>
        📄 프로젝트 개요서
         <SectionTooltip message="해당 프로젝트에 대한 전체 개요를 입력하는 항목입니다. 목적, 일정, 인원 등을 포함하세요." />
</h2>
          

          <table style={tableStyle}>
            <tbody>
              {/* 프로젝트 기본 정보 */}
              <tr>
                <td style={thStyle}>제목  <SectionTooltip message="프로젝트 제목을 입력하세요. 명확하고 간결하게 작성하세요." /> </td>
                <td colSpan={3} style={tdStyle}><TitleField value={title} setter={setTitle} /></td>
              </tr>
              <tr>
                <td style={thStyle}>프로젝트 시작일 <SectionTooltip message="프로젝트 시작일을 설정하세요." /></td>
                <td style={tdStyle}><Field type="date" value={startDate} setter={setStartDate} /></td>
                <td style={thStyle}>프로젝트 종료일 <SectionTooltip message="프로젝트 종료일을 설정하세요." /></td>
                <td style={tdStyle}><Field type="date" value={endDate} setter={setEndDate} /></td>
              </tr>
              <tr>
              <td style={thStyle}>작성일 <SectionTooltip message="문서 작성일을 설정하세요. 일반적으로 오늘 날짜를 입력합니다." /></td>
                 <td colSpan={3} style={tdStyle}><DateField value={createdDate} setter={setCreatedDate} /></td>
                </tr>


              {/* 팀 구성 및 역할 분담 */}
              <tr><td colSpan={4} style={thStyle}>팀 구성 및 역할 분담 <SectionTooltip message="팀원 이름을 선택하시면 자동으로 학번이 기입됩니다." /> </td></tr>
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
              <tr><td colSpan={4} style={thStyle}>프로젝트 개요<SectionTooltip message="프로젝트의 전반적인 내용을 요약하여 작성하세요." /></td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={overview} setter={setOverview} /></td></tr>

              {/* 프로젝트 목표 */}
              <tr><td colSpan={4} style={thStyle}>프로젝트 목표<SectionTooltip message="프로젝트를 통해 달성하고자 하는 주요 목표를 작성하세요." /></td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={goal} setter={setGoal} /></td></tr>

              {/* 프로젝트 범위 */}
              <tr><td colSpan={4} style={thStyle}>프로젝트 범위<SectionTooltip message="프로젝트의 작업 범위 및 제외 항목을 명시하세요." /></td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={scope} setter={setScope} /></td></tr>

              {/* ✅ 기술 스택 */}
              <tr><td colSpan={4} style={thStyle}>기술 스택<SectionTooltip message="사용 예정인 언어, 프레임워크, 라이브러리 등을 입력하세요." /></td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={techStack} setter={setTechStack} /></td></tr>

              {/* ✅ 기대 성과 */}
              <tr><td colSpan={4} style={thStyle}>기대 성과<SectionTooltip message="프로젝트 완료 시 기대하는 결과나 효과를 작성하세요." /></td></tr>
              <tr><td colSpan={4} style={tdStyle}><TextAreaField value={expectedOutcomes} setter={setExpectedOutcomes} /></td></tr>
            </tbody>
          </table>
          <div>
                    <div style={formContainerStyle}>
                      <div style={{display: 'flex', width: '100%'}}>
                        <span style={{ fontSize: '16px', color: '#6b7280', whiteSpace: 'pre-wrap', alignSelf: 'flex-start' }}>
                            {`프로젝트와 관련된 파일을 업로드하세요.\n한번에 여러개의 파일을 업로드할 수 있습니다.`}
                            <SectionTooltip message="문서와 관련된 참고자료, 이미지, 추가 문서를 업로드하세요. 여러 파일을 지원합니다." />
                        </span>
                        <div style={{marginLeft: 'auto', width: '40%'}}>
                        <input type="file" multiple onChange={handleFileChange} style={fileInputStyle} ref={fileInputRef} />
                        </div>
                        
                      </div>
                        
                        <button onClick={handleResetFile} style={uploadButtonStyle}>
                            📤 제거
                        </button>
                    </div>
                </div>
          <div style={buttonContainerStyle}>
            <ActionButton label="저장" onClick={handleSave} color="#2196F3" />
          </div>
        </div>
      </div>
      
    </div>
  );
}






const outerContainerStyle: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", width: "100%" };
const layoutContainerStyle: CSSProperties = { display: "flex", width: "100%" };
const contentContainerStyle: CSSProperties = { padding: "30px", backgroundColor: "#fff", maxWidth: "2100px", width: "100%" };
const sectionHeaderStyle: CSSProperties = { fontSize: "24px", fontWeight: "bold", color: "#4CAF50" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thStyle: CSSProperties = { backgroundColor: "#ddd", padding: "14px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
const tdStyle: CSSProperties = { padding: "8px", border: "1px solid black", textAlign: "left" };
const buttonContainerStyle: CSSProperties = { display: "flex", justifyContent: "center", marginTop: "20px" };
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

/* ✅ 텍스트 영역 */
const TextAreaField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
  <textarea value={value} onChange={(e) => setter(e.target.value)} style={{ width: "98%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", height: "100px" }} />
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
  width: '98%',
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
