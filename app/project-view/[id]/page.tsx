'use client'

import {useEffect} from 'react'
import { useRouter } from 'next/navigation';

export default function id(props: any){
    const router = useRouter();
    useEffect(() => {
        router.push(`/project-view/${props.params.id}/main`);
    })
    return(
        <div>Loding...</div>
    );
}