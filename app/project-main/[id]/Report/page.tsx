"use client";

import { CSSProperties, useState, useEffect, useRef } from "react";
import MainHeader from "@/app/components/MainHeader";
import MainSide from "@/app/components/MainSide";
import axios from "axios";
import { useRouter } from "next/navigation";
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

export default function ReportForm(props: any) {
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

  const [prof, setProf] = useState("");

  const [participants, setParticipants] = useState([{ name: "", studentId: "" }]);
  
    const [user, setUser] = useState<userList[]>([{
        univ_id: 0,
        role: '',
        name: '',
        permission: ''
      }]);

  const router = useRouter();
  const s_no = getUnivId();
  usePermissionGuard(props.params.id, s_no, { leader: 1, rp: 1 }, true);

  useEffect(() => {
    const loadProf = async() => {
      try{
          const response = await axios.post("https://cd-api.chals.kim/api/project/load_prof", {pid: props.params.id}, {headers:{Authorization: process.env.SECRET_API_KEY}});
          setProf(response.data.PAYLOAD.Result.f_name.toString())
      }catch(err){}
    }
    const getTeamData = async() => {
      try{
        const response = await axios.post<returnType>("https://cd-api.chals.kim/api/project/checkuser", {pid: props.params.id}, {headers:{Authorization: process.env.SECRET_API_KEY}});
        setUser(response.data.PAYLOADS);
      }catch(err){}
    }
    loadProf()
    getTeamData()
  }, [])

  useEffect(() => {
    console.log(prof)
  }, [prof])

  const handleSave = async () => {
    const data = {
      rname: reportTitle,
      pname: projectName,
      rdate: submissionDate,
      rwriter: writer,
      pmember: participants.map((p) => `${p.name},${p.studentId}`).join(";"),
      pprof: prof,
      presearch: `${problemDefinition}\n${researchGoal}`,
      pdesign: designProcess,
      parch: systemArchitecture,
      presult: experimentResults,
      pconc: conclusion,
      pid: props.params.id,
    };

    try {
      const response = await axios.post("https://cd-api.chals.kim/api/output/report_add", data, {
        headers: { Authorization: process.env.SECRET_API_KEY },
      });
      // router.push(`/project-main/${props.params.id}/outputManagement`);
      const tmpDoc = response.data.PAYLOADS.doc_rep_no
      handleUploadFile(tmpDoc)
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
    }
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
    formData.append('doc_type', '2')
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

  return (
    <div style={containerStyle}>
      <MainHeader pid={props.params.id} />
      <div style={layoutStyle}>
        <MainSide pid={props.params.id} />
        <div style={contentStyle}>
          <h2 style={titleStyle}>📑 보고서 작성 <SectionTooltip message="프로젝트의 경과와 성과를 요약 정리하여 보고 및 공유하는 문서입니다." /> </h2>

          <table style={tableStyle}>
            <tbody>
              <tr><td colSpan={4} style={sectionHeaderStyle}>📌 기본 정보</td></tr>
              <tr>
          <td style={thStyle}>보고서 제목<SectionTooltip message="보고서의 공식 제목을 입력하세요." /></td>
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
         <td style={thStyle}>프로젝트 명<SectionTooltip message="이 보고서가 속한 프로젝트 이름을 입력하세요." /></td>
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
                <td style={thStyle}>작성일<SectionTooltip message="보고서를 작성한 날짜를 입력하세요." /></td>
                <td style={tdStyle}><Field type="date" value={submissionDate} setter={setSubmissionDate} /></td>
                <td style={thStyle}>작성자<SectionTooltip message="보고서를 작성한 사람의 이름을 입력하세요." /></td>
                <td style={tdStyle}><Field value={writer} setter={setWriter} /></td>
              </tr>

              <tr><td colSpan={4} style={sectionHeaderStyle}>📌 보고서 세부 내용</td></tr>
              <tr>
                <td style={thStyle}>
                        팀원 및 지도 교수
                        <SectionTooltip message="회의에 참석한 사람의 이름과 학번을 입력하세요." />
                      </td>
                      <td colSpan={3} style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                          <label>
                            담당 교수: {prof}
                          </label>

                        </div>
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
                              <option value="">팀원 선택</option>
                              {user.map((u) => (
                                <option key={u.univ_id} value={u.name}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                
                            <label>학번:
                              <SectionTooltip message="팀원의 학번이 자동 입력됩니다." />
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
                        <button onClick={addParticipant} style={addButtonStyle}>팀원 추가</button>
                      </td>
                {/* <td colSpan={4} style={tdStyle}>
                <TextAreaField label="팀원 및 지도 교수" tooltip="프로젝트 팀원 및 지도 교수의 이름을 입력하세요." value={teamMembers} setter={setTeamMembers} />
              </td> */}
              </tr>
              <tr><td colSpan={4} style={tdStyle}>
                <TextAreaField label="문제 정의" tooltip="프로젝트에서 해결하고자 하는 문제를 명확히 작성하세요." value={problemDefinition} setter={setProblemDefinition} />
              </td></tr>
              <tr><td colSpan={4} style={tdStyle}>
                <TextAreaField label="연구 목표" tooltip="문제 해결을 위한 연구 목표를 구체적으로 작성하세요." value={researchGoal} setter={setResearchGoal} />
              </td></tr>
              <tr><td colSpan={4} style={tdStyle}>
                <TextAreaField label="설계 및 개발 과정" tooltip="설계, 개발 과정을 단계별로 작성하세요." value={designProcess} setter={setDesignProcess} />
              </td></tr>
              <tr><td colSpan={4} style={tdStyle}>
                <TextAreaField label="시스템 아키텍처" tooltip="개발된 시스템의 구조와 설계를 요약하세요." value={systemArchitecture} setter={setSystemArchitecture} />
              </td></tr>
              <tr><td colSpan={4} style={tdStyle}>
                <TextAreaField label="실험 및 결과" tooltip="실험 방법과 결과를 구체적으로 기술하세요." value={experimentResults} setter={setExperimentResults} />
              </td></tr>
              <tr><td colSpan={4} style={tdStyle}>
                <TextAreaField label="결론" tooltip="연구 결과를 요약하고 향후 방향을 제시하세요." value={conclusion} setter={setConclusion} />
              </td></tr>
            </tbody>
          </table>

          <div>
            <div style={formContainerStyle}>
              <div style={{ display: 'flex', width: '100%' }}>
                <span style={{ fontSize: '16px', color: '#6b7280', whiteSpace: 'pre-wrap', alignSelf: 'flex-start' }}>
                  {`프로젝트와 관련된 파일을 업로드하세요.\n한번에 여러개의 파일을 업로드할 수 있습니다.`}
                  <SectionTooltip message="관련 문서나 참고 파일을 업로드하세요. 여러 개의 파일 업로드가 가능합니다." />
                </span>
                <div style={{ marginLeft: 'auto', width: '40%' }}>
                  <input type="file" multiple onChange={handleFileChange} style={fileInputStyle} ref={fileInputRef} />
                </div>
              </div>
              <button onClick={handleResetFile} style={uploadButtonStyle}>📤 제거</button>
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

/* ✅ 스타일 정의 */
const containerStyle: CSSProperties = { display: "flex", flexDirection: "column", width: "100%" };
const layoutStyle: CSSProperties = { display: "flex", width: "100%" };
const contentStyle: CSSProperties = { padding: "20px", backgroundColor: "#fff", maxWidth: "2100px", width: "100%" };
const titleStyle: CSSProperties = { fontSize: "24px", fontWeight: "bold", color: "#4CAF50", textAlign: "center", marginBottom: "20px" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const sectionHeaderStyle: CSSProperties = { backgroundColor: "#ddd", padding: "14px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
const thStyle: CSSProperties = { backgroundColor: "#ddd", padding: "14px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
const tdStyle: CSSProperties = { padding: "18px", border: "1px solid black", textAlign: "left" };
const buttonContainerStyle: CSSProperties = { display: "flex", justifyContent: "center", marginTop: "20px" };
const deleteButtonStyle: CSSProperties = { backgroundColor: "#f44336", color: "#fff", border: "none", padding: "8px 12px", cursor: "pointer", borderRadius: "5px", marginLeft: "25px" };
const addButtonStyle: CSSProperties = { backgroundColor: "#4CAF50", color: "#fff", border: "none", padding: "10px", cursor: "pointer", borderRadius: "5px", marginTop: "5px" };


const reportTitleStyle: CSSProperties = {
  width: "98.5%",  // 전체 너비 사용
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
};

const projectNameStyle: CSSProperties = {
  width: "98.5%",  // 전체 너비 사용
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
};



/* ✅ 컴포넌트 정의 */
const Field = ({ value, setter, type = "text" }: { value: string; setter: (value: string) => void; type?: string }) => (
  <input type={type} value={value} onChange={(e) => setter(e.target.value)} style={{ width: "98%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
);

const TextAreaField = ({ label, tooltip, value, setter }: { label: string; tooltip: string; value: string; setter: (value: string) => void }) => (
  <div>
    <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
      {label} <SectionTooltip message={tooltip} />
    </label>
    <textarea
      value={value}
      onChange={(e) => setter(e.target.value)}
      style={{
        width: "99%",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        height: "100px",
      }}
    />
  </div>
);


const ActionButton = ({ label, onClick, color }: { label: string; onClick: () => void; color: string }) => (
  <button onClick={onClick} style={{ backgroundColor: color, color: "#fff", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>{label}</button>
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