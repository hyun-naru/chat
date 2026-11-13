const myfuncInit = function(){
  const tabs = document.querySelectorAll('.gnb_tab');
  const subs = document.querySelectorAll('.gnb_tab_sub');
  const breadTabs = document.querySelectorAll('.breadcrumbs_list');
  const header = document.querySelector('.header');
  const breadcrumbFixed = document.querySelector('.breadcrumbs_fixed');
  const breadcrumbFixedWrap1 = document.querySelector('.breadcrumbs_fixed .breadcrumbs_fixed_wrap');
  const breadcrumbFixedWrap2 = document.querySelector('.breadcrumbs_fixed .breadcrumbs_fixed_wrap2');
  const footer_menu_btn_closes = document.querySelectorAll('.footer_menu_list .btn_close');
  // const tabBoxItems = document.querySelectorAll('.tabBoxItem');
  // const tabBoxDisplayItems = document.querySelectorAll('.tabBoxDisplayItem');

  // GNB
  for (const tab of Array.from(tabs)) { // tab : mouseEnter
    tab.addEventListener("mouseenter", mEnter, false);
    tab.addEventListener("click", mEnter, false);
  }
  for (const sub of Array.from(subs)) { // tab : mouseLeave
    sub.addEventListener("mouseleave", mLeave, false);
  }
  
  function mEnter(e) {
    e.preventDefault();
    tabs.forEach(e => {
      e.classList.remove('active');
    });
    subs.forEach(e => {
      e.classList.remove('active');
    });
    this.classList.add('active');
    this.nextElementSibling.classList.add('active');
    
    // 클릭이 header 범위를 벗어난 곳에서 일어나면 subs를 닫기 위한 이벤트 추가
	  // const closeMenu = (event) => {
		//   console.log('active인 상태에서 클릭 들어오고 있음.');
	  //   const isClickInsideHeader = header.contains(event.target);
	  //   if (!isClickInsideHeader) {
		// 	console.log('헤더가 아닌곳 클릭함');
	  //     subs.forEach(sub => sub.classList.remove('active'));
	  //     tabs.forEach(tab => tab.classList.remove('active'));
	  //     document.removeEventListener('click', closeMenu);  // 클릭 이벤트 제거
	  //   }
	  // };
	  // 클릭 이벤트를 document에 추가 (menu가 열린 상태에서만)
	  //document.addEventListener('click', closeMenu, false);
  }
  

  function mLeave(e) {
    e.preventDefault();
    tabs.forEach(e => {
      e.classList.remove('active');
    });
    subs.forEach(e => {
      e.classList.remove('active');
    });
  }

  // 인증센터
  $(".certify_menu_btn").click(function(){
    $(".certify_menu_sub").stop().fadeToggle(100);
    $(".certify_menu_sub a").addClass('open');
    return false;
  })
  $(document).click(function(e){
    if(e.target.className =="open"){return false}
    $(".certify_menu_sub").stop().fadeOut(100);
  });


  // Breadcrumb
  for (const breadTab of Array.from(breadTabs)) { // breadcrumb tab : click
    breadTab.addEventListener("click", breadcrumbToggle, false);
  }

  function breadcrumbToggle(e) {
    e.preventDefault();
    const aria = this.getAttribute('aria-pressed') === 'true';
    breadTabs.forEach(e => {
      e.setAttribute('aria-pressed', 'false');
      e.classList.remove('active');
      e.childNodes[2].classList.remove('icon_arrow_down');
      e.childNodes[2].classList.add('icon_arrow_up');
    })

    this.setAttribute('aria-pressed', !aria);
    if (!aria) {
      this.childNodes[2].classList.remove('icon_arrow_up');
      this.childNodes[2].classList.add('icon_arrow_down');
    } else {
      this.childNodes[2].classList.remove('icon_arrow_down');
      this.childNodes[2].classList.add('icon_arrow_up');
    }
  }

  // Breadcrumb fixed ->초기실행이 특정위치에서는 간혹 안되서 수정했습니다.
  /*document.addEventListener('scroll', () => {
    breadcrumbFixInit();
  });  스트롤 탭 비 활성화 */

  const breadcrumbFixInit = ()=> {
    const headerHeight = header.clientHeight;
    const currentScrollValue = document.documentElement.scrollTop;
    !(currentScrollValue >= headerHeight) ? breadcrumbFixed.classList.remove('active') : breadcrumbFixed.classList.add('active');
    const tab3 = tabs[2];
    if (!!tab3) {
      if (tab3.classList.contains('on') || tab3.classList.contains('active')) {
        breadcrumbFixedWrap1.classList.remove('active');
        breadcrumbFixedWrap2.classList.add('active');
      } else {
        breadcrumbFixedWrap1.classList.add('active');
        breadcrumbFixedWrap2.classList.remove('active');
      }
    }
  }

  /*setTimeout(()=>{
    breadcrumbFixInit()
  },10) 스트롤 탭 비 활성화 */

  // BreadCrumb close btn
  for (const btnClose of Array.from(footer_menu_btn_closes)) {
    btnClose.addEventListener('click', fnBtnClose, false);
  }
  function fnBtnClose(e) {
    e.preventDefault();
    this.parentElement.remove(this.parentElement);
  }

  // TabBox
  // tabbox 다중으로 있을때 충돌납니다. 레이어 팝업에 탭이 나올수도 있습니다.
  // 각각 탭이 별개로 동작하게 해주셔야 합니다~
  // for (const tab of Array.from(tabBoxItems)) { // tabBox click
  //   tab.addEventListener("click", tabBoxMove, false);
  // }

  // function tabBoxMove(e) {
  //   e.preventDefault();

  //   const tabIndex = Array.from(tabBoxItems).indexOf(this);
  //   const tabBoxDisplayItem = Array.from(tabBoxDisplayItems)[tabIndex];

  //   tabBoxItems.forEach(e => {
  //     e.classList.remove('active');
  //   });
  //   this.classList.add('active');

  //   tabBoxDisplayItems.forEach(e => {
  //     e.classList.remove('active');
  //   });
  //   tabBoxDisplayItem.classList.add('active');
  // }
}


