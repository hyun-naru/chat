// 전역 변수 설정
let canvasbug, ctx;
let isDrawing = false;
let startX, startY;
let currentTool = 'rect'; // 'rect' or 'text'
let bgImageBase64 = '';
let developerList = '주현태,김민준,김현지,김민준,문병윤,조진원,이광희,전영석,김연희';
let testerList = '주현태,김민준,김현지,박서원,장경희,김훈기,정영석,김재헌,김남식,강혜림,이선일,김유중,한길형';
let adminList = '주현태,김민준,김현지';
let savedImageData = null;
let reopenTargetId = null;//재결함
const BUG_COLS = ['ID', '테스터', '결함 코멘트', '담당자', '상태', '개발자 코멘트', '액션'];
const SESSION_KEY_NAME = 'BUG_REPORT_USER_NAME';
const SESSION_KEY_ROLE = 'BUG_REPORT_USER_ROLE';

// 스크립트 로드 시 초기화
window.onload = function () {
    injectHtml();
    bindEvents();
    checkFakeLogin(); // 새로고침해도 상단 바 유지되도록 체크
};

/**
 * 1. 전체 UI HTML 주입 (로그인, 그림판, 네비게이션바, 현황판)
 */
function injectHtml() {
    // ① 가상 로그인 모달
    const loginModal = `
        <div id="bugLoginModal" style="display:none; position:fixed; z-index:10000000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5);">
            <div class="bug-modal-content" style="background:white; width:calc(100% - 32px); max-width:300px; box-sizing:border-box; margin:80px auto; padding:20px; border-radius:8px; position:relative;">
                <span id="btnCloseBugLogin" style="position:absolute; right:15px; top:10px; cursor:pointer; font-size:20px;">&times;</span>
                <h3 style="margin-top:0;">가상 로그인</h3>
                <select id="bugUserRole">
                    <option value="tester">🔍 테스터 (버그 등록)</option>
                    <option value="developer">💻 개발자 (엑셀 다운로드 & 조치)</option>
                    <option value="admin">👑 관리자 (담당자 배정 현황판)</option>
                </select>
                <input type="text" id="bugUserName" placeholder="본인의 이름을 입력하세요">
                <button id="btnBugLoginSubmit" style="width:100%; padding:10px; background:#e84118; color:white; border:none; border-radius:5px; cursor:pointer;">입장하기</button>
            </div>
        </div>
    `;

    // ② 🌟 상단 네비게이션 바 (로그인 후 우측 상단 표시)
    const topNavHtml = `
        <div id="bugTopNav" class="bug-top-nav">
            <div id="bugUserInfo" class="bug-user-badge"></div>
            <button id="btnBugDashboard" class="bug-nav-btn">📊 현황판</button>
            <button id="btnBugLogout" class="bug-nav-btn logout">🔄 로그아웃</button>
            <button class="bug-nav-btn" onclick="downloadExcelReport();">엑셀다운로드</button>
        </div>
    `;

    // ③ 그림판 모달
    const paintModal = `
        <div id="bugPaintModal" style="display:none; position:fixed; z-index:10000001; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.8);">
            <div style="background:white; width:100%; height:100%; margin:0; display:flex; flex-direction:column; border-radius:0; overflow:hidden;">
                <div class="bug-paint-toolbar" style="padding:10px; background:#f1f2f6; border-bottom:1px solid #ddd; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                    <button id="btnPaintToolRect" style="padding:8px; cursor:pointer; background:#fff; border:2px solid #e84118;">🟥 박스</button>
                    <button id="btnPaintToolText" style="padding:8px; cursor:pointer; background:#fff; border:1px solid #ccc;">🔤 텍스트</button>
                    <button id="btnPaintToolClear" style="padding:8px; cursor:pointer;">🧹 초기화</button>
                    <div style="flex-grow:1;"></div>
                    <button id="btnPaintSave" class="bug-paint-save-btn">💾 전송</button>
                    <button id="btnClosePaintModal" style="padding:8px; cursor:pointer;">❌ 취소</button>
                    <textarea id="bugFinalComment" placeholder="결함내용을 작성해 주세요(엔터가능)" style="width:100%;height:90px;padding:10px;margin-top:4px;border:1px solid #ccc;box-sizing:border-box;font-size:16px;">
로그인 아이디 : 
메뉴 진입 경로 :
액션 순서 및 결함 내용 : 
</textarea>
                </div>
                <div style="flex-grow:1; overflow:auto; background:#ccc; display:flex; justify-content:center; align-items:flex-start; padding:8px; -webkit-overflow-scrolling:touch;">
                    <canvas id="bugCanvas" style="background:white; box-shadow:0 0 10px rgba(0,0,0,0.5); cursor:crosshair; touch-action:none;"></canvas>
                </div>
            </div>
        </div>
    `;

    // ④ 🌟 통합 버그 리포트 대시보드
    const dashboardModal = `
        <div id="bugAdminModal" style="display:none; position:fixed; z-index:10000002; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.7);">
            <div class="bug-admin-content" style="background:white; width:90%; max-height:80vh; margin:5% auto; padding:20px; border-radius:8px; overflow-y:auto; position:relative;">
                <span id="btnCloseAdminModal" style="position:absolute; right:20px; top:15px; cursor:pointer; font-size:24px;">&times;</span>
                <h2>📊 버그 리포트 통합 대시보드</h2>
                <div style="overflow-y: auto; height: calc(80vh - 80px);">
                    <table class="bug-admin-table" style="width:100%; border-collapse:collapse; margin-top:15px;">
                        <thead style="background:#f1f2f6;">
                            <tr>
                                <th style="border:1px solid #ddd; padding:10px;">ID</th>
                                <th style="border:1px solid #ddd; padding:10px;">테스터</th>
                                <th style="border:1px solid #ddd; padding:10px; width:30%;">결함 코멘트</th>
                                <th style="border:1px solid #ddd; padding:10px;">담당자</th>
                                <th style="border:1px solid #ddd; padding:10px;">상태</th>
                                <th style="border:1px solid #ddd; padding:10px; width:25%;">개발자 코멘트</th>
                                <th style="border:1px solid #ddd; padding:10px;">액션</th>
                            </tr>
                        </thead>
                        <tbody id="bugAdminTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const imageModal = `
    <div id="bugImageModal" style="display:none; position:fixed; z-index:10000003; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); text-align:center; overflow:auto;">
        <span onclick="hideModal('bugImageModal')" style="position:absolute; right:30px; top:20px; color:white; font-size:40px; cursor:pointer;">&times;</span>
        <img id="bugPreviewImg" style="max-width:98%; margin-top:50px;border:5px solid white; box-shadow:0 0 20px rgba(0,0,0,0.5);">
    </div>  `;
    // 바디에 주입
    document.body.insertAdjacentHTML('beforeend', loginModal + topNavHtml + paintModal + dashboardModal + imageModal);

    const popHeader = document.querySelector('.popWrap.chat .popup header');
    const navEl = document.getElementById('bugTopNav');
    // 페이지 상단 header 바로 아래에 상단바 배치 (팝업 밖). header 가 없으면 기존처럼 화면 상단 고정
    const pageHeader = document.querySelector('body > header');
    if (pageHeader && navEl) {
        if (getComputedStyle(pageHeader).position === 'static') pageHeader.style.position = 'relative'; // '버그' 버튼 기준점
        pageHeader.insertAdjacentElement('afterend', navEl);
        navEl.classList.add('under-header');
        window.addEventListener('resize', placeBugNav);
    }

    // 캔버스 초기화
    canvasbug = document.getElementById('bugCanvas');
    ctx = canvasbug.getContext('2d');
    ctx.strokeStyle = '#e84118';
    ctx.lineWidth = 3;
    ctx.font = '20px Arial';
    ctx.fillStyle = '#e84118';
}

/**
 * 2. 이벤트 바인딩 연결
 */
function bindEvents() {
    const mainBtn = document.getElementById('btnBugReportMain');
    if (mainBtn) mainBtn.addEventListener('click', handleMainButtonClick);

    // 로그인 이벤트
    document.getElementById('btnCloseBugLogin').addEventListener('click', () => hideModal('bugLoginModal'));
    document.getElementById('btnBugLoginSubmit').addEventListener('click', doFakeLogin);

    // 네비게이션 바 이벤트 (현황판 / 로그아웃)
    const btnDashboard = document.getElementById('btnBugDashboard');
    if (btnDashboard) btnDashboard.addEventListener('click', openUnifiedDashboard)
    // document.getElementById('btnBugDashboard').addEventListener('click', openUnifiedDashboard);

    const topLogoutBtn = document.getElementById('btnBugLogout');
    if (topLogoutBtn) topLogoutBtn.addEventListener('click', doLogout)
    // document.getElementById('btnBugLogout').addEventListener('click', doLogout);

    const oldLogoutBtn = document.getElementById('btnBugReportLogout');
    if (oldLogoutBtn) oldLogoutBtn.addEventListener('click', doLogout)

    // 대시보드 이벤트
    document.getElementById('btnCloseAdminModal').addEventListener('click', () => hideModal('bugAdminModal'));
    // document.getElementById('bugAdminModal').addEventListener('click', () => hideModal('bugAdminModal'));

    // 그림판 모달 이벤트
    document.getElementById('btnClosePaintModal').addEventListener('click', () => hideModal('bugPaintModal'));
    document.getElementById('btnPaintToolClear').addEventListener('click', () => initCanvasDraw(bgImageBase64));
    document.getElementById('btnPaintSave').addEventListener('click', saveAndReportBug);

    // 툴 선택
    document.getElementById('btnPaintToolRect').addEventListener('click', function () { setTool('rect', this); });
    document.getElementById('btnPaintToolText').addEventListener('click', function () { setTool('text', this); });

    // 캔버스 마우스 드로잉 이벤트
    canvasbug.addEventListener('pointerdown', startDrawing);
    canvasbug.addEventListener('pointermove', draw);
    canvasbug.addEventListener('pointerup', stopDrawing);
    canvasbug.addEventListener('pointercancel', stopDrawing);
}

/**
 * 3. 메인 기능 흐름 제어
 */
function handleMainButtonClick() {
    const userInfo = checkFakeLogin();
    if (!userInfo) {
        showModal('bugLoginModal');
        return;
    }

    // 역할에 따른 기능 분기
    if (userInfo.userRole === 'tester') {
        startBugReportProcess(); // 캡처 후 그림판 실행
    } else if (userInfo.userRole === 'developer') {
        downloadExcelReport();   // 개발자는 메인버튼 누르면 엑셀 다운로드 (현황판은 상단바 이용)
    } else if (userInfo.userRole === 'admin') {
        openUnifiedDashboard();  // 관리자는 메인버튼 누르면 대시보드 오픈
    }
}

/**
 * 4. 로그인 / 로그아웃 관리
 */
// header 가 fixed/sticky 면 그 바로 아래에 고정, 일반 흐름이면 header 다음에 그대로 배치
function placeBugNav() {
    const nav = document.getElementById('bugTopNav');
    const header = document.querySelector('body > header');
    if (!nav || !header || !nav.classList.contains('under-header')) return;
    const pos = getComputedStyle(header).position;
    if (pos === 'fixed' || pos === 'sticky') {
        nav.style.position = 'fixed';
        nav.style.top = header.getBoundingClientRect().bottom + 'px';
    } else {
        nav.style.position = 'static';
        nav.style.top = '';
    }
}

function setBugNavVisible(show) {
    const nav = document.getElementById('bugTopNav');
    if (!nav) return;
    nav.style.display = show ? 'flex' : 'none';
    if (show) placeBugNav();
}

function checkFakeLogin() {
    const userName = sessionStorage.getItem(SESSION_KEY_NAME);
    const userRole = sessionStorage.getItem(SESSION_KEY_ROLE);

    if (userName && userRole) {
        let roleName = userRole === 'tester' ? '테스터' : (userRole === 'developer' ? '개발자' : '관리자');
        document.getElementById('bugUserInfo').innerText = `🪪 ${roleName}: ${userName}`;
        setBugNavVisible(true); // 로그인 시 상단바 노출
        return { userName, userRole };
    }
    setBugNavVisible(false);
    return null;
}

function doFakeLogin() {
    const role = document.getElementById('bugUserRole').value;
    const name = document.getElementById('bugUserName').value.trim();

    if (!name) { alert('이름을 입력하세요.'); return; }

    if (role === 'tester' && testerList.indexOf(name) < 0) {
        alert('등록된 테스터가 아닙니다. \n사용자등록을 먼저 신청해 주세요( 관리자:김민준 )');
        return;
    }
    if (role === 'developer' && developerList.indexOf(name) < 0) {
        alert('등록된 개발자가 아닙니다. \n사용자등록을 먼저 신청해 주세요( 관리자:김민준 )');
        return;
    }
    if (role === 'admin' && developerList.indexOf(name) < 0) {
        alert('등록된 관리자가 아닙니다. \n사용자등록을 먼저 신청해 주세요( 관리자:김민준 )');
        return;
    }
    sessionStorage.setItem(SESSION_KEY_ROLE, role);
    sessionStorage.setItem(SESSION_KEY_NAME, name);
    hideModal('bugLoginModal');
    checkFakeLogin();

    // 테스터 로그인 시, 본인이 올린 결함 중 완료(Y)된 것 노티 피드백
    if (role === 'tester') {
        $.ajax({
            url: '/api/bugreport/list.json', type: 'GET', dataType: 'json',
            success: function (list) {
                const solvedBugs = list.filter(b => b.reporter === name && b.status === 'Y');
                if (solvedBugs.length > 0) {
                    alert(`🎉 [알림] ${name}님이 등록하신 결함 중 ${solvedBugs.length}건이 조치 완료되었습니다!\n우측 상단 [📊 현황판]을 클릭해 개발자 코멘트를 확인하세요.`);
                } else {
                    alert(`${name}님 환영합니다! 버그리포팅 버튼을 다시 눌러 캡처를 시작하세요.`);
                }
            }
        });
    } else {
        let roleName = role === 'developer' ? '개발자' : '관리자';
        alert(`${name}님(${roleName}) 환영합니다!`);
    }
}

function doLogout() {
    sessionStorage.removeItem(SESSION_KEY_NAME);
    sessionStorage.removeItem(SESSION_KEY_ROLE);
    setBugNavVisible(false);
    alert('로그아웃 되었습니다.');
}

/**
 * 5. 현황판 대시보드 (역할별 맞춤 렌더링)
 */
function openUnifiedDashboard() {
    const userInfo = checkFakeLogin();
    if (!userInfo) return;

    $.ajax({
        url: '/api/bugreport/list.json', type: 'GET', dataType: 'json',
        success: function (list) {
            const tbody = document.getElementById('bugAdminTableBody');
            tbody.innerHTML = '';
            // console.log(list)
            // 데이터 필터링 (테스터=내것만, 개발자=배정된것만, 관리자=전부)
            let filteredList = list;
            if (userInfo.userRole === 'tester') {
                filteredList = list.filter(b => b.reporter === userInfo.userName);
            } else if (userInfo.userRole === 'developer') {
                filteredList = list.filter(b => b.assignee === userInfo.userName);
            }

            if (filteredList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">조회된 버그 리포트가 없습니다.</td></tr>`;
                showModal('bugAdminModal');
                return;
            }

            // 역순(최신순) 정렬
            filteredList.reverse().forEach(bug => {
                const tr = document.createElement('tr');

                // 공통 텍스트 렌더링 (따옴표 등 이스케이프 방지)
                const safeComment = bug.comment ? bug.comment.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
                const safeDevComment = bug.devComment ? bug.devComment.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
                
                let html = '';
                // 테스터 , 관리자는 취소, 종결된 로운 안보임
                if (userInfo.userRole === 'tester' && bug.status !== 'CLOSED' && bug.status !== 'CANCEL') {
                    html = `
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">${bug.bugId.replace('BUG_', '')}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">${bug.reporter}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:left; font-size:13px;white-space:pre-wrap;">${safeComment}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">
                        <span style="color:${bug.assignee === '미정' ? 'red' : 'blue'}; font-weight:bold;">${bug.assignee}</span>
                    </td>
                `;
                } else if (userInfo.userRole === 'admin') {
                    html = `
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">${bug.bugId.replace('BUG_', '')}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">${bug.reporter}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:left; font-size:13px;white-space:pre-wrap;">${safeComment}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">
                        <span style="color:${bug.assignee === '미정' ? 'red' : 'blue'}; font-weight:bold;">${bug.assignee}</span>
                    </td>
                `;
                }
                //개발자는 취소, 종결, 처리완료 결함은 보이지 않음
                if (userInfo.userRole === 'developer' && bug.status !== 'Y' && bug.status !== 'CLOSED' && bug.status !== 'CANCEL') {
                    html = `
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">${bug.bugId.replace('BUG_', '')}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">${bug.reporter}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:left; font-size:13px;white-space:pre-wrap;">${safeComment}</td>
                    <td style="border:1px solid #ddd; padding:10px; text-align:center;">
                        <span style="color:${bug.assignee === '미정' ? 'red' : 'blue'}; font-weight:bold;">${bug.assignee}</span>
                    </td>
                `;
                }
                let actionHtml = ` <button class="bug-nav-btn" style="background-color:#f39c12 !important; margin-bottom:2px;" onclick="viewBugImage('${bug.imagePath}')">캡쳐보기</button>`;
                // 🌟 역할별 맞춤 컬럼 렌더링
                if (userInfo.userRole === 'developer') {
                    // 개발자 전용 액션 (상태 변경 및 코멘트 작성)
                    // <option value="Y" ${bug.status === 'CLOSED' ? 'selected' : ''}>종결됨</option>
                    //             <option value="Y" ${bug.status === 'CANCEL' ? 'selected' : ''}>취소됨</option>
                    if (bug.status !== 'Y' && bug.status !== 'CLOSED' && bug.status !== 'CANCEL') {
                        html += `
                        <td style="border:1px solid #ddd; padding:10px; text-align:center;">
                            <select id="status_${bug.bugId}" style="padding:5px;">
                                <option value="N" ${bug.status === 'N' ? 'selected' : ''}>N (접수)</option>
                                <option value="Y" ${bug.status === 'Y' ? 'selected' : ''}>Y (완료)</option>
                                <option value="Y" ${bug.status === 'R' ? 'selected' : ''}>R (재결함)</option>
                                
                            </select>
                        </td>
                        <td style="border:1px solid #ddd; padding:10px; text-align:center;">
                            <input type="text" id="devCom_${bug.bugId}" value="${safeDevComment}" style="width:95%; padding:6px; box-sizing:border-box;">
                        </td>
                        <td style="border:1px solid #ddd; padding:10px; text-align:center;">
                            ${actionHtml}<br>
                            <button class="bug-nav-btn" onclick="updateBugByDev('${bug.bugId}')">저장</button>
                        </td>
                    `;
                    }
                } else {
                    // 테스터 & 관리자 뷰 (읽기 전용 상태/코멘트, 단 관리자는 배정 가능)
                    let statusBadge = '<span style="color:gray;font-weight:bold;">N (대기중)</span>';
                    if (bug.status === 'Y') statusBadge = '<span style="color:green;font-weight:bold;">Y (조치완료)</span>';
                    if (bug.status === 'R') statusBadge = '<span style="color:red;font-weight:bold;">R (재결함)</span>';
                    if (bug.status === 'CLOSED') statusBadge = '<span style="color:red;font-weight:bold;">종결</span>';
                    if (bug.status === 'CANCEL') statusBadge = '<span style="color:red;font-weight:bold;">취소</span>';

                    let actionBtn = '-';
                    if (userInfo.userRole === 'admin') {
                        actionBtn = `<button class="bug-nav-btn" style="background-color:#9b59b6!important;" onclick="assignDeveloperToBug('${bug.bugId}', '${bug.assignee}')">담당 배정</button>`;
                    }
                    if (userInfo.userRole === 'tester' && bug.status === 'Y') {
                        actionBtn += `<br><button class="bug-nav-btn" style="background-color:#e74c3c !important; margin-top:2px;" onclick="startReopenProcess('${bug.bugId}')">재결함캡쳐</button> `;
                        actionBtn += `<br><button class="bug-nav-btn" style="background-color:#16a087 !important; margin-top:2px;" onclick="updateBugStatus('${bug.bugId}','CANCEL')">결함취소</button> `;
                        actionBtn += `<br><button class="bug-nav-btn" style="background-color:#236bd9 !important; margin-top:2px;" onclick="updateBugStatus('${bug.bugId}','CLOSED')">결함종결</button> `;

                    }
                    if (userInfo.userRole === 'tester' && bug.status !== 'CLOSED' && bug.status !== 'CANCEL') {
                        html += `
                        <td style="border:1px solid #ddd; padding:10px; text-align:center;">${statusBadge}</td>
                        <td style="border:1px solid #ddd; padding:10px; text-align:left; color:#d35400; font-weight:bold;">${safeDevComment}</td>
                        <td style="border:1px solid #ddd; padding:10px; text-align:center;">${actionHtml}<br>${actionBtn}</td>
                    `;
                    } else if (userInfo.userRole === 'admin') {
                        html += `
                        <td style="border:1px solid #ddd; padding:10px; text-align:center;">${statusBadge}</td>
                        <td style="border:1px solid #ddd; padding:10px; text-align:left; color:#d35400; font-weight:bold;">${safeDevComment}</td>
                        <td style="border:1px solid #ddd; padding:10px; text-align:center;">${actionHtml}<br>${actionBtn}</td>
                    `;
                    }

                }
                tr.innerHTML = html;
                Array.prototype.forEach.call(tr.children, function (td, i) { td.setAttribute('data-label', BUG_COLS[i] || ''); });
                tbody.appendChild(tr);
            });
            showModal('bugAdminModal');
        },
        error: function () { alert('현황판 데이터를 불러오는데 실패했습니다.'); }
    });
}

