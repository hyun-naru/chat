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

// 리스트 아코디언 변환 (조회용 .list-btn > div.btn-label 대상, 라디오 선택형은 제외)
let accSeq = 0;
window.initAccordion = function(root) {
    (root || document).querySelectorAll('.list-btn:not(.not-acc) > div.btn-label:not([data-acc])').forEach(function(card) {
        const firstTit = card.querySelector(':scope > .tit');
        if (!firstTit) return;
        card.setAttribute('data-acc', '1');
        card.classList.add('acc-item');

        const id = 'acc' + (++accSeq);
        const head = document.createElement('button');
        head.type = 'button';
        head.className = 'acc-head';
        head.setAttribute('aria-expanded', 'false');
        head.setAttribute('aria-controls', id);

        const panel = document.createElement('div');
        panel.className = 'acc-panel';
        panel.id = id;
        panel.setAttribute('role', 'region');
        const inner = document.createElement('div');
        inner.className = 'acc-inner';
        panel.appendChild(inner);

        Array.from(card.children).forEach(function(el) {
            if (el !== firstTit) inner.appendChild(el);
        });

        head.appendChild(firstTit);
        const arrow = document.createElement('i');
        arrow.className = 'acc-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        head.appendChild(arrow);

        card.appendChild(head);
        card.appendChild(panel);

        head.addEventListener('click', function(e) {
            e.stopPropagation();
            const willOpen = !card.classList.contains('open');
            // 한 번에 하나만 열기 (여러 개 허용하려면 아래 블록 삭제)
            card.parentElement.querySelectorAll('.acc-item.open').forEach(function(o) {
                if (o !== card) {
                    o.classList.remove('open');
                    o.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
                }
            });
            card.classList.toggle('open', willOpen);
            head.setAttribute('aria-expanded', String(willOpen));
        });
    });
};

