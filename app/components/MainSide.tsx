"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  getToken,
  getUnivId,
  getUserId,
  getName,
  clearStorage,
} from "../util/storage";
import SideAccount from "./SideAccount";

const MainSide = ({ pid }: { pid: number }) => {
  const router = useRouter();
  const [myName, setMyName] = useState<string>("");
  const [univId, setUnivId] = useState<number>(0);

  useEffect(() => {
    setMyName(getName());
    setUnivId(getUnivId());
  }, []);

  const [showGrade, setShowGrade] = useState(false);

  const menuData = [
    {
      title: "📁 메인",
      items: ["메인 페이지"],
      routes: [`/project-main/${pid}/main`],
    },
    {
      title: "🛠️ 프로젝트 관리",
      items: ["WBS 관리", "사용자 관리", "프로젝트 설정"],
      routes: [
        `/project-main/${pid}/wbsmanager`,
        `/project-main/${pid}/project-management/user`,
        `/project-main/${pid}/pm`,
      ],
    },
    {
      title: "📝 산출물 작성",
      items: ["개요서", "회의록", "테스트 케이스", "요구사항", "보고서", "기타"],
      routes: [
        `/project-main/${pid}/overview`,
        `/project-main/${pid}/minutes`,
        `/project-main/${pid}/servicetest`,
        `/project-main/${pid}/Requirements`,
        `/project-main/${pid}/Report`,
        `/project-main/${pid}/output/create`,
      ],
    },
    {
      title: "📂 산출물 관리",
      items: ["산출물 관리", "자료실"],
      routes: [
        `/project-main/${pid}/outputManagement`,
        `/project-main/${pid}/library`,
      ],
    },
    {
      title: "✅ 업무 관리",
      items: ["업무 관리"],
      routes: [`/project-main/${pid}/task`],
    },
  ];

  if (showGrade) {
    menuData.push({
      title: "📊 프로젝트 평가",
      items: ["평가"],
      routes: [`/project-main/${pid}/grade`],
    });
  }

  useEffect(() => {
    const checkProf = async () => {
      try {
        const res = await axios.post(
          "https://cd-api.chals.kim/api/prof/checksession",
          {
            user_id: getUserId(),
            token: getToken(),
          },
          {
            headers: { Authorization: process.env.SECRET_API_KEY },
          }
        );
        if (res.data.RESULT_CODE === 200) {
          setShowGrade(true);
        }
      } catch {}
    };
    checkProf();
  }, [pid]);

  const goto = (route: string) => {
    router.push(route);
  };

  const signout = async () => {
    try {
      await axios.post(
        "https://cd-api.chals.kim/api/acc/signout",
        { token: getToken() },
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
    } catch {
      await axios.post(
        "https://cd-api.chals.kim/api/prof/signout",
        { token: getToken() },
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
    } finally {
      clearStorage();
      alert("로그아웃 되었습니다.");
      router.push("/");
    }
  };

  return (
    <div
      style={{
        width: "220px",
        backgroundColor: "#f9f9f9",
        minHeight: "calc(100vh - 110px)",
        padding: "15px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
      }}
    >
      {/* 내 정보 카드 */}
      <SideAccount />

      {/* 메뉴 영역 */}
      {menuData.map((menu, i) => (
        <div key={i} style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "15px",
              color: "#444",
              marginBottom: "8px",
              paddingLeft: "4px",
              borderLeft: "4px solid #007BFF",
              backgroundColor: "#e9f2ff",
              borderRadius: "4px",
              padding: "6px 10px",
            }}
          >
            {menu.title}
          </div>
          {menu.items.map((item, j) => (
            <button
              key={j}
              onClick={() => goto(menu.routes[j])}
              style={{
                display: "block",
                width: "100%",
                background: "none",
                border: "none",
                padding: "6px 12px",
                fontSize: "14px",
                color: "#333",
                textAlign: "left",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#eef3ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              ▸ {item}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MainSide;
