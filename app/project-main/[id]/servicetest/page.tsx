'use client';

import { CSSProperties, useEffect, useRef, useState } from "react";
import MainHeader from "@/app/components/MainHeader";
import MainSide from "@/app/components/MainSide";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getUnivId } from "@/app/util/storage";
import usePermissionGuard from "@/app/util/usePermissionGuard";
import React from "react";
import SectionTooltip from "@/app/components/SectionTooltip"



// 테스트 항목 타입 (하위 항목)
type TestCase = {
  doc_t_name: string;      // 테스트 제목
  doc_t_start: string;
  doc_t_end: string;
  doc_t_pass: number;
};

// 그룹(대분류) 타입
type TestGroup = {
  doc_t_group1: string;    // 그룹(대분류) 이름
  // doc_t_group1no는 저장 시 자동 할당 (그룹의 배열 인덱스 사용)
  testCases: TestCase[];
};

type returnTest = {
  RESULT_CODE: number;
  RESULT_MSG: string;
  PAYLOADS: testType[];
};

type testType = {
  doc_t_no: number;
  doc_t_group1: string;
  doc_t_name: string;
  doc_t_start: string;
  doc_t_end: string;
  doc_t_pass: number; // 혹은 boolean
  doc_t_group1no: number;
};

export default function ServiceTestForm(props: any) {
  // 초기 그룹: 하나의 그룹에 하나의 테스트 항목
  const [testGroups, setTestGroups] = useState<TestGroup[]>([{
    doc_t_group1: "",
    testCases: [{
      doc_t_name: "",
      doc_t_start: "",
      doc_t_end: "",
      doc_t_pass: 0,
    }]
  }]);

  const router = useRouter();
  const s_no = getUnivId();
  usePermissionGuard(props.params.id, s_no, { leader: 1, ut: 1 }, true);

  // 그룹 추가 함수
  const addTestGroup = () => {
    setTestGroups(prev => [
      ...prev,
      {
        doc_t_group1: "",
        testCases: [{
          doc_t_item: "",
          doc_t_name: "",
          doc_t_start: "",
          doc_t_end: "",
          doc_t_pass: 0,
        }]
      }
    ]);
  };

  // 그룹 삭제 함수
  const removeTestGroup = (groupIndex: number) => {
    setTestGroups(prev => prev.filter((_, index) => index !== groupIndex));
  };

  // 그룹 내에 테스트 항목 추가 함수
  const addTestCaseToGroup = (groupIndex: number) => {
    setTestGroups(prev => prev.map((group, index) => {
      if (index === groupIndex) {
        return {
          ...group,
          testCases: [
            ...group.testCases,
            { doc_t_item: "", doc_t_name: "", doc_t_start: "", doc_t_end: "", doc_t_pass: 0 }
          ]
        };
      }
      return group;
    }));
  };

  // 그룹 내 테스트 항목 삭제 함수
  const removeTestCaseFromGroup = (groupIndex: number, caseIndex: number) => {
    setTestGroups(prev => prev.map((group, index) => {
      if (index === groupIndex) {
        return {
          ...group,
          testCases: group.testCases.filter((_, i) => i !== caseIndex)
        };
      }
      return group;
    }));
  };

  // 그룹 필드 변경 함수 (대분류 이름만 변경)
  const handleGroupChange = (
    groupIndex: number, 
    field: "doc_t_group1", 
    value: string
  ) => {
    setTestGroups(prev => prev.map((group, index) => {
      if (index === groupIndex) {
        return {
          ...group,
          [field]: value,
        };
      }
      return group;
    }));
  };

  // 테스트 항목 필드 변경 함수
  const handleTestCaseChange = (
    groupIndex: number, 
    caseIndex: number, 
    field: keyof TestCase, 
    value: string
  ) => {
    setTestGroups(prev => prev.map((group, gIndex) => {
      if (gIndex === groupIndex) {
        const updatedCases = group.testCases.map((testCase, tIndex) => {
          if (tIndex === caseIndex) {
            return {
              ...testCase,
              [field]: field === "doc_t_pass" ? Number(value) : value,
            };
          }
          return testCase;
        });
        return { ...group, testCases: updatedCases };
      }
      return group;
    }));
  };

  // 저장 함수: 각 그룹의 테스트 항목들을 평탄화(flat)하여 하나의 배열로 만들어 백엔드에 전송  
  // 여기서 대분류 번호는 그룹의 배열 인덱스(0부터 시작)를 사용합니다.
  const handleSave = async () => {
    const testcasesFlat = testGroups.flatMap((group, index) =>
      group.testCases.map(tc => ({
        ...tc,
        doc_t_group1: group.doc_t_group1,
        doc_t_group1no: index, // 자동 순차 번호
      }))
    );

    const data = {
      testcases: testcasesFlat,
      pid: props.params.id,
    };

    try {
      const response = await axios.post("https://cd-api.chals.kim/api/output/testcase_update", data, {
        headers: { Authorization: process.env.SECRET_API_KEY },
      });
      alert('저장이 완료 되었습니다.')
      router.push(`/project-main/${props.params.id}/outputManagement`);
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const loadTestCases = async () => {
    try {
      const postData = { pid: props.params.id };
      const response = await axios.post<returnTest>(
        "https://cd-api.chals.kim/api/output/testcase_load",
        postData,
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
      const testCases = response.data.PAYLOADS;
  
      // INITTEST 그룹이 있으면, 기본값만 가진 하나의 그룹으로 세팅하고 종료 요거 백엔드에서 데이터 받고있나요..? 지워도 계속 남아있던데데
      if (testCases.some((tc) => tc.doc_t_group1 === "INITTEST")) {
        setTestGroups([{
          doc_t_group1: "", 
          testCases: [{
            doc_t_name: "",
            doc_t_start: "",
            doc_t_end: "",
            doc_t_pass: 0,
          }],
        }]);
        return;
      }
  
      // 그렇지 않으면 정상적으로 그룹핑
      const groupsMap: Record<string, TestGroup> = {};
      testCases.forEach((tc) => {
        const groupKey = tc.doc_t_group1;
        if (!groupsMap[groupKey]) {
          groupsMap[groupKey] = { doc_t_group1: groupKey, testCases: [] };
        }
        groupsMap[groupKey].testCases.push({
          doc_t_name: tc.doc_t_name,
          doc_t_start: tc.doc_t_start,
          doc_t_end: tc.doc_t_end,
          doc_t_pass: tc.doc_t_pass,
        });
      });
  
      setTestGroups(Object.values(groupsMap));
    } catch (error) {
      console.error("테스트케이스 로드 에러:", error);
    }
  };

  useEffect(() => {
    loadTestCases();
  }, []);

  return (
    <div style={outerContainerStyle}>
      <MainHeader pid={props.params.id} />
      <div style={layoutContainerStyle}>
        <MainSide pid={props.params.id} />
        <div style={contentContainerStyle}>
          <h2 style={sectionHeaderStyle}>📝테스트 케이스 작성 <SectionTooltip message="시스템 기능이 요구사항대로 동작하는지 검증하기 위한 테스트 시나리오입니다." /> </h2>

          {testGroups.map((group, groupIndex) => (
            <div key={groupIndex} style={groupContainerStyle}>
              <div style={groupHeaderStyle}>
                <label>항목:  <SectionTooltip message={"테스트 항목 그룹명별로 구분할 수 있습니다.\n테스트 시나리오의 제목과 완료 여부, 기간을 설정해주세요."} />  </label>
                <input
                  type="text"
                  value={group.doc_t_group1}
                  onChange={(e) => handleGroupChange(groupIndex, "doc_t_group1", e.target.value)}
                  style={groupInputStyle}
                />
                <button onClick={() => removeTestGroup(groupIndex)} style={deleteButtonStyle}>
                  그룹 삭제
                </button>
              </div>
              <table style={tableStyle}>
                <tbody style={{width: '100%'}}>
                  {group.testCases.map((tc, caseIndex) => (
                    <React.Fragment key={caseIndex}>
                      <tr>
                        <td style={thStyle}>테스트 제목</td>
                        <td colSpan={2} style={tdStyle}>
                          <input
                            type="text"
                            value={tc.doc_t_name}
                            onChange={(e) => handleTestCaseChange(groupIndex, caseIndex, "doc_t_name", e.target.value)}
                            style={{ width: "90%", padding: "8px" }}
                          />
                        </td>
                        <td style={thStyle}>테스트 통과 여부</td>
                        <td style={tdStyle}>
                          <input
                            type="checkbox"
                            checked={tc.doc_t_pass === 1}
                            onChange={(e) =>
                              handleTestCaseChange(groupIndex, caseIndex, "doc_t_pass", e.target.checked ? "1" : "0")
                            }
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={thStyle}>테스트 시작일</td>
                        <td style={tdStyle}>
                          <input
                            type="date"
                            value={tc.doc_t_start}
                            onChange={(e) => handleTestCaseChange(groupIndex, caseIndex, "doc_t_start", e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </td>
                        <td style={thStyle}>테스트 종료일</td>
                        <td style={tdStyle}>
                          <input
                            type="date"
                            value={tc.doc_t_end}
                            onChange={(e) => handleTestCaseChange(groupIndex, caseIndex, "doc_t_end", e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => removeTestCaseFromGroup(groupIndex, caseIndex)} style={deleteButtonStyle}>
                            삭제
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <button onClick={() => addTestCaseToGroup(groupIndex)} style={addButtonStyle}>
                테스트 항목 추가
              </button>
            </div>
          ))}

          <div style={{ marginTop: "20px" }}>
            <button onClick={addTestGroup} style={addButtonStyle}>
              그룹 추가
            </button>
            <button onClick={handleSave} style={{ ...addButtonStyle, backgroundColor: "#2196F3", marginLeft: "10px" }}>
              저장
            </button>
          </div>

          {/* <div style={formContainerStyle}>
            <div style={{ display: "flex", width: "100%" }}>
              <span style={{ fontSize: "16px", color: "#6b7280", whiteSpace: "pre-wrap", alignSelf: "flex-start" }}>
                {`프로젝트와 관련된 파일을 업로드하세요.\n한번에 여러개의 파일을 업로드할 수 있습니다.`}
              </span>
              <div style={{ marginLeft: "auto", width: "40%" }}>
                <input type="file" multiple onChange={handleFileChange} style={fileInputStyle} ref={fileInputRef} />
              </div>
            </div>

            <button onClick={handleResetFile} style={uploadButtonStyle}>
              📤 제거
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

const outerContainerStyle: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", width: "100%" };
const layoutContainerStyle: CSSProperties = { display: "flex", width: "100%" };
const contentContainerStyle: CSSProperties = { padding: "20px", backgroundColor: "#fff", maxWidth: "2100px", width: "100%" };
const sectionHeaderStyle: CSSProperties = { fontSize: "24px", fontWeight: "bold", color: "#4CAF50" };
const tableStyle: CSSProperties = { width: "95%", borderCollapse: "collapse", tableLayout: "fixed" };
const thStyle: CSSProperties = { backgroundColor: "#ddd", padding: "14px", border: "1px solid black", fontWeight: "bold", textAlign: "center" };
const tdStyle: CSSProperties = { padding: "8px", border: "1px solid black", textAlign: "left" };
const buttonContainerStyle: CSSProperties = { display: "flex", justifyContent: "center", marginTop: "20px" };

const deleteButtonStyle: CSSProperties = {
  backgroundColor: "#f44336",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  cursor: "pointer",
  borderRadius: "5px",
  minWidth: "60px"
};
const addButtonStyle: CSSProperties = { backgroundColor: "#4CAF50", color: "#fff", border: "none", padding: "10px", cursor: "pointer", borderRadius: "5px", marginTop: "5px" };
const teamMemberRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: "15px", width: "100%", marginBottom: "8px" };

const formContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "15px",
  width: "90%",
  padding: "20px",
  backgroundColor: "#f3f4f6",
  borderRadius: "10px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
} as const;

const fileInputStyle = {
  width: "calc(100% - 22px)",
  padding: "10px",
  fontSize: "16px",
  border: "1px solid #ddd",
  borderRadius: "5px",
  backgroundColor: "#fff",
} as const;

const uploadButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "#4CAF50",
  color: "#fff",
  fontSize: "16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
} as const;

const TitleField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
  <input type="text" value={value} onChange={(e) => setter(e.target.value)}
    style={{
      width: "97.5%", 
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "12px" 
    }}
  />
);

const DateField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
  <input type="date" value={value} onChange={(e) => setter(e.target.value)}
    style={{
      width: "98%", 
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px"
    }}
  />
);

const Field = ({ value, setter, placeholder, type = "text" }: { value: string; setter: (value: string) => void; placeholder?: string; type?: string }) => (
  <input type={type} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} style={{ width: "94%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
);

const TextAreaField = ({ value, setter }: { value: string; setter: (value: string) => void }) => (
  <textarea value={value} onChange={(e) => setter(e.target.value)} style={{ width: "98%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", height: "100px" }} />
);

const ActionButton = ({ label, onClick, color }: { label: string; onClick: () => void; color: string }) => (
  <button onClick={onClick} style={{ backgroundColor: color, color: "#fff", padding: "12px 28px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>{label}</button>
);
const groupContainerStyle: CSSProperties = {
  marginBottom: "20px",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
};

const groupHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px",
  paddingBottom: "5px",
  borderBottom: "1px solid #ccc",
};

const groupInputStyle: CSSProperties = {
  width: "150px",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

export {};