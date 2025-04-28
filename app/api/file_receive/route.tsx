import { NextRequest, NextResponse } from "next/server";
import path from "path";
import * as fs from "fs/promises";

export async function POST(request: NextRequest) {  
    try{
        console.log("api start 2")
        //파일 이름 읽어오기
        const fileName = decodeURIComponent(request.headers.get("file-name")  || 'tmp')
        console.log("read")
        //파일 읽어오기
        const rawData = await request.arrayBuffer();
        console.log("read2")
        //파일 저장 경로 설정
        const uploadPath = path.join(process.cwd(), "public/uploads", fileName)
        console.log("path")
        //파일 저장
        await fs.writeFile(uploadPath, Buffer.from(rawData))
        console.log("save")
        return NextResponse.json({ success: true, message: "File received and saved", fileName})
    }catch(err){
        console.error("File handling error:", err)
        return NextResponse.json({ success: false, message: "File handling error" }, { status: 500 })
    }
}