var headerHTML =
  `<div class="header_top">
<div class="inner">
  <div class="user_info_wrap">
    <div class="user_name"><a href="#"><span>홍길동</span></a>님, 반갑습니다</div>
    <div class="user_classification"><span>하나직영본부</span>/<span>하나지점(00)</span></div>
  </div>
  <ul class="user_util">
    <li class="time_extension">
      <span class="time">00분 00초</span><a href="#">연장</a>
    </li>
    <li><a href="#"><span>로그아웃</span></a></li>
    <li><a href="#">설정</a></li>
    <li class="certify_menu">
      <a href="#" class="certify_menu_btn">인증센터</a>
      <ul class="certify_menu_sub">
        <li><a href="#">금융인증서 등록/삭제</a></li>
        <li><a href="#">사설인증서 발급/관리</a></li>
      </ul>
    </li>
  </ul>
</div>
</div>
<nav>
<div class="nav_wrap">
  <a href="#" class="logo_hana">
    <!-- <img src="./resources/pt/images/logos/logo_hana.svg" alt="하나생명 홈 바로가기"> -->
    <img src="./resources/pt/images/logos/logo_hana_hanaro.png"
      srcset="./resources/pt/images/logos/logo_hana_hanaro@2x.png 2x,./resources/pt/images/logos/logo_hana_hanaro@3x.png 3x">
  </a>
  <ul class="gnb">
    <li class="gnb_cell">
      <!-- gnb_tab : .on or .active 추가하면 활성화 됨.
  계약관리에 .on 일시 breadcrumbs 다른 버전이 보여짐.  -->
      <a href="javascrip:void(0);" class="gnb_tab">고객관리</a>
      <div class="gnb_tab_sub">
        <div class="gnb_tab_sub_wrap">
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">개인고객관리</a></li>
            <li><a href="./resources/pub/html/cs/PCS01010100.html">개인고객 등록</a></li>
            <li><a href="./resources/pub/html/cs/PCS01020100.html">개인고객 조회/변경</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">법인고객관리</a></li>
            <li><a href="./resources/pub/html/cs/PCS02010100.html">법인고객 등록</a></li>
            <li><a href="./resources/pub/html/cs/PCS02020100.html">법인고객 조회/변경</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">캠페인고객관리</a></li>
            <li><a href="./resources/pub/html/cs/PCS03040100.html">캠페인 고객관리</a></li>
            <li><a href="./resources/pub/html/cs/PCS03060100.html">외부DB 캠페인 고객관리</a></li>
            <li><a href="./resources/pub/html/cp/cpg/PCS03090100M.html">캠페인 관리</a></li>
            <li><a href="./resources/pub/html/cp/cpg/PCS03090200M.html">캠페인 배정 고객관리</a></li>
            <li><a href="./resources/pub/html/cp/cpg/PCS03110100M.html">배정 고객관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/cs/PCS04000100.html">개인정보 동의 현황</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/cs/PCS06000100.html">변액적합성진단</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/cs/PCS07000100.html">서면동의 오류 현황</a></li>
          </ul>
        </div>
      </div>
    </li>
    <li class="gnb_cell">
      <a href="javascript:void(0);" class="gnb_tab">가입설계</a>
      <div class="gnb_tab_sub">
        <div class="gnb_tab_sub_wrap">
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/sd/PSD02010300M.html">가입설계</a></li>
            <li><a href="./resources/pub/html/sd/PSD02010200M.html">가입설계</a></li>
            <li><a href="./resources/pub/html/sd/PSD02020100M.html">가입설계 이력조회</a></li>
            <li><a href="./resources/pub/html/sd/PSD08010000M.html">추천플랜관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">청약</a></li>
            <li><a href="./resources/pub/html/sd/PSD07010100M.html">청약조회</a></li>
            <li><a href="./resources/pub/html/sd/PSD07010200.html">스마트청약 진행조회</a></li>
            <li><a href="./resources/pub/html/sd/PSD08020200.html">청약조회철회</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">심사보완 관리</a></li>
            <li><a href="./resources/pub/html/sd/PSD04010100.html">보완건 조회</a></li>
            <li><a href="./resources/pub/html/sd/PSD04040100.html">판매인 문자발송</a></li> 
            <li><a href="./resources/pub/html/sd/PSD04050100.html">부담보 동의서 출력</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">모니터링</a></li>
            <li><a href="./resources/pub/html/sd/PSD07050100.html">완전판매모니터링</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/sd/PSD01000100.html">보장분석</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">청약서류 업로드</a></li>
            <li><a href="./resources/pub/html/ga/PGA04030100.html">GA 청약서류 업로드</a></li>
          </ul>
        </div>
      </div>
    </li>
    <li class="gnb_cell">
      <a href="javascript:void(0);" class="gnb_tab">계약관리</a>
      <div class="gnb_tab_sub">
        <div class="gnb_tab_sub_wrap">
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/cn/PCN01000100.html">계약 조회</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">계약 유지관리</a></li>
            <li><a href="./resources/pub/html/cn/PCN04010100.html">계약 유지관리 현황</a></li>
            <li><a href="./resources/pub/html/cn/PCN04030100.html">입금 현황 조회</a></li>
            <li><a href="./resources/pub/html/cn/PCN04060101.html">수금인 변경</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">계약 부활</a></li>
            <li><a href="./resources/pub/html/cn/PCN05000101.html">부활건 조회/관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">계약 서류 재발송</a></li>
            <li><a href="./resources/pub/html/cn/PCN07010100.html">계약 서류 재발송</a></li>
            <li><a href="./resources/pub/html/cn/PCN07010200M.html">계약 서류 발송/출력 이력</a></li>
          </ul>
        </div>
      </div>
    </li>
    <li class="gnb_cell">
      <a href="javascript:void(0);" class="gnb_tab">활동관리</a>
      <div class="gnb_tab_sub">
        <div class="gnb_tab_sub_wrap">
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/at/PAT01000100.html">활동 입력/조회</a></li>
            <li><a href="./resources/pub/html/at/PAT01010100.html">활동 입력/조회 - GA등록</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/at/PAT02000100.html">실적(신계약/유지율/수금률) 현황</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">월별 수수료 조회</a></li>
            <li><a href="./resources/pub/html/at/PAT03010100.html">개인별 수수료 조회</a></li>
            <li><a href="./resources/pub/html/at/PAT03030100.html">GA 월별 수수료 조회</a></li>
          </ul>
        </div>
      </div>
    </li>
    <li class="gnb_cell">
      <a href="javascript:void(0);" class="gnb_tab">자료실</a>
      <div class="gnb_tab_sub">
        <div class="gnb_tab_sub_wrap">
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/rf/PRF01000100.html">공지사항</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/rf/PRF04000100M.html">GA 문의</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/rf/PRF02000100.html">FAQ 자주묻는 질문</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/rf/PRF03000100.html">활동자료</a></li>
          </ul>
        </div>
      </div>
    </li>
    <li class="gnb_cell">
      <a href="javascript:void(0);" class="gnb_tab">관리자</a>
      <div class="gnb_tab_sub">
        <div class="gnb_tab_sub_wrap">
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">통계</a></li>
            <li><a href="./resources/pub/html/ad/PAD01010100.html">실적 현황</a></li>
            <li><a href="./resources/pub/html/ad/PAD01020100.html">월별 실적 현황</a></li>
            <li><a href="./resources/pub/html/ad/PAD01030100.html">유지율 조회/추이</a></li>
            <li><a href="./resources/pub/html/ad/PAD01040100.html">수금률 조회/추이</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">시스템 관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD03010100.html">로그인 관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD03020100.html">그룹 관리</a></li>
					  <li><a href="./resources/pub/html/ad/PAD03040100.html">앱 버전 관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD03030100.html">메뉴권한 관리</a></li>
					  <li><a href="./resources/pub/html/ad/PAD03050100.html">공통코드 관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/ad/PAD07000100.html">알림 메시지 관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">상품 관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD04000100M.html">상품 서식관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD04000300.html">상품 그룹관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD04010100M.html">특약관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD04020100M.html">상품관계규칙관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">불완전판매율 관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD06010100.html">업계 불완전판매율</a></li>
            <li><a href="./resources/pub/html/ad/PAD06020100.html">설계사 불완전판매율</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/ad/PAD05000100.html">보장분석 관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">교육이력 관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD02010100.html">내부교육관리</a></li>
            <li><a href="./resources/pub/html/ad/PAD02010500.html">필수교육관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">청약 관리</a></li>
            <li><a href="./resources/pub/html/sd/PSD08010100.html">청약 정보 조회(관리자)</a></li>
            <li><a href="./resources/pub/html/sd/PSD08030100.html">청약 철회 관리자</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/at/PAT06000100.html">제증명서 출력</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/ad/PAD07000300.html">징계 관리</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/ad/PAD09010100M.html">수익자동의정보 변경</a></li>
          </ul>
        </div>
      </div>
    </li>
    <li class="gnb_cell">
      <a href="javascript:void(0);" class="gnb_tab">GA관리</a>
      <div class="gnb_tab_sub">
        <div class="gnb_tab_sub_wrap">
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">제휴 관리</a></li>
            <li><a href="./resources/pub/html/ga/PGA01010200.html">GA정보</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">GA 인사 관리</a></li>
            <li><a href="./resources/pub/html/ga/PGA05060100.html">인사 관리</a></li>
            <li><a href="./resources/pub/html/ga/PGA05010100.html">위촉 심사</a></li>
            <li><a href="./resources/pub/html/ga/PGA05070100.html">위촉 신청자 소속 DB업로드</a></li>
            <li><a href="./resources/pub/html/ga/PGA05050100.html">해촉 심사</a></li>
            <li><a href="./resources/pub/html/ga/PGA05080100.html">해촉 대상자 DB업로드</a></li>
            <li><a href="./resources/pub/html/ga/PGA05090100.html">조직 변경 심사</a></li>
            <li><a href="./resources/pub/html/ga/PGA05100100.html">조직 변경 대상자 DB업로드</a></li>
            <li><a href="./resources/pub/html/ga/PGA05120100.html">스텝코드 발급</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">담당제휴 실적현황</a></li>
            <li><a href="./resources/pub/html/ad/PAD01010100.html">실적 현황</a></li> 
            <li><a href="./resources/pub/html/ad/PAD01020100.html">월별 실적 현황</a></li>
            <li><a href="./resources/pub/html/ad/PAD01030100.html">유지율 조회/추이</a></li>
            <li><a href="./resources/pub/html/ad/PAD01040100.html">수금률 조회/추이</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="./resources/pub/html/ga/PADGRMMAGRM.html">GRM 관리</a></li>
          </ul><ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">GA 수수료</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010100M.html">신계약</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010200M.html">계약건별지급수수료</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010300M.html">부활수수료</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010400M.html">환수수수료</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010500M.html">승환계약</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010700M.html">보유계약</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010600M.html">수수료명세서</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010800M.html">특약별</a></li>
            <li><a href="./resources/pub/html/ga/PGA06010900M.html">유지수수료</a></li>
          </ul>
          <ul class="gnb_tab_sub_cell">
            <li><a href="javascript:void(0);" class="url_not">GA 시책</a></li>
            <li><a href="./resources/pub/html/ga/PGA07010100.html">지급</a></li>
            <li><a href="./resources/pub/html/ga/PGA07010200.html">환수</a></li>
            <li><a href="./resources/pub/html/ga/PGA07010300.html">시책명세서</a></li>
            <li><a href="./resources/pub/html/ga/PGA07010400.html">조회 제한 관리</a></li>
            <li><a href="./resources/pub/html/ga/PGA07010500.html">팝업 관리</a></li>
          </ul>
        </div>
      </div>
    </li>
  </ul>
  <!-- 
    0805 삭제요청 수정
    <a href="#" class="btn_all">
    <img src="./resources/pub/images/icons/icon_menu_all.svg" alt="전체메뉴">
  </a> -->
</div>
</nav>


<!-- breadcrumbs (s) -->
<div class="breadcrumbs">
<div class="breadcrumbs_wrap">
  <div class="breadcrumbs_list_wrap"><!--08.11 요청사항 링크삭세-->
    <span class="breadcrumbs_list_cell"><img src="./resources/pt/images/icons/icon_home.svg" alt="홈 바로가기"></span>
    <span class="breadcrumbs_list_cell breadcrumbs_txt"><span>가입설계</span></span>
    <span class="breadcrumbs_list_cell breadcrumbs_txt"><span>법인고객관리</span></span>
  </div>
</div>
<div class="breadcrumbs_fixed">
  <div class="breadcrumbs_fixed_wrap">

    <div class="breadcrumbs_location">
      <a href="#" class="breadcrumbs_home"><img src="./resources/pt/images/icons/icon_home_tablet_white.svg"
          alt="홈 바로가기"></a>
      <div class="breadcrumbs_list" role="button" aria-pressed="false">
        <span>가입설계1</span><i class="icon icon_arrow_up"></i>
        <ul class="breadcrumbs_list_sub">
          <li><a class="breadcrumbs_cell" href="#">가입설계1</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계2</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계3</a></li>
        </ul>
      </div>
      <div class="breadcrumbs_list" role="button" aria-pressed="false">
        <span>가입설계2</span><i class="icon icon_arrow_up"></i>
        <ul class="breadcrumbs_list_sub">
          <li><a class="breadcrumbs_cell" href="#">가입설계1</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계2</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계3</a></li>
        </ul>
      </div>
      <div class="breadcrumbs_list" role="button" aria-pressed="false">
        <span>가입설계3</span><i class="icon icon_arrow_up"></i>
        <ul class="breadcrumbs_list_sub">
          <li><a class="breadcrumbs_cell" href="#">가입설계1</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계2</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계3</a></li>
        </ul>
      </div>
      <div class="breadcrumbs_list" role="button" aria-pressed="false">
        <span>가입설계4</span><i class="icon icon_arrow_up"></i>
        <ul class="breadcrumbs_list_sub">
          <li><a class="breadcrumbs_cell" href="#">가입설계1</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계2</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계3</a></li>
        </ul>
      </div>
      <div class="breadcrumbs_list" role="button" aria-pressed="false">
        <span>가입설계5</span><i class="icon icon_arrow_up"></i>
        <ul class="breadcrumbs_list_sub">
          <li><a class="breadcrumbs_cell" href="#">가입설계1</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계2</a></li>
          <li><a class="breadcrumbs_cell" href="#">가입설계3</a></li>
        </ul>
      </div>
    </div>
    <!-- <a href="#" class="btn_all"><img src="./resources/pt/images/icons/icon_menu_all_white.svg" alt="전체메뉴"></a> --><!--0811 삭제요청-->
  </div>
  <div class="breadcrumbs_fixed_wrap2">
    <div class="breadcrumbs_location">
      <a href="#" class="breadcrumbs_home"><img src="./resources/pt/images/icons/icon_man.svg" alt="User info"><span
          class="userInfo">김하나(<span class="num">800101-2******</span>)</span></a>
      <div class="breadcrumbs_list2">
        <span class="breadcrumbs_list_item num">1234567890</span>
      </div>
      <div class="breadcrumbs_list2">
        <span class="breadcrumbs_list_item"><span class="flag purple">유지</span>(무)걱정말아요 암보험(갱신형)</span>
      </div>
    </div>
    <div class="searchBox">
      <select class="ipt">
        <option selected>계약사항</option>
        <option>계약사항 내용1</option>
        <option>계약사항 내용2</option>
        <option>계약사항 내용3</option>
        <option>계약사항 내용4</option>
      </select>
    </div>
  </div>
</div>
</div>`

var footerHTML =
  `<div class="footer_wrap">
  <ul class="footer_menu">
    <li class="footer_menu_list active"><a href="#" class="footer_menu_list_link">가입설계</a><button class="btn_close">닫기</button></li>
    <li class="footer_menu_list"><a href="#" class="footer_menu_list_link">보안건정보조회1</a><button class="btn_close">닫기</button></li>
    <li class="footer_menu_list"><a href="#" class="footer_menu_list_link">보안건정보조회2</a><button class="btn_close">닫기</button></li>
    <li class="footer_menu_list"><a href="#" class="footer_menu_list_link">보안건정보조회3</a><button class="btn_close">닫기</button></li>
    <li class="footer_menu_list"><a href="#" class="footer_menu_list_link">보안건정보조회4</a><button class="btn_close">닫기</button></li>
  </ul>
</div>`
