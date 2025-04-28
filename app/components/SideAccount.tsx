'use client'
import axios from "axios";
import { clearStorage, getToken, getName, getUnivId } from "../util/storage";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import useSessionGuard from "../util/checkAccount";

type acc = {
    s_no: number
    s_id: string,
    s_pw: string,
    s_name: string,
    s_email: string,
    s_token: string,
    dno: number
}
type dnoType = {
    dno: number,
    dname: string
}
type dnoPayLoad = {
    RESULT_CODE: number,
    RESULT_MSG: string,
    PAYLOAD: {
        Result: dnoType[]
    }
}

const SideAccount = () => {
    const [myName, setMyName] = useState<string>("");
    const [univId, setUnivId] = useState<number>(0);
    const [toggle, setToggle] = useState(false);
    const [account, setAccount] = useState<acc>({s_no: 0, s_id: '', s_pw: '', s_name: '', s_email: '', s_token: '', dno: 0})
    const [deptList, setDeptList] = useState<dnoType[]>([{dno: 0, dname: "Loading..."}]);
    const router = useRouter();
    const [page, setPage] = useState(0)
    const [expw, setExPW] = useState('')
    const [newpw1, setNewPW1] = useState('')
    const [newpw2, setNewPW2] = useState('')
    const [pwerrormessage, setPEM] = useState('')
    const session = useSessionGuard()
    

    useEffect(() => {
        const loadAcc = async() => {
            try{
                const uid = getUnivId()
                const response = await axios.post("https://cd-api.chals.kim/api/acc/load_acc", { univ_id: uid }, { headers: { Authorization: process.env.SECRET_API_KEY } }) 
                setAccount(response.data.PAYLOAD.Result)
            }catch(err){}
        }
        const loadDept = async() => {
            try{
              const response = await axios.post<dnoPayLoad>("https://cd-api.chals.kim/api/acc/load_dept", {}, {headers:{Authorization: process.env.SECRET_API_KEY}});
              // console.log("result: ",response.data.PAYLOAD.Result)
              setDeptList(response.data.PAYLOAD.Result);
            }catch(err){}
          }

        loadAcc()
        loadDept()
        setMyName(getName());
        setUnivId(getUnivId());
        resetState()
    }, [toggle]);

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

    const handleSave = async() => {
        try{
            const response = await axios.post(
                "https://cd-api.chals.kim/api/acc/edit_acc", 
                {
                    univ_id: account.s_no,
                    pw: account.s_pw,
                    dept: account.dno,
                    email: account.s_email
                }, 
                { headers: { Authorization: process.env.SECRET_API_KEY } }
            )
            alert("계정정보가 수정되었습니다.")
        }catch(err){}
    }
    
    const changePageBtn = () => {
        const maxPage = 1
        setPage(page+1 > maxPage ? 0 : page+1)
        resetState()
    }

    const handleChangePW = async() => {
        if(expw.trim().length === 0 || newpw1.trim().length === 0 || newpw2.trim().length === 0){
            setPEM("모든 칸을 입력해주세요.")
            return
        }
        if(account.s_pw !== expw){
            setPEM("현재 비밀번호가 일치하지 않습니다.")
            return
        }
        if(newpw1 !== newpw2){
            setPEM("새 비밀번호가 일치하지 않습니다.")
            return
        }
        if(newpw1.trim().length < 8){
            setPEM("비밀번호를 8자리 이상으로 작성해주세요.")
            return
        }
        setAccount(prev => ({...prev, s_pw: newpw1}))

        try{
            const response = await axios.post(
                "https://cd-api.chals.kim/api/acc/resetpw", 
                {
                    univ_id: account.s_no,
                    pw: account.s_pw
                }, 
                { headers: { Authorization: process.env.SECRET_API_KEY } }
            )
            alert("비밀번호가 변경되었습니다.")
            resetState()
        }catch(err){}
    }

    const resetState = () => {
        setExPW('')
        setNewPW1('')
        setNewPW2('')
        setPEM('')
        setPage(0)
    }
    return (
        <div style={container}>
          <div style={headerRow}>
            <strong style={title}>📌 내 정보</strong>
            <div style={buttonGroup}>
                {session === 1 ? (<button onClick={() => setToggle(!toggle)} style={infoBtn}>정보수정</button>):(<div></div>)}
                {toggle && (
                    <div style={modal}>
                        {page === 0 ? (
                            <div>
                                <div style={modalHeader}>
                                    <span style={titleSpan}>정보 수정</span>
                                    <button onClick={() => setToggle(false)} style={closeBtn}>✕</button>
                                </div>
                                <div style={fieldRow}>
                                    <span style={label}>이름</span>
                                    <input disabled value={account.s_name} style={input} />
                                </div>
                                <div style={fieldRow}>
                                    <span style={label}>학번</span>
                                    <input disabled value={account.s_no} style={input} />
                                </div>
                                <div style={fieldRow}>
                                    <span style={label}>아이디</span>
                                    <input disabled value={account.s_id} style={input} />
                                </div>
                                <div style={fieldRow}>
                                    <span style={label}>학과</span>
                                    <select
                                    value={account.dno}
                                    onChange={e => setAccount(prev => ({ ...prev, dno: Number(e.target.value) }))}
                                    style={input}
                                    >
                                    {deptList.map(d => (
                                        <option key={d.dno} value={d.dno}>{d.dname}</option>
                                    ))}
                                    </select>
                                </div>
                                <div style={fieldRow}>
                                    <span style={label}>이메일</span>
                                    <input
                                    type="email"
                                    value={account.s_email}
                                    onChange={e => setAccount(prev => ({ ...prev, s_email: e.target.value }))}
                                    style={input}
                                    />
                                </div>
                                <div style={headerRow}>
                                    {/* 비밀번호 변경 버튼 */}
                                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                                        <button style={changePwBtn} onClick={() => setPage(1)}>🔒 비밀번호 변경</button>
                                    </div>

                                    {/* 수정 완료 버튼 */}
                                    <div style={{ marginTop: "12px", textAlign: "center" }}>
                                        <button style={saveBtn} onClick={handleSave}>💾 수정 완료</button>
                                    </div>
                                </div>
                            </div>
                            ) : (
                            <div>
                                <div style={modalHeader}>
                                    <span style={titleSpan}>비밀번호 변경</span>
                                    <button onClick={() => setToggle(false)} style={closeBtn}>✕</button>
                                </div>
                                <div style={fieldRow}>
                                    <span style={label}>현재 비밀번호</span>
                                    <input
                                    type="password"
                                    value={expw}
                                    onChange={e => setExPW(e.target.value)}
                                    style={input}
                                    />
                                </div>
                                <div style={fieldRow}>
                                    <span style={label}>새로운 비밀번호</span>
                                    <input
                                    type="password"
                                    value={newpw1}
                                    onChange={e => setNewPW1(e.target.value)}
                                    style={input}
                                    />
                                </div>
                                <div style={fieldRow}>
                                    <span style={label}>새로운 비밀번호 재입력</span>
                                    <input
                                    type="password"
                                    value={newpw2}
                                    onChange={e => setNewPW2(e.target.value)}
                                    style={input}
                                    />
                                </div>
                                <div style={PEMCss}>
                                    {pwerrormessage}
                                </div>
                                <div style={headerRow}>
                                    {/* 수정 완료 버튼 */}
                                    <div style={{ marginTop: "12px", textAlign: "center" }}>
                                        <button style={changePwBtn} onClick={changePageBtn}>돌아가기</button>
                                    </div>
                                    {/* 비밀번호 변경 버튼 */}
                                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                                        <button style={saveBtn} onClick={handleChangePW}>🔒 비밀번호 변경 완료</button>
                                    </div>
                                </div>
                            </div>
                        )}
                            
                        </div>
                )}
                    <button onClick={signout} style={logoutBtn}>로그아웃</button>
                </div>
            </div>
                <p style={{ fontSize: "14px", margin: "4px 0" }}>이름 : {myName}</p>
                <p style={{ fontSize: "14px", margin: "4px 0" }}>학번/교번 : {univId}</p>
            </div>
    );
}
    
