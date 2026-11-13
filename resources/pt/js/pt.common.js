
// 헤더 메뉴 스토리지 저장 함수
function menuDepSave(oneDepNM, oneDepLK, twoDepNM, twoDepLK, threeDepNM, threeDepLK) {
	//스토리지에 저장되어 있는 메뉴 Dep remove
	removeMenuDep();

	globalStorage.set('oneDepNM', oneDepNM);
	globalStorage.set('oneDepLK', oneDepLK);
	globalStorage.set('twoDepNM', twoDepNM);
	globalStorage.set('twoDepLK', twoDepLK);
	globalStorage.set('threeDepNM', threeDepNM);
	globalStorage.set('threeDepLK', threeDepLK);
}
// 저장된 스토리지 데이터 기반 GNB 구현 함수
function menuDepDraw() {
	let t = '<a href="javascript://" class="breadcrumbs_list_cell"><img src="/resources/pt/images/icons/icon_home.svg" alt="홈 바로가기"></a>';
	let oneDepNM = globalStorage.get('oneDepNM');
	let oneDepLK = globalStorage.get('oneDepLK');
	let twoDepNM = globalStorage.get('twoDepNM');
	let twoDepLK = globalStorage.get('twoDepLK');
	let threeDepNM = globalStorage.get('threeDepNM');
	let threeDepLK = globalStorage.get('threeDepLK');
    //javascript://

	// 1dep 존재 시 데이터 삽입
	if(oneDepNM != null && oneDepNM != '') {
		//t += '<a href="' + oneDepLK + '" class="breadcrumbs_list_cell breadcrumbs_txt"><span>' + oneDepNM + '</span></a>';
		t += '<a href="javascript://" class="breadcrumbs_list_cell breadcrumbs_txt"><span>' + oneDepNM + '</span></a>';
	}
	// 2dep 존재 시 데이터 삽입
	if(twoDepNM != null && twoDepNM != '') {
		//t += '<a href="' + twoDepLK + '" class="breadcrumbs_list_cell breadcrumbs_txt"><span>' + twoDepNM + '</span></a>';
		t += '<a href="javascript://" class="breadcrumbs_list_cell breadcrumbs_txt"><span>' + twoDepNM + '</span></a>';
	}
	// 3dep 존재 시 데이터 삽입
	if(threeDepNM != null && threeDepNM != '') {
		//t += '<a href="' + threeDepLK + '" class="breadcrumbs_list_cell breadcrumbs_txt"><span>' + threeDepNM + '</span></a>';
		t += '<a href="javascript://" class="breadcrumbs_list_cell breadcrumbs_txt"><span>' + threeDepNM + '</span></a>';
	}
	$('#breadcrumbs').html(t);
}

function removeMenuDep() {
	sessionStorage.removeItem('oneDepNM');
	sessionStorage.removeItem('oneDepLK');
	sessionStorage.removeItem('twoDepNM');
	sessionStorage.removeItem('twoDepLK');
	sessionStorage.removeItem('threeDepNM');
	sessionStorage.removeItem('threeDepLK');
}

/**
 * 로그아웃
 *
 * @author 70056
 * @since  2022.08.12
 * @version 1.0
 */
var ptComm = {
	logout : function() {
		comTx.ajax('/comm/cm/Logout.json', {}, function(ajaxObj, rstData){
			removeMenuDep();
			if(rstData.accessEnv === 'TBL') {
	    		location.href = '/cm/pt/comm/LoginViewTablet.do';
	    	} else if(rstData.accessEnv === 'MB') {
	    		location.href = '/cm/mo/comm/LoginViewMobile.do';
	    	} else {
	    		location.href = '/cm/pt/comm/LoginView.do';
	    	}
		}, {});
	},
	home : function() {
		removeMenuDep();
    	location.href = '/ma/pt/index.do';
	}
 }