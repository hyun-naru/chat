/*
 *
 *
 * 목적
 * - tabHeader JSP 안에 있던 탭 에러 진단/로그 관련 함수를 외부 JS로 분리합니다.
 * - tabHeader JSP는 loader/runtime/failTabLoad 실행 흐름만 소유하고,
 *   상세 객체 생성, 로그 저장, placeholder 렌더링, 콘솔 재출력은 이 파일이 담당합니다.
 * - v5의 안전 guard(resource error 필터링, 원본 Error 보관, 실제 파일:줄 재출력)를 유지합니다.
 *
 * 로컬 테스트용 설정
 * - window.TAB_HEADER_ERROR_DETAIL_ENABLED = true;  // 기본값, 상세 로그/placeholder 사용
 * - window.TAB_HEADER_ERROR_DETAIL_ENABLED = false; // 상세 로그/placeholder/global guard OFF
 */
/*
 * [함수 설명] 파일 전체를 즉시 실행 함수(IIFE)로 감싸 전역 오염을 막고, window/document만 명시적으로 주입합니다.
 */
(function (window, document) {
    'use strict';

    var NS = window.TabHeaderErrorDetail = window.TabHeaderErrorDetail || {};

    var evalErrors = NS._scriptEvalErrors = NS._scriptEvalErrors || {};
    var errorObjects = NS._errorObjects = NS._errorObjects || {};
    var errorSeq = NS._errorSeq || 0;

    NS.version = 'v6.0.0';

    /*
     * [함수 설명] 로컬 테스트 설정값(window.TAB_HEADER_ERROR_DETAIL_ENABLED)을 확인해 커스텀 에러 상세 기능 사용 여부를 반환합니다.
     */
    function isEnabled() {
        return window.TAB_HEADER_ERROR_DETAIL_ENABLED !== false;
    }

    /*
     * [함수 설명] 탭 에러 수집에 필요한 전역 context와 최근 로그 배열을 생성/보정합니다.
     * 이 함수가 선행되어야 activeLoaderMeta, activeInvokeMeta, __TAB_ERROR_LOG__가 안전하게 사용됩니다.
     */
    function ensureContext() {
        window.__TAB_ERROR_CONTEXT__ = window.__TAB_ERROR_CONTEXT__ || {
            activeInvokeMeta: null,
            activeLoaderMeta: null
        };

        if (typeof window.__TAB_ERROR_CONTEXT__.activeInvokeMeta === 'undefined') {
            window.__TAB_ERROR_CONTEXT__.activeInvokeMeta = null;
        }
        if (typeof window.__TAB_ERROR_CONTEXT__.activeLoaderMeta === 'undefined') {
            window.__TAB_ERROR_CONTEXT__.activeLoaderMeta = null;
        }

        window.__TAB_ERROR_LOG__ = window.__TAB_ERROR_LOG__ || [];
        return window.__TAB_ERROR_CONTEXT__;
    }

    ensureContext();

    /*
     * [함수 설명] null, undefined, 빈 문자열을 제외한 실제 값 존재 여부를 판단하는 작은 유틸입니다.
     */
    function hasValue(value) {
        return value !== null && typeof value !== 'undefined' && value !== '';
    }

    /*
     * [함수 설명] 상대경로/절대경로 차이를 줄이기 위해 script src를 브라우저 기준 절대 URL로 정규화합니다.
     */
    function normalizeSrc(src) {
        if (!src) return '';
        var a = document.createElement('a');
        a.href = src;
        return a.href;
    }

    /*
     * [함수 설명] script URL 비교 시 캐시 파라미터와 hash 때문에 다른 파일로 오인하지 않도록 query/hash를 제거합니다.
     */
    function stripQueryAndHash(src) {
        return normalizeSrc(src).replace(/[?#].*$/, '');
    }

    /*
     * [함수 설명] 두 script URL이 같은 파일인지 비교합니다.
     * 완전 일치와 query/hash 제거 후 일치를 모두 허용합니다.
     */
    function sameScriptUrl(a, b) {
        if (!a || !b) return false;
        var na = normalizeSrc(a);
        var nb = normalizeSrc(b);

        if (na === nb) return true;
        return stripQueryAndHash(na) === stripQueryAndHash(nb);
    }

    /*
     * [함수 설명] 에러 meta를 복사합니다.
     * $scope 같은 DOM/jQuery 참조는 에러 로그 객체에 싣지 않도록 제외합니다.
     */
    function cloneMeta(meta) {
        var cloned = {};
        meta = meta || {};

        /*
         * [함수 설명] cloneMeta에서 meta의 각 key를 순회하며 복사 대상 여부를 판단하는 콜백입니다.
         */
        Object.keys(meta).forEach(function (key) {
            if (key === '$scope') return;
            cloned[key] = meta[key];
        });

        return cloned;
    }

    /*
     * [함수 설명] 문자열, 일반 객체, rejection reason 등을 Error 객체로 정규화합니다.
     * 원본 값은 originalError에 보관해 추적 가능하게 합니다.
     */
    function normalizeError(error, fallbackMessage) {
        if (error instanceof Error) {
            return error;
        }

        var message = '';

        if (typeof error === 'string') {
            message = error;
        } else if (error && typeof error.message === 'string') {
            message = error.message;
        } else if (error && error.reason && typeof error.reason.message === 'string') {
            message = error.reason.message;
        }

        var normalized = new Error(message || fallbackMessage || 'Unknown tab error');
        normalized.originalError = error || null;

        if (error && typeof error === 'object' && error.stack) {
            normalized.stack = error.stack;
        }

        return normalized;
    }

    /*
     * [함수 설명] Error 객체에 탭/스크립트/단계 meta를 붙입니다.
     * 실제 원인 meta가 wrapper 단계 meta에 덮이지 않도록 root-cause 필드를 우선 보존합니다.
     */
    function attachMeta(error, meta, fallbackMessage) {
        var normalized = normalizeError(error, fallbackMessage);
        normalized.__tabErrorMeta = normalized.__tabErrorMeta || {};

        var cloned = cloneMeta(meta || {});

        /*
         * root-cause meta가 scriptChain/failTabLoad wrapper meta에 덮이지 않도록 보존합니다.
         * 예: phase=script.external.load, filename/lineno/colno는 wrapper보다 우선합니다.
         */
        var rootCauseKeys = {
            phase: true,
            scriptType: true,
            scriptSrc: true,
            inlineScriptIndex: true,
            totalScriptCount: true,
            filename: true,
            lineno: true,
            colno: true,
            errorKind: true,
            eventTargetTag: true,
            eventTargetSrc: true,
            nativeMessage: true
        };

        /*
         * [함수 설명] attachMeta에서 incoming meta를 Error의 기존 meta와 병합하는 key 순회 콜백입니다.
         */
        Object.keys(cloned).forEach(function (key) {
            var current = normalized.__tabErrorMeta[key];
            var incoming = cloned[key];

            if (key === 'phase' && current && incoming && current !== incoming) {
                normalized.__tabErrorMeta.wrapperPhase = incoming;
                return;
            }

            if (rootCauseKeys[key] && current != null && current !== '') {
                return;
            }

            if (current == null || current === '' || (incoming != null && incoming !== '')) {
                normalized.__tabErrorMeta[key] = incoming;
            }
        });

        return normalized;
    }

    /*
     * [함수 설명] 현재 탭 에러 context를 반환합니다.
     * 호출 시 context가 없으면 ensureContext를 통해 자동 보정합니다.
     */
    function getContext() {
        return ensureContext();
    }

    /*
     * [함수 설명] 현재 실행 중인 loader 또는 PageModules invoke meta를 반환합니다.
     * 외부 script 실행 중이면 activeLoaderMeta를 우선 사용합니다.
     */
    function getActiveMeta() {
        var ctx = getContext();
        return ctx.activeLoaderMeta || ctx.activeInvokeMeta || null;
    }

    /*
     * [함수 설명] 에러 메시지/stack/script 목록을 HTML placeholder에 안전하게 표시하기 위해 특수문자를 escape합니다.
     */
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /*
     * [함수 설명] tabHeader JSP에 있는 normalizeTabScriptSrc가 있으면 그 경로를 우선 사용하고, 없으면 이 파일의 normalizeSrc로 대체합니다.
     */
    function normalizeScriptSrc(src) {
        if (typeof window.normalizeTabScriptSrc === 'function') {
            return window.normalizeTabScriptSrc(src);
        }
        return normalizeSrc(src);
    }

    /*
     * [함수 설명] 응답 HTML에서 적출한 script 목록을 요약합니다.
     * 총 script 수, inline 수, external src 목록을 에러 상세에 남기는 용도입니다.
     */
    function summarizeExtractedScripts(scripts) {
        var summary = {
            total: 0,
            inlineCount: 0,
            external: []
        };

        /*
         * [함수 설명] 적출된 script NodeList를 순회하며 external/inline 개수를 집계하는 콜백입니다.
         */
        Array.prototype.forEach.call(scripts || [], function (oldScript) {
            summary.total += 1;

            if (oldScript && oldScript.src) {
                summary.external.push(normalizeScriptSrc(oldScript.src));
                return;
            }

            var scriptText = oldScript ? String(oldScript.textContent || '').trim() : '';
            if (scriptText) {
                summary.inlineCount += 1;
            }
        });

        return summary;
    }

    /*
     * [함수 설명] script 요약 객체를 화면 placeholder와 콘솔에서 읽기 좋은 여러 줄 텍스트로 변환합니다.
     */
    function buildExtractedScriptSummaryText(summary) {
        if (!summary || typeof summary !== 'object') {
            return '';
        }

        var lines = [];
        lines.push('총 script 수: ' + (summary.total || 0));
        lines.push('inline script 수: ' + (summary.inlineCount || 0));

        if (summary.external && summary.external.length) {
            lines.push('external script 목록:');
            /*
             * [함수 설명] external script 목록을 사람이 읽을 수 있는 번호付き 텍스트로 변환하는 콜백입니다.
             */
            summary.external.forEach(function (src, index) {
                lines.push('  ' + (index + 1) + '. ' + src);
            });
        }

        return lines.join('\n');
    }

    /*
     * [함수 설명] filename, lineno, colno를 조합해 브라우저 위치 문자열(file:line:col)을 만듭니다.
     */
    function buildLocationText(detail) {
        if (!detail) return '';

        var fileText = detail.filename || '';
        var lineText = detail.lineno ? ':' + detail.lineno : '';
        var colText = detail.colno ? ':' + detail.colno : '';

        return fileText ? (fileText + lineText + colText) : '';
    }

    /*
     * [함수 설명] 탭 runtime을 조회만 합니다.
     * 없으면 새로 만들지 않아 detail 생성 중 불필요한 runtime 생성을 막습니다.
     */
    function peekRuntime(tabId) {
        if (!tabId) return null;
        if (typeof window.peekTabRuntime === 'function') {
            return window.peekTabRuntime(tabId);
        }
        return window.TabRuntime && window.TabRuntime[tabId] ? window.TabRuntime[tabId] : null;
    }

    /*
     * [함수 설명] 탭 에러 화면과 콘솔 로그에 사용할 최종 detail 객체를 생성합니다.
     * runtime 문맥, root-cause meta, 실제 파일 위치, 적출 script 목록을 하나로 합칩니다.
     */
    function buildDetail(meta, error) {
        var mergedMeta = cloneMeta(meta || {});
        var normalizedError = normalizeError(error, 'tab load error');
        var attachedMeta = normalizedError.__tabErrorMeta ? cloneMeta(normalizedError.__tabErrorMeta) : {};

        var rootCauseDetailKeys = {
            phase: true,
            scriptType: true,
            scriptSrc: true,
            inlineScriptIndex: true,
            totalScriptCount: true,
            filename: true,
            lineno: true,
            colno: true,
            errorKind: true,
            wrapperPhase: true,
            eventTargetTag: true,
            eventTargetSrc: true,
            nativeMessage: true
        };

        /*
         * [함수 설명] Error에 붙어 있던 root-cause meta를 최종 detail meta로 병합하는 콜백입니다.
         */
        Object.keys(attachedMeta).forEach(function (key) {
            if (rootCauseDetailKeys[key] && attachedMeta[key] != null && attachedMeta[key] !== '') {
                mergedMeta[key] = attachedMeta[key];
                return;
            }

            if (mergedMeta[key] == null || mergedMeta[key] === '') {
                mergedMeta[key] = attachedMeta[key];
            }
        });

        var runtime = mergedMeta.tabId ? peekRuntime(mergedMeta.tabId) : null;
        var extractedSummary = runtime && runtime.lastExtractedScripts ? runtime.lastExtractedScripts : null;
        var inlineIndex = (typeof mergedMeta.inlineScriptIndex === 'number') ? (mergedMeta.inlineScriptIndex + 1) : '';
        var totalScriptCount = (typeof mergedMeta.totalScriptCount === 'number') ? mergedMeta.totalScriptCount : '';

        var detail = {
            time: new Date().toISOString(),
            tabId: mergedMeta.tabId || '',
            loadSeq: mergedMeta.loadSeq,
            phase: mergedMeta.phase || '',
            entryType: mergedMeta.entryType || (runtime && runtime.entryType) || '',
            moduleKey: mergedMeta.moduleKey || (runtime && runtime.moduleKey) || '',
            requestUrl: mergedMeta.requestUrl || (runtime && runtime.requestUrl) || '',
            tabTitle: mergedMeta.tabTitle || (runtime && runtime.tabTitle) || '',
            scriptType: mergedMeta.scriptType || '',
            scriptSrc: mergedMeta.scriptSrc || '',
            inlineScriptIndex: inlineIndex,
            totalScriptCount: totalScriptCount,
            filename: mergedMeta.filename || '',
            lineno: mergedMeta.lineno || '',
            colno: mergedMeta.colno || '',
            errorKind: mergedMeta.errorKind || '',
            wrapperPhase: mergedMeta.wrapperPhase || '',
            eventTargetTag: mergedMeta.eventTargetTag || '',
            eventTargetSrc: mergedMeta.eventTargetSrc || '',
            nativeMessage: mergedMeta.nativeMessage || '',
            message: normalizedError.message || '',
            stack: normalizedError.stack || '',
            extractedScriptsText: buildExtractedScriptSummaryText(extractedSummary)
        };

        detail.locationText = buildLocationText(detail);
        detail.actualFile = detail.filename || detail.scriptSrc || detail.eventTargetSrc || '';
        detail.actualLocationText = detail.locationText || detail.actualFile || '';
        return detail;
    }

    /*
     * [함수 설명] 생성된 에러 detail을 최근 로그 배열(__TAB_ERROR_LOG__)에 저장합니다.
     * 최대 50개만 유지하고 기능 OFF 상태에서는 저장하지 않습니다.
     */
    function pushDetail(detail) {
        if (!detail) return;
        if (!isEnabled()) return;

        window.__TAB_ERROR_LOG__ = window.__TAB_ERROR_LOG__ || [];
        window.__TAB_ERROR_LOG__.unshift(detail);

        if (window.__TAB_ERROR_LOG__.length > 50) {
            window.__TAB_ERROR_LOG__ = window.__TAB_ERROR_LOG__.slice(0, 50);
        }
    }

    /*
     * [함수 설명] 에러 placeholder의 한 줄 항목(li)을 생성합니다.
     * 값이 없으면 빈 문자열을 반환해 화면에 불필요한 줄이 나오지 않게 합니다.
     */
    function buildRow(label, value) {
        if (value == null || value === '') {
            return '';
        }

        return '<li style="margin-top:4px;">'
            + '<strong style="display:inline-block; min-width:110px; color:#444;">' + escapeHtml(label) + '</strong>'
            + '<span style="color:#222;">' + escapeHtml(value) + '</span>'
            + '</li>';
    }

    /*
     * [함수 설명] tabId로 현재 탭의 content scope를 다시 찾습니다.
     * JSP의 getTabScopeByTabId가 있으면 우선 사용합니다.
     */
    function findScopeByTabId(tabId) {
        if (!tabId) return null;
        if (typeof window.getTabScopeByTabId === 'function') {
            return window.getTabScopeByTabId(tabId);
        }
        if (window.jQuery) {
            return window.jQuery('.tab_page_list').find('.content_tab[data-id="' + tabId + '"]').first();
        }
        return null;
    }

    /*
     * [함수 설명] 탭 실패 시 해당 content_tab에만 에러 placeholder를 렌더링합니다.
     * 다른 탭은 건드리지 않고 detail/stack/script 목록/콘솔 재출력 버튼을 표시합니다.
     */
    function renderError(meta) {
        if (!isEnabled()) {
            return;
        }

        var tabId = meta && meta.tabId ? meta.tabId : '';
        var $scope = meta && meta.$scope && meta.$scope.length ? meta.$scope : findScopeByTabId(tabId);
        var detail = meta && meta.detail ? meta.detail : null;

        if (!$scope || !$scope.length) return;

        $scope.data('loaded', false);
        $scope.html(
            '<div class="tab-error-wrap" style="padding:20px;">' +
                '<p style="color:red; font-weight:bold;">화면 처리 중 오류가 발생했습니다.</p>' +
                '<p style="margin-top:8px; color:#666;">현재 탭만 격리 처리했습니다. 다른 탭은 계속 사용할 수 있습니다.</p>' +
                (detail ?
                    '<div style="margin-top:14px; padding:12px; border:1px solid #e0e0e0; background:#fafafa; border-radius:6px;">' +
                        '<p style="margin:0 0 8px; font-weight:bold; color:#333;">탭 에러 상세</p>' +
                        '<ul style="margin:0; padding:0; list-style:none; font-size:12px; line-height:1.6;">' +
                            buildRow('탭 ID', detail.tabId) +
                            buildRow('탭 제목', detail.tabTitle) +
                            buildRow('진입 경로', detail.entryType) +
                            buildRow('단계', detail.phase) +
                            buildRow('wrapper 단계', detail.wrapperPhase) +
                            buildRow('원인 구분', detail.errorKind) +
                            buildRow('모듈 키', detail.moduleKey) +
                            buildRow('요청 JSP/URL', detail.requestUrl) +
                            buildRow('스크립트 유형', detail.scriptType) +
                            buildRow('스크립트 파일', detail.scriptSrc) +
                            buildRow('inline script', detail.inlineScriptIndex && detail.totalScriptCount ? (detail.inlineScriptIndex + ' / ' + detail.totalScriptCount) : '') +
                            buildRow('실제 위치', detail.actualLocationText) +
                            buildRow('브라우저 위치', detail.locationText) +
                            buildRow('이벤트 대상', detail.eventTargetTag && detail.eventTargetSrc ? (detail.eventTargetTag + ' ' + detail.eventTargetSrc) : '') +
                            buildRow('에러 메시지', detail.message) +
                        '</ul>' +
                        (detail.logId ?
                            '<div style="margin-top:10px;">' +
                                '<button type="button" class="btn small js-tab-error-print" data-tab-error-print="Y" data-tab-error-log-id="' + escapeHtml(detail.logId) + '">원본 에러 콘솔 재출력</button>' +
                                '<span style="margin-left:8px; font-size:11px; color:#777;">DevTools 콘솔에 다시 찍힌 stack의 파일:줄을 클릭하세요.</span>' +
                            '</div>' : '') +
                        (detail.stack ?
                            '<details style="margin-top:10px;">' +
                                '<summary style="cursor:pointer; color:#333;">stack 보기</summary>' +
                                '<pre style="margin-top:8px; padding:10px; background:#fff; border:1px solid #eee; overflow:auto; white-space:pre-wrap; word-break:break-all;">' + escapeHtml(detail.stack) + '</pre>' +
                            '</details>' : '') +
                        (detail.extractedScriptsText ?
                            '<details style="margin-top:10px;">' +
                                '<summary style="cursor:pointer; color:#333;">현재 JSP에서 적출한 script 목록</summary>' +
                                '<pre style="margin-top:8px; padding:10px; background:#fff; border:1px solid #eee; overflow:auto; white-space:pre-wrap; word-break:break-all;">' + escapeHtml(detail.extractedScriptsText) + '</pre>' +
                            '</details>' : '') +
                    '</div>'
                : '') +
            '</div>'
        );
    }

    /*
     * [함수 설명] window error 이벤트의 target 정보를 추출합니다.
     * resource error인지 판단하기 위해 tagName과 src/href를 함께 수집합니다.
     */
    function getTargetInfo(event) {
        var target = event && (event.target || event.srcElement);
        var tagName = '';
        var src = '';

        if (target && target !== window && target !== document) {
            tagName = String(target.tagName || target.nodeName || '').toUpperCase();
            src = target.src || target.href || target.currentSrc || '';
        }

        return {
            target: target,
            tagName: tagName,
            src: src ? normalizeSrc(src) : '',
            isElementTarget: !!(target && target !== window && target !== document)
        };
    }

    /*
     * [함수 설명] img/link 등 일반 resource load error인지 판별합니다.
     * 이 경우 JS 실행 오류가 아니므로 탭 격리 대상에서 제외합니다.
     */
    function isResourceErrorEvent(event) {
        var targetInfo = getTargetInfo(event);
        return targetInfo.isElementTarget && !event.error && !event.message && !event.filename;
    }

    /*
     * [함수 설명] Error 객체의 stack 문자열을 안전하게 반환합니다.
     */
    function getErrorStack(error) {
        return error && error.stack ? String(error.stack) : '';
    }

    /*
     * [함수 설명] stack trace 안에 현재 active script src가 포함되어 있는지 검사합니다.
     * query/hash 차이를 고려해 비교합니다.
     */
    function stackContainsScript(stack, scriptSrc) {
        if (!stack || !scriptSrc) return false;
        var normalized = normalizeSrc(scriptSrc);
        var stripped = stripQueryAndHash(scriptSrc);
        return stack.indexOf(normalized) !== -1 || stack.indexOf(stripped) !== -1;
    }

    /*
     * [함수 설명] 전역 error가 현재 로딩 중인 script에서 발생한 것인지 확인합니다.
     * 다른 resource/window error를 active script 오류로 오인하지 않기 위한 guard입니다.
     */
    function sourceMatchesActiveScript(activeMeta, eventOrReason) {
        activeMeta = activeMeta || {};

        var activeSrc = activeMeta.scriptSrc || '';
        if (!activeSrc) return true;

        var filename = eventOrReason && eventOrReason.filename ? eventOrReason.filename : '';
        if (filename && sameScriptUrl(filename, activeSrc)) return true;

        var error = eventOrReason && eventOrReason.error ? eventOrReason.error : eventOrReason;
        if (stackContainsScript(getErrorStack(error), activeSrc)) return true;

        return false;
    }

    /*
     * [함수 설명] window error 이벤트에서 filename/lineno/colno/message/target 정보를 꺼내 active meta에 보강합니다.
     */
    function enrichMetaFromWindowError(activeMeta, event, kind) {
        var meta = cloneMeta(activeMeta || {});
        var targetInfo = getTargetInfo(event);

        meta.phase = meta.phase || 'window.error';
        meta.errorKind = kind || 'javascript-runtime-error';
        meta.filename = event && event.filename || meta.filename || '';
        meta.lineno = event && event.lineno || meta.lineno || '';
        meta.colno = event && event.colno || meta.colno || '';
        meta.nativeMessage = event && event.message || '';

        if (targetInfo.tagName) meta.eventTargetTag = targetInfo.tagName;
        if (targetInfo.src) meta.eventTargetSrc = targetInfo.src;

        return meta;
    }

    /*
     * [함수 설명] window error 이벤트에서 native Error 객체를 우선 꺼내고, 없으면 메시지 기반 Error를 생성합니다.
     */
    function createErrorFromWindowError(event, fallbackMessage) {
        if (event && event.error instanceof Error) {
            return event.error;
        }

        var message = event && event.message ? event.message : (fallbackMessage || 'javascript error');
        return new Error(message);
    }

    /*
     * [함수 설명] external script가 onload되기 전 평가 중 발생한 JS runtime error를 임시 저장합니다.
     * onload 시점에 consume하여 loader promise reject로 연결합니다.
     */
    function recordScriptEvaluationError(src, error, meta) {
        var key = normalizeSrc(src || (meta && meta.scriptSrc) || '');
        if (!key) return error;

        evalErrors[key] = {
            error: error,
            meta: cloneMeta(meta || {}),
            time: Date.now()
        };

        return error;
    }

    /*
     * [함수 설명] recordScriptEvaluationError로 저장된 script 평가 오류를 꺼내고 저장소에서 제거합니다.
     * 정확한 src가 안 맞으면 query/hash 제거 비교로 한 번 더 찾습니다.
     */
    function consumeScriptEvaluationError(src, fallbackMeta) {
        var key = normalizeSrc(src || '');
        var hit = key ? evalErrors[key] : null;

        if (!hit && key) {
            var stripped = stripQueryAndHash(key);
            /*
             * [함수 설명] 정확한 src가 없을 때 query/hash 제거 기준으로 저장된 평가 오류를 찾는 콜백입니다.
             */
            Object.keys(evalErrors).some(function (candidate) {
                if (stripQueryAndHash(candidate) === stripped) {
                    hit = evalErrors[candidate];
                    delete evalErrors[candidate];
                    return true;
                }
                return false;
            });
        } else if (hit) {
            delete evalErrors[key];
        }

        if (!hit) return null;

        var meta = cloneMeta(hit.meta || {});
        var fallback = cloneMeta(fallbackMeta || {});
        /*
         * [함수 설명] 평가 오류 meta에 fallback meta의 누락 값을 보충하는 콜백입니다.
         */
        Object.keys(fallback).forEach(function (keyName) {
            if (!hasValue(meta[keyName])) {
                meta[keyName] = fallback[keyName];
            }
        });

        return attachMeta(hit.error, meta, 'external script evaluation error');
    }

    /*
     * [함수 설명] 탭 격리 대상이 아닌 resource error를 콘솔 경고로만 남깁니다.
     * 실제 화면 로딩은 계속 진행되게 합니다.
     */
    function logIgnoredResourceError(event, activeMeta) {
        var targetInfo = getTargetInfo(event);
        var message = '[tabHeader] resource error는 탭 격리 대상에서 제외 : ' + (targetInfo.tagName || 'element') + ' ' + (targetInfo.src || '');

        if (window.console && console.warn) {
            console.warn(message, {
                activeMeta: cloneMeta(activeMeta || {}),
                targetTag: targetInfo.tagName,
                targetSrc: targetInfo.src
            });
        }
    }

    /*
     * [함수 설명] 현재 active script와 출처가 다른 window error를 콘솔 경고로만 남깁니다.
     */
    function logIgnoredUnrelatedError(event, activeMeta) {
        if (window.console && console.warn) {
            console.warn('[tabHeader] active script와 출처가 다른 window error는 탭 격리 제외 : ', {
                activeScriptSrc: activeMeta && activeMeta.scriptSrc || '',
                eventFilename: event && event.filename || '',
                eventMessage: event && event.message || ''
            });
        }
    }

    /*
     * [함수 설명] 브라우저 전역 error 이벤트를 처리합니다.
     * resource/unrelated error는 제외하고 실제 active script 또는 module 오류만 failTabLoad 흐름으로 보냅니다.
     */
    function handleWindowError(event) {
        if (!isEnabled()) {
            return false;
        }

        var activeMeta = getActiveMeta();

        if (!activeMeta) {
            return false;
        }

        if (isResourceErrorEvent(event)) {
            logIgnoredResourceError(event, activeMeta);
            return false;
        }

        if (activeMeta.phase === 'script.external.load' && !sourceMatchesActiveScript(activeMeta, event)) {
            logIgnoredUnrelatedError(event, activeMeta);
            return false;
        }

        var meta = enrichMetaFromWindowError(activeMeta, event, 'javascript-runtime-error');
        var error = attachMeta(createErrorFromWindowError(event, event && event.message || 'javascript error'), meta, 'javascript error');

        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        if (activeMeta.phase === 'script.external.load') {
            recordScriptEvaluationError(meta.scriptSrc, error, meta);
            return true;
        }

        if (typeof window.failTabLoad === 'function') {
            window.failTabLoad(cloneMeta(meta), error);
            return true;
        }

        return false;
    }

    /*
     * [함수 설명] unhandledrejection의 reason stack이 현재 external script와 관련 있는지 확인합니다.
     */
    function reasonMatchesActiveScript(activeMeta, reason) {
        if (!activeMeta || activeMeta.phase !== 'script.external.load') return true;
        if (!activeMeta.scriptSrc) return true;

        return stackContainsScript(getErrorStack(reason), activeMeta.scriptSrc);
    }

    /*
     * [함수 설명] 브라우저 전역 unhandledrejection 이벤트를 처리합니다.
     * 현재 탭 loader/module 문맥과 관련된 rejection만 탭 실패로 연결합니다.
     */
    function handleUnhandledRejection(event) {
        if (!isEnabled()) {
            return false;
        }

        var activeMeta = getActiveMeta();
        var reason = event && event.reason;

        if (!activeMeta) {
            return false;
        }

        if (activeMeta.phase === 'script.external.load' && !reasonMatchesActiveScript(activeMeta, reason)) {
            if (window.console && console.warn) {
                console.warn('[tabHeader] active script와 출처가 불명확한 unhandledrejection은 탭 격리 제외 : ', reason);
            }
            return false;
        }

        var meta = cloneMeta(activeMeta);
        meta.phase = meta.phase || 'window.unhandledrejection';
        meta.errorKind = 'unhandledrejection';

        var error = attachMeta(reason instanceof Error ? reason : new Error((reason && reason.message) || String(reason || 'unhandledrejection')), meta, 'unhandledrejection');

        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        if (activeMeta.phase === 'script.external.load') {
            recordScriptEvaluationError(meta.scriptSrc, error, meta);
            return true;
        }

        if (typeof window.failTabLoad === 'function') {
            window.failTabLoad(cloneMeta(meta), error);
            return true;
        }

        return false;
    }

    /*
     * [함수 설명] inline script에 붙일 가상 sourceURL 이름을 만듭니다.
     * DevTools에서 inline script 오류를 탭/모듈/순번 기준으로 식별하기 위한 용도입니다.
     */
    function makeInlineSourceURL(meta) {
        meta = meta || {};
        var index = typeof meta.inlineScriptIndex === 'number' ? meta.inlineScriptIndex + 1 : (typeof meta.scriptIndex === 'number' ? meta.scriptIndex + 1 : 'unknown');
        var tabId = String(meta.tabId || 'tab').replace(/[^a-zA-Z0-9_\-]/g, '_');
        var moduleKey = String(meta.moduleKey || 'module').replace(/[^a-zA-Z0-9_\-]/g, '_');
        return 'tabHeader-inline/' + tabId + '/' + moduleKey + '/inline-' + index + '.js';
    }

    /*
     * [함수 설명] inline script 텍스트 끝에 sourceURL을 추가합니다.
     * 이미 sourceURL이 있으면 중복으로 붙이지 않습니다.
     */
    function appendInlineSourceURL(scriptText, meta) {
        var text = String(scriptText || '');
        if (/\/\/[#@]\s*sourceURL\s*=/.test(text)) {
            return text;
        }
        return text + '\n//# sourceURL=' + makeInlineSourceURL(meta);
    }

    /*
     * [함수 설명] 원본 Error 객체를 logId 기준으로 보관합니다.
     * placeholder 버튼이나 printTabErrorDetail에서 native stack을 다시 콘솔에 찍기 위한 저장소입니다.
     */
    function storeErrorObject(detail, error) {
        if (!detail) return '';

        errorSeq += 1;
        NS._errorSeq = errorSeq;

        var id = detail.logId || ('TABERR_' + Date.now() + '_' + errorSeq);
        detail.logId = id;

        if (error) {
            errorObjects[id] = error;
            detail.hasNativeError = true;
        }

        return id;
    }

    /*
     * [함수 설명] 최근 탭 에러 로그 배열의 복사본을 반환합니다.
     * 외부에서 원본 배열을 직접 수정하지 않도록 slice를 사용합니다.
     */
    function getErrorLog() {
        return (window.__TAB_ERROR_LOG__ || []).slice();
    }

    /*
     * [함수 설명] logId에 해당하는 에러 detail을 찾습니다.
     * logId가 없으면 가장 최근 에러를 반환합니다.
     */
    function findDetail(logId) {
        var list = window.__TAB_ERROR_LOG__ || [];
        if (!logId && list.length) return list[0];

        for (var i = 0; i < list.length; i += 1) {
            if (list[i] && list[i].logId === logId) {
                return list[i];
            }
        }
        return null;
    }

    /*
     * [함수 설명] 특정 에러 detail과 원본 Error를 DevTools 콘솔에 다시 출력합니다.
     * 콘솔의 파일:줄 링크를 클릭해 실제 원인 위치로 이동하기 쉽게 합니다.
     */
    function printErrorDetail(logId) {
        var detail = findDetail(logId);
        if (!detail) {
            console.warn('[tabHeader] 출력할 탭 에러 상세가 없습니다 : ', logId || '(latest)');
            return null;
        }

        var error = errorObjects[detail.logId];
        var title = '[tabHeader] 탭 에러 상세 재출력 - ' + (detail.tabId || '') + ' / ' + (detail.moduleKey || '');

        if (console.group) console.group(title);
        console.table ? console.table([{
            time: detail.time || '',
            tabId: detail.tabId || '',
            phase: detail.phase || '',
            wrapperPhase: detail.wrapperPhase || '',
            errorKind: detail.errorKind || '',
            moduleKey: detail.moduleKey || '',
            requestUrl: detail.requestUrl || '',
            scriptSrc: detail.scriptSrc || '',
            actualLocation: detail.actualLocationText || detail.locationText || '',
            message: detail.message || ''
        }]) : console.log(detail);

        if (detail.actualLocationText || detail.locationText) {
            console.error('[tabHeader] 원인 위치 : ' + (detail.actualLocationText || detail.locationText));
        }

        if (error) {
            console.error(error);
        } else if (detail.stack) {
            console.error(detail.stack);
        }

        if (console.groupEnd) console.groupEnd();
        return detail;
    }

    /*
     * [함수 설명] 최근 탭 에러 로그를 console.table 형태로 요약 출력합니다.
     */
    function printErrorLog() {
        /*
         * [함수 설명] 에러 로그 detail 배열을 console.table에 적합한 요약 row 배열로 변환하는 콜백입니다.
         */
        var list = getErrorLog().map(function (item) {
            return {
                logId: item.logId || '',
                time: item.time || '',
                tabId: item.tabId || '',
                phase: item.phase || '',
                wrapperPhase: item.wrapperPhase || '',
                errorKind: item.errorKind || '',
                moduleKey: item.moduleKey || '',
                requestUrl: item.requestUrl || '',
                scriptSrc: item.scriptSrc || '',
                actualLocation: item.actualLocationText || item.locationText || '',
                message: item.message || ''
            };
        });

        if (console.table) {
            console.table(list);
        } else {
            console.log('[tabHeader] 최근 탭 에러 로그 : ', list);
        }

        return list;
    }

    /*
     * [함수 설명] 전역 error/unhandledrejection handler와 콘솔 조회 API를 설치합니다.
     * 기능 OFF 또는 이미 설치된 경우 중복 설치하지 않습니다.
     */
    function installGlobalHandlers() {
        window.getTabErrorLog = getErrorLog;
        window.printTabErrorDetail = printErrorDetail;
        window.printTabErrorLog = printErrorLog;

        if (!isEnabled()) {
            if (window.console && console.warn) {
                console.warn('[tabHeader] 탭 에러 상세 로그 OFF : global error guard 설치 생략');
            }
            return;
        }

        if (NS._globalHandlersInstalled) {
            return;
        }

        NS._globalHandlersInstalled = true;

        /*
         * [함수 설명] 브라우저 error 이벤트를 v6 handler로 위임하는 전역 이벤트 콜백입니다.
         */
        window.addEventListener('error', function (event) {
            handleWindowError(event);
        }, true);

        /*
         * [함수 설명] 브라우저 unhandledrejection 이벤트를 v6 handler로 위임하는 전역 이벤트 콜백입니다.
         */
        window.addEventListener('unhandledrejection', function (event) {
            handleUnhandledRejection(event);
        }, true);
    }

    if (!NS._delegatedButtonBound) {
        NS._delegatedButtonBound = true;
        /*
         * [함수 설명] 에러 placeholder의 “원본 에러 콘솔 재출력” 버튼을 처리하는 delegated click 콜백입니다.
         */
        document.addEventListener('click', function (event) {
            var target = event.target;
            while (target && target !== document) {
                if (target.getAttribute && target.getAttribute('data-tab-error-print') === 'Y') {
                    event.preventDefault();
                    printErrorDetail(target.getAttribute('data-tab-error-log-id') || '');
                    return;
                }
                target = target.parentNode;
            }
        }, false);
    }

    /* Namespace API */
    NS.isEnabled = isEnabled;
    NS.ensureContext = ensureContext;
    NS.normalizeSrc = normalizeSrc;
    NS.sameScriptUrl = sameScriptUrl;
    NS.cloneMeta = cloneMeta;
    NS.normalizeError = normalizeError;
    NS.attachMeta = attachMeta;
    NS.getActiveMeta = getActiveMeta;
    NS.escapeHtml = escapeHtml;
    NS.summarizeExtractedScripts = summarizeExtractedScripts;
    NS.buildExtractedScriptSummaryText = buildExtractedScriptSummaryText;
    NS.buildLocationText = buildLocationText;
    NS.buildDetail = buildDetail;
    NS.pushDetail = pushDetail;
    NS.buildRow = buildRow;
    NS.renderError = renderError;
    NS.installGlobalHandlers = installGlobalHandlers;
    NS.handleWindowError = handleWindowError;
    NS.handleUnhandledRejection = handleUnhandledRejection;
    NS.recordScriptEvaluationError = recordScriptEvaluationError;
    NS.consumeScriptEvaluationError = consumeScriptEvaluationError;
    NS.appendInlineSourceURL = appendInlineSourceURL;
    NS.storeErrorObject = storeErrorObject;
    NS.getErrorLog = getErrorLog;
    NS.printErrorDetail = printErrorDetail;
    NS.printErrorLog = printErrorLog;
    
    window.cloneTabErrorMeta = cloneMeta;
    window.normalizeTabError = normalizeError;
    window.attachTabErrorMeta = attachMeta;
    window.getActiveTabErrorMeta = getActiveMeta;
    window.escapeTabErrorHtml = escapeHtml;
    window.summarizeExtractedScripts = summarizeExtractedScripts;
    window.buildExtractedScriptSummaryText = buildExtractedScriptSummaryText;
    window.buildTabErrorLocationText = buildLocationText;
    window.buildTabErrorDetail = buildDetail;
    window.pushTabErrorDetail = pushDetail;
    window.buildTabErrorRow = buildRow;
    window.renderTabLoadError = renderError;
    window.getTabErrorLog = getErrorLog;
    window.printTabErrorDetail = printErrorDetail;
    window.printTabErrorLog = printErrorLog;

}(window, document));
