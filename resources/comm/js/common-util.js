/**
 * @target
 */
var commonUtil= {

};

/**
 * JSON Array 변환

 * @date 2022.08.03
 * @author 70086
 * @param  {String}
 * @return {Object}
 */
commonUtil.strToJsonConvert = function(param) {

	var resultJson = [];
	var jsonArrStr = param.split("[{").join('').split("}]").join('');  //양 끝 문자열 제거
	var rows 	   = jsonArrStr.split('}, {');

	for (var i=0; i < rows.length; i++) {

		var cols = rows[i].split(', ');
		var rowData = {};

		for (var j=0; cols.length> j; j++) {

			var colData = cols[j];
			colData = colData.trim();

			var key = colData.substring(0, colData.indexOf("="));
			var val = colData.substring(colData.indexOf("=")+1);

			rowData[key] = val;
		}

		resultJson.push(rowData);
	}

	return resultJson;
}
/**
 * 상품정보코드를 조회한다.
 * @date 2022.11.01
 * @param {string} pdtCd 상품코드
 * @param {string} cactCd 특성코드(SPJE)
 * @return Promise
 */
commonUtil.getPdtImCd = function(pdtCd, cactCd) {

	return new Promise(function(resolve, reject){
		var url = '/sb/getPdtImCd.json';
		url += '?pdtCd=' + pdtCd + '&cactCd=' + cactCd;

		comTx.ajax(url, {}, (obj, resultData, textStatus, jqXHR) => {

			var pdtImCd = resultData.pdtImCd;

			if (pdtImCd != undefined && pdtImCd != "undefined"
				&& pdtImCd != null && pdtImCd != "null" && pdtImCd != "" ){
				resolve(resultData);
			}
			reject(resultData);
		});
	});
}
/**
 * 농협계좌체계를 확인한다.
 * 농협계좌의 경우 중앙이든, 단위든 모계좌은행코드만 중앙으로 맞춰주면 집급처리됨.
 * 스크립트에서 은행코드와 계좌번호로 계좌체계 체크하여 유효성 검사함.
 *
 *	농협만 계좌번호의 체계를 확인하는 이유
 *	결제모듈 초회집금시 모계좌번호를 농협으로 할 경우 중앙(011)이든 단위(012)든 상관없이 집금처리가 됨.
 *  단, 	연속납 선택시 초회납과 동일 선택할 경우 은행코드 + 계좌번호와 상이할 경우
		자동이체청구를 할 경우 에러가 발생 - 해당 경우를 막기위하여 계좌체계 유효성 검사를 함.
 		ex) 중앙농협(011) - 단위농협계좌번호 || 단위농협(012) - 중앙농협계좌번호
 * @date 2022.11.08
 * @param {string} bankCode 은행코드
 * @param {string} bankAcc 계좌번호
 * @return boolean
 */
commonUtil.isNongHyupAccCheck = function(bankCode, bankAcc) {
	const NONGHYUP_CENTER = "011";
	const NONGHYUP_UNIT = "012";

	//농협 계좌체계만체크하기 때문에 중앙농협, 단위농협을 제외하는 모든 은행은 true 리턴
	if (bankCode != NONGHYUP_CENTER && bankCode != NONGHYUP_UNIT) {
		return true;
	}

	/** 81505356024109
	 *   ---------------------------------------------------------------------
	 *		|			농협중앙회				| 	농협 단위						|
	 *	---------------------------------------------------------------------
	 *	구계좌|	XXX|X-01|02|12-XXXXXX|X		|	XXXXXX-51|52|56-XXXXXX		|
	 		|	(3-2-6), (3-2-7), (4-2-6)	|	(6-2-6)						|
	 *	---------------------------------------------------------------------
	 *	신계좌|	301|302|312-XXXX-XXXX-XX	|	301|302|312-XXXX-XXXX-XX	|
	 *		|	(3-4-4-2)					|	(3-4-4-2)					|
	 * 		|	790|791-XXXX-XXXX-XXX		|	792-XXXX-XXXX-XXX			|
	 *		| 	(3-4-4-3)					|	(3-4-4-3)					|
	 *	---------------------------------------------------------------------
	 *	계좌번호 자리수로 구분
	 * 	11, 12 : 농협중앙
	 *	13	- 농협중앙(맨뒷자리 1,2로 끝나는 경우) / 농협단위(맨뒷자리 3,4,5로 끝나는 경우)
	 *	14	- 농협중앙(맨앞자리 790|791로 시작) / 농협단위(맨앞자리 792로 시작)
	 **/

	if (bankCode == NONGHYUP_CENTER)  {
		if (bankAcc.length <= 12) {
			return true;
		} else if (bankAcc.length == 13) {
			let lastWord = bankAcc.substr(bankAcc.length-1);
			if (lastWord == '1' || lastWord == '2') {
				return true;
			} else {
				return false;
			}
		} else if (bankAcc.length == 14) {
			let firstThreeWord = bankAcc.substring(0, 3);

			if (firstThreeWord == '790' || firstThreeWord == '791') {
				return true;
			} else {
				return false;
			}
		}
	} else if (bankCode == NONGHYUP_UNIT)  {
		if (bankAcc.length <= 12) {
			return false;
		} else if (bankAcc.length == 13) {
			let lastWord = bankAcc.substr(bankAcc.length-1);
			if (lastWord == '3' || lastWord == '4' || lastWord == '5') {
				return true;
			} else {
				return false;
			}
		} else if (bankAcc.length == 14) {
			let firstThreeWord = bankAcc.substring(0, 3);
			let midTwoWord = bankAcc.substring(6, 8);

			//if (firstThreeWord == '792' || midTwoWord == '51' || midTwoWord == '52' || midTwoWord == '56') {
			//20230315 midTwoWord == '55' 체계 추가 202303_0243
			if (firstThreeWord == '792' || midTwoWord == '51' || midTwoWord == '52' || midTwoWord == '56' || midTwoWord == '55') {
				return true;
			} else {
				return false;
			}
		}
	}

}
/**
 *	내용만 쓰고 삭제하세요
 */
commonUtil.bizTemp = function(examBankCode, examBankAcc) {
	examBankCode = !!examBankCode ? examBankCode : '011';
	//let examBankAcc = '3520917564523';
	examBankAcc = !!examBankAcc ? examBankAcc : '3520110164523';


	let bankMsgInfo = {"011" : "중앙농협", "012" : "단위농협" }
	if (!commonUtil.isNongHyupAccCheck(examBankCode, examBankAcc)) {
		console.log('오류');
		uiInfo.pt.alert('', bankMsgInfo[examBankCode]+'계좌 체계가 아닙니다. \n은행을 변경하시거나 계좌번호를 확인해주세요.');
	} else {
		console.log('정상');
	}
}



/**
 * 공통 레이어 팝업
 * New SFA 프로젝트 작업
 *
 * 자세한 설명은 가이드페이지에서 설명한다.(useScript.jsp / layerPop.jsp)
 * @date 2022.07.18
 * @private
 * @memberOf
 * @author 70121(박상호)
 * @return N/A
 */
