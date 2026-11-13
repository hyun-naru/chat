function showFlowLoading(callback, delay = 400) {
    const chatFlow = document.getElementById('chatFlow');
    if (!chatFlow) {
        if (callback) callback();
        return;
    }

    // 기존 로딩 오버레이 제거
    const existing = chatFlow.querySelector('.flow-loading-overlay');
    if (existing) existing.remove();

    // 로딩 생성
    const overlay = document.createElement('div');
    overlay.className = 'flow-loading-overlay';
    overlay.innerHTML = '<div class="flow-spinner"></div>';
    chatFlow.appendChild(overlay);

    setTimeout(() => {
        if (overlay) overlay.remove();
        if (typeof callback === 'function') callback();
    }, delay);
}

function showChatLoading() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return null;

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message received loading-dots';
    loadingDiv.id = 'chatTypingLoading';
    loadingDiv.innerHTML = '<span></span><span></span><span></span>';

    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}

function hideChatLoading() {
    const loadingDiv = document.getElementById('chatTypingLoading');
    if (loadingDiv) loadingDiv.remove();
}

window.initChat = function() {
    const btnBack = document.getElementById('btnBack');
    const flow01 = document.getElementById('flow01');
    const flow02 = document.getElementById('flow02');
    const flow03 = document.getElementById('flow03');
    const flow04 = document.getElementById('flow04');
    const flow05 = document.getElementById('flow05');
    const flow06 = document.getElementById('flow06');
    const flow07 = document.getElementById('flow07');
    const flowBoxes = document.getElementsByClassName('flow-box');

    if (!flow01 || !flow02) return;

    const searchInput = flow02.querySelector('.ipt.search');
    const searchBtn = flow02.querySelector('.icoBtn_search');
    const delBtn = flow02.querySelector('.icoBtn_del');
    const listBtnArea = flow02.querySelector('.list-btn');

    const chatFlow = document.getElementById('chatFlow');
    const chatLive = document.getElementById('chatLive');
    const btnToggleFlow = document.getElementById('btnToggleFlow');

    // 토글 이벤트 (chatFlow에 fix_no 토글 반영)
    if (btnToggleFlow && chatLive) {
        btnToggleFlow.onclick = function() {
            const isCollapsed = chatLive.classList.toggle('collapsed');
            
            if (chatFlow) {
                chatFlow.classList.toggle('fix_no', isCollapsed);
            }

            btnToggleFlow.classList.toggle('active', !isCollapsed);
            btnToggleFlow.setAttribute('aria-expanded', !isCollapsed);
            btnToggleFlow.setAttribute('aria-label', isCollapsed ? 'ai 챗봇 대화 열기' : 'ai 챗봇 대화 닫기');
            btnToggleFlow.textContent = isCollapsed ? 'ai 챗봇 열기 ▼' : 'ai 챗봇 닫기 ▲';
        };
    }
    
    for (let i = 0; i < flowBoxes.length; i++) {
        flowBoxes[i].setAttribute('tabindex', '-1');
    }

    // --- flow-box 전용 로딩 스피너 함수 ---
    function showFlowLoading(callback, delay = 400) {
        if (!chatFlow) {
            if (callback) callback();
            return;
        }

        const existing = chatFlow.querySelector('.flow-loading-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'flow-loading-overlay';
        overlay.innerHTML = '<div class="flow-spinner"></div>';
        chatFlow.appendChild(overlay);

        setTimeout(() => {
            overlay.remove();
            if (typeof callback === 'function') callback();
        }, delay);
    }

    // 단계 전환 공통 함수
    function switchFlow(targetFlow) {
        if (!targetFlow) return;
        [flow01, flow02, flow03, flow04, flow05, flow06, flow07].forEach(f => {
            if (f) f.style.display = 'none';
        });
        
        targetFlow.style.display = 'block';
        if (typeof targetFlow.focus === 'function') targetFlow.focus();
    }

    // 초기화 함수
    function initFlow(isUserAction = false) {
        switchFlow(flow01);
        if (btnBack) btnBack.style.display = 'none';

        if (isUserAction && flow01 && typeof flow01.focus === 'function') {
            flow01.focus();
        }
    }

    // 초기 화면 진입
    initFlow();

    // 우측 상단 플로팅 처음으로 버튼
    if (btnBack) {
        btnBack.onclick = function() {
            showFlowLoading(() => {
                initFlow(true);
            }, 300);
        };
    }

    // flow01: 클릭 시 로딩 후 flow02 이동
    if (flow01) {
        flow01.onclick = function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;

            showFlowLoading(() => {
                switchFlow(flow02);
                if (btnBack) btnBack.style.display = 'block';
                
                setTimeout(() => {
                    if (searchInput) searchInput.focus();
                }, 50);
            }, 400);
        };
    }

    // flow02 버튼 제어 (.action-btn 전용)
    if (flow02) {
        flow02.onclick = function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;

            const btnArea = btn.closest('.action-btn');
            if (btnArea) {
                const buttons = btnArea.querySelectorAll('button');
                // 첫 번째 버튼 (이전): flow01로 이동
                if (btn === buttons[0]) {
                    showFlowLoading(() => {
                        switchFlow(flow01);
                    }, 300);
                } 
                // 마지막 버튼 (다음/확인): flow03으로 이동
                else if (btn === buttons[buttons.length - 1]) {
                    showFlowLoading(() => {
                        switchFlow(flow03);
                    }, 400);
                }
            }
        };
    }

    // flow03 버튼 제어
    if (flow03) {
        flow03.onclick = function(e) {
            const btn = e.target.closest('button');
            if (!btn || btn.classList.contains('btnBack')) return;

            const btnArea = btn.closest('.action-btn');
            if (btnArea) {
                const buttons = btnArea.querySelectorAll('button');
                // 이전 버튼
                if (btn === buttons[0]) {
                    showFlowLoading(() => {
                        switchFlow(flow02);
                    }, 300);
                } 
                // 다음 버튼
                else if (btn === buttons[buttons.length - 1]) {
                    showFlowLoading(() => {
                        switchFlow(flow04);
                    }, 400);
                }
            }
        };
    }

    // flow04 버튼 제어
    if (flow04) {
        flow04.onclick = function(e) {
            const btn = e.target.closest('button');
            if (!btn || btn.classList.contains('btnBack')) return;

            const btnArea = btn.closest('.action-btn');
            if (btnArea) {
                const buttons = btnArea.querySelectorAll('button');
                // 이전 버튼
                if (btn === buttons[0]) {
                    showFlowLoading(() => {
                        switchFlow(flow03);
                    }, 300);
                } 
                // 다음 버튼
                else if (btn === buttons[buttons.length - 1]) {
                    showFlowLoading(() => {
                        switchFlow(flow05);
                    }, 400);
                }
            }
        };
    }
    // flow05 버튼 제어
    if (flow05) {
        flow05.onclick = function(e) {
            const btn = e.target.closest('button');
            if (!btn || btn.classList.contains('btnBack')) return;

            const btnArea = btn.closest('.action-btn');
            if (btnArea) {
                const buttons = btnArea.querySelectorAll('button');
                // 이전 버튼
                if (btn === buttons[0]) {
                    showFlowLoading(() => {
                        switchFlow(flow04);
                    }, 300);
                } 
                // 다음 버튼
                else if (btn === buttons[buttons.length - 1]) {
                    showFlowLoading(() => {
                        switchFlow(flow06);
                    }, 400);
                }
            }
        };
    }
    // flow06 버튼 제어
    if (flow06) {
        flow06.onclick = function(e) {
            const btn = e.target.closest('button');
            if (!btn || btn.classList.contains('btnBack')) return;

            const btnArea = btn.closest('.action-btn');
            if (btnArea) {
                const buttons = btnArea.querySelectorAll('button');
                // 이전 버튼
                if (btn === buttons[0]) {
                    showFlowLoading(() => {
                        switchFlow(flow05);
                    }, 300);
                } 
                // 다음 버튼
                else if (btn === buttons[buttons.length - 1]) {
                    showFlowLoading(() => {
                        switchFlow(flow07);
                    }, 400);
                }
            }
        };
    }
    const iptFilt3_1 = document.getElementById('iptFilt3_1');
    const iptFilt3_2 = document.getElementById('iptFilt3_2');
    const search1 = document.getElementById('search1');
    const search2 = document.getElementById('search2');

    function toggleSearchArea() {
        if (!search1 || !search2) return;
        if (iptFilt3_1 && iptFilt3_1.checked) {
            search1.style.display = 'block';
            search2.style.display = 'none';
        } else {
            search1.style.display = 'none';
            search2.style.display = 'flex';
        }
    }

    if (iptFilt3_1) iptFilt3_1.addEventListener('change', toggleSearchArea);
    if (iptFilt3_2) iptFilt3_2.addEventListener('change', toggleSearchArea);
};

