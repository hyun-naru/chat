/* ------------------------------------------------------------------
 * 프로젝트 : 하나생명 NEW SFA 시스템 / TAB UI 개발 보조
 * 파 일 명 : tabHeader-dev-test-patch.js
 * 설   명 : TEST 탭 개발 헬퍼 내장형 패치 스크립트 (moduleKey 지원)
 * ------------------------------------------------------------------
 * 전체 기능 요약
 * - TEST 탭 shell DOM을 실제 tabHeader 구조로 직접 생성/재사용한다.
 * - 페이지 로딩은 movePage/addTab 대신 direct ajax + script chain 방식으로 수행한다.
 * - 필요 시 moduleKey 를 함께 받아 PageModules[moduleKey] 를 직접 실행한다.
 * - URL basename, 응답 내 #moduleId, 명시적 moduleKey 를 순서대로 module 후보로 본다.
 * - 콘솔에서 dtt(url, params, moduleKeyOrOptions, options) 로 호출할 수 있다.
 * ------------------------------------------------------------------*/
(function (global) {
    'use strict';

    var ROOT = global;
    var state = {
        lastRequest: null,
        config: {
            tabId: 'tab__DEV_TEST_TAB__',
            tabLabel: 'TEST',
            debug: false,
            method: 'auto',          // auto | GET | POST
            paramType: 'param',      // param | json
            useModule: true,
            moduleRetryCount: 20,
            moduleRetryDelay: 80,
            moveDelay: 30,
            requestTimeout: 30000
        }
    };

    function get$() {
        return ROOT.jQuery || ROOT.$ || null;
    }

    function log() {
        if (!state.config.debug || !ROOT.console || typeof ROOT.console.log !== 'function') return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[devTestTab]');
        ROOT.console.log.apply(ROOT.console, args);
    }

    function warn() {
        if (!ROOT.console || typeof ROOT.console.warn !== 'function') return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[devTestTab]');
        ROOT.console.warn.apply(ROOT.console, args);
    }

    function error() {
        if (!ROOT.console || typeof ROOT.console.error !== 'function') return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[devTestTab]');
        ROOT.console.error.apply(ROOT.console, args);
    }

    function setConfig(nextConfig) {
        if (nextConfig && typeof nextConfig === 'object') {
            state.config = Object.assign({}, state.config, nextConfig);
        }
        return Object.assign({}, state.config);
    }

    function hasParams(params) {
        if (!params) return false;
        if (typeof params !== 'object') return !!params;
        return Object.keys(params).length > 0;
    }

    function resolveMethod(params, options) {
        var method = (options && options.method) || state.config.method;
        if (method === 'GET' || method === 'POST') return method;
        return hasParams(params) ? 'POST' : 'GET';
    }

    function getTabWrap() {
        var $ = get$();
        return $ ? $('.tab_page_list').first() : null;
    }

    function getTabBar() {
        var $wrap = getTabWrap();
        return $wrap && $wrap.length ? $wrap.find('.tab_bar_item').first() : null;
    }

    function getTabCont() {
        var $wrap = getTabWrap();
        return $wrap && $wrap.length ? $wrap.find('#tab_conts').first() : null;
    }

    function getCheckList() {
        var $ = get$();
        return $ ? $('#tab_check_list').first() : null;
    }

    function findTestTab() {
        var $bar = getTabBar();
        return $bar && $bar.length ? $bar.find('li[data-id="' + state.config.tabId + '"]').first() : null;
    }

    function findTestContent() {
        var $cont = getTabCont();
        return $cont && $cont.length ? $cont.find('.content_tab[data-id="' + state.config.tabId + '"]').first() : null;
    }

    function findTestCheckItem() {
        var $list = getCheckList();
        return $list && $list.length ? $list.find('li[data-id="' + state.config.tabId + '"]').first() : null;
    }

    function ensureTabShell(url) {
        var $ = get$();
        if (!$) throw new Error('jQuery is required.');

        var $bar = getTabBar();
        var $cont = getTabCont();
        if (!$bar || !$bar.length || !$cont || !$cont.length) {
            throw new Error('tabHeader shell(.tab_page_list / .tab_bar_item / #tab_conts) not found.');
        }

        var $tab = findTestTab();
        if (!$tab || !$tab.length) {
            $tab = $(
                '<li data-id="' + state.config.tabId + '" data-url="' + (url || '') + '">' +
                    '<a href="javascript:void(0)"><span>' + state.config.tabLabel + '</span></a>' +
                    '<button class="btn_del" type="button"><span class="blind">삭제</span></button>' +
                '</li>'
            );
            $bar.append($tab);
        } else if (url) {
            $tab.attr('data-url', url);
        }

        var $scope = findTestContent();
        if (!$scope || !$scope.length) {
            $scope = $('<div class="content_tab" data-id="' + state.config.tabId + '" data-src="' + (url || '') + '"></div>');
            $cont.append($scope);
        } else if (url) {
            $scope.attr('data-src', url);
        }

        var $checkItem = findTestCheckItem();
        if ((!$checkItem || !$checkItem.length) && getCheckList() && getCheckList().length) {
            $checkItem = $(
                '<li data-id="' + state.config.tabId + '">' +
                    '<div class="chk_item">' +
                        '<input type="checkbox" id="chk_' + state.config.tabId + '" class="list_tab_check">' +
                        '<label for="chk_' + state.config.tabId + '"><span>' + state.config.tabLabel + '</span></label>' +
                    '</div>' +
                    '<button class="btn_del" type="button"><span class="blind">해당 탭 삭제</span></button>' +
                '</li>'
            );
            getCheckList().append($checkItem);
        }

        return { $tab: $tab, $scope: $scope, $checkItem: $checkItem };
    }

    function activateTestTab() {
        var $wrap = getTabWrap();
        var $tab = findTestTab();
        var $scope = findTestContent();
        if (!$wrap || !$wrap.length || !$tab || !$tab.length || !$scope || !$scope.length) {
            throw new Error('TEST tab shell not found.');
        }

        $wrap.find('.tab_bar_item > li').removeClass('active');
        $wrap.find('.content_tab').removeClass('active');

        $tab.addClass('active');
        $scope.addClass('active').show();

        if (typeof ROOT.setCurrentActiveTabId === 'function') {
            try { ROOT.setCurrentActiveTabId(state.config.tabId); } catch (e) { log('setCurrentActiveTabId skipped', e); }
        }
        if (typeof ROOT.updateTabArrow === 'function') {
            try { ROOT.updateTabArrow($wrap); } catch (e2) { log('updateTabArrow skipped', e2); }
        }
        if (ROOT.PTBreadcrumbRuntime && typeof ROOT.PTBreadcrumbRuntime.notifyTabActivated === 'function') {
            try { ROOT.PTBreadcrumbRuntime.notifyTabActivated(state.config.tabId); } catch (e3) { log('breadcrumb notify skipped', e3); }
        }

        var $scroll = $wrap.find('.tab_bar_items');
        if ($scroll.length && $tab[0]) {
            try { $scroll.animate({ scrollLeft: $tab[0].offsetLeft }, 150); } catch (e4) { log('scroll skipped', e4); }
        }
        return $scope;
    }

    function inferModuleKey(url, doc, explicitModuleKey) {
        if (explicitModuleKey) return explicitModuleKey;
        try {
            var input = doc && doc.querySelector ? doc.querySelector('#moduleId') : null;
            if (input && input.value) return input.value;
        } catch (e) {}
        var clean = ((url || '').split('?')[0].split('/').pop() || '').replace(/\.do$/i, '').replace(/\.jsp$/i, '');
        return clean || '';
    }

    function getRuntime(tabId) {
        if (typeof ROOT.getTabRuntime === 'function') {
            try { return ROOT.getTabRuntime(tabId); } catch (e) { return null; }
        }
        ROOT.TabRuntime = ROOT.TabRuntime || {};
        if (!ROOT.TabRuntime[tabId]) {
            ROOT.TabRuntime[tabId] = { loadSeq: 0, status: 'idle', xhr: null, moduleTimer: null, scriptPromise: null, moduleKey: '', entryType: 'devTestTab', requestUrl: '' };
        }
        return ROOT.TabRuntime[tabId];
    }

    function beginLoad(tabId) {
        if (typeof ROOT.beginTabLoad === 'function') {
            return ROOT.beginTabLoad(tabId);
        }
        var runtime = getRuntime(tabId);
        runtime.loadSeq += 1;
        runtime.status = 'loading';
        runtime.moduleKey = '';
        runtime.entryType = 'devTestTab';
        return runtime.loadSeq;
    }

    function isCurrent(tabId, loadSeq) {
        if (typeof ROOT.isCurrentTabLoad === 'function') {
            try { return ROOT.isCurrentTabLoad(tabId, loadSeq); } catch (e) { return true; }
        }
        var runtime = getRuntime(tabId);
        return !runtime || runtime.loadSeq === loadSeq;
    }

    function beginProgress(tabId, $scope) {
        if (typeof ROOT.beginTabProgress === 'function') {
            try { return ROOT.beginTabProgress(tabId, $scope); } catch (e) { return null; }
        }
        return null;
    }

    function refreshProgress(tabId, $scope, token) {
        if (typeof ROOT.refreshTabProgress === 'function') {
            try { ROOT.refreshTabProgress(tabId, $scope, token); } catch (e) { log('refreshProgress skipped', e); }
        }
    }

    function endProgress(tabId, token) {
        if (typeof ROOT.endTabProgress === 'function') {
            try { ROOT.endTabProgress(tabId, token); } catch (e) { log('endProgress skipped', e); }
        }
    }

    function afterPaint(fn) {
        if (typeof ROOT.runAfterNextPaint === 'function') {
            ROOT.runAfterNextPaint(fn);
            return;
        }
        ROOT.setTimeout(fn, 0);
    }

    function callUiInit($scope) {
        if (typeof ROOT.ui !== 'undefined' && ROOT.ui && typeof ROOT.ui.init === 'function') {
            try {
                var $target = $scope && $scope.length ? $scope : getTabWrap().find('.content_tab.active');
                if ($target && $target.length) {
                    $target.off();
                    $target.find('*').off();
                    ROOT.ui.init($target);
                }
            } catch (e) {
                warn('ui.init skipped', e);
            }
        }
    }

    function executeInlineScript(code, moduleKey, tabId, loadSeq, requestUrl) {
        if (!code || !String(code).trim()) return;
        try {
            if (typeof ROOT.executeInlineScriptIsolated === 'function') {
                ROOT.executeInlineScriptIsolated(String(code), {
                    phase: 'devTestTab.inline.execute',
                    tabId: tabId,
                    moduleKey: moduleKey,
                    loadSeq: loadSeq,
                    requestUrl: requestUrl,
                    entryType: 'devTestTab',
                    scriptType: 'inline'
                });
                return;
            }
            (new Function(String(code)))();
        } catch (e) {
            warn('inline script failed', e);
        }
    }

    function executeScriptsSequentially(scripts, moduleKey, tabId, loadSeq, requestUrl) {
        if (typeof ROOT.executeExtractedScriptsSequentially === 'function') {
            return ROOT.executeExtractedScriptsSequentially(scripts, moduleKey, tabId, loadSeq, requestUrl, 'devTestTab');
        }

        var chain = Promise.resolve();
        Array.prototype.forEach.call(scripts || [], function (oldScript) {
            chain = chain.then(function () {
                if (!isCurrent(tabId, loadSeq)) return;
                if (oldScript.src) {
                    return new Promise(function (resolve) {
                        var el = document.createElement('script');
                        el.src = oldScript.src;
                        el.async = false;
                        el.onload = resolve;
                        el.onerror = function () { warn('external script failed', oldScript.src); resolve(); };
                        document.head.appendChild(el);
                    });
                }
                executeInlineScript(oldScript.textContent || '', moduleKey, tabId, loadSeq, requestUrl);
            });
        });
        return chain;
    }

    function waitAndInvokeModule(moduleKey, $scope, paramData, meta) {
        if (!state.config.useModule || !moduleKey) {
            return Promise.resolve(false);
        }

        return new Promise(function (resolve) {
            var count = 0;
            function loop() {
                count += 1;
                var candidates = [moduleKey, state.config.tabId];
                var moduleFunc = null;
                if (ROOT.PageModules) {
                    for (var i = 0; i < candidates.length; i += 1) {
                        if (typeof ROOT.PageModules[candidates[i]] === 'function') {
                            moduleFunc = ROOT.PageModules[candidates[i]];
                            break;
                        }
                    }
                }

                if (typeof moduleFunc === 'function') {
                    log('module invoke', moduleKey, meta.tabId);
                    if (typeof ROOT.guardedInvokeModule === 'function') {
                        ROOT.guardedInvokeModule({
                            phase: 'devTestTab.PageModules.invoke',
                            tabId: meta.tabId,
                            moduleKey: moduleKey,
                            loadSeq: meta.loadSeq,
                            entryType: 'devTestTab',
                            requestUrl: meta.requestUrl,
                            $scope: $scope
                        }, moduleFunc, null, [$scope, paramData]).then(function () {
                            resolve(true);
                        }).catch(function (e) {
                            warn('module invoke failed', e);
                            resolve(false);
                        });
                        return;
                    }
                    try {
                        moduleFunc($scope, paramData);
                        resolve(true);
                        return;
                    } catch (e2) {
                        warn('module direct invoke failed', e2);
                        resolve(false);
                        return;
                    }
                }

                if (count >= state.config.moduleRetryCount) {
                    warn('module not found - skip', moduleKey);
                    resolve(false);
                    return;
                }
                ROOT.setTimeout(loop, state.config.moduleRetryDelay);
            }
            loop();
        });
    }

    function loadIntoScope($scope, url, params, options) {
        var $ = get$();
        if (!$ || !$scope || !$scope.length) {
            throw new Error('valid $scope is required');
        }

        var method = resolveMethod(params, options);
        var paramType = (options && options.paramType) || state.config.paramType;
        var tabId = state.config.tabId;
        var loadSeq = beginLoad(tabId);
        var runtime = getRuntime(tabId);
        var progressToken = beginProgress(tabId, $scope);
        var requestUrl = url;
        var request = {
            url: requestUrl,
            type: method,
            dataType: 'html',
            timeout: state.config.requestTimeout
        };

        runtime.entryType = 'devTestTab';
        runtime.requestUrl = requestUrl;
        runtime.moduleKey = '';
        runtime.status = 'loading';

        if (method === 'POST') {
            if (paramType === 'json') {
                request.contentType = 'application/json; charset=UTF-8';
                request.data = JSON.stringify(params || {});
            } else {
                request.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
                request.data = params || {};
            }
        } else {
            request.data = params || {};
        }

        log('direct load request', { url: requestUrl, method: method, paramType: paramType, params: params || {} });

        afterPaint(function () {
            if (!isCurrent(tabId, loadSeq)) {
                endProgress(tabId, progressToken);
                return;
            }

            refreshProgress(tabId, $scope, progressToken);
            runtime.xhr = $.ajax(request)
                .done(function (response) {
                    if (!isCurrent(tabId, loadSeq)) {
                        endProgress(tabId, progressToken);
                        return;
                    }

                    var fixedHtml = String(response || '').replace(/(src|href)=(['"])(\.\.\/\.\.\/)/g, '$1=$2/resources/pt/');
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(fixedHtml, 'text/html');
                    var scripts = doc.querySelectorAll('script');
                    var explicitModuleKey = options && options.moduleKey ? options.moduleKey : (typeof options === 'string' ? options : '');
                    var moduleKey = inferModuleKey(requestUrl, doc, explicitModuleKey);

                    runtime.moduleKey = moduleKey;
                    if (typeof ROOT.summarizeExtractedScripts === 'function') {
                        try { runtime.lastExtractedScripts = ROOT.summarizeExtractedScripts(scripts); } catch (ignore) {}
                    }
                    Array.prototype.forEach.call(scripts, function (s) { s.remove(); });

                    $scope.html(doc.body ? doc.body.innerHTML : fixedHtml);
                    $scope.data('loaded', true);
                    $scope.attr('data-src', requestUrl);
                    $scope.find('.header').remove();
                    runtime.status = 'rendered';

                    refreshProgress(tabId, $scope, progressToken);
                    callUiInit($scope);

                    afterPaint(function () {
                        if (!isCurrent(tabId, loadSeq)) {
                            endProgress(tabId, progressToken);
                            return;
                        }
                        runtime.scriptPromise = executeScriptsSequentially(scripts, moduleKey, tabId, loadSeq, requestUrl)
                            .then(function () {
                                runtime.status = 'scripts-loaded';
                                return waitAndInvokeModule(moduleKey, $scope, params || {}, {
                                    tabId: tabId,
                                    loadSeq: loadSeq,
                                    requestUrl: requestUrl
                                });
                            })
                            .then(function (invoked) {
                                runtime.status = invoked ? 'module-invoked' : 'ready';
                            })
                            .catch(function (e) {
                                runtime.status = 'ready';
                                warn('script chain failed', e);
                            })
                            .finally(function () {
                                endProgress(tabId, progressToken);
                            });
                    });
                })
                .fail(function (xhr, status, err) {
                    runtime.status = 'error';
                    runtime.lastError = err || status || 'ajax error';
                    endProgress(tabId, progressToken);
                    error('direct load failed', status, err, requestUrl);
                });
        });
    }

    function normalizeArgs(url, params, moduleKeyOrOptions, maybeOptions) {
        var options = {};
        if (typeof moduleKeyOrOptions === 'string') {
            options.moduleKey = moduleKeyOrOptions;
            if (maybeOptions && typeof maybeOptions === 'object') {
                options = Object.assign(options, maybeOptions);
            }
        } else if (moduleKeyOrOptions && typeof moduleKeyOrOptions === 'object') {
            options = Object.assign({}, moduleKeyOrOptions);
        }
        return { url: url, params: params || {}, options: options };
    }

    function openDevTestTab(url, params, moduleKeyOrOptions, maybeOptions) {
        if (!url) throw new Error('url is required');
        var normalized = normalizeArgs(url, params, moduleKeyOrOptions, maybeOptions);
        state.lastRequest = {
            url: normalized.url,
            params: normalized.params,
            options: Object.assign({}, normalized.options)
        };

        ensureTabShell(normalized.url);
        var $scope = activateTestTab();

        ROOT.setTimeout(function () {
            loadIntoScope($scope, normalized.url, normalized.params, normalized.options);
        }, state.config.moveDelay);

        return true;
    }

    function reloadDevTestTab() {
        if (!state.lastRequest) throw new Error('마지막 요청이 없습니다. 먼저 dtt()를 호출하세요.');
        return openDevTestTab(state.lastRequest.url, state.lastRequest.params, state.lastRequest.options);
    }

    function closeDevTestTab() {
        var $tab = findTestTab();
        var $scope = findTestContent();
        var $check = findTestCheckItem();
        if ($tab && $tab.length) $tab.remove();
        if ($scope && $scope.length) $scope.remove();
        if ($check && $check.length) $check.remove();

        if (typeof ROOT.cleanupTabModuleArtifacts === 'function') {
            try {
                ROOT.cleanupTabModuleArtifacts(state.config.tabId, { removeRuntime: true });
            } catch (e) {
                log('cleanup skipped', e);
            }
        }

        var $wrap = getTabWrap();
        if ($wrap && $wrap.length) {
            var $tabs = $wrap.find('.tab_bar_item > li');
            var $conts = $wrap.find('.content_tab');
            $tabs.removeClass('active');
            $conts.removeClass('active');
            if ($tabs.length) $tabs.eq(0).addClass('active');
            if ($conts.length) $conts.eq(0).addClass('active');
            if (typeof ROOT.setCurrentActiveTabId === 'function' && $tabs.length) {
                try { ROOT.setCurrentActiveTabId($tabs.eq(0).attr('data-id') || ''); } catch (ignore) {}
            }
        }
        return true;
    }

    function getState() {
        var runtime = null;
        try { runtime = typeof ROOT.peekTabRuntime === 'function' ? ROOT.peekTabRuntime(state.config.tabId) : getRuntime(state.config.tabId); } catch (e) { runtime = null; }
        return {
            config: Object.assign({}, state.config),
            lastRequest: state.lastRequest ? Object.assign({}, state.lastRequest) : null,
            tabPresent: !!(findTestTab() && findTestTab().length),
            scopePresent: !!(findTestContent() && findTestContent().length),
            runtimeStatus: runtime ? runtime.status : null,
            runtimeModuleKey: runtime ? runtime.moduleKey : null,
            runtimeError: runtime ? runtime.lastError : null
        };
    }

    ROOT.openDevTestTab = openDevTestTab;
    ROOT.reloadDevTestTab = reloadDevTestTab;
    ROOT.closeDevTestTab = closeDevTestTab;
    ROOT.getDevTestTabState = getState;
    ROOT.configureDevTestTab = setConfig;

    ROOT.dtt = openDevTestTab;
    ROOT.dttr = reloadDevTestTab;
    ROOT.dttx = closeDevTestTab;
    ROOT.dtts = getState;
    ROOT.dttc = setConfig;

})(window);
