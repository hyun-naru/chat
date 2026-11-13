/* ------------------------------------------------------------------
 * 프로젝트 : 하나생명 NEW SFA 시스템 / TAB UI
 * 파일명   : progress.js
 * 설명     : progress overlay 전용 모듈입니다.
 * ------------------------------------------------------------------
 * 공개 API
 * - window.TabHeaderProgress
 * - window.beginTabProgress(tabId, $scope)
 * - window.refreshTabProgress(tabId, $scope, token)
 * - window.endTabProgress(tabId, token)
 * - window.forceEndTabProgress(tabId)
 * - window.showProgressIndicator()
 * - window.hideProgressIndicator()
 * - window.runAfterNextPaint(fn)
 *
 * 주의
 * - tabHeader 본체의 getTabRuntime / peekTabRuntime / getTabScopeByTabId와 런타임에 연결됩니다.
 * - dev/test helper가 기존 전역 함수명을 호출하므로 thin global API는 유지합니다.
 * ------------------------------------------------------------------*/
(function (window, document) {
    'use strict';

    var NS = window.TabHeaderProgress = window.TabHeaderProgress || {};
    NS.version = 'v1.0.0';

    function get$() {
        return window.jQuery || window.$ || null;
    }

    function warn(message, error) {
        if (window.console && typeof window.console.warn === 'function') {
            window.console.warn(message, error || '');
        }
    }

    /*
     * [함수 설명] tabHeader 본체의 getTabRuntime이 준비되어 있으면 우선 사용합니다.
     * 준비되지 않은 예외 상황에서는 기존 window.TabRuntime 구조를 보정해 progress만 안전하게 처리합니다.
     */
    function resolveRuntime(tabId, createIfMissing) {
        if (!tabId) {
            return null;
        }

        if (typeof window.getTabRuntime === 'function' && createIfMissing !== false) {
            try {
                return window.getTabRuntime(tabId);
            } catch (e) {
                warn('[TabHeaderProgress] getTabRuntime 실패 : ', e);
            }
        }

        if (typeof window.peekTabRuntime === 'function') {
            try {
                var runtime = window.peekTabRuntime(tabId);
                if (runtime || createIfMissing === false) {
                    return runtime;
                }
            } catch (e2) {
                warn('[TabHeaderProgress] peekTabRuntime 실패 : ', e2);
            }
        }

        if (createIfMissing === false) {
            return window.TabRuntime && window.TabRuntime[tabId] ? window.TabRuntime[tabId] : null;
        }

        window.TabRuntime = window.TabRuntime || {};
        window.TabRuntime[tabId] = window.TabRuntime[tabId] || {
            loadSeq: 0,
            status: 'idle',
            xhr: null,
            moduleTimer: null,
            scriptPromise: null,
            moduleKey: '',
            entryType: '',
            requestUrl: '',
            progressToken: null,
            progressScope: null,
            progressShown: false
        };
        return window.TabRuntime[tabId];
    }

    /*
     * [함수 설명] 전역 progress show/hide 중복을 막기 위한 counter 상태 객체를 반환합니다.
     */
    function getGlobalTabProgressState() {
        window.__TAB_GLOBAL_PROGRESS__ = window.__TAB_GLOBAL_PROGRESS__ || {
            count: 0
        };
        return window.__TAB_GLOBAL_PROGRESS__;
    }

    /*
     * [함수 설명] body 아래의 shell progress host를 생성하거나 반환합니다.
     * page DOM 내부에 overlay를 직접 넣지 않기 위한 공통 host입니다.
     */
    function getShellProgressHost() {
        var $ = get$();
        var $host;

        if (!$) {
            return null;
        }

        $host = $('#tab_shell_progress_host');

        if (!$host.length) {
            $host = $('<div id="tab_shell_progress_host"></div>');
            $host.css({
                position: 'absolute',
                top: '0',
                left: '0',
                width: '0',
                height: '0',
                zIndex: 99999,
                pointerEvents: 'none'
            });
            $('body').append($host);
        }

        return $host;
    }

    /*
     * [함수 설명] progress overlay 좌표 계산에 사용할 scope를 항상 jQuery 객체로 정규화합니다.
     */
    function normalizeTabProgressScope($scope, tabId) {
        var $ = get$();

        if (!$) {
            return null;
        }

        if ($scope && $scope.jquery) {
            return $scope;
        }

        if ($scope && $scope.nodeType === 1) {
            return $($scope);
        }

        if (typeof $scope === 'string' && $scope) {
            return $($scope).first();
        }

        if (tabId && typeof window.getTabScopeByTabId === 'function') {
            try {
                return window.getTabScopeByTabId(tabId);
            } catch (e) {
                warn('[TabHeaderProgress] getTabScopeByTabId 실패 : ', e);
            }
        }

        if (tabId) {
            return $('.tab_page_list').find('.content_tab[data-id="' + tabId + '"]').first();
        }

        return $();
    }

    /*
     * [함수 설명] 전역 progress.show를 중복 호출하지 않도록 counter 기반으로 안전하게 실행합니다.
     */
    function showGlobalProgressSafely() {
        var state = getGlobalTabProgressState();
        state.count += 1;
        if (state.count !== 1) {
            return;
        }

        if (typeof window.progress !== 'undefined' && window.progress && typeof window.progress.show === 'function') {
            try {
                window.progress.show();
            } catch (e) {
                warn('[showGlobalProgressSafely] progress.show 실패 : ', e);
            }
        }
    }

    /*
     * [함수 설명] 전역 progress.hide를 counter가 0이 되었을 때만 안전하게 실행합니다.
     */
    function hideGlobalProgressSafely() {
        var state = getGlobalTabProgressState();

        if (state.count > 0) {
            state.count -= 1;
        }

        if (state.count !== 0) {
            return;
        }

        if (typeof window.progress !== 'undefined' && window.progress && typeof window.progress.hide === 'function') {
            try {
                window.progress.hide();
            } catch (e) {
                warn('[hideGlobalProgressSafely] progress.hide 실패 : ', e);
            }
        }
    }

    /*
     * [함수 설명] 현재 탭 영역의 좌표를 읽어 shell host 위에 로딩 overlay를 렌더링합니다.
     */
    function renderShellProgressOverlay(tabId, $scope, token) {
        var $ = get$();
        var runtime = resolveRuntime(tabId, false);
        var offset;
        var width;
        var height;
        var $host;
        var selector;
        var $overlay;

        if (!$) {
            return;
        }

        if (!runtime || runtime.progressToken !== token) {
            return;
        }

        $scope = normalizeTabProgressScope($scope || runtime.progressScope, tabId);
        if (!$scope || !$scope.length) {
            return;
        }

        runtime.progressScope = $scope;

        /* 기존 page DOM 내부 overlay 흔적이 남아 있을 때를 대비한 정리 */
        try {
            $scope.find('[data-tab-progress-overlay]').remove();
            if ($scope.attr('data-tab-progress-static') === 'Y') {
                $scope.css('position', '');
                $scope.removeAttr('data-tab-progress-static');
            }
        } catch (ignore) {}

        offset = (typeof $scope.offset === 'function') ? $scope.offset() : null;
        if (!offset) {
            return;
        }

        width = Math.max($scope.outerWidth() || 0, 240);
        height = Math.max($scope.outerHeight() || 0, 120);
        $host = getShellProgressHost();
        if (!$host || !$host.length) {
            return;
        }

        selector = '[data-tab-shell-progress="' + tabId + '"]';
        $overlay = $host.find(selector);

        if (!$overlay.length) {
            $overlay = $('<div data-tab-shell-progress="' + tabId + '"></div>');
            $overlay.css({
                position: 'absolute',
                background: 'rgba(255,255,255,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto'
            });
            $overlay.append(
                '<div style="padding:10px 14px; background:#fff; border:1px solid #ddd; border-radius:6px; font-size:13px; color:#333;">페이지 로딩 중...</div>'
            );
            $host.append($overlay);
        }

        $overlay.css({
            top: offset.top + 'px',
            left: offset.left + 'px',
            width: width + 'px',
            height: height + 'px'
        }).show();
    }

    /*
     * [함수 설명] shell host에서 해당 tabId의 progress overlay를 제거합니다.
     */
    function removeShellProgressOverlay(tabId) {
        var $host = getShellProgressHost();
        if (!$host || !$host.length) {
            return;
        }
        $host.find('[data-tab-shell-progress="' + tabId + '"]').remove();
    }

    /*
     * [함수 설명] 탭 로딩 progress를 시작하고 loadSeq 기반 token을 발급합니다.
     */
    function beginTabProgress(tabId, $scope) {
        var runtime = resolveRuntime(tabId, true);
        var token;

        if (!runtime) {
            return null;
        }

        forceEndTabProgress(tabId);

        token = tabId + ':' + runtime.loadSeq + ':' + (Date.now ? Date.now() : new Date().getTime());
        runtime.progressToken = token;
        runtime.progressScope = normalizeTabProgressScope($scope, tabId);
        runtime.progressShown = true;

        showGlobalProgressSafely();
        return token;
    }

    /*
     * [함수 설명] DOM 주입/레이아웃 변경 후 progress overlay 위치와 크기를 다시 계산합니다.
     */
    function refreshTabProgress(tabId, $scope, token) {
        renderShellProgressOverlay(tabId, $scope, token);
    }

    /*
     * [함수 설명] 정상 완료 경로에서 token이 일치하는 progress만 종료합니다.
     */
    function endTabProgress(tabId, token) {
        var runtime = resolveRuntime(tabId, false);

        if (!runtime || runtime.progressToken !== token) {
            return;
        }

        runtime.progressToken = null;

        if (runtime.progressShown) {
            runtime.progressShown = false;
            hideGlobalProgressSafely();
        }

        removeShellProgressOverlay(tabId);
        runtime.progressScope = null;
    }

    /*
     * [함수 설명] error/abort/stale/cleanup 경로에서 token과 무관하게 해당 탭 progress를 강제 종료합니다.
     */
    function forceEndTabProgress(tabId) {
        var runtime = resolveRuntime(tabId, false);

        if (!runtime) {
            return;
        }

        runtime.progressToken = null;

        if (runtime.progressShown) {
            runtime.progressShown = false;
            hideGlobalProgressSafely();
        }

        removeShellProgressOverlay(tabId);
        runtime.progressScope = null;
    }

    /*
     * [함수 설명] 기존 공통 코드가 호출하던 showProgressIndicator 호환 함수입니다.
     */
    function showProgressIndicator() {
        showGlobalProgressSafely();
    }

    /*
     * [함수 설명] 기존 공통 코드가 호출하던 hideProgressIndicator 호환 함수입니다.
     */
    function hideProgressIndicator() {
        hideGlobalProgressSafely();
    }

    /*
     * [함수 설명] 브라우저가 한 번 paint할 시간을 준 뒤 무거운 작업을 실행합니다.
     * progress overlay가 화면에 먼저 보이도록 requestAnimationFrame 2회를 사용합니다.
     */
    function runAfterNextPaint(fn) {
        if (typeof fn !== 'function') {
            return;
        }

        if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(function () {
                window.requestAnimationFrame(function () {
                    fn();
                });
            });
            return;
        }

        window.setTimeout(fn, 0);
    }

    NS.getGlobalState = getGlobalTabProgressState;
    NS.getShellHost = getShellProgressHost;
    NS.normalizeScope = normalizeTabProgressScope;
    NS.showGlobal = showGlobalProgressSafely;
    NS.hideGlobal = hideGlobalProgressSafely;
    NS.render = renderShellProgressOverlay;
    NS.remove = removeShellProgressOverlay;
    NS.begin = beginTabProgress;
    NS.refresh = refreshTabProgress;
    NS.end = endTabProgress;
    NS.forceEnd = forceEndTabProgress;
    NS.showIndicator = showProgressIndicator;
    NS.hideIndicator = hideProgressIndicator;
    NS.afterPaint = runAfterNextPaint;

    /* 기존 tabHeader / devTestTab 호출부 보호용 thin global API */
    window.getGlobalTabProgressState = getGlobalTabProgressState;
    window.getShellProgressHost = getShellProgressHost;
    window.normalizeTabProgressScope = normalizeTabProgressScope;
    window.showGlobalProgressSafely = showGlobalProgressSafely;
    window.hideGlobalProgressSafely = hideGlobalProgressSafely;
    window.renderShellProgressOverlay = renderShellProgressOverlay;
    window.removeShellProgressOverlay = removeShellProgressOverlay;
    window.beginTabProgress = beginTabProgress;
    window.refreshTabProgress = refreshTabProgress;
    window.endTabProgress = endTabProgress;
    window.forceEndTabProgress = forceEndTabProgress;
    window.showProgressIndicator = showProgressIndicator;
    window.hideProgressIndicator = hideProgressIndicator;
    window.runAfterNextPaint = runAfterNextPaint;
}(window, document));
