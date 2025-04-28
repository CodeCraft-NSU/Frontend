import MainHeader from "@/app/components/ViewMainHeader"
import MainSide from "@/app/components/ViewMainSide"
import UserDataTable from "@/app/components/ViewUserTable";
import { AddUser } from "@/app/components/Modal";
import mb from '@/app/json/msBox.json'

export default function userManagement(props: any){
    return (
        <div>
            {/*메인 헤더*/}
            <MainHeader pid = {props.params.id}/>

            {/*body*/}
            <div style={{display: 'flex'}}> 

                {/*왼쪽 사이드*/}
                <MainSide pid = {props.params.id}/>

                {/*메인 페이지*/}
                <div style={{height: 'calc(100vh - 105px)', width: 'calc(90% - 200px)', display: 'flex', flexDirection: 'column', margin: '0', float: 'left'}}>
                    <div style={{margin: '10% auto', height: '100%', width: '70%'}}>
                        <span style={{fontSize: '40px'}}>{mb.usermanage.userlist.value}</span>
                        <UserDataTable p_id={props.params.id}/>
                    </div>
                </div>
            </div>
        </div>
    );
}