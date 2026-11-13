/**
 * 세션스토리지를 이용한 글로벌스토리지 객체
 * <pre>
 * 세션스토리지를 이용한 글로벌스토리지 객체
 * </pre>
 *
 * @author 70121
 * @since  2022.07.13
 * @version 1.0
 */
var globalStorage = {
	set : function(key, value) {
		console.log((typeof value));
		if (!!value) {
			if (typeof value === 'object') {
				value = JSON.stringify(value)
			}
			sessionStorage.setItem(key, value);
		} else {
			console.log('스토리지 저장 실패');
		}
	},
	get : function(key) {
		return sessionStorage.getItem(key);
	},
	remove : function(key) {
		sessionStorage.removeItem(key);
	}
}

var userInfo = {
 	/**
 	 *  클라이언트 스토리지에 저장하여 사용
 	 **/
	init : function(){
	    /**공통코드셋팅*/
		comTx.ajax('/comm/cm/UserInfo.json', {}, function(ajaxObj, rstData){
			if (rstData.successYn == 'Y' && !!rstData.userSession) {
				globalStorage.set("userInfo", rstData.userSession);
			} else {
				//로그인 페이지로 이동
				/*console.log('로그인으로 이동할 겁니다');
				uiInfo.pt.alert('', '로그인이 필요합니다.\n확인을 누르면 로그인페이지로 이동됩니다.', function(){
					window.location.href="/cm/pt/comm/LoginView.do";
				});*/
			}
		}, {})

	},
 	/**
 	 *  로그인 유저 정보 전체 리턴
 	 **/
	get : function(){
		return JSON.parse(globalStorage.get("userInfo"));
	},
 	/**
 	 *  로그인 유저 정보 전체 리턴
 	 **/
	getValue : function(key) {

		if (!!globalStorage.get("userInfo")) {
			var lgnInfo = JSON.parse(globalStorage.get("userInfo"));
			if (!!lgnInfo[key])  {
				return lgnInfo[key];
			} else {
				return null;
			}
		} else {
			return null;
		}
	}
}