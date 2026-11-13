/**
 * @target
 */
var comTx= {};



/**
 * ajax 옵션
 *
 * @date 2020.10.22
 * @private
 * @param
 * @memberOf
 * @author
 * @return
 */
comTx.ajaxOptions = {
		async : true
	  , type  : "POST"
	  , traditional : true
	  , dataType : 'json'
	  //, contentType : "application/x-www-form-urlencoded; charset=UTF-8"	//contentType : "application/json; charset=UTF-8",
	  , contentType : "application/json; charset=UTF-8"	//contentType : "application/json; charset=UTF-8",
	  , resultTypeCheck : true
	  , spinner : false
	  , dimmed : false
	  , isErrorAlert : true
	  , errorCallback : null
	  , timeout : 300000 //5분
	  , message : '처리중 입니다....'
	  , loading : true
	  , formDataYn: "N"
	  , processData : true
};

/**
 * ajax 공통
 *
 * @date 2020.10.22
 * @private
 * @param {string} 요청 url
 * @param {json object} json형태의 요청 값
 * @param {function object} callback 함수
 * @param {object} ajax 옵션
 * @memberOf
 * @author
 * @return
 */
comTx.ajax = function(url, reqParam, callback, options) {
	options = $.extend({}, comTx.ajaxOptions, options);

	if("N" == options.formDataYn){ //multipart/form-data 전송이 아닐경우
		reqParam = JSON.stringify(reqParam);
	}



	$.ajax({
		url			: url,
		async   	: options.async,
		type  		: options.type,
		traditional : options.traditional,
		contentType : options.contentType,
		data		: reqParam,
		dataType	: options.dataType,  //default : Intelligent Guess
		timeout 	: options.timeout,
		processData : options.processData,
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Accept","application/json");
			console.log('isLoading=', options.loading);
			console.log('url==', url);
			if (options.loading) {
				progress.show();
			}
		},
		success : function(resultData, textStatus, jqXHR){


			if (typeof callback == 'function') {
				eval(callback(this, resultData, textStatus, jqXHR));
			}
		},

		error : function(jqXHR, textStatus, errorThrown ) {

			console.log('jqXHR==', jqXHR);
			//console.log('jqXHR.responseJSON.rsMsg==', jqXHR.responseJSON.rsMsg);
			console.log('textStatus==', textStatus);
			console.log('errorThrown==', errorThrown);

			//AJAX호출시 로그인 필수 페이지에서 로그인 세션이 없을 때 error status를 505로 아웃풋
			//interceptor에서 체크 후 내려준다.
			//error status 505 는 HTTP 정식에러코드가 아닌 임의로 정한 값임.
			if (jqXHR.status == '505') {
				if (!!isMoLanding || sfaApp.isMO()) {
					uiInfo.mo.alert('로그인이 필요한 페이지 입니다.', function(){
						sessionStorage.removeItem('oneDepNM');
						sessionStorage.removeItem('oneDepLK');
						sessionStorage.removeItem('twoDepNM');
						sessionStorage.removeItem('twoDepLK');
						sessionStorage.removeItem('threeDepNM');
						sessionStorage.removeItem('threeDepLK');
				    	location.href = '/cm/pt/comm/LoginView.do';
					});

				} else {
					uiInfo.pt.alert('', '로그인이 필요한 페이지 입니다.', function(){
						sessionStorage.removeItem('oneDepNM');
						sessionStorage.removeItem('oneDepLK');
						sessionStorage.removeItem('twoDepNM');
						sessionStorage.removeItem('twoDepLK');
						sessionStorage.removeItem('threeDepNM');
						sessionStorage.removeItem('threeDepLK');
				    	location.href = '/cm/pt/comm/LoginView.do';
					});
				}
				return false;
			}


			if (options.isErrorAlert) {
				if (!!isMoLanding || sfaApp.isMO()) {
					if (!!jqXHR && !!jqXHR.responseJSON && !!jqXHR.responseJSON.rsMsg) {
						uiInfo.mo.alert(jqXHR.responseJSON.rsMsg, function(){
							if (!!options.errorCallback && typeof options.errorCallback === 'function' ) {
								options.errorCallback();
							}
						});
					}

				} else {
					if (!!jqXHR && !!jqXHR.responseJSON && !!jqXHR.responseJSON.rsMsg) {
						uiInfo.pt.alert('', jqXHR.responseJSON.rsMsg, function(){
							if (!!options.errorCallback && typeof options.errorCallback === 'function' ) {
								options.errorCallback();
							}
						});

					}
				}
			} else {
				if (!!options.errorCallback && typeof options.errorCallback === 'function' ) {
					options.errorCallback();
				}
			}
		}

	}).always(function(){
		progress.hide();
	});	//end $.ajax
};
/**
 * 공통 파일 업로드
 *
 * @date 2022.06.21
 * @private
 * @param
 * @memberOf
 * @author
 * @return
 */
comTx.ajaxFileUp = function(url, reqParam, callback, options) {
		console.log("start ajaxFileUp");
		var fileOptions = {
				enctype : 'multipart/form-data'
			  , dataType : 'json'
			  , processData : false
			  , contentType : false
			  , formDataYn: "Y"
		};
		options = $.extend({}, options, fileOptions);
		comTx.ajax(url, reqParam, fnCallback, options);
}
/**
 * 공통 파일 다운로드
 *
 * @date 2020.10.22
 * @private
 * @param {string} 첨부파일 번호 atacFileNum
 * @param {string} 첨부파일 순번 atacFileName
 * @memberOf
 * @author
 * @return
 */
