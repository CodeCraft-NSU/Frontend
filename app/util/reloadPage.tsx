'use client';

export const usePageReload = () => {
    const reloadPage = () => {
        window.location.reload(); // 현재 경로를 다시 호출하여 새로고침
    };
    return { reloadPage };
};