// 하단 액션바에 '처음으로' 버튼 삽입 (액션바 없는 단계는 단독 바 생성)
function initHomeButtons() {
    document.querySelectorAll('.menu-box').forEach(function(box) {
        if (box.querySelector('.btn-home')) return;
        const home = document.createElement('button');
        home.type = 'button';
        home.className = 'btn_w l btn-home';
        home.setAttribute('aria-label', '처음 단계로 돌아가기');
        home.innerHTML = '<i class="ico-home" aria-hidden="true"></i><span>처음으로</span>';

        let bar = box.querySelector(':scope > .btn-area.action-btn');
        if (bar) {
            bar.insertBefore(home, bar.firstChild);
        } else {
            bar = document.createElement('div');
            bar.className = 'btn-area action-btn home-only';
            bar.appendChild(home);
            box.appendChild(bar);
        }
    });
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

    window.initAccordion();

    initHomeButtons();

    // 접기/펼치기 토글
    if (btnToggleFlow && chatLive) {
        chatLive.classList.remove('collapsed');

        // if (chatFlow) {
        //     chatFlow.classList.add('fix-no');
        // }

        btnToggleFlow.classList.add('active');
        btnToggleFlow.setAttribute('aria-expanded', 'true');
        btnToggleFlow.setAttribute('aria-label', 'AI 챗봇 대화 닫기');
        btnToggleFlow.textContent = 'AI 챗봇 닫기 ▲';

        // 접기/펼치기 토글
        btnToggleFlow.onclick = function() {
            const isCollapsed = chatLive.classList.toggle('collapsed');

            // if (chatFlow) {
            //     chatFlow.classList.toggle('fix-no', !isCollapsed);
            // }

            btnToggleFlow.classList.toggle('active', !isCollapsed);
            btnToggleFlow.setAttribute('aria-expanded', String(!isCollapsed));
            btnToggleFlow.setAttribute(
                'aria-label',
                isCollapsed ? 'AI 챗봇 대화 열기' : 'AI 챗봇 대화 닫기'
            );
            btnToggleFlow.textContent = isCollapsed
                ? 'AI 챗봇 열기 ▼'
                : 'AI 챗봇 닫기 ▲';
        };
    }
    
    // Step 제어 함수
    function renderStep(menuId, step) {
        // 모든 flow-box 숨김
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
                // 매칭되는 step이 없으면 안전하게 메인 화면으로 복귀
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
            } else if (menuId === 'REQ-CH-031') {
                msg = '지점명을 입력해 주세요.';
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
            const btn = e.target.closest('button') || e.target.closest('a');
            if (!btn) return;
            
            // 1. 검색 버튼(icoBtn_appSrch, btn_t) 또는 .srchIpt / .search-towline 내부 버튼 클릭 시 유효성 검증
            if ((btn.classList.contains('icoBtn_appSrch') && !btn.classList.contains('btn-prev')) || btn.classList.contains('btn_t') || $(btn).closest('.srchIpt').length > 0 || $(btn).closest('.search-towline').length > 0) {
                if (!executeSearch($(btn))) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                return;
            }

            // 1-1. 처음으로 버튼 클릭
            if (btn.classList.contains('btn-home')) {
                showFlowLoading(() => {
                    renderStep(null, 1);
                }, 300);
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

                // [REQ-CH-031] 활동 입력 3단계 밸리데이션 추가
                if (menuId === 'REQ-CH-031' && step === 4) {
                    // 1. 활동 구분 라디오 선택 체크
                    if (!$currentBox.find('input[name="gaActDv"]:checked').length) {
                        uiInfo.pt.alert('활동 구분을 선택해 주세요.');
                        return;
                    }
                    // 2. 지점 검색 입력값 체크
                    const $branchIpt = $currentBox.find('input.ipt.search');
                    if ($branchIpt.length && !$branchIpt.val().trim()) {
                        uiInfo.pt.alert('지점을 검색하거나 입력해 주세요.', function() {
                            $branchIpt.focus();
                        });
                        return;
                    }
                    // 3. 약속 일자 체크
                    const $actDt = $currentBox.find('#gaActDt');
                    if ($actDt.length && !$actDt.val().trim()) {
                        uiInfo.pt.alert('약속 일자를 입력해 주세요.', function() {
                            $actDt.focus();
                        });
                        return;
                    }
                    // 4. 약속 장소 체크
                    const $actPl = $currentBox.find('#gaActPl');
                    if ($actPl.length && !$actPl.val().trim()) {
                        uiInfo.pt.alert('약속 장소를 입력해 주세요.', function() {
                            $actPl.focus();
                        });
                        return;
                    }
                    // 5. 약속 시간(시/분) 체크
                    const $actHH = $currentBox.find('#gaActHH');
                    const $actMM = $currentBox.find('#gaActMM');
                    if ($actHH.length && $actHH.val().includes('00시')) {
                        uiInfo.pt.alert('약속 시간을 선택해 주세요.', function() {
                            $actHH.focus();
                        });
                        return;
                    }
                    if ($actMM.length && $actMM.val().includes('00분')) {
                        uiInfo.pt.alert('약속 분을 선택해 주세요.', function() {
                            $actMM.focus();
                        });
                        return;
                    }
                    // 6. 출장 일정 체크 (필요한 경우)
                    const $actBtDt = $currentBox.find('#actBtDt');
                    const $actBtEdDt = $currentBox.find('#actBtEdDt');
                    if ($actBtDt.length && !$actBtDt.val().trim()) {
                        uiInfo.pt.alert('출장 시작일을 입력해 주세요.', function() {
                            $actBtDt.focus();
                        });
                        return;
                    }
                    if ($actBtEdDt.length && !$actBtEdDt.val().trim()) {
                        uiInfo.pt.alert('출장 종료일을 입력해 주세요.', function() {
                            $actBtEdDt.focus();
                        });
                        return;
                    }
                    // 7. 메모 내용 체크
                    const $textarea = $currentBox.find('textarea.ipt');
                    if ($textarea.length && !$textarea.val().trim()) {
                        uiInfo.pt.alert('메모 내용을 입력해 주세요.', function() {
                            $textarea.focus();
                        });
                        return;
                    }
                }

                // 검증 통과 시 다음 Step 진행 (또는 완료 처리)
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
    /*
    function fit(p) {
        p.classList.remove('is-stacked');
        if (p.clientWidth && p.scrollWidth > p.clientWidth) p.classList.add('is-stacked');
    }
    function observeAll() {
        document.querySelectorAll('.chat-content .paging:not([data-fit])').forEach(function (p) {
            p.setAttribute('data-fit', '1');
            new ResizeObserver(function () { fit(p); }).observe(p);
            fit(p);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeAll);
    else observeAll();
    window.initPagingFit = observeAll;   // 페이징을 동적으로 그린 뒤에 호출
    */

    
    const branch = document.getElementById('btnBranch');
    const support = document.getElementById('btnSupport');


    // 모바일 기기 판별
    function isMobileDevice() {
        const ua = /Android|iPhone|iPad|iPod|Mobile|SamsungBrowser/i.test(navigator.userAgent);
        // iPadOS는 UA가 Mac으로 나오므로 터치 + 좁은 화면으로도 판별
        const touchNarrow = window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1024;
        return ua || touchNarrow;
    }

    // 팝업 오픈 공통 함수
    function openChatPopup(popupUrl) {
        // 모바일: 팝업 크기 지정이 무시되므로 전체 화면(새 탭)으로 열기
        if (isMobileDevice()) {
            const win = window.open(popupUrl, '_blank');
            // 팝업 차단 등으로 열리지 않으면 현재 창에서 이동
            if (!win) window.location.href = popupUrl;
            return;
        }

        // PC: 화면의 80% 크기, 최대 폭 1200px, 중앙 정렬
        const availW = window.screen.availWidth;
        const availH = window.screen.availHeight;
        const width  = Math.min(Math.floor(availW * 0.8), 1200);
        const height = Math.floor(availH * 0.8);
        const left   = Math.floor((availW - width) / 2);
        const top    = Math.floor((availH - height) / 2);

        const popupFeatures = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
        const win = window.open(popupUrl, '_blank', popupFeatures);
        if (win) win.focus();
    }


    // 지점조회 클릭 시
    if (branch) {
        branch.addEventListener('click', function () {
            openChatPopup('./resources/ssc/comm/branch.html');
        });
    }

    // 통합시스템 클릭 시
    if (support) {
        support.addEventListener('click', function () {
            openChatPopup('./resources/ssc/comm/support.html');
        });
    }
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