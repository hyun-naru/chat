// Analysys
var winW 			= 0; 	 // Window width
var winH 			= 0; 	 // Window Height
var oldIE 			= false; // IE 9이하
var ie8 			= false; // IE8
var isMobile		= false; // 모바일
var isIOS			= false; // IOS
var isIE;					 // 익스플로러
var isChrome		= false; // Chrome, edge 최신버전 체크
var isFF			= false; // FireFox 체크
var ieV;					 // IE version

//================================================================================ ui function
(function(t){
	var layout = {
    state : false, // layout init 실행 상태
    init : function(){
      if( layout.state == false ){
        layout.state = true;
        console.log('layout init 실행');
        winW = $(window).width();
        winH = $(window).height();
        ui.init();
				wa.tabFocus();
				layout.firstTabActive();
				$('html').addClass('ready');
				if($('.mainTop .inner').find('.messageWrap').length == 0){
					$('.mainTop').addClass('noSwiper');
				}
      }
    },
    // resizeEvent
    resizeEvent : function(){
      winW = $(window).width();
    },
		firstTabActive: function(){
			var tabIdx = getParameterByName('activeTab');
			if( tabIdx != "" ){
				console.log("tabIdx : " , tabIdx );
				$('.tabList:eq(0) > li:eq(' + tabIdx + ') > a').trigger('click');
			}
		}
	}
	var ui = {
			init : function(){
				if( layout.state == true ){
					ui.comboBoxInit();
					ui.tabInit();
					ui.iptInit();
					ui.accoInit();
					ui.setBtnAddInit();
					ui.tblInit();
					ui.swiperInit();
					ui.swiperUpdate();
					ui.treemenuInit();
					ui.dataWrapInit();
					tip.init();
					wa.update();
				}
			},
			calendarOpen: function(target){
				var iptDate = $(target).prev();
				if( $(iptDate).prop('disabled') == false && $(iptDate).prop('readonly') == false ){
					// 여기에서 개발쪽 달력 오픈 함수를 id나 객체와 함께 콜 하시면 됩니다.
					alert('개발팀에서 개발한다고 한 달력레이어 함수호출 : '+ $(iptDate).attr('id') );
				}
			},
			// input init
			iptInit : function(){
				$('.ipt:checkbox, .ipt:radio, select.ipt, textarea.ipt, .ipt[type=file], .ipt[type=password], .asSlt.ipt, .setPhone .ipt[type=tel], .setCard .ipt[type=tel], .srchBar .ipt, .keypad.letter1 .ipt, .setCard input.ipt, .setDriver input.ipt, .setNum input.ipt ').addClass('notDel');
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
				// view Button
				$('.icoBtn_view').each(function(){
					if( $(this).hasClass('uiAct') == false ){
						$(this).addClass('uiAct');
						$(this).bind({
							'click': function(e){
								var ipt = $(e.target).closest('.keypad').find('.ipt');
								if( $(ipt).prop('disabled') == false && $(ipt).prop('readonly') == false ){
									if( $(ipt).attr('type') == 'password' ){
										$(ipt).attr('type', 'text');
									} else {
										$(ipt).attr('type', 'password');
									}
								}
							}
						})
					}
				});

				for(var i = 0; i < $('.ipt').length ; ++i ){
					if( $('.ipt').eq(i).hasClass('uiAct') == false ){
						$('.ipt').eq(i).addClass('uiAct');
						// month picker
						if( $('.ipt').eq(i).hasClass('month') ){
							mp.init( $('.ipt').eq(i) );
						}
						// Delete
						if( $('.ipt').eq(i).hasClass('notDel') == false ){
							ui.iptDelInit( $('.ipt').eq(i) );
						}
						// textarea
						if( $('.ipt').eq(i).is('textarea') == true ) {
							if( $('.ipt').eq(i).closest('.iptWrap').length > 0 ){
								$('.ipt').eq(i).closest('.iptWrap').addClass('textarea');
							}
						}

					}
					// Unit
					if( $('.ipt').eq(i).data('unit') != undefined ){
						ui.iptUnitInit( $('.ipt').eq(i) );
					}
					// setBtnAdd
					ui.setBtnAddInit();
				}

				$('.isIE input:file').bind({
					'focusin':function(){
						$(this).next('label').addClass('on');
					},
					'focusout':function(){
						$(this).next('label').removeClass('on');
					}

				});
				$('.isIE .fileWrap input').bind({
					'click':function(){
						$(this).prev('input').trigger('click');
					}
				});
			},
			// ipt Delete init
			iptDelInit : function( target ){
				var delTxt = '해당 필드 입력값 삭제';
				if( $(target).closest('.iptWrap').length == 0 ){
					$(target).wrap('<div class="iptWrap">');
				}
				// 추후 jQuery UI의 datepicker를 사용한다면 삭제할 구문(s)
				if( $(target).hasClass('date') ){
					$(target).after('<button type="button" class="icoBtn_calendar" onclick="ui.calendarOpen(this)"><span class="blind">달력 레이어 열기</span></button>');
				}
				// 추후 jQuery UI의 datepicker를 사용한다면 삭제할 구문(e)
				$(target).parent().append('<button class="icoBtn_del"><span class="blind">'+delTxt+'</span></button>');
				var wid = $(target).attr('class').replace('uiAct','').replace('ipt','');
				$(target).parent().addClass( wid );
				if( $(target).hasClass('full') ) $(target).parent().addClass('full');
				var delBtn = $(target).parent().find('.icoBtn_del');
				if( parseInt($(target).css('margin-right')) != 0 && $(target).hasClass('full') == false ){
					$(delBtn).addClass('hasMargin');
				}
				$(delBtn).attr('tabindex',-1);
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

				// searchBox
				if( $(target).closest('.searchBox').length > 0 && $(target).closest('.setHalf').length > 0 ){
					$(target).bind({
						'focusin': function(e){
							$(e.target).closest('.setHalf').find('.keypad .ipt').addClass('on');
						},
						'focusout': function(e){
							$(e.target).closest('.setHalf').find('.keypad .ipt').removeClass('on');
						}
					});
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
				var pdR = $(target).closest('.iptWrap').find('span.unit').outerWidth();
				if( pdR > 20 ){
					$(target).css(type, pdR);
					var delPdR = pdR - 36;
					if( delPdR < 5 ) {
						delPdR = 5;
					}
					$(target).closest('.iptWrap').find('.icoBtn_del').css('right', delPdR);
				}
			},
			setBtnAddInit : function(){
				$('.setBtnAdd').each(function(){
					var pdr = $(this).find('[class^=btn_].m').outerWidth() + 8;
					$(this).css( 'padding-right', pdr );
				});
				// $('.setHalf').each(function(){
				// 	if( $(this).find('.sign').length == 0 ){
				// 		$(this).addClass('join');
				// 	}
				// });
				$('.btnArea').each(function(){
					var num = 0;
					for( var i = 0 ; i < $(this).find(':input, a').length ; ++i ){
						if( $(this).find(' > [class^=btn_]:eq('+i+')').is(':visible') == true ){
							num++;
						} else if( $(this).find('> span > [class^=btn_]:eq('+i+')').is(':visible') == true ){
							num++;
						}
					}
					for( var i = 0 ; i < $(this).find(':input, a').length ; ++i ){
						if( $(this).find(' > [class^=btn_]:eq('+i+')').is('span') == false )$(this).find(' > [class^=btn_]:eq('+i+')').wrap('<span/>');
					}
					if( num > 1 )$(this).addClass( 'num' + num );
					num = 0;
				});
				$('.popWrap.nowOpen.fullPop').each(function(){
					if( $(this).find('.popup > .btn_wrap.sticky').length > 0 ){
						$(this).addClass('hasPopSticky');
					}
				});
			},

			tblInit : function(){
				$('.tabl_area:not(.fake)').each(function(){
					if( $(this).data('tbody') != undefined && $(this).closest('.fakeTheadWrap').length == 0 ){
						$(this).css( {maxHeight: $(this).data('tbody')} );
						var hasClasses = $(this).attr('class').replace('tabl_area', '');
						$(this).attr('class', 'tabl_area');
						$(this).wrap('<div class="fakeTheadWrap rel '+hasClasses+'"></div>');
						var fakeWrap  = $(this).closest('.fakeTheadWrap');
						$(fakeWrap).css( {maxHeight: $(this).data('tbody')} );
						$(fakeWrap).append( '<div class="fake thead tabl_area" aria-hidden="true"><table>'+$(this).find('colgroup').outerHTML() + $(this).find('thead').outerHTML()+'</table></div>' );
						$(fakeWrap).append( '<div class="fake tfoot tabl_area" aria-hidden="true"><table>'+$(this).find('colgroup').outerHTML() + $(this).find('tfoot').outerHTML()+'</table></div>' );
						if( $(fakeWrap).find('.fake.thead').find('thead .ipt').length > 0 ){
							$(fakeWrap).find('.fake.thead').find('thead .ipt').each(function(){
								$(this).attr('id', $(this).attr('id')+'_fake' );
								$(this).next().attr('for', $(this).attr('id'));
							});
							$(fakeWrap).find('.fake.thead').addClass('eventsOn');
							$(fakeWrap).find('.fake.thead .ipt').each(function(){
								$(this).bind({
									'change': function(e){
										if( $(this).is(':checked') ){
											$(fakeWrap).find(' > .tabl_area .ipt').prop('checked', true );
										} else {
											$(fakeWrap).find(' > .tabl_area .ipt').prop('checked', false );
										}
									}
								});
							});
							var tbodyIpt = $(fakeWrap).find('.tabl_area').first().find('tbody .ipt');
							$(fakeWrap).on( 'change', 'tbody .ipt', function(e){
								if( $(e.target).closest('tbody').find('.ipt:checked').length == $(e.target).closest('tbody').find('.ipt').length ){
									$(e.target).closest('.fakeTheadWrap').find('.fake.thead thead .ipt').prop('checked', true);
								} else {
									$(e.target).closest('.fakeTheadWrap').find('.fake.thead thead .ipt').prop('checked', false);
								}
							})
						}
					} else {
						var fakeWrap = $(this).closest('.fakeTheadWrap');
						$(fakeWrap).find('.fake.tfoot tfoot').remove();
						$(fakeWrap).find('.fake.tfoot table').append( $(fakeWrap).find('> .tabl_area tfoot').outerHTML() );
					}
				})
			},

			// swiper Init
			swiperIdCnt : 0,
			swiperInit : function(){
				$('.swiperWrap').each(function(idx){
					var visibleState = true;
					var swiper;
					if( $('.swiperWrap:eq('+idx+')').attr('id') == undefined ){
						$('.swiperWrap:eq('+idx+')').attr('id', 'swiper'+ui.swiperIdCnt );
						ui.swiperIdCnt++;
					}
					// if( $('.swiperWrap:eq('+idx+')').closest('.popWrap').length > 0 && $('.swiperWrap:eq('+idx+')').hasClass('swiperReady') == false ){
					// 	$('.swiperWrap:eq('+idx+')').addClass('on');
					// } else if( $('.swiperWrap:eq('+idx+')').hasClass('swiperReady') ){
					// 	$('.swiperWrap:eq('+idx+')').removeClass('on');
					// }
					// if( $('.winPop').length > 0 ){
					// 	$('.swiperWrap:eq('+idx+')').removeClass('on');
					// }
					if( $('.swiperWrap:eq('+idx+')').hasClass('on') == false ){
						if( $('.swiperWrap:eq('+idx+')').find('> .slideList > *').length > 1 ){
							if( $('.swiperWrap:eq('+idx+')').find('.swiper-container').length == 0 ){
								$('.swiperWrap:eq('+idx+')').wrapInner('<div class="swiper-container"/>');
							}
							var targetWrap = $('.swiperWrap:eq('+idx+')');
							if( $(targetWrap).is(':visible') == false ){
								console.log( "$(targetWrap).is(':visible') : " + $(targetWrap).is(':visible') );
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
							dataSet( $(targetWrap), 'direction', 'horizontal' );
							console.log( $(targetWrap).data('direction') );
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
								$(targetWrap).addClass('off');
								$(targetWrap).find('.btnNext, .btnPrev').addClass('hidden');
								$(targetWrap).data('loop', false );
								$(targetWrap).data('auto', false );
							}
							if( $(targetWrap).data('scrollbar') != false ) {
								$(targetWrap).append('<div class="swiper-scrollbar"></div>');
							}
							var swiperOpt = {
								effect : $(targetWrap).data('fade'),
								init : false,
								direction : $(targetWrap).data('direction'),
								speed : $(targetWrap).data('speed'),
								loop : $(targetWrap).data('loop'),
								autoHeight : $(targetWrap).data('autoHeight'),
								//slidesPerView : $(targetWrap).data('perView'),
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
								breakpoints: {
									767:{
										allowTouchMove : true,
										followFinger : true,
										slidesPerView: 1
									},
									3000:{
										allowTouchMove : false,
										followFinger : false,
										slidesPerView: $(targetWrap).data('perView')
									}
								},
								scrollbar : {
									el: '.swiper-scrollbar',
									//draggable: true,
									hide: false
								}
							}
							if( $(targetWrap).data('auto') != false ) {
								swiperOpt.autoplay = {
									delay : $(targetWrap).data('auto'),
									disableOnInteraction : !$(targetWrap).data('auto')
								}
							}
							if( oldIE == false ){
								swiper = new Swiper(target, swiperOpt);
								$(targetWrap).find('.swiper-pagination').attr('aria-label','총 '+totalNum+'슬라이드 중  1번째 슬라이드');
								swiper.on('slideChange', function(){
									//$(targetWrap).find('.swiper-slide a, .swiper-slide :input').show();
									//console.log("트렌지션엔드1 : " + this.activeIndex );
									$(targetWrap).find('.swiper-pagination').attr('aria-label', '총 '+ totalNum+'슬라이드 중 '+Number(this.realIndex+1) + '번째 슬라이드');
									$(targetWrap).find('.swiper-counter em').text( Number(this.realIndex+1) );
									if( $(targetWrap).hasClass('bbsPop') == true ){
										if(this.activeIndex == '1') {
											$(targetWrap).parent('.popBody').siblings('.popHead').find('.swiper-counter em').text( 1 );	
										} else {
											$(targetWrap).parent('.popBody').siblings('.popHead').find('.swiper-counter em').text( Number(this.realIndex+1) );
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
									$(targetWrap).find('.swiper-slide :input, .swiper-slide a').attr('tabindex','-1');
									$(targetWrap).find('.swiper-slide-active :input, .swiper-slide-active a').removeAttr('tabindex');
									if( $(targetWrap).data('perView') != undefined ){
										var nextLI = $(targetWrap).data('perView') - 1;
										for( var i = 0 ; i < nextLI ; ++i ){
											$(targetWrap).find('.swiper-slide-active').nextAll().slice(i,i+1).find('*').removeAttr('tabindex');
										}
									}
									setTimeout(function(){
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
												window[ mainFunc ][subFunc]( $(target).find('.swiper-slide:eq('+nowActiveEL+')') );
											} else {
												window[ $(targetWrap).data('func') ]( $(target).find('.swiper-slide:eq('+nowActiveEL+')') );
											}
										}
									},10);
									
								});
								swiper.on('init',function(){
									if( this.$el.data('display') == "false" ){
										$(this.$el).addClass('zIndexSet');
									}
									if( $(target).hasClass('colorChk') ){
										var nowActiveEL = this.activeIndex;
										swiperColorInvert( swiper.$el, nowActiveEL );
									}
									
									$(target).find('.swiper-slide :input, .swiper-slide a').attr('tabindex','-1');
									$(target).find('.swiper-slide-active :input, .swiper-slide-active a').removeAttr('tabindex');
									if( $(target).data('perView') != undefined ){
										var nextLI = $(target).data('perView') - 1;
										for( var i = 0 ; i < nextLI ; ++i ){
											$(target).find('.swiper-slide-active').nextAll().slice(i,i+1).find('*').removeAttr('tabindex');
										}
									}
								});
							} else { // IE9
								var swiperId = $('.swiperWrap:eq('+idx+')').attr('id');
								swiper = new Swiper('#'+ swiperId +' .swiper-container',{
									pagination: '#'+ swiperId +' .swiper-pagination',
									loop : $(targetWrap).data('loop'),
									speed : $(targetWrap).data('speed'),
									//slidesPerView : $(targetWrap).data('perView'),
									autoplay : $(targetWrap).data('auto'),
									paginationClickable: true,
									autoHeight: true,
									onSlideChangeEnd : function(swiper){
										if( $(targetWrap).data('loop') == true ){
											$(targetWrap).find('.swiper-counter em').text( Number(swiper.activeLoopIndex+1) );
										} else {
											$(targetWrap).find('.swiper-counter em').text( Number(swiper.activeIndex+1) );
										}
									},
									breakpoints: {
										768:{
											slidesPerView: 1
										},
										3000:{
											slidesPerView: $(targetWrap).data('perView')
										}
									}
								});
								$('#'+ swiperId +' .btnPrev').on('click', function(e){
									e.preventDefault();
									swiper.swipePrev();
								});
								$('#'+ swiperId +' .btnNext').on('click', function(e){
									e.preventDefault();
									swiper.swipeNext();
								});
							}
							if( $(targetWrap).data('number') == true ){
								$(targetWrap).find('.swiper-controls').append('<span class="swiper-counter"><em>1</em> / '+totalNum+'</span>');
								if( $(targetWrap).hasClass('bbsPop') == true ){
									$(targetWrap).parent('.popBody').siblings('.popHead').find('.swiper-controls').append('<span class="swiper-counter"><em>1</em>/'+totalNum+'</span>');
								}
								console.log('넘버 어펜드')
							}
							$(targetWrap).find('.swiper-button-play').bind({
								'click':function(e){
									if( oldIE == false ){
										swiper.autoplay.start();
									} else {
										swiper.startAutoplay();
									}
									$(this).hide();
									$(this).parent().find('.swiper-button-stop').show().focus();
								}
							});
							$(targetWrap).find('.swiper-button-stop').bind({
								'click':function(e){
									if( oldIE == false ){
										swiper.autoplay.stop();
									} else {
										swiper.stopAutoplay();
									}
									$(this).hide();
									$(this).parent().find('.swiper-button-play').show().focus();
								}
							});
							if( oldIE == false ){
								swiper.init();
								if( $('.popWrap.nowOpen .swiperWrap').length > 0 ){
									//lp.popupResize(lp.popIntervalStr);
								}
							}
							if( visibleState == false ){
							//	$(targetWrap).hide();
							}
						}
						$('.swiperWrap:eq('+idx+')').addClass('on');
						if( swiper != undefined ){
							window['ui' + $('.swiperWrap:eq('+idx+')').attr('id') ] = swiper;
							if( oldIE == false ){
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
							}
							$('.swiperWrap:eq('+idx+')').find('.btnNext, .btnPrev').removeAttr('aria-label'); // 접근성 수정 작업
						}
					} else {
						$('.swiperWrap:eq('+idx+')').addClass('on')
					}
					idx++;
				});
				function dataSet( target, attr, def ){
					if( $(target).data(attr) == undefined ){
						$(target).data(attr, def);
					}
				}
			},
			swiperUpdate : function(){
				for( var i = 0 ; i < $('.swiperWrap.on:not(.off)').length ; ++i ){
					try{
						window['ui' + $('.swiperWrap:eq('+i+')').attr('id') ].update();
					} catch(e){
						console.log(e);
					}
				}
			},
			treemenuExpanded: function(boolean){
				if( boolean ){
					$('.btn_drop.uiAct.down').each(function(){
						$(this).trigger('click');
					})
				} else {
					$('.btn_drop.uiAct:not(.down)').each(function(){
						$(this).trigger('click');
					})
				}
			},
			treemenuInit : function(){
				for( var i = 0 ; i < $('.treemenu .btn_drop').length ; ++i ){
					if( $('.treemenu .btn_drop:eq('+ i +')').hasClass('uiAct') == false ){
						$('.treemenu .btn_drop:eq('+ i +')').addClass('uiAct');
						var treeMenuBtn = $('.treemenu .btn_drop:eq('+ i +')');
						// 하위메뉴 체크
						$(treeMenuBtn).each(function(){
							if( itemChk( $(this) ) == false ){
								$(this).hide();
								$(this).text('하위메뉴 없음');
							}
						});

						$(treeMenuBtn).bind({
							'click' : function(e) {
								e.preventDefault();
								if( $(e.target).hasClass('down') ){
									$(e.target).removeClass('down');
									if( itemChk( $(e.target) ) == true ){
										$(e.target).closest('.item').next().slideDown(280);
									}
								} else {
									$(e.target).addClass('down');
									if( itemChk( $(e.target) ) == true ){
										$(e.target).closest('.item').next().slideUp(280);
									}
								}
							}
						})
					}
				}
				function itemChk(target){
					if( $(target).closest('.item').next().is('.depth3') == false && $(target).closest('.item').next().is('.depth2') == false ){
						return false;
					} else {
						return true;
					}
				}
			},

			treemenuMove: function(treemenu, direction){
				var target = $(treemenu).find('input:checked').closest('li');
				var total = $(target).siblings().length;
				var nowIdx = $(target).index();
				if( direction == 'down' ){
					if( nowIdx != total ){
						console.log( "이동 가능" );
						var nextTarget = $(target).closest('ul').find('> li:eq('+Number(nowIdx+1)+')');
						$(nextTarget).after( $(target) );
					}
				} else {
					if( nowIdx != 0 ){
						console.log( "이동 가능" );
						var prevTarget = $(target).closest('ul').find('> li:eq('+Number(nowIdx-1)+')');
						$(prevTarget).before( $(target) );
					}
				}
			},

			// dataWrap tbody
			dataWrapInit : function(){
				$('.dataWrap').each(function(){
					if( $(this).data('body') != undefined && $(this).hasClass('uiAct') == false ){
						$(this).addClass('fixHead');
						var dataHeadHeight = $(this).find('.dataHead').length * 56;
						$(this).find('.dataList').css({paddingTop : dataHeadHeight, maxHeight: $(this).data('body') + dataHeadHeight});
					}
				});
			},
			// transform select
			transSltCnt : 0,
			transSlt : function(){
				for( var i = 0 ; i < $('.transSlt').length ; ++i ){
					// select Trans iptFilt
					if( $('.transSlt:eq('+ i +')').hasClass('transAct') == false ){
						var transSlt = $('.transSlt:eq('+ i +')')
						$( transSlt ).addClass('transAct');
						if( $( transSlt ).is('select') ){
							$( transSlt ).after('<ul class="iptFilt min" id="transSlt_'+ui.transSltCnt+'"></ul>');
							$( transSlt ).find('option').each(function(idx){
								var txt= $(this).text();
								var value = $(this).val();
								if( $(this).attr('selected') == undefined ){
									$( '#transSlt_'+ui.transSltCnt ).append('<li><input type="radio" class="ipt notDel" name="transSlt_'+ui.transSltCnt+'" id="transSlt_'+ui.transSltCnt+'_'+idx+'" value="'+value+'"><label for="transSlt_'+ui.transSltCnt+'_'+idx+'">'+txt+'</label></li>');
								} else {
									$( '#transSlt_'+ui.transSltCnt ).append('<li><input type="radio" class="ipt notDel" name="transSlt_'+ui.transSltCnt+'" id="transSlt_'+ui.transSltCnt+'_'+idx+'" value="'+value+'" checked=""><label for="transSlt_'+ui.transSltCnt+'_'+idx+'">'+txt+'</label></li>');
								}
								idx++;
							});
							// select
							$( transSlt ).bind({
								'change' : function(){
									var radio = $(this).next();
									$(radio).find('.ipt[type=radio]:checked').removeAttr('checked').prop('checked',false);
									var idx = $(this).find('option:selected').index();
									$(radio).find('.ipt[type=radio]:eq('+idx+')').attr('checked',"").prop('checked',true);
									console.log('select change');
								}
							});
							// iptFilt
							$( '#transSlt_'+ui.transSltCnt ).bind({
								'change':function(){
									var value = $(this).find(":checked").val();
									$(transSlt).val(value);
									$(transSlt).trigger('change');
								}
							});
						} else if( $( transSlt ).is('ul') ){
							// iptEtcTab Trans select
							$( transSlt ).before('<select class="ipt notDel uiAct transAct" title="선택" id="transSlt_'+ui.transSltCnt+'"></select>');
							$( transSlt ).find('label').each(function(idx){
								var txt= $(this).text();
								var value = $(this).attr('for');
								if( $(this).attr('checked') == undefined ){
									$( '#transSlt_'+ui.transSltCnt ).append('<option value="'+value+'">'+txt+'</option>');
								} else {
									$( '#transSlt_'+ui.transSltCnt ).append('<option value="'+value+'" selected="">'+txt+'</option>');
								}
								idx++;
							});
							// mainTab Trans Select
							$( transSlt ).find('li > a, li > button').each(function(idx){
								var txt= $(this).text();
								var value = 'transSlt_'+ui.transSltCnt+'_'+idx;
								$(this).data('linkValue',value);
								if( $(this).attr('checked') == undefined ){
									$( '#transSlt_'+ui.transSltCnt ).append('<option value="'+value+'">'+txt+'</option>');
								} else {
									$( '#transSlt_'+ui.transSltCnt ).append('<option value="'+value+'" selected="">'+txt+'</option>');
								}
								idx++;
							});
							$( transSlt ).find('li > a, li > button').bind({
								'click' : function(e){
									var select = $(e.target).closest('ul').prev();
									var value = $(e.target).data('linkValue');
									$( select ).val(value);
									console.log('tab change');
								}
							});
							// iptEtcTab
							$( transSlt ).bind({
								'change':function(){
									var value = $(this).find(":checked").attr('id');
									var select = $(this).prev();
									$( select ).val(value);
									console.log('iptEtcTab change');
								}
							});
							// select
							$( '#transSlt_'+ui.transSltCnt ).bind({
								'change' : function(){
									var radio,tab = $(this).next();
									var idx = $(this).find('option:selected').index();
									// iptEtcTab
									$(radio).find('.ipt[type=radio]:checked').removeAttr('checked').prop('checked',false);
									$(radio).find('.ipt[type=radio]:eq('+idx+')').attr('checked',"").prop('checked',true);
									// tab
									$(radio).trigger('change');
									$(tab).find('li:eq('+idx+') > *').trigger('click');
									console.log('select change');
								}
							});

						}
						ui.transSltCnt++;
					}
				}
			},
			// accordian init Make
			accoInit : function(){
				//faq
				$('.faqList').each(function(){
					$(this).find('span[class^=ico] span:not(.blind)').attr('aria-hidden', true);
					$(this).find('.icoQ').append('<span class="blind">질문</span>');
					$(this).find('.icoA').append('<span class="blind">답변</span>');
				});

				for( var i = 0 ; i < $('.accoBtn').length ; ++i ){
					if( $('.accoBtn:eq('+i+')').hasClass('uiAct') == false ){
						$('.accoBtn:eq('+i+')').addClass('uiAct');
						if( $('.accoBtn:eq('+i+')').attr('href') == undefined && $('.accoBtn:eq('+i+')').is('a') ){
							$('.accoBtn:eq('+i+')').attr('href' , '#');
						}
						$('.accoBtn:eq('+i+')').append('<span class="waTxt">접기</span>');
						//약관 기본셋팅
						$('.termsWrap').addClass('accoItem');
						$('.termsWrap .accoBody').each(function(){
							if( $(this).hasClass('notInner') == false && $(this).find('.inner').length == 0 && $(this).find('.accoBody').length == 0 ){
								$(this).wrapInner('<div class="inner"/>');
							}
						});

						$('.accoBtn:eq('+i+')').closest('ul').find(' > *').addClass('accoItem');
						$('.accoBtn:eq('+i+')').attr({'role':'button', 'tabindex':'0', 'aria-expanded': false, 'aria-controls':'acco_'+i});
						$('.accoBtn:eq('+i+')').find('.waTxt').text('펼치기');
						if( $('.accoBody:eq('+i+')').attr('id') == undefined ){
							$('.accoBody:eq('+i+')').attr('id', 'acco_'+i );
						} else {
							$('.accoBtn:eq('+i+')').attr('aria-controls', $('.accoBody:eq('+i+')').attr('id') );
						}
						if( $('.accoBtn:eq('+i+')').closest('.accoItem').hasClass('on') ){
							//console.log("on이 있다");
							$('.accoBtn:eq('+i+')').attr('aria-expanded', true);
							$('.accoBtn:eq('+i+') .waTxt').text('접기');
							$('.accoBtn:eq('+i+')').closest('.accoItem').find('>.accoBody').show();
						}
						$('.accoBtn:eq('+i+')').bind({
							'click':function(e){
								var target = e.target;
								e.preventDefault();
								var contents = $(target).closest('.accoItem').find(' > .accoBody');
								$(target).closest('.accoItem').toggleClass('on');
								if( $(target).closest('.accoItem').hasClass('on') ){
									$(contents).stop(true, true).slideDown(300);
									$(target).attr('aria-expanded', true);
									$(target).find('.waTxt').text('접기');
									if( $(target).closest('.accoWrap').data('single') == true || $(target).closest('ul').data('single') == true ){
										$(target).closest('.accoItem').siblings('.accoItem').removeClass('on');
										$(target).closest('.accoItem').siblings('.accoItem').find('>.accoBody').stop(true, true).slideUp(300);
										$(target).closest('.accoItem').siblings('.accoItem').find('> .accoHead .accoBtn').attr('aria-expanded', false);
										$(target).closest('.accoItem').siblings('.accoItem').find('> .accoHead .accoBtn').find('.waTxt').text('펼치기');
									}
									$('.ipt.unit').each(function( idx ){
										ui.iptUnitInit( $(this) );
									});
									ui.setBtnAddInit();
									setTimeout(function(){wa.update();},500);
								} else {
									$(contents).stop(true, true).slideUp(300);
									$(target).attr('aria-expanded', false);
									$(target).find('.waTxt').text('펼치기');
								}
							}
						});
						// 약관 펼치기
						if( $('.accoBtn:eq('+i+')').closest('.accoBody').length == 0 && $('.accoBtn:eq('+i+')').closest('.termsWrap').length > 0 ){
							if( $('.accoBtn:eq('+i+')').closest('.termsWrap').data('expand') != false ){
								$('.accoBtn:eq('+i+')').trigger('click');
							}
						}
					}
				}
			},
			//comboBox init HL3 SFA 추가
			/* 24.12.16 수정 */
			comboBoxInit : function(){
			    const clickLabel = (lb, optionItems) => {
			        if (lb.parentNode.classList.contains('active')) {
			            lb.parentNode.classList.remove('active');
			            optionItems.forEach(opt => {
			                $(opt).off('click', () => {
			                    handleSelect(lb, opt);
			                });
			            });
			            
			        } else {
						if(lb.parentNode.classList.contains('formCombo')){
							const tdElement = lb.closest('.comboBox').closest('.iptWrap').closest('.td');
			        		tdElement.style.overflowX =`visible`;
						}
			        	
						setTimeout(() => {
							lb.parentNode.classList.add('active');
							
							const iptWrap = lb.closest('.comboBox').closest('.iptWrap');
							const currentWidth = iptWrap.offsetWidth;
							iptWrap.style.maxWidth = `${currentWidth}px`;
							
						}, "100");
			            
			            optionItems.forEach(opt => {
			                $(opt).off('click').on('click', () => {
			                    handleSelect(lb, opt);
			                });
			            });
			        }
			    };
			
			    const handleSelect = (label, item) => {
			        label.innerHTML = item.textContent;
			        label.parentNode.classList.remove('active');
			        
			         // 모든 optionItem에서 active 클래스 제거
			        const optionItems = item.parentNode.parentNode.parentNode.querySelectorAll('.comboBox .optionItem');
			        optionItems.forEach(opt => {
			            opt.classList.remove('active');
			        });
			
			        // 클릭한 항목에만 active 클래스 추가
			        item.classList.add('active');
			        
			        if(label.parentNode.classList.contains('formCombo')){
			        	const tdElement = label.closest('.comboBox').closest('.iptWrap').closest('.td');
			        	tdElement.style.overflowX =`hidden`;
			        }
			    };
			
			    // 외부 클릭 시 모든 콤보박스의 active 클래스 제거 함수
			    const closeAllComboBoxes = (currentLabel) => {
			        document.querySelectorAll('.comboBox').forEach(comboBox => {
			            if (comboBox.querySelector('.label') !== currentLabel) {
			                comboBox.classList.remove('active');
			            }
			        });
			    };
			
				const labels = document.querySelectorAll('.comboBox .label');
			    // 각 label에 클릭 이벤트 추가
			    labels.forEach(function(lb) {
			        $(lb).off('click').on('click', e => {
			
			            // 현재 label에 관련된 optionList와 optionItems 가져오기
			            let optionList = lb.nextElementSibling;
			            let optionItems = optionList.querySelectorAll('.comboBox .optionItem');
			            // 다른 콤보박스의 active 상태 제거
			            closeAllComboBoxes(lb);
			
			            // 클릭된 label에 대한 콤보박스 열기/닫기 토글
			            clickLabel(lb, optionItems);
			        });
			    });
			


			    // tab_bar 클릭 시 콤보박스를 닫히지 않도록 처리
			    const tabBars = document.querySelectorAll('.comboBox .tab_bar');
			    tabBars.forEach(tabBar => {
			        $(tabBar).on('click', e => {
			            e.stopPropagation(); // 이벤트 전파 방지
			            // tab_bar 클릭 시 콤보박스가 닫히지 않도록 하기 위한 처리
			            e.preventDefault();
			        });
			    });
			
			    // 옵션 리스트 외부 클릭 시 모든 콤보박스 닫기
			    $('body').off('click').on('click', () => {
			        closeAllComboBoxes();
			    });
			    
			    // .iptWrap의 부모인 .td의 width를 .iptWrap에 동적으로 적용하는 함수
			    const updateIptWrapWidth = () => {
			        document.querySelectorAll('.iptWrap.combo').forEach(iptWrap => {
			            const tdElement = iptWrap.closest('.td');  // .iptWrap의 부모인 .td 찾기
			            if (tdElement) {
			                const tdWidth = tdElement.offsetWidth;  // .td의 width 가져오기
			                iptWrap.style.maxWidth = `${tdWidth}px`;  // .iptWrap에 width 설정
			            }
			        });
			    };
			
			    // 화면 크기 변경 시 .iptWrap의 width를 갱신하도록 이벤트 리스너 추가
			    $(window).off('resize').on('resize', updateIptWrapWidth);
			
			    // 페이지 로드 시 처음 width 값을 설정
			    updateIptWrapWidth();
			    
			}, /* //24.12.16 수정 */
			// Tab init
			tabInit : function(){
				$('.tabBoxWrap, .tab_default, .tab_popup, .tab_content').addClass('tabWrap');
				$('.tabBoxList, .tab_bar').addClass('tabList');
				$('.tabBoxDisplay, .tab_cont').addClass('tabContents');
				$('.tabBoxDisplayItem, .tab_cont_list').addClass('tabPanel');
				for( var i = 0 ; i < $('.tabList').length ; ++i ){
					if( $('.tabList:eq('+i+')').hasClass('uiAct') == false ){
						$('.tabList:eq('+i+')').addClass('uiAct');
						// tab setting
						var tabFunc = false;
						if( $('.tabList:eq('+i+')').closest('.tabWrap').length > 0 ){
							tabFunc = true;
							if( $('.tabList:eq('+i+')').closest('.tabWrap').data('tabFunc') == false ){
								tabFunc = false;
							}
						}
						// 활성화 체크
						if( $('.tabList:eq('+i+') > li > a.active').length == 0 && $('.tabList:eq('+i+') > li.on').length == 0 ){
							$('.tabList:eq('+i+') > li').first().addClass('on');
							$('.tabList:eq('+i+') > li').first().find('> a').addClass('active');
						}
						// click event
						if( tabFunc == true ){
							$('.tabList:eq('+i+')').on('click',  '> li > a', function(e){
								console.log('click : ' + $(this).parent().index() )
								e.preventDefault();
								if( $(this).hasClass('disabled') == false ){
									$(this).parent().siblings().find('>a').removeClass('active');
									$(this).addClass('active');
									$(this).parent().siblings().removeClass('on');
									$(this).parent().addClass('on');
									$(this).closest('.tabWrap').find('> .tabPanel').removeClass('active');
									$(this).closest('.tabWrap').find('> .tabContents > .tabPanel').removeClass('active');
									$(this).closest('.tabWrap').find('> .tabContents > .tabPanel:eq('+ $(this).parent().index() +')').addClass('active');
									//ui.init();
								}
							});
							if( $('.tabList:eq('+i+') li > a.active').length != 0 ){
								$('.tabList:eq('+i+') li > a.active').trigger('click');
							} else {
								$('.tabList:eq('+i+') li.on > a').trigger('click');
							}
						}
					}
				}
			},
	}
	var wa = {
			nowFocusEl : new Object(),
			// init
			init : function(){
				wa.update();
			},
			update : function(){
				wa.essentialInit();
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
			essentialInit : function(){
				$('.formList .th').each(function(){
					if( $(this).hasClass('required') ){
						if( $(this).find('.required').length == 0 ){
							$(this).append('<span class="required" aria-label="필수입력">*</span>')
						}
					}
				})

				$('.itemTh .required').attr('aria-label','필수입력');
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
			eventInit : function(){
				$('body').on('keypress','label.fileAttach', function(e){
					if( e.keyCode == 13 ){
						if( $(this).next().is('input[type=file]') ){
							$(this).next().trigger('click');
						}
					}
				});
			}
	}
	var lp = {
			zIdx : 1500,
			fnCb : new Object(),  // 개별팝업에서 콜백함수를 셋팅할수 있는 함수 객체.
			closeTarget : new Object(),
			firstPopFocus : new Object(),
			// Open
			open : function (url, jsParam, jsURL, fnObj){ // jsParam(json 파라미터 객체), jsURL은 js파일
				console.log( 'lp open 실행' );
				lp.zIdx++;
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
					var str = url + " .popContain";
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
				if( $('.isDevice').length > 0 ){
					$(target).find('.popup').attr('role','dialog');
				}
				$(target).find('.popBody').attr('tabindex','0');
				lp.focusLoopInit();
				if( jsURL != undefined )$.getScript( jsURL ).done( function(){ console.log('lp.open jsURL Load Complete'); }).fail(function(){ console.log('lp.open jsURL Load Failed!!!') });

				if( $(target).find('.popup.alert').length > 0 ){
					$(target).css( 'z-index', lp.zIdx + 10000 ).removeAttr('data-idx');
					$(target).find('.popup').addClass('alert');
					$(target).addClass('alertPop');
				} else {
					$(target).addClass('fullPop');
				}
				$(target).addClass('nowOpen');
				// 기본 실행
				layout.firstTabActive();
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
				$(closeTarget).removeClass('nowOpen');
				setTimeout(function(){
					if( $(closeTarget).hasClass("removeEnabled") ){
						$(closeTarget).remove();
					}
					lp.closeComplete();
				}, mTime);
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
				var getCol = $(target).find('.popBody').attr('class');
				if( getCol != undefined ){
					console.log( "getCol : " + getCol );
					if( getCol.indexOf('col_') > -1 ){
						var replaceCol = getCol.replace('popBody','').replace('on','').replace(/ /gi, '');
						$(target).find('.popContain').addClass( replaceCol );
						$(target).find('.popBody').removeClass( replaceCol );
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
								var popWrap =  '.popWrap[data-idx='+dataIdx+'] .popup';
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
					var helpTxt = '도움말';
					// 도움말에 타이틀 제공을 위한 스크립트 (s)
					if( $(this).closest('.itemTh').length > 0 ){
						$('body').append('<div class="dummyToolTipTit">'+$(this).closest('.itemTh').html()+'</div>');
						$('.dummyToolTipTit .tipWrap, .dummyToolTipTit .tooltip').remove();
						helpTxt = $('.dummyToolTipTit').text() + ' 도움말';
						$('.dummyToolTipTit').remove()
					}
					// 도움말에 타이틀 제공을 위한 스크립트 (e)
					$(this).closest('.tipWrap').prepend('<button type="button" class="icoBtn_tip"><span>' + helpTxt + '</span></button>');
					$(this).addClass('tooltip').removeClass('toolTip').wrapInner('<div class="cont"></div>');
					$(this).append('<button type="button" class="icoBtn_close"><span>닫기</span></button>');
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
				var parent = target.closest( ".wrapper" );
				if($('body').hasClass('popOn') == true ){
					parent = target.closest( ".popBody" );
				}
				if(parent == undefined ){
					parent = target.closest( ".likeSubpage" );
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
					$(target).removeClass('col_'+result);
					var contWidth = $( "#content" ).outerWidth();
					if( $('#content').length == 0 ){
						contWidth = $('html').width();
					}
					if(contWidth > 1136 ) contWidth = 1136;
					var percent = 0.0833333 * result * contWidth;
					if( $(window).width() < 768 ){
						$(target).prev().data('direction','bottom');
						percent = $(window).width() - 20;
					}
					return percent;
				} else {
					//return 400; /*짤리는 문제 때문에 우선 주석처리하고 css로 해결해봄. 지켜봐야함*/
				}
			},

			getPosRect : function(target, $parent){
				tip.posArry = [];
				var parent = $parent;
				if(parent == undefined ){
					parent = $('#content');
				}
				if( parent.hasClass('wrapper') ){
					parent = $('#content');
				}
				var offset = target.offset();
				var posY = offset.top - $(window).scrollTop();
				//console.log("posY : " + posY );
				var posX = offset.left - $(window).scrollLeft();
				if($(target).closest('.popWrap').length > 0 )parent = $(target).closest('.popBody');
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
					if( posY + boxH*0.5  > $(window).height() - 64 ){ // 64는 푸터 크기
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

			// Old IE init
			oldIEinit : function(){
				$('html').addClass('oldIE');
			},

			// IE8 init
			ie8Init : function(){

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
							'	body.hasScroll.windowPop.popOn, body.hasScroll.windowPop.popOn .popCont > .btnArea {padding-right:'+pdR+'px !important}\n'+
							'	html:not(.popFullScroll) body.hasScroll {padding-right:'+pdR+'px !important}\n'+
							'	html:not(.popFullScroll) body.hasScroll .header {right:'+pdR+'px !important}\n'+
							'	html:not(.popFullScroll) body.hasScroll .breadcrumbs .breadcrumbs_fixed.active {right:'+pdR+'px !important}\n'+
							'	html:not(.popFullScroll) body.hasScroll .footer {right:'+pdR+'px !important}\n'+
							'	html:not(.popFullScroll) body.hasScroll .popContain {left:-'+Number(pdR*0.5)+'px !important}\n'+
							'</style>';
				$('head').append( css );
			},
			init : function(){
				ieV = analysis.get_version_of_IE();
				analysis.ieVersionChk();
				if(oldIE == true )analysis.oldIEinit();
				if(ie8 == true ){
					analysis.ie8Init();
					isMobile = false;
					isIOS = false;
				} else {
					isMobile = analysis.checkMobileDevice();
					isIOS = analysis.checkIOSDevice();
					isIE = analysis.checkIE();
					isFF = analysis.ffCheck();
					analysis.chromeCheck();
					analysis.safariChk();
					if(isIE)$('html, body').addClass('isIE');
					if(isFF)$('html, body').addClass('isFF');
					if(isMobile)$('html, body').addClass('isDevice');
					if(isIOS)$('html, body').addClass('isIOS');
				}
				analysis.browserScollWSet();
			},
	}

	t.layout 		= layout; // Layout 관련
	t.tip 			= tip; // tooltip
	t.ui 			= ui; // UI Component
	t.lp 			= lp; // 레이어 팝업
	t.analysis 		= analysis; // Browser analysis
})(this);


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


$(document).ready(function(){
	analysis.init();
	// var vh = window.innerHeight * 0.01;
	// document.documentElement.style.setProperty('--vh',vh+'px');
	// winH = $(window).height()
});
