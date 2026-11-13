/*
Copyright ⓒ 2022 Hana Life Insurance, All Rights Reserved.
------------------------------------------------------------------
프로젝트 : 하나생명 NEW SFA 시스템
파 일 명 : mo.common.js
타 이 틀 : 모바일 공통 js
설    명 : 모바일 공통 js
------------------------------------------------------------------
수정일          수정자              수정내용
------------------------------------------------------------------
2022.07.18    70100             최초생성
------------------------------------------------------------------
*/


/**
 * 모바일 페이지 타이틀 출력 함수
 * :: 기존에 만들어져 있던 함수로 위치 유지
 * 
 */
setTitle = function(title){
	$('.header h1').text(title);
	$('title').text(title);
}

const moComm = {
	
	isSetBackBtn : false,	// 뒤로가기 버튼 이벤트 세팅여부
	
	/**
	 * 모바일 헤더 세팅
	 *
	 * @param {string} title - 타이틀            
	 * @param {string} showBackBtnYn - 뒤로가기버튼 노출여부 Y/N
	 * @param {string} showMenuBtnYn - 메뉴버튼 노출여부 Y/N 
	 * @param {function} backEventFunc - 뒤로가기 이벤트 동작 function
	 */
	setHeader : function(title, showBackBtnYn, showMenuBtnYn, backEventFunc){
		
		if(!sbCommValid.isEmptyCheck(title)){
			setTitle(title);
		}
		
		moComm.showAppPageBackBtn(showBackBtnYn);
	
		moComm.showAppMenuBtn(showMenuBtnYn);

		if(typeof backEventFunc === 'function'){
			moComm.isSetBackBtn = true;
		}
		moComm.appPageBackEvent(backEventFunc);
	},
	
	/**
	 * 모바일 헤더 뒤로가기 버튼이벤트
	 * - 직접 호출하여 사용시 이벤트 적용 안됨.
	 * @param {function} backEventFunc - 개별 뒤로가기 이벤트 setting function
	 */
	appPageBackEvent : function(backEventFunc){
		
		// 엘리먼트가 있는 경우에만 이벤트 바인딩
		var $backBtn = $('.header .icoBtn_appPage');
		if(!$backBtn || $backBtn.length === 0) {
			return	
		}
		
		//청약 화면으로 진입하면 , Back버튼이 요약보기로 이름이 바뀌어 스탭이동용 레이어팝업으로 동작하므로
		//청약화면이 아닌경우만 back 이벤트가 바인딩되도록 한다 2022-10-12 주현태
		if(window.location.pathname =="/sb/mo/view.do") {
			return	
		}
				
		$backBtn.off().on('click', function(){
			if(moComm.isSetBackBtn && typeof backEventFunc === 'function'){
				moComm.isSetBackBtn = false;
				backEventFunc();
			} else {
				history.back();
			}
		});
	},
	
	/**
	 * 모바일 헤더 뒤로가기 버튼노출여부 제어(default 노출)
	 * @param {string} showYn - 뒤로가기버튼 노출여부 Y/N
	 */
	showAppPageBackBtn : function(showYn){
		
		var $backBtn = $('.header .icoBtn_appPage');
		
		// 엘리먼트가 있는 경우에만 제어로직 진행
		if(!$backBtn || $backBtn.length === 0) {
			return	
		}
		
		if(!!showYn && showYn.toUpperCase() == 'N'){
			$backBtn.hide();
		} else {
			$backBtn.show();
		}
	},
	
	/**
	 * 모바일 헤더 뒤로가기 버튼노출여부 제어(dafault 노출)
	 * @param {string} showYn - 메뉴버튼 노출여부 Y/N 
	 */
	showAppMenuBtn : function(showYn){
		
		var $menuBtn = $('.header .icoBtn_appMenu');
		
		// 엘리먼트가 있는 경우에만 제어로직 진행
		if(!$menuBtn || $menuBtn.length === 0) {
			return	
		}
		
		if(!!showYn && showYn.toUpperCase() == 'N'){
			$menuBtn.hide();
		} else {
			$menuBtn.show();
		}
	},
	
	
/**
 * 로그아웃
 *
 * @author 70056
 * @since  2022.10.17
 * @version 1.0
 */
	logout : function() {
		comTx.ajax('/comm/cm/Logout.json', {}, function(ajaxObj, rstData){
			//removeMenuDep();
			if(rstData.accessEnv === 'TBL') {
	    		location.href = '/cm/pt/comm/LoginViewTablet.do';
	    	} else if(rstData.accessEnv === 'MB') {
	    		location.href = '/cm/mo/comm/LoginMobile.do';
	    	} else {
	    		location.href = '/cm/pt/comm/LoginView.do';
	    	}
		}, {});
	},
	home : function() {
		//removeMenuDep();
    	location.href = '/ma/mo/index.do';
	}
	
	
};


