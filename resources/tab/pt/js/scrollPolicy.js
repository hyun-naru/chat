(function(window, document, $){
    'use strict';

    var NS = window.TabHeaderScrollPolicy = window.TabHeaderScrollPolicy || {};

    var config = NS.config = NS.config || {
        /**
         * 탭활성화시 스크롤 위치를 저장 / 복원할 탭 아이디 기준.
         */
        keepTabKeys:{
            SD0101: true
        },

        /**
         *  keepTabKeys 에 등록된 탭 내부에서 특정화면 이동시에만 상단으로 보낼 modulekey 목록
         */
        topOnMoveKeys: {
            SD0101: {
                PSD02010200M: true
            }
        },
        debug: false
    };

    function log() {
        if(!config.debug || !window.console || typeof window.console.log !== 'function') {
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[TabHeaderScrollPolicy]');
        window.console.log.apply(window.console, args);
    }

    function warn(){
        if(!config.debug || !window.console || typeof window.console.warn !== 'function') {
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[TabHeaderScrollPolicy]');
        window.console.warn.apply(window.console, args);
    }

    function trim(value) {
        return String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
    }

    function addUnique(list, value){
        value = trim(value);
        if(value && list.indexOf(value) === -1){
            list.push(value);
        }
    }

    function normalizePolicyKey(value){
        var key = trim(value);

        key = key.replace(/^tab_/, '');

        key = key.replace(/_\d{10,}$/, '');

        return key;
    }

    function getRuntime(tabId){
        if(!tabId){
            return null;
        }
        
        try {
            if(typeof window.peekTabRuntime === 'function') {
                return window.peekTabRuntime(tabId);
            }
        } catch (e) {
            return null;
        }

        return window.TabRuntime && window.TabRuntime[tabId] ? window.TabRuntime[tabId] : null;
    }

    function getTabPolicyKeys(tabId){
        var keys = [];
        var baseKey;
        var runtime;

        addUnique(keys, tabId);

        baseKey = normalizePolicyKey(tabId);
        addUnique(keys, baseKey);
        addUnique(keys, baseKey ? 'tab_' + baseKey : '');

        runtime = getRuntime(tabId);
        if(runtime){
            addUnique(keys, runtime.moduleKey);
            addUnique(keys, normalizePolicyKey(runtime.moduleKey));
            addUnique(keys, runtime.entryType);
        }

        return keys;
    }

    function hasPolicyKey(map, keys) {
        var i;
        map = map || {};
        
        for(i = 0; i < keys.length; i+=1){
            if(map[keys[i]]) {
                return true;
            }
        }
        return false;
    }

    function isKeepTab(tabId) {
        return hasPolicyKey(config.keepTabKeys, getTabPolicyKeys(tabId));
    }

    function resolveScope(target){
        var $scope = $ ? $() : null;
        if(!$) {
            return null;
        }

        if(target && target.jquery) {
            $scope = target.closest('.content_tab');
            return $scope.length ? $scope.first() : target.first();
        }

        if(target) {
            try {
                if(typeof window.getTabScopeById === 'function') {
                    $scope = window.getTabScopeById(String(target));
                    if($scope && $scope.length) {
                        return $scope.first();
                    }
                }
            }catch(e) {

            }

            $scope = $('.tab_page_list .content_tab').filter(function() {
                return $(this).attr('data-id') === String(target);
            }).first();
        }

        if(!$scope || !$scope.length) {
            $scope = $('.tab_page_list .content_tab.active').first();
        }

        return $scope;
    }

    function getWindowScrollTop() {
        return  window.pageYOffset ||
            (document.documentElement && document.documentElement.scrollTop) ||
            (document.body && document.body.scrollTop) || 0;
    }

    function getTabsScrollTop() {
        if(!$) {
            return 0;
        }

        return ($('#tabs').scrollTop() || $('.tab_page_list').first().scrollTop() || 0);
    }

    function setTabsScrollTop(top){
        if(!$) {
            return;
        }

        top = Number(top) || 0;

        $('#tabs').scrollTop(top);
        $('.tab_page_list').first().scrollTop(top);
    }

    function readScrollPosition(tabId) {
        var $scope = resolveScope(tabId);
        var $container = $scope && $scope.length ? $scope.children('.container').first() : $();

        return {
            windowTop: getWindowScrollTop(),
            wrapperTop: $('#wrapper').scrollTop() || 0,
            contentTop: $('#content').scrollTop() || 0,
            tabsTop: getTabsScrollTop(),
            tabContsTop: $('#tab_conts').scrollTop() || 0,
            scopeTop: $scope && $scope.length ? ($scope.scrollTop() || 0) : 0,
            containerTop: $container && $container.length ? ($container.scrollTop() || 0) : 0
        };
    }

    function normalizePosition(position){
        position = position || {};
        return {
            windowTop: Number(position.windowTop) || 0,
            wrapperTop: Number(position.wrapperTop) || 0,
            contentTop: Number(position.contentTop) || 0,
            tabsTop: Number(position.tabsTop) || 0,
            tabContsTop: Number(position.tabContsTop) || 0,
            scopeTop: Number(position.scopeTop) || 0,
            containerTop: Number(position.containerTop) || 0
        };
    }

    function schedule(fn) {
        if(typeof window.runAfterNextPaint === 'function') {
            window.runAfterNextPaint(fn);
            return;
        }
        window.setTimeout(fn, 0);
    }

    function applyScrollPosition(target, position) {
        var pos = normalizePosition(position);

        function apply(){
            var $scope;
            var $container;

            try {
                if(typeof window.scrollTo === 'function') {
                    window.scrollTo(0, pos.windowTop);
                }

                $('html, body').stop(true, true).scrollTop(pos.windowTop);

                $('#wrapper').scrollTop(pos.wrapperTop);
                $('#content').scrollTop(pos.contentTop);
                setTabsScrollTop(pos.tabsTop);
                $('#tab_conts').scrollTop(pos.tabContsTop);

                $scope = resolveScope(target);
                if($scope && $scope.length) {
                    $scope.scrollTop(pos.scopeTop);

                    $container = $scope.children('.container').first();
                    if($container.length) {
                        $container.scrollTop(pos.containerTop);
                    }
                }
            } catch(e) {
                warn('scroll apply skipped', e);
            }
        }
    
        apply();
        schedule(apply);

        return pos;
    }

    function resetScrollTop(target) {
        return applyScrollPosition(target, {
            windowTop: 0,
            wrapperTop: 0,
            contentTop: 0,
            tabsTop: 0,
            tabContsTop: 0,
            scopeTop: 0,
            containerTop: 0
        });
    }

    function rememberScrollPosition(tabId, position){
        var runtime = getRuntime(tabId);

        if(!runtime) {
            return;
        }

        runtime.savedScrollPosition = normalizePosition(position);
        log('remember', tabId, runtime.savedScrollPosition);
    }

    function saveScrollTop(tabId){
        var runtime;

        if(!tabId) {
            return;
        }

        if(!isKeepTab(tabId)) {
            clearSavedScrollTop(tabId);
            return;
        }

        rememberScrollPosition(tabId,readScrollPosition(tabId));
    }

    function clearSavedScrollTop(tabId) {
        var runtime = getRuntime(tabId);
        if(runtime) {
            runtime.savedScrollPosition = null;
        }
    }

    function restoreOrResetScrollTop(tabId) {
        var runtime;

        if(!tabId) {
            return;
        }
        
        runtime = getRuntime(tabId);

        if(isKeepTab(tabId) && runtime && runtime.savedScrollPosition) {
            log('restore', tabId, runtime.savedScrollPosition);
            applyScrollPosition(tabId, runtime.savedScrollPosition);
            return;
        }

        log('reset',tabId);
        resetScrollTop(tabId);
    }

    function getUrlBaseName(targetUrl) {
        return trim(targetUrl).split('?')[0].split('#')[0].split('/').pop().replace(/\.(do|jsp)$/i, '');
    }

    function getMovePolicyKeys(moduleKey, targetUrl, paramData) {
        var keys = [];
        var expliciKey = paramData && paramData.__scrollKey;
        var urlBase = getUrlBaseName(targetUrl);

        addUnique(keys, moduleKey);
        addUnique(keys, normalizePolicyKey(moduleKey));

        addUnique(keys, expliciKey);
        addUnique(keys, normalizePolicyKey(expliciKey));

        addUnique(keys, urlBase);
        addUnique(keys, normalizePolicyKey(urlBase));

        return keys;
    }

    function getMoveTopMap(realTabId) {
        var tabKeys = getTabPolicyKeys(realTabId);

        var i;

        for(i = 0; i < tabKeys.length; i+=1) {
            if(config.topOnMoveKeys && config.topOnMoveKeys[tabKeys[i]]) {
                return config.topOnMoveKeys[tabKeys[i]];
            }
        }

        return (config.topOnMoveKeys && config.topOnMoveKeys['*']) || {};
    }

    function shouldResetTopAfterMove(realTabId, moduleKey, targetUrl, paramData) {
        var moveKeys;
        var moveTopMap;

        if(!isKeepTab(realTabId)) {
            return true;
        }

        moveTopMap = getMoveTopMap(realTabId);
        moveKeys = getMovePolicyKeys(moduleKey, targetUrl, paramData);

        return hasPolicyKey(moveTopMap, moveKeys);
    }

    NS.configure = function(nextConfig) {
        nextConfig = nextConfig || {};

        if(nextConfig.keepTabKeys) {
            config.keepTabKeys = nextConfig.keepTabKeys;
        }

        if(nextConfig.topOnMoveKeys) {
            config.topOnMoveKeys = nextConfig.topOnMoveKeys;
        }

        if(typeof nextConfig.debug !== 'undefined') {
            config.debug = !!nextConfig.debug;
        }

        return config;
    }

    NS.addKeepTabKey = function(key) {
        key = normalizePolicyKey(key);
        if(key) {
            config.keepTabKeys[key] = true;
        }
        return config.keepTabKeys;
    };

    NS.addMoveTopKey = function(tabKey, moveKey) {
        tabKey = normalizePolicyKey(tabKey);
        moveKey = normalizePolicyKey(moveKey);

        if(!tabKey || !moveKey) {
            return config.topOnMoveKeys;
        }

        config.topOnMoveKeys[tabKey] = config.topOnMoveKeys[tabKey] || {};
        config.topOnMoveKeys[tabKey][moveKey] = true;

        return config.topOnMoveKeys;
    };

    NS.normalizePolicyKey = normalizePolicyKey;
    NS.getTabPolicyKeys = getTabPolicyKeys;
    NS.getMovePolicyKeys = getMovePolicyKeys;
    NS.isKeepTab = isKeepTab;
    NS.save = saveScrollTop;
    NS.restoreOrReset = restoreOrResetScrollTop;
    NS.reset = resetScrollTop;
    NS.clear = clearSavedScrollTop;
    NS.shouldResetTopAfterMove = shouldResetTopAfterMove;

    NS.onBeforeActiveChange = function(prevTabId, nextTabId) {
        prevTabId = trim(prevTabId);
        nextTabId = trim(nextTabId);

        if(!prevTabId || prevTabId == nextTabId) {
            return;
        }

        saveScrollTop(prevTabId);
    }

    NS.onAfterActiveChange = function(activeTabId, prevTabId) {
        activeTabId = trim(activeTabId);
        prevTabId = trim(prevTabId);

        if(!activeTabId || activeTabId == prevTabId) {
            return;
        }

        restoreOrResetScrollTop(activeTabId);
    }

    NS.onAfterPageMove = function(realTabId, moduleKey, targetUrl, paramData, $scope){
        var topPosition;
        var resetTarget;

        if(paramData && typeof paramData.querySelector === 'function') {
            paramData = arguments[4];
            $scope = arguments[5];
        }

        if(!realTabId) {
            return;
        }

        if(shouldResetTopAfterMove(realTabId, moduleKey, targetUrl, paramData)) {
            clearSavedScrollTop(realTabId);

            resetTarget = $scope && $scope.length ? $scope : realTabId;
            topPosition = resetScrollTop(resetTarget);

            if(isKeepTab(realTabId)) {
                rememberScrollPosition(realTabId, topPosition);
            }

            log('move reset top', realTabId, moduleKey, targetUrl);
            return;
        }

        log('move keep current scroll', realTabId, moduleKey, targetUrl);
    };

})(window, document, window.jQuery || window.$);