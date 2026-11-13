/**
 * @target
 */
var commonStr= {}; //This is WebSquare JavaScript Marker. Do not remove this line.

/**
 * 검사할 문자열 값이 존재하는지 여부 검사
 *
 * @date 2020.10.30
 * @private
 * @param {string} data : 검사할 문자열
 * @memberOf
 * @author
 * @return 값이 존재하면 true, 존재하지 않으면 false
 * ex)ccommonStr.exists('');
 */
commonStr.exists = function(data) {
	data += "";
	if (data == null || data == "null"
		|| data == undefined || data == "undefined" || data == "" ) {
		return false;
	}else {
		return true;
	}
};

/**
 * 검사할 문자열이 존재하지 않을경우 대체 문자열로 리턴
 *
 * @date 2020.10.30
 * @private
 * @param {string} data : 검사할 문자열
 * @param {string} defaultVal : 대체할 문자열
 * @memberOf
 * @author
 * @return 검사할 문자열이 존재하지 않을경우 대체 문자열
 * ex)commonStr.nvl('test','');
 */
commonStr.nvl = function(data , defaultVal) {
	if (commonStr.exists(data)){
		return data;
	}else{
		return defaultVal;
	}
};

commonStr.trim = function(str) {
	if(commonStr.exists(str)){
		return str.replace(/^\s+|\s+$/g,"");
	} else {
		return "";
	}
};

commonStr.numberOnly = function(str) {
	return str.replace(/[^0-9]/g,"");
};

commonStr.engOnly = function(str) {
	return str.replace(/[^a-zA-Z]/g,"");
};

commonStr.notKor = function(str) {
	return str.replace(/[\ㄱ-ㅎㅏ-ㅣ가-힣]/g,"");
};

commonStr.emailDomain = function(str) {
	return str.replace(/[^a-z.]/g, "");
};

commonStr.deleteComma = function(str) {
	return str.replace(/,/gi, "");
}

commonStr.deleteDot = function(str) {
	return str.replace(/\./gi, "");
}

commonStr.deleteDash = function(str) {
	return str.replace(/\-/gi, "");
}

/**
 * 문자열, 자리수, 앞뒤구분 받아 자리수를 맞춰서 앞(F)/뒤(B) Zero 채우기
 *
 * @date 2020.10.30
 * @private
 * @param {string} tmpStr : 검사할 문자열
 * @param {string} tmpNum : 자리수
 * @param {string} tmpFlag : F(앞) / 뒤(B)
 * @memberOf
 * @author
 * @return 변환된 값 리턴, 검사할 문자열이 자리수 보다 크거나 같은 경우는 검사할 문자열을 그대로 리턴함
 * ex)commonStr.strFillValue(String(index+1),'2','F')
 */
commonStr.strFillValue = function(tmpStr,tmpNum, tmpFlag) {
	var valTmp="";
    var tValue = tmpStr.length;

    if(tValue >= tmpNum){
    	valTmp = tmpStr;
    }else{
    	for(i=tValue; i< tmpNum; i++){
    		if(tmpFlag == 'F'){
    			valTmp += "0";
    			if(i == (tmpNum-1)){valTmp += ''+tmpStr; }
    		}else{
    			if(i == tValue){valTmp += tmpStr; }
    			valTmp += ''+"0";
    		}
    	}
    }

    return valTmp;
};

/**
 * 입력된 사업자등록번호를 자동으로 - 채움
 *
 * @date 2020.11.12
 * @private
 * @param {string} bsnnRgstNum : 사업자등록번호
 * @memberOf
 * @author
 * @return 123-45-12345 형태로 리턴
 */
commonStr.AutoBsnnRgstNumHypen = function(bsnnRgstNum) {
	bsnnRgstNum = bsnnRgstNum.replace(/[^0-9]/g, '');
    var tempNum = '';

    if(bsnnRgstNum.length < 4){
    	return bsnnRgstNum;
    }else if(bsnnRgstNum.length < 6){
    	tempNum += bsnnRgstNum.substr(0,3);
    	tempNum += '-';
    	tempNum += bsnnRgstNum.substr(3,2);
    	return tempNum;
    }else if(bsnnRgstNum.length < 11){
    	tempNum += bsnnRgstNum.substr(0,3);
    	tempNum += '-';
    	tempNum += bsnnRgstNum.substr(3,2);
    	tempNum += '-';
    	tempNum += bsnnRgstNum.substr(5);
    	return tempNum;
    }else{
    	tempNum += bsnnRgstNum.substr(0,3);
    	tempNum += '-';
    	tempNum += bsnnRgstNum.substr(3,2);
    	tempNum += '-';
    	tempNum += bsnnRgstNum.substr(5);
    	return tempNum;
    }
};

/**
 * 사업자등록번호 유효성 체크
 *
 * @date 2020.11.12
 * @private
 * @param {string} bsnnRgstNum : 사업자등록번호
 * @memberOf
 * @author
 * @return boolean
 */
commonStr.bsnnRgstNumCheck = function(bsnnRgstNum){
	var numberMap = bsnnRgstNum.replace(/-/gi, '').split('').map(function (d){
		return parseInt(d, 10);
	});

	if(numberMap.length == 10){
		var keyArr = [1, 3, 7, 1, 3, 7, 1, 3, 5];
		var chk = 0;

		keyArr.forEach(function(d, i){
			chk += d * numberMap[i];
		});

		chk += parseInt((keyArr[8] * numberMap[8])/ 10, 10);
		console.log(chk);
		return Math.floor(numberMap[9]) === ( (10 - (chk % 10) ) % 10);
	}

	return false;
}

/**
 * 비밀번호 정규식 체그
 * @param {string} pw : 비밀번호
 * @return boolean
 */
commonStr.passwordRegexCheck = function(pw){
	var regExPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&~`^+-=<>.,&])[A-Za-z\d$@$!%*#?&~`^+-=<>.,&]{8,12}$/;	//숫자,문자,특수문자 포함 8~12
	var regExPwno = /(\w)\1\1/;	//연속된 3자리 문자

	if(!regExPw.test(pw)) {
		//비밀번호 정규식 규칙 위반
		return false;
	}

	if(regExPwno.test(pw)) {
		//비밀번호 정규식 규칙 위반
		return false;
	}

	return true;
}

/**
 * 전화(휴대폰)번호 포멧팅
 * @param {string} telNo : 휴대폰번호
 * @return {string}
 */
commonStr.getTelNoFormat = function(telNo) {
	var telNoFormat = telNo.replace(/[^0-9\.]/g, '');
	telNoFormat = telNoFormat.replace(/(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,'$1-$2-$3');
	telNoFormat = telNoFormat.replace('--','-');
	return telNoFormat;
}