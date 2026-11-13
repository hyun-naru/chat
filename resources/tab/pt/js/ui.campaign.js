// tobe 규격 변경 보류.

const campaignInit = function () {

  // 캠페인 - 미니 팝업
  const campaignLinkOpen = document.querySelectorAll('.campaignLink_open');
  const campaignLinkClose = document.querySelectorAll('.campaignLink_lose');
  const campaignLinkWrap = document.querySelectorAll('.campaignLink_wrap');
  for (const linkOpen of Array.from(campaignLinkOpen)) {
    linkOpen.addEventListener('click', popupOpen, false);
  }
  for (const linkClose of Array.from(campaignLinkClose)) {
    linkClose.addEventListener('click', popupClose, false);
    console.log(linkClose);

  }
  function popupOpen(e) {
    e.preventDefault();
    for (const linkClose of Array.from(campaignLinkClose)) {
      linkClose.parentElement.classList.remove('active');
    }
    this.nextElementSibling.classList.add('active');
  }
  function popupClose(e) {
    e.preventDefault();
    this.parentElement.classList.remove('active');
  }

  const campaign = document.querySelectorAll("#campaignInquire>li");
  const campaignRadios = document.querySelectorAll("#campaignInquireLists input[name]");
  const campaign2 = document.querySelectorAll("#campaignInquire2>li");
  const campaignRadios2 = document.querySelectorAll("#campaignInquireLists2 input[name]");
  const campaign3 = document.querySelectorAll("#campaignInquire3>li");
  const campaignRadios3 = document.querySelectorAll("#campaignInquireLists3 input[name]");

  // 캠페인 - radio 으로 열리고 닫히는 ui
  for (const campaignRadio of Array.from(campaignRadios)) {
    campaignRadio.addEventListener("change", addActive, false);
  };
  function deleteActive (e) {
    for (let index = 1; index < campaign.length; index++) {
      campaign[index].classList.remove('active');
    }
  };
  function addActive(e) {
    deleteActive();
    campaign[this.value].classList.add('active');
  };

  function radioReset() {
    for (const campaignRadio of Array.from(campaignRadios)) {
      campaignRadio.setAttribute('checked', '');
    }
    if(campaignRadios.length >0){campaignRadios[0].checked = true;}
  };
  function radioSetActive() {
    deleteActive();
    radioReset();
    if(campaign.length>0){campaign[0, 1].classList.add('active');}
  };
  
  // Radio reset
  const btnReset1 = document.querySelector('#btnReset');
  btnReset1?.addEventListener("click", radioSetActive, false);
  
// 캠페인 고객관리 PCS03040100
  for (const campaignRadio of Array.from(campaignRadios2)) {
    campaignRadio.addEventListener("change", addActive2, false);
  }
  function deleteActive2 (e) {
    for (let index = 1; index < campaign2.length; index++) {
      campaign2[index].classList.remove('active');
    }
    $("#condFltrGrp").hide();
  }
  function addActive2(e) {
    deleteActive2();
    if (this.value > 1) {
      campaign2[this.value].classList.add('active');
      campaign2[Number(this.value)+1].classList.add('active');
      campaign2[4].classList.add('active');
      campaign2[5].classList.add('active');
      campaign2[6].classList.add('active'); // 성별
      campaign2[7].classList.add('active'); // 연령대
      campaign2[8].classList.add('active'); // 상품군
      campaign2[9].classList.add('active'); // 지역
      campaign2[10].classList.add('active'); // 연락금지여부
      campaign2[11].classList.add('active'); // MCP
    } else {
      campaign2[this.value].classList.add('active');
      campaign2[4].classList.add('active');
      campaign2[5].classList.add('active');
      campaign2[6].classList.add('active'); // 성별
      campaign2[7].classList.add('active'); // 연령대
      campaign2[8].classList.add('active'); // 상품군
      campaign2[9].classList.add('active'); // 지역
      campaign2[10].classList.add('active'); // 연락금지여부
      campaign2[11].classList.add('active'); // MCP
      $("#condFltrGrp").show(); // 목록 상태 구분 숨김
    }
  }

  function radioReset2() {
	  for (const campaignRadio of Array.from(campaignRadios2)) {
	    campaignRadio.setAttribute('checked', '');
	  }
	  if(campaignRadios2.length > 0) {campaignRadios2[0].checked = true;}
	};
	function radioSetActive2() {
	  deleteActive2();
	  radioReset2();
	  if(campaign2.length > 0) {
		campaign2[0].classList.add('active');
		campaign2[1].classList.add('active');
		campaign2[4].classList.add('active');
		campaign2[5].classList.add('active');
	  }
	  $("#condFltrGrp").show(); // 목록 상태 구분 숨김
	};
  
  // Radio reset
  const btnReset2 = document.querySelector('#btnReset');
  btnReset2?.addEventListener("click", radioSetActive2, false);

  // 캠페인 고객관리 PCS03050100
  for (const campaignRadio of Array.from(campaignRadios3)) {
    campaignRadio.addEventListener("change", addActive3, false);
  }
  function deleteActive3 (e) {
    for (let index = 0; index < campaign3.length; index++) {
      campaign3[index].classList.remove('active');
    }
  }
  /* 고객관리 - 캠페인고객관리(캠페인별, 조직/판매인별) Display */
  function addActive3(e) {
    deleteActive3();
    if (this.value > 1) {
      campaign3[0].classList.add('active'); // 조회구분
      campaign3[2].classList.add('active'); // 채널
      campaign3[3].classList.add('active'); // 본부
      campaign3[4].classList.add('active'); // 지점
      campaign3[5].classList.add('active'); // 팀
      campaign3[6].classList.add('active'); // 판매인명
      campaign3[7].classList.add('active'); // 상태구분
      campaign3[8].classList.add('active'); // 고객명
      campaign3[9].classList.add('active'); // 휴대폰번호
      campaign3[10].classList.add('active'); // 성별
      campaign3[11].classList.add('active'); // 연령대
      campaign3[12].classList.add('active'); // 상품군
      campaign3[13].classList.add('active'); // 채널
      campaign3[14].classList.add('active'); // 지역
      campaign3[15].classList.add('active'); // 최종수금이관일
      campaign3[16].classList.add('active'); // 연락금지여부
	  campaign3[17].classList.add('active'); // MCP
    } else {
      campaign3[0].classList.add('active'); // 조회구분
      campaign3[1].classList.add('active'); // 캠페인 선택
      campaign3[7].classList.add('active'); // 상태구분
      campaign3[8].classList.add('active'); // 고객명
      campaign3[9].classList.add('active'); // 휴대폰번호
      campaign3[10].classList.add('active'); // 성별
      campaign3[11].classList.add('active'); // 연령대
      campaign3[12].classList.add('active'); // 상품군
      campaign3[13].classList.add('active'); // 채널
      campaign3[14].classList.add('active'); // 지역
      campaign3[15].classList.add('active'); // 최종수금이관일
	  campaign3[16].classList.add('active'); // 연락금지여부
      campaign3[17].classList.add('active'); // MCP
    }
  }

  function radioReset3() {
	  for (const campaignRadio of Array.from(campaignRadios3)) {
	    campaignRadio.setAttribute('checked', '');
	  }
	  if(campaignRadios3.length > 0){campaignRadios3[0].checked = true;}
	};
  
  function radioSetActive3() {
	  deleteActive3();
	  radioReset3();
	  if(campaign3.length > 0){
		campaign3[0].classList.add('active');
      	campaign3[1].classList.add('active');
      	campaign3[7].classList.add('active');
        campaign3[8].classList.add('active');
        campaign3[9].classList.add('active');
	  }
	};
  
  // Radio reset
  const btnReset3 = document.querySelector('#btnReset');
  btnReset3?.addEventListener("click", radioSetActive3, false);


  // 캠페인 상세 - radio 전체 선택
  const checkboxSelectAllList = document.querySelectorAll(".iptGroup.vertical.all");
  for (const lists of Array.from(checkboxSelectAllList)) {
    const checkboxSelectAll = lists.querySelectorAll("li input[type=checkbox]");
    checkboxSelectAll[0].addEventListener('change', (e) => {
      var siblings = t => [...t.parentElement.parentElement.children].filter(e => e != t);
      const checkboxSelectBtns = siblings(checkboxSelectAll[0]);
      for (const checkboxSelectBtn of Array.from(checkboxSelectBtns)) {
        !(checkboxSelectAll[0].checked)
        ? checkboxSelectBtn.querySelector("input[type='checkbox']").checked = false
        : checkboxSelectBtn.querySelector("input[type='checkbox']").checked = true;
      }
    })
  }
}

// window.onload = function () {
//   // campaignInit();

// }
console.log('campaignInit(e)');