var headerHTML =
`<div class="header_top">
  <div class="inner">
    <div class="user_info_wrap">
      <div class="user_name"><a href="#"><span>홍길동 FC</span>님</a></div>
      <div class="user_classification"><span>하나직영본부</span>/<span>하나지점(00)</span></div>
    </div>
    <div class="user_setting">
      <a href="#"><img src="../../images/icons/icon_alert.svg" alt="알림 바로가기"></a>
      <a href="#"><img src="../../images/icons/icon_setting.svg" alt="설정 바로가기"></a>
    </div>
    <a href="#" class="status_login"><span>로그아웃</span></a>
  </div>
</div>
<nav>
  <div class="nav_wrap">
    <a href="#" class="logo_hana">
      <!-- <img src="../../images/logos/logo_hana.svg" alt="하나생명 홈 바로가기"> -->
      <img src="../../images/logos/logo_hana.png"
        srcset="../../images/logos/logo_hana@2x.png 2x,../images/logos/logo_hana@3x.png 3x">
    </a>
    <ul class="gnb">
      <li class="gnb_cell">
        <!-- gnb_tab : .on or .active 추가하면 활성화 됨.
          계약관리에 .on 일시 breadcrumbs 다른 버전이 보여짐.  -->
        <a href="http://www.naver.com" class="gnb_tab">고객관리</a>
        <div class="gnb_tab_sub">
          <div class="gnb_tab_sub_wrap">
            <ul class="gnb_tab_sub_cell">
              <li><a href="http://www.daum.net">개인고객관리</a></li>
              <li><a href="#">개인고객 등록</a></li>
              <li><a href="#">개인고객 조회/변경</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">법인고객관리</a></li>
              <li><a href="#">법인고객 등록</a></li>
              <li><a href="#">법인고객 조회/변경</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">캠패인고객관리</a></li>
              <li><a href="#">(관)캠패인 생성/조회</a></li>
              <li><a href="#">(관)캠패인 회수/유예 승인</a></li>
              <li><a href="#">캠패인 회수/유예 요청</a></li>
              <li><a href="#">캠패인 고객관리</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">개인정보 동의 현황</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">(관)휴대폰번호 변경 승인</a></li>
            </ul>
          </div>
        </div>
      </li>
      <li class="gnb_cell">
        <a href="#" class="gnb_tab">가입설계</a>
        <div class="gnb_tab_sub">
          <div class="gnb_tab_sub_wrap">
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">보장분석</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">가입설계</a></li>
              <li><a href="#">가입설계</a></li>
              <li><a href="#">가입설계 이력조회</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">청약조회</a></li>
              <li><a href="#">전자청약 관리</a></li>
              <li><a href="#">스마트청약 관리</a></li>
              <li><a href="#">사전심사 요청/조회</a></li>
              <li><a href="#">완전판매모니터링</a></li>
              <li><a href="#">초회보험료 입금 조회</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">심사보완 관리</a></li>
              <li><a href="#">보완건 조회</a></li>
              <li><a href="#">미스캔건 조회</a></li>
              <li><a href="#">진단적부 관리</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">(관)전일자 청약 관리</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">(관)청약철회 반송 처리</a></li>
            </ul>
          </div>
        </div>
      </li>
      <li class="gnb_cell">
        <a href="#" class="gnb_tab">계약관리</a>
        <div class="gnb_tab_sub">
          <div class="gnb_tab_sub_wrap">
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">계약 조회</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">변액계약 조회</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">계약 변경</a></li>
              <li><a href="#">감액/특약해지</a></li>
              <li><a href="#">계약 전환</a></li>
              <li><a href="#">계약 변경 진행현황</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">계약 유지관리</a></li>
              <li><a href="#">계약 유지관리 현황</a></li>
              <li><a href="#">(관)계약 유지관리 통계</a></li>
              <li><a href="#">수금자원/미입금 조회</a></li>
              <li><a href="#">고객가상계좌 발급</a></li>
              <li><a href="#">고객가상계좌 발급이력 조회</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">계약 부활</a></li>
              <li><a href="#">부활건 조회/관리</a></li>
              <li><a href="#">부활 진행 현황</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">고객문의/VOC</a></li>
              <li><a href="#">VOC 관리</a></li>
              <li><a href="#">고객문의사항 관리</a></li>
              <li><a href="#">(관)VOC 진행현황</a></li>
              <li><a href="#">(관)VOC 통계</a></li>
              <li><a href="#">(관)고객문의 진행현황</a></li>
            </ul>
          </div>
        </div>
      </li>
      <li class="gnb_cell">
        <a href="#" class="gnb_tab">활동관리</a>
        <div class="gnb_tab_sub">
          <div class="gnb_tab_sub_wrap">
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">활동 입력/조회</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">실적(신계약/유지율/수금률) 현황</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">월별 수수료 조회</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">(관)월별 수수료 조회</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">(관)활동 통계</a></li>
              <li><a href="#">개인별 활동 현황</a></li>
              <li><a href="#">일자별 활동 현황</a></li>
              <li><a href="#">활동/신계약 통계</a></li>
            </ul>
          </div>
        </div>
      </li>
      <li class="gnb_cell">
        <a href="#" class="gnb_tab">자료실</a>
        <div class="gnb_tab_sub">
          <div class="gnb_tab_sub_wrap">
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">공지사항</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">FAQ</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">활동자료</a></li>
              <li><a href="#">서식자료실</a></li>
              <li><a href="#">업무메뉴얼</a></li>
              <li><a href="#">변액자료실</a></li>
              <li><a href="#">상품자료실</a></li>
              <li><a href="#">언더라이팅 자료실</a></li>
            </ul>
          </div>
        </div>
      </li>
      <li class="gnb_cell">
        <a href="#" class="gnb_tab">관리자메뉴</a>
        <div class="gnb_tab_sub">
          <div class="gnb_tab_sub_wrap">
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">통계</a></li>
              <li><a href="#">실적 현황</a></li>
              <li><a href="#">월별 실적 현황</a></li>
              <li><a href="#">유지율 조회/추이</a></li>
              <li><a href="#">수금률 조회/추이</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">교육 관리</a></li>
              <li><a href="#">교육이력관리</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">시스템 관리</a></li>
              <li><a href="#">로그인 관리</a></li>
              <li><a href="#">그룹 관리</a></li>
              <li><a href="#">메뉴권한 관리</a></li>
            </ul>
          </div>
        </div>
      </li>
      <li class="gnb_cell">
        <a href="#" class="gnb_tab">GA관리</a>
        <div class="gnb_tab_sub">
          <div class="gnb_tab_sub_wrap">
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">제휴 관리</a></li>
              <li><a href="#">GA정보</a></li>
              <li><a href="#">지점정보</a></li>
              <li><a href="#">조직현황</a></li>
              <li><a href="#">보증현황</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">담당제휴 지원/관리</a></li>
              <li><a href="#">진단적부 관리</a></li>
              <li><a href="#">심사보완 관리</a></li>
              <li><a href="#">청약진행 관리</a></li>
              <li><a href="#">가입설계 관리</a></li>
              <li><a href="#">VOC 현황</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">담당제휴 실적현황</a></li>
              <li><a href="#">실적 현황</a></li>
              <li><a href="#">월별 실적 현황</a></li>
              <li><a href="#">조직별 실적 현황</a></li>
              <li><a href="#">유지율 조회/추이</a></li>
              <li><a href="#">수금률 조회/추이</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">GA 지원</a></li>
              <li><a href="#">인쇄물 신청</a></li>
              <li><a href="#">인쇄물 관리</a></li>
            </ul>
            <ul class="gnb_tab_sub_cell">
              <li><a href="#">GA 인사 관리(TBD)</a></li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
    <a href="#" class="btn_all">
      <img src="../../images/icons/icon_menu_all.svg" alt="전체메뉴">
    </a>
  </div>
</nav>
<div class="breadcrumbs">
  <div class="breadcrumbs_wrap">
    <div class="breadcrumbs_list_wrap">
      <a href="#" class="breadcrumbs_list_cell"><img src="../../images/icons/icon_home.svg" alt="홈 바로가기"></a>
      <a href="#" class="breadcrumbs_list_cell breadcrumbs_txt"><span>가입설계</span></a>
      <a href="#" class="breadcrumbs_list_cell breadcrumbs_txt"><span>법인고객관리</span></a>
    </div>
  </div>
  <div class="breadcrumbs_fixed">
    <div class="breadcrumbs_fixed_wrap">

      <div class="breadcrumbs_location">
        <a href="#" class="breadcrumbs_home"><img src="../../images/icons/icon_home_tablet_white.svg" alt="홈 바로가기"></a>
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
      <a href="#" class="btn_all"><img src="../../images/icons/icon_menu_all_white.svg" alt="전체메뉴"></a>
    </div>
    <div class="breadcrumbs_fixed_wrap2">
      <div class="breadcrumbs_location">
        <a href="#" class="breadcrumbs_home"><img src="../../images/icons/icon_man.svg" alt="User info"><span class="userInfo">김하나(<pan class="num">800101-2******</pan>)</span></a>
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


