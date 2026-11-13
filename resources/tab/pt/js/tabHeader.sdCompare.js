/* ------------------------------------------------------------------
 * 프로젝트 : 하나생명 NEW SFA 시스템 / TAB UI
 * 파 일 명 : tabHeader.sdCompare.js
 * 설    명 : 가입설계 비교하기 TabHeader 전역 owner 모듈
 * ------------------------------------------------------------------
 * 전체 기능
 * - TabHeader 전역 영역에서 가입설계 비교하기 버튼과 비교 체크박스를 관리한다.
 * - 보험료 계산 완료 시점에 snapshot을 저장하지 않는다.
 * - 사용자가 가입설계 비교하기 버튼을 누르는 순간, 선택된 가입설계 탭의 현재 DOM 값을 읽어 comparePlans 데이터를 만든다.
 * - 공통 레이어 팝업 layerPop.openPop('PSD02020101P', initFn, initParam, closeCallback)으로 비교 팝업을 연다.
 * - 비교 팝업에서 "해당설계로 확인하기"를 누르면 targetTabId를 받아 기존 탭을 활성화한다.
 * 
 * 공개 API
 * - window.TabHeaderSdCompare.init(options)
 * - window.TabHeaderSdCompare.refresh()
 * - window.TabHeaderSdCompare.openComparePopup()
 * - window.TabHeaderSdCompare.collectSelectedComparePlans()
 * - window.TabHeaderSdCompare.handlePopupResult(result)
 * - window.TabHeaderSdCompare.activateTab(tabId)
 * ------------------------------------------------------------------*/