var layerPop = {
	$targetBtn: null,// 2026 웹접근성
	bottomOpen : function(layerId, init, initParam, callback, callbackParam) {

		layerPop.$targetBtn = $(document.activeElement); // 2026 웹접근성

		var idPop = $('#' + layerId);
		/**
		 *  2중 팝업시 마지막 팝업 상위 지정
		 **/
		var layerWrapCnt = 0;
		var zIdx = 1510;
		if (!!event) {
			layerWrapCnt = $(event.target).parents('div.popWrap').length;
			if (layerWrapCnt > 0) {
				zIdx = zIdx + 1;
			}
		}

		if (layerId == null || layerId.length == 0) {
			alert('팝업의 id값은 필수 입니다.');
			return false;
		}
		/*var getCol = idPop.find('.popBody').attr('class');
		if( getCol != undefined ){
			if( getCol.indexOf('col_') > -1 ){
				var replaceCol = getCol.replace('popBody','').replace('on','').replace(/ /gi, '');
				idPop.find('.popContain').addClass( replaceCol );
				idPop.find('.popBody').removeClass( replaceCol );
			}
		}*/

		idPop.find('.popCont').attr('role','dialog');
		idPop.find('.popBody').attr('tabindex','0');

		if (idPop.find('section.popup.bottomSheet').length > 0 ) {
			idPop.find('section.popup').removeClass('short');
			idPop.find('.btnArea.sticky').removeClass('fixed');
		}
		//팝업 show
		idPop.find('.popup').addClass('open');
		idPop.css('opacity', 1)
				.css('z-index', zIdx )
				.attr({'data-idx': zIdx, 'tabindex': -1})
				.fadeIn().addClass('bottomSheet').addClass('nowOpen').focus();

		if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
			if( $('body').hasClass('isIOS') ){
				var popLength = $('div.popWrap.nowOpen').length;
				if (popLength == 1) {
					var scrlPos = $(window).scrollTop();
					$('html, body').scrollTop( 0 );
					$(window).scrollTop( 0 );
					$('#content').css('top','-'+scrlPos+'px');
				}
			}
			$('html, body').addClass('popOn');
		}

		layerPop.focus(layerId);

		//x 버튼의 함수
		idPop.find('.popCont > .icoBtn_close').off('click').on('click', function(e) {
			e.preventDefault();
			layerPop.close(layerId, callback, callbackParam);
		});

		if(typeof init === "function") {
			init(initParam);
		}
	},
	open : function(layerId, init, initParam, callback, callbackParam){
		
		layerPop.$targetBtn = $(document.activeElement); // 2026 웹접근성

		var idPop = $('#' + layerId);
		var winLastW = $('body').outerWidth();
		/**
		 *  2중 팝업시 마지막 팝업 상위 지정
		 **/
		var layerWrapCnt = 0;
		var zIdx = 1510;
		if (!!event) {
			layerWrapCnt = $(event.target).parents('div.popWrap').length;
			if (layerWrapCnt > 0) {
				zIdx = zIdx + 1;
			}
		}

		if (layerId == null || layerId.length == 0) {
			alert('팝업의 id값은 필수 입니다.');
			return false;
		}


		var getCol = idPop.find('.popBody').attr('class');
		if( getCol != undefined ){
			if( getCol.indexOf('col_') > -1 ){
				var replaceCol = getCol.replace('popBody','').replace('on','').replace(/ /gi, '');
				idPop.find('.popContain').addClass( replaceCol );
				idPop.find('.popBody').removeClass( replaceCol );
			}
		}
		/**
		 *  팝업 버튼 존재여부에 따른 하단 padding 값 class추가
		 **/
		if( idPop.find('.popup > .btn_wrap.sticky').length > 0 ){
			idPop.addClass('hasPopSticky');
		}
		/**
		 *	모바일 팝업의 경우.
		 **/
		if (idPop.find('section.popup').length > 0 ) {
			if( winLastW != $(window).width() ){
				$('body').addClass('hasScroll');
			}
			if( idPop.find('.popup.alert').length > 0 ){
				idPop.addClass('alertPop');
			} else if( idPop.find('.popup.bottomSheet').length > 0 ){
				idPop.addClass('bottomSheet');
				if( idPop.find('section.popup .btnArea.sticky').length > 0 ){
					idPop.find('section.popup').removeClass('short');
					idPop.find('.btnArea.sticky').removeClass('fixed');
				}
			} else {
				idPop.addClass('fullPop');
				if( idPop.find('section.popup > .btnArea.sticky').length > 0 ){
					idPop.find('section.popup').removeClass('short').addClass('hasSticky');
					idPop.find('.btnArea.sticky').removeClass('fixed');
				}
			}
			/*if (idPop.find('section.popup:not(.bottomSheet):not(.alert)').length > 0 ) {
				//아이폰 버그 : 키패드 올라오면 팝업이 사라지는 현상
				$('section.content').hide();
			}*/

			idPop.css('opacity', 1)
					.css('z-index', zIdx )
					.attr({'data-idx': zIdx, 'tabindex': -1})
					.fadeIn().addClass('nowOpen').focus();
			idPop.find('.popup').addClass('open');
			if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
				if( $('body').hasClass('isIOS') ){
					var popLength = $('div.popWrap.nowOpen').length;
					if (popLength == 1) {
						var scrlPos = $(window).scrollTop();
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('#content').css('top','-'+scrlPos+'px');
					}
				}
				$('html, body').addClass('popOn');
			}
		} else {
			idPop.css('opacity', 1)
				.css('z-index', zIdx )
				.attr({'tabindex': -1})
				.fadeIn().addClass('nowOpen').addClass('fullPop').focus();
			if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
				if( $('body').hasClass('isIOS') ){
					var popLength = $('.wrapper .popWrap.nowOpen').length;
					if (popLength == 1) {
						var scrlPos = $(window).scrollTop();
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('body').css('top','-'+scrlPos+'px').css('width', '100%');
					}
				}
				$('html, body').addClass('popOn');
			}
		}

		layerPop.focus(layerId);


		idPop.find('.popup > .icoBtn_close').off('click').on('click', function(e) {
			e.preventDefault();
			layerPop.close(layerId, callback, callbackParam);
		});

		idPop.find('.popup > em > .icoBtn_close').off('click').on('click', function(e) {
			e.preventDefault();
			layerPop.close(layerId, callback, callbackParam);
		});

		if(typeof init === "function") {
			init(initParam);
		}
	},
	close : function(layerId, callback, callbackParam){
		/* 2026 웹접근성 */
		var idPop = $('#' + layerId);
		idPop.css('opacity', 0).removeAttr('tabindex').removeClass('nowOpen').fadeOut();
		idPop.off('keydown.focustrap'); // 포커스 이벤트 해제
		// 원래 열었던 버튼으로 정확히 복원
        if (layerPop.$targetBtn && layerPop.$targetBtn.length) {
            layerPop.$targetBtn.focus();
            layerPop.$targetBtn = null; // 초기화
        }
		/* //2026 웹접근성 */
		if ($('div.wrapper').length > 0) {	//PC
			var popLength = $('.wrapper .popWrap.nowOpen').length;
			if (popLength < 1) {
				$('html, body').removeClass('popOn');
				if( isIOS == true ){
					var scrlPos = - parseInt( $('body').css('top') );
					$('body').css('top', 'auto');
					$('html').scrollTop( scrlPos );
				}
			}

		} else {	//MOBILE
			var popLength = $('div.popWrap.nowOpen').length;
			if (popLength < 1) {
				$('html, body').removeClass('popOn');
				if( isIOS == true ){
					var scrlPos = - parseInt( $('#content').css('top') );
					$('#content').css('top','auto');
					$('html, body').scrollTop( scrlPos );
				}
				//모바일
				/*if ($('#' + layerId).find('section.popup').length > 0 ) {
					//아이폰 버그 : 키패드 올라오면 팝업이 사라지는 현상
					$('section.content').show();
				}*/
			}
		}


		if(typeof callback === "function") {
			callback(callbackParam);
		}
	},

    focus: function(layerId) {
        var layer = $('#' + layerId);
        /* 2026 웹접근성 */
        var elCont = layer.find('.popup');

        // 팝업 자체에 포커스 먼저 부여 (사용자가 Tab 누르면 내부 진입)
        elCont.attr('tabindex', '-1').focus();

        // 팝업 내 접근 가능한 요소 찾기
        var selector = "button:not([disabled]), input:not([type='hidden']):not([disabled]), select:not([disabled]), iframe, textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])";
        var focusable = elCont.find(selector).filter(':visible');
		if (focusable.length > 0) {
            var first = focusable.first();
            var last = focusable.last();

            // Tab / Shift+Tab 포커스 순환
            layer.off('keydown.focustrap').on('keydown.focustrap', function(e) {
                if (e.keyCode !== 9) return;

                var activeEl = document.activeElement;

                // 팝업 자체에 포커스가 있을 때 Tab 시 내부 진입
                if (activeEl === elCont[0] || activeEl === layer[0]) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        last.focus();
                    } else {
                        first.focus();
                    }
                    return;
                }

                if (e.shiftKey && activeEl === first[0]) {
                    e.preventDefault();
                    last.focus(); // Shift+Tab : 첫번째 -> 마지막
                } else if (!e.shiftKey && activeEl === last[0]) {
                    e.preventDefault();
                    first.focus(); // Tab : 마지막 -> 첫번째
                }
            });
        } else {
            layer.off('keydown.focustrap').on('keydown.focustrap', function(e) {
                if (e.keyCode === 9) e.preventDefault();
            });
        }
        /* //2026 웹접근성 */
	}
};




/**
 * Infomation 팝업 (alert, confirm)
 *
 * @date 2022.07.18
 * @private
 * @memberOf
 * @author 70121(박상호)
 * @return N/A
 */