/**
 * 6. 백엔드 통신 API 함수들 (저장, 다운로드, 업데이트, 담당자배정)
 */

// 개발자: 엑셀 파일 다운로드 (window.location.href 사용)
function downloadExcelReport() {
    if (!confirm('지금까지 접수된 버그 현황을 엑셀로 다운로드 하시겠습니까?')) return;
    window.location.href = '/api/bugreport/download.json';
}

// 개발자: 결함 상태 & 코멘트 업데이트
window.updateBugByDev = function (bugId) {
    const status = document.getElementById(`status_${bugId}`).value;
    const devComment = document.getElementById(`devCom_${bugId}`).value.trim();

    $.ajax({
        url: '/api/bugreport/update.json', type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ bugId: bugId, status: status, devComment: devComment }),
        dataType: 'json',
        success: function (res) {
            if (res.status === 'success') {
                alert('조치 상태와 코멘트가 저장되었습니다!');
                openUnifiedDashboard(); // 리프레시
            } else { alert('저장 실패: ' + res.message); }
        }
    });
};
window.updateBugStatus = function (bugId, newStatus) {
    const statusText = newStatus === 'CLOSED' ? '종결' : '취소';
    if (!confirm(`정말 이 결함을 [${statusText}] 처리하시겠습니까?`)) { return; }
    $.ajax({
        url: '/api/bugreport/updateForTester.json', type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ bugId: bugId, status: newStatus }),
        dataType: 'json',
        success: function (res) {
            if (res.status === 'success') {
                alert(`결함이 ${statusText} 처리 되었습니다.`);
                openUnifiedDashboard(); // 리프레시
            } else { alert('저장 실패: ' + res.message); }
        }
    });
}
// 관리자: 담당자 배정
window.assignDeveloperToBug = function (bugId, currentAssignee) {
    const devName = prompt(`담당 개발자 이름을 입력하세요:`, currentAssignee === '미정' ? '' : currentAssignee);
    if (!devName || devName.trim() === '') return;

    $.ajax({
        url: '/api/bugreport/assign.json', type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ bugId: bugId, assignee: devName.trim() }),
        dataType: 'json',
        success: function (res) {
            if (res.status === 'success') {
                alert(`${devName} 개발자가 배정되었습니다!`);
                openUnifiedDashboard(); // 리프레시
            } else { alert('배정 실패: ' + res.message); }
        }
    });
};

