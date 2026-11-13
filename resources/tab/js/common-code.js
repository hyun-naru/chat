/**
 * 공통코드 객체 정의
 * <pre>
 * 공통코드 핸들링함수
 * </pre>
 *
 * @author 70121
 * @since  2022.07.13
 * @version 1.0
 */
 var sfaCommonCode = {
 	/**
 	 *  클라이언트의 스토리지에 저장하여 사용
 	 * 	전체레이아웃 로드시 호출
 	 **/
	init : function(){
	    /**공통코드셋팅*/
    	if (!globalStorage.get("sfaCommonCode")) {	//sfaCommonCode가 빈 값일 경우 호출
		    comTx.ajax('/cm/comm/getCommonCode.do', {}, function(ajaxObj, rstData){
		    	globalStorage.set("sfaCommonCode", rstData);
		    }, {'async' : false})
    	}
	},
 	/**
 	 *  클라이언트의 스토리지에 저장
 	 * 	전체레이아웃 로드시 호출
 	 **/
	reload : function(){
	    comTx.ajax('/cm/comm/reloadCommonCode.do', {}, function(ajaxObj, rstData){
	    	//globalStorage.remove("sfaCommonCode");
	    	globalStorage.set("sfaCommonCode", rstData);
	    }, {})
	},
 	/**
 	 *  상위코드리스트 : ROOT이하 [코드레벨 : 1]의 목록
 	 **/
	getGroupCodeList : function(){
		if (!!globalStorage.get("sfaCommonCode")) {
			var sfaCommonCode = JSON.parse(globalStorage.get("sfaCommonCode"));
			return sfaCommonCode.commonCode.commonCodeGroup;
		} else {
			return null;
		}
	},
 	/**
 	 *  하위코드리스트 : 레벨1코드별 [코드레벨 : 2]의 목록
 	 **/
	getCodeByGroup : function(groupCode) {
		if (!!globalStorage.get("sfaCommonCode")) {
			var sfaCommonCode = JSON.parse(globalStorage.get("sfaCommonCode"));
			return sfaCommonCode.commonCode[groupCode];
		} else {
			return null;
		}
	},
 	/**
 	 *  코드명 : 상위코드(레벨1), 코드ID 로 코드명을 OUTPUT
 	 **/
	getCodeName : function(groupCodeId, codeId) {
		var codeList = this.getCodeByGroup(groupCodeId);

		if (!!codeList) {
			var codeName = "";
			for (var i = 0;i < codeList.length; i++) {
				if(codeList[i].CDID == codeId) {
					codeName = codeList[i].CDNM;
					break;
				}
			}
			return codeName
		} else {
			return null;
		}
	},
	/**
 	 *  단축코드명 : 상위코드(레벨1), 코드ID 로 단축코드명을 OUTPUT
 	 **/
	getCodeSrtName : function(groupCodeId, codeId) {
		var codeList = this.getCodeByGroup(groupCodeId);

		if (!!codeList) {
			var codeSrtName = "";
			for (var i = 0;i < codeList.length; i++) {
				if(codeList[i].CDID == codeId) {
					codeSrtName = codeList[i].CDSRTNM;
					break;
				}
			}
			return codeSrtName
		} else {
			return null;
		}
	}
}

/**
 * 청약 공통코드 객체 정의
 * <pre>
 * 청약 공통코드 핸들링함수
 * </pre>
 *
 * @author 70100
 * @since  2022.08.05
 * @version 1.0
 */
 var sbCommonCode = {
 	/**
 	 *  클라이언트의 스토리지에 저장하여 사용
 	 * 	전체레이아웃 로드시 호출
 	 **/
	init : function(){
	    /**공통코드셋팅*/
    	if (!globalStorage.get("sbCommonCode")) {	//sfaCommonCode가 빈 값일 경우 호출
		    comTx.ajax('/cm/comm/getSbCommonCode.json', {}, function(ajaxObj, rstData){
		    	globalStorage.set("sbCommonCode", rstData.sbCodeMap);
		    }, {})
    	}
	},
 	/**
 	 *  클라이언트의 스토리지에 저장
 	 * 	전체레이아웃 로드시 호출
 	 **/
	reload : function(){
	    comTx.ajax('/cm/comm/reloadSbCommonCode.json', {}, function(ajaxObj, rstData){
	    	globalStorage.set("sbCommonCode", rstData.sbCodeMap);
	    }, {})
	},
 	/**
 	 *  모든코드맵리스트 : 모든코드맵리스트
 	 **/
	getGroupCodeMap : function(){
		if (!!globalStorage.get("sbCommonCode")) {
			let sbCommonCode = JSON.parse(globalStorage.get("sbCommonCode"));
			return sbCommonCode;
		} else {
			return null;
		}
	},
 	/**
 	 *  하위코드리스트 : 레벨1코드별 [코드레벨 : 2]의 목록
 	 **/
	getCodeByGroup : function(groupCode) {
		if (!!globalStorage.get("sbCommonCode")) {
			let sbCommonCode = JSON.parse(globalStorage.get("sbCommonCode"));
			return sbCommonCode[groupCode];
		} else {
			return null;
		}
	},
 	/**
 	 *  코드명 : 상위코드(레벨1), 코드ID 로 코드명을 OUTPUT
 	 **/
	getCodeName : function(groupCodeId, codeId) {
		var codeMap = this.getCodeByGroup(groupCodeId);
		if (!!codeMap) {
			return codeMap[codeId];
		} else {
			return null;
		}
	},
}