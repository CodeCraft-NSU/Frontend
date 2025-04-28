import MainHeader from '@/app/components/MainHeader';
import MainSide from '@/app/components/MainSide';
import Pagenation from '@/app/components/pagenation';
import Link from 'next/link';
import DocumentTable from '@/app/components/DocumentTable';
import DocumentTable2 from '@/app/components/DocumentTable2';

export default function OutputManagement({ params, searchParams }: { params: { id: number }; searchParams: { page?: string } }) {
    const page = parseInt(searchParams.page || '1', 10);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Roboto', sans-serif", backgroundColor: '#f9fafb' }}>
            <MainHeader pid={params.id} />

            <div style={{ display: 'flex', flex: 1 }}>
                <MainSide pid={params.id} />

                <div
                    style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        margin: '20px',
                        marginBottom: '0px',
                        padding: '20px',
                    }}
                >
                    <h1 style={{ fontSize: '24px', color: '#4CAF50', marginBottom: '20px', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
                        산출물 관리
                    </h1>

                    <div
                        style={{
                            marginBottom: '20px',
                            padding: '15px',
                            borderRadius: '10px',
                            backgroundColor: '#f3f4f6',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <p style={{ fontSize: '16px', color: '#6b7280' }}>
                            현재 프로젝트 산출물을 관리하고 확인하세요. 산출물 폴더를 클릭하여 세부 내용을 확인할 수 있습니다.
                        </p>
                    </div>

                    {/* <DocumentTable page={page} pid={params.id} /> */}
                    <DocumentTable2 pid={params.id} />
                </div>
            </div>
        </div>
    );
}
