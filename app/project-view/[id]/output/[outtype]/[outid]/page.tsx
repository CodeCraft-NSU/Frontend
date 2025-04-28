import MainHeader from '@/app/components/ViewMainHeader'
import MainSide from '@/app/components/ViewMainSide'
import MsBox from '@/app/json/msBox.json'
import { OutputEtc, OutputOvr, OutputMm, OutputTest, OutputReq, OutputReport } from '@/app/components/ViewDynOutCom'

const DynamicOutput = ({type, oid, pid}: {type: string, oid: number, pid: number}) => {
    // const item = Udata.find((item) => item.id === Number(value));

    switch(type){
        case MsBox.outType.etc.value:
            return <OutputEtc oid={oid} pid={pid}/>
        case MsBox.outType.overview.value:
            return <OutputOvr oid={oid} pid={pid}/>
        case MsBox.outType.testcase.value:
            return <OutputTest oid={oid} pid={pid}/>
        case MsBox.outType.request.value:
            return <OutputReq oid={oid} pid={pid}/>
        case MsBox.outType.minutes.value:
            return <OutputMm oid={oid} pid={pid}/>
        case MsBox.outType.report.value:
            return <OutputReport oid={oid} pid={pid}/>
        default:
            return <div>Error : {type}</div>
    }
}

export default function Output(props: any){

    return(
        <div>
            {/*메인 헤더*/}
            <MainHeader pid = {props.params.id}/>

            {/*body*/}
            <div style={{display: 'flex'}}> 

                {/*왼쪽 사이드*/}
                <MainSide pid = {props.params.id}/>

                {/*메인 페이지*/}
                <div style={{height: 'calc(100vh - 105px)', width: 'calc(90% - 200px)', display: 'flex', margin: '0', alignContent: 'center', overflowY: 'auto'}}>
                    <div style={{margin: '10px auto', width: '85%'}}>
                        <DynamicOutput type={props.params.outtype} oid={props.params.outid} pid={props.params.id}/>
                    </div>
                </div>
            </div>
        </div>
    )
}