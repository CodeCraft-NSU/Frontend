'use client'

import axios from "axios";
import { useEffect, useState } from "react";
import { getUnivId } from '@/app/util/storage'
import SectionTooltip from "./SectionTooltip";
import SectionTooltipWithChild from "./SectionTooltipwithChild";

const LLMManagement = ({pid}: {pid: number}) => {
    const [apiKey, setApiKey] = useState("");
    const [isKey, setIsKey] = useState(false);
    
    const [showInput, setShowInput] = useState(false);
    

    

    const loadData = async() => {
        try{
            const response = await axios.post("https://cd-api.chals.kim/api/llm/load_key", {pid: pid, api_key: ''}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const code = response.data.RESULT_CODE
            if(code === 200){
                const tmp = response.data.RESULT_MSG
                setApiKey(tmp)
                setIsKey(true)
            }
        }catch(err){}
    }

    useEffect(() => {
        if(showInput){
            loadData()
        }
    }, [showInput])

    const handleToggle = () => {
        setShowInput(prev => !prev)
    }
    
    const handlePostApi = async() => {
        if(!apiKey.trim()){
            alert('API Key를 입력해주세요.')
            return;
        }

        const data = {pid: pid, api_key: apiKey}
        if(isKey === true){
            try{
                const response = await axios.post("https://cd-api.chals.kim/api/llm/edit_key", data, {headers:{Authorization: process.env.SECRET_API_KEY}});
                alert('저장이 완료되었습니다.')
                setShowInput(false)
            }catch(err){}
        }else{
            try{
                const response = await axios.post("https://cd-api.chals.kim/api/llm/add_key", data, {headers:{Authorization: process.env.SECRET_API_KEY}});
                alert('저장이 완료되었습니다.')
                setShowInput(false)
            }catch(err){}
        }
        console.log("post")
        
    }

    return(
        <div style={{position: 'relative', display: 'inline-block'}}>
            <button
                onClick={handleToggle}
                style={{
                padding: "3px 6px",
                backgroundColor: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
                }}
            >
                API 키 설정
            </button>

            {showInput && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "100%", // 버튼 위쪽에 위치
                        right: 0,
                        marginBottom: "5px", // 버튼과의 간격
                        width: "500px",
                        padding: "15px 20px",
                        border: "1px solid #ccc",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        borderRadius: "8px",
                        zIndex: 1000,
                    }}
                >
                    <div style={{margin: '5px 0', position: 'relative', }}>
                        <span style={{fontSize: '20px'}}>API Key 입력</span>
                        <SectionTooltipWithChild>
                            <a 
                                href="https://ai.google.dev/" 
                                target="_blank" 
                                rel="" 
                                style={{ textDecoration: 'underline', color: 'skyblue', marginLeft: '4px' }}
                            >
                                Google Gemini API Key
                            </a>
                            를 발급해 입력해주세요.
                        </SectionTooltipWithChild>
                        <button 
                            onClick={handleToggle}
                            style={{
                                position: 'absolute', 
                                color: "#fff",
                                right: '0', 
                                backgroundColor: '#FF4D4D',
                                padding: "2px 4px",
                                // bottom: '2px',
                                border: "none",
                                borderRadius: "8px",
                            }}
                        >
                            닫기
                        </button>
                    </div>
                    <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="API Key 입력"
                        style={{
                            width: "calc(100% - 12px)",
                            padding: "5px",
                            fontSize: "14px",
                            marginBottom: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px"
                        }}
                    />
                    <button
                        onClick={handlePostApi}
                        style={{
                            padding: "5px 10px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                            width: "100%"
                        }}
                    >
                        저장
                    </button>
                </div>
            )}
        </div>
    )
}

export default LLMManagement;