// script 로드하는 구문 추가했습니다. 추후 정리하시는거에 따라서 head테그에 삽입하셔도 됩니다.
/*document.write('<script type="text/javascript" src="../../js/lib/jquery-3.5.1.min.js"></script>');
document.write('<script type="text/javascript" src="../../js/lib/swiper.min.js"></script>');
document.write('<script type="text/javascript" src="../../js/ui.front.js"></script>');
document.write('<script type="text/javascript" src="../../js/ui.campaign.js"></script>');*/


window.onload = function () {
  // html파일 일때만, 즉 개발팀 개입 없이 순수 퍼블리싱 일때만 실행되게 (s)
  if( window.location.href.indexOf('.html') > -1 ){
    if( $('.header *').length == 0 ){
      $('.header').html(headerHTML);
    }
    // if( $('.breadcrumbs *').length == 0 ){
    //   $('.breadcrumbs').html(breadcrumbHTML);
    // }
    // if( $('.footer *').length == 0 ){
    //   $('.footer').html(footerHTML);
    // }
    // ui.front.js 초기 실행
    layout.init(); // 페이지가 준비가 됐을 때 딱 한번만 실행 (공통 개발팀에서 호출하는게 좋습니다.)
    ui.init(); // 페이지가 동적으로 바뀔때마다 실행 (개발을 붙였더니 뭔가 동작을 안할때 개발페이지 개발자들이 호출하는게 좋습니다.)
    myfuncInit(); // 페이지 상단 GNB 관련 JS
    //campaignInit(); // campaign 관련 JS. ui.campaign.js에서 불러옴

    // 잊으시는 분들이 많아서 넣었습니다.(s)
    if( $('#content .tit01').length > 0 && $('#content .tit01').find('*').length == 0 ){
      $('title').text( $('#content .tit01').text() )
    }
    setTimeout(function(){
      if( $('html').hasClass('popOn') && $('.popWrap .tit01').length > 0 ){
        $('title').text( $('.popWrap .tit01').text() )
      }
    }, 500)
    // 잊으시는 분들이 많아서 넣었습니다.(e)

  }
  // html파일 일때만, 즉 개발팀 개입 없이 순수 퍼블리싱 일때만 실행되게 (e)
}





/*

차장님께서 만드신 스크립트들은 제가 우선 함수 하나로 빼놓았습니다.

이것들은 init할 수 있는 element들이 준비가 됐을 때 실행되어야 합니다.
따라서 gnb, footer, tab 등 모두 독립적인 함수로 빼주셔야 하고
element들이 준비가 되면 용도에 맞게 실행되어야 합니다.

제가 사용하는 layout.init() 함수가 그런 용도입니다.
저는 이 함수를 페이지 진입시 최초 딱 한번만 실행되는 함수로 정의 했고
그안에는 그용도에 맞게 gnb, footer등 페이지 진입시 딱 한번만 실행되는 함수를 넣었습니다.

실제 제가 사용할 때는
layout.init => gnb, footer, quick 등과 같이 페이지 진입시 1회만 실행되어야만 하는 함수들.
ui.init => input, accordion, tab, tooltip 등 동적으로 언제든 자유롭게 ajax 방식으로 동적으로 생성될수 있는 ui에 관련된 함수들.

이런식으로 구조를 잡고 개발팀에 noti할때는 아래와 같이 합니다.

layout.init => 공통개발팀에서 최초 1회 실행. (gnb, footer등 element가 append된 이후에..)
ui.init => 개별 페이지 개발자들이 개발을 붙였는데 화면이 깨지거나 무언가 동작하지 않을때 실행 (element append 된 이후 실행)


차장님께서는 함수를 짜실때는
ui.init은 극단적인 예시로 1초마다 무한으로 실행되더라도
중복 실행을 반드시 방지하시고 부하 걸리지 않는 문제없는 코드들로 개발해주셔야 합니다.


위 용도를 이해하시고 스크립트를 짜시는게 개발 붙였을때 리스크가 없습니다.
함수 이름과 구조는 상관없지만
위 내용을 참고하시고
이번 프로젝트에서 전체적인 스크립트 설계 해주시는것이 좋습니다.


참고로 저는 layout.init 함수에서
마지막에는 자체적으로 ui.init을 실행시킵니다.

위에 window.onload에는 이해를 돕기위해 넣은 것입니다.

*/