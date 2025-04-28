'use client';
import { useState, useEffect } from "react"
import axios from "axios"
import Pagenation from "./pagenation"
import MsBox from '@/app/json/msBox.json'
import { AddTask, ConfigTask } from "@/app/components/Modal";
import { limitTitle } from "../util/string"
import { getUnivId } from '@/app/util/storage'
import usePermissionGuard from '@/app/util/usePermissionGuard'
import { useRouter } from "next/navigation"
import useSessionGuard from "../util/checkAccount"

type taskType = {
  p_no: number
  s_no: number
  w_checked: boolean
  w_end: string
  w_name: string
  w_no: number
  w_person: string
  w_start: string
}
type returnTask = {
  RESULT_CODE: number
  RESULT_MSG: string
  PAYLOADS: taskType[]
}
type postTaskPayload = {
  pid: number
  univ_id: number
}

const TaskTable = ({ page, p_id }: { page: number, p_id: number }) => {
  const router = useRouter();
  const [data, setData] = useState<taskType[]>([]);
  const s_no = getUnivId()

  useEffect(() => {
    loadTask();
  }, []);

  const itemsPerPage = 10;
  const currentData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const loadTask = async () => {
    const data: postTaskPayload = { pid: p_id, univ_id: 0 };
    try {
      const response = await axios.post<returnTask>(
        "https://cd-api.chals.kim/api/task/load_all",
        data,
        { headers: { Authorization: process.env.SECRET_API_KEY } }
      );
      const sortedData = response.data.PAYLOADS.sort(
        (a, b) => new Date(b.w_end).getTime() - new Date(a.w_end).getTime()
      );
      setData(sortedData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{
        margin: '0 auto',
        width: '90%',
        maxWidth: '1100px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0
          }}>{MsBox.task.tTitle.value}</h1>
        </div>

        {/* 테이블 헤더 */}
        <div style={{
          display: 'flex',
          backgroundColor: '#4CAF50',
          color: 'white',
          fontWeight: 'bold',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ width: '30%', padding: '12px' }}>{MsBox.task.tname.value}</div>
          <div style={{ width: '15%', padding: '12px' }}>{MsBox.task.tperson.value}</div>
          <div style={{ width: '15%', padding: '12px' }}>{MsBox.task.tstart.value}</div>
          <div style={{ width: '15%', padding: '12px' }}>{MsBox.task.tend.value}</div>
          <div style={{ width: '10%', padding: '12px' }}>{MsBox.task.tfinish.value}</div>
          <div style={{ width: '15%', padding: '12px' }}>{MsBox.task.tconfig.value}</div>
        </div>

        {/* 테이블 본문 */}
        {currentData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#aaa' }}>📂 등록된 업무가 없습니다.</div>
        ) : (
          currentData.map((item: taskType) => (
            <div key={item.w_no} style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              borderBottom: '1px solid #eaeaea',
              backgroundColor: '#fff',
              padding: '12px 0'
            }}>
              <div style={{ width: '30%' }}>{limitTitle(item.w_name, 30)}</div>
              <div style={{ width: '15%' }}>{item.w_person}</div>
              <div style={{ width: '15%' }}>{item.w_start}</div>
              <div style={{ width: '15%' }}>{item.w_end}</div>
              <div style={{ width: '10%' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: item.w_checked ? '#4caf50' : '#ff9800',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {item.w_checked ? '완료' : '진행 중'}
                </span>
              </div>
              <div style={{ width: '15%' }}>
                
              </div>
            </div>
          ))
        )}

        {/* 페이지네이션 */}
        <div style={{ marginTop: '30px' }}>
          <Pagenation currentPage={page} totalPages={totalPages} basePath={`/project-main/${p_id}/task`} />
        </div>
      </div>
    </div>
  );
}

export default TaskTable;
