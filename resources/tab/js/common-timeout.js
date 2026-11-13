/**
 *	로그인 세션아웃 알림 스크립트
 *
 *
 **/
var vTimeout = new timeout();
function timeout(){
	var view = this;
	view.timeInterval = null;
	view.timeMax = 60 * 60; //세션 최대 시간
	view.time = 60 * 60; //세션 남은 시간
	view.timeCheck = 60 * 5; //타임아웃 시간

	//view.timeMax = 60; //세션 최대 시간 - 테스트용
	//view.time = 60; //세션 남은 시간 - 테스트용
	//view.timeCheck = 30; //타임아웃 시간 - 테스트용

	view.popId = 'loginTimeout'; //팝업 아이디
	view.popClassify = false;// popup 유무 확인
	view.callType = '';	//호출 타입

	view.init = timeChecking; //초기화
	view.reLogin = reLogin; //로그인 연장
	view.logout = logout; //로그아웃
	view.renewalSession = renewalSession;	//세션연장

	function timeChecking(type){//초기화 및 시간 체크
		if (view.callType == '') {
			view.callType = type;
		}

		if ($('#' + view.popId).length <= 0) {
			if (view.callType == 'MO' || view.callType == 'SMART') {
				$('body').append(timeoutHtmlMO());
			} else {
				$('#wrapper').append(timeoutHtml());
			}
		}

		let messageHtml = '';
		if (view.callType == 'PT') {
			messageHtml = '<em>' + view.time + '</em>초 후 자동 접속 종료 예정입니다.';
		} else {
			messageHtml = '<em>' + view.time + '</em>'
		}
		$('#' + view.popId).find('#infoTimeMsg').html(messageHtml);
	    view.timeInterval = setInterval(timeCheck, 1000);
	}
	function timeCheck(){//팝업 오픈 및 시간 체크
		view.time = view.time - 1;
		//console.log(view.time);

		if (view.callType == 'PT') {
			var min = parseInt((view.time%3600)/60);
			var sec = view.time%60;

			$('span[id="remainTime"]').text('');
			$('span[id="remainTime"]').text(min+'분 '+sec+'초');

		} else if (view.callType == 'MO' || view.callType == 'SMART') {

		}


        if (view.time <= view.timeCheck) {
			if (!view.popClassify) {
                popShowY();
            }
			$('#' + view.popId).find('#reLogin_btn').focus();
		}
		if(view.time > 0) {
			$('#' + view.popId).find('#infoTimeMsg em').text(view.time);
		} else {
			clearInterval(view.timeInterval);
			let messageHtml = '';
			if (view.callType == 'PT') {
				messageHtml = '<em>1</em>초 후 로그인화면으로 이동합니다.';
			} else {
				messageHtml = '<em>1</em>'
			}
			$('#' + view.popId).find('#infoTimeMsg').html('<em>1</em>초 후 로그인화면으로 이동합니다.');
			setTimeout(logout, 1000);
		}
	}
	function timeoutHtml(){//팝업 그리기
		var extensionHtml = '';
        extensionHtml += '<div class="popWrap hasPopSticky" id="' + view.popId + '">\n';
        extensionHtml += '	<div class="popContain col_6">\n';
        extensionHtml += '  	<div class="popup">\n';
        extensionHtml += '          <div class="popHead">\n';
        extensionHtml += '              <h1 class="tit01">로그인시간 연장</h1>\n';
        extensionHtml += '          </div>\n';
        extensionHtml += '  		<div class="popBody">\n';
        extensionHtml += '              <div class="">\n';
        extensionHtml += '                  <p><span id="infoTimeMsg"><em>60</em>초 후<br /> 자동 접속 종료 예정입니다.</span></p>\n';
        extensionHtml += '                  <p>지금 로그인 시간을 연장하시겠습니까?</p>\n';
        extensionHtml += '              </div>\n';
        extensionHtml += '          </div>\n';
        extensionHtml += '          <div class="btn_wrap sticky">\n';
        extensionHtml += '              <button type="button" class="btn_gray" onclick="vTimeout.logout();"><span>로그아웃</span></button>\n';
        extensionHtml += '              <button type="button" class="btn_primary" id="reLogin_btn" onclick="vTimeout.reLogin();"><span>로그인시간 연장하기</span></button>\n';
        extensionHtml += '          </div>\n';
        extensionHtml += '      </div>\n';
        extensionHtml += '  </div>\n';
        extensionHtml += '</div>\n';
        return extensionHtml;
	}

	function timeoutHtmlMO(){//팝업 그리기
		var extensionHtml = '';
		extensionHtml += '<div class="popWrap" id="' + view.popId + '">\n';
		extensionHtml += '	<section class="popup alert">\n';
		extensionHtml += '		<div class="popCont">\n';
		extensionHtml += '			<div class="popBody">\n';
		extensionHtml += '				<p class="fwR mb20">남은시간<br><span class="pointC2 titH1" id="infoTimeMsg"><em>60</em>초</span></p>\n';
		extensionHtml += '				<p class="txt">일정 시간 동안 Hanaro 이용하지<br>않을 경우 개인정보보호를 위하여<br>자동 로그아웃 처리됩니다.</p>\n';
		extensionHtml += '				<p class="txt">계속 이용하시려면<br>[시간 연장]을 누르세요.</p>\n';
		extensionHtml += '				<div class="btnArea sticky">\n';
		extensionHtml += '					<button type="button" class="btn_g" onclick="vTimeout.logout();">로그아웃</button>\n';
		extensionHtml += '					<button type="button" class="btn_p" id="reLogin_btn" onclick="vTimeout.reLogin();">시간 연장</button>\n';
		extensionHtml += '				</div>\n';
		extensionHtml += '			</div>\n';
		extensionHtml += '		</div>\n';
		extensionHtml += '	</section>\n';
		extensionHtml += '</div>\n';

        return extensionHtml;
	}
	function popShowY(){//팝업 오픈
		$('html, body').addClass('popOn');
		$('#' + view.popId).css('opacity', 1).css('z-index', 20000 ).addClass('nowOpen').fadeIn();
		view.popClassify = true;
	}
	function logout(){//세션 아웃 - 로그인 페이지로 이동
		if (view.callType == 'PT') {
			ptComm.logout();
		} else if (view.callType == 'SMART') {
			comTx.ajax('/comm/cm/Logout.json', {}, function(ajaxObj, rstData){
				try {
					// 현재 열린 창 닫기
					window.open('', '_self').close();
				} catch(e) {
					// 닫을 수 없는 환경이면 첫 페이지로 이동
					console.log(e);
				} finally {
					// finally 까지 창이 닫히지 않았다면, 첫 페이지로 이동
					setTimeout(function() {
						location.href = '/sb/mo/smartInfo.do?sbcDsgnNo=' + $('#sbcDsgnNoInput').val();
					}, 1000) ;
				}
			});
		} else {
			moComm.logout();
		}

	}
	function reLogin(){// 세션 연장
		$('html, body').removeClass('popOn');
		$('#' + view.popId).css('opacity', 0).removeClass('nowOpen').fadeOut();

		view.renewalSession();
	}

	function renewalSession(){// 세션 연장
		view.popClassify = false;
		clearInterval(view.timeInterval);
		view.time = view.timeMax;
		timeChecking();
		//세션 리셋
		comTx.ajax('/comm/cm/RenewalSession.json', {}, function(ajaxObj, rstData){}, {})
        return false;
	}
}