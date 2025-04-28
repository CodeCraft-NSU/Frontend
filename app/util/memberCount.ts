'use client'

import axios from "axios";

export type ReturnMemberCount = {
    RESULT_CODE: number
    RESULT_MSG: string
    PAYLOAD: {
        Result: pnocount[]
    }
}

export type pnocount = {
    p_no: number
    count: number
}

export async function fetchMemberCount(uid: number): Promise<number> {
    try {
        const response = await axios.post<ReturnMemberCount>("https://cd-api.chals.kim/api/project/count_user", {univ_id: uid}, { headers: { Authorization: process.env.SECRET_API_KEY } });
    //   if (res.data.RESULT_CODE !== 200) throw new Error(res.data.RESULT_MSG);
    //   return res.data.PAYLOAD.memberCount;
        return 0;
    } catch {
        return 0;
    }
}