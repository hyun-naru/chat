// Analysys
var jQueryMode 		= true; // jQuery 모드
var pubMode 		= false; // html 모드 (not vue or not jsp )
var winW 			= 0; 	 // Window width
var winH 			= 0; 	 // Window Height
var isMobile		= false; // 모바일
var isIOS			= false; // IOS

//================================================================================ ui function
(function(t){
	var markup = {
			publicFunc : function(){
				analysis.init();
				// markup.htmlTitleMake();
				// markup.ariaInit();
				markup.headerInit();
				// markup.infoListInit();
				// markup.iptTitInit();
				// markup.insuStepInit();
				// markup.infoBoxInit();
				ui.iptFiltInit();
				ui.monthCurrentInit();
				ui.recFundInit();
				ui.rangeInit();
				ui.stepProgressInit();
				ui.infoBoxActiveInit();
				ui.insuRiderListInit();
				ui.scollMove();
				wa.update();
			},
			init : function(){
				markup.scClassInit();
				ui.iptInit();
				ui.tabInit();
				ui.accoInit();
				tip.init();
				ui.accoInit('.icoBtn_open','.infoDetail');
				markup.vueSwiperInit();
				wa.update();
			},
			htmlTitleMake : function(){
				// if( $('.content').length > 0 || $('.iframeWrap').length > 0 ){
				// 	if( $('header h1').length > 0 ){
				// 		$('header h1').text( $('title').text() );
				// 		$('header .icoBtn_appLogo').attr('disabled',true);
				// 	}
				// } else if( $('.bottomSheet header').length > 0 ){
				// 	$('title').text( $('.bottomSheet h1').text() );
				// } else if( $('.popup header').length > 0 ){
				// 	$('.popup header h1').text( $('title').text() );
				// }
				// $('body').addClass( $('.content').data('bodyClass') );
				// if( $('.content.topBg').length > 0 ){
				// 	$('body').addClass('whiteNav');
				// }
			},
			ariaInit : function(){
				$('.popup .icoBtn_close, .bottomSheet .icoBtn_close, .toastPop .icoBtn_close').attr('aria-label','팝업 닫기');
				$('.popup').attr({'role':'dialog', 'aria-modal':'true', 'aria-labelledby':'팝업타이틀이 들어가야 합니다.'});
				$('.bottomSheet .popCont').attr({'role':'dialog', 'aria-modal':'true'});
				$('.toastPop').attr({'role':'dialog'});
				$('.bottomSheet .popCont').attr({'role':'dialog'});
				$('.helpWrap > li').attr('role','presentation');
				$('.icoBtn_acco').attr('aria-expanded', 'false');
				$('.header .icoBtn_appPage').attr('aria-label','이전 페이지');
				$('.header .icoBtn_appMenu').attr('aria-label','전체 메뉴');
				$('.paperList .icoBtn_thum').attr('aria-label','이미지 미리보기');
				$('.icoBtn_appSrch').attr('aria-label','검색');
				$('.paperList .icoBtn_del').attr('aria-label','첨부파일 삭제');
				$('.icoBtn_keypad').attr('aria-label','보안키보드');
				$('.infoBox .icoBtn_del').attr('aria-label','삭제');
				$('.addIpt > .ico_del').attr('aria-label','해당 가족 소유주 입력 필드 삭제');
				$('.addInForm > .icoBtn_del').each(function(){
					var tit = $(this).closest('.addInForm').find('> .tit').text();
					$(this).attr('aria-label', tit + ' 입력폼 전체 삭제');
				})
				$('.cfrItem .infoBox .numbering').attr('aria-hidden', 'true');
				$('.summaryCard .summary').attr({'role':'button','tabindex':0});
				$('.btnAccount').each(function(){
					$(this).attr({'role':'button', 'tabindex':'0', 'aria-label':'계좌선택 팝업 열기 ('+ $(this).text() +' 선택됨)'});
				});
				$('.arwBtnList > li').each(function(){
					$(this).find('> span').attr('aria-hidden', 'true');
					var txt = $(this).find('> span').text()
					$(this).find('.icoBtn_infoPop').attr('aria-label', txt+' 상세내용 안내');
					$(this).find('.icoBtn_arrow').attr('aria-label', txt+' 계약목록 보기');
				})
				$('span').each(function(){
					if( $(this).text() == '→'){
						$(this).attr('aria-label','변경 후');
					}
				});
				$('.icoBtn_pension').attr('aria-label','연금의 유형 및 지급방법 안내 펼치기');
				$('.branchList div.block').attr({'role':'button', 'tabindex':0});
				$('.month.current').attr('aria-hidden',true);
				$('.transHistory .history li').attr({'role':'button', 'tabindex':0});
				$('.transHistory .history li time').each(function(){
					$(this).attr('datetime', $(this).text());
				});
				$('.transHistory h2 time').each(function(){
					$(this).attr('datetime', '2021-'+$(this).text().replaceAll('.','-'));
				})
				$('.toggleSwitch').each(function(){
					if( $(this).find('.on').length > 0 && $(this).find('.off').length > 0 ){
						$(this).find('.on').parent().attr('aria-hidden','true');
					}
				});
				$('.fundList .icoBtn_infoPop').each(function(){
					$(this).attr({'aria-label':$(this).closest('li').find('.tit').text() + ' ' + $(this).closest('li').find('.desc').text() + ' 상세정보'});
				})
				$('.infoBox .tit .icoBtn_sel').attr('aria-label','상품 목록 팝업 보기');
				$('.required').each(function(){
					$(this).attr('aria-label','필수 입력');
					$(this).closest('.itemTh').next().find('.ipt').attr('aria-required','true');
				});

				$('.setupList > li').each(function(){
					if( $(this).find(':input').length == 0 ){
						$(this).attr({'role':'button', 'tabindex':0});
					}
				});

				$('.hasLink, .pushHistory .imgBanner').attr({'role':'button', 'tabindex':0});
				$('.pushHistory h2 time').each(function(){
					if( $(this).text().indexOf('2021') < 0 ){
						$(this).attr('datetime', '2021-08-10 '+$(this).text() );
					} else {
						$(this).attr('datetime', $(this).text().replaceAll('.','-'));
					}
				});

				$('.smStempList .dim ~ *').attr('aria-hidden', true);

				// selectLayer
				$('.bottomSheet.selectLayer .selList').attr({'role':'radiogroup', 'aria-labelledby': $('#selectLayerTit').attr('id')});
				$('.bottomSheet.selectLayer .selList li').attr({'role':'radio', 'aria-checked': false, 'tabindex':'-1'});
				$('.bottomSheet.selectLayer .selList li.on').attr({'role':'radio', 'aria-checked': true, 'tabindex':'0'});
				$('.bottomSheet.selectLayer .selList li.disabled').attr({'role':'radio', 'aria-disabled': true});

				// icoBtn_money
				$('.icoBtn_money').attr('aria-label', '금액입력 키패드 열기');

				/*
				 * 2022-10-20
				 * select가 여러개 있는 경우 같이 초기화되는 문제가 있고
				 * 퍼블리싱에서만 사용하는것으로 보여 주석처리 함
				 *
				// 퍼블리싱에서만 사용
				$('select.ipt option').each(function(idx){
					if( $(this).attr('value') == undefined ){
						$(this).attr('value' , 'value' + idx);
						idx++;
					}
					if( $(this).text() == '선택' ){
						$(this).attr({'selected':'', 'disabled':''});

					}
				});
				*/

			},
			scClassInit : function(){
				$('.accoHead').each(function(){
					$(this).closest('li').addClass('accoItem');
				});
				if( $('.summary').length > 0 ){
					$('.content').addClass('topBg');
				}
			},
			numTxt : ['첫번째','두번째','세번째','네번째','다섯번째','여섯번째','마지막'],
			posTxt : ['앞','가운데','마지막'],
			halfTxt : ['앞','뒤'],
			iptTitInit : function(){
				$('body').append('<div class="dummyTit"></div>');
				$('.ipt[type=text], .ipt[type=date], .ipt[type=month], .ipt[type=email], .ipt[type=tel], .ipt[type=number], select.ipt, textarea.ipt').each(function(){
					if( $(this).closest('.dataTd').prev().is('.itemTh') == true ){
						$('.dummyTit').append( $(this).closest('.dataTd').prev().html() )
						$('.dummyTit > *').remove();
						var label = $('.dummyTit').text().replace(' (선택)','').replace('(선택)','').replace(' *' ,'').replace('*' ,'').replace('(중복선택 가능)','');
						if( $(this).closest('.setPhone').length > 0 ){
							$(this).closest('.setPhone').find('select').attr('title',label + ' 앞번호 선택');
							$(this).closest('.setPhone').find('input:eq(0)').attr('title', label + ' 가운데 번호(3,4자리)');
							$(this).closest('.setPhone').find('input:eq(1)').attr('title', label + ' 뒷번호 4자리');
						} else if( $(this).closest('.setCard').length > 0 ){
							markup.titleMake( $(this).closest('.setCard'), label );
						} else if( $(this).closest('.setNum').length > 0 ){
							markup.titleMake( $(this).closest('.setNum'), label );
						} else if( $(this).closest('.setHalf').length > 0 ){
							markup.titleMake( $(this).closest('.setHalf'), label );
							if( $(this).data('unit') == '호' ){
								$(this).closest('.setHalf').find('input:eq(0)').attr('title', label + ' (동)');
								$(this).closest('.setHalf').find('input:eq(1)').attr('title', label + ' (호)');
							}
							if( label.indexOf('생년') > -1 && label.indexOf('성별') > -1 ){
								$(this).closest('.setHalf').find('input:eq(0)').attr('title', '주민등록번호 앞 생년월일 6자리');
								$(this).closest('.setHalf').find('input:eq(1)').attr('title', '주민등록번호 뒤 첫 1자리');
							}
							if( $(this).closest('.setHalf').find('input[type=date]').length == 2 ){
								$(this).closest('.setHalf').find('input:eq(0)').attr('title', label + ' (시작)');
								$(this).closest('.setHalf').find('input:eq(1)').attr('title', label + ' (종료)');
							} else if( $(this).closest('.setHalf').find('input[type=month]').length == 2 ){
								$(this).closest('.setHalf').find('input:eq(0)').attr('title', label + ' (시작)');
								$(this).closest('.setHalf').find('input:eq(1)').attr('title', label + ' (종료)');
							} else if( $(this).closest('.setHalf').find('input[type=date]').length == 1 && $(this).closest('.setHalf').find('select').length == 1 ){
								$(this).closest('.setHalf').find('input[type=date]').attr('title', label + ' 날짜 선택');
								$(this).closest('.setHalf').find('select').attr('title', label + ' 시간 선택');
							}
						} else if( $(this).closest('.setDriver').length > 0 ){
							$(this).closest('.setDriver').find('select').attr('title','지역 선택');
							markup.titleMake( $(this).closest('.setDriver'), label );
						} else if( $(this).closest('.setCount').length > 0 ){
							var maxLength = $(this).attr('maxlength');
							$(this).attr('title', '인증번호 ' + maxLength +'자리');
						} else if( $(this).closest('.setAddr').length > 0 ){
							$(this).closest('.setAddr').find('input:eq(0)').attr('title', label + ' (기본 주소)');
							$(this).closest('.setAddr').find('input:eq(1)').attr('title', label + ' (상세 주소)');
							if( $(this).closest('.setAddr').prev().is('.setBtnAdd') ){
								$(this).closest('.setAddr').prev().find('input').attr('title', label + ' (우편번호)');
							}
						} else if( $(this).closest('.iptFilt.agency').length > 0 ){
							$(this).attr('title', '알뜰폰 통신사 선택');
						} else if( $(this).attr('type') == 'email' ){
							$(this).attr('title', '이메일');
						} else {
							if( $(this).data('title') == undefined ){
								$(this).attr('title', label);
							} else {
								$(this).attr('title', $(this).data('title') ).removeAttr('data-title');
							}
							if( $(this).attr('placeholder') != undefined ){
								$(this).attr('title', $(this).attr('title') + ' ('+ $(this).attr('placeholder') +')' );
							}
						}
					}
					$('.dummyTit').empty();
				});
				$('.dummyTit').remove();
			},
			titleMake : function( target, label ){
				if( $(target).find('input').length == 3 ){
					var txtArry = markup.posTxt;
				} else if( $(target).find('input').length == 2 ){
					txtArry = markup.halfTxt;
				} else {
					txtArry = markup.numTxt;
				}
				for( var i = 0 ; i < $(target).find('input').length ; ++i ){
					var maxLength = $(target).find('input:eq('+i+')').attr('maxlength');
					$(target).find('input:eq('+i+')').attr('title', label + ' ' + txtArry[i] + ' ' + maxLength +'자리');
				}
			},
			vueSwiperInit : function(){
				$('.swiperWrap').each(function(){
					$(this).addClass('swiper-container');
					$(this).find('.slideList').addClass('swiper-wrapper');
					$(this).find('.slideList > *').addClass('swiper-slide').attr({'v-for':'item in termsList', ':key':'item'});
				});
				$('.swiperWrap').removeClass('swiperWrap');
				$('.slideList').removeClass('slideList');
			},
			headerInit : function(){
				$('body > .header').append('<div class="bg"/>');
				if( $('.iframeWrap').length > 0 ||  $('.progressStep').length > 0 || $('.content .bgGrayArea').length > 0 || $('.content.bgGrayArea').length > 0 ){
					$('body > .header').addClass('def');
				}
			},
			infoBoxInit : function(){
				$('.infoBox').each(function(){
					if( $(this).find('.icoBtn_open').length > 0 ){
						$(this).find('>.inner').addClass('hasAcco');
					}
				});
				$('.infoBox .single label.blind').each(function(){
					var goodsTxt = $(this).closest('.infoBox').find('.inner .tit').text() + ' 선택';
					$(this).text( goodsTxt );
				});
				$('.infoBox button.tit').each(function(){
					if( $(this).find('span').length == 0 ){
						$(this).wrapInner('<span/>');
					}
				});
			},
			infoListInit : function(){
				$('.infoList .infoList').each(function(){
					$(this).closest('li').addClass('flex');
				});
				$('.infoDetail .item').each(function(){
					if( $(this).text().indexOf('①') > -1 ){
						if( $(this).closest('.accoBody').length == 0 ){
							$(this).closest('li').addClass('line');
						}
					}
				})
			},
			insuStepInit : function(){
				for( var i = 0 ; i < $('.insuStep li').length ; ++i ){
					var appendHTML = '진행중';
					if( i == $('.insuStep li').length -1 ){
						appendHTML = '<span class="blind">완료일</span> 21.07.23';
					}
					$('.insuStep li:eq('+i+')').append('<span class="msgTip">'+appendHTML+'</span>');
				}
			},
			conHeightChk : function(target){
				$(target).removeClass('short');

				if( $(target).outerHeight() < $(window).height() ){
					$(target).addClass('short');
				}
			},
			remove : function(){
				// remove attributes
				$('*').removeClass('uiAct notDel');
				// remove event
				/*$('.icoBtn_tip').unbind('click mouseenter mouseleave');
				$('.tabWrap > .tabList > li').unbind('click');*/
				$('body *').unbind('click mouseenter mouseleave');
			}
	}
	var layout = {
			state : false, // layout init 실행 상태
			// Layout 준비
			ready : function(){
				if( jQueryMode == false ){// script 없는 버전
					markup.publicFunc();
					markup.init();
				} else {// script 사용 버전
					markup.publicFunc();
					layout.init();
					ui.moneyKeypadInit();
				}
				markup.conHeightChk('.content');
				markup.conHeightChk('.popup');
				if( jQueryMode == false ){
					markup.remove();
				}
			},
			// ready 완료시 실행
			init : function(){
				if( layout.state == false ){
					layout.state = true;
					winW = $(window).width();
					winH = $(window).height();
					$('body > section.content').attr('id','content');
					layout.gnbInit();
					layout.quickInit();
					ui.init();
					gnb.headerOpacityCtrl( $(window).scrollTop() );
					$(window).scroll(function(e){
						layout.scrollMoved();
					});
					/*$('body').on('click', '.dateBtn', function(e){
						if( !$(e.target).hasClass('month') ){
							lp.open('/html_m/_guide_/datepicker.html');
							console.log(e.target);
						} else {
							lp.open('/html_m/_guide_/monthpicker.html');
							console.log(e.target);
						}
					})*/
				}
			},
			// resizeEvent
			resizeEvent : function(){
				winW = $(window).width();
				$(window).resize(function(){
					if( $('.isDevice').length == 0 ){
						resizeFunc();
					} else {
						if( winW != $(window).width() ){
							winW = $(window).width();
							resizeFunc();
						}
					}
					$('.testCurrent2').text( $('html').attr('style') );
				})
				function resizeFunc(){
					var vh = window.innerHeight * 0.01;
					document.documentElement.style.setProperty('--vh',vh+'px');
				}
				resizeFunc();
			},
			loadingInit : function(_txt, _target){
				var txt = _txt;
				if( _target != '' && _target != undefined ){
					var target = _target;
				} else {
					var target = 'body';
				}
				if( $('.loadingWrap').length == 0 ){
					$(target).append('<div class="loadingWrap short"><div class="loading" role="img" aria-label="로딩중"><div class="symbol"></div></div></div>');
				}
				if( _txt != '' && _txt != undefined ){
					var resultTxt = '<p class="txt">'+txt+'</p>';
					$('.loadingWrap .loading').after(resultTxt).removeAttr('aria-label role');
				}
			},
			loadingRemove:function(){
				console.log('loadingRemove');
				$('.loadingWrap').remove();
			},
			// scroll시에 종합적으로 일어나는 이벤트
			lastY : 0,
			scrollMoved : function(){
				//layout.lastY = e.currentTarget.scrollY;
				var popLength = $('div.popWrap.nowOpen').length;
				if (popLength < 1) {
					layout.lastY = $(window).scrollTop();
					gnb.headerOpacityCtrl( layout.lastY );
				}
				if( $('.transHistory').length > 0 ){
					ui.historyMonthMove();
				}
				if( $('.whiteNav').length > 0 || $('.header .logo').length > 0  ){
					gnb.addGnbSticky();
				}
				if( $('.sitemapOpen').length > 0 ){
					gnb.sitemapActive();
				}
				$('.barAni').each(function(){
					if( layout.lastY + winH > $(this).offset().top + 100 ){
						if( $(this).is(':visible') ){
							$(this).addClass('aniOn');
						}
					}
				});
				if( $('.scrollFixCtrl').length > 0 ){
					$('.scrollFixCtrl').addClass('off');
					clearTimeout(layout.scrollFixInterval);
					layout.scrollFixInterval = setTimeout(function(){$('.scrollFixCtrl').removeClass('off');},300)
				}
				if( $(window).scrollTop() > 100 ){
					$('.quick').addClass('active');
					if( $('.icoBtn_chatbot.done').length == 0 ){
						setTimeout(function(){
							$('.icoBtn_chatbot').addClass('on');
						},500);
						setTimeout(function(){
							$('.icoBtn_chatbot').removeClass('on');
						},4000);
						$('.icoBtn_chatbot').addClass('done');
					}
				} else {
					$('.quick').removeClass('active');
					$('.icoBtn_chatbot').removeClass('on');
				}
				ui.aniInit();
			},
			popScrollMoved : function(){

			},
			scrollFixInterval : new Object(),

			gnbGlobalScroll : 0,
			gnbInit: function(){
				$('.mGnb').addClass('uiAct');
				for(var  i = 0 ; i < $('.mGnb .menu li').length ; ++i ){
					if( $('.mGnb .menu li:eq('+ i +') > div').length == 0 && $('.mGnb .menu li:eq('+ i +') > [class*=depth]').length == 0 ){
						$('.mGnb .menu li:eq('+ i +')').addClass('isLink');
					}
				}
				$('.mGnb .menu > li > a').on({
					'click': function(e){
						if($(this).parent().hasClass('isLink') == false){
							e.preventDefault();
							if( $(this).parent().hasClass('on') == false ){
								$('.mGnb .menu > li.on').removeClass('on');
								$(this).parent().addClass('on');
								$('.mGnb li.on .subArea').scrollTop(0);
							}
						}
					}
				});
				/*$('.mGnb .depth2 > li > a').bind({
					'click': function(e){
						if($(this).parent().hasClass('isLink') == false){
							e.preventDefault();
							if( $(this).parent().hasClass('on') == false ){
								$(this).parent().addClass('on');
								$(this).next().stop().slideDown(200);
							} else {
								$(this).parent().removeClass('on');
								$(this).next().stop().slideUp(200);
							}
						}
					}
				});*/
				$('.header .icoBtn_appMenu').bind({
					'click': function(e){
						layout.gnbGlobalScroll = $(window).scrollTop();
						$('.dimmed').fadeIn();
						$('.mGnb').addClass('ing');
						$('.mGnb').css( 'top', layout.gnbGlobalScroll );
						$('.mGnb').show();
						setTimeout(function(){
							$('.mGnb').addClass('on');
						},10);
						setTimeout(function(){
							$('html, body').addClass('off');
							$('.mGnb').removeClass('ing');
							$('.mGnb').css( 'top', 0 );
							$('.mGnb').attr("tabindex", -1).focus();
						},500);
					}
				});
				$('.mGnb .icoBtn_appClose').bind({
					'click': function(e){
						$('html, body').removeClass('off');
						$('.mGnb').addClass('out');
						$('.mGnb').addClass('ing');
						$(window).scrollTop(layout.gnbGlobalScroll);
						$('.mGnb').css( 'top', layout.gnbGlobalScroll );
						setTimeout(function(){
							$('.mGnb li.on .subArea').scrollTop(0);
							$('.mGnb').hide();
							$('.mGnb').removeClass('ing');
							$('.mGnb').removeClass('out');
							$('.mGnb').removeClass('on');
						},500);
						$('.dimmed').fadeOut();
					}
				});
			},
			quickInit : function(){
				$('.icoBtn_goTop').bind({
					'click':function(){
						if( $('.parallax').length == 0 ){
							$(analysis.getBody()).animate({scrollTop: 0},300);
						} else {
							$('.pxNavi li:eq(0) a').trigger('click');
						}
						$('#skipNavi').attr('tabindex', '-1').focus();
					}
				});

				if( $('.btnArea.sticky').length > 0 && $('.btnArea.sticky').is(':visible') == true ){
					$('body').addClass('hasSticky');
				}
				$('.quickList > li').each(function(idx){
					$(this).css('transition','all 0.25s '+ Number(0.07*idx) + 's')
					idx++;
				});

				$('.quick :input').bind({
					'focusin' : function(){
						if( $(this).closest('.active').length == 0 ){
							$('.quick').addClass('active');
						}
					}
				});

			}
	}
	var gnb = {
			stickyState : null, // GNB Sticky State
			contentTopPos : 0, // content top offset
			targetHeader : 25, // target header height
			headerOpacityCtrl : function(lastY){
				var per = lastY*0.023;
				if(per > 1){
					per = 1;
				}
				$('.header .bg').css('opacity', per );
				if(per == 0){
					$('.header').removeClass('scrolled');
					$('.header h1').find('img').attr('src', '/resources/mo/images/mobile/common/ico_header_symbol.svg');
				} else {
					$('.header').addClass('scrolled');
					$('.header h1').find('img').attr('src', '/resources/mo/images/mobile/common/ico_header_symbol_default.svg');
				}
			},
			addGnbSticky : function(){
				if ($(window).scrollTop() >= gnb.targetHeader){
					var nowSticky = true;
					if( nowSticky != gnb.stickyState )gnb.stickyState = true; gnb.stickyCtrl(true);
				} else {
					nowSticky = false;
					if( nowSticky != gnb.stickyState )gnb.stickyState = false; gnb.stickyCtrl(false);
				}
			},
			stickyCtrl : function(sticky){
				if( sticky == true ){
					$('.header').addClass('sticky');
				//sticky release
				} else {
					$('.header').removeClass('sticky');
				}
			},
			lastScrollPos : 0,
			sitemapOpen : function(url){
				if( $('.sitemapArea').length == 0 ){
					$('body').append('<div class="sitemapArea"></div>');
				}
				$('.sitemapArea').load(url + ' .sitemapArea > *',function(){// sitemap 로드
					gnb.sitemapLoadComplete();
				});

			},
			sitemapLoadComplete : function(){
				/* DAY2 Script (s) */
				$('.sitemapHead').after( $('.sitemapHead .tabWrap').clone() );
				$('.sitemapHead ~ .tabWrap').addClass('visibleMb')
				$('.sitemapHead .tabWrap').addClass('hiddenMb');
				if( $('.sitemapArea .time').is(':visible') == false ){
					$('.sitemapArea').addClass('loginF')
				}
				/* DAY2 Script (e) */
				console.log( "$('.sitemapHead').length : " + $('.sitemapHead .tabList li').length );
				$('.icoBtn_appMenu').attr('aria-label', '전체메뉴 닫기');
				$('body').addClass('sitemapOpen');
				gnb.lastScrollPos = $(window).scrollTop();
				$(window).scrollTop(0);
				$('.sitemapArea .tabWrap').addClass('tabScroll');
				$('.sitemapArea .tabList').addClass('uiAct auto');
				$('.sitemapArea .tabList li').each(function(){
					if( $(this).find('.scriptCell').length == 0 ){
					 $(this).wrapInner('<span class="scriptCell"/>');
					}
				});
				$('.sitemapArea .tabList > li:eq(0)').addClass('on');
				$('.sitemapArea .icoBtn_close').bind({
					'click' : function(){
						gnb.sitemapClose();
					}
				});
				$('.sitemapArea .tabList > li > *').bind({
					'click' : function(e){
						e.preventDefault();
						var idx = $(this).parent().index();
						gnb.sitemapMove( idx );
						setTimeout(function(){
							$('.sitemapBody .menu > li:eq('+idx+') > h2 > a').focus();
						},300);
					}
				});
				setTimeout(function(){
					$('.sitemapHead .titH1').attr('tabindex','-1').focus();
				},500);
			},
			sitemapClose : function(){
				$('body').removeClass('sitemapOpen');
				$('.sitemapArea').remove();
				$(window).scrollTop( gnb.lastScrollPos );
				ui.init();
				$('.header .icoBtn_appMenu').focus();
			},
			sitemapActive : function(){
				for( var i = $('.sitemapBody .menu > li').length-1 ; i >=0 ; --i ){
					var yPos = $( window ).scrollTop() + 307;
					var activePoint = 140; // 상단 고정영역 높이값
					var bottomPoint = 255;
					if( $('body.digital').length == 0 ){
						if( $('.loginF').length > 0 ){
							activePoint = 116;
							bottomPoint = 231;
						}
					} else {
						activePoint = 98;
						bottomPoint = 247;
					}
					// Mobile Sticky
					if( $('.sitemapBody .menu > li:eq('+i+')').offset().top < $( window ).scrollTop() + bottomPoint ){
						$('.sitemapBody .menu > li:eq('+i+')').prev().addClass('bottom');
					} else {
						$('.sitemapBody .menu > li:eq('+i+')').prev().removeClass('bottom');
					}
					if( $('.sitemapBody .menu > li:eq('+i+')').offset().top < $( window ).scrollTop() + activePoint ){
						console.log('idx : ' + i);
						$('.sitemapBody .menu > li:eq('+i+')').addClass('active');
					} else {
						$('.sitemapBody .menu > li:eq('+i+')').removeClass('active');
					}
					//$('.sitemapBody .menu > li').removeClass('active');
					if( $('.sitemapBody .menu > li:eq('+i+')').offset().top < yPos ){
						gnbActiveChange( i );
						break;
					}
				}
				if( $( window ).scrollTop() == 0 ){
					gnbActiveChange(0);
				}
				if( $(window).scrollTop() + $(window).height() == $(document).height() ){
					gnbActiveChange( $('.sitemapBody .menu > li').length - 1 );
				}
				function gnbActiveChange(idx){
					if( $('.sitemapArea .tabList > li.on').index() != idx ){
						$('.sitemapArea .tabList > li.on').removeClass('on');
						$('.sitemapArea .tabList > li:eq('+idx+')').addClass('on');
						// TAB 중심 맞추기
						var target = $('.sitemapArea .tabWrap ');
						if( $( target ).find(' li.on').length > 0 ){
							//var posCenter = ( $( target ).scrollLeft() + $( target ).find(' > li.on').offset().left + $( target ).find(' > li.on').outerWidth() * 0.5) - ($(window).width() * 0.5);
							var posCenter = $( target ).scrollLeft() + $( target ).find(' li.on').offset().left;
							$( target ).stop().animate({scrollLeft: posCenter},300);
						}
					}
				}
				function gnbTitCtrl(idx){

				}
			},
			sitemapMove : function(idx){
				var pos = 130;
				if( $('.loginF').length > 0 ){
					pos = 97;
				}
				var posY = $('.sitemapBody .menu > li:eq('+idx+')').offset().top - pos;
				$( analysis.getBody() ).stop().animate({scrollTop: posY},300);

			}
			/*,
			sitemapSrchOpen : function(){
				if( $('.sitemapArea').hasClass('srch') == false ){
					$('.sitemapArea').addClass('srch');
				} else {
					$('.sitemapArea').removeClass('srch');
				}
			}*/
	}
	var ui = {
			init : function(){
				ui.iptInit();
				ui.rangeInit();
				ui.tabInit();
				ui.accoInit();
				ui.accoInit('.icoBtn_open','.infoDetail');
				ui.summaryListInit();
				ui.swiperInit();
				ui.iptFiltAgencyInit();
				ui.monthCurrentInit();
				ui.icoBtnPensionInit();
				ui.imgMoreInit();
				tip.init();
				console.log("ui init");
				ui.aniInit();
				ui.aniMake();
				ui.chatInit();
				ui.btnAreaInit();
				if( $('.barAni').length > 0 ){
					setTimeout(function(){layout.scrollMoved();},100);
				}
			},
			calendarOpen: function(target){
				var iptDate = $(target);//date 설정 input(this) [$(target): button]
				var iptDateBox = $(target).parent().parent('.setHalf');//inputRange
				var iptDateFirst = iptDateBox.find('div:first').find('input');//inputRange satar input
				var iptDateLast = iptDateBox.find('div:last').find('input');//inputRange end input
				var dateObj = new Date();
				var maxFlag = '';//미래날짜가 나오지 않게 하는 플래그, 필요한 페이지에서만 0으로 셋팅
				if(window.location.pathname.indexOf('/sb/mo/view.do') > -1){//청약화면이고
					if(sbComm && sbComm.prsSte == 3){//단계가 3단계 CDD화면
						maxFlag = 0;
					}
				}

				$.datepicker.setDefaults({//datepicker 기본 설정
					dateFormat: 'yy.mm.dd',
					defaultDate: '0w',
					showMonthAfterYear: true,
                    dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
                    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
					monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
					/**
					  *아래 주석시 셀렉트비활성화
					**/
					changeYear: true,
					changeMonth: true,
					maxDate:maxFlag,
					yearRange:Number(dateObj.getFullYear())-100+':'+dateObj.getFullYear()//결함 수정조치, 일단 금년부터 -100년치 설정
				});

				if( $(iptDate).prop('disabled') == false && $(iptDate).prop('readonly') == false ){
					if(!iptDateBox.length == 1){//inputRange 확인
						iptDate.datepicker();
						iptDate.focus();
					} else {
						var dateFormat = 'yy.mm.dd',
						firstDay = iptDateFirst.datepicker().on('change', function(){//시작 input 선택 date에 따른 마지막 input start date 설정
							lastDay.datepicker('option', 'minDate', getDate(this));
						}),
						lastDay = iptDateLast.datepicker().on('change', function(){//마지막 input 선택 date에 따른 시작 input end date 제어
							firstDay.datepicker('option', 'maxDate', getDate(this));
						});
						function getDate( element ) {//input 선택값 저장
							var date;
							try {
								date = $.datepicker.parseDate( dateFormat, element.value );
							} catch ( error ){
								date = null;
							}
							return date;
						}
						iptDate.focus();
					}

				}
			},
			monthOpen: function(target){
				var iptDate = $(target);//date 설정 input(this) [$(target): button]
				var iptDateBox = $(target).parent().parent('.setHalf');//inputRange
				var iptDateFirst = iptDateBox.find('div:first').find('input');//inputRange satar input
				var iptDateLast = iptDateBox.find('div:last').find('input');//inputRange end input
				$.monthpicker.setDefaults({//datepicker 기본 설정
					dateFormat: 'yy.mm',
					defaultDate: '0w',
					changeYear: false,
					monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
					/**
					  *아래 주석시 셀렉트비활성화
					**/
					changeYear: true,
				});
				if( $(iptDate).prop('disabled') == false && $(iptDate).prop('readonly') == false ){
					if(!iptDateBox.length == 1){//inputRange 확인
						iptDate.monthpicker();
						iptDate.focus();
					} else {
						var dateFormat = 'yy.mm',
						firstMonth = iptDateFirst.monthpicker().on('change', function(){//시작 input 선택 date에 따른 마지막 input start date 설정
							lastMonth.monthpicker('option', 'minDate', getMonth(this));
						}),
						lastMonth = iptDateLast.monthpicker().on('change', function(){//마지막 input 선택 date에 따른 시작 input end date 제어
							firstMonth.monthpicker('option', 'maxDate', getMonth(this));
						});
						function getMonth( element ) {//input 선택값 저장
							var date;
							try {
								date = $.monthpicker.parseDate( dateFormat, element.value );
							} catch ( error ){
								date = null;
							}
							return date;
						}
						iptDate.focus();
					}
				}
			},
			// input init
			iptInit : function(){
				$('.ipt:checkbox, .ipt:radio, select.ipt, textarea.ipt, .ipt[type=password], .ipt[type=email], .ipt[type=file], .asSlt.ipt, .setPhone .ipt[type=tel], .setCard .ipt[type=tel], .srchBar .ipt, .keypad.letter1 .ipt, .setCard input.ipt, .setDriver input.ipt, .setNum input.ipt').addClass('notDel');
				$('.icoBtn_keypad').each(function(){
					$(this).attr({'tabindex':-1,'aria-hidden':true});
					if( $(this).prev().is('.ipt') ){
						 $(this).prev().addClass('notDel');
					}
				});
				$('.keypad').each(function(){
					$(this).find('.ipt[type=password]').each(function(){
						if( $(this).attr('maxlength') != undefined ){
							$(this).closest('.keypad').addClass( 'letter'+$(this).attr('maxlength') );
						}
					});
				});
				$('.setCard.security').each(function(){
					if( $(this).hasClass('uiAct') == false ){
						$(this).addClass('uiAct');
						$(this).find('.ipt').bind({
							'focusin':function(){
								$(this).closest('.setCard.security').addClass('on');
							},
							'focusout':function(){
								$(this).closest('.setCard.security').removeClass('on');
							}
						})
					}
				});
				for(var i = 0; i < $('.ipt').length ; ++i ){
					if( $('.ipt').eq(i).hasClass('uiAct') == false ){
						$('.ipt').eq(i).addClass('uiAct');
						// Delete
						if( $('.ipt').eq(i).hasClass('notDel') == false ){
							ui.iptDelInit( $('.ipt').eq(i) );
						}
						// select
						if( $('.ipt').eq(i).is('select') ){
							ui.selectIptInit( $('.ipt').eq(i) );
						}
						// date
						if( $('.ipt').eq(i).attr('type') == 'date' || $('.ipt').eq(i).attr('type') == 'month' ){
							var classes = 'dateBtn';
							if( $('.ipt').eq(i).attr('type') == 'month' ){
								classes += ' month';
							}
							$('.ipt').eq(i).attr('type', 'text');
							//$('.ipt').eq(i).after('<button type="button" class="'+classes+'"><span class="blind">달력팝업 열기</span></button>');
						}
					}
					// Unit
					if( $('.ipt').eq(i).data('unit') != undefined ){
						ui.iptUnitInit( $('.ipt').eq(i) );
					}
					// setBtnAdd
					//ui.setBtnAddInit();
				}
				if( jQueryMode == true ){
					$('.isIE .fileWrap input').bind({
						'click':function(){
							$(this).prev('input').trigger('click');
						}
					});
					// E-mail auto Complete
					ui.emailInit();
				}
			},
			// ipt Delete init
			iptDelInit : function( target ){
				var delTxt = '해당 필드 입력값 삭제';
				if( $(target).parent().hasClass('iptWrap') == false ){
					$(target).wrap('<div class="iptWrap">');
					$(target).after('<button class="icoBtn_del" aria-label="'+delTxt+'"></button>');
					var wid = $(target).attr('class').replace('uiAct','').replace('ipt','');
					$(target).parent().addClass( wid );
					var delBtn = $(target).parent().find('.icoBtn_del');
					$(delBtn).attr('tabindex',-1);
				}
				if( $(target).hasClass('date') ){
					if( $(target).hasClass('dateMonth') ){
						$(target).attr('onfocus', 'this.blur()').on('click',function(){
							ui.monthOpen(this);
							$('#ui-monthpicker-div').css({
								position: 'fixed',
								top: 'auto',
								right: 0,
								bottom: 0,
								left: 0,
								width: '100%'
							});
						});
					} else {
						$(target).attr('onfocus', 'this.blur()').on('click',function(){
							ui.calendarOpen(this);
							$('#ui-datepicker-div').css({
								position: 'fixed',
								top: 'auto',
								right: 0,
								bottom: 0,
								left: 0,
								width: '100%'
							});
						});
					}
				}
				if( jQueryMode == true ){
					$(delBtn).bind({
						'mousedown':function(e){
							e.preventDefault();
							$(this).closest('.iptWrap').find('.ipt').val("").focus();
							$(this).parent().removeClass("on");
						},
						'focusout':function(){
							$(this).parent().removeClass("on");
						}
					});
					if( $(target).data('unit') != '만원' ){
						$(target).bind({
							'change paste keydown keyup':function(e){
								if( $(this).val() != "" ){
									$(this).parent().addClass("on");
								} else {
									$(this).parent().removeClass("on");
								}

							},
							'focusin':function(){
								if( $(this).val() != "" ){
									var target = $(this);
									setTimeout(function(){target.parent().addClass("on");},10);
								}
							},
							'focusout':function(){
								setTimeout(function(){
									var elem = $('*:focus');
									if( $( elem ).hasClass('icoBtn_del') == false ){
										$(this).parent().removeClass("on");
									}
									if( $( elem ).attr('class') != 'icoBtn_del' ){
										$('.iptWrap').removeClass('on');
									}
								},10);
							}
						});
					}
				}
			},
			// input has unit case
			iptUnitInit : function( target ){
				$(target).addClass('unit');
				if( $(target).closest('.iptWrap').find('span.unit').length == 0 ){
					var txt = $(target).data('unit');
					$(target).closest('.iptWrap').append('<span class="unit">'+txt+'</span>');
				}
				if($(target).hasClass('front')){
					var type = 'padding-left';
				} else {
					type = 'padding-right';
				}
				var pdR = $(target).closest('.iptWrap').find('span.unit').outerWidth() + 3; /* 24 HL3 SFA  간혹 value를 del btn이 덮는 현상이 발생해서 좀더 여유롭게(+3) padding 잡아줌. */
				if( pdR > 20 ){
					$(target).css(type, pdR);
				}
			},
			// email
			emailInit : function (){
				$('.ipt[type=email]').each(function(){
					$(this).addClass('uiAct');
					if( $(this).is(':visible') ){
						if( $(this).hasClass('mailtipAct') == false ){
							$(this).addClass('mailtipAct');
							$(this).mailtip({
								onselected: function (mail){}
							});
							if( $(this).closest('.popCont').length > 0 ){
								$(this).bind({
									'focusin':function(){
										$('.nowOpen .popCont, .nowOpen .scroll:not(.on)').addClass('overV');
									},
									'focusout':function(){
										$('.nowOpen .popCont, .nowOpen .scroll').removeClass('overV');
									}
								})
							}
						}
					}
				});
			},
			focusSelect : new Object(),
			selectIptInit : function(target){
				$(target).attr({'tabindex':'-1', 'aria-hidden':'true'}).wrap('<div class="selectWrap" />');
				$(target).closest('.selectWrap').append('<button type="button" class="selectBtn" aria-label="'+ $(target).attr('title') +'"></button>');

				if($(target).attr('readonly') == 'readonly') {
					$(target).removeAttr('readonly').addClass('readonly');
					$(target).closest('.selectWrap').find(' > .selectBtn').attr('disabled','disabled');
				}

				$(target).closest('.selectWrap').find(' > .selectBtn').bind({
					'click' : function(e){
						ui.focusSelect = $(e.target).closest('.selectWrap').find(' > select.ipt');
						if( $( ui.focusSelect ).attr('aria-disabled') != true && $( ui.focusSelect ).prop('disabled') == false ){
							ui.selectLayerMake( ui.focusSelect );
						}
					}
				});
			},
			iptFiltInit : function(){
				for( var i = 0 ; i < $('.iptFilt.glue[class*=div_]').length ; ++i ){
					if( $('.iptFilt.glue[class*=div_]:eq('+i+')').hasClass('uiAct') == false || $('.iptFilt.glue[class*=div_]:eq('+i+')').hasClass('logo') == true ){
						console.log("iptFilt 실행");
						$('.iptFilt.glue[class*=div_]:eq('+i+')').addClass('uiAct');
						var iptFilt = $('.iptFilt.glue[class*=div_]:eq('+i+')');
						if( iptFilt.hasClass('div_2') ){
							var divNum = 2;
						} else if( iptFilt.hasClass('div_3') ){
							divNum = 3;
						} else if( iptFilt.hasClass('div_4') ){
							divNum = 4;
						}

						if( $(iptFilt).find( ' > li').length == 2 ){
							iptFilt.removeClass('div_3 div_4').addClass('div_2');
							divNum = 2;
						}

						var brtlTarget = $(iptFilt).find( ' > li:eq(0)');
						var brtrTarget = $(iptFilt).find( ' > li:eq('+ (divNum-1) +')' );
						var brblTarget;
						var brbrTarget = $(iptFilt).find( ' > li:last-child' );
						var brblNum;
						var total = $(iptFilt).find('li').length;
						if( total%divNum == 0 ){
							brblNum = total-divNum;
						} else {
							brblNum = parseInt(total/divNum)*divNum;
						}

						brblTarget = $(iptFilt).find( ' > li:eq('+brblNum+')' );

						if( total%divNum == 1 && $(iptFilt).find( '> li.merge'+divNum).length == 0 ){
							brtrTarget = $(iptFilt).find( '> li:eq(0)');
							brblTarget = $(iptFilt).find( '> li:nth-child('+Number(total-divNum+1)+')');
							$(iptFilt).find( '> li:eq(0)').addClass('merge'+divNum);
						}

						console.log( "total%divNum  : " + total%divNum )

						brtlTarget.addClass('brtl');
						brtrTarget.addClass('brtr');
						brblTarget.addClass('brbl');
						brbrTarget.addClass('brbr');
					}
				}
			},
			selectLayerMake : function( target ){
				var selectBottom = '<section class="bottomSheet selectLayer"><div class="popCont"><header><h1 id="selectLayerTit">'+ $(target).attr('title') +'</h1></header><div class="popBody"><ul class="selList"></ul></div><button type="button" class="icoBtn_close"></button></div></section>';
				$('body').append( selectBottom );
				if( $(target).closest('.alertPop.nowOpen').length > 0 ) {
					$('.bottomSheet.selectLayer').css('zIndex', $(target).closest('.alertPop.nowOpen').css('zIndex') + 1 );
				}
				var selectIdx = $(target).find('option').index( $(target).find(' option:selected' ) );
				$(target).find('option').each(function(idx){
					if( $(this).prop('disabled') == false ){
						$('.bottomSheet.selectLayer .selList').append('<li data-value="'+$(this).attr('value')+'" >'+ $(this).text() +'</li>');
					} else {
						$('.bottomSheet.selectLayer .selList').append('<li class="disabled" data-value="'+$(this).attr('value')+'" >'+ $(this).text() +'</li>');
					}
					if( idx == selectIdx ){
						$('.bottomSheet.selectLayer .selList > li:eq('+idx+')').addClass('on')
					}
					idx++;
				});

				$('.bottomSheet.selectLayer .selList > li').bind({
					'click' : function(e){
						console.log("$(e.target).data('value') : " + $(e.target).data('value') );
						//if( $(e.target).hasClass('disabled') == false ){
							$( ui.focusSelect ).val( $(e.target).data('value') ).trigger('change');
							if( $( ui.focusSelect ).closest('.iptFilt.agency').length > 0 ){
								$( ui.focusSelect ).closest('.selectWrap').addClass('on');
								$( ui.focusSelect ).closest('.iptFilt.agency').find('input[type=radio]').prop('checked', false);
							}
							ui.selectLayerRemove();
						//}
					},
					'keydown' : function(e){
						if( e.keyCode >= '37' && e.keyCode <= '40' ){
							var target = $('.bottomSheet.selectLayer.open .selList > li.on');
							if( $('.bottomSheet.selectLayer.open li.on').length == 0 ){
								target = $('.bottomSheet.selectLayer.open .selList > li:eq(0)');
							}
							if( e.keyCode == "39" || e.keyCode == "40" ){
								var nextTarget = $(target).next();
								if( $(nextTarget).closest('.selList').length == 0 ){
									nextTarget = $('.bottomSheet.selectLayer.open .selList > li:not(.disabled):eq(0)');
								}
							} else if( e.keyCode == "37" || e.keyCode == "38" ){
								nextTarget = $(target).prev();
								if( $(nextTarget).closest('.selList').length == 0 ){
									nextTarget = $('.bottomSheet.selectLayer.open .selList > li:not(.disabled):last-child');
								}
								if( $(nextTarget).hasClass('disabled')){
									nextTarget = $('.bottomSheet.selectLayer.open .selList > li:not(.disabled):last-child');
								}
							}
							console.log( $(nextTarget).text() );
							$(target).attr({'tabindex':'-1','aria-checked':false}).removeClass('on');
							$(nextTarget).attr({'tabindex':'0','aria-checked':true}).addClass('on').focus();
						}
						if(e.keyCode == 13){
							$(e.target).trigger('click');
						}
					}
				});
				$('.bottomSheet.selectLayer .icoBtn_close').bind({
					'click' : function(){
						ui.selectLayerRemove();
					}
				});
				$('body').addClass('popOn');
				$('body section.content').attr({'aria-hidden':true});
				setTimeout(function(){
					$('.bottomSheet.selectLayer').addClass('open');
					$('.bottomSheet.selectLayer #selectLayerTit').attr('tabindex',-1).focus();
				},10)
				markup.ariaInit();
			},
			selectLayerRemove : function(){
				$('.bottomSheet.selectLayer').addClass('close');
				setTimeout(function(){
					$('.bottomSheet.selectLayer').remove();
					$('body').removeClass('popOn');
					$('body .content').removeAttr('aria-hidden');
					$(ui.focusSelect).focus();
				}, 300)
			},
			// moneyKeypad
			moneyKeypadInit : function(){
				$('.icoBtn_money').bind({
					'click': function(){
						ui.moneyKeypadMake();
					}
				});
			},
			moneyKeypadMake : function(){
				$('body').addClass('popOn');
				$('body .content').attr('aria-hidden',true);
				$('body').append('<section class="bottomSheet moneyKeypad"></section>');
				$('.bottomSheet.moneyKeypad').load( '../../html_cda/m_cda/CDAMAO0800P02.html .bottomSheet > *' , function(){
					setTimeout(function(){
						$('.bottomSheet.moneyKeypad').addClass('open');
					},10);
					markup.ariaInit();
					$('.bottomSheet.moneyKeypad .icoBtn_close').bind({
						'click' : function(){
							/* 금액입력 키패드를 닫을때
							입력된 금액을 체크하셔서 입력금액이 있을 경우 해당 moneyCalc에 on class를 넣어주시고 입력금액이 없을 경우 on class를 삭제해 주셔야 합니다.
							본문에 금액이 표시되는 타입이 input 인 경우가 있고 div인 경우가 있습니다.
							input일때는 value값을 div일때는 text값을 셋팅해주시기 바랍니다.
							*/
							ui.moneyKeypadRemove();
						}
					});
				});
			},
			rangeInit : function(){
				$('.range').each(function(){
					if( $(this).hasClass('uiAct') == false ){
						$(this).addClass('uiAct');
						var ipt = $(this).find('input[type=range]');
						if( $(this).find('.msgTip').length == 0 ){
							$(this).append('<span class="current msgTip"></span><div class="txtArea"><span>' + $(ipt).attr('min') + $(ipt).data('unit') + '</span><span class="current">'+ $(ipt).val() + $(ipt).data('unit') + '</span><span>' + $(ipt).attr('max') + $(ipt).data('unit') + '</span></div>');
						}
						$(this).bind({
							'touchstart' : function(e){
								$(e.target).closest('.range').find('.msgTip').addClass('on');
							},
							'touchend' : function(e){
								$(e.target).closest('.range').find('.msgTip').removeClass('on');
							},
							'input' : function(e){
								rangeInitNum(e.target);
								if( $('.stampProgress').length > 0 ){
									alignMsgTip( $(e.target), $(e.target).closest('.range').find('.msgTip') );
								}
							}
						});
						$(ipt).trigger('input');
					}
				});
				function rangeInitNum( target ){
					var color = $(target).data('barColor');
					if( color == undefined )color='#47435d';
					var unit = $(target).data('unit');
					if( unit == undefined )unit='';
					var msg = $(target).data('msg');
					if( msg == undefined )msg= $(target).val() + unit;
					var percent = ( $(target).val()- $(target).attr('min') ) / ( $(target).attr('max') - $(target).attr('min') );
					$(target).css('background-image','-webkit-gradient(linear, left top, right top, ' + 'color-stop(' + percent + ', ' + color + '),' + 'color-stop(' + percent + ', #eee)' + ')');
					$(target).closest('.range').find('.txtArea .current').css('left', percent*100 + "%" );
					$(target).closest('.range').find('.current').text( msg );
					var leftPos = ($(target).width() - 20) * percent + 10 + parseInt( $(target).closest('.range').css('paddingLeft') );
					$(target).closest('.range').find('.msgTip').css('left',  leftPos );
				}
				function alignMsgTip( range, msgTip ){
					$(msgTip).removeClass('fitLeft fitRight');
					if( $(msgTip).offset().left < 10){
						$(msgTip).addClass('fitLeft');
					}
					if( $(msgTip).offset().left + $(msgTip).width() > $(window).width() - 30 ){
						$(msgTip).addClass('fitRight');
					}
				}
			},
			moneyKeypadRemove : function(){
				$('.bottomSheet.moneyKeypad').addClass('close');
				setTimeout(function(){
					$('.bottomSheet.moneyKeypad').remove();
					$('body').removeClass('popOn');
					$('body .content').removeAttr('aria-hidden');
				}, 300)
			},
			// Tab init
			tabCnt : 0,
			tabInit : function(){
				for( var i = 0 ; i < $('.tabWrap').length ; ++i ){
					console.log('.tab Init!!!!!!!!');
					if( $('.tabWrap:eq('+i+')').hasClass('uiAct') == false ){
						$('.tabWrap:eq('+i+')').addClass('uiAct');
						$('.tabWrap:eq('+i+') > .tabList').attr({'role': 'tablist'});
						$('.tabWrap:eq('+i+') > .tabList > li').each(function( idx ){
							var tabPanel = $(this).closest('.tabWrap').find(' > .tabContents > .tabPanel:eq(' + idx + ')');
							$(this).attr({'role': 'tab', 'aria-selected': false, 'aria-controls': returnID( $(tabPanel), 'tabPanel_'+ui.tabCnt+'_'+idx ) , 'id': returnID( $(this), 'tab_'+ui.tabCnt+'_'+idx ), 'tabindex': 0});
							$(tabPanel).attr({'role': 'tabpanel', 'aria-labelledby': 'tab_'+ui.tabCnt+'_'+idx, 'id': returnID( $(tabPanel), 'tabPanel_'+ui.tabCnt+'_'+idx )});
							idx++;
						});
						ui.tabCnt++;
						$('.tabWrap:eq('+i+') > .tabList > li').bind({
							'click' : function(){
								var idx = $(this).index();
								var panel = $(this).closest('.tabWrap').find(' > .tabContents > .tabPanel:eq('+idx+')');
								$(this).addClass('on').attr('aria-selected','true').siblings().removeClass('on').attr('aria-selected','false');
								$(panel).addClass('on').siblings().removeClass('on');
								ui.swiperUpdate();
								wa.update();
							},
							'keydown' : function(e){
								if(e.keyCode == 13){
									$(e.target).trigger('click');
								}
							}
						});
					}
					if( $('.tabWrap:eq('+i+') > .tabList > li.on').length == 0 ){
						$('.tabWrap:eq('+i+') > .tabList > li:eq(0)').trigger('click');
					} else {
						$('.tabList:eq(0) > li.on').trigger('click');
					}
				}
				function returnID( target, id ){
					var returnID = $(target).attr('id');
					if( $(target).attr('id') == undefined ){
						returnID = id;
					}
					return returnID;
				}

				if( pubMode == true ){
					var tabIdx = getParameterByName('activeTab');
					if( tabIdx != "" ){
						$('.tabList:eq(0) > li:eq(' + tabIdx + ')').trigger('click');
						console.log( $('.tabList:eq(0) > li:eq(' + tabIdx + ')').text() );
					}
				}

				for( var i = 0 ; i < $('.tabList').length ; ++i ){
					if( $('.tabList:eq('+i+')').closest('.tabWrap').length == 0 && $('.tabList:eq('+i+')').hasClass('uiAct') == false ){
						$('.tabList:eq('+i+')').addClass('uiAct');
						$('.tabList:eq('+i+') > li').attr({'role': 'button', 'tabindex': 0});
						$('.tabList:eq('+i+') > li.on').append('<span class="waTxt">선택됨</span>');
						$('body').addClass('hasLinkTab');
					}
				}
			},
			// accordian init Make
			accoCnt : 0,
			accoInit : function( _accoBtn, _accoBody ){
				_accoBtn == undefined ? accoBtn='.icoBtn_acco' : accoBtn=_accoBtn;
				_accoBody == undefined ? accoBody='.accoBody' : accoBody=_accoBody;
				for( var i = 0 ; i < $(accoBtn).length ; ++i ){
					if( $( accoBtn+':eq('+i+')' ).hasClass('uiAct') == false ){
						$( accoBtn+':eq('+i+')' ).addClass('uiAct');
						$( accoBtn+':eq('+i+')' ).closest('ul').find(' > *').addClass('accoItem');
						if( $( accoBtn+':eq('+i+')' ).closest('.accoItem').length == 0 ){
							$( accoBtn+':eq('+i+')' ).closest('.hasAcco').addClass('accoItem');
						}
						if( $( accoBtn+':eq('+i+')' ).closest('.accoItem').length == 1 ){
							$( accoBtn+':eq('+i+')' ).closest('.accoItem').attr({'data-btn': accoBtn, 'data-body': accoBody } );
							// id 생성
							if( $( accoBtn+':eq('+i+')' ).attr('id') == undefined ){
								$( accoBtn+':eq('+i+')' ).attr('id', accoBtn.replace('.','') + ui.accoCnt );
							}
							if( $( accoBtn+':eq('+i+')' ).closest('.accoItem').find( '>' + accoBody ).attr('id') == undefined ){
								$( accoBtn+':eq('+i+')' ).closest('.accoItem').find( '>' +  accoBody ).attr('id', accoBody.replace('.','') + ui.accoCnt );
							}

							ui.accoCnt++;
							// aria Init
							$( accoBtn+':eq('+i+')' ).attr({'aria-expanded': false, 'aria-controls': $( accoBody+':eq('+i+')' ).attr('id'), 'aria-label': '상세내용 보기' });
							if( $( accoBtn+':eq('+i+')' ).text() != '' ){
								$( accoBtn+':eq('+i+')' ).removeAttr('aria-label');
							}
							if( $( accoBtn+':eq('+i+')' ).closest('.accoList').data('single') == true ){
								$( accoBody+':eq('+i+')' ).attr({'role': 'region', 'aria-labelledby': $( accoBtn+':eq('+i+')' ).attr('id') });
							} else {
								$( accoBody+':eq('+i+')' ).attr({'aria-labelledby': $( accoBtn+':eq('+i+')' ).attr('id') });
							}

							if( jQueryMode == true ){
								if( $( accoBtn+':eq('+i+')' ).closest('.accoItem').hasClass('on') ){
									$( accoBtn+':eq('+i+')' ).attr('aria-expanded', true);
									$( accoBtn+':eq('+i+')' ).closest('.accoItem').find('>'+accoBody).show();
								} else {
									$( accoBtn+':eq('+i+')' ).closest('.accoItem').find('>'+accoBody).hide();
								}
								$( accoBtn+':eq('+i+')' ).bind({
									'click':function(e){
										var target = e.target;
										e.preventDefault();
										var contents = $(target).closest('.accoItem').find( '>' + $(target).closest('.accoItem').data('body') );
										$(target).closest('.accoItem').toggleClass('on');
										if( $(target).closest('.accoItem').hasClass('on') ){
											$(contents).stop(true, true).slideDown(300,function(){
												ui.swiperUpdate();
											});
											$(target).attr('aria-expanded', true);
											if( $(target).closest('.accoList').data('single') == true || $(target).closest('ul').data('single') == true ){
												var accoBody = $(target).closest('.accoItem').data('body');
												$(target).closest('.accoItem').siblings('.accoItem').removeClass('on');
												$(target).closest('.accoItem').siblings('.accoItem').find('>'+accoBody).stop(true, true).slideUp(300);
												$(target).closest('.accoItem').siblings('.accoItem').find('> .accoHead '+accoBtn).attr('aria-expanded', false);
											}
											//ui.setBtnAddInit();
											setTimeout(function(){wa.update();},500);
										} else {
											$(contents).stop(true, true).slideUp(300);
											$(target).attr('aria-expanded', false);
										}
									}
								});
								var accoHead = $( accoBtn+':eq('+i+')' ).closest('.accoHead');
								if( $(accoHead).closest('.helpWrap').length == 0 ){
									if( $(accoHead).find(':input:not(.icoBtn_acco)').length == 0 ){
										$(accoHead).bind({
											'click' : function(e){
												var btn = $(e.target).closest('.accoItem').data('btn');
												if( $(e.target).is(btn) == false && $(e.target).closest('.accoHead').find(' > ' + btn ).is(':visible') == true ){
													$(e.target).closest('.accoHead').find(' > ' + btn ).trigger('click');
												}
											}
										});
									}
								}
							}
							// 도움말 퍼블페이지만 펼쳐 놓기
							if( window.location.href.indexOf('.html') > -1 && window.location.href.indexOf('localhost:') > -1 ){
								if( $( accoBtn+':eq('+i+')' ).closest('.helpWrap').length > 0 ){
									$( accoBtn+':eq('+i+')' ).trigger('click');
								}
							}
						}
					}
				}
			},
			// 통신사 선택
			iptFiltAgencyInit : function(){
				$('.iptFilt.agency').find('input[type=radio]').change(function(e){
					$(e.target).closest('.iptFilt.agency').find('.selectWrap').removeClass('on');
				});
			},
			monthCurrentInit : function(){
				if( $('.transHistory').length > 0 ){
					if( $('.transHistory').hasClass('uiAct') == false ){
						$('.transHistory').addClass('uiAct');
						$('.transHistory').prepend('<div class="month current" aria-hidden="true"><div></div></div>');
						$('.transHistory h2.month').each(function(){
							$('.month.current > div').append('<span>'+ $(this).text() +'</span>');
						});
						$('.transHistory h2.month:eq(0)').addClass('blind');
					}
				}
			},
			historyMonthMove : function(){
				for( var i = $('h2.month').length - 1 ; i >= 0 ; --i ){
					if( $(window).scrollTop() + parseInt($('.month.current').css('top')) + 12 > $('h2.month:eq('+i+')').offset().top ){
						$('.month.current > div').css('transform', 'translate(0,-'+Number(i*24)+'px)');
						break;
					}
				}
			},
			// check에 따라 accordian
			recFundInit : function(){
				$('.recFund .toggleSwitch input[type=checkbox]').each(function(){
					if( $(this).prop('checked') ){
						$(this).closest('.recFund').find('.fundList').show();
					} else {
						$(this).closest('.recFund').find('.fundList').hide();
					}
				});
				$('.recFund .toggleSwitch input[type=checkbox]').on('change',function(e){
					if( $(e.target).prop('checked') ){
						$(e.target).closest('.recFund').find('.fundList').stop().slideDown(280);
					} else {
						$(e.target).closest('.recFund').find('.fundList').stop().slideUp(280);
					}
				})
			},
			// infoBox 활성화
			infoBoxActiveInit : function(){
				$('body').on('change', '.infoBox input[type=checkbox], .infoBox input[type=radio]', function(e){
					if( $(e.target).closest('.single').find('label.blind').length > 0 ){
						if( $(e.target).attr('type') == 'radio' ){
							var nm = $(e.target).attr('name');
							$('.infoBox input[name='+nm+']').closest('.infoBox').removeClass('active');
						}
						if( $(e.target).prop('checked') ){
							$(e.target).closest('.infoBox').addClass('active');
						} else {
							$(e.target).closest('.infoBox').removeClass('active');
						}
					}
					if( $(e.target).closest('.contractInfoList').length > 0 ){
						if( $(e.target).closest('.accoWrap').find('input:checked').length > 0 ){
							$(e.target).closest('.accoWrap').addClass('active');
						} else {
							$(e.target).closest('.accoWrap').removeClass('active');
						}
					}
				});
			},
			insuRiderListInit : function(){
				$('body').on('change', '.insuRiderList .insuRiderHead input[type=checkbox]', function(e){
					if( $(e.target).closest('li').hasClass('readonly') ){
						$(e.target).closest('li').removeClass('readonly');
						$(e.target).closest('li').find('.row input').prop('readonly', false);
					} else {
						$(e.target).closest('li').addClass('readonly');
						$(e.target).closest('li').find('.row input').prop('readonly', true);
					}
				});
			},
			// stepProgressInit
			stepProgressInit : function(){
				$('.progressStep').each(function(){
					var total = $(this).data('total');
					var now = $(this).data('current');
					var per = Number(now/total*100) + '%';
					if( $(this).find('.bar').length == 0 ){
						$(this).append( '<div class="bar"><span></span></div><div class="num" aria-hidden="true">'+now+'<span>/'+total+'</span></div>' );
					}
					$(this).attr('aria-label','총 '+total+'단계 중 '+now+'단계');
					$(this).find('.bar > span').css('width', per );
				});
			},
			icoBtnPensionInit : function(){
				$('.icoBtn_pension').each(function(){
					if( $(this).hasClass('uiAct') == false ){
						$(this).addClass('uiAct');
						$(this).bind({
							'click':function(e){
								$(e.target).closest('.pensionInfo').toggleClass('on');
								if( $(e.target).closest('.pensionInfo').hasClass('on') ){
									$(e.target).attr('aria-label', '연금의 유형 및 지급방법 안내 접기');
								} else {
									$(e.target).attr('aria-label', '연금의 유형 및 지급방법 안내 펼치기');
								}
							}
						})
					}
				});
			},
			imgMoreInit : function(){
				$('.imgWrap + button.more').each(function(){
					if( $(this).hasClass('uiAct') == false ){
						$(this).addClass('uiAct');
						$(this).bind({
							'click' : function(e){
								if( $(this).prev().hasClass('on') == false ){
									$(this).prev().addClass('on');
									$(this).text('접기');
								} else {
									$(this).prev().removeClass('on');
									$(this).text('펼쳐보기');
								}
							}
						});
					}
				});
			},
			// Custom Select init
			customSelectGlobal : new Object(),
			customSltFocusOutEL : new Object(),
			customSltInit : function(){
				for(var  i = 0 ; i < $('.customSlt').length ; ++i ){
					if( $('.customSlt').eq(i).hasClass('uiAct') == false ){
						$('.customSlt').eq(i).addClass('uiAct');
						$('.customSlt:eq('+i+') li > button.on, .customSlt:eq('+i+') li > a.on').attr('title','선택됨');
						if( $('.customSlt:eq('+i+') .asSlt').hasClass('cardSel') == false ){
							//$('.customSlt:eq('+i+') .asSlt').data('fixTitle', $('.customSlt:eq('+i+') .asSlt:not(a.cardSel)').text() ); /* 고정텍스트 */
						}
						if( $('.customSlt:eq('+i+') li > *.on').length > 0 ){
							$('.customSlt:eq('+i+') .asSlt:not(a.cardSel)').text( $('.customSlt:eq('+i+') li > *.on').html() );
						}
						// Custom에 있는 검색필드
						var searchTitTxt = $('.customSlt:eq('+i+') .asSlt').attr('title') + '에 관련된 검색어 입력';
						$('.customSlt:eq('+i+') .customSearch .ipt').attr('title', searchTitTxt);
						$('.customSlt:eq('+i+') .customSearch .ipt').bind({
							'focusin':function(){
								$(this).removeClass('firstSet');
							}
						});

						// 이벤트
						$('.customSlt:eq('+i+') .asSlt').bind({
							'click':function(e){
								e.preventDefault();
								if( $(this).closest('.customSlt').hasClass('on') == false ){
									$('.customSlt.on').removeClass('on');
									$(this).closest('.customSlt').addClass('on');
									$(this).closest('.customSlt').find('.customSearch .ipt').addClass('firstSet').val('');
									$(this).attr('tabindex','-1');
									if( $(this).data('fixTitle') != undefined ){
										$(this).text( $(this).data('fixTitle') );//fix
									}
									ui.customSelectGlobal = true;
									ui.bodyAddBind(true, $(this));
								} else {
									$(this).closest('.customSlt').removeClass('on');
									$(this).text( $(this).closest('.customSlt ul .on').html() );//selectText
									if( $(this).closest('.customSlt ul .on').length == 0 ){
										if( $(this).data('fixTitle') != undefined ){
											$(this).text( $(this).data('fixTitle') );//fix
										}
									}
									$(this).closest('.customSlt').find('.asSlt').removeAttr('tabindex');
									ui.customSelectGlobal = false;
									ui.bodyAddBind(false, $(this));
								}
							}
						});
						$('.customSlt:eq('+i+')').on('click', 'li > button, li >a', function(e){
							var _this = e.currentTarget;
							e.preventDefault();
							$(_this).parent().siblings().find('>*').removeClass('on').removeAttr('title');
							$(_this).addClass('on').attr('title','선택됨');
							$(_this).closest('.customSlt').find('.asSlt').html($(this).html());
							$(_this).closest('.customSlt').find('.asSlt').focus();
							$(_this).closest('.customSlt').find('.asSlt').removeAttr('tabindex');
							$(_this).closest('.customSlt').removeClass('on');
						});
						$('.customSlt:eq('+i+')').on('focusout', ' li button, li a, li a.cardSel', function(e){
							var _this = e.currentTarget;
							ui.customSltFocusOutEL = $(_this);
							setTimeout(function(){
								if( $(':focus').closest('.customSlt').length == 0){
									ui.customSelectGlobal = false;
									ui.bodyAddBind(false, $(_this));
									$(ui.customSltFocusOutEL).closest('.customSlt').find('.asSlt').attr('tabindex','0');
									$('.customSlt.on .asSlt').html( $('.customSlt.on ul .on').html() );//selectText
									if( $('.customSlt.on ul .on').length == 0 ){
										if( $(_this).closest('.customSlt').data('fixTitle') != undefined ){
											$(_this).closest('.customSlt').find('.asSlt').html($(_this).closest('.customSlt').find('.asSlt').data('fixTitle') );//fix
										}
									}
									$('.customSlt.on').removeClass('on');
								}
							},10);
						});
						// Focus
						$('.customSlt:eq('+i+') .customSltListWrap').attr('tabindex',0);
					}
				}
			},
			bodyAddBind : function (state,_target){
				if(state == true){
					$('body').bind({
						'mousedown':function(e){
							if( $(e.target).hasClass('customSlt', 'on') == true ){
								return false;
							}
							if( $(e.target).closest('.customSlt').length == 0 ){
								$('.customSlt.on .asSlt').html( $('.customSlt.on ul .on').html() );//selectText
								if( $('.customSlt.on ul .on').length == 0 ){
									if( $(e.target).closest('.customSlt').data('fixTitle') != undefined ){
										$('.customSlt.on .asSlt').html( $('.customSlt.on .asSlt').data('fixTitle') );//fix
									}
								}
								$('.customSlt.on').removeClass('on');
								customSelectWrapState = false;
								$('body').unbind('mousedown');
								return false;
							}
						}
					});
				} else {
					$('body').unbind('mousedown');
				}
			},
			summaryListInit : function(){
				console.log( "$('.summaryList .swiperWrap').length : " + $('.summaryList .swiperWrap').length );
				for( var i = 0 ; i < $('.summaryList .swiperWrap').length ; ++i ){
					if( $('.summaryList .swiperWrap:eq('+i+')').hasClass('snap') == false && $('.summaryList .swiperWrap:eq('+i+')').hasClass('on') == false ){
						if( $('.summaryList .swiperWrap:eq('+i+') .summaryCard').length > 5 ){
							$('.summaryList .swiperWrap:eq('+i+')').data({'scrollbar':true, 'page': false, 'loop': false});

						}
					}
					setTimeout(function(){
						 $('.summaryList .swiperWrap').each(function(){
							 ui.summaryGraphAni( $(this).find('.swiper-slide-active') );
						 })
					}, 200);
				}
			},
			summaryGraphAni : function(target){
				//console.log("summaryGraphAni!!! : " + $(target).find('.numCnt').text() + ', total : ' + $(target).find('.totalCnt').text() );
				var percent = $(target).find('.numCnt').text()/$(target).find('.totalCnt').text();
				var rotate = percent*100*0.66-33;
				$(target).find('.graphAni .bar').css({'transform':'translateX(-50%) rotate(' + rotate + 'deg)', 'transition-duration' : 0.15 + percent*0.5 +'s'});
				$(target).siblings().find('.graphAni .bar').css({'transform':'translateX(-50%) rotate(-33deg)', 'transition-duration' : '0s'});
			},
			// swiper Init
			swiperIdCnt : 0,
			swiperInit : function(){
				console.log('swiperInit');
				$('.swiperWrap').each(function(idx){
					var visibleState = true;
					var swiper;
					if( $('.swiperWrap:eq('+idx+')').attr('id') == undefined ){
						$('.swiperWrap:eq('+idx+')').attr('id', 'swiper'+ui.swiperIdCnt );
						ui.swiperIdCnt++;
					}
					if( $('.swiperWrap:eq('+idx+')').hasClass('on') == false ){
						if( $('.swiperWrap:eq('+idx+')').find('> .slideList > *').length >= 1 ){
							if( $('.swiperWrap:eq('+idx+')').find('.swiper-container').length == 0 ){
								$('.swiperWrap:eq('+idx+')').wrapInner('<div class="swiper-container"/>');
							}
							var targetWrap = $('.swiperWrap:eq('+idx+')');
							if( $(targetWrap).is(':visible') == false ){
								$(targetWrap).show();
								visibleState = false;
							}
							var target = '#'+$('.swiperWrap:eq('+idx+')').attr('id') + ' .swiper-container';
							var totalNum = $(target).find('> .slideList > *').length;
							dataSet( $(targetWrap), 'fade', 'slide' );
							dataSet( $(targetWrap), 'loop', true );
							dataSet( $(targetWrap), 'speed', 500 );
							dataSet( $(targetWrap), 'page', true );
							dataSet( $(targetWrap), 'align', 'right' );
							dataSet( $(targetWrap), 'arrow', true );
							dataSet( $(targetWrap), 'number', false );
							dataSet( $(targetWrap), 'perView', 1 );
							dataSet( $(targetWrap), 'between', 0 );
							dataSet( $(targetWrap), 'auto', 4000 );
							dataSet( $(targetWrap), 'pause', true );
							dataSet( $(targetWrap), 'align', 'bc' );
							dataSet( $(targetWrap), 'autoHeight', false );
							dataSet( $(targetWrap), 'scrollbar', false );
							dataSet( $(targetWrap), 'inner', false );
							$(target).find('> .slideList').addClass('swiper-wrapper');
							$(target).find('> .slideList > *').addClass('swiper-slide');
							// pagenation
							$(targetWrap).append('<div class="swiper-controls"><div class="swiper-pagination"></div></div>');
							if( $(targetWrap).data('align') == 'left' ){
								 $(targetWrap).find('.swiper-controls').addClass('al');
							} else if( $(targetWrap).data('align') == 'right' ){
								 $(targetWrap).find('.swiper-controls').addClass('ar');
							} else if( $(targetWrap).data('align') == 'center' ){
								 $(targetWrap).find('.swiper-controls').addClass('ac');
							}
							if( $(targetWrap).data('page') == false ){
								$(targetWrap).find('.swiper-pagination').hide();
							}
							if( $(targetWrap).data('auto') != false ){
								$(targetWrap).find('.swiper-controls').append(
									'<button type="button" class="swiper-button-stop"><span class="blind">stop</span></button>'+
									'<button type="button" class="swiper-button-play"><span class="blind">play</span></button>'
								);
							}
							if( $(targetWrap).data('inner') == false ){
								var btnTarget = $(targetWrap);
								$(btnTarget).append(
									'<button type="button" class="btnPrev"><span class="blind">이전 슬라이드</span></button>'+
									'<button type="button" class="btnNext"><span class="blind">다음 슬라이드</span></button>'
								);
							} else {
								btnTarget = $(targetWrap).find('.swiper-controls');
								$(btnTarget).prepend('<button type="button" class="btnPrev"><span class="blind">이전 슬라이드</span></button>');
								$(btnTarget).append('<button type="button" class="btnNext"><span class="blind">다음 슬라이드</span></button>')
							}
							if( $(targetWrap).data('arrow') != true ){
								$(targetWrap).find('.btnPrev').hide();
								$(targetWrap).find('.btnNext').hide();
							}

							if( totalNum <= $(targetWrap).data('perView') ){
								$(targetWrap).find('.swiper-controls').addClass('visibleMb');
								$(targetWrap).find('.btnNext, .btnPrev').addClass('hiddenPC');
								$(targetWrap).data('loop', false );
								$(targetWrap).data('auto', false );
							}
							if( $(targetWrap).data('scrollbar') != false ) {
								$(targetWrap).append('<div class="swiper-scrollbar"></div>');
							}
							var swiperOpt = {
								effect : $(targetWrap).data('fade'),
								init : false,
								speed : $(targetWrap).data('speed'),
								loop : $(targetWrap).data('loop'),
								autoHeight : $(targetWrap).data('autoHeight'),
								slidesPerView : $(targetWrap).data('perView'),
								spaceBetween : $(targetWrap).data('between'),
								pagination:{
									el: $(targetWrap).find('.swiper-pagination'),
									clickable : 'true',
									renderBullet : function(index,className){
										return '<button type="button" class="'+className+'"><span class="blind">' + (index + 1) + '</span></button>';
									}
								},
								navigation:{
									nextEl: $(targetWrap).find('.btnNext'),
									prevEl: $(targetWrap).find('.btnPrev')
								},
								/* 모바일에서는 의미 없음
								breakpoints: {
									767:{
										allowTouchMove : true,
										followFinger : true,
										//slidesPerView: 1
									},
									3000:{
										allowTouchMove : false,
										followFinger : false,
										//slidesPerView: $(targetWrap).data('perView')
									}
								},*/
								scrollbar : {
									el: '.swiper-scrollbar',
									hide: false
								}
							}
							if( $(targetWrap).data('auto') != false ) {
								swiperOpt.autoplay = {
									delay : $(targetWrap).data('auto'),
									disableOnInteraction : !$(targetWrap).data('auto')
								}
							}
							swiper = new Swiper(target, swiperOpt);
							$(targetWrap).find('.swiper-pagination').attr('aria-label','총 '+totalNum+'슬라이드 중  1번째 슬라이드');
							swiper.on('slideChange',function(){
								//$(targetWrap).find('.swiper-slide a, .swiper-slide :input').show();
								//console.log("트렌지션엔드 : " + this.activeIndex );
								$(targetWrap).find('.swiper-pagination').attr('aria-label', '총 '+ totalNum+'슬라이드 중 '+Number(this.realIndex+1) + '번째 슬라이드');
								$(targetWrap).find('.swiper-counter em').text( Number(this.realIndex+1) );
								if( $(targetWrap).hasClass('bbsPop') == true ){
									if(this.activeIndex == '1') {
										$(targetWrap).siblings('header').find('.swiper-counter em').text( 1 );
									} else {
										$(targetWrap).siblings('header').find('.swiper-counter em').text( Number(this.realIndex+1) );
									}
								}
								var nowActiveEL = swiper.activeIndex;
								if( $(targetWrap).data('color') != undefined ){
									swiperColorInvert( swiper.$el, nowActiveEL );
								}
							});
							swiper.on('slideChangeTransitionStart',function(){

							});
							swiper.on('slideChangeTransitionEnd',function(){
								var nowActiveEL = this.activeIndex;
								$(targetWrap).find('.swiper-slide :input, .swiper-slide a, .swiper-slide *[role=button]').attr('tabindex','-1');
								$(targetWrap).find('.swiper-slide-active :input, .swiper-slide-active a, .swiper-slide-active *[role=button]').removeAttr('tabindex');
								$(targetWrap).find('.swiper-slide-active *[role=button]').attr('tabindex','0');
								if( $(targetWrap).data('perView') != undefined ){
									var nextLI = $(target).data('perView') - 1;
									for( var i = 0 ; i < nextLI ; ++i ){
										$(targetWrap).find('.swiper-slide-active').nextAll().slice(i,i+1).find('*').removeAttr('tabindex');
									}
								}

								setTimeout(function(){
									swiperTransitionEndFunc( $(targetWrap), nowActiveEL );
								},10);

							});
							swiper.on('init',function(){
								$(targetWrap).find('.swiper-slide :input, .swiper-slide a, .swiper-slide *[role=button]').attr('tabindex','-1');
								$(targetWrap).find('.swiper-slide-active :input, .swiper-slide-active a, .swiper-slide-active *[role=button]').removeAttr('tabindex');
								$(targetWrap).find('.swiper-slide-active *[role=button]').attr('tabindex','0');
								if( $(targetWrap).data('perView') != undefined ){
									var nextLI = $(target).data('perView') - 1;
									for( var i = 0 ; i < nextLI ; ++i ){
										$(targetWrap).find('.swiper-slide-active').nextAll().slice(i,i+1).find('*').removeAttr('tabindex');
									}
								}
							});
							if( $(targetWrap).data('number') == true ){
								$(targetWrap).find('.swiper-controls').append('<span class="swiper-counter"><em>1</em> / '+totalNum+'</span>');
								if ($(targetWrap).hasClass('bbsPop') == true ){
									$(targetWrap).siblings('header').find('.swiper-controls').append('<span class="swiper-counter"><em>1</em>/'+totalNum+'</span>');
								}
							}
							$(targetWrap).find('.swiper-button-play').bind({
								'click':function(e){
									swiper.autoplay.start();
									$(this).hide();
									$(this).parent().find('.swiper-button-stop').show().focus();
								}
							});
							$(targetWrap).find('.swiper-button-stop').bind({
								'click':function(e){
									swiper.autoplay.stop();
									$(this).hide();
									$(this).parent().find('.swiper-button-play').show().focus();
								}
							});
							swiper.init();
							if( visibleState == false ){
							//	$(targetWrap).hide();
							}

							swiperTransitionEndFunc( $(targetWrap), 0 );
						}
						$('.swiperWrap:eq('+idx+')').addClass('on');
						if( swiper != undefined ){
							window['ui' + $('.swiperWrap:eq('+idx+')').attr('id') ] = swiper;
							$(targetWrap).bind({
								'focusin':function(){
									var id = 'ui'+$(this).attr('id');
									window[id].autoplay.stop();
								},
								'focusout':function(){
									if( $(this).find('.swiper-button-stop').is(':visible') ){
										var id = 'ui'+$(this).attr('id');
										window[id].autoplay.start();
									}
								}
							});
							$('.swiperWrap:eq('+idx+')').find('.btnNext, .btnPrev').removeAttr('aria-label'); // 접근성 수정 작업
						}
					} else {
						$('.swiperWrap:eq('+idx+')').addClass('on')
					}
					idx++;
				});
				function swiperTransitionEndFunc( targetWrap , $nowActiveEL ){
					var nowActiveEL = $nowActiveEL;
					//$(target).find('.swiper-slide a, .swiper-slide :input').hide();
					//$(target).find('.swiper-slide *').removeAttr('tabindex');
					//$(target).find('.swiper-slide:eq('+nowActiveEL+') a, .swiper-slide:eq('+nowActiveEL+') :input').show();
					//$(target).find('.swiper-slide:eq('+nowActiveEL+') *[role=button]').attr('tabindex', 0);
					if( $(targetWrap).data('func') != undefined ){
						console.log("슬라이드 함수 호출 : " + $(targetWrap).data('func') );
						if( $(targetWrap).data('func').indexOf('.') > -1 ){
							var charIndex = $(targetWrap).data('func').indexOf('.');
							var mainFunc = String( $(targetWrap).data('func').substring(0,charIndex) );
							var subFunc = String( $(targetWrap).data('func').substring(charIndex+1) );
							window[ mainFunc ][subFunc]( $(targetWrap).find('.swiper-slide:eq('+nowActiveEL+')') );
						} else {
							window[ $(targetWrap).data('func') ]( $(targetWrap).find('.swiper-slide:eq('+nowActiveEL+')') );
						}
					}
				}
				function dataSet( target, attr, def ){
					if( $(target).data(attr) == undefined ){
						$(target).data(attr, def);
					}
				}
			},
			swiperUpdate : function(){
				for( var i = 0 ; i < $('.swiperWrap.on').length ; ++i ){
					try{
						window['ui' + $('.swiperWrap:eq('+i+')').attr('id') ].update();
					} catch(e){
						console.log(e);
					}
				}
			},
			// scroll Move
			scollMove : function(){
				$('.content a[href], .popup a[href]').each(function(){
					if( $(this).attr('href').length > 1 ){
						var hrefVal = $(this).attr('href').substr(0,1);
						if( hrefVal == '#' ){
							if( $(this).data('scollMove') == undefined ){
								$(this).data('scollMove',true);
								$(this).bind({
									'click' : function(e){
										e.preventDefault();
										var id = $(this).attr('href').replace('#','');
										if( $('#'+id).length > 0 ){
											var posY = $('#'+id).offset().top - $('header').height();
											console.log('here');
											$('body,html').animate({scrollTop: posY},300);
										}
									}
								});
							}
						}
					}
				});
			},
			// video info init
			videoInfoInit : function(){
				$('.videoInfo').each(function(){
					if( $(this).hasClass('uiAct') == false ){
						$(this).addClass('uiAct');
						$(this).find('.icoBtn_open').append('<span class="waTxt">펼치기</span>')
						$(this).find('.icoBtn_open').bind({
							'click' : function(){
								$(this).closest('.videoInfo').toggleClass('on');
								if( $(this).closest('.videoInfo').hasClass('on') ){
									$(this).find('.waTxt').text('접기');
									$(this).closest('.videoInfo').find('.infoBody').stop().slideDown();
								} else {
									$(this).find('.waTxt').text('펼치기');
									$(this).closest('.videoInfo').find('.infoBody').stop().slideUp();
								}
							}
						});

					}
				});
			},
			prdHoverInit : function(){
				$('.prdList:not(.slideList)').on({
					'mouseenter': function(e){
						$('.prdList > li').removeClass('on');
						$(e.target).closest('li').addClass('on');
					}
				},'> li');
				$('.prdList:not(.slideList)').on({
					'mouseleave': function(e){
						$('.prdList > li').removeClass('on');
					}
				});
				$('.prdSumList').on({
					'mouseenter focusin' : function(e){
						$(e.target).closest('.prdInfoSum').siblings().addClass('out');
						$(e.target).closest('.prdInfoSum').siblings().removeClass('hover');
						$(e.target).closest('.prdInfoSum').removeClass('out');
						$(e.target).closest('.prdInfoSum').addClass('hover');
					}
				},'a.inner, .links');
				$('.prdSumList').on({
					'mouseleave focusout' : function(e){
						$(e.target).closest('.prdInfoSum').addClass('out');
						$(e.target).closest('.prdInfoSum').removeClass('hover');
					}
				}, '.prdInfoSum')
			},
			aniInit : function(){
				$('.barAni').each(function(){
					if( layout.lastY + winH > $(this).offset().top + 100 ){
						if( $(this).is(':visible') ){
							$(this).addClass('aniOn');
						}
					}
				});
			},
			aniNumCnt : 0,
			aniMake : function(){
				$('.barAni').each(function(){
					$(this).width( $(this).data('percent') + '%' );
				});
			},
			chatInit : function(){
				// Drag
				var dragCnt = 0;
				$('.icoBtn_chatbot').parent().draggable(
					/*{
						containment: ".content"
					},*/
					{
						start: function(){
							dragCnt = 1;
							console.log('drag start');
						}
					},
					{
						drag: function(){
							dragCnt++;
							console.log('drag cnt');
						}
					},
					{
						stop : function(e){
							console.log('drag stop');
							if( dragCnt < 7 ){
								$( e.originalEvent.originalEvent.path[0] ).closest('.icoBtn_chatbot').trigger('click');
							}
							console.log( "dragCnt : " + dragCnt )
							dragCnt = 0;
							setTimeout(function(){
								$('.icoBtn_chatbot').parent().css('left', 0);
								if( parseInt( $('.icoBtn_chatbot').parent().css('top') ) > 0 ){
									$('.icoBtn_chatbot').parent().css('top', 0);
								}
							}, 10)
						}
					}
				);
				/* TEST용
				$('.icoBtn_chatbot').bind({
					'click' : function(){
						console.log("test : click event");
					}
				});
				*/
			},
			btnAreaInit: function(){
				if( $('#content .accoItem').length > 0 && $('#content .btnArea.sticky').length > 0 ){
					$('.btnArea.sticky').addClass('fixed');
					$('body').addClass('hasStickyBtnArea');
				} else if ( $('.popWrap .popup:not(.bottomSheet):not(.alert)').length > 0 && $('.btnArea.sticky').length > 0 ){
					$('.popWrap .popup').addClass('hasSticky');
				}
			}
	}
	var wa = {
			nowFocusEl : new Object(),
			// init
			init : function(){
				wa.update();
			},
			update : function(){
				wa.captionInit();
				wa.progressInit();
				wa.imgAltInit();
				wa.hrefInit();
				wa.tabindexInit();
				wa.pagingInit();
			},
			// 포커스 가능 선택자
			getEnabledFocus : function(_target, visible){
				var target = _target + " ";
				if( visible == undefined || visible == null ){
					var str = target + 'div:visible[tabindex="0"],'+target + 'li:visible[tabindex="0"],'+target + 'button:visible:not([tabindex="-1"]),'+target + 'a:visible:not([tabindex="-1"]),'+target+'input:visible:not([tabindex="-1"]),'+target+'select:visible:not([tabindex="-1"]),'+target+'textarea:visible:not([tabindex="-1"])';
				} else {
					str = target + 'div:[tabindex="0"],' + target + 'li:[tabindex="0"],' + target + 'button:not([tabindex="-1"]),'+target + 'a:not([tabindex="-1"]),'+target+'input:not([tabindex="-1"]),'+target+'select:not([tabindex="-1"]),'+target+'textarea:not([tabindex="-1"])';
				}
				return str;
			},
			// Table caption init
			captionInit : function(){
				$('.tblX, .bbsTbl, .press-table-comp').each(function(){
					if( $(this).find('thead').length != 0 ){
						var tableTit = $(this).closest('section').find('.titArea [class*=titH]').text();
						if( tableTit == "" ){
							tableTit = $(this).closest('section').parent().find('.titArea [class*=titH]').text();
						}
						if( tableTit == "" && $(this).closest('.popWrap').length == 0 ){
							tableTit = $(this).closest('.popWrap').find('.popHead .titH1').text();
							if( layout.wcmsState == true ){
								if( $(this).closest('.wpc').prev().is('[class*=wc_titH]') == true ){
									tableTit = $(this).closest('.wpc').prev().text();
								} else if( $(this).closest('.wpc').prev().find('[class*=wc_titH]').length > 0 ){
									tableTit = $(this).closest('.wpc').prev().find('[class*=wc_titH]').text();
								} else if( tableTit == "" && $('.bbsHead').length > 0 ){
									tableTit = $('.bbsHead .titArea').text();
								}
							}
						}
						if( $(this).closest('.popWrap').length > 0 ){
							tableTit = $(this).closest('.popWrap').find('.popHead .titH1').text();
						}
						if( $(this).data('title') != undefined ){
							tableTit = $(this).data('title');
						}
						var captionStr = tableTit;
						if(tableTit != "" ) captionStr += ' - ';
						$(this).find('thead th').each(function(idx){
							if( $(this).is(':visible') ){
								if( $(this).find('.tooltip').length == 0 ){
									var str = $(this).text();
									(idx != 0 )?captionStr += ", " + str:captionStr += str;
								} else {
									$('body').append('<div class="dummyToolTip">'+$(this).html()+'</div>');
									$('.dummyToolTip .tipWrap, .dummyToolTip .tooltip').remove();
									str = $('.dummyToolTip').text();
									(idx != 0 )?captionStr += ", " + str:captionStr += str;
									$('.dummyToolTip').remove()
								}
							}
						});
						captionStr += "(으)로 구성되어 있습니다.";
						if( $(this).find('caption').length > 0 ){
							$(this).find('caption').text( captionStr );
						} else {
							$(this).prepend('<caption>'+ captionStr +'</caption>');
						}
					} else {
						$(this).find('caption').remove();
					}
				});
				$('.tblY, .press-table-comp').each(function(){
					if( $(this).find('thead').length == 0 ){
						var captionStr = "";//타이틀 경로
						if( $(this).closest('.popWrap').length > 0 ){
							captionStr = $(this).closest('.popWrap').find('.popHead .titH1').text();
						}
						if( $(this).data('title') != undefined ){
							captionStr = $(this).data('title');
						}
						if( $(this).find('thead').length == 0 && $(this).find('tbody th').length > 0  ){
							captionStr = "";
							$(this).find('tbody th').addClass('transTH');
						}
						if( $(this).find('thead').length == 0 && $(this).find('.transTH').length > 0  ){
							captionStr = "";
						}
						if( captionStr != "" ){
							if( $(this).find('caption').length == 0 ){
								$(this).prepend('<caption></caption>');
							}
							$(this).find('caption').text( captionStr );
						} else {
							$(this).find('caption').remove();
						}
					}
				});
				$('table thead th').each(function(){
					if( $(this).attr('scope') == undefined ){
						$(this).attr('scope', 'col');
					}
				});
				$('table tbody th.transTH').each(function(){
					$(this).replaceWith('<td class="th transTH">'+$(this).html()+'</td>');
				});
				$('.transTH').closest('table').find('caption').remove();
				$('.transTH').removeClass('transTH');
			},
			progressInit : function(){
				console.log("progressInit");
				for(var  i = 0 ; i < $('.progress').length ; ++i ){
					if( $('.progress').eq(i).hasClass('uiAct') == false ){
						$('.progress').eq(i).addClass('uiAct');
						$('.progress:eq('+i+') ol').attr('aria-hidden','true');
						var num = $('.progress').eq(i).find('li').length;
						var nowStep = $('.progress').eq(i).find('li.on').index() + 1;
						var stepName = $('.progress:eq('+i+') li.on').text();
						$('.progress:eq('+i+')').attr('role','img');
						$('.progress:eq('+i+')').attr('aria-label','총 '+num+'단계 중 '+nowStep+'단계 '+stepName + ' 진행중');
						if( $('.progress:eq('+i+') li.on span').length == 0 ){
							$('.progress:eq('+i+') li.on').wrapInner('<span/>');
						}
					}
				}
			},
			// get Focus
			getNowFocus : function(){
				wa.nowFocusEl = $(':focus');
			},
			// set Focus
			setNowFocus : function(){
				$(wa.nowFocusEl).focus();
				wa.nowFocusEl = null;
			},
			// Focus Center Align
			focusCenterAlign : function(){
				$('body').on('focusin', '#content button, #content :input, #content a, .popCont button, .popCont :input, .popCont a' , wa.focusCenterAlignFunc);
				$('.swiper-slide button, .swiper-slide a').off('focusin');
			},
			focusCenterAlignFunc : function(e){
				if( $('.isDevice').length == 0 && $('.isIE').length > 0 ){
					if( $(e.target).offset().top < $(window).scrollTop() + 170 || $(e.target).offset().top > $(window).scrollTop() + $(window).height() - 120 ){
						var middleY = $(e.target).offset().top - $(window).height()*0.5;
						$(window).scrollTop( middleY );
					}

				}
			},
			imgAltInit : function(){
				$('img').each(function(){
					if( $(this).attr('alt') == undefined ){
						$(this).attr('alt', '');
					}
				});
			},
			hrefInit : function(){
				$('a').each(function(){
					if( $(this).attr('href') == undefined ){
						$(this).attr('href', '#');
					}
					if( $(this).attr('href').indexOf('tel') > -1 ){
						$(this).attr('title', '전화앱으로 이동');
						$(this).attr('class', 'tel');
					}
				});
			},
			pagingInit : function(){
				$('.paging li .blind').remove();
				if( $('.paging li.on em .waTxt').length == 0 ){
					$('.paging li.on em').append('<span class="waTxt">현재 페이지</span>');
				}
			},
			tabFocus : function(){
				$('body').on({
					'keydown':function(e){
						if( e.keyCode == "9" ){
							$('body').addClass('tabFocus');
						}
					},
					'mousedown':function(){
						$('body').removeClass('tabFocus');
					}
				});
			},
			tabindexInit : function(){
				$('.termsWrap .iptGroup .accoBody .inner, .scrollWrap, .tabindexInit, .wp-tabindexInit').attr('tabindex','0');
			},

			getLpFocus : function(_popup){
				var target = $(_popup).find('.popHead .titH1');
				if( $(_popup).find('.alert').length > 0 ||  $(_popup).hasClass('alert') ){
					target = $(_popup).find('.msg');
				}
				if(  $(_popup).find('.popCont.bottom').length > 0 || $(_popup).hasClass('bottom') ){
					target = $(_popup).find('.popCont');
				}
				if( $(_popup).hasClass('selectLayer') ){
					target = $(_popup).find('.optionList li.on');
					console.log('.select걸렸다 : ' + $(target).outerHTML() );
				}
				return target;
			},
			slideTxtInit : function(){
				var cnt = 0;
				for( var j = 0 ; j < $('.mainTopSlide .slideList > li').length ; ++j ){
					if( $('.mainTopSlide .slideList > li:eq('+j+')').hasClass('swiper-slide-duplicate') == false ){
						var txt = $('.mainTopSlide .slideList > li:eq('+j+')').data('title');
						if( $('.mainTopSlide .swiper-pagination button:eq('+cnt+') .item').length == 0 ){
							$('.mainTopSlide .swiper-pagination button:eq('+cnt+')').append('<span class="item">'+txt+'</span>');
						}
						cnt++;
					}
				}
			},
	}
	var lp = {
			zIdx : 2000,
			fnCb : new Object(),  // 개별팝업에서 콜백함수를 셋팅할수 있는 함수 객체.
			winLastW : new Object(),
			closeTarget : new Object(),
			firstPopFocus : new Object(),
			elCnt : 0, // element 갯수
			move : function(){
				$( '.popWrap' ).each(function(){
					$(this).insertBefore( ".wrapper" );
				});
			},
			// Open
			open : function (url, jsParam, jsURL, fnObj){ // jsParam(json 파라미터 객체), fnObj(콜백함수)
				lp.zIdx++;
				var alertState = 'none';
				wa.getNowFocus();
				lp.winLastW = $('body').outerWidth();
				if(fnObj != undefined && fnObj != null && fnObj != ""){
					lp.fnCb = fnObj; // 콜백함수 셋팅.
				}
				if( $('body').hasClass('popOn') == false ){
					if( isIOS == true ){
						var scrlPos = $(window).scrollTop();
						$('html, body').addClass('popOn');
						$('html, body').scrollTop( 0 );
						$(window).scrollTop( 0 );
						$('#content').css('top','-'+scrlPos+'px');
					} else {
						$('html, body').addClass('popOn');
					}
					lp.firstPopFocus = $(':focus');
				}
				if( lp.winLastW != $(window).width() ){
					$('body').addClass('hasScroll');
				}
				var ajaxType = false;
				if( url.indexOf('/') != -1 ){
					ajaxType = true;
				}
				if( ajaxType == true ){
					var str = url + " .popup";
					var popupID = url.substring(url.lastIndexOf('/')+1, url.lastIndexOf('.'))
					$('body').prepend('<div class="popWrap" id="'+popupID+'"></div>');
					$('#'+popupID).show();
					$('#'+popupID).load(str, jsParam, function(){
						lp.openedSet( $(this), jsURL);
					});
				} else {
					$(url).show();
					setTimeout(function(){
						lp.openedSet( $(url), jsURL);
					},10)
				}
			},
			openedSet : function( _target, jsURL ){
				var target = $(_target).closest('.popWrap');
				console.log("openedSet : " + target );
				$(target).css( 'z-index', lp.zIdx ).attr({'data-idx': lp.zIdx, 'tabindex': -1});
				lp.getCol( $(target) );
				$('html').addClass('hideBody');
				$('.wrapper').attr('aria-hidden','true');
				$(target).find('.popCont').attr('role','dialog');
				$(target).find('.popBody').attr('tabindex','0');
				lp.focusLoopInit();
				if( jsURL != undefined )$.getScript( jsURL ).done( function(){ /*cf_popfooter();*/ }).fail(function(){ /*cf_popfooter();*/ });

				if( $(target).find('.popup.alert').length > 0 ){
					$(target).css( 'z-index', lp.zIdx + 55000 ).removeAttr('data-idx');
					$(target).addClass('alertPop');
				} else if( $(target).find('.bottomSheet').length > 0 ){
					$(target).addClass('bottomSheet');
				} else {
					$(target).addClass('fullPop');
				}
				markup.conHeightChk('.popup');
				$(target).addClass('nowOpen');
				// bottom sheet
				setTimeout(function(){$(target).find('.bottomSheet').addClass('open');},100);
				//swiper문제 해결
				for( var i = 0 ; i < $('.popWrap .swiperWrap').length ; ++i ){
					try{
						window['ui' +$('.popWrap .swiperWrap:eq('+i+')').attr('id') ].update();
					}catch(e){
						console.log(e);
					}
				}
				if( $('.nowOpen .swiperWrap .swiper-container').length == 0 ){
					$('.nowOpen .swiperWrap').addClass('swiperReady');
					ui.swiperInit();
				}
				// 추후 팝업에서 스크롤 할때 애니메이션이 있을 경우 필요함
				$(target).find('.popBody').scroll( layout.popScrollMoved );
				setTimeout(function(){
					layout.popScrollMoved();
					$( wa.getLpFocus( $(target) ) ).focus();
				},1000);
				// 기본 실행
				ui.init();
				$(target).focus();
			},
			close : function (target, _mTime){
				var closeTarget = target;
				$(closeTarget).addClass("removeEnabled");
				if( target == null || target == undefined){
					var closeTarget = $(':focus').closest('.popWrap');
					$(closeTarget).addClass("removeEnabled");
				}
				if(_mTime == null || _mTime == undefined){
					var mTime = 450;
				} else {
					mTime = _mTime;
				}
				if( $(wa.nowFocusEl).closest('.menu').length == 0 ){
					wa.setNowFocus();
				} else {
					$(wa.nowFocusEl).find('>span').attr('tabindex','-1').focus();
					$(wa.nowFocusEl).trigger('focusout');
				}
				/* IE에서 팝업 높이값 체크 못할 경우 할수 있음.
				clearInterval( window["nowOpen"+$(closeTarget).data('idx')] );
				*/
				if( $(closeTarget).find('.bottomSheet').length == 0 ){
					console.log("bottom sheet 아님");
					$(closeTarget).removeClass('nowOpen');
					setTimeout(function(){
						if( $(closeTarget).hasClass("removeEnabled") ){
							$(closeTarget).remove();
						}
						lp.closeComplete();
					}, mTime);
				} else {
					console.log("bottom sheet 상태");
					$(closeTarget).find('.bottomSheet').removeClass('open');
					$(closeTarget).removeClass('nowOpen');
					setTimeout(function(){
						if( $(closeTarget).hasClass("removeEnabled") ){
							$(closeTarget).remove();
						}
						lp.closeComplete();
					},400);
				}
			},
			closeComplete : function(){
				if( $('body .popWrap.nowOpen').length == 0 ){
					$('html, body').removeClass('popOn hasScroll popFullScroll hideBody');
					$('.wrapper').removeAttr('aria-hidden');
					if( $(lp.firstPopFocus).closest('.menu').length == 0 ){
						$(lp.firstPopFocus).focus();
					} else {
						$(lp.firstPopFocus).find('>span').attr('tabindex','-1').focus();
						$(lp.firstPopFocus).trigger('focusout');
					}
					if( isIOS == true ){
						var scrlPos = - parseInt( $('#content').css('top') );
						$('html, body').removeClass('popOn');
						$('#content').css('top','auto');
						$('html, body').scrollTop( scrlPos );
					} else {
						$('html, body').removeClass('popOn');
					}
				}
			},
			getCol : function( target ){
				classMove( $(target), ['bottom', 'searchPage', 'digiPrdAll'] );
				var getCol = $(target).find('.popBody').attr('class');
				if( getCol != undefined ){
					console.log( "getCol : " + getCol );
					if( getCol.indexOf('col_') > -1 ){
						var replaceCol = getCol.replace('popBody','').replace('on','').replace(/ /gi, '');
						$(target).find('.popCont').addClass( replaceCol );
						$(target).find('.popBody').removeClass( replaceCol );
					}
				}
				function classMove(obj, arry){
					for( var i = 0 ; i < arry.length ; ++i ){
						if( $(target).find('.popBody').hasClass(arry[i]) == true ){
							$(target).find('.popBody').removeClass(arry[i]);
							$(target).find('.popCont').addClass(arry[i]);
						}
					}
				}
			},
			focusLoopInit : function (){
				$('.popWrap').each(function(){
					if( $(this).find('.focusSet').length == 0 ){
						$(this).prepend('<div class="focusSet blind first" tabindex="0"></div>');
						$(this).append('<div class="focusSet blind last" tabindex="0"></div>');
						$(this).find('.focusSet').bind({
							'focusin':function(e){
								var dataIdx = $(e.target).closest('.popWrap').data('idx');
								var popWrap =  '.popWrap[data-idx='+dataIdx+'] .popCont';
								if( $(e.target).hasClass('first') ){
									$( wa.getEnabledFocus(popWrap) ).last().focus();
								} else {
									$( wa.getEnabledFocus(popWrap) ).first().focus();
								}
							}
						});
					}
				});
			},
			popupResize : function( _str ){
				console.log("popupResize _str : " + _str);
				var str =_str;
				if( $( str + ' .popBody')[0] != undefined ){
					if( $( str + ' .popBody').data('height') != $(str + ' .popBody')[0].scrollHeight ){
						$( str + ' .popBody').data('height', $(str + ' .popBody')[0].scrollHeight);

						$(str + ' .popBody').removeClass('on').removeAttr('tabindex');
						$(str + ' .popBody').css('height','auto');
						winH = $(window).height();

						var result = $(str + ' .popBody').data('height');
						$(str + ' .popCont').css('min-height', 0);
						var vGap = 60; // 60은 팝업과 검은색 Dimmed 영역의 위아래 합산된 마진
						if( $('body.windowPop').length > 0 ){
							vGap = 0;
							if( $('body.windowPop .popWrap .popBody').length > 0 ){
								vGap = 60;
							}
						}
						var headerH = $(str + ' .popHead').outerHeight();
						if( $(str + ' .popCont > .btnArea.sticky').length > 0 ){
							var bottomH = $(str + ' .popCont > .btnArea.sticky').outerHeight();
						} else {
							bottomH = 20;
							$(str + ' .popCont').addClass('pb20');
						}
						var stickyH = 0;
						var maxH = winH - vGap - headerH - bottomH;
						if( maxH < $(str + ' .popBody')[0].scrollHeight ){
							$(str + ' .popBody').height( maxH );
							$(str + ' .popBody').addClass('on');
							$(str + ' .popBody').attr('tabindex','0');
						}
					}
				}
			},
			callBack : function(aa){ // 개별팝업에서 콜백 함수 호출 할수 있도록 제공.
				lp.fnCb(aa);
			},
			callBackNullClose : function (mTime){
				if(lp.fnCb != undefined && lp.fnCb != null && lp.fnCb != ""){
					lp.fnCb(null); // 콜백함수 셋팅.
				}
				lp.fnCb = null;
				lp.close(mTime);
			},
			setCallBack : function(pFn){ // 팝업 호출시 콜백 함수를 셋팅 할수 있도록 제공.
				lp.fnCb = pFn;
			}
	}
	var tip = {
			posArry : new Array(),
			make : function(){
				$('.toolTip').each(function(){
					$(this).wrap('<div class="tip"><div class="tipWrap"></div></div>');
					if( $(this).hasClass('noti') ){
						$(this).closest('.tip').addClass('noti');
					}
					if( $(this).hasClass('info') ){
						$(this).closest('.tipWrap').addClass('info');
					}
					$(this).closest('.tipWrap').prepend('<button type="button" class="icoBtn_tip" aria-label="도움말"></button>');
					$(this).addClass('tooltip').removeClass('toolTip').wrapInner('<div class="cont"></div>');
					$(this).append('<button type="button" class="icoBtn_close" aria-label="도움말 닫기"></button>');
					$(this).append('<div class="arrow"></div>');
					if( $(this).data('direction') != undefined ){
						$(this).closest('.tip').find('.icoBtn_tip').data('direction',  $(this).data('direction') );
					}
					if( $(this).data('rel') != undefined ){
						var targetEl = $( $(this).data('rel') );
						var top = $(targetEl).position().top - 2;
						var left = $(targetEl).position().left + ($(targetEl).outerWidth() - $(this).closest('.tip').find('.icoBtn_tip').width() )*0.5;
						$(this).closest('.tip').css({top:top, left:left})
					}
				});
			},
			init : function(){
				tip.make();
				for(var  i = 0 ; i < $('.tipWrap').length ; ++i ){
					if( $('.tipWrap').eq(i).hasClass('uiAct') == false ){
						$('.tipWrap').eq(i).addClass('uiAct');
						$('.tipWrap:eq('+i+') .icoBtn_tip').attr('aria-labelledby','tooltip_'+i);
						$('.tipWrap:eq('+i+') .tooltip .cont').attr('id','tooltip_'+i);
						$('.tipWrap:eq('+i+') > .icoBtn_tip').bind({
							'click':function(e){
								if($(this).hasClass('hasLink') == false ){
									e.preventDefault();
								}
								if($(this).parent().hasClass('on') == false ){
									$(this).next().attr("tabindex", -1).focus();
									$(this).parent().addClass('on');
									$(this).next().addClass('in');
									tip.open( $(this) );
								}
							},
							'mouseenter':function(e){
								if( $(this).next().hasClass('in') == false ){
									if( $('.tipWrap.on').data('autoTip') != true ){
										$('.tipWrap').removeClass('on');
										$('.tipWrap .tooltip').removeClass('in');
									}
									tip.open( $(this) );
								}
							},
							'mouseleave':function(e){
								if($(this).parent().hasClass('on') == false ){
									$(this).next().removeClass('in');
								}
							}
						});
						$('.tipWrap:eq('+i+') .icoBtn_close').bind({
							'click':function(e){
								e.preventDefault();
								tip.close( $(this) );
							}
						});
						if( $('.tipWrap:eq('+i+')').closest('.tip').hasClass('noti') ){
							$('.tipWrap:eq('+i+') > .icoBtn_tip').trigger('click');
							$('.tipWrap:eq('+i+') > .icoBtn_tip').remove();
						}
					}
				}
			},

			open : function (target){
				target.next().css('width', tip.getWidth( target.next()) );
				var yPos = target.next().outerHeight();
				target.next().css('margin-top',-yPos*0.5);
				target.next().addClass('in');
				target.next().find('.arrow').removeAttr('style');
				if( $(target).closest('.tip.bottom').length > 0 || $(target).closest('.tip.top').length > 0 ){
					target.next().find('.arrow').css('left', $(target).offset().left - 4 );
				}
				var parent = target.closest( ".wrapper" );
				if($('body').hasClass('popOn') == true ){
					parent = target.closest( ".popBody" );
				}
				if(parent == undefined){
					parent = target.closest( ".popCont" );
					if(parent == undefined){
						tip.getPosRect(target);
					} else {
						tip.getPosRect(target, parent);
					}
				} else {
					tip.getPosRect(target, parent);
				}
				//$('body').addClass('tipOpen');
			},

			close : function (target){
				target.parent().parent().removeClass('on');
				target.parent().removeClass('in');
				if( target.closest('.tip').hasClass('noti') ){
					target.closest('.tip').remove();
				}
				//$('body').removeClass('tipOpen');
			},

			getWidth : function(target){
				var className = String( target.attr('class') );
				var num = className.indexOf("col_");
				if( num > -1 ){
					var result = Number( className.substr(num + 4, 2) );
					//$(target).removeClass('col_'+result);
					var contWidth = $( "body" ).outerWidth();
					var percent = 0.0833333 * result * contWidth;
					if( $(window).width() < 768 ){
						$(target).prev().data('direction','bottom');
						if( $('body').outerHeight() - 50 < $(target).outerHeight() + $(target).prev().offset().top ){
							$(target).prev().data('direction','top');
						}
						percent = $(window).width() - 24;
					}
					return percent;
				} else {
					//return 400; /*짤리는 문제 때문에 우선 주석처리하고 css로 해결해봄. 지켜봐야함*/
				}
			},

			getPosRect : function(target, $parent){
				tip.posArry = [];
				var parent = $('body');
				console.log( "parent : " + $(parent).length );
				var offset = target.offset();
				var posY = offset.top - $(window).scrollTop();
				//console.log("posY : " + posY );
				var posX = offset.left - $(window).scrollLeft();
				if($(target).closest('.popCont').length > 0 )parent = $(target).closest('.popCont');
				var parentOffset = parent.offset();
				var parentPosY = parentOffset.top - $(window).scrollTop();
				var parentPosX = parentOffset.left - $(window).scrollLeft();
				var boxW = target.next().outerWidth();
				var boxH = target.next().outerHeight();
				if( $(target).data('direction') == undefined ){
					var code = chkPos();
				} else {
					code = $(target).data('direction');
				}
				function chkPos(){
					tip.posArry = ['right','left','top','bottom'];
					var removeCode;
					// rightChk
					if( posX + boxW > parentPosX + parent.outerWidth() - 40 ){
						//console.log("기본 체크 : 오른쪽에서 걸린다");
						removeCode = tip.posArry.indexOf("right");
						if(removeCode > -1)tip.posArry.splice(removeCode,1);
					} else {
						chkVPos("right");
					}
					//topChk
					if( posY - boxH - 30 < $('.header').height() ){
						//console.log("기본 체크 : 위쪽에서 걸린다 : ");
						removeCode = tip.posArry.indexOf("top");
						if(removeCode > -1)tip.posArry.splice(removeCode,1);
						//console.log("탑지우는거냐?????");
						//console.log("?????????????????????" + tip.posArry );
					} else {
						chkHPos('top');
					}
					// leftChk
					if( posX - boxW -15 < parentPosX ){
						//console.log("기본 체크 : 왼쪽에서 걸린다");
						removeCode = tip.posArry.indexOf("left");
						if(removeCode > -1)tip.posArry.splice(removeCode,1);
					} else {
						chkVPos("left");
					}

					//bottomChk
					if( posY + boxH  > $(window).height() ){
						//console.log("기본 체크 : 아래쪽에서 걸린다");
						removeCode = tip.posArry.indexOf("bottom");
						if(removeCode > -1)tip.posArry.splice(removeCode,1);
						if(tip.posArry.length == 0) tip.posArry.push('right');
					} else {
						chkHPos("bottom");
					}

					return tip.posArry[0];
				}

				function chkVPos(removeDirection){
					if(parent.attr('id') == 'content'){
						var targetPos = $('.header').height();
					} else {
						targetPos = parentPosY;
					}
					if( posY - boxH*0.5 + 40 < targetPos ){
						removeCode = tip.posArry.indexOf(removeDirection);
						if(removeCode > -1)tip.posArry.splice(removeCode,1);
						var removeCode2 = tip.posArry.indexOf("top");
						if(removeCode2 > -1)tip.posArry.splice(removeCode2,1);
						if(tip.posArry.length == 0) tip.posArry.push(removeDirection);
					}
					if( posY + boxH*0.5  > $(window).height()){
						//console.log("vCheck : 아래에서 걸린다" + removeDirection );
						removeCode = tip.posArry.indexOf(removeDirection);
						if(removeCode > -1)tip.posArry.splice(removeCode,1);
						var removeCode2 = tip.posArry.indexOf("bottom");
						if(removeCode2 > -1)tip.posArry.splice(removeCode2,1);
						if(tip.posArry.length == 0) tip.posArry.push(removeDirection);
					}

				}

				function chkHPos(removeDirection){
					//console.log("chkHPos : " + removeDirection );
					if( posX + boxW*0.5 > parentPosX + parent.outerWidth() ){
						//console.log("chkHPos : 오른쪽에서 걸린다");
						removeCode = tip.posArry.indexOf(removeDirection);
						if(removeCode > -1)tip.posArry.splice(removeCode,1);
					} else {
						chkVPos("right");
					}
					if( posX - boxW*0.5 -15 < parentPosX ){
						//console.log("chkHPos : 왼쪽에서 걸린다");
						removeCode = tip.posArry.indexOf(removeDirection);
						if(removeCode > -1)tip.posArry.splice(removeCode,1);
					} else {
						chkVPos("left");
					}
				}
				function setTipLayout(type){
					if( type == "left" ){
						target.parent().parent().removeClass('top left bottom right');
						target.parent().parent().addClass('left');
						target.next().css('left', -boxW);
					} else if( type == "bottom" ){
						target.parent().parent().removeClass('top left bottom right');
						target.parent().parent().addClass('bottom');
						target.next().css('margin-top', 'auto');
						target.next().css('left', -boxW*0.5);
						if( $(window).width() < 768 ){
							target.next().css('left', -$(target).offset().left );
						}
					} else if( type == "top" ){
						target.parent().parent().removeClass('top left bottom right');
						target.parent().parent().addClass('top');
						target.next().css('margin-top', 'auto');
						target.next().css('left', -boxW*0.5);
						if( $(window).width() < 768 ){
							target.next().css('left', -$(target).offset().left );
						}
					} else if( type == "right" ){
						target.parent().parent().removeClass('top left bottom right');
						target.next().css('margin-top', -target.next().outerHeight()*0.5);
						target.next().css('left', 0);
					}
				}
				//console.log("최종코드 : " + code);
				setTipLayout(code);
			}


	}
	if(!Array.indexOf){
		Array.prototype.indexOf = function(obj){
			for(var i=0; i<this.length; i++){
				if(this[i]==obj){
					return i;
				}
			}
			return -1;
		};
	}
	var analysis = {
			// IE Check
			checkIE : function () {
				if( /*@cc_on!@*/false && document.documentMode === 10 ){
					document.documentElement.className += ' ie10';
				}
				var agent = navigator.userAgent.toLowerCase();
				if( navigator.appName == "Netscape" && agent.indexOf('edge') !== -1 ){
					return true;
				}
				if( (navigator.appName == "Netscape" && agent.indexOf('trident') != -1 ) || (agent.indexOf("msie") != -1 ) ){
					return true;
				} else {
					return false;
				}
			},
			// IE analysis
			get_version_of_IE : function() {
				var word;
				var version = "N/A";
				var agent = navigator.userAgent.toLowerCase();
				var name = navigator.appName;
				// IE old version ( IE 10 or Lower )
				if ( name == "Microsoft Internet Explorer" ) word = "msie ";
				else {
					// IE 11
					if ( agent.search("trident") > -1 ) word = "trident/.*rv:";
					// Microsoft Edge
					else if ( agent.search("edge/") > -1 ) word = "edge/";
				}
				var reg = new RegExp( word + "([0-9]{1,})(\\.{0,}[0-9]{0,1})" );
				if (  reg.exec( agent ) != null  ) version = RegExp.$1 + RegExp.$2;
				return version;
			},
			getBody : function(){
				var html = 'html';
				if( analysis.checkIE() == true ){
					if( Number(analysis.get_version_of_IE() ) > 11 ){
						html = 'body';
					}
				}
				return html;
			},
			ieVersionChk : function(){
				if(ieV == "8.0" || ieV == "9.0"){
					oldIE = true;
				}
				if(ieV == "8.0") {
					ie8 = true;
				}
			},
			// Chrome Version Check
			chromeCheck : function(){
				var browser_version = "N/A";
				var min_chromeVer	= 60; // Old Chrome 버전 기준
				var ui_isChrome 	= /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
				if( ui_isChrome == true ){
					isChrome = true;
					$('body').addClass('isChrome');
					browser_version = analysis.getChromeVersion();
					if(browser_version < min_chromeVer){
						$('body').addClass('oldChrome');
					}
				}
			},
			getChromeVersion : function (){
				var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
				return raw ? parseInt(raw[2],10):false;
			},
			// fireFox check
			ffCheck : function(){
				return typeof InstallTrigger !== 'undefined';
			},
			// Safari check
			safariChk : function (){
				var ua = navigator.userAgent.toLowerCase();
				if(ua.indexOf('safari') != -1){
					if(ua.indexOf('chrome') == -1 ){
						$('body').addClass('oldChrome safari');
					}
				}
			},
			// Mobile Check
			checkMobileDevice : function () {
				var mobileKeyWords = new Array('Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows CE', 'MOT', 'SonyEricsson');//'SAMSUNG', 'LG',
				for (var info in mobileKeyWords) {
					if(navigator.userAgent.match(mobileKeyWords[info]) != null) {
						return true;
					}
				}
				return false;
			},
			// IOS Check
			checkIOSDevice : function () {
				var mobileKeyWords = new Array('iPhone', 'iPad', 'iPod');
				for (var info in mobileKeyWords) {
					if(navigator.userAgent.match(mobileKeyWords[info]) != null) {
						return true;
					}
				}
				return false;
			},

			// get Browser Scroll Width
			getScrollbarWidth : function () {
				var outer = document.createElement("div");
				outer.style.visibility = "hidden";
				outer.style.width = "100px";
				outer.style.msOverflowStyle = "scrollbar";
				document.body.appendChild(outer);
				var widthNoScroll = outer.offsetWidth;
				outer.style.overflow = "scroll";
				var inner = document.createElement("div");
				inner.style.width = "100%";
				outer.appendChild(inner);
				var widthWithScroll = inner.offsetWidth;
				outer.parentNode.removeChild(outer);

				return widthNoScroll - widthWithScroll;
			},
			browserScollWSet : function(){
				var pdR = analysis.getScrollbarWidth();
				var css = 	'<style type="text/css">'+
							'	body.hasScroll.windowPop.popOn, body.hasScroll.windowPop.popOn .popCont > .btnArea {padding-right:'+pdR+'px !important}'+
							'	html:not(.popFullScroll) body.hasScroll {padding-right:'+pdR+'px !important}'+
							'	html:not(.popFullScroll) body.hasScroll .header.sticky {padding-right:'+pdR+'px !important}'+
							'</style>';
				$('head').append( css );
			},
			init : function(){
				isMobile = analysis.checkMobileDevice();
				isIOS = analysis.checkIOSDevice();
				if(isMobile)$('html, body').addClass('isDevice');
				if(isIOS)$('html, body').addClass('isIOS');
				// 모드체크
				var url = window.location.href;
				if( window.location.href.indexOf('?') >= 0 ){
					var pureURL = String(window.location.href).substr(0, window.location.href.indexOf('?'));
				} else {
					pureURL = window.location.href;
				}
				if( pureURL.indexOf('.html') >= 0 ){
					jQueryMode = true;
				}
			}
	}
	t.layout 		= layout; // Layout 관련
	t.gnb 			= gnb; // GNB 관련
	t.tip 			= tip; // tooltip
	t.ui 			= ui; // UI Component
	t.lp 			= lp; // 레이어 팝업
	t.wa 			= wa; // 접근성 관련
	t.markup		= markup; // 마크업 관련
	t.analysis 		= analysis; // Browser analysis
})(this);

