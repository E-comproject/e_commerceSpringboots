'use client';

import { useState, useEffect } from 'react';

export default function WebSocketTestPage() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [wsStatus, setWsStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  useEffect(() => {
    // Test backend API
    fetch('http://localhost:8080/api/chat/rooms/buyer?buyerId=1&page=0&size=1')
      .then(response => {
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => {
        setBackendStatus('offline');
      });

    // Test WebSocket
    import('@/lib/chatWebSocket').then(({ getChatWebSocketService }) => {
      setTimeout(() => {
        const ws = getChatWebSocketService();
        if (ws?.isWebSocketConnected()) {
          setWsStatus('connected');
        } else {
          setWsStatus('failed');
        }
      }, 3000);
    });
  }, []);

  const testManualConnection = () => {
    console.log('Testing manual WebSocket connection...');

    try {
      const SockJS = require('sockjs-client');
      const socket = new SockJS('http://localhost:8080/ws-chat');

      socket.onopen = () => {
        console.log('✅ SockJS connection opened');
        alert('SockJS connection successful!');
        socket.close();
      };

      socket.onerror = (error: any) => {
        console.error('❌ SockJS connection error:', error);
        alert('SockJS connection failed: ' + error);
      };

      socket.onclose = () => {
        console.log('SockJS connection closed');
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (socket.readyState !== 1) {
          console.error('❌ SockJS connection timeout');
          alert('Connection timeout - Backend may not be running');
          socket.close();
        }
      }, 10000);

    } catch (error) {
      console.error('Error creating SockJS connection:', error);
      alert('Error: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">WebSocket Connection Test</h1>

          {/* Status indicators */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                backendStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                Backend API: {
                  backendStatus === 'checking' ? 'Checking...' :
                  backendStatus === 'online' ? '✅ Online' : '❌ Offline'
                }
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                wsStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                WebSocket: {
                  wsStatus === 'checking' ? 'Checking...' :
                  wsStatus === 'connected' ? '✅ Connected' : '❌ Failed'
                }
              </span>
            </div>
          </div>

          {/* Manual test button */}
          <div className="mt-6">
            <button
              onClick={testManualConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Manual Connection
            </button>
          </div>

          {/* Troubleshooting guide */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Troubleshooting:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>1. ✅ Backend ต้องรันที่ port 8080</div>
              <div>2. ✅ Frontend ต้องรันที่ port 3000</div>
              <div>3. ✅ เช็ค console logs (F12)</div>
              <div>4. ✅ ลอง refresh หน้าเว็บ</div>
              <div>5. ✅ ตรวจสอบว่า Docker database รันอยู่</div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 space-x-4">
            <a href="/chat" className="text-blue-500 hover:underline">← Back to Chat</a>
            <a href="/chat-test" className="text-blue-500 hover:underline">Chat Test Page</a>
          </div>
        </div>
      </div>
    </div>
  );
}