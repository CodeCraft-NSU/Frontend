"use client";

import Image from 'next/image';
import ico from '../img/logo.png';
import mb from '@/app/json/msBox.json';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import TapList from '@/app/components/ProjectTap'
import { ProjectCreateModal } from "@/app/components/ProjectCreateModal";
import { EditDraftProjectModal } from "@/app/components/EditDraftProjectModal";
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { getToken, getUnivId, getUserId } from '../util/storage';
import useSessionGuard from '../util/checkAccount';

type fetchType = {
  "RESULT_CODE": number, 
  "RESULT_MSG": string, 
  "PAYLOADS": (string | number)[][]
}

type userListPayLoad = {
  "RESULT_CODE": number
  "RESULT_MSG": string
  "PAYLOADS": userList[]
}

type userList = {
  "univ_id":  number
  "role":	string
  "name":	string
  "permission": number
}

const jinchek = (pid: number) => {
  const [persent, setPersent] = useState(0);

  useEffect(() => {
    loadData();
  },[]);

  const loadData = async() => {
    if(pid === 200) return;
    const data = {pid : pid}
    try{
      const response = await axios.post<fetchType>("https://cd-api.chals.kim/api/wbs/fetch_all", data, {headers:{Authorization: process.env.SECRET_API_KEY}});
      if(response.data.RESULT_CODE === 200){
        const parsePersent = fixData(response.data.PAYLOADS);
        setPersent(parsePersent);
      }else{
        
      }
    }catch(err){

    }
  };

  const fixData = (data: any[]): number => {
    const value = data.map((row) => row.ratio as number);
    const total = value.reduce((sum, value) => sum + value, 0);
    const average = total / value.length;
    return Math.round(average) || 0;
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#4a4a4a",
          marginBottom: "15px",
          textAlign: "center",
        }}
      >
        {mb.header.jinchuk.value} {persent}%
      </div>
      <div
        style={{
          width: "100%",
          height: "25px",
          backgroundColor: "#f0f0f0",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            width: `${persent}%`,
            height: "100%",
            background: `linear-gradient(to right, ${
              persent >= 75 ? "#4caf50" : persent >= 50 ? "#ff9800" : "#f44336"
            }, #b3b3b3)`,
            transition: "width 0.4s ease",
            borderRadius: "15px",
          }}
        ></div>
      </div>
    </div>
  );
};


const ViewMainHeader = ({ pid }: { pid: number }) => {
  const userId = getUserId();
  const userToken = getToken()
  const univId = getUnivId()
  const router = useRouter()
  const session = useSessionGuard()

  

//   useEffect(() => {
//     if(pid !== 0 && session !== null){
//       const checkAccount = async() => {
//         try{
//           if(session === 1){
//             const getUserList = await axios.post<userListPayLoad>("https://cd-api.chals.kim/api/project/checkuser", {pid: pid}, {headers:{Authorization: process.env.SECRET_API_KEY}});
//             if(getUserList.data.RESULT_CODE === 200){
//               const isInclude: boolean = getUserList.data.PAYLOADS.some((user) => user.univ_id === univId)
//               if(!isInclude){
//                 router.push('/');
//               }
//             }
//           }else if(session === 2){
//             const response = await axios.post("https://cd-api.chals.kim/api/project/load_prof", {pid: pid}, {headers:{Authorization: process.env.SECRET_API_KEY}});
//           }else{
//             alert("정상적이지 않는 접근입니다.")
//             router.push('/');
//           }
          
//         }catch(err){
//           alert("정상적이지 않는 접근입니다.")
//           router.push('/');
//         }
//       }
//       checkAccount();
//     }
//   }, [pid, session])

  if(session === 0){
    alert("로그인 후 이용해주세요.")
    router.push('/')
  }

  useEffect(() => {
    const checkView = async() => {
        try{
            const response = await axios.post("https://cd-api.chals.kim/api/project/load_exp", {}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const expid = pid
            const projects = response.data.PAYLOAD.Result as { p_no: number }[];
            const exists = projects.some((proj) => proj.p_no == pid);
            if (!exists) {
              router.push("/"); // 현재 프로젝트가 없다면 루트 페이지(또는 첫 페이지)로 이동
              
            }
        }catch(err){}
    }
    checkView()
  }, [])

  return (
    <header
      style={{
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "97%",
        padding: "0px 20px",
        paddingTop: '0px',
        borderBottom: "2px solid #ddd",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        position: 'relative',
        // height: '90px'
      }}
    >
      {/* ✅ 로고 */}
      <Link href="/">
        <Image
          src={ico}
          alt="Logo"
          style={{
            width: "210px",
            height: "80px",
            objectFit: "contain",
            cursor: "pointer",
          }}
        />
      </Link>

      {/* ✅ 버튼을 프로젝트 탭 위에 배치 */}
      {/* <div style={{
        position: "relative",
        top: "20px",
        bottom: "0",
        // width: "1100px",
        height: "40px",
        overflowY: "hidden",
        display: "flex",
        flexWrap: "nowrap",
        gap: "8px",
        alignItems: "center",
        padding: "5px",
      }}>
        <EditDraftProjectModal />
        
      </div> */}

      {/* ✅ 프로젝트 탭 리스트 */}
      {/* <div style={{bottom: '10px'}}>
      <TapList pid={pid} />
      </div> */}
      

      {/* ✅ 진척도 표시 */}
      <div style={{ flex: 1, textAlign: "center", maxWidth: "900px" }}>
        {jinchek(pid)}
      </div>
    </header>
  );
};


export default ViewMainHeader;