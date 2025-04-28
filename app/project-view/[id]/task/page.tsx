import MainHeader from "@/app/components/ViewMainHeader";
import MainSide from "@/app/components/ViewMainSide";
import { AddTask } from "@/app/components/Modal";
import TaskTable from "@/app/components/ViewTaskTable";
import MsBox from '@/app/json/msBox.json'


export default function Task({ params, searchParams }: { params: { id: number }, searchParams: { page?: string } }) {
    // const itemsPerPage = 10; // 한 페이지당 표시할 글 수
    const page = parseInt(searchParams.page || "1", 10);
    
    return(
        <div style={{height: '100vh'}}>
            <MainHeader pid = {params.id}/>

            <div style={{display: 'flex', flex: 1, height: 'calc(100% - 100px)'}}>
                <MainSide pid = {params.id}/>

                <div style={{width: '100%', display: 'flex', flexDirection: 'column', margin: '0', float: 'left'}}>
                    <TaskTable page={page} p_id={params.id}/>
                            
                </div>
            </div>
        </div>
    );
}