//캡쳐이미지 보기 
window.viewBugImage = function (originalPath) {
    if (!originalPath) { alert('첨부된 이미지가 없습니다.'); return; }
    const imgTag = document.getElementById('bugPreviewImg');

    // imgTag.src = originalPath;

    const pathParts = originalPath.split('/');
    const bugId = pathParts[4];
    const targetFile = bugId;
    imgTag.src = '/api/bugreport/image.json?bugId=' + encodeURIComponent(targetFile);
    showModal('bugImageModal');
}

//재결함 캡쳐
window.startReopenProcess = function (bugId) {
    if (!confirm('이 결함이 조치되지 않아 신규 캡쳐를 진행하시겠습니까?')) return;
    reopenTargetId = bugId;
    hideModal('bugAdminModal');
    startBugReportProcess();
}

// 테스터: 버그 저장 전송 로직 (다중클릭 방지 적용)
function saveAndReportBug() {
    // const comment = prompt('서버 엑셀에 기록될 최종 결함 코멘트를 입력하세요:');

    const commentBox = document.getElementById('bugFinalComment');
    const comment = commentBox.value.trim();
    let finalComment = comment;
    if (reopenTargetId) {
        finalComment = `[재결함 : ${reopenTargetId}]` + comment;
    }
    if (!comment) { alert('코멘트를 입력해야 저장됩니다.'); return; }
    if (!confirm('결함을 서버로 전송하시겠습니까?')) return;

    // 다중클릭 방지
    const saveBtn = document.getElementById('btnPaintSave');
    saveBtn.disabled = true;
    saveBtn.innerText = '⏳ 전송 중...';

    const editedImageBase64 = canvasbug.toDataURL('image/png');
    const userInfo = checkFakeLogin();

    $.ajax({
        url: '/api/bugreport/save.json', type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            reporterName: userInfo.userName,
            comment: finalComment,
            imageData: editedImageBase64
        }),
        dataType: 'json',
        success: function (data) {
            if (data.status === 'success') {
                alert(`전송 성공! (ID: ${data.bugId})\n상단 현황판에서 접수 내역을 확인하세요.`);
                commentBox.value = '로그인 아이디 : \n메뉴 진입 경로 : \n액션 순서 및 결함 내용 : ';
                reopenTargetId = '';
                hideModal('bugPaintModal');
            } else { alert(`전송 실패: ${data.message}`); }
        },
        error: function (xhr, status, error) { alert('전송 중 통신 오류가 발생했습니다.'); },
        complete: function () {
            saveBtn.disabled = false;
            saveBtn.innerText = '💾 전송';
        }
    });
}

