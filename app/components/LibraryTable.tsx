'use client'

import library from "@/app/json/library.json";
import LibraryDownloadBtn from "./LibraryDownload";
import { useEffect, useState } from "react";
import Pagenation from "./pagenation"
import axios from "axios";
import { usePathname, useSearchParams } from "next/navigation";

const LibraryTable = ({ pid }: { pid: number }) => {
  const libraryList = library.list;
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageParam = parseInt(searchParams.get("page") || "1", 10)
  const [currentPage, setCurrentPage] = useState(pageParam)

  const itemsPerPage = 7
  const totalPages = Math.ceil(files.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const currentFiles = files.slice(startIdx, startIdx + itemsPerPage)

  useEffect(() => {
    const getLibrary = async() => {
    try{
      const response = await axios.get("/api/library").then((response) => {setFiles(response.data.files)})
    }catch(err){

    }finally{
      setLoading(false)
    }
    }
    getLibrary()
  },[])

  useEffect(() => {
    if (pageParam >= 1 && pageParam <= totalPages) {
      setCurrentPage(pageParam)
    }
  }, [pageParam, totalPages])

  if (loading) {
    return <p style={{ textAlign: "center", padding: "20px" }}>불러오는 중...</p>;
  }

  if (files.length === 0) {
    return <p style={{ textAlign: "center", padding: "20px" }}>등록된 파일이 없습니다.</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "880px",
        margin: "30px auto",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* 테이블 헤더 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 140px",
          backgroundColor: "#f1f5f9",
          color: "#334155",
          fontWeight: 600,
          padding: "14px 20px",
          fontSize: "16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ textAlign: "center" }}>번호</div>
        <div>제목</div>
        <div style={{ textAlign: "center" }}>다운로드</div>
      </div>

      {/* 테이블 행 */}
      {currentFiles.map((item, index) => (
        <div
          key={item}
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 140px",
            padding: "14px 20px",
            fontSize: "15px",
            backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb",
            borderBottom: "1px solid #f1f5f9",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f0fdf4")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              index % 2 === 0 ? "#fff" : "#f9fafb")
          }
        >
          <div
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            {startIdx + index + 1}
          </div>
          <div style={{ wordBreak: "break-word" }}>{item}</div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LibraryDownloadBtn link={item} />
          </div>
        </div>
      ))}

      {/* 페이지네이션 */}
      <Pagenation
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={pathname}
      />

    </div>
  );
};

export default LibraryTable;