(function (window, document, $) {
    'use strict';

    var NS = window.TabHeaderSdCompare = window.TabHeaderSdCompare || {};

    var DEFAULT_OPTIONS = {
        rootSelector: '.tab_page_list',
        tabBarItemSelector: '.tab_bar_item > li',
        tabContentSelector: '.tab_cont_items .content_tab, #tab_conts .content_tab',
        compareCheckSelector: '.js-sd-compare-check[data-compare-role="sdCompare"]',
        legacyCompareCheckSelector: '.tab_bar_item > li > input.tab_check',
        compareButtonSelector: '#btn_compare',
        compareCountSelector: '#compare',
        popupLayerId: 'PSD02020101P',
        popupEntryName: 'PSD02020101P',
        minCompareCount: 2,
        maxCompareCount: 2,
        sdTabIdPattern: /^tab_SD0101(?:_|$)/,
        sdMenuId: 'SD0101',
        alertTitle: '',
        progressDelayMs: 30,
        sameMainProductMessage: '같은 상품끼리만 비교가 가능합니다.',
        /* 필요 시 tabHeader 본체의 공식 탭 활성화 API를 주입한다. 없으면 a click fallback을 사용한다. */
        activateTab: null
    };

    var state = {
        initialized: false,
        options: null,
        $root: null,
        lastComparePlans: [],
        observer: null,
        isOpening: false,
    };

    /* ------------------------------------------------------------------
     * 공통 small helper
     * ------------------------------------------------------------------*/

    /**
     * [함수 설명] 입력값이 null/undefined이면 빈 문자열로 바꾸고 앞뒤 공백을 제거한다.
     * DOM text/value를 비교용 문자열로 만들 때 사용한다.
     */
    function trim(value) {
        return String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
    }

    /**
     * [함수 설명] DOM text 안의 연속 공백, 줄바꿈, 탭을 한 칸 공백으로 정규화한다.
     * 화면에 표시된 값 비교 시 줄바꿈 차이로 오탐이 생기지 않게 한다.
     */
    function normalizeText(value) {
        return trim(value).replace(/\s+/g, ' ');
    }

    /**
     * [함수 설명] HTML attribute selector에 넣을 문자열을 최소한으로 escape한다.
     * tabId에 특수문자가 섞여도 selector가 깨지지 않도록 한다.
     */
    function escapeAttr(value) {
        return String(value == null ? '' : value).replace(/(["\\])/g, '\\$1');
    }

    /**
     * [함수 설명] 화면 렌더링용 HTML escape helper.
     * 이 파일에서는 주로 alert/log가 아닌 팝업 payload 생성만 하지만, title fallback 생성에 안전성을 유지하기 위해 둔다.
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
     * [함수 설명] uiInfo.pt.alert가 있으면 프로젝트 alert을 사용하고, 없으면 window.alert로 fallback한다.
     */
    function showAlert(message) {
        var title = state.options && state.options.alertTitle ? state.options.alertTitle : '';

        if (window.uiInfo && window.uiInfo.pt && typeof window.uiInfo.pt.alert === 'function') {
            window.uiInfo.pt.alert(title, message);
            return;
        }

        window.alert(message);
    }

    /**
     * [함수 설명] 공통 progress가 존재하면 팝업데이터 수집 / 렌더링 중 진행상태를 표시한다.
     */
    function showProgress() {
        try {
            if(window.progress && typeof window.progress.show === 'function'){
                window.progress.show();
            }
        }catch (ignore) {}
    }

    /**
     * [함수 설명] showProgress()로 표시한 공통 progress를 닫는다.
     */
    function hideProgress() {
        try {
            if(window.progress && typeof window.progress.hide === 'function'){
                window.progress.hide();
            }
        }catch (ignore) {}
    }
    
    /**
     * [함수 설명] 현재 옵션 기준 root scope(.tab_page_list)를 반환한다.
     */
    function getRoot() {
        var $root = state.$root;
        if ($root && $root.length) {
            return $root;
        }

        $root = $(state.options.rootSelector).first();
        state.$root = $root;
        return $root;
    }

    /**
     * [함수 설명] tabId에 해당하는 탭 헤더 li를 찾는다.
     */
    function findTabItem(tabId) {
        if (!tabId) return $();
        return getRoot().find(state.options.tabBarItemSelector + '[data-id="' + escapeAttr(tabId) + '"]').first();
    }

    /**
     * [함수 설명] 쉼표로 나뉜 selector 각각에 [data-id=...] 조건을 붙인다.
     * 예: "#tab_conts .content_tab, .tab_cont_items .content_tab"처럼 복수 selector가 들어와도
     * 모든 후보에 동일한 data-id 조건을 적용하기 위한 helper다.
     */
    function appendDataIdToSelector(selector, tabId) {
        return String(selector || '')
            .split(',')
            .map(function (part) {
                part = trim(part);
                return part ? part + '[data-id="' + escapeAttr(tabId) + '"]' : '';
            })
            .filter(function (part) { return !!part; })
            .join(', ');
    }

    /**
     * [함수 설명] tabId에 해당하는 content_tab scope를 찾는다.
     * tabHeader 본체의 getTabScopeByTabId가 있으면 우선 사용하고, 없으면 DOM selector로 찾는다.
     */
    function findContentScope(tabId) {
        var $scope;
        var selector;

        if (!tabId) return $();

        if (typeof window.getTabScopeByTabId === 'function') {
            try {
                $scope = window.getTabScopeByTabId(tabId);
                if ($scope && $scope.length) {
                    return $scope.first();
                }
            } catch (ignore) {}
        }

        selector = appendDataIdToSelector(state.options.tabContentSelector, tabId);
        return getRoot().find(selector).first();
    }

    /**
     * [함수 설명] 비교 체크박스 element에서 tabId를 구한다.
     * data-compare-tab-id를 우선 사용하고, 없으면 가까운 li[data-id]를 fallback으로 사용한다.
     */
    function getTabIdFromCheckbox(checkbox) {
        var $checkbox = $(checkbox);
        return trim($checkbox.attr('data-compare-tab-id') || $checkbox.closest('li[data-id]').attr('data-id') || '');
    }

    /**
     * [함수 설명] tabId와 메뉴 ID를 기준으로 가입설계 비교 대상 탭인지 판단한다.
     * 현재 최신 tabHeader는 가입설계 다중 탭을 tab_SD0101_timestamp 형태로 생성한다.
     */
    function isCompareTargetTab(tabId, $tabItem) {
        var moduleId = trim(($tabItem && $tabItem.attr('data-module-id')) || '');
        var menuId = trim(($tabItem && $tabItem.attr('data-menu-id')) || '');

        if (moduleId === state.options.sdMenuId || menuId === state.options.sdMenuId) {
            return true;
        }

        return state.options.sdTabIdPattern.test(tabId || '');
    }

    /**
     * [함수 설명] 기존/신규 탭 체크박스에 비교 전용 data 계약을 보정한다.
     * tabHeader.jsp에 아직 data-compare-role이 반영되지 않은 경우에도 안정적으로 동작하도록 한다.
     * 단, 탭관리 팝업의 list_tab_check는 건드리지 않는다.
     */
    function normalizeCompareCheckboxes() {
        var $root = getRoot();
        var selector = state.options.legacyCompareCheckSelector;

        $root.find(selector).each(function () {
            var $checkbox = $(this);
            var $li = $checkbox.closest('li[data-id]');
            var tabId = trim($li.attr('data-id') || '');

            if (!isCompareTargetTab(tabId, $li)) {
                return;
            }

            if (!$checkbox.hasClass('js-sd-compare-check')) {
                $checkbox.addClass('js-sd-compare-check');
            }

            $checkbox.attr('data-compare-role', 'sdCompare');
            $checkbox.attr('data-compare-tab-id', tabId);

            if (!$checkbox.attr('title')) {
                $checkbox.attr('title', '가입설계 비교 선택');
            }
        });
    }

    /**
     * [함수 설명] 비교 전용 체크박스 jQuery collection을 반환한다.
     */
    function getCompareCheckboxes() {
        normalizeCompareCheckboxes();
        return getRoot().find(state.options.compareCheckSelector);
    }

    /**
     * [함수 설명] 선택된 비교 체크박스 기준 tabId 배열을 반환한다.
     */
    function getSelectedTabIds() {
        var tabIds = [];

        getCompareCheckboxes().filter(':checked').each(function () {
            var tabId = getTabIdFromCheckbox(this);
            if (tabId && tabIds.indexOf(tabId) === -1) {
                tabIds.push(tabId);
            }
        });

        return tabIds;
    }

    /**
     * [함수 설명] 비교 선택 개수와 버튼 disabled 상태를 갱신한다.
     * 현재 퍼블 UI가 0/2 형식이므로 maxCompareCount를 기준으로 표시한다.
     */
    function updateCompareButtonState() {
        var selectedCount = getSelectedTabIds().length;
        var maxCount = state.options.maxCompareCount;
        var enabled = selectedCount >= state.options.minCompareCount && selectedCount <= maxCount;

        $(state.options.compareCountSelector).text(selectedCount + '/' + maxCount);
        $(state.options.compareButtonSelector).prop('disabled', !enabled);
    }

    /**
     * [함수 설명] 비교 체크박스 변경 시 최대 선택 개수를 초과하지 않도록 제어한다.
     * 계산 여부 상세 검증은 비교 버튼 클릭 시 다시 수행한다.
     */
    function onCompareCheckboxChange(event) {
        var $checkbox = $(event.currentTarget);
        var selectedCount;

        if ($checkbox.is(':checked')) {
            selectedCount = getSelectedTabIds().length;
            if (selectedCount > state.options.maxCompareCount) {
                $checkbox.prop('checked', false);
                showAlert('가입설계 비교는 ' + state.options.maxCompareCount + '개까지 선택할 수 있습니다.');
            }
        }

        updateCompareButtonState();
    }

    /* ------------------------------------------------------------------
     * 가입설계 탭 DOM 읽기
     * ------------------------------------------------------------------*/

    /**
     * [함수 설명] input/select 값을 읽는다.
     * select는 선택된 option의 표시 텍스트를, input은 현재 value를 반환한다.
     */
    function readControlText($control) {
        var tagName;
        var text;

        if (!$control || !$control.length) return '';

        tagName = String($control.prop('tagName') || '').toLowerCase();
        if (tagName === 'select') {
            text = $control.find('option:selected').text();
            return normalizeText(text || $control.val());
        }

        return normalizeText($control.val());
    }

    /**
     * [함수 설명] 금액 input과 unit span/data-money-unit을 조합해 화면 표시용 금액 문자열을 만든다.
     * 값이 비어 있으면 빈 문자열을 반환한다.
     */
    function readMoneyText($input) {
        var value = readControlText($input);
        var unit = '';

        if (!$input || !$input.length || !value) {
            return '';
        }

        unit = trim($input.attr('data-money-unit') || $input.data('money-unit') || '');
        if (!unit) {
            unit = normalizeText($input.closest('.tooltipTextWrap, td').find('.unit').first().text());
        }

        /* 이미 화면 값에 원/만원 같은 단위가 붙어 있으면 중복으로 붙이지 않는다. */
        if (unit && value.indexOf(unit) >= 0) {
            return value;
        }

        return value + (unit || '');
    }

    /**
     * [함수 설명] 상품명 cell에서 tooltip/error 텍스트를 제거하고 실제 상품명만 읽는다.
     */
    function readProductName($cell) {
        var $clone;

        if (!$cell || !$cell.length) return '';

        $clone = $cell.clone();
        $clone.find('.toolTip, .tooltipBox, [name="errorTooltip"]').remove();
        return normalizeText($clone.text());
    }

    /**
     * [함수 설명] tr 또는 내부 checkbox/input에 들어 있는 상품코드를 읽어 rowKey로 사용한다.
     * 코드가 없으면 상품명 기반 fallback key를 사용한다.
     */
    function readProductCode($row) {
        var $codeSource = $row.find('[data-pdt-cd]').first();
        var pdtCd = trim(
            $row.attr('data-pdt-cd') ||
            $row.attr('data-pdtCd') ||
            $row.attr('data-pdtcd') ||
            ($checkbox.length ? ($checkbox.attr('data-pdt-cd') || $checkbox.data('pdt-cd') || $checkbox.val()) : '') ||
            ($codeSource.length ? ($codeSource.attr('data-pdt-cd') || $codeSource.data('pdt-cd')) : '') ||
            ''
        );

        return pdtCd;
    }
    /**
     * [함수 설명] 주계약 row인지 판단한다.
     */
    function isMainContractRow($row, scnDvNm){
        if(!$row || !$row.length) {
            return false;
        }

        if(String($row.attr('id') || '') === 'mcnrNode') {
            return true;
        }

        return normalizeText(scnDvNm) === '주계약';
    }

    /**
     * [함수 설명] 주계약 row인지 판단한다.
     */ 
    function collectMainContractProductCode($scope) {
        var $mainRow = $scope.find('#mcnrNode').first();
        var pdtCd = '';

        if($mainRow.length) {
            pdtCd = readProductCode($mainRow);
            if(pdtCd) return pdtCd;
        }

        $scope.find('#scnNodeList tr[name="pdtInfo"]').each(function () {
            var $row = $(this);
            var scnDvNm = normalizeText($row.children('td').eq(1).text);

            if(!pdtCd && isMainContractRow($row, scnDvNm)) {
                pdtCd = readProductCode($row);
            }
        });

        return pdtCd;
    } 

    /**
     * [함수 설명] 선택된 특약/주계약 row인지 판단한다.
     * 주계약은 disabled checked 상태여도 포함하고, 특약은 scnChk가 checked인 경우만 포함한다.
     */
    function getProductRowCheckbox($row) {
        var $checkbox;

        if(!$row || !$row.length) {
            return $row();
        }

        $checkbox = $row.children('td').first()
            .find('input[type="checkbox"]')
            .not('[name="scnChkAll"], #scnChkAll')
            .first();

        if($checkbox.length) {
            return $checkbox;
        }

        return $row.find('input[type="checkbox"]')
            .not('[name="scnChkAll"], #scnChkAll')
            .first();
    }

    function isSelectedProductRow($row) {
        var $checkbox = getProductRowCheckbox($row);

        if (!$checkbox.length) {
            return false;
        }

        return $checkbox.prop('checked') === true;
    }

    /**
     * [함수 설명] 보험기간/연금개시연령 컬럼 라벨을 row의 select title 또는 화면 헤더에서 추론한다.
     */
    function readPeriodColumnLabel($scope, $row) {
        var label = normalizeText($row.find('[name="isPd"]').first().attr('title') || '');
        var headerText;

        if (label) {
            return label.indexOf('연금') >= 0 ? '연금개시연령' : '보험기간';
        }

        headerText = normalizeText($scope.find('#mcnrIsPdTxt').text() || $scope.find('#mcnrIsPdTxt').data('text') || '');
        return headerText.indexOf('연금') >= 0 ? '연금개시연령' : '보험기간';
    }

    /**
     * [함수 설명] 가입설계 화면의 #scnNodeList 내 현재 선택 상품 row를 비교 팝업용 row 객체로 변환한다.
     */
    function collectProductRows($scope) {
        var rows = [];

        $scope.find('#scnNodeList tr[name="pdtInfo"]').each(function (idx) {
            var $row = $(this);
            var $cells = $row.children('td');
            var pdtCd = readProductCode($row);
            var scnDvNm = normalizeText($cells.eq(1).text());
            var pdtNm = readProductName($cells.eq(2));
            var isMainContract = isMainContractRow($row, scnDvNm);
            var selected = isMainContract ? true : isSelectedProductRow($row);
            var rowKey = isMainContract ? 'MAIN_CONTRACT' : (pdtCd || (scnDvNm + '|' + pdtNm + '|' + idx));
            var periodLabel = readPeriodColumnLabel($scope, $row);

            var row = {
                rowKey: rowKey,
                pdtCd: pdtCd,
                isMainContract: isMainContract,
                isSelected: selected,
                scnDvNm: scnDvNm,
                pdtNm: pdtNm,
                periodColumnLabel: periodLabel,
                periodText: readControlText($row.find('[name="isPd"]').first()),
                paPdText: readControlText($row.find('[name="paPd"]').first()),
                sbcAmtText: selected ? readMoneyText($row.find('[name="sbcAmt"]').first()) : '',
                prmText: selected ? readMoneyText($row.find('[name="prm"]').first()) : ''
            };

            row.compareValues = {
                scnDvNm: normalizeText(row.scnDvNm),
                pdtNm: normalizeText(row.pdtNm),
                periodText: normalizeText(row.periodText),
                paPdText: normalizeText(row.paPdText),
                sbcAmtText: normalizeText(row.sbcAmtText),
                prmText: normalizeText(row.prmText)
            };

            rows.push(row);
        });

        return rows;
    }

    /**
     * [함수 설명] 보험료 계산 결과 영역에서 합계보험료/초회납입보험료를 읽는다.
     * 비교 팝업의 합계보험료 표시는 현재 화면의 #realPa를 우선 사용한다.
     */
    function collectPremiumSummary($scope) {
        var realPa = normalizeText($scope.find('#realPa').text());
        var totPaPrm = normalizeText($scope.find('#totPaPrm').text());
        var disPrm = normalizeText($scope.find('#disPrmAndDisRt').text());

        return {
            realPaText: realPa ? (realPa.indexOf('원') >= 0 ? realPa : realPa + '원') : '',
            totPaPrmText: totPaPrm,
            disPrmText: disPrm
        };
    }

    /**
     * [함수 설명] 보험료 계산 완료로 볼 수 있는지 DOM 기준으로 판단한다.
     * comm 내부 flag를 읽지 않고, 현재 화면에 초회납입보험료/초회보험료가 표시되어 있는지만 본다.
     */
    function isCalculatedPlan($scope, premiumSummary) {
        var $calcNode = $scope.find('#calcNode').first();
        var calcNodeOwnDisplay = $calcNode.length ? String($calcNode.get(0).style.display || '') : '';

        if (!premiumSummary.realPaText && !premiumSummary.totPaPrmText) {
            return false;
        }

        if ($calcNode.length && calcNodeOwnDisplay === 'none') {
            return false;
        }

        return true;
    }

    /**
     * [함수 설명] 탭 제목과 피보험자 표시 문구를 읽는다.
     */
    function collectTabDisplayInfo(tabId) {
        var $tabItem = findTabItem(tabId);
        var title = normalizeText($tabItem.find('a > span').first().text() || $tabItem.find('a').first().text());
        var people = normalizeText($tabItem.find('.people').first().text());

        return {
            tabTitle: title || tabId,
            peopleText: people
        };
    }

    /**
     * [함수 설명] sessionStorage 값을 안전하게 읽는다.
     */
    function readSessionStorageItem(key) {
        try {
            if(!key || !window.sessionStorage) {
                return '';
            }
            return normalizeText(window.sessionStorage.getItem(key));
        }catch(ignore) {
            return '';
        }
    }

    /**
     * [함수 설명] 가입설계 화면에서 가입설계번호 후보를 읽는다.
     * 저장 전 설계는 번호가 없을 수 있으므로 없으면 '-'를 반환한다.
     */
    function collectDesignNo($scope, tabId) {
        var value = '';
        
        value = window.commPdtMgnt.get(tabId).getSbcDsgnNo();
        if(value) return value;

        value = readSessionStorageItem(tabId ? tabId + '_sbcDsgnNo' : '');
        if(value) return value;

        value = normalizeText($scope.find('[name="sbcDsgnNo"]').first().val() || $scope.find('#sbcDsgnNo').first().val());
        if (value) return value;

        value = normalizeText($scope.find('[data-sbc-dsgn-no]').first().attr('data-sbc-dsgn-no'));
        return value || '-';
    }

    /**
     * [함수 설명] tabId 하나의 현재 화면 DOM을 읽어 비교 팝업 payload용 plan 객체를 만든다.
     * 여기서 반환하는 객체는 plain data만 포함한다.
     */
    function collectPlanFromTab(tabId, displayIndex) {
        var $scope = findContentScope(tabId);
        var displayInfo;
        var rows;
        var premiumSummary;
        var pdtName;
        var planName;

        if (!$scope.length) {
            throw new Error('선택한 가입설계 탭의 화면 영역을 찾을 수 없습니다. [' + tabId + ']');
        }

        rows = collectProductRows($scope);
        if (!rows.length) {
            throw new Error('선택한 탭에 비교할 상품 정보가 없습니다. 상품 선택 후 보험료 계산을 진행해 주세요.');
        }

        premiumSummary = collectPremiumSummary($scope);
        if (!isCalculatedPlan($scope, premiumSummary)) {
            throw new Error('보험료 계산이 완료된 가입설계만 비교할 수 있습니다.');
        }

        displayInfo = collectTabDisplayInfo(tabId);
        pdtName = normalizeText($scope.find('#rsPdtName').val() || $scope.find('#rsPdtName').text());
        planName = normalizeText($scope.find('#planComboText').text() || $scope.find('#planComboText').val());

        return {
            tabId: tabId,
            displayIndex: displayIndex,
            tabTitle: displayInfo.tabTitle,
            peopleText: displayInfo.peopleText,
            header: {
                sbcDsgnNo: collectDesignNo($scope, tabId),
                pdtNm: pdtName,
                planNm: planName === '선택' ? '' : planName,
                totalPremiumText: premiumSummary.realPaText || premiumSummary.totPaPrmText,
                mainPdtCd: collectMainContractProductCode($scope),
                totPaPrmText: premiumSummary.totPaPrmText,
                disPrmText: premiumSummary.disPrmText
            },
            rows: rows,
            proceed: {
                targetTabId: tabId
            }
        };
    }
    /**
     * [함수 설명] 선택된 두 가입설계의 주계약 상품코드가 같은지 검증한다.
     */
    function validateSameMainContractProduct(plans){
        var baseCode = '';
        var i;
        var code;

        for(i = 0; i < (plans || []).length; i+=1) {
            code = normalizeText(plans[i] && plans[i].header ? plans[i].header.mainPdtCd : '');
            if(!code) {
                continue;
            }

            if(!baseCode) {
                baseCode = code;
            }

            if(baseCode !== code){
                throw new Error(state.options.sameMainProductMessage || '같은 상품끼리만 비교가 가능합니다.');
            }
        }
    }



    /**
     * [함수 설명] 현재 선택된 비교 탭들을 순서대로 읽어 comparePlans 배열을 만든다.
     */
    function collectSelectedComparePlans() {
        var tabIds = getSelectedTabIds();
        var plans = [];
        var i;

        if (tabIds.length < state.options.minCompareCount) {
            throw new Error('비교할 가입설계를 ' + state.options.minCompareCount + '개 선택해 주세요.');
        }

        if (tabIds.length > state.options.maxCompareCount) {
            throw new Error('가입설계 비교는 ' + state.options.maxCompareCount + '개까지 선택할 수 있습니다.');
        }

        for (i = 0; i < tabIds.length; i += 1) {
            plans.push(collectPlanFromTab(tabIds[i], i + 1));
        }

        validateSameMainContractProduct(plans);

        return plans;
    }

    /**
     * [함수 설명] comparePlans를 만들어 공통 layerPop으로 가입설계비교 팝업을 연다.
     */
    function openComparePopupInternal() {
        var plans;
        var popupLayerId = state.options.popupLayerId;
        var popupEntry = window[state.options.popupEntryName];

        plans = collectSelectedComparePlans();

        if (!window.layerPop || typeof window.layerPop.openPop !== 'function') {
            throw new Error('공통 레이어 팝업(layerPop)을 찾을 수 없습니다.');
        }

        if (!popupEntry || typeof popupEntry.init !== 'function') {
            throw new Error('가입설계비교 팝업 스크립트(' + state.options.popupEntryName + ')를 찾을 수 없습니다.');
        }

        state.lastComparePlans = plans;

        window.layerPop.openPop(
            popupLayerId,
            function (initParam) {
                popupEntry.init(initParam);
            },
            {
                popupKey: popupLayerId,
                comparePlans: plans,
                resultOwner: 'TabHeaderSdCompare'
            }
        );
    }
    /**
     * [함수 설명] comparePlans를 만들어 공통 layerPop으로 가입설계 비교 팝업을 연다.
     */
    function openComparePopup() {
        var delay; 

        if(state.isOpening === true) {
            return;
        }

        state.isOpening = true;
        $(state.options.compareButtonSelector).prop('disabled', true);
        showProgress();

        delay = Number(state.options.progressDelayMs || 0);

        window.setTimeout(function () {
            try {
                openComparePopupInternal();
            }catch(error) {
                uiInfo.pt.alert('', error.message || '가입설계 비교 데이터를 만들수 없습니다.');
                updateCompareButtonState();
            }finally {
                hideProgress();
                state.isOpening = false;
                updateCompareButtonState();
            }
        }, delay < 0 ? 0 : delay);
    }
    /**
     * [함수 설명] 비교 팝업에서 반환한 result를 처리한다.
     * 팝업은 탭 DOM을 직접 건드리지 않고 targetTabId만 반환한다.
     */
    function handlePopupResult(result) {
        var targetTabId = result && result.data ? result.data.targetTabId : '';

        if (!targetTabId) {
            showAlert('진행할 가입설계 탭 정보가 없습니다.');
            return;
        }

        activateTab(targetTabId);
        clearCompareSelection();
    }

    /**
     * [함수 설명] 비교 선택 상태를 초기화하고 버튼 카운트를 갱신한다.
     */
    function clearCompareSelection() {
        getCompareCheckboxes().prop('checked', false);
        updateCompareButtonState();
    }

    /**
     * [함수 설명] targetTabId에 해당하는 기존 탭을 활성화한다.
     * tabHeader 본체의 탭 클릭 handler를 재사용하기 위해 a 태그 click을 발생시킨다.
     */
    function activateTab(tabId) {
        var $tabItem = findTabItem(tabId);
        var $anchor;

        if (!$tabItem.length) {
            showAlert('선택한 가입설계 탭을 찾을 수 없습니다.');
            return false;
        }

        if (state.options && typeof state.options.activateTab === 'function') {
            state.options.activateTab(tabId);
            return true;
        }

        $anchor = $tabItem.children('a').first();
        if ($anchor.length) {
            $anchor.trigger('click');
        } else {
            getRoot().find(state.options.tabBarItemSelector).removeClass('active');
            getRoot().find(state.options.tabContentSelector).removeClass('active');
            $tabItem.addClass('active');
            findContentScope(tabId).addClass('active');

            if (typeof window.setCurrentActiveTabId === 'function') {
                window.setCurrentActiveTabId(tabId);
            }
        }

        return true;
    }

    /**
     * [함수 설명] 탭 header가 addTab/removeTab으로 변경될 때 비교 체크박스 계약을 자동 보정한다.
     * tabHeader.jsp에 refresh 호출이 누락되어도 최소한의 재동기화를 수행한다.
     */
    function bindTabMutationObserver() {
        var $root = getRoot();
        var target;

        if (state.observer || !window.MutationObserver || !$root.length) {
            return;
        }

        target = $root.find('.tab_bar_item').first().get(0);
        if (!target) {
            return;
        }

        state.observer = new window.MutationObserver(function () {
            normalizeCompareCheckboxes();
            updateCompareButtonState();
        });
        state.observer.observe(target, { childList: true, subtree: true });
    }

    /**
     * [함수 설명] 이벤트를 namespace 기반으로 바인딩한다.
     * 기존 퍼블 데모의 #btn_compare click이 남아 있을 수 있으므로 이 버튼 click은 이 owner가 다시 소유한다.
     */
    function bindEvents() {
        var $root = getRoot();
        var checkboxSelector = state.options.compareCheckSelector + ', ' + state.options.legacyCompareCheckSelector;

        /*
         * 비교 체크박스는 tabHeader에서 동적으로 추가될 수 있으므로 delegated event로 잡는다.
         * 신규 data 계약이 아직 없는 checkbox도 change 시점에 normalize 후 처리한다.
         */
        $root.off('change.TabHeaderSdCompare', checkboxSelector)
            .on('change.TabHeaderSdCompare', checkboxSelector, function (event) {
                normalizeCompareCheckboxes();
                onCompareCheckboxChange(event);
            });

        /*
         * #btn_compare는 가입설계 비교하기 전용 버튼이다.
         * 퍼블 데모의 un-namespaced click handler가 남아 있으면 Ajax HTML 비교가 중복 실행되므로
         * 이 버튼의 기존 click handler를 정리하고 owner handler만 다시 건다.
         */
        $(state.options.compareButtonSelector)
            .off('click')
            .on('click.TabHeaderSdCompare', function (event) {
                event.preventDefault();
                normalizeCompareCheckboxes();
                openComparePopup();
            });
    }

    /**
     * [함수 설명] 비교 owner를 초기화한다.
     * tabHeader.jsp ready 마지막에서 1회 호출하는 것을 기본으로 한다.
     */
    function init(options) {
        state.options = $.extend({}, DEFAULT_OPTIONS, options || {});
        state.$root = $(state.options.rootSelector).first();

        if (!state.$root.length) {
            if (window.console && typeof window.console.warn === 'function') {
                window.console.warn('[TabHeaderSdCompare] root not found:', state.options.rootSelector);
            }
            return NS;
        }

        normalizeCompareCheckboxes();
        bindEvents();
        bindTabMutationObserver();
        updateCompareButtonState();
        state.initialized = true;

        return NS;
    }

    /**
     * [함수 설명] 탭 추가/삭제 후 비교 체크박스 data 계약과 카운트를 다시 맞춘다.
     */
    function refresh() {
        if (!state.options) {
            state.options = $.extend({}, DEFAULT_OPTIONS);
        }
        normalizeCompareCheckboxes();
        updateCompareButtonState();
        return NS;
    }

    NS.init = init;
    NS.refresh = refresh;
    NS.updateCompareButtonState = updateCompareButtonState;
    NS.collectSelectedComparePlans = collectSelectedComparePlans;
    NS.openComparePopup = openComparePopup;
    NS.handlePopupResult = handlePopupResult;
    NS.activateTab = activateTab;
    NS.clearCompareSelection = clearCompareSelection;
    NS._private = {
        collectPlanFromTab: collectPlanFromTab,
        collectProductRows: collectProductRows,
        collectPremiumSummary: collectPremiumSummary,
        findContentScope: findContentScope,
        normalizeCompareCheckboxes: normalizeCompareCheckboxes,
        escapeHtml: escapeHtml,
        readMoneyText: readMoneyText,
        getProductRowCheckbox: getProductRowCheckbox,
        isSelectedProductRow: isSelectedProductRow,
        isCalculatedPlan: isCalculatedPlan,
        isMainContractRow: isMainContractRow,
        collectMainContractProductCode: collectMainContractProductCode,
        validateSameMainContractProduct: validateSameMainContractProduct
    };

})(window, document, window.jQuery || window.$);