/**
 * 7. HTML2Canvas 및 그림판 로직 (기존 유지)
 */
// CSS 의 @media (max-width: 768px) 와 같은 기준
function isMobileView() {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
}

function startBugReportProcess() {
    // alert('현재 화면을 캡처합니다. 확인을 누르고 1~2초만 기다려주세요.');
    var capOpts = {
        ignoreElements: function (el) {
            return el.id === 'bugTopNav' || el.id === 'btnBugReportMain';
        }
    };
    // 모바일: 지금 보이는 화면만 배율 1로 캡처 (PC 는 기존처럼 문서 전체)
    if (isMobileView()) {
        capOpts.scale = 1;
        capOpts.x = window.pageXOffset;
        capOpts.y = window.pageYOffset;
        capOpts.width = window.innerWidth;
        capOpts.height = window.innerHeight;
        capOpts.windowWidth = window.innerWidth;
        capOpts.windowHeight = window.innerHeight;
    }
    html2canvas(document.body, capOpts).then(function (renderedCanvas) {
        bgImageBase64 = renderedCanvas.toDataURL("image/png");
        showModal('bugPaintModal');
        initCanvasDraw(bgImageBase64);
    }).catch(function (err) { alert('캡처 중 오류가 발생했습니다.'); });
}

function initCanvasDraw(base64Str) {
    const img = new Image();
    img.onload = function () {
        // 화면 크기에 맞게 캔버스 사이즈 조절
        // const maxWidth = window.innerWidth * 0.8;
        // const maxHeight = window.innerHeight * 0.7;
        // let finalWidth = img.width;
        // let finalHeight = img.height;

        // if (img.width > maxWidth) { finalWidth = maxWidth; finalHeight = img.height * (maxWidth / img.width); }
        // if (finalHeight > maxHeight) { finalHeight = maxHeight; finalWidth = finalWidth * (maxHeight / finalHeight); }

        // canvasbug.width = finalWidth;
        // canvasbug.height = finalHeight;
        canvasbug.width = img.width;
        canvasbug.height = img.height;
        // ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = '#e84118';
        ctx.lineWidth = 3;
        ctx.font = '20px Arial';
        ctx.fillStyle = '#e84118';
    };
    img.src = base64Str;
}

