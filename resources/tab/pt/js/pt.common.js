var menuDepSave;
var menuDepDraw;
var removeMenuDep;

(function (window, document, $) {
    'use strict';

    /* shell 공통 breadcrumb 런타임 상태 */
    var runtime = window.__PT_HEADER_RUNTIME = window.__PT_HEADER_RUNTIME || {
        /* tabHeader 에서 선택적으로 주입할 shell bootstrap 데이터(menuList 등 비민감 정보) */
        shellBootstrap: window.__PT_SHELL_BOOTSTRAP || null,
        /* 새 탭 오픈 직전 저장되는 breadcrumb */
        pendingPath: null,
        /* 현재 활성 탭 id */
        activeTabId: '',
        /* 탭별 breadcrumb 보관 맵 */
        byTabId: {},
        /* addTab wrapper 적용 여부 */
        addTabWrapped: false,
        /* movePage wrapper 적용 여부 */
        movePageWrapped: false,
        /* moveTabPage wrapper 적용 여부 */
        moveTabPageWrapped: false,
        /* 탭 이벤트 바인딩 여부 */
        tabEventsBound: false,
        /* active tab observer 바인딩 여부 */
        observerBound: false
    };

    /**
     * shell bootstrap 데이터를 저장한다.
     */
    window.setPtShellBootstrap = window.setPtShellBootstrap || function (shellBootstrapData) {
        runtime.shellBootstrap = shellBootstrapData || null;
        return runtime.shellBootstrap;
    };

    /**
     * shell bootstrap 데이터를 조회한다.
     */
    window.getPtShellBootstrap = window.getPtShellBootstrap || function () {
        return runtime.shellBootstrap || null;
    };

    /**
     * menuList 를 memory-first 로 조회한다.
     * - tabHeader bootstrap 주입값 우선
     * - 없으면 빈 배열 반환
     */
    window.getPtMenuList = window.getPtMenuList || function () {
        try {
            if (runtime.shellBootstrap && runtime.shellBootstrap.menuList && typeof runtime.shellBootstrap.menuList.length !== 'undefined') {
                return runtime.shellBootstrap.menuList;
            }
        } catch (e) {
            /* shell bootstrap 미주입시 빈 배열 반환 */
        }

        return [];
    };

    /**
     * userInfo 를 memory-first 로 조회한다.
     * - tabHeader bootstrap 주입값 우선
     * - 없으면 sessionStorage fallback
     */
    window.getPtUserInfo = window.getPtUserInfo || function () {
        try {
            if (runtime.shellBootstrap && runtime.shellBootstrap.userInfo) {
                return runtime.shellBootstrap.userInfo;
            }
        } catch (e) {
            /* shell bootstrap 미주입시 fallback 진행 */
        }

        try {
            if (window.sessionStorage) {
                var userInfoStr = sessionStorage.getItem('userInfo');
                return userInfoStr ? JSON.parse(userInfoStr) : null;
            }
        } catch (e2) {
            /* sessionStorage 사용 불가 환경은 null 반환 */
        }

        return null;
    };

    /**
     * 문자열 trim helper
     */
    function trimValue(value) {
        return String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
    }

    /**
     * breadcrumb item 을 정규화한다.
     */
    function normalizeItem(item) {
        if (!item) {
            return null;
        }

        if (typeof item === 'string') {
            var textOnly = trimValue(item);
            return textOnly ? { text: textOnly, href: 'javascript://' } : null;
        }

        var text = trimValue(item.text || item.name || item.label || '');
        var href = trimValue(item.href || item.link || item.url || 'javascript://');

        if (!text) {
            return null;
        }

        return {
            text: text,
            href: href || 'javascript://'
        };
    }

    /**
     * breadcrumb 배열을 정규화한다.
     */
    function normalizePath(path) {
        var normalized = [];
        var i;

        if (!path || typeof path.length === 'undefined') {
            return normalized;
        }

        for (i = 0; i < path.length; i += 1) {
            var normalizedItem = normalizeItem(path[i]);
            if (normalizedItem) {
                normalized.push(normalizedItem);
            }
        }

        return normalized;
    }

    /**
     * 기존 menuDepSave 인자 형태를 breadcrumb 배열로 변환한다.
     */
    function pathFromLegacyArgs(oneDepNM, oneDepLK, twoDepNM, twoDepLK, threeDepNM, threeDepLK) {
        return normalizePath([
            { text: oneDepNM, href: oneDepLK },
            { text: twoDepNM, href: twoDepLK },
            { text: threeDepNM, href: threeDepLK }
        ]);
    }

    /**
     * breadcrumb 배열을 깊은 복사한다.
     */
    function clonePath(path) {
        var source = normalizePath(path);
        var copied = [];
        var i;

        for (i = 0; i < source.length; i += 1) {
            copied.push({
                text: source[i].text,
                href: source[i].href
            });
        }

        return copied;
    }

    /**
     * breadcrumb 텍스트를 HTML escape 한다.
     */
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * 현재 활성 탭 id 를 best-effort 로 조회한다.
     */
    function getActiveTabId() {
        var tabId = '';

        try {
            if (typeof window.getCurrentActiveTabId === 'function') {
                tabId = trimValue(window.getCurrentActiveTabId());
                if (tabId) {
                    runtime.activeTabId = tabId;
                    return tabId;
                }
            }
        } catch (e) {
            tabId = '';
        }

        try {
            if ($) {
                tabId = trimValue($('#gaActPage2').val() || $('#gaActPage').val() || '');
                if (tabId) {
                    runtime.activeTabId = tabId;
                    return tabId;
                }

                var $activeTab = $('.tab_page_list').find('.tab_bar_item > li.active[data-id], .tab_bar_item > li.on[data-id]').first();
                if ($activeTab.length) {
                    tabId = trimValue($activeTab.attr('data-id') || '');
                    if (tabId) {
                        runtime.activeTabId = tabId;
                        return tabId;
                    }
                }

                var $activeCont = $('.tab_page_list').find('.content_tab.active[data-id], .content_tab.on[data-id]').first();
                if ($activeCont.length) {
                    tabId = trimValue($activeCont.attr('data-id') || '');
                    if (tabId) {
                        runtime.activeTabId = tabId;
                        return tabId;
                    }
                }
            }
        } catch (e2) {
            tabId = '';
        }

        try {
            var activeTabNode = document.querySelector('.tab_page_list .tab_bar_item > li.active[data-id], .tab_page_list .tab_bar_item > li.on[data-id]');
            if (activeTabNode) {
                tabId = trimValue(activeTabNode.getAttribute('data-id') || '');
                if (tabId) {
                    runtime.activeTabId = tabId;
                    return tabId;
                }
            }

            var activeContNode = document.querySelector('.tab_page_list .content_tab.active[data-id], .tab_page_list .content_tab.on[data-id]');
            if (activeContNode) {
                tabId = trimValue(activeContNode.getAttribute('data-id') || '');
                if (tabId) {
                    runtime.activeTabId = tabId;
                    return tabId;
                }
            }
        } catch (e3) {
            tabId = '';
        }

        return runtime.activeTabId || '';
    }

    /**
     * DOM 에 존재하지 않는 탭 breadcrumb 상태를 정리한다.
     */
    function pruneMissingTabs() {
        var existing = {};
        var tabId;
        var i;

        if ($) {
            $('.tab_page_list').find('.tab_bar_item > li[data-id]').each(function () {
                tabId = trimValue($(this).attr('data-id') || '');
                if (tabId) {
                    existing[tabId] = true;
                }
            });
        } else {
            var nodes = document.querySelectorAll('.tab_page_list .tab_bar_item > li[data-id]');
            for (i = 0; i < nodes.length; i += 1) {
                tabId = trimValue(nodes[i].getAttribute('data-id') || '');
                if (tabId) {
                    existing[tabId] = true;
                }
            }
        }

        for (tabId in runtime.byTabId) {
            if (Object.prototype.hasOwnProperty.call(runtime.byTabId, tabId) && !existing[tabId]) {
                delete runtime.byTabId[tabId];
            }
        }
    }

    /**
     * 특정 탭 breadcrumb 를 저장한다.
     */
    function setPathForTab(tabId, path) {
        var resolvedTabId = trimValue(tabId || '');
        if (!resolvedTabId) {
            return [];
        }

        runtime.byTabId[resolvedTabId] = clonePath(path);
        runtime.activeTabId = resolvedTabId;
        return runtime.byTabId[resolvedTabId];
    }

    /**
     * 특정 탭 breadcrumb 를 제거한다.
     */
    function removePathForTab(tabId) {
        var resolvedTabId = trimValue(tabId || '');

        if (!resolvedTabId) {
            return;
        }

        delete runtime.byTabId[resolvedTabId];

        if (runtime.activeTabId === resolvedTabId) {
            runtime.activeTabId = '';
        }
    }

    /**
     * breadcrumb DOM 을 best-effort 로 갱신한다.
     */
    function setBreadcrumbHtml(html) {
        if ($) {
            $('#breadcrumbs').html(html || '');
            return;
        }

        var target = document.getElementById('breadcrumbs');
        if (target) {
            target.innerHTML = html || '';
        }
    }

    /**
     * breadcrumb HTML 을 생성한다.
     */
    function buildBreadcrumbHtml(path) {
        var normalized = clonePath(path);
        var html = '';
        var i;

        /* [수정] 홈/빈 경로일 때는 breadcrumb 영역을 비웁니다. */
        if (normalized.length === 0) {
            return '';
        }

        html = '<a href="javascript://" class="breadcrumbs_list_cell"><img src="/resources/pt/images/icons/icon_home.svg" alt="홈 바로가기"></a>';

        for (i = 0; i < normalized.length; i += 1) {
            html += '<a href="javascript://" class="breadcrumbs_list_cell breadcrumbs_txt" data-crumb-index="' + i + '"><span>' + escapeHtml(normalized[i].text) + '</span></a>';
        }

        return html;
    }

    /**
     * shell breadcrumb 영역을 렌더링한다.
     */
    function renderBreadcrumb(tabId) {
        pruneMissingTabs();

        var targetTabId = trimValue(tabId || getActiveTabId() || '');
        var path = clonePath(runtime.byTabId[targetTabId] || []);
        var html = buildBreadcrumbHtml(path);

        runtime.activeTabId = targetTabId || runtime.activeTabId;
        setBreadcrumbHtml(html);

        return path;
    }

    /**
     * pending breadcrumb 를 현재 활성 탭에 연결한다.
     */
    function bindPendingToActiveTab() {
        var activeTabId = getActiveTabId();

        if (!activeTabId) {
            return [];
        }

        if (runtime.pendingPath && runtime.pendingPath.length) {
            setPathForTab(activeTabId, runtime.pendingPath);
            runtime.pendingPath = null;
        } else if (!runtime.byTabId[activeTabId]) {
            runtime.byTabId[activeTabId] = [];
        }

        return renderBreadcrumb(activeTabId);
    }

    /**
     * legacy storage key 를 best-effort 로 정리한다.
     */
    function clearLegacyStorageKeys() {
        try {
            if (typeof globalStorage !== 'undefined' && globalStorage) {
                if (typeof globalStorage.remove === 'function') {
                    globalStorage.remove('oneDepNM');
                    globalStorage.remove('oneDepLK');
                    globalStorage.remove('twoDepNM');
                    globalStorage.remove('twoDepLK');
                    globalStorage.remove('threeDepNM');
                    globalStorage.remove('threeDepLK');
                } else if (typeof globalStorage.set === 'function') {
                    globalStorage.set('oneDepNM', '');
                    globalStorage.set('oneDepLK', '');
                    globalStorage.set('twoDepNM', '');
                    globalStorage.set('twoDepLK', '');
                    globalStorage.set('threeDepNM', '');
                    globalStorage.set('threeDepLK', '');
                }
            }
        } catch (e) {
            /* globalStorage 사용 불가 환경은 조용히 통과 */
        }

        try {
            if (window.sessionStorage) {
                sessionStorage.removeItem('oneDepNM');
                sessionStorage.removeItem('oneDepLK');
                sessionStorage.removeItem('twoDepNM');
                sessionStorage.removeItem('twoDepLK');
                sessionStorage.removeItem('threeDepNM');
                sessionStorage.removeItem('threeDepLK');
            }
        } catch (e2) {
            /* sessionStorage 사용 불가 환경은 조용히 통과 */
        }
    }

    /**
     * addTab 을 wrapper 로 감싼다.
     */
    function wrapAddTab() {
        if (runtime.addTabWrapped || typeof window.addTab !== 'function') {
            return;
        }

        var originalAddTab = window.addTab;
        if (originalAddTab.__ptBreadcrumbWrapped) {
            runtime.addTabWrapped = true;
            return;
        }

        window.addTab = function () {
            var pendingPathSnapshot = clonePath(runtime.pendingPath || []);
            var result = originalAddTab.apply(this, arguments);

            setTimeout(function () {
                var activeTabId = getActiveTabId();

                if (pendingPathSnapshot.length) {
                    setPathForTab(activeTabId, pendingPathSnapshot);
                    runtime.pendingPath = null;
                } else if (activeTabId && !runtime.byTabId[activeTabId]) {
                    runtime.byTabId[activeTabId] = [];
                }

                renderBreadcrumb(activeTabId);
            }, 0);

            return result;
        };

        window.addTab.__ptBreadcrumbWrapped = true;
        runtime.addTabWrapped = true;
    }

    /**
     * movePage 를 wrapper 로 감싼다.
     * - paramData.__breadcrumbPath 가 있을 때만 현재 탭 breadcrumb 를 갱신한다.
     */
    function wrapMovePage() {
        if (runtime.movePageWrapped || typeof window.movePage !== 'function') {
            return;
        }

        var originalMovePage = window.movePage;
        if (originalMovePage.__ptBreadcrumbWrapped) {
            runtime.movePageWrapped = true;
            return;
        }

        window.movePage = function ($scope, targetUrl, paramData, type) {
            var resolvedTabId = '';

            try {
                if (typeof window.getScopeTabId === 'function') {
                    resolvedTabId = trimValue(window.getScopeTabId($scope) || '');
                }
            } catch (e) {
                resolvedTabId = '';
            }

            if (!resolvedTabId && $scope && $scope.length) {
                resolvedTabId = trimValue($scope.data('id') || $scope.attr('data-id') || $scope.attr('id') || '');
            }

            resolvedTabId = resolvedTabId || getActiveTabId();

            if (paramData && paramData.__breadcrumbPath && typeof paramData.__breadcrumbPath.length !== 'undefined') {
                setPathForTab(resolvedTabId, paramData.__breadcrumbPath);
                renderBreadcrumb(resolvedTabId);
            }

            return originalMovePage.apply(this, arguments);
        };

        window.movePage.__ptBreadcrumbWrapped = true;
        runtime.movePageWrapped = true;
    }

    /**
     * moveTabPage 를 wrapper 로 감싼다.
     * - paramData.__breadcrumbPath 가 있을 때만 현재 탭 breadcrumb 를 갱신한다.
     */
    function wrapMoveTabPage() {
        if (runtime.moveTabPageWrapped || typeof window.moveTabPage !== 'function') {
            return;
        }

        var originalMoveTabPage = window.moveTabPage;
        if (originalMoveTabPage.__ptBreadcrumbWrapped) {
            runtime.moveTabPageWrapped = true;
            return;
        }

        window.moveTabPage = function ($scope, targetUrl, tabId, paramData, type) {
            var resolvedTabId = trimValue(tabId || '') || getActiveTabId();

            if (paramData && paramData.__breadcrumbPath && typeof paramData.__breadcrumbPath.length !== 'undefined') {
                setPathForTab(resolvedTabId, paramData.__breadcrumbPath);
                renderBreadcrumb(resolvedTabId);
            }

            return originalMoveTabPage.apply(this, arguments);
        };

        window.moveTabPage.__ptBreadcrumbWrapped = true;
        runtime.moveTabPageWrapped = true;
    }

    /**
     * 탭 클릭/닫기 이벤트에 breadcrumb redraw 를 연결한다.
     */
    function bindTabEvents() {
        if (runtime.tabEventsBound || !$) {
            return;
        }

        $(document)
            .off('click.ptBreadcrumbTabSwitch', '.tab_page_list .tab_bar_item > li > a')
            .on('click.ptBreadcrumbTabSwitch', '.tab_page_list .tab_bar_item > li > a', function () {
                setTimeout(function () {
                    renderBreadcrumb(getActiveTabId());
                }, 0);
            });

        $(document)
            .off('click.ptBreadcrumbTabClose', '.tab_page_list .btn_del')
            .on('click.ptBreadcrumbTabClose', '.tab_page_list .btn_del', function () {
                var $li = $(this).closest('li[data-id]');
                var closedTabId = trimValue($li.attr('data-id') || '');

                setTimeout(function () {
                    if (closedTabId) {
                        removePathForTab(closedTabId);
                    }
                    renderBreadcrumb(getActiveTabId());
                }, 0);
            });

        runtime.tabEventsBound = true;
    }

    /**
     * active tab class 변경을 감시한다.
     */
    function bindActiveTabObserver() {
        if (runtime.observerBound || typeof MutationObserver === 'undefined') {
            return;
        }

        var tabBar = document.querySelector('.tab_page_list .tab_bar_item');
        if (!tabBar) {
            return;
        }

        var observer = new MutationObserver(function () {
            var activeTabId = getActiveTabId();
            if (activeTabId && activeTabId !== runtime.activeTabId) {
                runtime.activeTabId = activeTabId;
                renderBreadcrumb(activeTabId);
            }
        });

        observer.observe(tabBar, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        runtime.observerBound = true;
    }

    /**
     * breadcrumb 관련 shell hook 을 보장한다.
     */
    function ensureHooks() {
        wrapAddTab();
        wrapMovePage();
        wrapMoveTabPage();
        bindTabEvents();
        bindActiveTabObserver();
    }

    // 헤더 메뉴 스토리지 저장 함수
    menuDepSave = window.menuDepSave = function (oneDepNM, oneDepLK, twoDepNM, twoDepLK, threeDepNM, threeDepLK) {
        /* [추가] shell hook 준비 */
        ensureHooks();

        runtime.pendingPath = pathFromLegacyArgs(oneDepNM, oneDepLK, twoDepNM, twoDepLK, threeDepNM, threeDepLK);

        return clonePath(runtime.pendingPath);
    };

    // 저장된 스토리지 데이터 기반 GNB 구현 함수
    menuDepDraw = window.menuDepDraw = function (tabId) {
        /* [추가] shell hook 준비 */
        ensureHooks();

        var resolvedTabId = trimValue(tabId || '') || getActiveTabId();

        if (resolvedTabId && runtime.byTabId[resolvedTabId]) {
            return renderBreadcrumb(resolvedTabId);
        }

        if (runtime.pendingPath && runtime.pendingPath.length) {
            return bindPendingToActiveTab();
        }

        return renderBreadcrumb(resolvedTabId);
    };

    removeMenuDep = window.removeMenuDep = function (clearMode, tabId) {
        /* [추가] shell hook 준비 */
        ensureHooks();

        clearLegacyStorageKeys();

        if (clearMode === 'current') {
            var resolvedTabId = trimValue(tabId || '') || getActiveTabId();
            if (resolvedTabId) {
                delete runtime.byTabId[resolvedTabId];
            }
            runtime.pendingPath = null;
            renderBreadcrumb(getActiveTabId());
            return;
        }

        runtime.pendingPath = null;
        runtime.activeTabId = '';
        runtime.byTabId = {};

        /* [수정] 전체 초기화/홈 이동 시 breadcrumb 영역을 비웁니다. */
        setBreadcrumbHtml('');
    };

    /**
     * 외부에서 직접 호출 가능한 breadcrumb runtime API
     */
    window.PTBreadcrumbRuntime = window.PTBreadcrumbRuntime || {
        /* active 탭 id 조회 */
        getActiveTabId: function () {
            ensureHooks();
            return getActiveTabId();
        },
        /* 현재 탭 breadcrumb 전체 교체 */
        setCurrent: function (path) {
            ensureHooks();
            var activeTabId = getActiveTabId();
            setPathForTab(activeTabId, path);
            return renderBreadcrumb(activeTabId);
        },
        /* 특정 탭 breadcrumb 전체 교체 */
        setForTab: function (tabId, path) {
            ensureHooks();
            var resolvedTabId = trimValue(tabId || '');
            setPathForTab(resolvedTabId, path);
            return renderBreadcrumb(resolvedTabId);
        },
        /* 현재 탭 breadcrumb 마지막 항목 교체 */
        replaceCurrentLast: function (item) {
            ensureHooks();
            var activeTabId = getActiveTabId();
            var currentPath = clonePath(runtime.byTabId[activeTabId] || []);
            var normalizedItem = normalizeItem(item);

            if (!normalizedItem) {
                return currentPath;
            }

            if (currentPath.length === 0) {
                currentPath.push(normalizedItem);
            } else {
                currentPath[currentPath.length - 1] = normalizedItem;
            }

            setPathForTab(activeTabId, currentPath);
            return renderBreadcrumb(activeTabId);
        },
        /* 현재 탭 breadcrumb 뒤에 항목 추가 */
        appendCurrent: function (item) {
            ensureHooks();
            var activeTabId = getActiveTabId();
            var currentPath = clonePath(runtime.byTabId[activeTabId] || []);
            var normalizedItem = normalizeItem(item);

            if (!normalizedItem) {
                return currentPath;
            }

            currentPath.push(normalizedItem);
            setPathForTab(activeTabId, currentPath);
            return renderBreadcrumb(activeTabId);
        },
        /* 현재 active 탭 redraw */
        redrawCurrent: function () {
            ensureHooks();
            return renderBreadcrumb(getActiveTabId());
        },
        /* 특정 탭 제거 */
        clearCurrent: function () {
            ensureHooks();
            removeMenuDep('current');
        },
        /* 전체 초기화 */
        clearAll: function () {
            ensureHooks();
            removeMenuDep();
        },
        /* [추가] 특정 탭 breadcrumb 제거 후 지정 탭 기준으로 redraw */
        removeForTab: function (tabId, redrawTabId) {
            ensureHooks();
            removePathForTab(tabId);
            return renderBreadcrumb(trimValue(redrawTabId || '') || getActiveTabId());
        },
        /* [추가] 탭 활성화 직후 명시적으로 breadcrumb redraw */
        notifyTabActivated: function (tabId) {
            ensureHooks();
            var resolvedTabId = trimValue(tabId || '') || getActiveTabId();
            runtime.activeTabId = resolvedTabId || runtime.activeTabId;
            return renderBreadcrumb(resolvedTabId);
        },
        /* shell bootstrap 데이터 주입 */
        setShellBootstrap: function (shellBootstrapData) {
            return window.setPtShellBootstrap(shellBootstrapData);
        },
        /* shell bootstrap 데이터 조회 */
        getShellBootstrap: function () {
            return window.getPtShellBootstrap();
        }
    };

    /* 초기 로드 시점에 가능한 hook 을 먼저 바인딩 */
    ensureHooks();

    /* DOM 준비 후 현재 active 탭 기준으로 한번 redraw */
    if ($) {
        $(function () {
            ensureHooks();
            setTimeout(function () {
                menuDepDraw();
            }, 0);
        });
    }
})(window, document, window.jQuery);

/**
 * 로그아웃
 *
 * @author 70056
 * @since  2022.08.12
 * @version 1.0
 */
var ptComm = {
	logout : function() {
		comTx.ajax('/comm/cm/Logout.json', {}, function(ajaxObj, rstData){
			removeMenuDep();
			if(rstData.accessEnv === 'TBL') {
	    		location.href = '/cm/pt/comm/LoginViewTablet.do';
	    	} else if(rstData.accessEnv === 'MB') {
	    		location.href = '/cm/mo/comm/LoginViewMobile.do';
	    	} else {
	    		location.href = '/cm/pt/comm/LoginView.do';
	    	}
		}, {});
	},
	home : function() {
		removeMenuDep();
    	location.href = '/ma/pt/index.do';
	}
 }