const uiInfo = {	
	$targetBtn: null, //2026 웹접근성

	mo : {
		alert : function(contents, callback){
			this.alertOpen(contents, callback);
		},
		alertScrollable : function(contents, callback){
			this.alertOpenScrollable(contents, callback);
		},
		confirm : function(contents, yesCallback, noCallback){
			this.confirmOpen('confirm1', contents, yesCallback, noCallback);
		},
		confirm2 : function(contents, yesCallback, noCallback){
			this.confirmOpen('confirm2', contents, yesCallback, noCallback);
		},
		bottom : function(contents1, contents2, yesCallback, noCallback) {
			this.bottomOpen('1', '', contents1, contents2, yesCallback, noCallback);
		},
		bottom2 : function(title, contents1, contents2, yesCallback, noCallback) {
			this.bottomOpen('2', title, contents1, contents2, yesCallback, noCallback);
		},
		/**
		 * confirm
		 *
		 * @date 2022.07.18
		 * @param1 : type : 1 : 버튼 [확인][취소], 2: 버튼 [예][아니오]
		 * @param2 : contents : confirm의 내용 : 경로메세지(ex. 이름은 필수값 입니다.)
		 * @param3 : yesCallback : 함수 : confirm의 '예' 버튼 클릭 후 전달되는 콜백
		 * @param4 : noCallback : 함수 : confirm의 '아니오' 버튼 클릭 후 전달되는 콜백
		 */
		confirmOpen : function(type, contents, yesCallback, noCallback){
			if (contents.indexOf('\n') >= 0) {
				contents = contents.replace(/\n/gi, '<br>');
			} else if (!contents) {
				contents = "";
			}

			let shownLength = $(`[data-Type="moAlert"]`).length;
			let html = this.alertHtml(type, 'globalConfirm' + shownLength, contents);
			let drawAlertId = $(html).attr('id');

			/**
			 *  2중 팝업시 마지막 팝업 상위 지정
			 **/
			var layerWrapCnt = 0;
			var zIdx = 57001;
			if (!!event) {
				layerWrapCnt = $(event.target).parents('div.popWrap').length;
				if (layerWrapCnt > 0) {
					zIdx = zIdx + 1;
				}
			}

			$('body').append(html);

			$(`#${drawAlertId}`).css('z-index', zIdx ).attr({'data-idx': zIdx, 'tabindex': -1}).fadeIn().addClass('nowOpen').focus();	//레이어 팝업 show

			if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
				if( $('body').hasClass('isIOS') ){
					var popLength = $('div.popWrap.nowOpen').length;
					if (popLength == 1) {
						var scrlPos = $(window).scrollTop();
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('#content').css('top','-'+scrlPos+'px');
					}
				}
				$('html, body').addClass('popOn');
			}

			//'아니오', '취소' 버튼 이벤트
			$(`#${drawAlertId}`).find('.globalConfirmNoBtn').off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.close(drawAlertId, noCallback);
				return false;
			});
			//'예', '확인' 버튼 이벤트
			$(`#${drawAlertId}`).find('.globalConfirmYesBtn').off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.close(drawAlertId, yesCallback);
				return false;
			});

			layerPop.focus(drawAlertId);
			return false;
		},
		/**
		 * alert
		 *
		 * @date 2022.07.18
		 * @param1 : title : alert의 제목 : 없을 경우 ''
		 * @param2 : contents : alert의 내용 : 경로메세지(ex. 이름은 필수값 입니다.)
		 * @param3 : callback함수 : alert의 '확인' 버튼 클릭 후 전달되는 콜백
		 */
		alertOpen : function(contents, callback){
			if (!!contents && contents.indexOf('\n') >= 0) {
				contents = contents.replace(/\n/gi, '<br>');
			} else if (!contents) {
				contents = "";
			}

			let shownLength = $(`[data-Type="moAlert"]`).length;
			let html = this.alertHtml('alert', 'globalAlert' + shownLength, contents);
			let drawAlertId = $(html).attr('id');

			/**
			 *  2중 팝업시 마지막 팝업 상위 지정
			 **/
			var layerWrapCnt = 0;
			var zIdx = 57001;
			if (!!event) {
				layerWrapCnt = $(event.target).parents('div.popWrap').length;
				if (layerWrapCnt > 0) {
					zIdx = zIdx + 1;
				}
			}

			$('body').append(html);

			$(`#${drawAlertId}`).css('z-index', zIdx ).attr({'data-idx': zIdx, 'tabindex': -1}).fadeIn().addClass('nowOpen').focus();

			if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
				if( $('body').hasClass('isIOS') ){
					var popLength = $('div.popWrap.nowOpen').length;
					if (popLength == 1) {
						var scrlPos = $(window).scrollTop();
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('#content').css('top','-'+scrlPos+'px');
					}
				}
				$('html, body').addClass('popOn');
			}

			//확인버튼 이벤트
			$(`#${drawAlertId} .globalAlertBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.close(drawAlertId, callback);
				return false;
			});

			//'아니오', '취소' 버튼 이벤트
			$(`#${drawAlertId} .globalBottomNoBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.bottomClose(drawAlertId, noCallback);
				return false;
			});
			//'예', '확인' 버튼 이벤트
			$(`#${drawAlertId} .globalBottomYesBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.bottomClose(drawAlertId, yesCallback);
				return false;
			});
			layerPop.focus(drawAlertId);
			return false;
		},
		alertHtml : function(type, id, contents){
			var html = "";
				html += '<div class="popWrap alertPop" id="'+id+'" data-type="moAlert" style="z-index:57001; tabindex:-1">\n';
				html += '	<section class="popup alert">\n';
				html += '		<div class="popCont">\n';
				html += '			<p>'+contents+'</p>\n';
				html += '			<div class="btnArea sticky half">\n';
				if (type == 'alert') {
					html += '				<button type="button" class="btn_p globalAlertBtn">확인</button>\n';
				} else if (type == 'confirm1') {
					html += '				<button type="button" class="btn_g globalConfirmNoBtn">취소</button>\n';
					html += '				<button type="button" class="btn_p globalConfirmYesBtn">확인</button>\n';
				} else if (type == 'confirm2') {
					html += '				<button type="button" class="btn_g globalConfirmNoBtn">아니오</button>\n';
					html += '				<button type="button" class="btn_p globalConfirmYesBtn">예</button>\n';
				}
				html += '			</div>\n';
				html += '		</div>\n';
				html += '	</section>\n';
				html += '</div>\n';

			return html;
		},
		alertOpenScrollable : function(contents, callback){
			if (!!contents && contents.indexOf('\n') >= 0) {
				contents = contents.replace(/\n/gi, '<br>');
			} else if (!contents) {
				contents = "";
			}

			let shownLength = $(`[data-Type="moAlert"]`).length;
			let html = this.alertScrollableHtml('alert', 'globalAlert' + shownLength, contents);
			let drawAlertId = $(html).attr('id');

			/**
			 *  2중 팝업시 마지막 팝업 상위 지정
			 **/
			var layerWrapCnt = 0;
			var zIdx = 57001;
			if (!!event) {
				layerWrapCnt = $(event.target).parents('div.popWrap').length;
				if (layerWrapCnt > 0) {
					zIdx = zIdx + 1;
				}
			}

			$('body').append(html);

			$(`#${drawAlertId}`).css('z-index', zIdx ).attr({'data-idx': zIdx, 'tabindex': -1}).fadeIn().addClass('nowOpen').focus();

			if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
				if( $('body').hasClass('isIOS') ){
					var popLength = $('div.popWrap.nowOpen').length;
					if (popLength == 1) {
						var scrlPos = $(window).scrollTop();
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('#content').css('top','-'+scrlPos+'px');
					}
				}
				$('html, body').addClass('popOn');
			}

			//확인버튼 이벤트
			$(`#${drawAlertId} .globalAlertBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.close(drawAlertId, callback);
				return false;
			});

			//'아니오', '취소' 버튼 이벤트
			$(`#${drawAlertId} .globalBottomNoBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.bottomClose(drawAlertId, noCallback);
				return false;
			});
			//'예', '확인' 버튼 이벤트
			$(`#${drawAlertId} .globalBottomYesBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.bottomClose(drawAlertId, yesCallback);
				return false;
			});
			layerPop.focus(drawAlertId);
			return false;
		},
		alertScrollableHtml : function(type, id, contents){
			var html = "";
				html += '<div class="popWrap alertPop" id="'+id+'" data-type="moAlert" style="z-index:57001; tabindex:-1">\n';
				html += '	<section class="popup alert">\n';
				html += '		<div class="popCont" style="padding:0 0 0 0">\n';
				html += '			<div style="max-height:calc(100vh - 300px); overflow-y:auto; padding:25px 24px 80px 24px">\n'
				html += '				<p>'+contents+'</p>\n';
				html += '			</div>\n'
				html += '			<div class="btnArea sticky half">\n';
				if (type == 'alert') {
					html += '				<button type="button" class="btn_p globalAlertBtn">확인</button>\n';
				} else if (type == 'confirm1') {
					html += '				<button type="button" class="btn_g globalConfirmNoBtn">취소</button>\n';
					html += '				<button type="button" class="btn_p globalConfirmYesBtn">확인</button>\n';
				} else if (type == 'confirm2') {
					html += '				<button type="button" class="btn_g globalConfirmNoBtn">아니오</button>\n';
					html += '				<button type="button" class="btn_p globalConfirmYesBtn">예</button>\n';
				}
				html += '			</div>\n';
				html += '		</div>\n';
				html += '	</section>\n';
				html += '</div>\n';

			return html;
		},
		bottomOpen : function(type, title, contents1, contents2, yesCallback, noCallback){
			if (!!title && title.indexOf('\n') >= 0) {
				title = title.replace(/\n/gi, '<br>');
			} else if (!title) {
				title = "";
			}
			if (!!contents1 && contents1.indexOf('\n') >= 0) {
				contents1 = contents1.replace(/\n/gi, '<br>');
			} else if (!contents1) {
				contents1 = "";
			}
			if (!!contents2 && contents2.indexOf('\n') >= 0) {
				contents = contents2.replace(/\n/gi, '<br>');
			} else if (!contents2) {
				contents2 = "";
			}

			var shownLength = $(`[data-Type="moBottom"]`).length;
			var html = this.bottomHtml(type, 'globalBottom' + shownLength, title, contents1, contents2);
			var drawAlertId = $(html).attr('id');

			/**
			 *  2중 팝업시 마지막 팝업 상위 지정
			 **/
			var layerWrapCnt = 0;
			var zIdx = 2000;
			if (!!event) {
				layerWrapCnt = $(event.target).parents('div.popWrap').length;
				if (layerWrapCnt > 0) {
					zIdx = zIdx + 1;
				}
			}

			$('body').append(html);

			$(`#${drawAlertId}`).fadeIn().addClass('nowOpen').addClass('bottomSheet').focus();
			$(`#${drawAlertId} section`).addClass('open');

			if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
				if( $('body').hasClass('isIOS') ){
					var popLength = $('div.popWrap.nowOpen').length;
					if (popLength == 1) {
						var scrlPos = $(window).scrollTop();
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('#content').css('top','-'+scrlPos+'px');
					}
				}
				$('html, body').addClass('popOn');
			}

			//'아니오', '취소' 버튼 이벤트
			$(`#${drawAlertId} .icoBtn_close`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.bottomClose(drawAlertId);
				return false;
			});

			//'아니오', '취소' 버튼 이벤트
			$(`#${drawAlertId} .globalBottomNoBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.bottomClose(drawAlertId, noCallback);
				return false;
			});
			//'예', '확인' 버튼 이벤트
			$(`#${drawAlertId} .globalBottomYesBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.mo.bottomClose(drawAlertId, yesCallback);
				return false;
			});

			layerPop.focus(drawAlertId);
			return false;
		},
		bottomHtml : function(type, id, title, content1, content2){
			var html = '';
				html += '<div class="popWrap" id="'+id+'" style="z-index:2001; tabindex:-1">\n';
				html += '	<section class="popup bottomSheet">\n';
				html += '		<div class="popCont" role="dialog">\n';
				if (type == '2') {
					html += '			<header><h1>'+title+'</h1></header>\n';
				}
				html += '			<div class="popBody" tabindex="0">\n';
				if (type == '1') {
					html += '				<div class="msgArea">\n';
					html += '					<p class="copy">'+content1+'</p>\n';
					html += '					<p class="desc">'+content2+'</p>\n';
					html += '				</div>\n';
				} else if (type == '2') {
					html += '				<div class="ac">\n';
					html += '					<p class="titH3">'+content1+'</p>\n';
					html += '					<p class="txtM">'+content2+'</p>\n';
					html += '				</div>\n';
				}
				if (type == '1') {
					html += '				<div class="btnArea sticky">\n';
					html += '					<button type="button" class="btn_g globalBottomNoBtn">아니요</button>\n';
					html += '					<button type="button" class="btn_p globalBottomYesBtn">예</button>\n';
					html += '				</div>\n';
				} else if (type == '2') {
					html += '				<div class="btnArea sticky half">\n';
					html += '					<button type="button" class="btn_s globalBottomNoBtn">아니요</button>\n';
					html += '					<button type="button" class="btn_p globalBottomYesBtn">예</button>\n';
					html += '				</div>\n';
				}
				html += '			</div>\n';
				html += '			<button type="button" class="icoBtn_close" ></button>\n';
				html += '		</div>\n';
				html += '	</section>\n';
				html += '</div>\n';

			return html;

		},
		bottomClose : function(layerId, callback){
			$('#' + layerId).remove();
			var popLength = $('body .popWrap.open').length;
			if (popLength < 1) {
				$('html, body').removeClass('popOn');
				if( isIOS == true ){
					var scrlPos = - parseInt( $('#content').css('top') );
					$('#content').css('top','auto');
					$('html, body').scrollTop( scrlPos );
				}
			}
			if($(event.target).get(0).nodeName.toLowerCase() != "button"){
				$(event.target).get(0).parentNode.focus();
			} else {
				$(event.target).focus();
			}
			if(typeof callback === "function") {
				callback();
			}
		},
		close : function(layerId, callback){
			$('#' + layerId).remove();
			var popLength = $('body .popWrap.nowOpen').length;
			if (popLength < 1) {
				$('html, body').removeClass('popOn');
				if( isIOS == true ){
					var scrlPos = - parseInt( $('#content').css('top') );
					$('#content').css('top','auto');
					$('html, body').scrollTop( scrlPos );
				}
			}
			if($(event.target).get(0).nodeName.toLowerCase() != "button"){
				$(event.target).get(0).parentNode.focus();
			} else {
				$(event.target).focus();
			}
			if(typeof callback === "function") {
				callback();
			}
		}
	},
	pt : {
		alert : function(title, contents, callback){
			this.alertOpen(title, contents, callback);
		},
		confirm : function(title, contents, yesCallback, noCallback){
			this.confirmOpen('1', title, contents, yesCallback, noCallback);
		},
		confirm2 : function(title, contents, yesCallback, noCallback){
			this.confirmOpen('2', title, contents, yesCallback, noCallback);
		},
		/**
		 * alert
		 *
		 * @date 2022.07.18
		 * @param1 : title : alert의 제목 : 없을 경우 ''
		 * @param2 : contents : alert의 내용 : 경로메세지(ex. 이름은 필수값 입니다.)
		 * @param3 : callback함수 : alert의 '확인' 버튼 클릭 후 전달되는 콜백
		 */
		alertOpen : function(title, contents, callback){
			uiInfo.$targetBtn =$(document.activeElement); //2026 웹접근성
			if (!!title && title.indexOf('\n') >= 0) {
				title = title.replace(/\n/gi, '<br>');
			} else if (!title) {
				title = "";
			}

			if (!!contents && contents.indexOf('\n') >= 0) {
				contents = contents.replace(/\n/gi, '<br>');
			} else if (!contents) {
				contents = "";
			}

			let shownAlertLength = $(`[data-Type="alert"]`).length;

			let html = this.alertHtml(title, contents, 'globalAlert' + shownAlertLength);
			let drawAlertId = $(html).attr('id');


			/**
			 *  2중 팝업시 마지막 팝업 상위 지정
			 **/
			var layerWrapCnt = 0;
			var zIdx = 999999;
			if (!!event) {
				layerWrapCnt = $(event.target).parents('div.popWrap').length;
				if (layerWrapCnt > 0) {
					zIdx = zIdx + 1;
				}
			}

			if ($('#wrapper').length > 0) {
				$('#wrapper').append(html);
			} else {
				$('body').append(html);
			}
			$(`#${drawAlertId}`).css('z-index', zIdx ).fadeIn().addClass('nowOpen').focus();

			if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
				if( $('body').hasClass('isIOS') ){
					var popLength = $('.wrapper .popWrap.nowOpen').length;
					if (popLength == 1) {
						var scrlPos = $(window).scrollTop();
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('body').css('top','-'+scrlPos+'px').css('width', '100%');
					}
				}
				$('html, body').addClass('popOn');
			}

			//확인버튼 이벤트
			$(`#${drawAlertId} .globalAlertBtn`).off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.pt.close(drawAlertId, callback);
				return false;
			});

			layerPop.focus(drawAlertId);
			return false;
		},
		alertHtml : function(title, contents, id){
			var html = "";
				html += '<div class="popWrap alertPop" id="'+id+'" data-Type="alert" style="opacity:1; z-index:999999; tabindex:-1">\n';
				html += '	<div class="popContain">\n';
				html += '		<div class="popup alert">\n';
				html += '			<div class="popBody">\n';
				html += '				<strong class="tit">'+ title +'</strong>\n';
				html += '				<p>'+contents+'</p>\n';
				html += '			</div>\n';
				html += '			<div class="btn_wrap">\n';
				html += '				<button type="button" class="btn_primary globalAlertBtn"><span>확인</span></button>\n';
				html += '			</div>\n';
				html += '		</div>\n';
				html += '	</div>\n';
				html += '</div>\n';

			return html;
		},
		/**
		 * confirm
		 *
		 * @date 2022.07.18
		 * @param1 : title : confirm의 제목 : 없을 경우 ''
		 * @param2 : contents : confirm의 내용 : 경로메세지(ex. 이름은 필수값 입니다.)
		 * @param3 : yesCallback : 함수 : confirm의 '예' 버튼 클릭 후 전달되는 콜백
		 * @param4 : noCallback : 함수 : confirm의 '아니오' 버튼 클릭 후 전달되는 콜백
		 */
		confirmOpen : function(type, title, contents, yesCallback, noCallback){
			uiInfo.$targetBtn =$(document.activeElement); //2026 웹접근성
			if (title.indexOf('\n') >= 0) {
				title = title.replace(/\n/gi, '<br>');
			} else if (!contents) {
				title = "";
			}

			if (contents.indexOf('\n') >= 0) {
				contents = contents.replace(/\n/gi, '<br>');
			} else if (!contents) {
				contents = "";
			}

			let shownAlertLength = $(`[data-Type="confirm"]`).length;

			let html = this.confirmHtml(type, 'globalConfirm' + shownAlertLength, title, contents);
			let drawConfirmId = $(html).attr('id');

			/**
			 *  2중 팝업시 마지막 팝업 상위 지정
			 **/
			var layerWrapCnt = 0;
			var zIdx = 999999;
			if (!!event) {
				layerWrapCnt = $(event.target).parents('div.popWrap').length;
				if (layerWrapCnt > 0) {
					zIdx = zIdx + 1;
				}
			}

			$('#wrapper').append(html);
			$(`#${drawConfirmId}`).css('z-index', zIdx).fadeIn().addClass('nowOpen').focus();	//레이어 팝업 show

			if( $('body').hasClass('popOn') == false ){//전체레이아웃 스크롤 막기
				if( $('body').hasClass('isIOS') ){
					var popLength = $('.wrapper .popWrap.nowOpen').length;
					if (popLength == 1) {
						var scrlPos = $(window).scrollTop();
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('body').css('top','-'+scrlPos+'px').css('width', '100%');
					}
				}
				$('html, body').addClass('popOn');
			}

			//'아니오', '취소' 버튼 이벤트
			$(`#${drawConfirmId}`).find('.globalConfirmNoBtn').off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.pt.close(drawConfirmId, noCallback);
				return false;
			});
			//'예', '확인' 버튼 이벤트
			$(`#${drawConfirmId}`).find('.globalConfirmYesBtn').off('click').on('click', function(e){
				e.preventDefault();
				uiInfo.pt.close(drawConfirmId, yesCallback);
				return false;
			});

			layerPop.focus(drawConfirmId);
			return false;
		},
		confirmHtml : function(type, id, title, contents){
			var html = "";
				html += '<div class="popWrap alertPop" id="'+id+'" data-Type="confirm" style="opacity:1; z-index:999999; tabindex:-1">\n';
				html += '	<div class="popContain">\n';
				html += '		<div class="popup alert">\n';
				html += '			<div class="popBody">\n';
				html += '				<strong class="tit">'+ title +'</strong>\n';
				html += '				<p>'+contents+'</p>\n';
				html += '			</div>\n';
				html += '			<div class="btn_wrap">\n';
				if (type == '1') {
					html += '				<button type="button" class="btn_gray globalConfirmNoBtn"><span>취소</span></button>\n';
					html += '				<button type="button" class="btn_primary globalConfirmYesBtn"><span>확인</span></button>\n';
				} else if (type == '2') {
					html += '				<button type="button" class="btn_gray globalConfirmNoBtn"><span>아니오</span></button>\n';
					html += '				<button type="button" class="btn_primary globalConfirmYesBtn"><span>예</span></button>\n';
				}
				html += '			</div>\n';
				html += '		</div>\n';
				html += '	</div>\n';

				html += '</div>\n';

			return html;
		},
		close : function(layerId, callback){
			$('#' + layerId).remove();
			var popLength = $('.wrapper .popWrap.nowOpen').length;
			if (popLength < 1) {
			 	$('html, body').removeClass('popOn');
				if( isIOS == true ){
					var scrlPos = - parseInt( $('body').css('top') );
					$('html').scrollTop( scrlPos );
					$('body').prop('style').removeProperty('top');
				}
			}
			/* 2026 웹접근성 */
            // 저장해둔 원래 버튼으로 정확히 포커스 복원
            if (uiInfo.$targetBtn && uiInfo.$targetBtn.length) {
                uiInfo.$targetBtn.focus();
                uiInfo.$targetBtn = null;
			}
			/* //2026 웹접근성 */
			if(typeof callback === "function") {
				callback();
			}
		}
	}
};

