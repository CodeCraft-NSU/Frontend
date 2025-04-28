'use client'

import { useState, useEffect } from "react"
import axios from "axios"

type postType = {
    doc_type: number
    doc_s_no: number
}

const DocumentDownloadBtn = ({d_type, d_no, d_name}: {d_type: number, d_no: number, d_name: string}) => {
    const [dname, setDname] = useState('');
    const tmp_no = d_no

    useEffect(() => {
        switch(d_type){
            case 0:
                setDname("개요서");
                break;
            case 1:
                setDname("회의록")
                break;
            case 2:
                setDname("테스트케이스")
                break;
            case 3:
                setDname("요구사항")
                break;
            case 4:
                setDname("보고서")
                break;
            default:
                setDname("")
                break;
        }
    }, [d_type])
    

    const documentDownload = async() => {
        const data: postType = {doc_type: d_type, doc_s_no: d_no}
        try{
            const response = await axios.post("https://cd-api.chals.kim/api/docs/convert", data, {headers:{Authorization: process.env.SECRET_API_KEY}});

            const fileUrl = `/uploads/${dname}_${tmp_no}.docx`;
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = `${dname}.docx`
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }catch(err){}
    }

    return (
        <button onClick={() => documentDownload()} style={downloadButtonStyle}>다운로드</button>
    )
}

export default DocumentDownloadBtn;

const downloadButtonStyle = {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
};

const confirmdownloadButtonStyle = {
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