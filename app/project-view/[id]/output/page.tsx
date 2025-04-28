'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import MainHeader from '@/app/components/ViewMainHeader'
import MainSide from '@/app/components/ViewMainSide'
import MsBox from '@/app/json/msBox.json'

export default function OutputBack(props: any){
    const router = useRouter();
    useEffect(() => {
        router.push(`/project-main/${props.params.id}/outputManagement/`);
    })

    return(
        <div>
            {/*메인 헤더*/}
            <MainHeader pid = {props.params.id}/>

            {/*body*/}
            <div style={{display: 'flex'}}> 

                {/*왼쪽 사이드*/}
                <MainSide pid = {props.params.id}/>

                {/*메인 페이지*/}
                <div style={{height: 'calc(100vh - 105px)', width: 'calc(90% - 200px)', border: '1px solid #000000', display: 'flex', flexDirection: 'column', margin: '0', float: 'left'}}>
                    {MsBox.page.Loading.value}
                </div>
            </div>
        </div>
    )
}