/** Validation */
const sbCommValid = {
	//1. 공백과 관련된 함수들
	/** 공백인지 체크하는 함수 */
	isEmptyCheck : function(input){
		if (typeof input === 'undefined' || input === null || !input) {
			return true;
		}
	},

	/** 공백이 아닌지 체크하는 함수 */
	isNotEmptyCheck : function(input) {
		return !sbCommValid.isEmptyCheck(input);
	},

	//2. "확인" 버틀을 누를 때 사용가능한 함수들(Click)
	/** 숫자만 입력되었는지 확인 */
	isOnlyNumber : function(number) {
		return /^[0-9]+$/.test(number);
	},

	/** 펀드 비율 입력을 위한 함수로서, 5단위의 숫자만 입력었는지 확인(0부터 100까지의 숫자 중) */
	isOnlyNumberByFive : function(number){//0은 허용
		return (Number(number)%5 == 0 && Number(number) <= 100);
	},

	/** 키 검증을 위한 함수로서, 숫자만 입력되게 하되, 정수와 소수점 첫째자리까지 입력되었는지 확인*/
	isOnlyNumberForH : function(number){
		if (number.indexOf(".")>0){//소수점 입력시
			return /^[0-9]{0,3}\.{1}[0-9]{0,1}$/.test(number);
		} else {//소수점 미입력시
			return /^[0-9]+$/.test(number);
		}
	},

	/** 몸무게 검증을 위한 함수로서, 숫자만 입력되게 하되, 정수와 소수점 첫째자리까지 입력되었는지 확인 */
	isOnlyNumberForW : function(number){
		if (number.indexOf(".")>0){//소수점 입력시
			return /^[0-9]{0,3}\.{1}[0-9]{0,1}$/.test(number);
		} else {//소수점 미입력시
			return /^[0-9]+$/.test(number);
		}
	},

	/** 숫자와 "-"만 입력되었는지 확인*/
	isOnlyNumberWithBar : function(str){
		return /^[0-9\-]+$/.test(str);
	},

	/** 영문자 대문자만 입력되었는지 확인*/
	isOnlyCapital : function(str){
		return /^[A-Z]+$/.test(str);
	},

	/** 공백을 포함하여 영문자만 입력되었는지 확인 */
	isOnlyEnglish : function(str){
		return /^[a-zA-Z\s]+$/.test(str);
	},

	/** 전화번호 유효성 검사("0000", 즉 앞, 뒤자리를 따로 입력하는 경우) */
	isTelePhoneShort : function(phoneNo){
		if (phoneNo.length > 0 && phoneNo.length <= 4){ //0000 or 000
			return /^([0-9]{3,4})$/.test(phoneNo);
		} else { //그외
			return false;
		}
	},

	/** 전화번호 유효성 검사(1. "0000-0000", 2. "000-0000" 경우만 허용) */
	isTelePhoneLong : function(phoneNo){
		if (phoneNo.length > 4){//0000-0000 or 000-0000
			return /^([0-9]{3,4})-?([0-9]{4})$/.test(phoneNo);
		} else { //그외
			return false;
		}
	},

	/** 이메일 주소 유효성 검사 */
	isEmail : function (email) {
		return /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
	},

	/** 한글만 입력되었는지 확인 */
	isOnlyKorean : function(str){
		return /^[가-힣ㄱ-하-ㅣ]+$/.test(str);
	},

	/** 한글과 공백만 입력되었는지 확인 */
	isOnlyKoreanWithSpace : function(str){
		return /^[가-힣ㄱ-하-ㅣ\s]+$/.test(str);
	},

	/* 운전면허 번호 유효성 검사(00-00-000000-00 형식인지 확인)*/
	isLicenseNumCheck : function(licenseNum){
		return /^[0-9]{2}-[0-9]{2}-[0-9]{6}-[0-9]{2}$/.test(licenseNum);
	},

	/** 펀드 비율과 펀드 비율 합계에 관한 유효성 검사*/
	fundCheck : function(){//data-fundRt 클래스로 가져옴
		let fundCnt = $(".data-fundRt").length;

		if (fundCnt === 0){ //펀드 비율 입력 부분이 아예 없는 경우
			return true;
		} else if (fundCnt >= 1){ //펀드 비율 입력 부분이 하나 이상 존재하는 경우
			let fundTotal = 0; //펀드 합계

			$('.data-fundRt').each(function() {
				fundTotal += Number(this.value); //string으로 들어오므로
			});

			if (fundTotal > 100){
				uiInfo.pt.alert('', '펀드비율합계는 100%가 되어야 합니다.', function(){
					$('.data-fundRt').last().val(""); //마지막
					return false;
				});
			} else if (fundTotal < 100){
				uiInfo.pt.alert('', '펀드비율합계는 100%가 되어야 합니다. 펀드비율을 입력해주세요.', '');
				return false;
			} else {
				return true;
			}
		}
	},


	//3. 입력을 하면서 사용가능한 함수들(Blur)
	/** 펀드 비율 입력을 위한 함수로서, 5단위의 숫자만 입력었는지 확인(0부터 100까지의 숫자 중) */
	onlyNumberByFiveBlur : function(number){
		//blur시에 사용, 유효성에 맞지 않으면 입력값 초기화를 위해 공백 반환
		return this.isOnlyNumberByFive(number) ? number : "";
	},

	/** 숫자만 입력되지 않으면 공백 반환  */
	onlyNumberBlur : function(number) {
		return this.isOnlyNumber(number) ? number : "";
	},

	/** 키 검증을 위한 함수로서, 숫자만 입력되게 하되, 정수와 소수점 첫째자리까지 입력되었는지 확인, 아니면 공백 반환*/
	onlyNumberForHBlur : function(number){
		return this.isOnlyNumberForH(number) ? number : "";
	},

	/** 몸무게 검증을 위한 함수로서, 숫자만 입력되게 하되, 정수와 소수점 첫째자리까지 입력되었는지 확인, 아니면 공백 반환 */
	onlyNumberForWBlur : function(number){
		return this.isOnlyNumberForW(number) ? number : "";
	},

	/** 숫자와 "-"만 입력되었는지 확인, 아니면 공백 반환*/
	onlyNumberWithBarBlur : function(str){
		return this.isOnlyNumberWithBar(str) ? str : "";
	},

	/** 영문자 대문자만 입력되었는지 확인, 아니면 공백 반환*/
	onlyCapitalBlur : function(str){
		return this.isOnlyCapital(str) ? str : "";
	},

	/** 공백을 포함하여 영문자만 입력되었는지 확인, 아니면 공백 반환 */
	onlyEnglishWordsBlur : function(str){
		return this.isOnlyEnglishWords(str) ? str : "";
	},

	/** 전화번호 유효성 검사("0000", 즉 앞, 뒤자리를 따로 입력하는 경우), 아니면 공백 반환 */
	telePhoneShortBlur : function(phoneNo){
		return this.isTelePhoneShort(phoneNo) ? phoneNo : "";
	},

	/** 전화번호 유효성 검사(1. "0000-0000", 2. "000-0000" 경우만 허용), 아니면 공백 반환 */
	telePhoneLongBlur : function(phoneNo){
		return this.isTelePhoneLong(phoneNo) ? phoneNo : "";
	},

	/** 이메일 주소 유효성 검사, 아니면 공백 반환 */
	emailBlur : function (email) {
		return this.isEmail(email) ? email : "";
	},

	/** 한글만 입력되었는지 확인, 아니면 공백 반환 */
	onlyKoreanBlur : function(str){
		return this.isOnlyKorean(str) ? str : "";
	},

	/** 한글과 공백만 입력되었는지 확인, 아니면 공백 반환 */
	onlyKoreanWithSpaceBlur : function(str){
		return this.isOnlyKoreanWithSpace(str) ? str : "";
	},

	/* 운전면허 번호 유효성 검사(00-00-000000-00 형식인지 확인), 아니면 공백 반환*/
	licenseNumberCheckBlur : function(licenseNum){
		return this.isLicenseNumCheck(licenseNum) ? licenseNum : "";
	},


	//4. 날짜 관련 함수
	/** 숫자 및 날짜 입력시 YYYY.MM 형식으로 입력되었는지 확인 */
	isDateFormatMonth : function(str){
		return /^[0-9]{4}\.[0-9]{2}$/.test(str);
	},

	/** 숫자 및 날짜 입력시 YYYY.MM.DD 형식으로 입력되었는지 확인 */
	isDateFormatDate : function(str){
		return /^[0-9]{4}\.[0-9]{2}\.[0-9]{2}$/.test(str);
	},

	/** 숫자 및 날짜 입력시 YYYY.MM 형식으로 입력되었는지 확인, 아니면 공백 반환 */
	dateFormatMonthBlur : function(str){
		return this.isDateFormatMonth(str) ? str : "";
	},

	/** 숫자 및 날짜 입력시 YYYY.MM.DD 형식으로 입력되었는지 확인, 아니면 공백 반환 */
	dateFormatDateBlur : function(str){
		return this.isDateFormatDate(str) ? str : "";
	},

	/** 숫자 및 날짜 입력시 YYYY.MM 형식으로 반환 */
	dateFormatMonth : function(str){
		if (/^[0-9]{4}\.[0-9]{2}$/.test(str)){//YYYY.MM으로 잘 들어올 때
			return str;
		} else if (/^[0-9]{6,}$/.test(str)){//YYYYMM으로 들어올 때 or YYYYMMDD 등으로 들어올 때
			return str.substring(0,4) + "." + str.substring(4,6);
		} else if (/^[0-9]{4}\/[0-9]{2}$/.test(str)){//YYYY/MM으로 들어올 때
			return str.substring(0,4) + "." + str.substring(5,7);
		} else {
			return "";
		}
	},

	/** 숫자 및 날짜 입력시 YYYY.MM.DD 형식으로 반환 */
	dateFormatDate : function(str){
		if (/^[0-9]{4}\.[0-9]{2}\.[0-9]{2}$/.test(str)){//YYYY.MM.DD으로 잘 들어올 때
			return str;
		} else if (/^[0-9]{8,}$/.test(str)){//YYYYMMDD 등으로 들어올 때
			return str.substring(0,4) + "." + str.substring(4,6) + "." + str.substring(6,8);
		} else if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/.test(str)){//YYYY/MM/DD로 들어올 때
			return str.substring(0,4) + "." + str.substring(5,7) + "." + str.substring(8,10);
		} else {
			return "";
		}
	},
	/** 모바일인지 여부 체크 */
	CheckIsMobile : function(){
		return /Android|WebOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
}