function setTool(tool, btnElement) {
    currentTool = tool;
    document.getElementById('btnPaintToolRect').style.border = '1px solid #ccc';
    document.getElementById('btnPaintToolText').style.border = '1px solid #ccc';
    btnElement.style.border = '2px solid #e84118';
}

// 화면 좌표 -> 캔버스 실제 좌표 (CSS 로 축소/확대되어도 정확히 매핑)
function getCanvasPos(e) {
    const rect = canvasbug.getBoundingClientRect();
    const sx = canvasbug.width / rect.width;
    const sy = canvasbug.height / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
}

function startDrawing(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const pos = getCanvasPos(e);
    startX = pos.x;
    startY = pos.y;
    savedImageData = ctx.getImageData(0, 0, canvasbug.width, canvasbug.height);

    if (currentTool === 'text') {
        isDrawing = false;
        const text = prompt('입력할 텍스트를 작성하세요:');
        if (text) ctx.fillText(text, startX, startY);
        return;
    }
    isDrawing = true;
    try { canvasbug.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
}

function draw(e) {
    if (!isDrawing || currentTool !== 'rect') return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    ctx.putImageData(savedImageData, 0, 0);
    ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
}

function stopDrawing(e) {
    isDrawing = false;
}

/**
 * 8. 모달 제어 유틸리티
 */
function showModal(id) { document.getElementById(id).style.display = 'block'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }



//단위테스트 생성소스 시작
//downloadUnitTestReport('김연희','주임','나루아이 / 개발자','P');
function downloadUnitTestReport(testerName, rank, deptRole, resultStatus) {

    testerName = testerName || '김민준';
    rank = rank || '';
    deptRole = deptRole || '나루아이 / 개발자';
    resultStatus = resultStatus || 'P';

    // 1. 활성화된 탭에서 ID와 화면명 추출
    var activeTab = document.querySelector('li.active[data-id^="tab_"]');
    if (!activeTab) {
        alert("현재 활성화된 탭을 찾을 수 없습니다.");
        return;
    }
    var spanElement = activeTab.querySelector('a span');
    var screenName = spanElement ? spanElement.innerText.trim() : "이름없음";
    var screenId = activeTab.getAttribute('data-id').replace('tab_', '');
    var target = document.getElementById('content');
    if(!target) { alert('챕쳐할 영역을 찾을수 없습니다.'); return;}

    // 3. 캡처 및 서버 전송
    html2canvas(target, {
        scale: 1, // 서버 부하 방지를 위해 배율 고정
        backgroundColor: "#ffffff" // 캡처 배경색 강제 지정 (투명 방지)
    }).then(function (canvas) {
        // 버튼 비활성화 (중복 클릭 방지 효과)
        // const btn = document.querySelector('.btn-download');
        // const originalText = btn.innerText;
        // btn.innerText = "⏳ 엑셀 생성 중...";
        // btn.disabled = true;

        $.ajax({
            url: '/test/generateExcelReport.json',
            type: 'POST',
            data: {
                screenId: screenId,
                screenName: screenName,
                imageData: canvas.toDataURL('image/png'),
                testerName: testerName,
                rank: rank,
                deptRole: deptRole,
                resultStatus: resultStatus
            },
            xhrFields: { responseType: 'blob' },
            success: function (blob) {
                var safeName = (screenName || '이름없음').replace(/[\\/:*?"<>|]/g, '_');
                var fileName = '[단위테스트결과서]' + screenId + '_' + safeName + '.xlsx';
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            error: function () {
                alert("결과서 생성 중 오류가 발생했습니다. 서버 로그를 확인해주세요.");
            },
            complete: function () {
                console.log('단위테스트 엑셀문서 생성완료');
                // 통신 완료 후 버튼 원상복구
                // btn.innerText = originalText;
                // btn.disabled = false;
            }
        }).catch(function (e) {
            console.error(e);
            alert('화면 캡쳐 중 오류가 발생했습니다.');
        });
    });
}