'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { listType, returnEtc, etcType, returnOvr, ovrType, returnMm, mmType, returnReq, reqType, returnTest, testType, returnReport, reportType } from '@/app/util/types';
import DocumentTable2 from "@/app/components/DocumentTable2";
import SideAccount from "@/app/components/SideAccount";

function formatDate(input: string): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  const year = d.getFullYear();
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

export default function Test(props: any) {
    return(
        <div style={{width: '400px'}}>
            <SideAccount/>
        </div>
    )
}