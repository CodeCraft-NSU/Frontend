"use client";

import MainHeader from "@/app/components/MainHeader";
import MainSide from "@/app/components/MainSide";
import json from "@/app/json/test.json";
import TodoList from "@/app/components/Todo";
import LLMChat from "@/app/components/LLMChat";
import axios from "axios";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { useEffect, useState } from "react";

type wbs = {
  Sid: string;
  Sname: string;
  Sscore: number;
};
type wbsRatio = {
  group1no: number 
  group1: string
  ratio: number
}

export default function Main(props: any) {
  const [ratio, setRatio] = useState<wbsRatio[]>([])

  const loadWBS = async() => {
    const pid: number = props.params.id;
    try{
      const response = await axios.post("https://cd-api.chals.kim/api/wbs/load_ratio", {pid: pid}, {headers:{Authorization: process.env.SECRET_API_KEY}});
      const tmpRatio = response.data.RESULT_MSG;
      setRatio(tmpRatio);
    }catch(err){}
  }

  useEffect(() => {
    loadWBS()
  }, [])

  return (
    <div style={{ backgroundColor: "#f9f9f9", minHeight: "100vh", padding: "10px" }}>
      {/* 메인 헤더 */}
      <MainHeader pid={props.params.id} />

      {/* Body */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        {/* 왼쪽 사이드 */}
        <MainSide pid={props.params.id} />

        {/* 메인 페이지 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "10px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* 페이지 위 : 진척도 */}
          <div
            style={{
              height: "35%",
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: "#f0f7ff",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {Array.from({ length: Math.ceil(ratio.length / 3) }, (_, rowIndex) => (
                <div
                  key={rowIndex}
                  style={{
                    display: "flex",
                    width: "100%",
                    flex: 1, // 높이를 균등하게 설정
                  }}
                >
                  {ratio.slice(rowIndex * 3, rowIndex * 3 + 3).map((item, colIndex) => (
                    <div
                      key={colIndex}
                      style={{
                        flex: 1, // 너비를 균등하게 설정
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                        backgroundColor: "#ffffff",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        margin: "2px", // 여백 최소화
                      }}
                    >
                      {item.group1}: {item.ratio}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 페이지 아래 */}
          <div style={{ display: "flex", gap: "10px", flex: 1 }}>
            {/* Todo List */}
            <div
              style={{
                flex: 1.5, 
                padding: "10px",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}>Todo List</div>
              <div style={{ borderBottom: "2px solid #ddd", marginBottom: "10px" }}></div>
              <TodoList p_id={props.params.id} />
            </div>

            {/* LLM 섹션 */}
            <div
              style={{
                flex: 3, 
                padding: "10px",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}>PMS Assistant</div>
              <div style={{ borderBottom: "2px solid #ddd", marginBottom: "10px" }}></div>
              <div style={{ fontSize: "14px", color: "#777" }}>
                <LLMChat pid = {props.params.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