export default SideAccount;
    
    // ————— 스타일 정의 —————
    
    const container: CSSProperties = {
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    };
    
    const headerRow: CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    };
    
    const title: CSSProperties = {
        fontSize: "16px", 
    };
    
    const buttonGroup: CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        position: "relative",
        flexDirection: 'column'
    };
    
    const infoBtn: CSSProperties = {
        background: "#1976D2",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "11px",
        padding: "4px 10px",
        cursor: "pointer",
    };
    
    const logoutBtn: CSSProperties = {
        background: "#e53935",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "11px",
        padding: "4px 10px",
        cursor: "pointer",
    };
    
    const modal: CSSProperties = {
        position: "absolute",
        top: "-16px",
        left: "100%",
        marginLeft: "20px",
        width: "360px",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "8px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        height: "auto",
        zIndex: 10,
    };
    
    const modalHeader: CSSProperties = {
        display: "flex",
        alignItems: 'flex-start',
        marginBottom: "8px",
    };
    
    const closeBtn: CSSProperties = {
        background: "transparent",
        border: "none",
        fontSize: "16px",
        cursor: "pointer",
    };
    
    const fieldRow: CSSProperties = {
        display: "flex",
        alignItems: "center",
        margin: "6px 0",
    };
    
    const label: CSSProperties = {
        flex: 1,
        fontSize: "14px",
        color: "#333",
    };
    
    const input: CSSProperties = {
        flex: 2,
        padding: "6px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        fontSize: "14px",
    };
    
    const changePwBtn: CSSProperties = {
        background: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: "bold",
    };
      
    const saveBtn: CSSProperties = {
        background: "#1976D2",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: "bold",
    };

    const titleSpan: CSSProperties = {
        marginRight: 'auto',
        fontSize: '20px'
    }

    const PEMCss: CSSProperties = {
        fontSize: '12px',
        color: 'red',
        marginTop: '15px'
    }