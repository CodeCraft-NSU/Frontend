'use client';

import headers from '@/app/json/user.json';
import { UserConfigBtn } from './Modal';
import { useEffect, useState } from 'react';
import axios from 'axios';

type userList = {
  univ_id: number;
  role: string;
  name: string;
  permission: string;
};

type returnType = {
  RESULT_CODE: number;
  RESULT_MSG: string;
  PAYLOADS: userList[];
};

const UserDataTable = ({ p_id }: { p_id: any }) => {
  const [user, setUser] = useState<userList[]>([]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const response = await axios.post<returnType>(
        'https://cd-api.chals.kim/api/project/checkuser',
        { pid: p_id },
        {
          headers: { Authorization: process.env.SECRET_API_KEY },
        }
      );

      const sortedUsers = response.data.PAYLOADS.sort((a, b) => {
        if (a.permission && !b.permission) return -1;
        if (!a.permission && b.permission) return 1;
        return 0;
      });

      setUser(sortedUsers);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      maxWidth: '960px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <p style={{
        fontSize: '14px',
        color: '#666',
        marginBottom: '16px'
      }}>총 팀원 수: <strong>{user.length}</strong>명</p>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            border: '1px solid #ddd',
            width: '100%',
            fontSize: '16px',
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <thead style={{ backgroundColor: '#2563EB', color: '#fff' }}>
            <tr>
              {headers.Header.map((Item) => (
                <th
                  key={Item.text}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #ddd',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                  }}
                >
                  {Item.text}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {user.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  😢 등록된 팀원이 없습니다.
                </td>
              </tr>
            ) : (
              user.map((Item) => (
                <tr
                  key={Item.univ_id}
                  style={{
                    textAlign: 'center',
                    height: '60px',
                    transition: 'background-color 0.3s',
                    backgroundColor: Item.permission ? '#F3F4F6' : '#ffffff',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = Item.permission ? '#F3F4F6' : '#ffffff')
                  }
                >
                  <td style={{ fontWeight: 500 }}>{Item.name}</td>
                  <td>{Item.univ_id}</td>
                  <td>
                    <span style={{
                      backgroundColor: '#E5E7EB',
                      color: '#111827',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      {Item.role || '역할 미정'}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        background: Item.permission
                          ? 'linear-gradient(135deg, #F97316, #EF4444)'
                          : 'linear-gradient(135deg, #10B981, #059669)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      {Item.permission ? '👑 팀장' : '👤 팀원'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {/* <UserConfigBtn input={Item} pid={p_id} /> */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDataTable;