function maskingSample(testCall){
	if (testCall == 'ggNo6') {
		alert('-존재==' + maskingView.ggNoSuffix6('123456-1234567'));
		alert('-미존재==' + maskingView.ggNoSuffix6('1234561234567'));
	} else if (testCall == 'ggNo7') {
		alert('-존재==' + maskingView.ggNoSuffix7('123456-1234567'));
		alert('-미존재==' + maskingView.ggNoSuffix7('1234561234567'));
	} else if (testCall == 'accountNo') {
		alert('accountNo' + maskingView.accountNo('1002-333-324155'));
	} else if (testCall == 'cardNo') {
		alert('cardNo - 존재 =' + maskingView.cardNo('1234-1234-1234-1234'));
		alert('cardNo - 미존재 =' + maskingView.cardNo('1234123412341234'));
	} else if (testCall == 'address') {
		alert('address =' + maskingView.address('율곡아파트 342동 1106호'));
	}
}

var maskingView = {
	address : function(value) {
		//도로명 이하 건물번호 및 상세주소의 숫자
		//데이터 컬럼 구조가 : 도로명 주소 + 상세주소로 되어 있기 때문에 상세주소만 전체 마스킹하는 로직으로 구현!!
		//호출시 상세주소값만 파라미터로 넘기면 됨.
		let maskedTxt = value;
		let arrChar = [];
		for (let i = 0; i < value.length; i++) {
			let char = value.charAt(i);
			if (char == ' ') {
				arrChar.push(' ');
			} else {
				arrChar.push('*');
			}
		}
		if (arrChar.length > 0) {
			maskedTxt = arrChar.join('');
		}
		return maskedTxt;
	},
	accountNo : function(value) {
		//계좌번호 : 뒷 4자리 마스킹
		return value.substring(0, value.length - 4) + '****';
	},
	hpNo : function(value) {

		//핸드폰번호 - 기준으로 2번째영역 3~4글자 마스킹
		let maskedTxt = value;
		let prefix, suffix;

		if (value.indexOf('-') >= 0) {	// 하이픈이 있는 경우

			let values = value.split('-');
			values[1] = value.length > 12 ? '****' : '***';
			maskedTxt = values.join('-');
		} else {

			let midMasking;

			// 전체길이를 체크하여 Prefix와 Suffix를 재 정의한다.
			// Cf. 0107770909, 01077779090
			if (value.length > 10) {	//하이픈이 없는경우

				prefix = value.substring(0, 3);
				suffix = value.substring(7);
				midMasking = '****';
			} else{

				prefix = value.substring(0, 3);
				suffix = value.substring(6);
				midMasking = '***';
			}

			maskedTxt = prefix + middleMask +  suffix;
		}

		return maskedTxt;
	},
	cardNo : function(value) {
		//카드번호 - 기준으로 3번째영역 4글자 마스킹
		let maskedTxt = value;
		if (value.indexOf('-') >= 0) {
			let values = value.split('-');
			values[2] = '****';
			maskedTxt = values.join('-');
		} else {
			let prefix = value.substring(0, 8);
			let suffix = value.substring(12);

			maskedTxt = prefix + '****' +  suffix;
		}

		return maskedTxt;
	},
	ggNoSuffix6 : function(value) {
		/**
			case1. :  뒷6자리마스킹(type == 6) && '-' 존재	= 123456-1******
			case2. :  뒷6자리마스킹(type == 6) && '-' 미존재	= 1234561******
		**/
		return this.ggNo(6, value);
	},
	ggNoSuffix7 : function(value) {
		/**
			case1. :  뒷7자리마스킹(type == 7) && '-' 존재	= 123456-*******
			case2. :  뒷7자리마스킹(type == 7) && '-' 미존재	= 123456*******
		**/
		return this.ggNo(7, value);
	},
	ggNo : function(type, value){
		//주민번호 : 성별수집이용에 대한 별도 처리 목적등의 획득한 경우에는 뒷 6자리, 아닐 경우 뒷자리 7글자 전체 마스킹
		//***화면에 내려오는 주민번호 형식은 암호화가 되어 있어 자리수로 처리할수 없음.
		/**
			case1. :  뒷6자리마스킹(type == 6) && '-' 존재	= 123456-1******
			case2. :  뒷6자리마스킹(type == 6) && '-' 미존재	= 1234561******
			case3. :  뒷7자리마스킹(type == 7) && '-' 존재	= 123456-*******
			case4. :  뒷7자리마스킹(type == 7) && '-' 미존재	= 123456*******
		**/
		let rtnMaskTxt = '';
		if (value.indexOf('-') >= 0) {
			if (type == 6) {
				rtnMaskTxt = value.substring(0, 8) + '******';
			} else if (type == 7) {
				rtnMaskTxt = value.substring(0, 7) + '*******';
			}
		} else {
			if (type == 6) {
				rtnMaskTxt = value.substring(0, 7) + '******';
			} else if (type == 7) {
				rtnMaskTxt = value.substring(0, 6) + '*******';
			}
		}
		return rtnMaskTxt;
	}
}



if(!String.prototype.replaceAll){
	String.prototype.replaceAll = function() {
		if(arguments.length!=2){
			return null;
		}
		var v_regstr = arguments[0];
		v_regstr = v_regstr.replace(/\\/g, "\\\\");
		v_regstr = v_regstr.replace(/\^/g, "\\^");
		v_regstr = v_regstr.replace(/\$/g, "\\$");
		v_regstr = v_regstr.replace(/\*/g, "\\*");
		v_regstr = v_regstr.replace(/\+/g, "\\+");
		v_regstr = v_regstr.replace(/\?/g, "\\?");
		v_regstr = v_regstr.replace(/\./g, "\\.");
		v_regstr = v_regstr.replace(/\(/g, "\\(");
		v_regstr = v_regstr.replace(/\)/g, "\\)");
		v_regstr = v_regstr.replace(/\|/g, "\\|");
		v_regstr = v_regstr.replace(/\,/g, "\\,");
		v_regstr = v_regstr.replace(/\{/g, "\\{");
		v_regstr = v_regstr.replace(/\}/g, "\\}");
		v_regstr = v_regstr.replace(/\[/g, "\\[");
		v_regstr = v_regstr.replace(/\]/g, "\\]");
		v_regstr = v_regstr.replace(/\-/g, "\\-");
		var re = new RegExp(v_regstr, "g");
		return this.replace(re, arguments[1]);
	};
}