//======================================================================================================파라메타 가져오기
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$.fn.outerHTML = function(){
	var el = $(this);
	if( !el[0] ) return "";
	if( el[0].outerHTML ){
		return el[0].outerHTML;
	} else {
		var content = el.wrap('<p/>').parent().html();
		el.unwrap();
		return content;
	}
}

//숫자 애니메이션
$.fn.aniText = function(_val){
	var numVal = _val;
	var target = $(this);
	$(target).addClass('numAni');
	if( $(target).prev().is('input') == false || $(target).prev().length == 0 || $(target).prev() == undefined ){
		var id = $(target).attr('id');
		if( id == "" || id == undefined ){
			id = 'aniNumID' + ui.aniNumCnt;
			ui.aniNumCnt++;
		}
		$(target).before('<input type="hidden" id="'+id+'_' + 'hiddenIpt">');
		$(target).after('<em style="display:inline-block; padding:0; margin-right: -1px; width:1px;" aria-hidden="true">&nbsp;</em>');
		$(target).numberAnimate( {animationTimes : [300, 1000, 300]} );
		$(target).prev().on('change',function(e){
			$(this).next().numberAnimate( 'set', $(this).val() );
		});
	}

	$(target).attr( 'aria-label', numVal );
	$(target).find('*').attr('aria-hidden', true);
	setTimeout(function(){
		$(target).prev().val(numVal).trigger('change');
	},100);
}

$(document).ready(function(){
	analysis.init();
	if( getParameterByName('webLink') == 'y' ){
		$('.header .icoBtn_appMenu').remove();
		if( getParameterByName('back') != 'y' ){
			$('.header .icoBtn_appPage').remove();
		}
	}


	if( getParameterByName('jQuery') == 'n' ){
		jQueryMode = false;
	} else {
		var vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh',vh+'px');
		winH = $(window).height();
	}
	if( window.location.href.indexOf('.html') > -1 ){
		pubMode = true;

		/* 임시로 추가했습니다 */
		if( $('.content').length > 0 ){
			if( $('header h1').length > 0 ){
				$('title').text( $('header h1').text() );
				$('header .icoBtn_appLogo').attr('disabled',true);
			}
		} else if( $('.bottomSheet header').length > 0 ){
			$('title').text( $('.bottomSheet h1').text() );
		} else if( $('.popup header').length > 0 ){
			$('title').text( $('.popup header h1').text() );
		}
		/* 임시로 추가했습니다 */
	}
	layout.ready();
});



