'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { listType, returnEtc, etcType, returnOvr, ovrType, returnMm, mmType, returnReq, reqType, returnTest, testType, returnReport, reportType } from '@/app/util/types';
import Link from "next/link";
import { limitTitle } from "../util/string";

function formatDate(input: string): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  const year = d.getFullYear();
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

const DocumentTable2 = ({ pid }: { pid: number }) => {
  const [data, setData] = useState<listType[]>([]);
  const categories = ["기타", "개요서", "회의록", "요구사항 명세서", "테스트 케이스", "보고서"];
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const tmpData: listType[] = [];
    const formData = new FormData();
    formData.append("pid", pid.toString());
    const postData = { pid: pid };

    try {
      // 기타 산출물
      const response = await axios.post<returnEtc>(
        "https://cd-api.chals.kim/api/output/otherdoc_fetch_all",
        formData,
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
      response.data.PAYLOADS.forEach((item) => {
        tmpData.push({
          type: "기타",
          displayType: "etc",
          title: item.file_name,
          date: formatDate(item.file_date.toString()),
          file_no: item.file_no,
        });
      });
    } catch (err) {}

    try {
      // 프로젝트 개요서
      const response = await axios.post<returnOvr>(
        "https://cd-api.chals.kim/api/output/ovr_doc_fetch",
        postData,
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
      response.data.PAYLOADS.forEach((item) => {
        tmpData.push({
          type: "개요서",
          displayType: "overview",
          title: item.doc_s_name,
          date: item.doc_s_date.toString(),
          file_no: item.doc_s_no,
        });
      });
    } catch (err) {}

    try {
      // 회의록
      const response = await axios.post<returnMm>(
        "https://cd-api.chals.kim/api/output/mm_fetch",
        postData,
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
      response.data.PAYLOADS.forEach((item) => {
        tmpData.push({
          type: "회의록",
          displayType: "minutes",
          title: item.doc_m_title,
          date: item.doc_m_date.toString(),
          file_no: item.doc_m_no,
        });
      });
    } catch (err) {}

    try {
      // 요구사항 명세서
      const response = await axios.post<returnReq>(
        "https://cd-api.chals.kim/api/output/reqspec_fetch_all",
        postData,
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
      response.data.PAYLOADS.forEach((item) => {
        tmpData.push({
          type: "요구사항 명세서",
          displayType: "request",
          title: "요구사항 명세서",
          date: item.doc_r_date.toString(),
          file_no: item.doc_r_no,
        });
      });
    } catch (err) {}

    try {
      // 테스트 케이스
      const response = await axios.post<returnTest>(
        "https://cd-api.chals.kim/api/output/testcase_load",
        postData,
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
      const seenGroups = new Set<string>();
      response.data.PAYLOADS.forEach((item) => {
        if (!seenGroups.has(item.doc_t_group1) && item.doc_t_group1 !== "INITTEST") {
          seenGroups.add(item.doc_t_group1);
          tmpData.push({
            type: "테스트 케이스",
            displayType: "testcase",          // 라우팅은 그대로 testcase/{group1no}
            title: item.doc_t_group1,        // <-- 그룹 이름
            date: "",                        // 필요 없으면 빈 문자열
            file_no: item.doc_t_no    // <-- 그룹 ID
          });
        }
      });
    } catch (err) {}

    try {
      // 보고서
      const response = await axios.post<returnReport>(
        "https://cd-api.chals.kim/api/output/report_fetch_all",
        postData,
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
      response.data.PAYLOADS.forEach((item) => {
        tmpData.push({
          type: "보고서",
          displayType: "report",
          title: item.doc_rep_name,
          date: item.doc_rep_date.toString(),
          file_no: item.doc_rep_no,
        });
      });
    } catch (err) {}

    const sortedData = tmpData
      .map(item => ({ ...item, title: item.title ?? "" }))  // title이 null이면 ""로 대체
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
    setData(sortedData);
  };

  const filteredData = data.filter(item => {
    const title = (item.title ?? "").toLowerCase();
    const type  = (item.type  ?? "").toLowerCase();
    const q     = searchQuery.toLowerCase();
    return title.includes(q) || type.includes(q);
  });

  let content;

  if (searchQuery.trim() !== "") {
    // ─────────── 검색 결과 ───────────
    content = (
      <div style={{ width: "100%" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>
          <div style={{ flex: 1 }}>이름</div>
          <div style={{ flex: 1 }}>유형</div>
          <div style={{ flex: 1 }}>날짜</div>
          <div style={{ flexBasis: "40px" }}>
            <button onClick={loadData} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }} title="새로고침">🔄</button>
          </div>
        </div>
        {/* 결과 리스트 */}
        {filteredData.length > 0 ? filteredData.map(item => (
          <div key={`${item.displayType}-${item.file_no}`} style={{ display: "flex", padding: "8px", borderBottom: "1px solid #eee" }}>
            <Link href={`/project-view/${pid}/output/${item.displayType}/${item.file_no}`} style={{ flex: 1 }}>
              📄 {limitTitle(item.title, 40)}
            </Link>
            <div style={{ flex: 1, color: "#888" }}>{item.type}</div>
            <div style={{ flex: 1, color: "#888" }}>{item.date}</div>
          </div>
        )) : (
          <div style={{ padding: "16px", color: "#888", textAlign: "center" }}>“{searchQuery}”에 대한 결과가 없습니다.</div>
        )}
      </div>
    );

    } else if (currentCategory === null) {
      content = (
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>
            <div style={{ flex: 1 }}>이름</div>
            <div style={{ flex: 1 }}>유형</div>
            <div style={{ flex: 1 }}>날짜</div>
            <div style={{ flexBasis: "40px" }}>
              {/* 새로고침 버튼 (작은 이모지 버튼) */}
              <button
                onClick={loadData}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                title="새로고침"
              >
                🔄
              </button>
            </div>
          </div>
          {categories.map((cat) => (
            <div
              key={cat}
              style={{
                display: "flex",
                padding: "8px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
              onClick={() => setCurrentCategory(cat)}
            >
              <div style={{ flex: 1 }}>{`📁 ${cat}`}</div>
              <div style={{ flex: 1, color: "#888" }}>-</div>
              <div style={{ flex: 1, color: "#888" }}>-</div>
            </div>
          ))}
        </div>
      );
    } else {
      const filteredItems = data.filter((item) => item.type === currentCategory);
  
      content = (
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>
            <div style={{ flex: 1 }}>제목</div>
            <div style={{ flex: 1 }}>유형</div>
            <div style={{ flex: 1 }}>날짜</div>
            <div style={{ flexBasis: "40px" }}>
              <button
                onClick={loadData}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                title="새로고침"
              >
                🔄
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
            }}
            onClick={() => setCurrentCategory(null)}
          >
            <div style={{ flex: 1 }}>📁 ..</div>
            <div style={{ flex: 1, color: "#888" }}>{`뒤로가기`}</div>
            <div style={{ flex: 1, color: "#888" }}>-</div>
          </div>
          {filteredItems.map((item) => (
            <div
              key={item.file_no}
              style={{
                display: "flex",
                padding: "8px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
              onClick={() => {
                // 상세 페이지 이동 또는 다운로드 로직
              }}
            >
                <Link href={`/project-main/${pid}/output/${item.displayType}/${item.file_no}`} style={{flex: 1}}>
                📄 {limitTitle(item.title, 40)}
                </Link>
              {/* <div style={{ flex: 1 }}>{`📄 ${item.title}`}</div> */}
              <div style={{ flex: 1, color: "#888" }}>{item.type}</div>
              <div style={{ flex: 1, color: "#888" }}>{item.date}</div>
            </div>
          ))}
        </div>
      );
    }
  
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "8px" }}>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "30%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>
        <div style={{ flex: 1 }}>{content}</div>
      </div>
    );
}

export default DocumentTable2;