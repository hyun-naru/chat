// 스피너 및 채팅 로딩 유틸리티 함수
function showFlowLoading(callback, delay = 400) {
    const chatFlow = document.getElementById('chatFlow');
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
        if (overlay) overlay.remove();
        if (typeof callback === 'function') callback();
    }, delay);
}

function showChatLoading() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    window.hideChatLoading();

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message received loading-dots';
    loadingDiv.id = 'chatTypingLoading';
    loadingDiv.innerHTML = '<span></span><span></span><span></span>';

    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideChatLoading() {
    const loadingDiv = document.getElementById('chatTypingLoading');
    if (loadingDiv) loadingDiv.remove();
}

// 메인 초기화 함수
window.initChat = function() {
    let currentMenuId = null;
    let currentStep = 1;

    const btnBack = document.getElementById('btnBack');
    const flow01 = document.getElementById('flow01');
    const chatFlow = document.getElementById('chatFlow');
    const chatLive = document.getElementById('chatLive');
    const btnToggleFlow = document.getElementById('btnToggleFlow');

    if (!flow01) return;

    // 접기/펼치기 토글
    if (btnToggleFlow && chatLive) {
        chatLive.classList.remove('collapsed');

        if (chatFlow) {
            chatFlow.classList.add('fix-no');
        }

        btnToggleFlow.classList.add('active');
        btnToggleFlow.setAttribute('aria-expanded', 'true');
        btnToggleFlow.setAttribute('aria-label', 'ai 챗봇 대화 닫기');
        btnToggleFlow.textContent = 'ai 챗봇 닫기 ▲';

        btnToggleFlow.onclick = function() {
            const isCollapsed = chatLive.classList.toggle('collapsed');

            if (chatFlow) {
                chatFlow.classList.toggle('fix-no', !isCollapsed);
            }

            btnToggleFlow.classList.toggle('active', !isCollapsed);
            btnToggleFlow.setAttribute('aria-expanded', String(!isCollapsed));
            btnToggleFlow.setAttribute(
                'aria-label',
                isCollapsed ? 'ai 챗봇 대화 열기' : 'ai 챗봇 대화 닫기'
            );
            btnToggleFlow.textContent = isCollapsed
                ? 'ai 챗봇 열기 ▼'
                : 'ai 챗봇 닫기 ▲';
        };
    }
    
    // Step 제어 함수
    function renderStep(menuId, step) {
        const allBoxes = document.querySelectorAll('.flow-box');
        allBoxes.forEach(box => box.style.display = 'none');

        if (step === 1 || !menuId) {
            if (flow01) flow01.style.display = 'block';
            if (btnBack) btnBack.style.display = 'none';
            currentMenuId = null;
            currentStep = 1;
        } else {
            const target = document.querySelector(`.menu-box[data-menu="${menuId}"][data-step="${step}"]`);
            if (target) {
                target.style.display = 'block';
                if (btnBack) btnBack.style.display = 'block';
                currentMenuId = menuId;
                currentStep = step;

                // [REQ-CH-012] 사용인 확인 라디오 토글 초기화
                if (menuId === 'REQ-CH-012' && step === 3) {
                    toggleSearchArea();
                }
            } else {
                if (flow01) flow01.style.display = 'block';
                if (btnBack) btnBack.style.display = 'none';
            }
        }
    }

    // 초기 화면 실행
    renderStep(null, 1);

    // 처음으로 버튼
    if (btnBack) {
        btnBack.onclick = function() {
            showFlowLoading(() => {
                renderStep(null, 1);
            }, 300);
        };
    }

    // [공통] 검색 및 버튼 유효성 검증 함수
    function executeSearch($el) {
        const $currentBox = $el.closest('.flow-box');
        const menuId = $currentBox.data('menu');
        const step = Number($currentBox.data('step'));

        // [REQ-CH-012] 3단계: 사용인 확인 검색 입력 필드 검증
        if (menuId === 'REQ-CH-012' && step === 3) {
            const $visibleSearchItem = $currentBox.find('.search-towline:visible');
            let emptyInput = null;
            let alertMsg = '검색어를 입력해 주세요.';

            $visibleSearchItem.find('input.ipt').each(function(index) {
                const $ipt = $(this);
                if (!$ipt.val().trim()) {
                    emptyInput = $ipt;
                    if (index === 0) {
                        alertMsg = '이름을 입력해 주세요.';
                    } else if (index === 1) {
                        const placeholder = $ipt.attr('placeholder') || '';
                        alertMsg = `${placeholder}를(을) 입력해 주세요.`;
                    }
                    return false;
                }
            });

            if (emptyInput) {
                uiInfo.mo.alert(alertMsg, function() {
                    emptyInput.focus();
                });
                return false;
            }
            return true;
        }

        let isValid = true;
        let targetIpt = null;

        // 일반 검색창 입력 필드 검증
        $currentBox.find('.srchIpt input.ipt').each(function() {
            const $iptField = $(this);
            if ($iptField.is(':visible') && !$iptField.val().trim()) {
                isValid = false;
                targetIpt = $iptField;
                return false;
            }
        });

        if (!isValid && targetIpt) {
            let msg = '검색어를 입력해 주세요.';
            if (['REQ-CH-002', 'REQ-CH-003', 'REQ-CH-004', 'REQ-CH-005', 'REQ-CH-024'].includes(menuId)) {
                msg = '증권번호를 입력해 주세요.';
            } else if (['REQ-CH-021', 'REQ-CH-022', 'REQ-CH-023', 'REQ-CH-025', 'REQ-CH-026'].includes(menuId)) {
                msg = '고객명을 입력해 주세요.';
            }

            uiInfo.mo.alert(msg, function() {
                targetIpt.focus();
            });
            return false;
        }

        return true;
    }

    // 메뉴 버튼 및 서브 메뉴 버튼 통합 클릭 처리
    if (chatFlow) {
        chatFlow.onclick = function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            // 1. 검색 버튼(icoBtn_appSrch, btn_t) 또는 .srchIpt / .search-towline 내부 버튼 클릭 시 유효성 검증
            if (btn.classList.contains('icoBtn_appSrch') || btn.classList.contains('btn_t') || $(btn).closest('.srchIpt').length > 0 || $(btn).closest('.search-towline').length > 0) {
                if (!executeSearch($(btn))) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                return;
            }

            // 2. 이전 버튼 클릭
            if (btn.classList.contains('btn-prev')) {
                showFlowLoading(() => {
                    if (currentStep > 1) {
                        renderStep(currentMenuId, currentStep - 1);
                    } else {
                        renderStep(null, 1);
                    }
                }, 300);

                return;
            }

            // 3. 다음/확인/신청 버튼 클릭 처리 (컨텐츠별 유효성 검사)
            if (btn.classList.contains('btn-next')) {
                const $currentBox = $(btn).closest('.flow-box');
                const menuId = currentMenuId || $currentBox.data('menu');
                const step = currentStep || Number($currentBox.data('step'));

                // [REQ-CH-003 반송 / REQ-CH-004 청약철회] 2단계: 계약 선택 라디오 체크 및 심사자 체크
                if ((menuId === 'REQ-CH-003' || menuId === 'REQ-CH-004') && step === 2) {
                    const radioName = menuId === 'REQ-CH-003' ? 'selectItem3' : 'selectItem4';
                    const selectedItem = document.querySelector(`input[name="${radioName}"]:checked`);
                    
                    if (!selectedItem) {
                        uiInfo.mo.alert('신청할 계약을 선택해주세요.');
                        return;
                    }

                    if (menuId === 'REQ-CH-003') {
                        const reviewer = selectedItem
                            ?.closest('.list-btn')
                            ?.querySelector('.tit:last-of-type span:last-child')
                            ?.textContent.trim();

                        if (reviewer == null || reviewer === '' || reviewer === '-') {
                            uiInfo.mo.alert('심사중인 계약은 반송 신청이 불가합니다. 심사자가 배정되어야 합니다.');
                            return;
                        }
                    }
                }

                // [REQ-CH-003 반송 / REQ-CH-004 청약철회] 3단계: 전달 내용 입력 체크
                if ((menuId === 'REQ-CH-003' || menuId === 'REQ-CH-004') && step === 3) {
                    const $textarea = $currentBox.find('textarea.ipt');
                    if ($textarea.length && !$textarea.val().trim()) {
                        uiInfo.mo.alert('전달 내용을 입력해 주세요.', function() {
                            $textarea.focus();
                        });
                        return;
                    }
                }

                // [REQ-CH-005 가입설계서 재발송] 2단계: 대상 계약 선택 체크
                if (menuId === 'REQ-CH-005' && step === 2) {
                    if (!$('input[name="selectItem005"]:checked').length) {
                        uiInfo.mo.alert('가입설계서 재발송 대상을 선택해주세요.');
                        return;
                    }
                }

                // [REQ-CH-005 가입설계서 재발송] 3단계: 라디오 선택 체크 추가
                if (menuId === 'REQ-CH-005' && step === 3) {
                    if (!$currentBox.find('input[type="radio"]:checked').length) {
                        uiInfo.mo.alert('재발송 대상을 선택해주세요.');
                        return;
                    }
                }

                // [REQ-CH-012] 2단계: 검색조건 선택 체크
                if (menuId === 'REQ-CH-012' && step === 2) {
                    if (!$currentBox.find('input[type="radio"]:checked').length) {
                        uiInfo.mo.alert('사용인 검색 조건을 선택해주세요.');
                        return;
                    }
                }

                // 검증 통과 시 다음 Step 진행
                showFlowLoading(() => {
                    renderStep(currentMenuId, currentStep + 1);
                }, 400);

                return;
            }

            // 4. Flow 메인 및 메뉴 depth 버튼 클릭 처리
            if (btn.id) {
                const menuId = btn.id;

                const targetStep2 = document.querySelector(`.menu-box[data-menu="${menuId}"][data-step="2"]`);
                const targetStep3 = document.querySelector(`.menu-box[data-menu="${menuId}"][data-step="3"]`);
                const targetStep4 = document.querySelector(`.menu-box[data-menu="${menuId}"][data-step="4"]`);

                if (targetStep2) {
                    showFlowLoading(() => {
                        renderStep(menuId, 2);
                    }, 400);
                } else if (targetStep3) {
                    showFlowLoading(() => {
                        renderStep(menuId, 3);
                    }, 400);
                } else if (targetStep4) {
                    showFlowLoading(() => {
                        renderStep(menuId, 4);
                    }, 400);
                }
            }
        };
        
        // 엔터 키 검색 이벤트 핸들러
        chatFlow.onkeypress = function(e) {
            if (e.key === 'Enter' && e.target.classList.contains('ipt') && e.target.classList.contains('search')) {
                if (!executeSearch($(e.target))) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        };
    }

    // [REQ-CH-012] 라디오 전환 전용 함수
    function toggleSearchArea() {
        const iptFilt3_1 = document.getElementById('iptFilt3_1');
        const search1 = document.getElementById('search1');
        const search2 = document.getElementById('search2');

        if (!search1 || !search2) return;

        if (iptFilt3_1 && iptFilt3_1.checked) {
            search1.style.display = 'flex';
            search2.style.display = 'none';
        } else {
            search1.style.display = 'none';
            search2.style.display = 'flex';
        }
    }

    const iptFilt3_1 = document.getElementById('iptFilt3_1');
    const iptFilt3_2 = document.getElementById('iptFilt3_2');
    if (iptFilt3_1) iptFilt3_1.addEventListener('change', toggleSearchArea);
    if (iptFilt3_2) iptFilt3_2.addEventListener('change', toggleSearchArea);
};

// 최초 자동 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initChat);
} else {
    window.initChat();
}

// 메시지 전송 로직
window.handleKeyPress = function(event) {
    if (event.key === 'Enter') sendMessage();
};

window.sendMessage = function() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;

    const text = messageInput.value.trim();
    if (!text) return;

    appendMessage(text, 'sent');
    messageInput.value = '';

    showChatLoading();

    setTimeout(() => {
        hideChatLoading();
        receiveMessage('전송하신 "' + text + '"에 대한 서버 응답입니다.');
    }, 1000);
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