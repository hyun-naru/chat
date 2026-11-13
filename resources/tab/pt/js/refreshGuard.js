/*
 * PT Refresh Guard - confirm version
 * - tabHeader.jsp에서 1회 로드되는 새로고침/뒤로가기 방지 모듈입니다.
 * - F5 / Ctrl+R / Cmd+R은 먼저 막고, uiInfo.pt.confirm 확인 시 실제 새로고침을 실행합니다.
 * - 브라우저 뒤로가기는 popstate + history.pushState로 현재 화면에 머물게 한 뒤,
 *   uiInfo.pt.confirm 확인 시 실제 뒤로가기를 진행합니다.
 * - 브라우저 상단 새로고침 버튼 / 탭 닫기 / 주소창 이동은 beforeunload 영역이라
 *   브라우저 정책상 커스텀 confirm을 띄울 수 없고 기본 브라우저 확인창만 사용할 수 있습니다.
 *  LOCAL 활성화 명령어
 *      window.PT_REFRESH_GUARD_FORCE_ENABLE = true;
        PTRefreshGuard.init('local.forceTest');
 */
(function (window, document) {
    /* JSP에서 주입되는 현재 서버 모드입니다. LOCAL/DEV 여부 판단에 사용합니다. */
    //var currentServerMode = '${serverMode}';
    var guardConfig = window.PT_REFRESH_GUARD_CONFIG || {};
    var currentServerMode = normalizeServerMode(guardConfig.serverMode);

    /* F5 / Ctrl+R / Cmd+R 새로고침 확인 메시지입니다. */
    var REFRESH_CONFIRM_MESSAGE = '새로고침을 하면 기존 탭이 전부 사라집니다. 계속하시겠습니까?';

    /* 브라우저 뒤로가기 확인 메시지입니다. */
    var BACK_CONFIRM_MESSAGE = '뒤로가기를 실행하면 기존 탭이 전부 사라질 수 있습니다. 계속하시겠습니까?';

    /* 명시 차단 대상 링크/버튼 클릭 확인 메시지입니다. */
    var ACTION_CONFIRM_MESSAGE = '페이지를 이동하면 기존 탭이 전부 사라질 수 있습니다. 계속하시겠습니까?';

    /* 정상 버튼/링크/submit 동작으로 발생하는 unload를 일시 허용하는 기본 시간입니다. */
    var DEFAULT_ALLOW_MS = 1000;

    /* confirm이 연속으로 여러 번 뜨는 것을 막기 위한 최소 간격입니다. */
    var CONFIRM_THROTTLE_MS = 3000;

    /* 엑셀 다운로드 양식다운로드 파일 예외 설정 */
    var DOWNLOAD_ALLOW_MS = 2500;

    /* 다운로드버튼 링크 감지용 정규식 */
    var DOWNLOAD_ACTION_RE = /(다운로드|양식\s*다운|엑셀|excel|xlsx|xls|download|downexcel|downloadexcel|uploadformdown|formdown|filedown|export|btnSend)/i;

    /*
     * 모듈 상태 저장소입니다.
     * tabHeader가 재실행되거나 init/rebind가 반복 호출돼도 listener가 중복 등록되지 않도록
     * window 단위 singleton state를 사용합니다.
     */
    var state = window.__PT_REFRESH_GUARD_STATE__ = window.__PT_REFRESH_GUARD_STATE__ || {
        /* keydown/click/submit/beforeunload 이벤트가 이미 등록됐는지 여부입니다. */
        bound: false,
        /* 로컬/DEV 환경 등에서 guard가 비활성화됐는지 여부입니다. */
        disabled: false,
        /* 정상 이동을 허용하는 만료 시각(timestamp)입니다. 0이면 허용 상태가 아닙니다. */
        allowUnloadUntil: 0,
        /* allowUnloadUntil 만료 후 허용 상태를 정리하기 위한 timer 핸들입니다. */
        allowTimer: null,
        /* 마지막으로 unload를 허용한 사유입니다. 디버깅/confirm context용입니다. */
        lastAllowReason: '',
        /* confirm 중복 표시를 막기 위해 마지막 confirm 표시 시각을 저장합니다. */
        lastConfirmAt: 0,
        /* 로컬 비활성화 로그를 한 번만 출력하기 위한 플래그입니다. */
        localLogPrinted: false,
        /* 외부에서 커스텀 confirm handler를 주입할 수 있는 선택 확장 지점입니다. */
        confirmHandler: null,
        /* confirm 후 원래 클릭을 다시 실행하는 중인지 여부입니다. */
        replayingClick: false,
        /* popstate 기반 브라우저 뒤로가기 guard가 등록됐는지 여부입니다. */
        backGuardBound: false,
        /* history에 뒤로가기 방지용 state가 정상 push됐는지 여부입니다. */
        backGuardActive: false
    };

    state.submitAllowEnabled = state.submitAllowEnabled === true;

    /* 기존 state가 재사용될 때 undefined/비정상 값을 boolean으로 정규화합니다. */
    state.backGuardBound = !!state.backGuardBound;
    state.backGuardActive = !!state.backGuardActive;
    state.replayingClick = !!state.replayingClick;

    // 빈값처리하는 함수
    function normalizeServerMode(value){
        value = value == null ? '' : String(value);
        value = value.replace(/^\s+|\s+$/g, '');
        if(!value || value.indexOf('${') !== -1) {
            return '';
        }

        return value.toUpperCase();
    }

    /**
     * 현재 시각을 millisecond timestamp로 반환합니다.
     * Date.now 미지원 브라우저까지 고려한 fallback입니다.
     */
    function now() {
        return Date.now ? Date.now() : new Date().getTime();
    }

    /**
     * 현재 실행 환경이 로컬/개발 환경인지 판단합니다.
     * localhost/127.0.0.1 또는 serverMode LOCAL/DEV이면 true를 반환합니다.
     */
    function isLocalEnvironment() {
        var host = window.location.hostname;
        var isLocalUrl = host === 'localhost' || host === '127.0.0.1';
        var isLocalMode = currentServerMode === 'LOCAL' || currentServerMode === 'DEV';

        return isLocalUrl || isLocalMode;
    }

    /**
     * 현재창이 window.open으로 열린 팝업창인지 판단합니다.
     * index.do 본창은 제외하고, opener가 있는 비-index 창만 팝업으로 본다.
     */
    function isPopupWindow() {
        var path = String(window.location.pathname || '').toLowerCase();
        var isIndexPage = /\/index\.do$/.test(path);

        if(isIndexPage) {
            return false;
        }

        try{
            return !!(window.opener && window.opener !== window)
        }catch(e){
            return true;
        }
    }
    /**
     * refresh guard를 비활성화해야 하는지 판단합니다.
     * window.PT_REFRESH_GUARD_FORCE_ENABLE === true이면 로컬/DEV라도 강제 활성화합니다.
     */
    function shouldDisableRefreshGuard() {
        if(isPopupWindow()) {
            return true;
        }

        if (window.PT_REFRESH_GUARD_FORCE_ENABLE === true) {
            return false;
        }

        return isLocalEnvironment();
    }

    /**
     * 특정 DOM element가 selector에 매칭되는지 확인합니다.
     * 구형 브라우저 대응을 위해 matches/msMatchesSelector/webkitMatchesSelector를 순서대로 사용합니다.
     */
    function matchesElement(el, selector) {
        if (!el || el.nodeType !== 1) {
            return false;
        }

        var matches = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;

        if (!matches) {
            return false;
        }

        return matches.call(el, selector);
    }

    // a태그안에 href=# 기본동작을 막는함수
    function preventHashOnlyAnchorDefault(event){
        var anchor;
        var href;

        if(!event || !event.target) {
            return;
        }

        anchor = closestElement(event.target, 'a[href]');

        if(!anchor){
            return;
        }

        href = anchor.getAttribute('href');
        href = href == null ? '' : String(href).replace(/\s+|\s+$/g, '').toLowerCase();

        if(href === '#' || href === '#none') {
            event.preventDefault();
        }
    }

    /**
     * target에서 시작해 부모 방향으로 올라가며 selector에 맞는 가장 가까운 element를 찾습니다.
     * TextNode가 들어오는 경우 parentNode로 보정합니다.
     */
    function closestElement(target, selector) {
        var el = target;

        if (el && el.nodeType === 3) {
            el = el.parentNode;
        }

        while (el && el !== document) {
            if (matchesElement(el, selector)) {
                return el;
            }

            el = el.parentElement || el.parentNode;
        }

        return null;
    }

    // 요소의 문자열 정보를 모아서 반환하는 함수.
    function getElementDetectText(el) {
        var text = '';
        var attrs;
        var i;
        var attrName;
        var attrValue;

        if(!el) {
            return '';
        }

        attrs = [
            'id',
            'name',
            'class',
            'title',
            'aria-label',
            'href',
            'onclick',
            'date-url',
            'date-href',
            'data-download-url'
        ];

        for(i = 0; i < attrs.length; i+=1){
            attrName = attrs[i];

            if(typeof el.getAttribute === 'function'){
                attrValue = el.getAttribute(attrName);

                if(attrValue) {
                    text += ' ' + attrValue;
                }
            }
        }

        if(el.value) {
            text += ' ' + attrValue;
        }

        if(el.innerText) {
            text += ' ' + el.innerText;
        }else if(el.textContent) {
            text += ' ' + el.textContent;
        }

        if(el.form && el.form.action) {
            text += ' ' + el.form.action
        }
        return text;
    }

    // 클릭된 요소가 다운로드 액션인지 확인하는 함수
    function findDownloadActionElement(target){
        var actionEl;
        var detectText;

        actionEl = closestElement(
            target,
            'button, ' +
            'input[type="button"], ' +
            'input[type="submit"], ' +
            'input[type="image"], ' +
            'a, ' +
            'area, ' +
            '[role="button"], ' +
            '[onclick], ' +
            '.btn'
        );

        if(!actionEl) {
            return null;
        }

        detectText = getElementDetectText(actionEl);

        if(DOWNLOAD_ACTION_RE.test(detectText)) {
            return actionEl;
        }

        return null;
    }

    /** her */

    /**
     * 이벤트의 기본 동작과 전파를 모두 중단합니다.
     * F5/Ctrl+R/차단 대상 클릭처럼 먼저 막은 뒤 confirm 결과에 따라 수동 진행해야 하는 동작에서 사용합니다.
     */
    function stopEvent(event) {
        if (!event) {
            return;
        }

        event.preventDefault();

        if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
        } else if (typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }

        event.cancelBubble = true;
        event.returnValue = false;
    }

    /**
     * 지정 시간 동안 beforeunload 차단을 일시적으로 허용합니다.
     * confirm 확인 후 실제 새로고침/뒤로가기/링크 이동을 진행할 때 기본 브라우저 확인창이 다시 뜨지 않도록 사용합니다.
     */
    function allowNextUnload(ms, reason) {
        var allowMs = ms || DEFAULT_ALLOW_MS;
        var nextUntil = now() + allowMs;

        state.allowUnloadUntil = Math.max(state.allowUnloadUntil || 0, nextUntil);
        state.lastAllowReason = reason || '';

        if (state.allowTimer) {
            clearTimeout(state.allowTimer);
        }

        /* 허용 시간이 지난 뒤 allow 상태를 자동 정리하는 timer입니다. */
        state.allowTimer = window.setTimeout(function () {
            if (now() >= state.allowUnloadUntil) {
                state.allowUnloadUntil = 0;
                state.lastAllowReason = '';
                state.allowTimer = null;
            }
        }, Math.max(0, state.allowUnloadUntil - now()) + 100);
    }

    /**
     * 현재 설정된 unload 허용 상태를 즉시 해제합니다.
     * 새로고침 키나 명시 차단 클릭이 들어오면 기존 허용 상태를 지우고 다시 confirm 흐름으로 보냅니다.
     */
    function clearAllowUnload() {
        state.allowUnloadUntil = 0;
        state.lastAllowReason = '';

        if (state.allowTimer) {
            clearTimeout(state.allowTimer);
            state.allowTimer = null;
        }
    }

    /**
     * 현재 unload가 허용 구간 안에 있는지 확인합니다.
     * 허용 시간이 지났으면 상태를 정리하고 false를 반환합니다.
     */
    function isAllowedUnload() {
        if (!state.allowUnloadUntil) {
            return false;
        }

        if (now() <= state.allowUnloadUntil) {
            return true;
        }

        clearAllowUnload();
        return false;
    }

    /**
     * 차단 사유별 confirm 메시지를 반환합니다.
     * refreshKey, browserBack, blockedActionClick에 따라 사용자 문구를 다르게 보여줍니다.
     */
    function getConfirmMessage(reason) {
        if (reason === 'browserBack') {
            return BACK_CONFIRM_MESSAGE;
        }

        if (reason === 'blockedActionClick') {
            return ACTION_CONFIRM_MESSAGE;
        }

        return REFRESH_CONFIRM_MESSAGE;
    }

    /**
     * uiInfo.pt.confirm을 호출하고, 사용자가 확인을 누르면 onConfirm을 실행합니다.
     * 프로젝트 confirm 예시인 uiInfo.pt.confirm('', '메시지', function () { ... }) 형태를 기본으로 사용합니다.
     * uiInfo.pt.confirm이 없으면 window.confirm으로 fallback합니다.
     */
    function showRefreshBlockConfirm(event, reason, onConfirm) {
        var current = now();
        var message = getConfirmMessage(reason);
        var ctx;

        if (current - state.lastConfirmAt < CONFIRM_THROTTLE_MS) {
            return;
        }

        state.lastConfirmAt = current;

        ctx = {
            message: message,
            reason: reason || '',
            event: event || null,
            lastAllowReason: state.lastAllowReason || ''
        };

        if (typeof state.confirmHandler === 'function') {
            state.confirmHandler(ctx, function () {
                if (typeof onConfirm === 'function') {
                    onConfirm();
                }
            });
            return;
        }

        if (uiInfo && uiInfo.pt && typeof uiInfo.pt.confirm === 'function') {
            uiInfo.pt.confirm('', message, function () {
                if (typeof onConfirm === 'function') {
                    onConfirm();
                }
            });
            return;
        }

        if (window.confirm(message)) {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        }
    }

    /**
     * confirm 확인 후 실제 브라우저 새로고침을 실행합니다.
     * beforeunload 기본 확인창이 다시 뜨지 않도록 allowNextUnload를 먼저 설정합니다.
     */
    function proceedRefreshAfterConfirm() {
        allowNextUnload(DEFAULT_ALLOW_MS, 'confirmRefreshKey');

        window.setTimeout(function () {
            window.location.reload();
        }, 0);
    }

    /**
     * confirm 확인 후 막아두었던 클릭 동작을 다시 실행합니다.
     * replayingClick 플래그를 켜서 재실행 click이 다시 차단 confirm으로 들어가지 않도록 합니다.
     */
    function proceedBlockedActionClick(actionEl) {
        if (!actionEl) {
            return;
        }

        allowNextUnload(DEFAULT_ALLOW_MS, 'confirmBlockedActionClick');
        state.replayingClick = true;

        window.setTimeout(function () {
            try {
                if (typeof actionEl.click === 'function') {
                    actionEl.click();
                } else {
                    proceedByElementHref(actionEl);
                }
            } catch (e) {
                proceedByElementHref(actionEl);
            } finally {
                window.setTimeout(function () {
                    state.replayingClick = false;
                }, 0);
            }
        }, 0);
    }

    /**
     * element.click()을 사용할 수 없거나 실패했을 때 href 기반으로 이동을 시도합니다.
     * javascript: href는 임의 실행하지 않고, 일반 URL href만 처리합니다.
     */
    function proceedByElementHref(actionEl) {
        var href;
        var target;

        if (!actionEl || typeof actionEl.getAttribute !== 'function') {
            return;
        }

        href = actionEl.getAttribute('href');
        target = actionEl.getAttribute('target');

        if (!href || href === '#' || /^javascript:/i.test(href)) {
            return;
        }

        allowNextUnload(DEFAULT_ALLOW_MS, 'confirmBlockedActionHref');

        if (target && target !== '_self') {
            window.open(href, target);
            return;
        }

        window.location.href = href;
    }

    /**
     * F5, Ctrl+R, Cmd+R 키 입력을 감지해 새로고침을 먼저 차단합니다.
     * 사용자가 uiInfo.pt.confirm에서 확인을 누르면 proceedRefreshAfterConfirm으로 실제 새로고침을 실행합니다.
     */
    function handleKeyDown(event) {
        var key;
        var keyCode;
        var lowerKey;
        var isRefreshKey;

        if (state.disabled) {
            return;
        }

        key = event && event.key ? event.key : '';
        keyCode = event && event.keyCode ? event.keyCode : 0;
        lowerKey = key.toLowerCase();

        isRefreshKey =
            key === 'F5' ||
            keyCode === 116 ||
            ((event.ctrlKey || event.metaKey) && (lowerKey === 'r' || keyCode === 82));

        if (!isRefreshKey) {
            return;
        }

        clearAllowUnload();
        stopEvent(event);
        showRefreshBlockConfirm(event, 'refreshKey', proceedRefreshAfterConfirm);
    }

    /**
     * 클릭 시 무조건 confirm을 띄워야 하는 요소를 찾습니다.
     * 예: 하나은행 로고, ptComm.home 호출 링크, data-pt-refresh-block=true 요소.
     */
    function findRefreshBlockedActionElement(target) {
        return closestElement(
            target,
            'a.logo_hana, ' +
            'a[onclick*="ptComm.home"], ' +
            '[data-pt-refresh-block="true"]'
        );
    }

    /**
     * 일반 사용자 액션으로 볼 수 있는 버튼/링크/onclick 요소를 찾습니다.
     * 이런 요소 클릭은 정상 이동 가능성이 있으므로 beforeunload를 잠깐 허용합니다.
     */
    function findActionElement(target) {
        return closestElement(
            target,
            'button, ' +
            'input[type="button"], ' +
            'input[type="submit"], ' +
            'input[type="image"], ' +
            'a, ' +
            'area, ' +
            '[role="button"], ' +
            '[onclick], ' +
            '.btn'
        );
    }

    /**
     * document click 이벤트 처리 함수입니다.
     * 차단 대상 클릭이면 먼저 막고 confirm 확인 시 원래 클릭을 재실행합니다.
     * 일반 액션 클릭이면 정상 이동으로 보고 beforeunload를 일시 허용합니다.
     */
    function handleClick(event) {
        var blockedActionEl;
        var downloadActionEl;

        if (state.disabled) {
            return;
        }

        if (state.replayingClick) {
            allowNextUnload(DEFAULT_ALLOW_MS, 'confirmedActionClick');
            return;
        }

        preventHashOnlyAnchorDefault(event)
        
        blockedActionEl = findRefreshBlockedActionElement(event.target);

        if (blockedActionEl) {
            clearAllowUnload();
            stopEvent(event);

            showRefreshBlockConfirm(event, 'blockedActionClick', function () {
                proceedBlockedActionClick(blockedActionEl);
            });
            return false;
        }

        downloadActionEl = findDownloadActionElement(event.target);

        if(downloadActionEl) {
            allowNextUnload(DOWNLOAD_ALLOW_MS,'download.click');
            return;
        }

        // actionEl = findActionElement(event.target);

        // if (!actionEl) {
        //     return;
        // }

        // allowNextUnload(DEFAULT_ALLOW_MS, 'userActionClick');
    }

    /**
     * form submit 발생 시 unload를 일시 허용합니다.
     * 정상 submit이 beforeunload 기본 확인창에 막히지 않도록 하기 위한 처리입니다.
     */
    function handleSubmit(event) {
        if (state.disabled) {
            return;
        }

        if(state.submitAllowEnabled !== true){
            return;
        }

        allowNextUnload(DEFAULT_ALLOW_MS, 'formSubmit');
    }

    /**
     * 브라우저 새로고침 버튼, 탭 닫기, 주소창 이동 등 문서 unload 직전 이벤트를 처리합니다.
     * 이 이벤트에서는 uiInfo.pt.confirm 같은 커스텀 UI를 띄울 수 없고 브라우저 기본 확인창만 사용할 수 있습니다.
     */
    function handleBeforeUnload(event) {
        if (state.disabled) {
            return;
        }

        if (isAllowedUnload() && isBeforeUnloadAllowReason()) {
            return;
        }

        clearAllowUnload();
        /*
         * 브라우저 상단 새로고침 버튼 / 탭 닫기 / 주소창 이동은 여기만 탑니다.
         * 이 구간에서는 브라우저 정책상 커스텀 confirm을 띄울 수 없습니다.
         */
        event.preventDefault();
        event.returnValue = '';
        return '';
    }

    /**
     * 브라우저 뒤로가기를 막기 위해 현재 URL을 history state로 한 번 더 push합니다.
     * 사용자가 뒤로가기를 누르면 popstate에서 다시 같은 state를 push해 현재 화면에 머물게 합니다.
     */
    function pushBackGuardState(reason) {
        var currentState;

        if (!window.history || typeof window.history.pushState !== 'function') {
            return false;
        }

        try {
            currentState = window.history.state || {};

            if(currentState.__ptRefreshGuardBackBlock === true) {
                state.backGuardActive = true;
                return true;
            }

            window.history.pushState(
                {
                    __ptRefreshGuardBackBlock: true,
                    createdAt: now(),
                    reason: reason || ''
                },
                document.title,
                window.location.href
            );
            state.backGuardActive = true;
            return true;
        } catch (e) {
            state.backGuardActive = false;
            return false;
        }
    }

    /**
     * confirm 확인 후 실제 브라우저 뒤로가기를 진행합니다.
     * popstate에서 취소용 history state를 다시 push했기 때문에 보통 go(-2)로 실제 이전 페이지까지 이동합니다.
     */
    function proceedBrowserBackAfterConfirm() {
        allowNextUnload(DEFAULT_ALLOW_MS, 'confirmBrowserBack');

        window.setTimeout(function () {
            if (window.history && typeof window.history.go === 'function') {
                window.history.go(-2);
                return;
            }

            if (window.history && typeof window.history.back === 'function') {
                window.history.back();
            }
        }, 0);
    }

    /**
     * 브라우저 뒤로가기/앞으로가기 발생 시 실행됩니다.
     * 허용된 unload가 아니라면 뒤로가기 guard state를 다시 push하고 confirm을 표시합니다.
     */
    function handlePopState(event) {
        if (state.disabled) {
            return;
        }

        if (isAllowedUnload() && isHistoryAllowReason()) {
            return;
        }

        clearAllowUnload();
        /*
         * popstate 자체는 preventDefault로 취소할 수 없어서,
         * 같은 URL의 guard state를 다시 넣어 사용자가 현재 화면에 머물도록 만듭니다.
         */
        window.setTimeout(function () {
            pushBackGuardState('popstate.rearm');
        }, 0);

        showRefreshBlockConfirm(event, 'browserBack', proceedBrowserBackAfterConfirm);
    }

    /**
     * popstate listener를 1회 등록하고, 뒤로가기 방지용 history state를 생성합니다.
     * 이미 등록된 경우 중복 등록하지 않습니다.
     */
    function initBackButtonGuard() {
        if (state.backGuardBound) {
            return true;
        }

        if (!window.history || typeof window.history.pushState !== 'function') {
            return false;
        }

        window.addEventListener('popstate', handlePopState);
        state.backGuardBound = true;

        return pushBackGuardState('initBackButtonGuard');
    }

    /**
     * 단순클릭으로 열린 허용상태를 통과시키지 않는다.
     * 
     */
    function isConfirmedAllowReason() {
        var reason = state.lastAllowReason || '';

        return reason === 'confirmRefreshKey' ||
            reason === 'confirmBrowserBack' ||
            reason === 'confirmBlockedActionClick' ||
            reason === 'confirmBlockedActionHref' ||
            reason === 'confirmedActionClick' ||
            reason === 'manualAllow' ||
            (reason === 'formSubmit' && state.submitAllowEnabled === true);
    }

    function isBeforeUnloadAllowReason(){
        var reason = state.lastAllowReason || '';

        return reason === 'confirmRefreshKey' ||
            reason === 'confirmBrowserBack' ||
            reason === 'confirmBlockedActionClick' ||
            reason === 'confirmBlockedActionHref' ||
            reason === 'confirmedActionClick' ||
            reason === 'manualAllow' ||
            reason.indexOf('download.') === 0 ||
            reason.indexOf('appNavigation.') === 0 ||
            (reason === 'formSubmit' && state.submitAllowEnabled === true);
    }

    function isHistoryAllowReason(){
        var reason = state.lastAllowReason || '';

        return reason === 'confirmBrowserBack' ||
            reason === 'menualHistoryAllow';
    }

    /**
     * refresh guard 전체 초기화 함수입니다.
     * keydown/click/submit/beforeunload/popstate listener를 등록하고 중복 등록을 방지합니다.
     */
    function initPreventRefresh(reason) {
        state.lastInitReason = reason || state.lastInitReason || 'init';

        if (shouldDisableRefreshGuard()) {
            state.disabled = true;

            if (isLocalEnvironment() && !state.localLogPrinted) {
                console.log('로컬 개발환경 : 새로고침 방지기능 비활성화');
                state.localLogPrinted = true;
            }

            return false;
        }

        state.disabled = false;

        if (state.bound) {
            initBackButtonGuard();
            return true;
        }

        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('click', handleClick, true);
        document.addEventListener('submit', handleSubmit, true);
        window.addEventListener('beforeunload', handleBeforeUnload);

        state.bound = true;
        initBackButtonGuard();
        return true;
    }

    /*
     * 외부 공개 API입니다.
     * tabHeader나 다른 공통 script에서 재초기화, 일시 허용, confirm handler 설정 등에 사용할 수 있습니다.
     */
    window.PTRefreshGuard = window.PTRefreshGuard || {};

    /* guard 초기화 API입니다. 이미 초기화된 상태에서 다시 호출해도 중복 등록되지 않습니다. */
    window.PTRefreshGuard.init = initPreventRefresh;

    /* init과 동일한 재바인딩 API입니다. addTab/movePage 이후 안전하게 재호출할 수 있습니다. */
    window.PTRefreshGuard.rebind = initPreventRefresh;

    /* 다음 unload를 일정 시간 허용하는 API입니다. 정상 페이지 이동 직전에 사용할 수 있습니다. */
    window.PTRefreshGuard.allowNextUnload = allowNextUnload;

    /* unload 허용 상태를 강제로 해제하는 API입니다. */
    window.PTRefreshGuard.clearAllowUnload = clearAllowUnload;

    /**
     * 외부에서 confirm 처리 함수를 주입하는 API입니다.
     * handler(ctx, onConfirm) 형태로 넘기면 기본 uiInfo.pt.confirm 대신 사용할 수 있습니다.
     */
    window.PTRefreshGuard.setConfirmHandler = function (handler) {
        state.confirmHandler = typeof handler === 'function' ? handler : null;
    };

    window.PTRefreshGuard.setSubmitAllowEnabled = function (enabled) {
        state.submitAllowEnabled = enabled === true;
    }

    window.PTRefreshGuard.rearmHistoryGuard = function(reason) {
        return pushBackGuardState(reason || 'menualRearm')
    }

    /**
     * 기존 setAlertHandler 이름을 쓰던 코드가 있어도 깨지지 않게 남겨둔 호환 API입니다.
     * 실제 동작은 confirm handler이며, handler(ctx, onConfirm) 형태를 권장합니다.
     */
    window.PTRefreshGuard.setAlertHandler = window.PTRefreshGuard.setConfirmHandler;

    /**
     * guard의 기본 이벤트 listener가 등록됐는지 반환합니다.
     */
    window.PTRefreshGuard.isBound = function () {
        return !!state.bound;
    };

    /**
     * guard가 현재 비활성화 상태인지 반환합니다.
     */
    window.PTRefreshGuard.isDisabled = function () {
        return !!state.disabled;
    };

    /* tabHeader 로드 시점에 guard를 즉시 초기화합니다. */
    initPreventRefresh('tabHeader.load');
})(window, document);