/**
 * 조직 제어 (검색옵션)
 *
 */
var organization = {
	searchAreaVaildate: function() {

		return ((organization.srchTgtArea == null || organization.srchTgtArea == undefined)
				  ? "ChannelList"
				  : organization.srchTgtArea);
	},
	
	/**
		각 select 값 변경시 호출되는 함수
		검색조건이 'al' 인 경우엔 초기화시 최초 1회 self 없이 호출함.
	 */
	setOrganizationList: function(self) {

		var orgSrchAreaId  = $(self).parents('ul').attr('id');

		if (orgSrchAreaId == null
		 || orgSrchAreaId == ""
	     || orgSrchAreaId == undefined
         || orgSrchAreaId == "null") {
			orgSrchAreaId = organization.searchAreaVaildate();
		}

		// Step1. 조직구조 변형에 필요한 변수선언
		var orgSelGbn, orgGbnVal;
		var userInfo = JSON.parse(sessionStorage.getItem('userInfo'));	// 설계사 정보
		var chanDv = userInfo.searchDv;//channel.userInfo.searchDv;//$("input:hidden[id='searchDv']").val();

		// Step2. 선택한 Select~Option onChnage에 따른 조직변경
		if(self == undefined || self == null) {	// 값이 없을때는 A.. (al: 전체)

			$('[id='+orgSrchAreaId+'] #channelSel').empty();			// 채널  Select~Option Clear
			$('[id='+orgSrchAreaId+'] #headquartersSel').empty(); 		// 본부  Select~Option Clear
			$('[id='+orgSrchAreaId+'] #branchOfficeSel').empty();		// 지점  Select~Option Clear
			$('[id='+orgSrchAreaId+'] #teamSel').empty();				// 팀    Select~Option Clear
			$('[id='+orgSrchAreaId+'] #agentSel').empty();       		// 판매인 Select~Option Clear

			this.createOrganization( {tgtOrgLevel: "D", tgtDom: $('#channelSel'), orgSelGbn, orgSrchAreaId} );	// 값이 없을때는 A.. (al: 전체)

		} else {

		 	orgSelGbn    = $(self).attr('orgGbn');		// 검색 옵션 레벨 selectbox 구분자로 쓰임 (C(채널), B(본부/대리점), J(지점/본부), T(팀/지점), P(본인만))
			orgGbnVal    = $(self).val();				// 옵션 선택 값

			if(orgSelGbn == 'C') { 	 	// 채널변경에 따른 하위조직

				$('[id='+orgSrchAreaId+'] #headquartersSel').empty(); 		// 본부  Select~Option Clear
				$('[id='+orgSrchAreaId+'] #branchOfficeSel').empty();		// 지점  Select~Option Clear
				$('[id='+orgSrchAreaId+'] #teamSel').empty();				// 팀    Select~Option Clear
				$('[id='+orgSrchAreaId+'] #agentSel').empty();       		// 판매인 Select~Option Clear
				
				/**
					채널 변경값에 따라 각 셀렉트 박스 텍스트를 변경해준다. 
				 */
				if(orgGbnVal === '9999GD') {
					$('[id='+orgSrchAreaId+'] #headquartersSelTxt').text('대리점');
					$('[id='+orgSrchAreaId+'] #branchOfficeSelTxt').text('본부');
					$('[id='+orgSrchAreaId+'] #teamSelTxt').text('지점');
				} else {
					$('[id='+orgSrchAreaId+'] #headquartersSelTxt').text('본부');
					$('[id='+orgSrchAreaId+'] #branchOfficeSelTxt').text('지점');
					$('[id='+orgSrchAreaId+'] #teamSelTxt').text('팀');
				}

				this.createOrganization({tgtOrgLevel: "K", tgtDom: $('[id='+orgSrchAreaId+'] #headquartersSel'), orgGbnVal, orgSrchAreaId});

			} else if(orgSelGbn == 'B') {  // (GA)대리점, (H/B)본부변경에 따른 하위 조직

				$('[id='+orgSrchAreaId+'] #branchOfficeSel').empty();		// 지점  Select~Option Clear
				$('[id='+orgSrchAreaId+'] #teamSel').empty();				// 팀    Select~Option Clear
				$('[id='+orgSrchAreaId+'] #agentSel').empty();       		// 판매인 Select~Option Clear
				
				if($('[id='+orgSrchAreaId+'] #channelSel').val() == "9999GD" ) {
					this.createOrganization({tgtOrgLevel: "H", tgtDom: $('[id='+orgSrchAreaId+'] #branchOfficeSel'), orgGbnVal, orgSrchAreaId});
				} else {
					this.createOrganization({tgtOrgLevel: "J", tgtDom: $('[id='+orgSrchAreaId+'] #branchOfficeSel'), orgGbnVal, orgSrchAreaId});
				}
			} else if(orgSelGbn == 'J') {  // 지점  변경에 따른 하위조직

				$('[id='+orgSrchAreaId+'] #teamSel').empty();				// 팀    Select~Option Clear
				$('[id='+orgSrchAreaId+'] #agentSel').empty();       		// 판매인 Select~Option Clear

				
				if($('[id='+orgSrchAreaId+'] #channelSel').val() == "9999GD" ) {	// 지점 불러오는 로직
					this.createOrganization({tgtOrgLevel: "J", tgtDom: $('[id='+orgSrchAreaId+'] #teamSel'), orgGbnVal, orgSrchAreaId});
				} else {	//팀을불러오는 로직.....
					this.createTeamAgt(chanDv, orgSelGbn, orgGbnVal, $('[id='+orgSrchAreaId+'] #teamSel'), orgSrchAreaId);
				}				

			} else if(orgSelGbn == 'T') {	// 팀 변경에 따른 판매인

				// 하이브리드일 시.. T팀을 바꾸었을때, 판매인 목록을 불러온다. 	 orgGbn: T

				$('[id='+orgSrchAreaId+'] #agentSel').empty();       		// 판매인 Select~Option Clear
				//판매인을 불러오는 로직.....
				this.createTeamAgt(chanDv, orgSelGbn, orgGbnVal, $('[id='+orgSrchAreaId+'] #agentSel'), orgSrchAreaId);

			}
			
		}
		

	},
	findAgentList: function() {

		var _self = this;
		_self = _self || this;

		let agentListStr = "";

		agentListStr = JSON.stringify(_self.agentList);

		for(var idx in _self.agentList) {

			console.log('AgentList['+idx+'] : '+_self.agentList[idx]);
		}

		return organization.agentList;
	},
	ttlOrgList: [],
	srchTgtArea: "",
	agentList: [],
	setAgentList: function(orgSrchAreaId) {

		if (orgSrchAreaId == null
		 || orgSrchAreaId == ""
	     || orgSrchAreaId == undefined
         || orgSrchAreaId == "null") {

			orgSrchAreaId = organization.searchAreaVaildate();
		}

		var url = "/ad/findLginMgtListView.json";
		var jsonReqParam = {};
		jsonReqParam['srchChnId']  = $('[id='+orgSrchAreaId+'] #channelSel').val();			// 채널  (선택 값)
		jsonReqParam['srchHdqId']  = $('[id='+orgSrchAreaId+'] #headquartersSel').val();		// 본부  (선택 값)
		jsonReqParam['srchBrfId']  = $('[id='+orgSrchAreaId+'] #branchOfficeSel').val();		// 지점  (선택 값)
		jsonReqParam['srchTeamId'] = $('[id='+orgSrchAreaId+'] #teamSel').val();				// 팀   (선택 값)
		jsonReqParam['srchUsrId']  = $('[id='+orgSrchAreaId+'] #agentSel').val();			// 판매인 (선택 값)
		var jsonjson = JSON.stringify(jsonReqParam);

		comTx.ajax(url, jsonReqParam, (obj, resultData, textStatus, jqXHR) => {

			// Step1. 판매인목록을 초기화 시킨다.
			organization.agentList = [];

			// Step2. 현재 조건으로 검색한 판매인목록을 다시 셋팅한다.
			for (const obj of resultData.lginMgtList) {

				organization.agentList.push(obj.usrId);
			}
		});
	},
	renderBaseOrgList: function(tgtDom, tgtOrgLevel, renderType, orgGbnVal) {

		const addCondition = 'optionOrg["UP_ORZ_CD"] == orgGbnVal';		//검색조건
		
		const addConditionGABonbu = 'optionOrgGA["BONBU_ORZ_CD"] == orgGbnVal';		//GA 지점 검색조건 (상위 본부 ORZ_CD를 찾아야 함)
		
		if(tgtDom.attr('id') === 'teamSel' && tgtOrgLevel === 'J') {
			for (var i=0; i < organization.ttlOrgList.length; i++) {
			var optionOrgGA = organization.ttlOrgList[i];
				if( optionOrgGA["ORZ_DV"] == tgtOrgLevel && ((renderType == 2) ? eval(addConditionGABonbu) : true) ) {	
				    createOption = $(document.createElement('option')).attr({value : optionOrgGA["ORZ_CD"] }).text(optionOrgGA["ORZ_NM"]);	
					$(tgtDom).append(createOption);	
				}
			}
			
		} else {
			for (var j=0; j < organization.ttlOrgList.length; j++) {
			var optionOrg = organization.ttlOrgList[j];
				if( optionOrg["ORZ_DV"] == tgtOrgLevel && ((renderType == 2) ? eval(addCondition) : true) ) {	
				    createOption = $(document.createElement('option')).attr({value : optionOrg["ORZ_CD"] }).text(optionOrg["ORZ_NM"]);	
					$(tgtDom).append(createOption);	
				}
			}
			
		}
		organization.reOrderOrgList(tgtDom, tgtOrgLevel);
	},
	reOrderOrgList: function(tgtDom, tgtOrgLevel) {

		let reOrderOrgList = new Array();
		let reOrderOrgListCopy = new Array();

		$(tgtDom).find('option').each(function(idx, elem) {

			if ($(elem).text() == "전체") return true;

			let reOrderObj = {}
			reOrderObj['ORZ_CD'] = $(elem).val();
			reOrderObj['ORZ_NM'] = $(elem).text();

			reOrderOrgList.push(reOrderObj);
		});


		reOrderOrgListCopy = reOrderOrgList.sort(function (a, b) {

			let x = a.ORZ_NM.toLowerCase();
			let y = b.ORZ_NM.toLowerCase();

			if (x < y) {

				return -1;
			}
			if (x > y) {

				return 1;
			}

			return 0;
		});

		$(tgtDom).empty();

		if (tgtOrgLevel == "J" || tgtOrgLevel == "H" || tgtOrgLevel == "K") {

			$(tgtDom).append('<option value="">전체</<option>');
		}

		$.each(reOrderOrgListCopy, (idx, elem) => {

			reCreateOption = $(document.createElement('option')).attr({value : elem["ORZ_CD"] }).text(elem["ORZ_NM"]);

			$(tgtDom).append(reCreateOption);

		});

	},
	createDefaultSel: function() {
		return `<option value="">전체</<option>`;
	},
	createOrganization: function(paramObj) {

		var _self = this;
		var { tgtOrgLevel, tgtDom, orgGbnVal, orgSrchAreaId } = paramObj;		//파라미터 { "조직레벨", "타켓 돔" }
		var userInfo = JSON.parse(sessionStorage.getItem('userInfo'));	// 설계사 정보

		const usrAuthGrpId = userInfo.usrAuthGrpId;//channel.userInfo.usrAuthGrpId;//document.getElementById("usrAuthGrpId").value;
		const usrSearchDv = userInfo.searchDv;//channel.userInfo.searchDv;//document.getElementById("searchDv").value;

		if (usrAuthGrpId == null || usrAuthGrpId == "" || usrAuthGrpId == undefined || usrAuthGrpId == "null") usrAuthGrpId = "";

		if (orgSrchAreaId == null
		 || orgSrchAreaId == ""
	     || orgSrchAreaId == undefined
         || orgSrchAreaId == "null") {

			orgSrchAreaId = organization.searchAreaVaildate();
		}
		let userSelChnnel = $('[id='+orgSrchAreaId+'] #channelSel').val();

		if (tgtOrgLevel == "D") {
			_self.renderBaseOrgList(tgtDom, tgtOrgLevel, 1);
			$(tgtDom).trigger('change');
			return;
		}
		
		$(tgtDom).append(_self.createDefaultSel());

		// 전체가 아닐시 하위목록을 불러온다.
		if (orgGbnVal != null && orgGbnVal != "" && orgGbnVal != undefined && orgGbnVal != "null") {					
			_self.renderBaseOrgList(tgtDom, tgtOrgLevel, 2, orgGbnVal);					
		} else {
			var optionList;
			if(userSelChnnel === '9999GD' && tgtOrgLevel == "J" && tgtDom.attr('id') === 'teamSel') {
				optionList = $('[id='+orgSrchAreaId+'] #branchOfficeSel').find('option');
				for(var j=0; j < _self.ttlOrgList.length; j++) {
					for(var k=0; k < optionList.length; k++) {
						var optionOrg = _self.ttlOrgList[j];
						if(optionOrg["BONBU_ORZ_CD"] === optionList[k].value) {
							createOption = $(document.createElement('option')).attr({value : optionOrg["ORZ_CD"] }).text(optionOrg["ORZ_NM"]);
							$(tgtDom).append(createOption);
						}
					}
				}					
			} else {
				if(tgtDom.attr('id') === 'teamSel') {
					optionList = $('[id='+orgSrchAreaId+'] #branchOfficeSel').find('option');
				} else {
					optionList = $('[id='+orgSrchAreaId+'] #headquartersSel').find('option');
				}				

				for(var j=0; j < _self.ttlOrgList.length; j++) {					
					for(var k=0; k < optionList.length; k++) {
						var optionOrg = _self.ttlOrgList[j];
						if(userSelChnnel === '9999GD' && tgtOrgLevel == "H") {
							if(optionOrg["UP_ORZ_CD"] === optionList[k].value && optionOrg["ORZ_DV"] === 'H') {
								createOption = $(document.createElement('option')).attr({value : optionOrg["ORZ_CD"] }).text(optionOrg["ORZ_NM"]);
								$(tgtDom).append(createOption);
							}
						} else {
							if(optionOrg["UP_ORZ_CD"] === optionList[k].value) {
								createOption = $(document.createElement('option')).attr({value : optionOrg["ORZ_CD"] }).text(optionOrg["ORZ_NM"]);
								$(tgtDom).append(createOption);
							}							
						}
						
					}
				}					
			}
			organization.reOrderOrgList(tgtDom, tgtOrgLevel);			
		}
		$(tgtDom).trigger('change');
	},
	createTeamAgt: function(chanDv, orgSelGbn, orgGbnVal, tgtDom, orgSrchAreaId) {
		var url = "/ad/comm/findTeamAgent.json";
		var jsonReqParam  = {};
		const _self = this;
		if (orgSrchAreaId == null
		 || orgSrchAreaId == ""
	     || orgSrchAreaId == undefined
         || orgSrchAreaId == "null") {
			orgSrchAreaId = organization.searchAreaVaildate();
		}
		
		jsonReqParam.orgSelGbn = orgSelGbn;	// 조직선택구분 (J: 지점, T: 팀)		
		jsonReqParam.channelSelVal 		= $('[id='+orgSrchAreaId+'] #channelSel').val();
		jsonReqParam.headquatersSelVal 	= $('[id='+orgSrchAreaId+'] #headquartersSel').val();
		jsonReqParam.branchOfficeSelVal	= $('[id='+orgSrchAreaId+'] #branchOfficeSel').val();
		if(orgSelGbn === 'T') {
			jsonReqParam.teamSelVal	= $('[id='+orgSrchAreaId+'] #teamSel').val();			
		}
		
		comTx.ajax(url, jsonReqParam, (obj, resultData, textStatus, jqXHR) => {
			var resultTeamAgentList = resultData.resultTeamAgent;
			$(tgtDom).empty();
			$(tgtDom).append(_self.createDefaultSel());				
			if(tgtDom.attr('id') === 'teamSel') {
				for (var i=0; i < resultTeamAgentList.length; i++) {
					var resultObj = resultTeamAgentList[i];
					if(resultObj != null) {
						createOption = $(document.createElement('option')).attr({value : resultObj["RSLT_CD"] }).text(resultObj["RSLT_NM"]);
						$(tgtDom).append(createOption);						
					}
				}
				$(tgtDom).trigger('change');					
			} else {
				for (var i=0; i < resultTeamAgentList.length; i++) {
					var resultObj = resultTeamAgentList[i];
					if(resultObj != null) {
						createOption = $(document.createElement('option')).attr({value : resultObj["RSLT_CD"] }).text(resultObj["RSLT_NM"]+' ('+resultObj["RSLT_CD"]+')');
						$(tgtDom).append(createOption);						
					}
				}
			}				
		});
	}
	
}