// 최초 자동 실행 (윈도우 팝업 및 최초 로드용)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initChat);
} else {
    window.initChat();
}

// =========================================================
// 라이브 대화 메세지 전역 함수 및 채팅 로딩 처리
// =========================================================
window.handleKeyPress = function(event) {
    if (event.key === 'Enter') sendMessage();
};

window.sendMessage = function() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;

    const text = messageInput.value.trim();
    if (!text) return;

    // 1. 사용자 보낸 메시지 출력
    appendMessage(text, 'sent');
    messageInput.value = '';

    // 2. 채팅 로딩(점 3개 애니메이션) 표시
    showChatLoading();

    // 3. 서버 응답 모의 처리 (1초 후 로딩 지우고 응답 메시지 출력)
    setTimeout(() => {
        hideChatLoading();
        receiveMessage('전송하신 "' + text + '"에 대한 서버 응답입니다.');
    }, 1000);
};

window.showChatLoading = function() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // 기존 로딩 중복 방지
    window.hideChatLoading();

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message received loading-dots';
    loadingDiv.id = 'chatTypingLoading';
    loadingDiv.innerHTML = '<span></span><span></span><span></span>';

    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

window.hideChatLoading = function() {
    const loadingDiv = document.getElementById('chatTypingLoading');
    if (loadingDiv) loadingDiv.remove();
};

window.receiveMessage = function(text) {
    appendMessage(text, 'received');
};

window.appendMessage = function(text, type) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = text;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};
       
       