comTx.ajaxExcelFileDown = function(atacFileNum, atacFileName) {
	var $iframe = $("<iframe id='downIFrame' name='downIFrame' frameBorder='0' scrolling='no' width='0' height='0'></iframe>");
	//HTML5 표준에선 Browsing contexts(document) 에 form 이 연결되어 있지 않으면, form submit을 중단하도록 규정: 기존 요소 삭제 후 재생성

	if($('iframe[id=downIFrame]').length > 0){
		$('iframe[id=downIFrame]').remove();
	}

	//HTML5 표준에선 Browsing contexts(document) 에 form 이 연결되어 있지 않으면, form submit을 중단하도록 규정: 기존 요소 삭제 후 재생성
	var $form = $("<form id='excelDownForm' name='excelDownForm'></form>");
	if($('form[id=excelDownForm]').length > 0){
		$('form[id=excelDownForm]').remove();
	}

	$(document.body).append($iframe);
	$(document.body).append($form);
	$form.attr('action', "/comm/commAtacFile/btbrExcelFileDownload.do");
	$form.attr('method', 'POST');
	$form.attr('target', 'downIFrame');
	$form.attr('enctype','multipart/form-data');
	$("<input></input>").attr({type:"hidden", name:"atacFileNum", value:atacFileNum}).appendTo($form);
	$("<input></input>").attr({type:"hidden", name:"atacFileName", value:atacFileName}).appendTo($form);
	$form.submit();
};

/**
 * ajaxForm 옵션
 *
 * @date 2020.10.22
 * @private
 * @memberOf
 * @author
 * @return
 */
comTx.ajaxFormOptions = {
		async : true
	  , type  : "POST"
	  , traditional : true
	  , dataType : 'json'
	  , contentType : "application/x-www-form-urlencoded; charset=UTF-8"	//contentType : "application/json; charset=UTF-8",
	  , resultTypeCheck : true
	  , spinner : false
	  , dimmed : false
	  , errorCallback : null
	  , timeout : 300000 //5분
	  , message : '처리중 입니다....'
	  , loading : true
};

/**
 * 공통 ajaxFormSubmit
 *
 * @date 2020.10.22
 * @private
 * @param {form object} form 요소
 * @param {string} 요청 URL
 * @param {function object} callback 함수
 * @param {object} ajax 옵션
 * @memberOf
 * @author
 * @return
 */
comTx.ajaxFormSubmit = function($_form, url, callback, options) {
	options = $.extend( {}, comTx.ajaxFormOptions, options );
	var formSubmitOption = {
		url			: url,
		async   	: options.async,
		type  		: options.type,
		traditional : options.traditional,
		contentType : options.contentType,
		dataType	: options.dataType,  //default : Intelligent Guess
		timeout 	: options.timeout,
		beforeSend : function(xhr) {
			xhr.setRequestHeader("Accept","application/json");

			if(options.async && options.spinner){
				$.blockUI({
					message : options.message ,
					css: {
						backgroundColor: '#141450',
						color: '#fff'
					}
				});
			}

			if(options.async && options.loading){
				if(1 > $('#loading').length ){
					var $loadingDiv = $('<div class="loading ing" id="loading"><div class="loader"></div></div>');
					$(document.body).append($loadingDiv);
				}else{
					$('#loading').attr('class','loading ing');
				}
			}
		},

		success : function(resultData, textStatus, jqXHR){
			/**
			 * callback 전 화면 unblock 처리
			 * true 이면 콜백 후 콜백화면에서 처리하고 default로 콜백전 unblock 처리
			 * */
			if(options.async && options.spinner){ $.unblockUI(); }
			if(options.async && options.loading){
				$('#loading').attr('class','loading');
			}

			if(typeof callback == 'function'){
				eval(callback(this, resultData, textStatus, jqXHR));
			}
		},

		error : function(jqXHR, textStatus, errorThrown){
			/**
			 * callback 전 화면 unblock 처리
			 * true 이면 콜백 후 콜백화면에서 처리하고 default로 콜백전 unblock 처리
			 * */
			if(options.async && options.spinner){ $.unblockUI(); }
			if(options.async && options.loading){
				$('#loading').attr('class','loading');
			}

			alert("서버와 연결할 수 없습니다.\r\n다시 시도하시기 바랍니다.");
		}

	};

	$_form.ajaxSubmit(formSubmitOption);

};

var progress = {
	cnt : 0,
	show : function(){
		var progress = this.html();
		if(this.cnt == 0) {
			$('body').append($(progress));
		}
		this.cnt++;
	},
	hide : function(){
		this.cnt--;
		if(this.cnt == 0) {
			$('.profress-pop').remove();
		}
	},
	html : function(){
		var html = '';
		html += '<div class="profress-pop">\n';
		html += '	<div class="profress">\n';
		html += '		<div class="dim"></div>\n';
		html += '		<div class="profress-box">\n';
		html += '			<h1 class="profress-tit">잠시만 기다려주세요.</h1>\n';
		html += '			<div class="profress-bar" aria-hidden="true">\n';
		html += '				<span class="progress-bar-gauge"></span>\n';
		html += '			</div>\n';
		html += '		</div>\n';
		html += '	</div>\n';
		html += '</div>\n';

		return html;
	}
};