/**
 * 판매인 조회
 *
 */
var channel = {	
	view : function (htmlAreaId, type) {

		organization.srchTgtArea = htmlAreaId;

		$('#' + htmlAreaId).prepend(this.innerChannelList(type));
	},
	channelListPostProc: function(paramObj) {
		
		let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));	// 설계사 정보
	
		let searchDv = sbCommValid.isNotEmptyCheck(paramObj) && !!paramObj.searchDv ? paramObj.searchDv : userInfo.searchDv;//channel.userInfo.searchDv;//$('#searchDv').val();
		let searchLevel = sbCommValid.isNotEmptyCheck(paramObj) && !!paramObj.searchLevel ? paramObj.searchLevel : userInfo.searchLevel;//channel.userInfo.searchLevel;//$('#searchLevel').val();
		
		// 판매인조회권한: 채널전체
		if (searchDv == 'al') {

			organization.setOrganizationList();
		} else {
			// 판매인조회권한: HB or GA or 가상본부(KB)

			switch(searchLevel){
				case 'C' // [채널] 고정, "본부 / 대리점"부터 선택가능
				: this.channelListPostProcCtrl({searchDv: searchDv, searchLevel: searchLevel, disableCnt:1});	break;
				case 'B' // [채널, 본부(대리점)] 고정, "지점(본부)"부터 선택가능
				: this.channelListPostProcCtrl({searchDv: searchDv, searchLevel: searchLevel, disableCnt: 2});  break;
				case 'GAB' // [채널, 본부(대리점), 지점(본부)] 고정 "팀(지점)"부터 선택가능
				: this.channelListPostProcCtrl({searchDv: searchDv, searchLevel: searchLevel, disableCnt: 3});  break;
				case 'J' // [채널, 본부(대리점), 지점(본부)] 고정 "팀(지점)"부터 선택가능
				:
					if(searchDv == 'ga') {
						this.channelListPostProcCtrl({searchDv: searchDv, searchLevel: searchLevel, disableCnt: 4});
					} else {
						this.channelListPostProcCtrl({searchDv: searchDv, searchLevel: searchLevel, disableCnt: 3});						
					}					  
					break;
				case 'T' // [채널, 본부(대리점), 지점(본부), 팀(지점)] 고정 "판매인"부터 선택가능
				: this.channelListPostProcCtrl({searchDv: searchDv, searchLevel: searchLevel, disableCnt: 4});  break;
				case 'P' // [채널, 본부, 지점, 팀, 본인] 고정
				: this.channelListPostProcCtrl({searchDv: searchDv, searchLevel: searchLevel, disableCnt: 5});  break;
			}
		}
	},
	channelListPostProcCtrlInitSet: function(tgtDom, compareLevel, fixOption) {

		const compObj = organization.ttlOrgList.filter((obj) => {
			return obj["ORZ_DV"] == compareLevel && obj["ORZ_CD"] == $(fixOption).val()			
		});		

		if(compObj.length > 0) {
			$(tgtDom).append(fixOption);
		} else {
			(function() {
				for (var idx in organization.ttlOrgList) {
					var optionOrg = organization.ttlOrgList[idx];
					if( optionOrg["ORZ_DV"] == compareLevel ) {
						fixOption   = $(document.createElement('option')).attr({value : optionOrg["ORZ_CD"]}).text(optionOrg["ORZ_NM"]);
						break;
					}
				}
				$(tgtDom).append(fixOption);
			})();
		}
	},
	channelListPostProcCtrl: function(paramObj) {

		//Step1. 변수지정
		var _self   = this;

		var chnlNm  = paramObj.searchDv;
		var orgGbn  = paramObj.searchLevel;
		var loopCnt = paramObj.disableCnt;

		var channelDom      = $('#channelSel');
		var headquarterDom  = $('#headquartersSel');
		var branchOfficeDom = $('#branchOfficeSel');
		var agentDom        = $('#agentSel');
		var teamDom			= $('#teamSel');
		var userInfo = JSON.parse(sessionStorage.getItem('userInfo'));	// 설계사 정보

		// UserSession(유저정보)의 소속된 조직정보를 기본옵션으로 변수지정한다.
		var chnlFixOption   = $(document.createElement('option')).attr({value : userInfo.channelId}).text(userInfo.channelNm);
		var headFixOption   = $(document.createElement('option')).attr({value : userInfo.bonbuId}).text(userInfo.bonbuNm);
		//var chnlFixOption   = $(document.createElement('option')).attr({value : $('#userChannelId').val()}).text($('#userChannelNm').val());
		//var headFixOption   = $(document.createElement('option')).attr({value : $('#userBonbuId').val()}).text($('#userBonbuNm').val());
		var branchFixOption;
		var teamFixOption;
		if(chnlNm === 'ga') {
			branchFixOption = $(document.createElement('option')).attr({value : userInfo.gaBonbuId}).text(userInfo.gaBonbuNm);
			teamFixOption   = $(document.createElement('option')).attr({value : userInfo.jijumId}).text(userInfo.jijumNm);
			//branchFixOption = $(document.createElement('option')).attr({value : $('#userGABonbuId').val()}).text($('#userGABonbuNm').val());
			//teamFixOption   = $(document.createElement('option')).attr({value : $('#userJijumId').val()}).text($('#userJijumNm').val());			
		} else {
			branchFixOption = $(document.createElement('option')).attr({value : userInfo.jijumId}).text(userInfo.jijumNm);
			teamFixOption   = $(document.createElement('option')).attr({value : userInfo.teamId}).text(userInfo.teamNm);
			//branchFixOption = $(document.createElement('option')).attr({value : $('#userJijumId').val()}).text($('#userJijumNm').val());
			//teamFixOption   = $(document.createElement('option')).attr({value : $('#userTeamId').val()}).text($('#userTeamNm').val());			
		}
		
		var agentFixOption   = $(document.createElement('option')).attr({value : userInfo.usrId}).text(userInfo.usrNm);
		//var agentFixOption   = $(document.createElement('option')).attr({value : $('#userAgentId').val()}).text($('#userAgentNm').val());
		
		

		//Step2. 로그인한 사용자의 조회권한을 체크하여 조직 값 세팅
		if (orgGbn == "C") { // [채널(H/B)] 고정, "본부"부터 선택가능

			_self.channelListPostProcCtrlInitSet(channelDom, "D", chnlFixOption);

			$('#channelSel').trigger('change');

		} else if (orgGbn == "B") { // [채널(H/B), 본부] 고정, "지점"부터 선택가능

			_self.channelListPostProcCtrlInitSet(channelDom, "D", chnlFixOption);
			_self.channelListPostProcCtrlInitSet(headquarterDom, "K", headFixOption);

			$(headquarterDom).trigger('change');

		} else if (orgGbn == "GAB") { // [채널(H/B), 본부] 고정, "지점"부터 선택가능

			_self.channelListPostProcCtrlInitSet(channelDom, "D", chnlFixOption);
			_self.channelListPostProcCtrlInitSet(headquarterDom, "K", headFixOption);
			_self.channelListPostProcCtrlInitSet(branchOfficeDom, "H", branchFixOption);

			$(branchOfficeDom).trigger('change');

		} else if (orgGbn == "J") { // [채널(H/B), 본부, 지점] 고정 "팀"부터 선택가능

			_self.channelListPostProcCtrlInitSet(channelDom, "D", chnlFixOption);
			_self.channelListPostProcCtrlInitSet(headquarterDom, "K", headFixOption);
			//_self.channelListPostProcCtrlInitSet(branchOfficeDom, "J", branchFixOption);
			
			if(chnlNm === 'ga') {
				_self.channelListPostProcCtrlInitSet(branchOfficeDom, "H", branchFixOption);
				_self.channelListPostProcCtrlInitSet(teamDom, "J", teamFixOption);
				$(teamDom).trigger('change');				
			} else {
				_self.channelListPostProcCtrlInitSet(branchOfficeDom, "J", branchFixOption);
				$(branchOfficeDom).trigger('change');								
			}

		} else if (orgGbn == "T") { // [채널(H/B), 본부, 지점, 팀] 고정 "판매인"부터 선택가능

			_self.channelListPostProcCtrlInitSet(channelDom, "D", chnlFixOption);
			_self.channelListPostProcCtrlInitSet(headquarterDom, "K", headFixOption);
			//_self.channelListPostProcCtrlInitSet(branchOfficeDom, "J", branchFixOption);
			//_self.channelListPostProcCtrlInitSet(teamDom, "T", teamFixOption);
			if(chnlNm === 'ga') {
				_self.channelListPostProcCtrlInitSet(branchOfficeDom, "H", branchFixOption);
				_self.channelListPostProcCtrlInitSet(teamDom, "J", teamFixOption);				
			} else {
				_self.channelListPostProcCtrlInitSet(branchOfficeDom, "J", branchFixOption);
				_self.channelListPostProcCtrlInitSet(teamDom, "T", teamFixOption);				
			}

			$(teamDom).trigger('change');

		} else if (orgGbn == "P") { // [채널(H/B), 본부, 지점, 팀, 본인] 고정

			_self.channelListPostProcCtrlInitSet(channelDom, "D", chnlFixOption);
			_self.channelListPostProcCtrlInitSet(headquarterDom, "K", headFixOption);
			if(chnlNm === 'ga') {
				_self.channelListPostProcCtrlInitSet(branchOfficeDom, "H", branchFixOption);
				_self.channelListPostProcCtrlInitSet(teamDom, "J", teamFixOption);				
			} else {
				_self.channelListPostProcCtrlInitSet(branchOfficeDom, "J", branchFixOption);
				_self.channelListPostProcCtrlInitSet(teamDom, "T", teamFixOption);				
			}
			

			$(agentDom).append(agentFixOption);
		}

		//Step3. 로그인한 사용자의 조회권한에 따라 Disable.
		for (var i=1; i <= loopCnt; i++) {

			switch(i){
				case 1 : $(channelDom).attr('disabled', true);	    break;
				case 2 : $(headquarterDom).attr('disabled', true);  break;
				case 3 : $(branchOfficeDom).attr('disabled', true); break;
				case 4 : /* chnlNm == 'ga' ? $(agentDom).attr('disabled', true) : */ $(teamDom).attr('disabled', true); break;
				case 5 : $(agentDom).attr('disabled', true);		break;
			}
		}
	},
	innerChannelList : function (type){

		var _self = this;
		var channelListHtml = '';
		
		//var orgGbn = $('#searchDv').val();
		let userInfoJsonStr	= sessionStorage.getItem('userInfo');
		const userInfoJson  = JSON.parse(userInfoJsonStr);
		var orgGbn = userInfoJson.searchDv;//channel.userInfo.searchDv;
		
		if (type == '3') {
			type = 1;
		}


		// private String accessEnv;			접속 환경 PC, TBL, MO
		// private String accessWeb;			내부망 외부망 (내부망 "INT" 외부망 "EXT")

		let isMO = userInfoJson.accessEnv;
		let levlTtl2 = (orgGbn == 'ga' ? '대리점' : '본부');
		let levlTtl3 = (orgGbn == 'ga' ? '본부' : '지점');
		let levlTtl4 = (orgGbn == 'ga' ? '지점' : '팀');

		let thClass = '';
		let tdClass = '';

		if ( isMO === 'MB' ) {	// 모바일 일때
			thClass = 'itemTh';
			tdClass = 'dataTd';
		} else {
			thClass = 'th';
			tdClass = 'td';
		}

		organization.ttlOrgList = commonUtil.strToJsonConvert( $('#orgList').val() );

		channelListHtml += '<li>\n';
		channelListHtml += '	<div class="' + thClass + '">채널</div>\n';
		channelListHtml += '	<div class="' + tdClass + '">\n';
		channelListHtml += '		<select class="ipt" title="채널" id="channelSel" orgGbn="C" onchange="javascript:organization.setOrganizationList(this)"></select>\n';
		channelListHtml += '	</div>\n';
		channelListHtml += '</li>\n';
		channelListHtml += '<li>\n';
		channelListHtml += '	<div class="' + thClass + '" id="headquartersSelTxt">' + levlTtl2 +'</div>\n';
		channelListHtml += '	<div class="' + tdClass + '">\n';
		channelListHtml += '		<select class="ipt" title="'+levlTtl2+'" id="headquartersSel" orgGbn="B" onchange="javascript:organization.setOrganizationList(this)"></select>\n';
		channelListHtml += '	</div>\n';
		channelListHtml += '</li>\n';
		channelListHtml += '<li>\n';
		channelListHtml += '	<div class="' + thClass + '" id="branchOfficeSelTxt">' + levlTtl3 +'</div>\n';
		channelListHtml += '	<div class="' + tdClass + '">\n';
		channelListHtml += '		<select class="ipt" title="'+levlTtl3+'" id="branchOfficeSel" orgGbn="J" onchange="javascript:organization.setOrganizationList(this)"></select>\n';
		channelListHtml += '	</div>\n';
		channelListHtml += '</li>\n';

		if (type == '1') {
			channelListHtml += '<li class="oneThirdDiv">\n';
			channelListHtml += '	<div class="' + thClass + '" id="teamSelTxt">' + levlTtl4 +'</div>\n';
			channelListHtml += '	<div class="' + tdClass + '">\n';
			channelListHtml += '		<select class="ipt" title="'+levlTtl4+'" id="teamSel" orgGbn="T" onchange="javascript:organization.setOrganizationList(this)"></select>\n';
			channelListHtml += '	</div>\n';
			channelListHtml += '</li>\n';
			channelListHtml += '<li class="twoThirdsDiv">\n';
			channelListHtml += '	<div class="' + thClass + '">판매인</div>\n';
			channelListHtml += '	<div class="' + tdClass + '">\n';
			channelListHtml += '		<select class="ipt mid" title="판매인" id="agentSel" orgGbn="P" onchange="javascript:organization.setOrganizationList(this)"></select>\n';
			channelListHtml += '	</div>\n';
			channelListHtml += '</li>\n';
		} else if (type == '2') {
			channelListHtml += '<li>\n';
			channelListHtml += '	<div class="' + thClass + '">팀</div>\n';
			channelListHtml += '	<div class="' + tdClass + '">\n';
			channelListHtml += '		<select class="ipt" title="팀" id="teamSel"></select>\n';
			channelListHtml += '	</div>\n';
			channelListHtml += '</li>\n';
			channelListHtml += '<li>\n';
			channelListHtml += '	<div class="' + thClass + '">판매인</div>\n';
			channelListHtml += '	<div class="' + tdClass + '">\n';
			channelListHtml += '		<select class="ipt" title="판매인" id="agentSel" ></select>\n';
			channelListHtml += '	</div>\n';
			channelListHtml += '</li>\n';
			channelListHtml += '<li>\n';
			channelListHtml += '	<div class="' + thClass + '">위촉구분</div>\n';
			channelListHtml += '	<div class="' + tdClass + '">\n';
			channelListHtml += '		<ul class="iptFilt entire">\n';
			channelListHtml += '			<li>\n';
			channelListHtml += '				<input type="radio" class="ipt" name="iptFilt0" id="iptFilt_1"><label for="iptFilt_1">위촉</label>\n';
			channelListHtml += '			</li>\n';
			channelListHtml += '			<li>\n';
			channelListHtml += '				<input type="radio" class="ipt" name="iptFilt0" id="iptFilt_2"><label for="iptFilt_2">해촉</label>\n';
			channelListHtml += '			</li>\n';
			channelListHtml += '		</ul>\n';
			channelListHtml += '	</div>\n';
			channelListHtml += '</li>\n';
		} else if (type == '3') {
			channelListHtml += '<li class="full">\n';
			channelListHtml += '	<div class="' + thClass + '">판매인</div>\n';
			channelListHtml += '	<div class="' + tdClass + '">\n';
			channelListHtml += '		<select class="ipt mid" title="판매인" id="agentSel" orgGbn="P" onchange="javascript:organization.setOrganizationList(this)"></select>\n';
			channelListHtml += '	</div>\n';
			channelListHtml += '</li>\n';
		} else if (type == '4') {
			channelListHtml += '<li class="full">\n';
			channelListHtml += '	<div class="' + thClass + '" id="teamSelTxt">' + levlTtl4 +'</div>\n';
			channelListHtml += '	<div class="' + tdClass + '">\n';
			channelListHtml += '		<select class="ipt" title="팀" id="teamSel" orgGbn="T" onchange="javascript:organization.setOrganizationList(this)"></select>\n';
			channelListHtml += '	</div>\n';
			channelListHtml += '</li>\n';
		}
		return channelListHtml;

	}
}

