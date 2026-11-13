var sfaApp = {
	platform : '',
	version : '',
	//FIDO 인증 관련 변수 추가 begin
	isNativeApp: false,		// APP여부 확인
	isFingerReg: false, 	// 지문 등록 여부
	isPinReg: false,		// PIN 등록 여부
	bioEnable: false,		// 바이오 등록 가능 여부
	fidoAccountId: '',		// FIDO 등록된 ID
	lastLoginMethod: '',	// 마지막 로그인방법 (사번+비밀번호, FIDO, 금융인증)
	//FIDO 인증 관련 변수 추가 end
	device_uuid :'',				// 단말기 uuid (금융인증서에서 사용)
	device_autoConnectInfo : '',	// 금융인증서 자동연결 정보 

	isApp : false,
	isMO : function() {
		return (this.isApp && this.platform == 'mo');
	},
	isMOWeb : function() {
		return (sfaApp.isAndroid() || sfaApp.isIOS());
	},
	isTA : function(){
		return (this.isApp && this.platform == 'ta');
	},
	isPC : function(){
		return (!this.isApp && this.platform == '');
	},
	isIOS : function(){
		//IOS 판단여부
	    var iDevices = [
	        'MacIntel',
	        'iPad Simulator',
	        'iPhone Simulator',
	        'iPod Simulator',
	        'iPad',
	        'iPhone',
	        'iPod'
	    ];

	    if (!!navigator.platform ) {
		    if (navigator.platform.indexOf('Win') >= 0) {
				 while (iDevices.length) {
		            if (navigator.userAgent.indexOf(iDevices.pop()) >= 0) {
		                return true;
		            }
		        }
		    } else {
		        while (iDevices.length) {
		            if (navigator.platform === iDevices.pop() ) {
		                return true;
		            }
		        }
		    }
		}
	    return false;
	},
	isAndroid : function(){
		//안드로이드 여부
		return /(Android)/i.test(navigator.userAgent);
	},
	sendMessage : function(json) {
		//Native 호출 함수
		try {
			if(this.isIOS()) {
				window.webkit.messageHandlers.jsInterface.postMessage(json);
			} else if(this.isAndroid()) {
				var msg = JSON.stringify(json);
				window.jsInterface.postMessage(msg);
			} else {
				// not native
				console.log('not Native');
				this.isApp = false;
			}
		}catch (err) {
			this.isApp = false;
		}
	},
	toast : function(message) {
	    var json = {
	        "action":"toast",
	        "message":message
	    };
	    this.sendMessage(json);
	},
	getVersion : function() {
		/**
		userAgent에서 isNativeApp 변수 세팅 EX. userAgent.indexof('SFAAPP')

		isNativeApp: false,	// APP여부 확인
		isFingerReg: false, // 지문 등록 여부
		isPinReg: false,	// PIN 등록 여부
		bioEnable: false,	// 바이오 등록 가능 여부
		fidoAccountId: '',	// FIDO 등록된 ID
		 */

		if (navigator.userAgent.indexOf('SFAAPP') > 0) {

			this.isNativeApp = true;
		}

	    var json = {
	        "action":"getVersion",
	        "callback":"sfaApp.getVersionResult"
	    };
	    this.sendMessage(json);
	},
	getVersionResult : function(version, platform, lastLoginMethod) {
		this.lastLoginMethod = lastLoginMethod;
		this.platform = platform;
		this.isApp = true;
		this.checkFidoReg();
	},
	callOzViewer : function(parameters){

		//this.sendMessage();
	}, // 파이도 바이오인증 지원기기인지 알아보기
	checkFido : function() {
	    var json = {
	        "action" : "fido",
	        "fidoAction" : "isSupported",
	        "callback": "sfaApp.checkFidoResult"
	    };
	    this.sendMessage(json);
	}, // 파이도 : 바이오인증 지원기기인지 알아보기 결과
	checkFidoResult : function(result) {

		this.bioEnable = result;
	}, // 파이도 등록 여부 알아보기
	checkFidoReg : function() {
	    var json = {
	        "action" : "fido",
	        "fidoAction" : "checkFidoReg",
	        "callback" : "sfaApp.checkFidoRegResult"
	    }
	    this.sendMessage(json);
	}, // 파이도 등록 여부 알아보기 결과 콜백
	checkFidoRegResult : function(pin, bio, accountId, bioEnable) {
		this.isFingerReg   = bio;
		this.isPinReg      = pin;
		this.fidoAccountId = accountId;
		this.bioEnable = bioEnable;
	}, // -------------- MCM00002600 --------------
		// 금융인증서 인증이나 본인명의 휴대폰 인증이 통과 한 후 실행
		// 바이오 인증 등록
	fidoFingerReg : function(usrId) {
	    var json = {
	        "action"       : "fido",
	        "fidoAction"   : "reg",
	        "fidoAuthType" : "finger",
	        "accountId"    : usrId,
	        "callback"	   : "sfaApp.fidoFingerRegResult"
	    };
	    this.sendMessage(json);
	}, //바이오 인증 등록 결과
	fidoFingerRegResult : function(error,postData,accountId) {
	    /**
	     * error
	     * 0 = 성공
	     * 1005 = 기등록 사용자 (이미 인증 등록함)
	     * 300 = 미지원 기기
	     * postData : 세션토큰
	     **/
	    if (error == 0) {
	        // 바이오인증 등록 성공
			this.isFingerReg = true;
	    } else if (error == 1005) {
	        // 이미 등록 되어 있음
	    } else if (error == 300) {
	        // 바이오인증 미지원 기기
	    } else if (error == 400) {
	        // 기등록후 앱을 삭제, 재설치 함. 네이티브단 에서 인증정보 삭제했으므로 등록 재시도.
	        this.fidoFingerReg();
	    }
	}, // -------------- PCM00002005 --------------
		// 바이오 인증 (터치,페이스아이디) 으로 로그인
	fidoFingerAuth : function() {
	    var json = {
	        "action":"fido",
	        "fidoAction":"auth",
	        "fidoAuthType":"finger",
	        "callback":"sfaApp.fidoFingerAuthResult"
	    };
	    this.sendMessage(json);
	},// 바이오 인증 결과
	fidoFingerAuthResult : function(error,postData,accountId) {
	    /**
	     * error
	     * 0 = 성공
	     * 1031 : 미등록 상태에서 Fido 인증 시도함.
	     * 1033 : 바이오인증 정보 변경됨. (지문 추가 등)
	     * 1035 : 5회 이상 실패하여 지문이 잠겨있음.
	     * 1034 : 시스템에 등록된 지문이 없습니다.
	     * accountId : 인증한 accountId
	     * postData : 세션토큰 검증 후 로그인 진행
	     **/

	    if(error == 0) {
	        // 성공 postData 검증 및 로그인 진행
	        fidoTokenVerify(accountId,postData);
	    } else if (error == 400) {
	        //기존에 등록후 앱을 삭제하고 다시 설치함. 로컬에 저장된 accountId 가 없어 로그인 불가.
	    } else if(error == 1031) {
	        // 미등록 상태에서 Fido 인증 시도함.
	    } else if(error == 1033) {
	        // 바이오 인증 정보 변경됨
	        var json = {
	            "action":"fido",
	            "fidoAction":"deReg",
	            "fidoAuthType":"finger",
	            "accountId":accountId,
	            "callback":"fidoFingerAuthDeRegResult"
	        };
	        this.sendMessage(json);
	    } else if(error == 1034) {
	       // 시스템에 등록된 지문이 없음.
	    } else if(error == 1035) {
	        // 5회이상 인증시도 실패하여 지문이 잠겨있음
	    }
	},
	fidoFingerAuthDeRegResult : function(error,postData,accountId) {
	    if(error == 0) {
	        // 바이오 인증 정보 변경되어 인증 정보 해지함
	    }
	}, // -------------- MCM00002700 --------------
		// 간편비밀번호 등록
		// 금융인증서 인증이나 본인명의 휴대폰 인증이 통과 한 후 실행
	fidoPinReg : function() {
	    var json = {
	        "action":"fido",
	        "fidoAction":"reg",
	        "fidoAuthType":"pin",
	        "accountId":"test01",
	        "callback":"fidoPinRegResult"
	    };
	    this.sendMessage(json);
	}, // 간편비밀번호 등록 결과
	fidoPinRegResult : function(error,postData,accountId) {
	    /**
	     * error
	     * 0 = 성공
	     * 1005 기등록 사용자 (이미 파이도 인증 등록함)
	     *
	     * postData : 세션토큰. 등록결과 검증용.
	    **/
	   if (error == 0) {
	       // 간편비밀번호 등록 성공
		   this.isPinReg = true;
	       // 세션토큰 검증
	       fidoTokenVerify(accountId,postData);
	   } else if (error == 1005) {
	       // 이미 등록되어 있음.
	   } else if (error == 400) {
	       // 기등록 사용자가 앱을 삭제후 재설치함. 기존 등록정보 네이티브단에서 삭제처리됨. 등록 재시도.
	       this.fidoPinReg();
	   }
	}, // -------------- PCM00002005 --------------
		// 간편비밀번호 인증
	fidoPinAuth : function() {
	    var json = {
	        "action":"fido",
	        "fidoAction":"auth",
	        "fidoAuthType":"pin",
	        "callback":"fidoPinAuthResult"
	    };
	    this.sendMessage(json);
	}, // 간편비밀번호 인증 결과
	fidoPinAuthResult : function(error,postData,accountId) {
	    /**
	     * error
	     * 0 = 성공
	     * 1031 : 미등록 상태에서 Fido 인증 시도함.
	     * 400, 1005 : 기등록 상태에서 앱을 삭제후 재설치함.
	     *
	     * postData : 세션토큰
	    **/
	   if (error == 0) {
	       // 간편 비밀번호 인증 성공


	   } else if (error == 400 ) {
	       // 기등록후 앱을 삭제, 재설치함. 로컬에 저장된 accountId 가 없어 로그인 불가.
	   } else if (error == 1005) {
	       // 기등록후 앱을 삭제. 로그인 후
	   } else if (error == 1031) {
	       // 간편 비밀번호 등록이 되어있지 않음
	   }
	},
	fidoPinAuthDeRegResult : function(error,postData,accountId) {
	    if (error == 0 ) {
	        // dereg 성공
	    }
	}, // -------------- PCM00002800, PCM00002700 --------------
		// 간편비밀번호 해지
	fidoPinDeregWithAuth : function() {
	     var json = {
	        "action":"fido",
	        "fidoAction":"deregWithAuth",
	        "fidoAuthType":"pin",
	        "callback":"fidoFingerDeregWithAuthResult1"
	    };
	    this.sendMessage(json);
	}, // 간편비밀번호 해지 (선 인증 결과)
	fidoPinDeregWithAuthResult1 : function(error,postData,accountId) {
	    /**
	     * postData = 선 인증결과의 세션 토큰 세션 토큰 확인 로직 후 해지하기 진행
	     * error
	     * ios 1031 이미 해지되어 있음.
	     **/
	    if(error == 0 ) {

	    }
	}, // 간편비밀번호 해지 (해지 결과)
    // -------------- MCM00002600 --------------
		// 바이오인증 해지
	fidoFingerDeregWithAuth : function() {
	     var json = {
	        "action":"fido",
	        "fidoAction":"deregWithAuth",
	        "fidoAuthType":"finger",
	        "callback":"fidoFingerDeregWithAuthResult1"
	    };
	    this.sendMessage(json);
	}, // 바이오인증 해지 (선 인증 결과)
	fidoFingerDeregWithAuthResult1 : function(error,postData,accountId) {
	    // postData = 선 인증결과의 세션 토큰
	    // error : 1031 이미 해지되어 있음.
	    if(error == 0) {

	    }
	}, // 바이오인증 등록 해지 (해지 결과)
	fidoTokenVerify : function(accountId,session) {
	    var frm	= document.myform;
	    $.ajax({
	        type: "POST"
	        ,url: "/sample/sampleFidoTokenVerify.do" // 토큰 검증 URL
	        ,dataType: "json"
	        ,contentType : "application/json; charset=utf-8"
	        ,data: JSON.stringify({
	                accountId:accountId
	                ,authCd:"04" // companyCode 04
	                ,authSession:session
	                })
	        ,timeout:"10000"
	        ,success: function(data){
	            //검증 성공. 로그인 진행
	        }
	        ,error: function(request,status,error){
	            //검증 실패.
	        }
	    });
	},
	setAutoConnectInfo : function(autoConnectInfo) {
		var json = {
	        "action" : "setAutoConnectInfo",
	        "value" : autoConnectInfo,
	        "callback":"sfaApp.setAutoConnectInfoResult"
	    };
	    this.sendMessage(json);
	},
	setAutoConnectInfoResult : function() {
		
	},
	getAutoConnectInfo : function() {
		var json = {
	        "action" : "getAutoConnectInfo",
	        "callback":"sfaApp.getAutoConnectInfoResult"
	    };
	    this.sendMessage(json);
	},
	getAutoConnectInfoResult : function(info) {
		this.device_autoConnectInfo = info;		
	},
	getDeviceUUID : function() {
		var json = {
	        "action" : "getUUID",
	        "callback":"sfaApp.getDeviceUUIDResult"
	    };
	    this.sendMessage(json);
	},
	getDeviceUUIDResult : function(uuid) {
		this.device_uuid = uuid;		
	}
};