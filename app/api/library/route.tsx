import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    // public/library 폴더 절대경로
    const libDir = path.join(process.cwd(), "public", "library");
    const files = await fs.readdir(libDir);

    // hiden 파일(.gitkeep 등) 제외
    const visible = files.filter((f) => !f.startsWith("."));

    return NextResponse.json({ files: visible });
  } catch (e) {
    console.error("라이브러리 파일 읽기 오류", e);
    return new NextResponse("Failed to load files", { status: 500 });
  }
}