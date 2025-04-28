'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import MsBox from '@/app/json/msBox.json';

type delData = {
    oid: number;
    type: string;
};

const handleDelbtn = async (data: delData, pid: number): Promise<boolean> => {
    const postData = { doc_s_no: data.oid };

    try {
        switch (data.type) {
            case MsBox.outType.etc.value:
                const formData = new FormData();
                formData.append('file_unique_id', data.oid.toString());
                await axios.post("https://cd-api.chals.kim/api/output/otherdoc_delete", {file_no: data.oid}, { headers: { Authorization: process.env.SECRET_API_KEY } });
                break;
            case MsBox.outType.overview.value:
                await axios.post("https://cd-api.chals.kim/api/output/sum_doc_delete", postData, { headers: { Authorization: process.env.SECRET_API_KEY } });
                break;
            case MsBox.outType.testcase.value:
                await axios.post("https://cd-api.chals.kim/api/output/testcase_delete", postData, { headers: { Authorization: process.env.SECRET_API_KEY } });
                break;
            case MsBox.outType.request.value:
                await axios.post("https://cd-api.chals.kim/api/output/reqspec_delete", postData, { headers: { Authorization: process.env.SECRET_API_KEY } });
                break;
            case MsBox.outType.minutes.value:
                await axios.post("https://cd-api.chals.kim/api/output/mm_delete", postData, { headers: { Authorization: process.env.SECRET_API_KEY } });
                break;
            case MsBox.outType.report.value:
                await axios.post("https://cd-api.chals.kim/api/output/report_delete", postData, { headers: { Authorization: process.env.SECRET_API_KEY } });
                break;
        }
        return true;
    } catch (err) {
        return false;
    }
};

const OutDelbtn = ({ data, pid }: { data: delData; pid: number }) => {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false); // ✅ 삭제 확인 버튼 상태

    // ✅ 첫 번째 클릭 시 "정말 삭제할까요?" 버튼 나타남
    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    // ✅ 두 번째 클릭 시 실제 삭제 실행
    const handleConfirmDelete = async () => {
        const success = await handleDelbtn(data, pid);
        if (success) {
            console.log('삭제 성공');
            router.push(`/project-main/${pid}/outputManagement`);
        } else {
            console.log('삭제 실패');
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            {!showConfirm ? (
                <button onClick={handleDeleteClick} style={deleteButtonStyle}>삭제</button>
            ) : (
                <>
                    <button onClick={handleConfirmDelete} style={confirmDeleteButtonStyle}>정말 삭제하시겠습니까?</button>
                    <button onClick={() => setShowConfirm(false)} style={cancelButtonStyle}>취소</button>
                </>
            )}
        </div>
    );
};

// ✅ 스타일 추가 (선택 사항)
const deleteButtonStyle = {
    backgroundColor: "#FF5733",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
};

const confirmDeleteButtonStyle = {
    backgroundColor: "red",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
};

const cancelButtonStyle = {
    backgroundColor: "#ccc",
    color: "#000",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
};

export default OutDelbtn;
