'use client';

import React, { useState, useEffect, useRef, CSSProperties } from "react";
import axios from "axios";
import { getUnivId } from "../util/storage";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { limitTitle } from "../util/string";
import { EditDraftProjectModal } from "./EditDraftProjectModal";

export interface DataItem {
    pid: number
    pname: string
    pdetails: string
    psize: number
    pperiod: string
    pmm: string
    wizard: number
}
type returnType = {
    RESULT_CODE: number
    RESULT_MSG: string
    PAYLOADS: DataItem[]
}
type returnProfType = {
    RESULT_CODE: number
    RESULT_MSG: string
    PAYLOAD: { Result: ProfData[]}
}
interface ProfData {
  p_no: number;
  p_name: string;
  p_content: string;
  p_method: string;
  p_memcount: number;
  p_start: string;
  p_end: string;
  p_wizard: number;
  f_no: number;
  f_name: string;
  subj_no: number;
  subj_name: string;
}

const transformProfData = (prof: ProfData): DataItem => {
  return {
    pid: prof.p_no,
    pname: prof.p_name,
    pdetails: prof.p_content,
    psize: prof.p_memcount,
    pperiod: `${prof.p_start}-${prof.p_end}`,
    pmm: prof.p_method,
    wizard: prof.p_wizard,
  };
};

const TabList = ({ pid }: { pid: number }) => {
  const [data, setData] = useState<DataItem[]>([{
    pid: 0,
    pname: '',
    pdetails: '',
    psize: 0,
    pperiod: '',
    pmm: '',
    wizard: 0
  }]);
  const s_no = getUnivId();
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [showCreatePJBtn, setShowCreatePJBtn] = useState(true);
  const router = useRouter();

  // ✅ 1. 페이지 로드 시 `localStorage`에서 선택된 탭 불러오기
  useEffect(() => {
    const savedTab = localStorage.getItem("selectedTab");
    if (savedTab) {
      setSelectedTab(Number(savedTab));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post<returnType>(
          "https://cd-api.chals.kim/api/project/load",
          { univ_id: s_no },
          { headers: { Authorization: process.env.SECRET_API_KEY } }
        );
        setData(response.data.PAYLOADS);
      } catch (error) {
        try{
          const response = await axios.post<returnProfType>(
            "https://cd-api.chals.kim/api/prof/load_project",
            { f_no: s_no },
            { headers: { Authorization: process.env.SECRET_API_KEY } }
          );
          const profDataArray = response.data.PAYLOAD.Result;
          const transformedData = profDataArray.map(transformProfData);
          setData(transformedData);
          setShowCreatePJBtn(false)
        }catch(err){console.log(err)}
      }
    };

    fetchData();
  }, []);


  return (
    <div
      style={{
        ...containerStyle,
        overflowX: showScrollbar ? "auto" : "hidden",
      }}
      onMouseEnter={() => setShowScrollbar(true)}
      onMouseLeave={() => setShowScrollbar(false)}
    >
      {showCreatePJBtn ? <EditDraftProjectModal /> : <div></div>}
      {data.map((item) => (
        <HoverTab
          key={item.pid}
          item={item}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          router={router}
        />
      ))}
    </div>
  );
};

interface HoverTabProps {
  item: DataItem;
  selectedTab: number | null;
  setSelectedTab: React.Dispatch<React.SetStateAction<number | null>>;
  router: ReturnType<typeof useRouter>;
}

const HoverTab: React.FC<HoverTabProps> = ({
  item,
  selectedTab,
  setSelectedTab,
  router,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);

  // ✅ 2. `selectedTab` 변경 시 localStorage에 저장
  useEffect(() => {
    if (selectedTab !== null) {
      localStorage.setItem("selectedTab", selectedTab.toString());
    }
  }, [selectedTab]);

  const handleClick = () => {
    setSelectedTab(item.pid); // ✅ 클릭하면 선택된 탭 변경
    router.push(`/project-main/${item.pid}/main`);
  };

  function convertDateRange(input: string): string {
    const parts = input.split("-");
    if (parts.length === 6) {
      const date1 = `${parts[0]}-${parts[1]}-${parts[2]}`;
      const date2 = `${parts[3]}-${parts[4]}-${parts[5]}`;
      return `${date1} ~ ${date2}`;
    }
    return input; // 형식이 맞지 않으면 원본 반환
  }

  return (
    <div
      ref={tabRef}
      style={{
        ...tabStyle,
        ...(selectedTab === item.pid ? activeTabStyle : {}),
        ...(isHovered ? hoverTabStyle : {}),
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>{limitTitle(item.pname, 20)}</div>

      {isHovered && tabRef.current && (
        <Tooltip targetRef={tabRef}>
          <div style={{ padding: "3px" }}>
            <strong>제목: </strong>
            {item.pname}
          </div>
          <div style={{ padding: "3px" }}>
            <strong>설명: </strong>
            {item.pdetails}
          </div>
          <div style={{ padding: "3px" }}>
            <strong>인원: </strong>
            {`${item.psize}명`}
          </div>
          <div style={{ padding: "3px" }}>
            <strong>기간: </strong>
            {convertDateRange(item.pperiod)}
          </div>
          <div style={{ padding: "3px" }}>
            <strong>개발 방법론: </strong>
            {(Number(item.pmm) === 0) ? "폭포수 모델" : ((Number(item.pmm) === 1) ? "애자일 모델" : "기타 모델")}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

interface TooltipProps {
  targetRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ targetRef, children }) => {
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });

  useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setStyle({
        position: "absolute",
        top: rect.top + 40,
        left: rect.left,
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        padding: "6px",
        width: "300px",
        borderRadius: "6px",
        zIndex: 10000,
      });
    }
  }, [targetRef]);

  return createPortal(<div style={style}>{children}</div>, document.body);
};

// ✅ 컨테이너 스타일
const containerStyle: CSSProperties = {
  position: "relative",
  top: "20px",
  bottom: "0",
  width: "1100px",
  height: "60px",
  overflowY: "hidden",
  display: "flex",
  flexWrap: "nowrap",
  gap: "5px",
  alignItems: "center",
  paddingLeft: "5px",
  padding: "5px",
  paddingBottom: '10px',
  boxSizing: "border-box"
};

// ✅ 기본 탭 스타일
const tabStyle: CSSProperties = {
  position: "relative",
  minWidth: "100px",
  height: "36px",
  backgroundColor: "#f8f9fa",
  border: "1px solid #d1d5db",
  borderBottom: "none",
  borderRadius: "12px 12px 0 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flex: "0 0 auto",
  padding: "0 12px",
  transition: "all 0.3s ease-in-out",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
};

// ✅ 호버 시 스타일
const hoverTabStyle: CSSProperties = {
  backgroundColor: "#e2e8f0",
  transform: "scale(1.03)",
};

// ✅ 활성화된 탭 스타일
const activeTabStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderBottom: "4px solid #2563eb", 
  fontWeight: "bold",
  color: "#2563eb", 
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
};


export default TabList;
