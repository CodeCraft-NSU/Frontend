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

export default function MeetingMinutesForm(props: any) {
  const [agenda, setAgenda] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [location, setLocation] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [meetingContent, setMeetingContent] = useState("");
  const [meetingResult, setMeetingResult] = useState("");
  const [participants, setParticipants] = useState([{ name: "", studentId: "" }]);

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

  const router = useRouter();
  const s_no = getUnivId();

  usePermissionGuard(props.params.id, s_no, { leader: 1, mm: 1 }, true);

  const handleSave = async () => {
    const data = {
      main_agenda: agenda,
      date_time: meetingDate,
      location,
      responsible_person: responsiblePerson,
      meeting_content: meetingContent,
      meeting_outcome: meetingResult,
      participants: participants.map((p) => `${p.name},${p.studentId}`).join(";"),
      pid: props.params.id,
    };

    try {
      const response = await axios.post("https://cd-api.chals.kim/api/output/mm_add", data, {
        headers: { Authorization: process.env.SECRET_API_KEY },
      });
      // router.push(`/project-main/${props.params.id}/outputManagement`);
      const tmpDoc = response.data.PAYLOADS.doc_m_no
      if (tmpfile.length === 0) {
        router.push(`/project-main/${props.params.id}/outputManagement`);
      }else{
        handleUploadFile(tmpDoc)
      }
      
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
    formData.append('doc_type', '1')
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
          <h2 style={sectionHeaderStyle}>📄 회의록 작성 <SectionTooltip message="회의에서 논의된 내용과 결정 사항을 기록하고 후속 작업을 관리합니다." /> </h2>

          <table style={tableStyle}>
  <tbody>
    <tr>
      <td style={thStyle}>
        안건
        <SectionTooltip message="회의의 주요 주제를 입력하세요." />
      </td>
      <td colSpan={3} style={tdStyle}><Field value={agenda} setter={setAgenda} /></td>
    </tr>
    <tr>
      <td style={thStyle}>
        회의 날짜
        <SectionTooltip message="회의가 열린 날짜를 입력하세요." />
      </td>
      <td style={tdStyle}><Field type="date" value={meetingDate} setter={setMeetingDate} /></td>
    </tr>
    <tr>
      <td style={thStyle}>
        장소
        <SectionTooltip message="회의가 진행된 장소를 입력하세요." />
      </td>
      <td colSpan={3} style={tdStyle}><Field value={location} setter={setLocation} /></td>
    </tr>
    <tr>
      <td style={thStyle}>
        책임자명
        <SectionTooltip message="회의 진행 책임자의 이름을 입력하세요." />
      </td>
      <td colSpan={3} style={tdStyle}><Field value={responsiblePerson} setter={setResponsiblePerson} /></td>
    </tr>

    <tr>
      <td colSpan={4} style={thStyle}>
        회의 내용
        <SectionTooltip message="논의된 주요 내용을 상세히 작성하세요." />
      </td>
    </tr>
    <tr><td colSpan={4} style={tdStyle}><TextAreaField value={meetingContent} setter={setMeetingContent} /></td></tr>

    <tr>
      <td colSpan={4} style={thStyle}>
        회의 결과
        <SectionTooltip message="회의 결과와 결정사항을 요약하세요." />
      </td>
    </tr>
    <tr><td colSpan={4} style={tdStyle}><TextAreaField value={meetingResult} setter={setMeetingResult} /></td></tr>

    <tr>
      <td style={thStyle}>
        참석자
        <SectionTooltip message="회의에 참석한 사람의 이름과 학번을 입력하세요." />
      </td>
      <td colSpan={3} style={tdStyle}>
        {participants.map((participant, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
            <label>성명:
              <SectionTooltip message="참석자 이름을 선택하세요." />
            </label>
            <select
              value={participant.name}
              onChange={(e) => updateParticipant(index, "name", e.target.value)}
              style={participantNameStyle}
            >
              <option value="">참석자 선택</option>
              {user.map((u) => (
                <option key={u.univ_id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>

            <label>학번:
              <SectionTooltip message="참석자의 학번이 자동 입력됩니다." />
            </label>
            <input
              type="text"
              value={participant.studentId}
              readOnly
              style={participantIdStyle}
            />

            <button onClick={() => removeParticipant(index)} style={deleteButtonStyle}>삭제</button>
          </div>
        ))}
        <button onClick={addParticipant} style={addButtonStyle}>참석자 추가</button>
      </td>
    </tr>
  </tbody>
</table>

          <div>
                    <div style={formContainerStyle}>
                      <div style={{display: 'flex', width: '100%'}}>
                        <span style={{ fontSize: '16px', color: '#6b7280', whiteSpace: 'pre-wrap', alignSelf: 'flex-start' }}>
                            {`프로젝트와 관련된 파일을 업로드하세요.\n한번에 여러개의 파일을 업로드할 수 있습니다.`}
                            <SectionTooltip message="회의록과 관련된 파일을 업로드하세요. 여러 파일 업로드가 가능합니다." />
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






/* ✅ 스타일 */
const outerContainerStyle: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", width: "100%" };
const layoutContainerStyle: CSSProperties = { display: "flex", width: "100%" };
const contentContainerStyle: CSSProperties = { padding: "20px", backgroundColor: "#fff", maxWidth: "2100px", width: "100%" };
const sectionHeaderStyle: CSSProperties = { fontSize: "24px", fontWeight: "bold", color: "#4CAF50" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thStyle: CSSProperties = { backgroundColor: "#ddd", padding: "14px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
const tdStyle: CSSProperties = { padding: "18px", border: "1px solid black", textAlign: "left" };
const buttonContainerStyle: CSSProperties = { display: "flex", justifyContent: "center", marginTop: "20px", gap: "10px" };
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


/* ✅ 입력 필드 */
const Field = ({ label, value, setter, type = "text" }: { label?: string; value: string; setter: (value: string) => void; type?: string }) => (
  <div>
    {label && <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>{label}:</label>}
    <input type={type} value={value} onChange={(e) => setter(e.target.value)} style={{ width: "99%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
  </div>
);

/* ✅ 텍스트 영역 */
const TextAreaField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
  <textarea value={value} onChange={(e) => setter(e.target.value)} style={{ width: "99%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", height: "100px" }} />
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