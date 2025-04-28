'use client';

import { CSSProperties } from "react"; //추가된 내용
import React, { ChangeEvent } from 'react'; //추가된 내용
import { useState, useEffect } from 'react';
import axios from 'axios'
import mb from '@/app/json/msBox.json'
import { getToken, getUnivId, getUserId } from '@/app/util/storage';
import { useRouter } from 'next/navigation';
import { usePageReload } from '@/app/util/reloadPage';

type inputType = {
    "univ_id": number,
    "role": string,
    "permission": string
}
type addUserType  ={
    pid: number
    univ_id: number
    role: string
}
type pmType = {
    pid: number,
    univ_id: number
}
type returnType = {
    "RESULT_CODE": number,
    "RESULT_MSG": string
}
type taskType = {
    tname: string
    tperson: string
    tstart: string
    tend: string
    pid: number
    univ_id: number
}
type Student = {
    id: string;
    name: string;
};
type userList = {
    "univ_id": number,
    "role": string,
    "name": string,
    "permission": string
}
type returnUserType = {
    "RESULT_CODE": number,
    "RESULT_MSG": string,
    "PAYLOADS": userList[]
}
type inputTaskType = {
    p_no: number
    s_no: number
    w_checked: boolean
    w_end: string
    w_name: string
    w_no: number
    w_person: string
    w_start: string
}
type permissionList = {
    pid: number
    univ_id: number
    user: number
    wbs: number
    od: number
    mm: number
    ut: number
    rs: number
    rp: number
    om: number
    task: number
    llm: number
}
type returnPermissionType = {
    "RESULT_CODE": number, 
    "RESULT_MSG": permissionList
}
export function Modal({ isOpen, closeModal, children }: { isOpen: boolean; closeModal: () => void; children?: React.ReactNode }) {
    
    return (
        isOpen && (
        <div style={{position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', zIndex: 9999}}>
            <div style={{background: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px #000000', maxWidth: '500px', width: '100%'}}>

  <div style={{width: '96%', display: 'flex', justifyContent: 'flex-end'}}>
  <button
    onClick={closeModal}
    style={{
      backgroundColor: '#e53935',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 14px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    }}
  >
    ❌ 닫기
  </button>
</div>

                {children}
            </div>
        </div>
        )
    );
}

export function UserConfigBtn({input, pid}: {input: inputType, pid: number}) {
    const [isOpen, setIsOpen] = useState(false);
    const [permision, setPer] = useState(input.permission);
    const [role, setRole] = useState(input.role);
    const [hak, setHak] = useState(input.univ_id);
    const [permissions, setPermissions] = useState<Record<string, number>>({
        'WBS': 0,
        '개요서': 0,
        '회의록': 0,
        '테스트케이스': 0,
        '요구사항 명세서': 0,
        '보고서': 0,
        '기타 산출물': 0,
        '업무': 0,
        "LLM": 0
    })

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const data = {
        univ_id: hak,
        pid: pid,
        role: role
    };

    useEffect(() => {
        if(isOpen === true){
            checkPm();
            loadData();
        }
    }, [isOpen])

    const checkPm = async() => {
        const postData: pmType = {
            pid: pid,
            univ_id: getUnivId()
        }
        const id = getUserId()
        const token = getToken()
        try{
            const response = await axios.post<returnType>("https://cd-api.chals.kim/api/project/checkpm", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            
            if(response.data.RESULT_CODE !== 200){
                closeModal();
                alert("권한이 없습니다.");
            }
            
        }catch(err){
            try{
                const responseProf = await axios.post("https://cd-api.chals.kim/api/prof/checksession", {user_id: id, token: token}, { headers: { Authorization: process.env.SECRET_API_KEY } });
                if(responseProf.data.RESULT_CODE === 200){
                    closeModal();
                    alert("권한이 없습니다.");
                }
            }catch(err){
            }
            closeModal();
            alert("권한이 없습니다.");
        }
    }

    const loadData = async() => {
        const postData = {pid: pid, univ_id: hak}
        try{
            const response = await axios.post<returnPermissionType>("https://cd-api.chals.kim/api/pm/load_one", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            const fetch_data = {
                'WBS': response.data.RESULT_MSG.wbs,
                '개요서': response.data.RESULT_MSG.od,
                '회의록': response.data.RESULT_MSG.mm,
                '테스트케이스': response.data.RESULT_MSG.ut,
                '요구사항 명세서': response.data.RESULT_MSG.rs,
                '보고서': response.data.RESULT_MSG.rp,
                '기타 산출물': response.data.RESULT_MSG.om,
                '업무': response.data.RESULT_MSG.task,
                "LLM": response.data.RESULT_MSG.llm
            }
            
            setPermissions(fetch_data)
            
        }catch(err){}finally{}
    }

    const handleConfigUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(permision === '' || role === ''){
            alert(mb.modal.nullinfo.value)
        }else{
            postData();
            closeModal();
        }
        
    };

    const postData = async() => {
        const dataP: permissionList = {
            pid: pid,
            univ_id: hak,
            user: 0,
            wbs: permissions['WBS'],
            od: permissions['개요서'],
            mm: permissions['회의록'],
            ut: permissions['테스트케이스'],
            rs: permissions['요구사항 명세서'],
            rp: permissions['보고서'],
            om: permissions['기타 산출물'],
            task: permissions['업무'],
            llm: permissions['LLM']
        }
        try{
            const response = await axios.post("https://cd-api.chals.kim/api/project/edituser", data, {headers:{Authorization: process.env.SECRET_API_KEY}});
            if(!permision){
              const responsePermission = await axios.post("https://cd-api.chals.kim/api/pm/edit_manual", dataP, {headers:{Authorization: process.env.SECRET_API_KEY}});
            }
        } catch(err){
            alert('오류가 발생했습니다.');
        }
    };

    
    const permissionLabel: Record<number, string> = {
        0: '권한 없음',
        1: '읽기 + 쓰기',
        2: '읽기'
    };

    //추가된 내용
    const handleClick = (key: string, event: ChangeEvent<HTMLInputElement>) => {
        const newPermission = parseInt(event.target.value, 10);
        setPermissions((prevPermissions) => ({
          ...prevPermissions,
          [key]: newPermission,
        }));
      };
      

      const setAllPermissions = (value: number) => {
        setPermissions((prevPermissions) => {
          const updatedPermissions = Object.keys(prevPermissions).reduce((acc, key) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, number>);
          return updatedPermissions;
        });
      };

   /* const handleClick = (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
   //     event.preventDefault();
   //     setPermissions((prevPermissions) => ({
   //         ...prevPermissions,
   //         [key]: (prevPermissions[key] + 1) % 3,
   //     }));
    }; */

    const deleteUser = async(sno: number) => {
        try{
            if(confirm(`정말로 퇴출하시겠습니까?\n${sno}`)){
                const response = await axios.post("https://cd-api.chals.kim/api/project/deleteuser", {pid: pid, univ_id: sno}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            }
        }catch(err){}
    }

    return (
        <div>
            <button
  onClick={openModal}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#3B82F6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s ease",
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.backgroundColor = "#2563EB")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.backgroundColor = "#3B82F6")
  }
>
  <span style={{ fontSize: "18px" }}>⚙️</span>
  <span>{mb.modal.fixinfobtn.value}</span>
</button>

            <Modal isOpen={isOpen} closeModal={closeModal}>
                <div style={{fontSize: '32px', paddingBottom: '20px'}}>{mb.modal.fixinfotitle.value}</div>
                <form onSubmit={handleConfigUser} style={{ fontSize: '18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

  {/* 역할 입력 */}
  <div>
    <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>역할</label>
    <input 
      type="text"
      value={role}
      onChange={(e) => setRole(e.target.value)}
      placeholder="(예: 팀장, 프론트엔드 담당 등)"
      style={{
        width: '95%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
      }}
      
    />
    
<div style={{ marginTop: '16px', marginBottom: '8px' }}>
  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>📌 권한 일괄 적용</span>
  <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
  🔄 클릭 시 모든 항목에 동일한 권한을 설정합니다.
</p>
</div>


  </div>
  {permision ? (<div></div>):(

  
  
<div style={{display: "flex", flexDirection: 'column'}}>
  {/* 일괄 권한 적용 */}
  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '6px' }}>
  <button type="button" onClick={() => setAllPermissions(2)} style={bulkButtonStyle}>
    📘 읽기
  </button>
  <button type="button" onClick={() => setAllPermissions(1)} style={bulkButtonStyle}>
    ✍️ 읽기 + 쓰기
  </button>
  <button type="button" onClick={() => setAllPermissions(0)} style={bulkButtonStyle}>
    🚫 권한 없음
  </button>

  
</div>
  <div style={{ marginTop: '8px', textAlign: 'center' }}>
  <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
    📌 각 항목의 권한을 선택해 주세요. <br />
    예: 팀장은 <span style={{ color: '#F59E0B' }}>읽기 + 쓰기</span>, 팀원은 <span style={{ color: '#3B82F6' }}>읽기</span>로 설정하는 것을 추천합니다.
  </p>
</div>
{/* 전체 권한 설정 영역에 스크롤 */}
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '360px', // 🔽 스크롤 제한 높이
    overflowY: 'auto',
    paddingRight: '4px', // 스크롤 여백
  }}
>
  {Object.keys(permissions).map((key) => (
    <div
      key={key}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 18px',
        borderRadius: '10px',
        border: '1px solid #eee',
        backgroundColor: '#fafafa',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <span style={{ fontWeight: '500' }}>{key}</span>

      <div style={{ display: 'flex', gap: '24px' }}>
        {[2, 1, 0].map((val) => (
          <label
            key={val}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '13px',
              fontWeight: 'bold',
              color: val === 2 ? '#3B82F6' : val === 1 ? '#F59E0B' : '#9CA3AF',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor:
                permissions[key] === val
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'transparent',
              transition: 'all 0.2s ease',
              transform: permissions[key] === val ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <input
              type="radio"
              value={val}
              checked={permissions[key] === val}
              onChange={(event) => handleClick(key, event)}
              style={{
                marginBottom: '6px',
                accentColor:
                  val === 2 ? '#3B82F6' : val === 1 ? '#F59E0B' : '#9CA3AF',
              }}
            />
            {val === 2
              ? '📘 읽기'
              : val === 1
              ? '✍️ 읽기 + 쓰기'
              : '🚫 권한 없음'}
          </label>
        ))}
      </div>
    </div>
  ))}
</div>



</div>)}



  {/* 하단 버튼 영역 */}
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
    <button
      type="submit"
      style={{
        backgroundColor: '#10B981',
        color: '#fff',
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        transition: 'background-color 0.3s'
      }}
    >
      ✅ 완료
    </button>
    {permision ? (<div></div>) : (
    <button
      type="button"
      onClick={(e) => deleteUser(hak)}
      style={{
        backgroundColor: '#EF4444',
        color: '#fff',
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        transition: 'background-color 0.3s'
      }}
    >
      🗑️ 퇴출
    </button>)}
  </div>

</form>

            </Modal>
        </div>
    );
}

export function AddUser({p_id}: {p_id: number}) {
    const [isOpen, setIsOpen] = useState(false);
    const [hak, setHak] = useState(0);
    const [role, setRole] = useState("");
    const [readOnly, setReadOnly] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const data:addUserType = {
        pid: p_id,
        univ_id: hak,
        role: role
    };

    useEffect(() => {
        if(isOpen === true){
            checkPm();
        }
    }, [isOpen])

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(hak === 0 || role === ""){
            alert(mb.modal.nullinfo.value)
            
        }else{
            postData();
            setHak(0);
            setRole("");
            closeModal();
        }
    };

    const postData = async() => {
        try{
            const response = await axios.post("https://cd-api.chals.kim/api/acc/find_sname", {univ_id: hak}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            if(confirm(`초대할 대상이 맞습니까?\n${hak}, ${response.data.PAYLOAD.Result.s_name}`)){
                const response = await axios.post<returnType>("https://cd-api.chals.kim/api/project/adduser", data, {headers:{Authorization: process.env.SECRET_API_KEY}});
                if(readOnly){
                    const response = await axios.post("https://cd-api.chals.kim/api/pm/add_ro", {pid: p_id, univ_id: hak}, {headers:{Authorization: process.env.SECRET_API_KEY}});
                }else{
                    const response = await axios.post("https://cd-api.chals.kim/api/pm/add_default", {pid: p_id, univ_id: hak}, {headers:{Authorization: process.env.SECRET_API_KEY}});
                }
                window.location.reload();
            }
        }catch(err){
            console.log(err)
        }
        
    };

    const checkPm = async() => {
        const postData: pmType = {
            pid: p_id,
            univ_id: getUnivId()
        }
        try{
            const response = await axios.post<returnType>("https://cd-api.chals.kim/api/project/checkpm", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            if(response.data.RESULT_CODE !== 200){
                closeModal();
                alert("권한이 없습니다.");
            }
        }catch(err){
            closeModal();
            alert("권한이 없습니다.");
        }
    }
    const handleReadOnly = () => {
        setReadOnly(!readOnly)
    }
    return (
        <div>
            <button
  onClick={openModal}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#10B981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s ease",
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.backgroundColor = "#059669")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.backgroundColor = "#10B981")
  }
>
  <span style={{ fontSize: "18px" }}>➕</span>
  <span>{mb.modal.adduserbtn.value}</span>
</button>

            <Modal isOpen={isOpen} closeModal={closeModal}>
                <div style={{fontSize: '32px', paddingBottom: '20px'}}>{mb.modal.addusertitle.value}</div>
                <form onSubmit={handleAddUser} style={{ fontSize: '18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
  <div>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>학번</label>
    <input 
      type="number" 
      value={hak} 
      onChange={(e) => setHak(e.target.valueAsNumber)}
      style={{
        width: '98%',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        fontSize: '16px'
      }}
    />
  </div>

  <div>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>역할</label>
    <input 
      type="text"  
      value={role}
      onChange={(e) => setRole(e.target.value)}
      style={{
        width: '98%',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        fontSize: '16px'
      }}
    />
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <label style={{ fontWeight: 'bold' }}>읽기 전용</label>
    <input
      type='checkbox'
      checked={readOnly}
      onChange={handleReadOnly}
      style={{
        width: '18px',
        height: '18px',
        cursor: 'pointer'
      }}
    />
  </div>

  <div style={{ textAlign: 'center', marginTop: '20px' }}>
    <button
      type='submit'
      style={{
        backgroundColor: '#10B981',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        transition: 'background-color 0.3s'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
    >
      ✅ 완료
    </button>
  </div>
</form>

                


            </Modal>
        </div>
    );
}

export function AddTask({p_id}: {p_id: number}){
    const [selectedStudent, setSelectedStudent] = useState<userList | null>(null);
    const [user, setUser] = useState<userList[]>([]);
    const [taskName, setTName] = useState("");
    const [name, setName] = useState("");
    const [startDate, setStart] = useState("");
    const [endDate, setEnd] = useState("");
    const [hak, setHak] = useState(0);
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const tmpData: taskType = {
        tname: taskName,
        tperson: name,
        tstart: startDate,
        tend: endDate,
        pid: p_id,
        univ_id: hak
    }

    useEffect(() => {
        getData();
    }, [])

    const fixDate = (date: string) => {
        const rawValue = date;
        const formatted = rawValue.replace(/-/g, '').slice(2);
        return formatted;
    }
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(startDate === "" || endDate === "" || taskName === "" || hak === 0){
            alert(mb.modal.nullinfo.value)
            
        }else{
            postData();
            setTName("")
            setStart("")
            setEnd("")
            setHak(0)
            setName("")
            closeModal();
            
            
        }
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const student = user.find((item) => item.name === event.target.value);
        if (student) {
            setSelectedStudent(student);
            setName(student.name)
            setHak(student.univ_id)
        }
    };

    const postData = async() => {
        const data = tmpData;
        try{
            const response = await axios.post<returnType>("https://cd-api.chals.kim/api/task/add", data, {headers:{Authorization: process.env.SECRET_API_KEY}});
            window.location.reload();
        } catch(err){
        }
        
    };

    const getData = async() => {
        try{
            const response = await axios.post<returnUserType>("https://cd-api.chals.kim/api/project/checkuser", {pid: p_id}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setUser(response.data.PAYLOADS);
        }catch(err){

        }
    }

    return(
        <div>
            <button
  onClick={openModal}
  style={{
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s",
  }}
>
  ➕ {mb.task.tBtn.value}
</button>

            <Modal isOpen={isOpen} closeModal={closeModal}>
  <div style={modalContainerStyle}>
    <div style={modalHeaderStyle}>📌 업무 추가</div>

    <form onSubmit={handleAddTask} style={formStyle}>
      <div style={formGroup}>
        <label style={labelStyle}>할일 제목</label>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>학생 선택</label>
        <select
          onChange={handleSelectChange}
          style={inputStyle}
        >
          <option value="">이름을 선택하세요</option>
          {user.map((student) => (
            <option key={student.name} value={student.name}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>학번</label>
        <input
          type="text"
          value={hak || ""}
          readOnly
          style={{ ...inputStyle, backgroundColor: "#f0f0f0" }}
        />
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>시작일</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStart(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={formGroup}>
        <label style={labelStyle}>종료일</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEnd(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ textAlign: "right", marginTop: "20px" }}>
        <button type="submit" style={submitButtonStyle}>
          ✅ {mb.modal.configbtn.value}
        </button>
      </div>
    </form>
  </div>
</Modal>

        </div>
    );
}

export function ConfigTask({data, p_id}: {data: inputTaskType, p_id: number}){
    const [selectedStudent, setSelectedStudent] = useState<userList | null>(null);
    const [user, setUser] = useState<userList[]>([]);
    const [taskName, setTaskName] = useState(data.w_name);
    const [taskId, setTaskId] = useState(data.w_no);
    const [person, setPerson] = useState(data.w_person);
    const [start, setStart] = useState(data.w_start);
    const [end, setEnd] = useState(data.w_end);
    const [finish, setFinish] = useState(data.w_checked);
    const [univId, setUnivId] = useState(data.s_no);
    const {reloadPage} = usePageReload();
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
    // const router = useRouter(); 
    type postType = {
        tname: string
        tperson: string
        tstart: string
        tend: string
        tfinish: boolean
        univ_id: number
        tid: number
    }
    useEffect(() => {
        getData();
    },[])
    const fixDate = (date: string) => {
        const rawValue = date;
        const formatted = rawValue.replace(/-/g, '').slice(2);
        return formatted;
    }
    const postData: postType = {
        tname: taskName,
        tperson: person,
        tstart: start,
        tend: end,
        tfinish: finish,
        univ_id: univId,
        tid: taskId
    }
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const student = user.find((item) => item.name === event.target.value);
        if (student) {
            setSelectedStudent(student);
            setPerson(student.name)
            setUnivId(student.univ_id)
        }
    };
    const handleFixTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(start === "" || end === "" || taskName === "" || univId === 0){
            alert(mb.modal.nullinfo.value)
        }else(
            fixTask()
            
        )
    };
    const fixTask = async() => {
        try{
            const response = await axios.post<postType>("https://cd-api.chals.kim/api/task/edit", postData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            window.location.reload();
        }catch(err){

        }finally{
            closeModal();
            window.location.reload();
        }
    }
    const getData = async() => {
        try{
            const response = await axios.post<returnUserType>("https://cd-api.chals.kim/api/project/checkuser", {pid: p_id}, {headers:{Authorization: process.env.SECRET_API_KEY}});
            setUser(response.data.PAYLOADS);
        }catch(err){

        }
    }
    const deleteTask = async() => {
        const tidData = {tid: taskId}
        try{
            const response = await axios.post<returnType>("https://cd-api.chals.kim/api/task/delete", tidData, {headers:{Authorization: process.env.SECRET_API_KEY}});
            if(response.data.RESULT_CODE === 200){
                closeModal()
                window.location.reload();
            }
        }catch(err){
        }
    }
    return(
        <div>
            <button
  onClick={openModal}
  style={{
    backgroundColor: "transparent",  // ✅ 투명 배경
    color: "#333",
    border: "none",
    borderRadius: "6px", 
    padding: "6px 14px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  ✏️ 업무 수정
</button>


            <Modal isOpen={isOpen} closeModal={closeModal}>
  

  <form onSubmit={handleFixTask} style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    fontSize: '16px',
    color: '#333'
  }}>

    {/* 할일 제목 */}
    <div>
      <label>할일 제목</label>
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        style={{
          width: '98%',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          marginTop: '6px'
        }}
      />
    </div>

    {/* 학생 선택 */}
    <div>
      <label>학생 선택</label>
      <select
        id="student-select"
        onChange={handleSelectChange}
        style={{
          width: '102%',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          marginTop: '6px'
        }}
      >
        <option value="">이름을 선택하세요</option>
        {user.map((student) => (
          <option key={student.name} value={student.name}>
            {student.name}
          </option>
        ))}
      </select>
    </div>

    {/* 학번 */}
    <div>
      <label>학번</label>
      <input
        type="text"
        value={univId || ""}
        readOnly
        style={{
          width: '98%',
          padding: '10px',
          border: '1px solid #eee',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
          marginTop: '6px'
        }}
      />
    </div>

    {/* 이름 */}
    <div>
      <label>이름</label>
      <input
        type="text"
        value={person || ""}
        readOnly
        style={{
          width: '98%',
          padding: '10px',
          border: '1px solid #eee',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
          marginTop: '6px'
        }}
      />
    </div>

    {/* 시작일 */}
    <div>
      <label>시작일</label>
      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        style={{
          width: '98%',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          marginTop: '6px'
        }}
      />
    </div>

    {/* 종료일 */}
    <div>
      <label>종료일</label>
      <input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        style={{
          width: '98%',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          marginTop: '6px'
        }}
      />
    </div>

    {/* 완료 여부 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label>완료 여부</label>
      <input
        type="checkbox"
        checked={finish}
        onChange={(e) => setFinish(e.target.checked)}
      />
    </div>

    {/* 버튼 영역 */}
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '10px'
    }}>
      <button
        type="submit"
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 18px',
          fontSize: '15px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {mb.modal.configbtn.value}
      </button>

      <button
        type="button"
        onClick={deleteTask}
        style={{
          backgroundColor: '#e53935',
          color: 'white',
          padding: '10px 18px',
          fontSize: '15px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        삭제
      </button>
    </div>

  </form>
</Modal>

        </div>
    );
}

export function GradeModal({p_id, name, univ_id, grade, comment}: {p_id: number, name: string, univ_id: number, grade: string, comment: string}){
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const [tmpGrade, setGrade] = useState(grade || '');
    const [tmpComment, setComment] = useState(comment || '');
    const data = {
        pid: p_id.toString(),
        univ_id: univ_id,
        grade: tmpGrade,
        comment: tmpComment
    }

    const handleFixGrade = (e: React.FormEvent) => {
        e.preventDefault();
        if(tmpGrade === ''){
            alert('학점을 선택해주세요.');
        }else{
            postGrade()
        }
    }

    const postGrade = async() => {
        try{
            const response = await axios.post("https://cd-api.chals.kim/api/grade/assign", data, {headers:{Authorization: process.env.SECRET_API_KEY}});
            closeModal()
        }catch{}
    }

    return(
        <div>
            <button onClick={openModal} style={{width: '100px', padding: '5px', fontSize: '16px'}}>학점 설정</button>
            <Modal isOpen={isOpen} closeModal={closeModal}>
                <div style={{fontSize: '32px', paddingBottom: '20px'}}>학점 수정</div>
                <form onSubmit={handleFixGrade} style={{fontSize: '18px'}}>
                    <div style={{padding: '15px'}}>
                        <span style={{padding: '10px'}}>이름</span>
                        <input 
                            type="text" 
                            value={name} 
                            readOnly
                            style={{width: '170px', height: '20px'}}
                        />
                    </div>
                    <div style={{padding: '15px'}}>
                        <span style={{padding: '10px'}}>학번</span>
                        <input 
                            type="number" 
                            value={univ_id} 
                            readOnly
                            style={{width: '170px', height: '20px'}}
                        />
                    </div>
                    <div style={{padding: '15px'}}>
                        <span style={{padding: '10px'}}>학점</span>
                        <select
                            value={tmpGrade}
                            onChange={(e) => setGrade(e.target.value)}
                            style={{width: '100px', padding: '5px', fontSize: '16px'}}
                        >
                            <option value=''>--</option>
                            <option value='A+'>A+</option>
                            <option value='A'>A</option>
                            <option value='B+'>B+</option>
                            <option value='B'>B</option>
                            <option value='C+'>C+</option>
                            <option value='C'>C</option>
                            <option value='D+'>D+</option>
                            <option value='D'>D</option>
                            <option value='F'>F</option>
                        </select>
                    </div>
                    <div style={{padding: '15px'}}><span>코멘트</span></div>
                    <div><textarea
                        value={tmpComment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{width: '80%', height: '100%', minHeight: '100px'}}
                    /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
                        <button type='submit' style={{fontSize: '15px'}}>{mb.modal.configbtn.value}</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}








//추가된 내용 유저관리
const bulkButtonStyle: CSSProperties = {
    padding: "8px 5px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: '32%',
    fontSize: '11px'
  };
  
  const radioLabelStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: 'center',
    gap: "6px",
    width: '32%',
  };


  const modalContainerStyle = {
    padding: "30px",
    borderRadius: "12px",
    backgroundColor: "#fff",
    maxWidth: "400px",
    margin: "auto",
    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
  } as const;
  
  const modalHeaderStyle = {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center",
    color: "#333",
  } as const;
  
  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  } as const;
  
  const formGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  } as const;
  
  const labelStyle = {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#444",
  } as const;
  
  const inputStyle = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
  } as const;
  
  const submitButtonStyle = {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  } as const;
  



  