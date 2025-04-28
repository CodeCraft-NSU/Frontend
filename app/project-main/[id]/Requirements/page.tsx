"use client";

import { CSSProperties, useRef, useState } from "react";
import MainHeader from "@/app/components/MainHeader";
import MainSide from "@/app/components/MainSide";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getUnivId } from "@/app/util/storage";
import usePermissionGuard from "@/app/util/usePermissionGuard";
import SectionTooltip from "@/app/components/SectionTooltip"

type postType = {
  feature_name: string
    description: string
    priority: number
    non_functional_requirement_name: string
    non_functional_description: string
    non_functional_priority: number
    system_item: string
    system_description: string
    pid: number
    doc_r_no: number
    add_date: string
}

export default function RequirementsForm(props: any) {
  const [creationDate, setCreationDate] = useState("");
  const [systemRequirements, setSystemRequirements] = useState("");
  const [systemDes, setSystemDes] = useState("");
  const [functionalRequirements, setFunctionalRequirements] = useState("");
  const [functionalDes, setFunctionalDes] = useState("");
  const [functionalRequirementsPriority, setFunctionalRequirementsPriority] = useState<number>(1);
  const [nonFunctionalRequirements, setNonFunctionalRequirements] = useState("");
  const [nonFunctionalDes, setNonFunctionalDes] = useState("");
  const [nonFunctionalRequirementsPriority, setNonFunctionalRequirementsPriority] = useState<number>(1);

  const router = useRouter();
  const s_no = getUnivId();

  usePermissionGuard(props.params.id, s_no, { leader: 1, rs: 1 }, true);

  const handleSave = async () => {
    const data: postType = {
      feature_name: functionalRequirements,
      description: functionalDes,
      priority: functionalRequirementsPriority,
      non_functional_requirement_name: nonFunctionalRequirements,
      non_functional_description: nonFunctionalDes,
      non_functional_priority: nonFunctionalRequirementsPriority,
      system_item: systemRequirements,
      system_description: systemDes,
      pid: props.params.id,
      doc_r_no: 0,
      add_date: creationDate
    };

    try {
      const response = await axios.post("https://cd-api.chals.kim/api/output/reqspec_add", data, {
        headers: { Authorization: process.env.SECRET_API_KEY },
      });
      // router.push(`/project-main/${props.params.id}/outputManagement`);
      const tmpDoc = response.data.PAYLOADS.doc_r_no
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
    formData.append('doc_type', '3')
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
          <h2 style={sectionHeaderStyle}>📝 요구사항 작성 <SectionTooltip message="사용자의 니즈를 바탕으로 시스템이 제공해야 할 기능을 정리한 기술 문서입니다." /></h2>

          <table style={tableStyle}>
            <tbody>
              <tr><td colSpan={4} style={sectionThStyle}>📌 기본 정보</td></tr>
              <tr>
                <td style={thStyle}>
                  작성일
                  <SectionTooltip message="문서를 작성한 날짜를 입력하세요." />
                </td>
                <td colSpan={3} style={tdStyle}><Field type="date" value={creationDate} setter={setCreationDate} /></td>
              </tr>

              <tr><td colSpan={4} style={sectionThStyle}>📌 시스템 요구사항</td></tr>
              <tr>
                <td style={thStyle}>
                  요구사항
                  <SectionTooltip message="시스템이 갖춰야 할 필수 기능을 입력하세요." />
                </td>
                <td colSpan={3} style={tdStyle}><TextAreaField value={systemRequirements} setter={setSystemRequirements} /></td>
              </tr>
              <tr>
                <td style={thStyle}>
                  설명
                  <SectionTooltip message="시스템 요구사항에 대한 상세 설명을 작성하세요." />
                </td>
                <td colSpan={3} style={tdStyle}><TextAreaField value={systemDes} setter={setSystemDes} /></td>
              </tr>

              <tr><td colSpan={4} style={sectionThStyle}>📌 기능 요구사항</td></tr>
              <tr>
                <td style={thStyle}>
                  요구사항
                  <SectionTooltip message="사용자가 시스템에서 수행할 수 있어야 하는 주요 기능을 작성하세요." />
                </td>
                <td colSpan={3} style={tdStyle}><TextAreaField value={functionalRequirements} setter={setFunctionalRequirements} /></td>
              </tr>
              <tr>
                <td style={thStyle}>
                  설명
                  <SectionTooltip message="기능 요구사항에 대한 세부 설명을 작성하세요." />
                </td>
                <td colSpan={3} style={tdStyle}><TextAreaField value={functionalDes} setter={setFunctionalDes} /></td>
              </tr>
              <tr>
                <td style={thStyle}>
                  우선순위
                  <SectionTooltip message="기능 요구사항의 중요도를 설정하세요. 1:낮음, 2:보통, 3:높음" />
                </td>
                <td colSpan={3} style={tdStyle}>
                  <select value={functionalRequirementsPriority} onChange={(e) => setFunctionalRequirementsPriority(Number(e.target.value))} style={selectStyle}>
                    <option value={1}>낮음 (1)</option>
                    <option value={2}>보통 (2)</option>
                    <option value={3}>높음 (3)</option>
                  </select>
                </td>
              </tr>

              <tr><td colSpan={4} style={sectionThStyle}>📌 비기능 요구사항</td></tr>
              <tr>
                <td style={thStyle}>
                  요구사항
                  <SectionTooltip message="성능, 보안성, 신뢰성 등 기능 이외의 요구사항을 작성하세요." />
                </td>
                <td colSpan={3} style={tdStyle}><TextAreaField value={nonFunctionalRequirements} setter={setNonFunctionalRequirements} /></td>
              </tr>
              <tr>
                <td style={thStyle}>
                  설명
                  <SectionTooltip message="비기능 요구사항에 대한 세부 설명을 작성하세요." />
                </td>
                <td colSpan={3} style={tdStyle}><TextAreaField value={nonFunctionalDes} setter={setNonFunctionalDes} /></td>
              </tr>
              <tr>
                <td style={thStyle}>
                  우선순위
                  <SectionTooltip message="비기능 요구사항의 중요도를 설정하세요. 1:낮음, 2:보통, 3:높음" />
                </td>
                <td colSpan={3} style={tdStyle}>
                  <select value={nonFunctionalRequirementsPriority} onChange={(e) => setNonFunctionalRequirementsPriority(Number(e.target.value))} style={selectStyle}>
                    <option value={1}>낮음 (1)</option>
                    <option value={2}>보통 (2)</option>
                    <option value={3}>높음 (3)</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div>
            <div style={formContainerStyle}>
              <div style={{ display: 'flex', width: '100%' }}>
                <span style={{ fontSize: '16px', color: '#6b7280', whiteSpace: 'pre-wrap', alignSelf: 'flex-start' }}>
                  {`프로젝트와 관련된 파일을 업로드하세요.\n한번에 여러개의 파일을 업로드할 수 있습니다.`}
                  <SectionTooltip message="요구사항과 관련된 문서를 업로드하세요. 여러 파일 업로드가 가능합니다." />
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


const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const selectStyle: CSSProperties = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", cursor: "pointer" };
const thStyle: CSSProperties = { backgroundColor: "#ddd", padding: "8px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
const tdStyle: CSSProperties = { padding: "8px", border: "1px solid black", textAlign: "left" };
const outerContainerStyle: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", width: "100%" };
const layoutContainerStyle: CSSProperties = { display: "flex", width: "100%" };
const contentContainerStyle: CSSProperties = { padding: "20px", backgroundColor: "#fff", maxWidth: "2100px", width: "100%" };
const buttonContainerStyle: CSSProperties = { display: "flex", justifyContent: "center", marginTop: "20px" };
const sectionThStyle: CSSProperties = { backgroundColor: "#ddd", padding: "14px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
const sectionHeaderStyle: CSSProperties = { fontSize: "24px", fontWeight: "bold", color: "#4CAF50", marginBottom: "20px" };


const Field = ({ value, setter, type = "text" }: { value: string; setter: (value: string) => void; type?: string }) => (
  <input type={type} value={value} onChange={(e) => setter(e.target.value)} style={{ width: "calc(99% - 10px)", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
);

const TextAreaField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
  <textarea value={value} onChange={(e) => setter(e.target.value)} style={{ width: "calc(99% - 10px)", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", height: "100px" }} />
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