'use client';

import { useState, useEffect } from 'react';
import axios from 'axios'
import mb from '@/app/json/msBox.json'
import { getUnivId } from '@/app/util/storage';
import { useRouter } from 'next/navigation';
import { usePageReload } from '@/app/util/reloadPage';
import { getToken, getUserId, getName, setToken, setUnivId, setUserId, setName } from "@/app/util/storage";

type postType = {
    RESULT_CODE: number;
    RESULT_MSG: string;
    PAYLOADS: {
      Result: {
        s_token: string;
        s_no: number;
        s_name: string
      }
    };
  };

  type profpostType = {
    RESULT_CODE: number;
    RESULT_MSG: string;
    PAYLOADS: {
      Result: {
        f_token: string;
        f_no: number;
        f_name: string
      }
    };
  };
  
  type checkType = {
    user_id: string;
    token: string;
  };
  
  const commonStyles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to bottom, #f0f0f0, #FFFFFF)",
      fontFamily: "'Roboto', sans-serif",
    },
    card: {
      width: "400px",
      padding: "50px",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
      textAlign: "center" as "center",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "20px",
    },
    input: {
      width: "93%",
      padding: "12px",
      fontSize: "16px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      marginBottom: "15px",
      transition: "border-color 0.3s ease",
    },
    button: {
      width: "100%",
      padding: "12px",
      fontSize: "16px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    buttonHover: {
      backgroundColor: "#0056b3",
    },
    buttonDisabled: {
      backgroundColor: "#cccccc",
      cursor: "not-allowed",
    },
  };

export function Modal({ isOpen, closeModal, children }: { isOpen: boolean; closeModal: () => void; children?: React.ReactNode }) {
    
    return (
        isOpen && (
        <div style={{position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <div style={{background: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px #000000', maxWidth: '500px', width: '100%'}}>
                <div style={{width: '100%', display: 'flex'}}><div style={{marginLeft: 'auto'}}><button onClick={closeModal} style={{fontSize: '15px'}}>{mb.modal.exitbtn.value}</button></div></div>
                {children}
            </div>
        </div>
        )
    );
}

export function LoginModal() {
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
  
    const data = {
      id: studentId,
      pw: password,
    };
  
    useEffect(() => {
      const check: checkType = {
        user_id: getUserId(),
        token: getToken(),
      };
      if (check.token !== "") {
        // CheckSession(check);
      }
    }, []);
  
    const CheckSession = async (check: checkType) => {
      try {
        const response = await axios.post(
          "https://cd-api.chals.kim/api/acc/checksession",
          check,
          { headers: { Authorization: process.env.SECRET_API_KEY } }
        );
        if (response.data.RESULT_CODE === 200) {
          router.push("/");
        }
      } catch (err) {
        console.error("세션 확인 실패 : ", err);
      }
    };
  
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);
  
      try {
        const response = await axios.post<postType>(
          "https://cd-api.chals.kim/api/acc/signin",
          data,
          { headers: { Authorization: process.env.SECRET_API_KEY } }
        );
        if (response.data.RESULT_CODE === 200) {
          setToken(response.data.PAYLOADS.Result.s_token);
          setUnivId(response.data.PAYLOADS.Result.s_no);
          setUserId(data.id);
          setName(response.data.PAYLOADS.Result.s_name)
          router.push("/project-main");
        }
      } catch (err) {
        try{
          const response = await axios.post<profpostType>(
            "https://cd-api.chals.kim/api/prof/signin",
            data,
            { headers: { Authorization: process.env.SECRET_API_KEY } }
          );
          if (response.data.RESULT_CODE === 200) {
            setToken(response.data.PAYLOADS.Result.f_token);
            setUnivId(response.data.PAYLOADS.Result.f_no);
            setUserId(data.id);
            setName(response.data.PAYLOADS.Result.f_name)
            router.push("/project-main");
          }
        }catch(err){alert("❌ 로그인 중 오류가 발생했습니다. 다시 시도해주세요.");}
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleNavigateToMain = () => router.push("/");
    const handleNavigateToRegister = () => {
        closeModal()
        router.push("/sign/register")
    };
  
    return (
        <div>
            <button onClick={openModal} style={{
              fontSize: "1em",
              color: "#FFFFFF",
              backgroundColor: "#5858FA",
              textDecoration: "none",
              fontWeight: "bold",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "all 0.3s",
              }}>로그인</button>
            <Modal isOpen={isOpen} closeModal={closeModal}>
            <div>
                <div>
                <h2 style={commonStyles.title}>🔑 로그인</h2>
                <form onSubmit={handleLogin}>
                    <input
                    type="text"
                    placeholder="아이디"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    style={commonStyles.input}
                    />
                    <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={commonStyles.input}
                    />
                    <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        ...commonStyles.button,
                        ...(isLoading ? commonStyles.buttonDisabled : {}),
                    }}
                    >
                    {isLoading ? "⏳ 로그인 중..." : "로그인"}
                    </button>
                </form>
        
                {/* 회원가입 / 아이디 찾기 버튼 */}
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                    <button
                    onClick={handleNavigateToRegister}
                    style={{
                        ...commonStyles.button,
                        width: "48%",
                        backgroundColor: "#6c757d",
                    }}
                    >
                    📝 회원가입
                    </button>
                    <button
                    onClick={() => router.push("/sign/find-password")}
                    style={{
                        ...commonStyles.button,
                        width: "48%",
                        backgroundColor: "#6c757d",
                    }}
                    >
                    🔍 비밀번호 찾기
                    </button>
                </div>
                </div>
            </div>
            </Modal>
            
        </div>
    );
  }
  