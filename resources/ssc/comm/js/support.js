/* 하나생명 지원센터 — 이 파일 하나에 CSV 처리와 화면 동작이 있습니다.
   1. 설정  2. CSV 검증  3. 자료  4. 검색·표시  5. CSV 업로드
   빌드/설치/외부 라이브러리가 필요하지 않습니다. */
(function () {
    'use strict';

    /* 1. 반입 시 확인할 설정 (기본값 그대로면 서버 API 없이 사용)
       apiBase: 공동 저장 API를 연결할 때만 설정합니다. 예: '/sfa/support'
                GET {apiBase}/api/data, POST {apiBase}/api/import/csv
       csvFolder: 기본 CSV 11개가 있는 폴더. 서버에 놓은 CSV를 고치면 다음 조회에 반영됩니다.
       storageKey: 업로드한 CSV를 이 브라우저에 보관하는 키입니다. */
    var CONFIG = { apiBase: '', csvFolder: 'csv/', storageKey: 'hana-support-data-v1' };
    var root = document.getElementById('hana-support-app');
    if (!root || root.dataset.hanaReady === 'true') return;
    root.dataset.hanaReady = 'true';
    var app = {
        getElementById: function (id) { return root.querySelector('[id="' + id + '"]'); },
        querySelector: function (selector) { return root.querySelector(selector); },
        querySelectorAll: function (selector) { return root.querySelectorAll(selector); }
    };

    /* 2. CSV 읽기·검증·내려받기 (외부 라이브러리 없음) */
    var HanaCsv = (function () {
        'use strict';

        var tabs = [
            { id: 'simple', label: '간편예외 경증질환', filename: '간편예외_경증질환.csv', headers: ['질병코드', '질병명', '입원수술', '뇌심', '암', '사망', '경과일', '주의담보'], datasetKeys: ['SIMPLE_DISEASE_DB'] },
            { id: 'limit', label: '건강보험 가입한도', filename: '건강보험_가입한도.csv', headers: ['세부화면', '번호', '담보군', '특약명', '상위특약', '40세이하', '41~50세', '51~60세', '61~65세', '66세이상', '1급', '2급', '3급', '4급', '비위험', '최저가입금액', '가입단위', '합산기준', '세부구분', '비고'], datasetKeys: ['HANA_AGE_LIMIT', 'HANA_RISK_LIMIT', 'HANA_MERGE_AGE', 'HANA_MERGE_RISK', 'HANA_MERGE_OTHER'] },
            { id: 'special', label: '특약 보장기준', filename: '특약_보장기준.csv', headers: ['No.', '구분', '특약명', '지급사유', '지급기준', '삭감', '면책', '지급금액', '일반 비갱/갱신', '간편 비갱/갱신'], datasetKeys: ['SPECIAL_DB_NEW'] },
            { id: 'disability', label: '후유장해', filename: '후유장해.csv', headers: ['구분', '분류번호', '분류명', '장해상태', '지급률'], datasetKeys: ['DISABILITY_CATEGORIES', 'DAILY_LIFE_ITEMS'] },
            { id: 'surgery', label: '1~5종 수술', filename: '1-5종_수술.csv', headers: ['수술분류', '수술번호', '수술명', '수술종류'], datasetKeys: ['SURGERY_DB'] },
            { id: 'cardio', label: '뇌심혈관', filename: '뇌심혈관.csv', headers: ['질환구분', '질환군', '질환명', '질병코드', '특정순환계', '급여뇌심검사', '혈관조영술', '후유장해', '산정특례', '뇌혈관질환', '뇌졸중', '뇌출혈', '허혈성심장질환', '급성심근경색', '부정맥', '혈전용해'], datasetKeys: ['BRAIN_DATA', 'HEART_DATA'] },
            { id: 'documents', label: '제지급 구비서류', filename: '제지급_구비서류.csv', headers: ['업무분류', '업무명', '제출서류', '유의사항'], datasetKeys: ['DOCUMENTS_DB'] },
            { id: 'newContract', label: '신계약 구비서류', filename: '신계약_구비서류.csv', headers: ['대분류', '소분류', '항목명', '내용'], datasetKeys: ['NEW_CONTRACT_ROWS'] },
            { id: 'foreigner', label: '외국인 계약', filename: '외국인_계약.csv', headers: ['체류코드', '체류자격', '가입여부', '가입조건및안내'], datasetKeys: ['FOREIGNER_ROWS'] },
            { id: 'staff', label: '대리점 담당총무', filename: '대리점_담당총무.csv', headers: ['대리점명', '적용지점', '담당총무', '내선번호', 'FAX', '네이트온'], datasetKeys: ['STAFF_ROWS'] },
            { id: 'manual', label: '업무매뉴얼', filename: '업무매뉴얼.csv', headers: ['매뉴얼번호', '업무분류', '제목', '내용구분', '내용', '1열', '2열', '3열', '4열', '5열', '6열', '이미지참조'], datasetKeys: ['MANUAL_CSV_ROWS', 'MANUAL_DB'] }
        ];
        var limitSections = ['연령별 가입한도', '위험등급별 가입한도', '당사합산 연령별', '당사합산 위험등급별', '타사합산'];
        var manualCategories = { recruit: '위촉', before: '계약 전', newc: '신계약', review: '심사', after: '계약 후' };
        var manualKinds = ['문단', '제목', '목록', '목록시작', '주의', '안내', '표머리글', '표행', '이미지'];
        var imageNames = ['manual_img_financial.png', 'manual_img_notice.png'];
        var cardioFields = ['특정순환계', '검사', '조영술', '후유', '산정특례', '뇌혈관', '뇌졸중', '뇌출혈', '허혈성', '급성심근', '부정맥', '혈전용해'];
        var specialAvailability = ['일반/비갱신', '일반/갱신', '간편/비갱신', '간편/갱신'];
        var specialFields = ['reason', 'criteria', 'reduction', 'exemption', 'amount'];
        var specialGroups = ['주계약', '사망', '장해', '납입면제', '암진단', '암수술', '암방사선', '암약물', '암입원', '암통원', '암검사', '뇌진단', '뇌입원통원', '뇌수술치료', '심진단', '심입원통원', '심수술치료', '뇌심검사', '수술', '입원', '요양', '치매', '질병', '재해', '기타'];

        function tabFor(id) {
            var tab = tabs.find(function (item) { return item.id === id; });
            if (!tab) throw new Error('지원하지 않는 화면입니다: ' + id);
            return tab;
        }
        function dataOf(data) { return data && data.datasets ? data.datasets : (data || {}); }
        function values(value) { return Array.isArray(value) ? value : Object.keys(value || {}).map(function (key) { return value[key]; }); }
        function decodeEntities(value) {
            var named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', bull: '•', middot: '·', ndash: '–', mdash: '—', le: '≤', ge: '≥', times: '×', divide: '÷', rarr: '→', darr: '↓', uarr: '↑', deg: '°', copy: '©', reg: '®' };
            return String(value == null ? '' : value).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (all, entity) {
                if (entity.charAt(0) === '#') {
                    var number = entity.charAt(1).toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
                    return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff) ? String.fromCodePoint(number) : all;
                }
                return Object.prototype.hasOwnProperty.call(named, entity.toLowerCase()) ? named[entity.toLowerCase()] : all;
            });
        }
        function stripEmoji(value) {
            return value.replace(/[0-9#*]\uFE0F?\u20E3/gu, '').replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}]/gu, function (character) {
                return character === '○' || character === '●' ? character : '';
            }).replace(/[\uFE0F\u200D\u20E3]/g, '');
        }
        function plain(value) {
            var result = String(value == null ? '' : value)
                .replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/(?:p|div|li|tr|h[1-6])\s*>/gi, '\n')
                .replace(/<\/?(?:a|abbr|b|blockquote|caption|code|div|em|font|h[1-6]|i|img|li|ol|p|small|span|strong|table|tbody|td|th|thead|tr|u|ul)\b[^>]*>/gi, '');
            result = decodeEntities(result);
            return stripEmoji(result).replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
        }
        function escapeHtml(value) {
            return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }
        function htmlText(value) { return escapeHtml(value).replace(/\n/g, '<br>'); }
        function quoted(value) {
            var text = String(value == null ? '' : value);
            // This prefix belongs to the CSV transport only. importTab trims it before
            // validating cells, so literal bullets, signs and leading zeroes survive.
            var trimmed = text.trimStart();
            if ((/^[=+\-@]/.test(trimmed) || /^0\d+$/.test(trimmed)) && text.charAt(0) !== '\t') text = '\t' + text;
            return /[",\r\n\t]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
        }
        function stringify(rows) { return '\uFEFF' + rows.map(function (row) { return row.map(quoted).join(','); }).join('\r\n') + '\r\n'; }

        /* A strict state machine: quotes may only begin at the start of a field. */
        function parse(csv) {
            if (typeof csv !== 'string') throw new Error('CSV 파일은 UTF-8 텍스트여야 합니다.');
            if (csv.charCodeAt(0) === 0xfeff) csv = csv.slice(1);
            if (!csv) throw new Error('CSV 파일이 비어 있습니다.');
            var rows = [], row = [], field = '', state = 'start';
            function finishField() { row.push(field); field = ''; state = 'start'; }
            function finishRow() { finishField(); rows.push(row); row = []; }
            for (var i = 0; i < csv.length; i++) {
                var c = csv.charAt(i);
                if (state === 'quoted') {
                    if (c === '"') {
                        if (csv.charAt(i + 1) === '"') { field += '"'; i++; }
                        else state = 'closed';
                    } else field += c;
                    continue;
                }
                if (c === '"') {
                    if (state !== 'start') throw new Error('CSV ' + (rows.length + 1) + '행: 따옴표 위치가 올바르지 않습니다.');
                    state = 'quoted'; continue;
                }
                if (c === ',') { finishField(); continue; }
                if (c === '\n' || c === '\r') {
                    if (c === '\r') {
                        if (csv.charAt(i + 1) !== '\n') throw new Error('CSV 줄바꿈은 CRLF 또는 LF 형식이어야 합니다.');
                        i++;
                    }
                    finishRow(); continue;
                }
                if (state === 'closed') throw new Error('CSV ' + (rows.length + 1) + '행: 닫는 따옴표 뒤에는 쉼표 또는 줄바꿈만 사용할 수 있습니다.');
                field += c; state = 'unquoted';
            }
            if (state === 'quoted') throw new Error('CSV에 닫히지 않은 따옴표가 있습니다.');
            if (state !== 'start' || field || row.length) finishRow();
            return rows;
        }
        function fail(line, column, message) { throw new Error('CSV ' + line + '행 [' + column + ']: ' + message); }
        function required(value, line, column) { if (!value) fail(line, column, '필수 항목입니다.'); return value; }
        function key(value, line, column, optional) {
            if (!optional) required(value, line, column);
            if (/["'`<>\\]/.test(value)) fail(line, column, '따옴표, 역따옴표, 역슬래시 또는 꺾쇠는 사용할 수 없습니다.');
            if (['__proto__', 'constructor', 'prototype'].includes(value)) fail(line, column, '자료의 분류명으로 사용할 수 없는 예약어입니다.');
            return value;
        }
        function oneOf(value, allowed, line, column) { if (!allowed.includes(value)) fail(line, column, allowed.join(' / ') + ' 중 하나를 입력하세요.'); return value; }
        function unique(seen, value, line, column) { if (seen.has(value)) fail(line, column, '동일한 항목이 중복되었습니다.'); seen.add(value); }
        function money(value, line, column) {
            if (!value) return '';
            if (value === '-' || value === '—' || value === '불가') return value;
            if (/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value)) {
                var number = Number(value.replace(/,/g, ''));
                if (Number.isFinite(number) && number >= 0 && number <= 1e12) return number;
            }
            if (/^\d+(?:\.\d+)?\s*(?:억|만|만원|억원)$/.test(value)) return value;
            fail(line, column, '0 이상의 금액, -, 불가 또는 1억/500만과 같은 금액을 입력하세요.');
        }
        function splitLines(value) { return value ? value.split('\n') : []; }
        function normalCategory(category) {
            if (Object.prototype.hasOwnProperty.call(manualCategories, category)) return category;
            return Object.keys(manualCategories).find(function (code) { return manualCategories[code] === category; }) || category;
        }

        function specialAvail(avail, group) {
            return ['비갱신', '갱신'].map(function (kind) {
                var prefix = group + '/' + kind;
                var entry = (avail || []).map(plain).find(function (value) { return value === prefix || value.startsWith(prefix + ' (') && /\([^()\n]+\)$/.test(value); });
                return entry ? '●' + (entry.slice(prefix.length).trim() ? ' ' + entry.slice(prefix.length).trim() : '') : '○';
            }).join(' / ');
        }
        function normalSpecialGroup(group) {
            var compact = group.replace(/\s+/g, '').replace(/\//g, '');
            return specialGroups.includes(compact) ? compact : group;
        }
        // Old reference CSVs joined these three visible labels without separators.
        // Insert line breaks only; do not infer conditions, percentages or children.
        function readableLegacyCriteria(value) {
            if (value.includes('\n')) return value;
            var pattern = /(180\s*일\s*이내\s*가입|181\s*일\s*[~～]\s*1\s*년\s*이내|1\s*년\s*이상\s*가입)\s*[:：]/g;
            var labels = Array.from(value.matchAll(pattern));
            if (labels.length !== 3 || !/^180/.test(labels[0][1]) || !/^181/.test(labels[1][1]) || !/^1\s*년/.test(labels[2][1])) return value;
            return value.replace(pattern, function (label, _period, offset) { return (offset ? '\n' : '') + label; });
        }
        function specialCellSections(value) {
            var pattern = /(^|\n\n)\[([^\[\]\n]+)\]\n/g, matches = [], match;
            while ((match = pattern.exec(value))) matches.push({ index: match.index, start: pattern.lastIndex, label: match[2].trim() });
            var sections = matches.map(function (item, index) {
                return { label: item.label, value: value.slice(item.start, index + 1 < matches.length ? matches[index + 1].index : value.length).trim() };
            });
            var initial = matches.length && matches[0].index === 0 ? sections.shift() : null;
            return { original: value, base: initial ? initial.value : value.slice(0, matches.length ? matches[0].index : value.length).trim(), initial: initial, sections: sections };
        }
        function restoreSpecialSections(record, line) {
            // Only the explicit transport prefix denotes a visible parent badge.
            // Ordinary [bracketed notes] remain ordinary payment-reason text.
            var explicit = record.reason.match(/^\[세부구분: ([^\r\n]+)\]\n([\s\S]*)$/);
            var explicitLabel = explicit ? explicit[1].trim() : '';
            if (explicitLabel) {
                record.sub = explicitLabel;
                record.sub_label = explicitLabel;
                record.reason = required(explicit[2], line, '지급사유');
            }
            var parsed = specialFields.map(function (field) { return specialCellSections(record[field]); });
            var occurrences = new Map(), sectionLabels = new Set();
            parsed.forEach(function (cell) {
                var labels = new Set(cell.sections.map(function (section) { sectionLabels.add(section.label); return section.label; }));
                if (cell.initial) labels.add(cell.initial.label);
                labels.forEach(function (label) { occurrences.set(label, (occurrences.get(label) || 0) + 1); });
            });
            // A lone bracketed note is ordinary text. The transport structure must be
            // corroborated by the same child label in at least two business columns.
            var corroborated = Array.from(sectionLabels).some(function (label) { return occurrences.get(label) >= 2; });
            if (!corroborated) { record.criteria = readableLegacyCriteria(record.criteria); return record; }

            var first = parsed[0].initial;
            var parent = first && !sectionLabels.has(first.label) ? first.label : '';
            var children = new Map();
            parsed.forEach(function (cell, fieldIndex) {
                var field = specialFields[fieldIndex], sections = cell.sections.slice(), base = cell.base;
                if (cell.initial) {
                    if (parent && cell.initial.label === parent) {
                        // The first labeled block is the parent, not an extra child.
                    } else if (sectionLabels.has(cell.initial.label)) {
                        sections.unshift(cell.initial); base = '';
                    } else if (parent) {
                        fail(line, tabs[2].headers[fieldIndex + 3], '각 열의 첫 상위 구간명을 동일하게 입력하세요.');
                    } else {
                        base = '[' + cell.initial.label + ']\n' + base;
                    }
                } else if (parent && cell.original === '[' + parent + ']') base = '';

                var seenLabels = new Set();
                sections.forEach(function (section) {
                    if (!section.label) fail(line, tabs[2].headers[fieldIndex + 3], '구간명을 비워둘 수 없습니다.');
                    if (section.label === parent || seenLabels.has(section.label)) fail(line, tabs[2].headers[fieldIndex + 3], '같은 구간명이 한 열에 중복되었습니다: ' + section.label);
                    seenLabels.add(section.label);
                    var child = children.get(section.label);
                    if (!child) {
                        child = { sub: section.label, reason: '', criteria: '', reduction: '', amount: '' };
                        children.set(section.label, child);
                    }
                    child[field] = section.value;
                });
                record[field] = base;
            });
            record.sub = parent || explicitLabel;
            record.sub_items = Array.from(children.values());
            return record;
        }
        function flattenSpecial(record, field) {
            var first = plain(record[field]);
            var children = (record.sub_items || []).filter(function (child) { return child.reason || child.sub; });
            if (!children.length) return field === 'reason' && plain(record.sub_label) ? '[세부구분: ' + plain(record.sub_label) + ']\n' + first : first;
            var label = plain(record.sub);
            var parts = [label ? '[' + label + ']\n' + first : first];
            children.forEach(function (child) {
                var childValue = plain(child[field]);
                var childLabel = plain(child.sub);
                if (childValue) parts.push((childLabel ? '[' + childLabel + ']\n' : '') + childValue);
            });
            var result = parts.filter(Boolean).join('\n\n');
            return field === 'reason' && plain(record.sub_label) ? '[세부구분: ' + plain(record.sub_label) + ']\n' + result : result;
        }

        function rowsForTab(id, supplied) {
            var data = dataOf(supplied), rows = [];
            tabFor(id);
            if (id === 'simple') rows = values(data.SIMPLE_DISEASE_DB).map(function (r) { return [r.code, r.name, r.입원수술, r.뇌심, r.암, r.사망, r.경과일, (r.warnFields || []).join(', ')]; });
            if (id === 'limit') {
                tabs[1].datasetKeys.forEach(function (dataset, section) {
                    var parent = '', branch = '', group = '';
                    (data[dataset] || []).forEach(function (r) {
                        var mergeAge = section === 2, name = plain(r.name), rowParent = r.parent || '';
                        if (r.group) group = r.group;
                        if (/^[├└]/.test(name)) {
                            rowParent = rowParent || parent + (branch && !/^└\s*\[간편/.test(name) ? ' > ' + branch : '');
                            if (/^└\s*\[간편/.test(name)) branch = name;
                        } else { parent = name; branch = ''; }
                        rows.push([limitSections[section], r.num, section < 2 ? group : '', r.name, rowParent, r.a40, mergeAge ? r.a50 : r.a41, mergeAge ? r.a60 : r.a51, mergeAge ? r.a65 : r.a61, r.a66, r.r1, r.r2, r.r3, r.r4, r.rn, r.min, r.unit, r.basis, r.type, r.note]);
                    });
                });
            }
            if (id === 'special') rows = (data.SPECIAL_DB_NEW || []).map(function (r) { return [r.num, r.group, r.name, flattenSpecial(r, 'reason'), flattenSpecial(r, 'criteria'), flattenSpecial(r, 'reduction'), flattenSpecial(r, 'exemption'), flattenSpecial(r, 'amount'), specialAvail(r.avail, '일반'), specialAvail(r.avail, '간편')]; });
            if (id === 'disability') {
                (data.DISABILITY_CATEGORIES || []).forEach(function (r) { (r.items || []).forEach(function (item) { rows.push(['장해기준', r.number, r.title, item.name, item.rate]); }); });
                var dailyType = '';
                (data.DAILY_LIFE_ITEMS || []).forEach(function (r) { if (r.type) dailyType = r.type; rows.push(['일상생활기본동작', '', dailyType, r.description, r.rate]); });
            }
            if (id === 'surgery') rows = values(data.SURGERY_DB).map(function (r) { return [r.category, r.number, r.name, /^[1-5](?:\.0)?$/.test(String(r.type)) ? String(parseInt(r.type, 10)) + '종' : r.type]; });
            if (id === 'cardio') ['BRAIN_DATA', 'HEART_DATA'].forEach(function (dataset, index) { var group = ''; (data[dataset] || []).forEach(function (r) { if (r.group) group = r.group; rows.push([index === 0 ? '뇌' : '심장', group, r.name, r.code].concat(cardioFields.map(function (field) { return r[field]; }))); }); });
            if (id === 'documents') Object.keys(data.DOCUMENTS_DB || {}).forEach(function (category) { data.DOCUMENTS_DB[category].forEach(function (r) { rows.push([category, r.name, (r.documents || []).join('\n'), (r.notes || []).join('\n')]); }); });
            if (id === 'newContract') rows = (data.NEW_CONTRACT_ROWS || []).map(function (r) { return [r.category, r.section, r.title, r.content]; });
            if (id === 'foreigner') rows = (data.FOREIGNER_ROWS || []).map(function (r) { return [r.code, r.name, r.status, r.note]; });
            if (id === 'staff') rows = (data.STAFF_ROWS || []).map(function (r) { return [r.agency, r.branch, r.staff, r.phone, r.fax, r.nateon]; });
            if (id === 'manual') rows = (data.MANUAL_CSV_ROWS || []).map(function (r) { return [r.id, manualCategories[r.category] || r.category, r.title, r.kind, r.text, r.c1, r.c2, r.c3, r.c4, r.c5, r.c6, String(r.image || '').replace(/^\//, '')]; });
            return rows.map(function (row) { return row.map(plain); });
        }
        function exportTab(id, data) { var tab = tabFor(id); return stringify([tab.headers].concat(rowsForTab(id, data))); }

        // Manual cells support only readable **emphasis** and explicit line breaks.
        // Escape all supplied text before adding these two fixed HTML elements.
        function manualText(value) {
            return escapeHtml(value).replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        }
        function buildManual(rows, currentData) {
            var byId = new Map(), old = new Map();
            (currentData.MANUAL_DB || []).forEach(function (article) { old.set(article.id, article); });
            rows.forEach(function (r, index) {
                var line = index + 2, entry = byId.get(r.id);
                if (!entry) {
                    var previous = old.get(r.id);
                    entry = { id: r.id, cat: normalCategory(r.category), title: r.title, tags: previous && Array.isArray(previous.tags) ? previous.tags.slice() : [], body: '', blocks: [] };
                    byId.set(r.id, entry);
                } else if (entry.cat !== normalCategory(r.category) || entry.title !== r.title) fail(line, '매뉴얼번호', '같은 매뉴얼번호의 업무분류와 제목은 같아야 합니다.');
                entry.blocks.push(r);
            });
            return Array.from(byId.values()).map(function (entry) {
                var html = [], table = null, list = false, notice = '';
                function closeTable() { if (table) { html.push('</tbody></table></div>'); table = null; } }
                function closeList() { if (list) { html.push('</ul>'); list = false; } }
                function closeNotice() { if (notice) { html.push('</div>'); notice = ''; } }
                entry.blocks.forEach(function (r, index) {
                    // Older CSVs exported the same image caption and download anchor as
                    // separate paragraphs. Keep that CSV readable while rendering one block.
                    var previous = entry.blocks[index - 1], next = entry.blocks[index + 1];
                    if (r.kind === '문단' && next && next.kind === '이미지' && plain(r.text) === plain(next.text) + ' 양식 샘플 (클릭 시 확대)') return;
                    if (r.kind === '문단' && previous && previous.kind === '이미지' && plain(r.text) === '이미지 다운로드') return;
                    var cells = [r.c1, r.c2, r.c3, r.c4, r.c5, r.c6];
                    while (cells.length && cells[cells.length - 1] === '') cells.pop();
                    if (r.kind === '표머리글') {
                        closeTable(); closeList(); closeNotice(); table = { width: cells.length };
                        html.push('<div class="table-scroll"><table class="result-table"><thead><tr>' + cells.map(function (cell) { return '<th>' + manualText(cell) + '</th>'; }).join('') + '</tr></thead><tbody>');
                    } else if (r.kind === '표행') {
                        closeList(); closeNotice();
                        if (!table) throw new Error('매뉴얼 ' + entry.id + ': 표행 앞에 표머리글이 필요합니다.');
                        if (cells.length > table.width) throw new Error('매뉴얼 ' + entry.id + ': 표행의 열 수가 표머리글보다 많습니다.');
                        while (cells.length < table.width) cells.push('');
                        html.push('<tr>' + cells.map(function (cell) { return '<td>' + manualText(cell) + '</td>'; }).join('') + '</tr>');
                    } else if (r.kind === '목록' || r.kind === '목록시작') {
                        closeTable(); closeNotice(); if (r.kind === '목록시작') closeList();
                        if (!list) { html.push('<ul>'); list = true; }
                        html.push('<li>' + manualText(r.text) + '</li>');
                    } else if (r.kind === '주의' || r.kind === '안내') {
                        closeTable(); closeList();
                        // Consecutive rows of one notice kind are paragraphs in one panel.
                        if (notice !== r.kind) {
                            closeNotice(); notice = r.kind;
                            html.push('<div class="' + (notice === '주의' ? 'warning-box' : 'info-box') + '">');
                        }
                        html.push('<div>' + manualText(r.text) + '</div>');
                    } else {
                        closeTable(); closeList(); closeNotice();
                        if (r.kind === '제목') html.push('<h4>' + manualText(r.text) + '</h4>');
                        else if (r.kind === '문단') html.push('<p>' + manualText(r.text) + '</p>');
                        else if (r.kind === '이미지') {
                            var image = r.image.replace(/^\//, '');
                            var imageId = image === imageNames[0] ? 'manualImgFinancial' : 'manualImgNotice';
                            var label = r.text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
                            html.push('<div class="manual-image-block"><div>' + manualText(r.text) + ' 양식 샘플 (클릭 시 확대)</div><img id="' + imageId + '" src="/' + image + '" alt="' + escapeHtml(label) + '" onclick="HanaSupport.openManualImgModal(\'' + imageId + '\')" class="legacy-image-preview-01"><div class="flex-end"><a href="/' + image + '" download="' + escapeHtml(label + '.png') + '" class="btn-down">이미지 다운로드</a><div></div>');
                        }
                    }
                });
                closeTable(); closeList(); closeNotice(); delete entry.blocks; entry.body = html.join('\n'); return entry;
            });
        }

        function importTab(id, csv, supplied) {
            var tab = tabFor(id), current = dataOf(supplied), raw = parse(csv), header = raw.shift() || [];
            if (new Set(header).size !== header.length) throw new Error('CSV 머리글에 중복된 열이 있습니다.');
            if (header.length !== tab.headers.length || header.some(function (item, index) { return item !== tab.headers[index]; })) throw new Error('CSV 머리글이 [' + tab.headers.join(', ') + ']와 정확히 일치해야 합니다.');
            if (!raw.length) throw new Error('CSV에는 최소 한 개의 자료 행이 필요합니다.');
            if (raw.length > 30000) throw new Error('CSV는 30,000행을 초과할 수 없습니다.');
            var rowSeen = new Set();
            var rows = raw.map(function (row, index) {
                var line = index + 2;
                if (row.length !== header.length) throw new Error('CSV ' + line + '행: 열 수가 머리글과 다릅니다.');
                if (row.every(function (cell) { return !cell.trim(); })) throw new Error('CSV ' + line + '행이 비어 있습니다.');
                var cleaned = row.map(function (cell, column) {
                    var value = stripEmoji(cell.replace(/\r\n?/g, '\n')).trim();
                    if (/^#(?:NAME\?|VALUE!|REF!|DIV\/0!|N\/A|NUM!|NULL!|SPILL!|CALC!|GETTING_DATA|FIELD!|DATA!|CONNECT!|BLOCKED!|UNKNOWN!|BUSY!|PYTHON!|TIMEOUT!)$/i.test(value)) fail(line, header[column], 'Excel 오류값 ' + value + '은 자료로 적용할 수 없습니다. 원문을 복원하고 셀을 텍스트 형식으로 지정한 뒤 CSV UTF-8로 다시 저장해 주세요.');
                    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) fail(line, header[column], '제어문자는 사용할 수 없습니다.');
                    if (/<\s*\/?\s*[a-z][^>]*>/i.test(value) || /<!|<\?/.test(value)) fail(line, header[column], 'HTML 태그 대신 일반 텍스트를 입력하세요.');
                    if (value.length > 100000) fail(line, header[column], '한 셀은 100,000자를 초과할 수 없습니다.');
                    return value;
                });
                unique(rowSeen, JSON.stringify(cleaned), line, '행'); return cleaned;
            });
            var datasets = {}, seen = new Set();
            if (id === 'simple') {
                var simple = {};
                rows.forEach(function (r, i) {
                    var line = i + 2, code = required(r[0], line, header[0]).toUpperCase();
                    if (!/^[A-Z][0-9]{2}[A-Z0-9.]*$/.test(code)) fail(line, header[0], 'A00, I60 등의 질병코드를 입력하세요.');
                    unique(seen, code, line, header[0]); required(r[1], line, header[1]);
                    var record = { code: code, name: r[1], 입원수술: '', 뇌심: '', 암: '', 사망: '', 경과일: r[6] };
                    ['입원수술', '뇌심', '암', '사망'].forEach(function (field, n) { record[field] = oneOf(r[n + 2], ['○', 'O', 'X', '●'], line, header[n + 2]); });
                    var warnings = r[7] ? r[7].split(/[,\n]/).map(function (item) { return item.trim(); }).filter(Boolean) : [];
                    warnings.forEach(function (item) { oneOf(item, ['입원수술', '뇌심', '암', '사망'], line, header[7]); });
                    if (warnings.length !== new Set(warnings).size) fail(line, header[7], '주의담보가 중복되었습니다.');
                    if (warnings.length) record.warnFields = warnings;
                    simple[code] = record;
                }); datasets.SIMPLE_DISEASE_DB = simple;
            }
            if (id === 'limit') {
                tab.datasetKeys.forEach(function (dataset) { datasets[dataset] = []; });
                rows.forEach(function (r, i) {
                    var parent = r[4]; r = r.slice(0, 4).concat(r.slice(5));
                    var header = tab.headers.slice(0, 4).concat(tab.headers.slice(5));
                    var line = i + 2, section = limitSections.indexOf(r[0]);
                    if (section === -1) oneOf(r[0], limitSections, line, header[0]);
                    key(r[2], line, header[2], true); required(r[3], line, header[3]);
                    var record = { num: r[1], name: r[3], parent: parent }, mergeAge = section === 2;
                    key(parent, line, '상위특약', true);
                    if (section === 4) {
                        if (!/^[1-9]\d*$/.test(r[1])) fail(line, header[1], '타사합산 번호는 양의 정수여야 합니다.');
                        record.num = Number(r[1]);
                    }
                    if (section < 2) record.group = r[2];
                    var fields = mergeAge ? ['a40', 'a50', 'a60', 'a65', 'a66'] : ['a40', 'a41', 'a51', 'a61', 'a66'];
                    var hasAge = r.slice(4, 9).some(Boolean), hasRisk = r.slice(9, 14).some(Boolean);
                    if ((section === 0 || section === 2) && hasRisk) fail(line, '1급', '연령별 화면에는 위험등급 금액을 입력할 수 없습니다.');
                    if ((section === 1 || section === 4) && hasAge) fail(line, '40세이하', '위험등급별 화면에는 연령별 금액을 입력할 수 없습니다.');
                    if (section === 3 && hasAge && hasRisk) fail(line, '금액', '이 행에는 연령별 또는 위험등급별 중 한 기준만 입력하세요.');
                    if (!hasAge && !hasRisk) fail(line, '금액', '최소 한 개의 가입한도가 필요합니다.');
                    if (hasAge) fields.forEach(function (field, n) { if (r[n + 4] !== '') record[field] = money(r[n + 4], line, header[n + 4]); });
                    if (hasRisk) ['r1', 'r2', 'r3', 'r4', 'rn'].forEach(function (field, n) { record[field] = money(r[n + 9], line, header[n + 9]); });
                    if (section === 0) { record.min = money(r[14], line, header[14]); record.unit = money(r[15], line, header[15]); }
                    if (section === 2 || section === 3) record.basis = r[16];
                    if (section === 3) record.type = r[17];
                    if (section !== 3) record.note = r[18];
                    if (section !== 0 && (r[14] || r[15])) fail(line, '최저가입금액', '연령별 가입한도에서만 최저가입금액과 가입단위를 입력할 수 있습니다.');
                    if (section !== 2 && section !== 3 && r[16]) fail(line, '합산기준', '당사합산 화면에서만 입력할 수 있습니다.');
                    if (section !== 3 && r[17]) fail(line, '세부구분', '당사합산 위험등급별에서만 입력할 수 있습니다.');
                    if (section === 3 && r[18]) record.note = r[18];
                    datasets[tab.datasetKeys[section]].push(record);
                });
            }
            if (id === 'special') {
                datasets.SPECIAL_DB_NEW = rows.map(function (r, i) {
                    var line = i + 2;
                    key(r[1], line, header[1]); required(r[2], line, header[2]); required(r[3], line, header[3]);
                    var avail = [];
                    [8, 9].forEach(function (col, groupIndex) {
                        var pair = r[col].match(/^([●○O-])\s*(\([^()\r\n]+\))?\s*[\/│]\s*([●○O-])\s*(\([^()\r\n]+\))?$/i);
                        if (!pair) fail(line, header[col], '비갱신 / 갱신 순서로 ● / ●, ● / ○, ○ / ●, ○ / ○ 중 하나를 입력하세요. 조건은 ● (3.0.5 제외)처럼 표시하세요.');
                        [0, 1].forEach(function (offset) {
                            var mark = pair[offset * 2 + 1].toUpperCase(), note = pair[offset * 2 + 2] || '';
                            var available = mark === '●' || mark === 'O';
                            if (!available && note) fail(line, header[col], '조건 문구는 가입 가능한 ● 표시에만 붙일 수 있습니다.');
                            if (available) avail.push(specialAvailability[groupIndex * 2 + offset] + (note ? ' ' + note : ''));
                        });
                    });
                    return restoreSpecialSections({ num: r[0] || '-', group: normalSpecialGroup(r[1]), name: r[2], sub: '', reason: r[3], criteria: r[4], reduction: r[5], exemption: r[6], amount: r[7], avail: avail, sub_items: [] }, line);
                });
            }
            if (id === 'disability') {
                var groups = new Map(), daily = [];
                rows.forEach(function (r, i) {
                    var line = i + 2; oneOf(r[0], ['장해기준', '일상생활기본동작'], line, header[0]); key(r[2], line, header[2]); required(r[3], line, header[3]);
                    if (!/^\d+(?:\.\d+)?(?:\s*[~～~-]\s*\d+(?:\.\d+)?)?%?$/.test(r[4])) fail(line, header[4], '40% 또는 10~100%와 같은 지급률을 입력하세요.');
                    var rates = r[4].match(/\d+(?:\.\d+)?/g).map(Number);
                    if (rates.some(function (n) { return n < 0 || n > 100; }) || rates.length === 2 && rates[0] > rates[1]) fail(line, header[4], '지급률 범위는 0~100%여야 합니다.');
                    if (r[0] === '장해기준') {
                        if (!/^[1-9]\d*$/.test(r[1])) fail(line, header[1], '분류번호는 양의 정수여야 합니다.');
                        var group = groups.get(r[1]);
                        if (!group) { group = { number: r[1], title: r[2], items: [] }; groups.set(r[1], group); }
                        else if (group.title !== r[2]) fail(line, header[2], '같은 분류번호에는 같은 분류명을 입력하세요.');
                        group.items.push({ name: r[3], rate: r[4] });
                    } else {
                        if (r[1]) fail(line, header[1], '일상생활기본동작의 분류번호는 비워두세요.');
                        daily.push({ type: r[2], description: r[3], rate: r[4] });
                    }
                }); datasets.DISABILITY_CATEGORIES = Array.from(groups.values()); datasets.DAILY_LIFE_ITEMS = daily;
            }
            if (id === 'surgery') {
                var surgery = {};
                rows.forEach(function (r, i) {
                    var line = i + 2; key(r[0], line, header[0]); required(r[1], line, header[1]); required(r[2], line, header[2]);
                    if (!/^(?:[1-5]종|[1-5](?:\.0)?)$/.test(r[3])) fail(line, header[3], '1종~5종 중 하나를 입력하세요.');
                    unique(seen, r[1] + '\n' + r[2], line, '수술번호/수술명');
                    surgery['surgery_' + (i + 1)] = { category: r[0], number: r[1], name: r[2], type: parseInt(r[3], 10) + '.0' };
                }); datasets.SURGERY_DB = surgery;
            }
            if (id === 'cardio') {
                datasets.BRAIN_DATA = []; datasets.HEART_DATA = [];
                rows.forEach(function (r, i) {
                    var line = i + 2; oneOf(r[0], ['뇌', '심장'], line, header[0]); key(r[1], line, header[1]); required(r[2], line, header[2]); key(r[3], line, header[3]);
                    if (!/^[A-Z][A-Z0-9.,~\-–\s]*$/.test(r[3]) || !/\d{2}/.test(r[3])) fail(line, header[3], 'I60, G04, Q20~Q25 등의 질병코드를 입력하세요.');
                    unique(seen, r[0] + '\n' + r[3], line, '질환구분/질병코드');
                    var record = { group: r[1], name: r[2], code: r[3] };
                    cardioFields.forEach(function (field, n) { var value = oneOf(r[n + 4], ['', 'O', '○', '●', 'X', '-'], line, header[n + 4]); if ((r[0] === '뇌' && !['허혈성', '급성심근', '부정맥'].includes(field)) || (r[0] === '심장' && !['뇌혈관', '뇌졸중', '뇌출혈'].includes(field))) record[field] = value; else if (value) fail(line, header[n + 4], '이 질환구분에서 사용하지 않는 보장입니다.'); });
                    datasets[r[0] === '뇌' ? 'BRAIN_DATA' : 'HEART_DATA'].push(record);
                });
            }
            if (id === 'documents') {
                var documents = Object.create(null);
                rows.forEach(function (r, i) { var line = i + 2; key(r[0], line, header[0]); required(r[1], line, header[1]); required(r[2], line, header[2]); unique(seen, r[0] + '\n' + r[1], line, '업무분류/업무명'); if (!documents[r[0]]) documents[r[0]] = []; documents[r[0]].push({ name: r[1], documents: splitLines(r[2]), notes: splitLines(r[3]) }); }); datasets.DOCUMENTS_DB = documents;
            }
            if (id === 'newContract') datasets.NEW_CONTRACT_ROWS = rows.map(function (r, i) { var line = i + 2; key(r[0], line, header[0]); key(r[1], line, header[1], true); required(r[3], line, header[3]); return { category: r[0], section: r[1], title: r[2], content: r[3] }; });
            if (id === 'foreigner') datasets.FOREIGNER_ROWS = rows.map(function (r, i) {
                var line = i + 2; oneOf(r[2], ['가능', '불가', '조건부', '안내'], line, header[2]); key(r[1], line, header[1]);
                if (r[2] === '안내') { if (r[0]) fail(line, header[0], '안내 행의 체류코드는 비워두세요.'); required(r[3], line, header[3]); }
                else { if (!/^[A-Z]-\d+(?:-\d+)?$/.test(r[0])) fail(line, header[0], 'A-1, E-9 등의 체류코드를 입력하세요.'); unique(seen, r[0], line, header[0]); if (r[2] === '조건부') required(r[3], line, header[3]); }
                return { code: r[0], name: r[1], status: r[2], note: r[3] };
            });
            if (id === 'staff') datasets.STAFF_ROWS = rows.map(function (r, i) {
                var line = i + 2; key(r[0], line, header[0]); key(r[2], line, header[2]); unique(seen, r[0] + '\n' + r[1] + '\n' + r[2], line, '대리점명/적용지점/담당총무');
                [3, 4].forEach(function (col) { if (r[col] && !/^[0-9+()\-\s]{2,30}$/.test(r[col])) fail(line, header[col], '전화번호 형식으로 입력하세요.'); });
                if (r[5] && !/^[A-Za-z0-9_.@\-]+$/.test(r[5])) fail(line, header[5], '영문, 숫자, 밑줄, 마침표, @, 하이픈만 입력하세요.');
                return { agency: r[0], branch: r[1], staff: r[2], phone: r[3], fax: r[4], nateon: r[5] };
            });
            if (id === 'manual') {
                var manualRows = rows.map(function (r, i) {
                    var line = i + 2; if (!/^[A-Za-z0-9_-]{1,80}$/.test(r[0])) fail(line, header[0], '영문, 숫자, 밑줄, 하이픈으로 매뉴얼번호를 입력하세요.');
                    key(r[1], line, header[1]); required(r[2], line, header[2]); oneOf(r[3], manualKinds, line, header[3]);
                    var image = r[11].replace(/^\//, '');
                    if (r[3] === '이미지') { oneOf(image, imageNames, line, header[11]); required(r[4], line, header[4]); }
                    else if (image) fail(line, header[11], '이미지 행에서만 이미지참조를 입력하세요.');
                    var table = r[3] === '표머리글' || r[3] === '표행';
                    if (table) { if (!r.slice(5, 11).some(Boolean)) fail(line, '1열~6열', '표에 표시할 내용을 입력하세요.'); if (r[4]) fail(line, header[4], '표의 내용은 1열~6열에 입력하세요.'); }
                    else { if (r.slice(5, 11).some(Boolean)) fail(line, '1열~6열', '표머리글 또는 표행에서만 입력하세요.'); required(r[4], line, header[4]); }
                    return { id: r[0], category: normalCategory(r[1]), title: r[2], kind: r[3], text: r[4], c1: r[5], c2: r[6], c3: r[7], c4: r[8], c5: r[9], c6: r[10], image: image };
                });
                datasets.MANUAL_CSV_ROWS = manualRows; datasets.MANUAL_DB = buildManual(manualRows, current);
            }
            return { datasets: datasets, rowCount: rows.length };
        }

        return { tabs: tabs, exportTab: exportTab, importTab: importTab, rowsForTab: rowsForTab, parse: parse, stringify: stringify, plainText: plain };
    })();

    /* 3. 화면에서 사용하는 자료 */
    var CSV_API = { data: CONFIG.apiBase.replace(/\/$/, '') + '/api/data', save: CONFIG.apiBase.replace(/\/$/, '') + '/api/import/csv' };
    var initialData = JSON.parse(app.getElementById('hana-support-initial-data').textContent);
    var defaultData = JSON.parse(JSON.stringify(initialData.datasets));
    var appData = JSON.parse(JSON.stringify(defaultData));
    var manualImages = initialData.images || {};
    var csvVersion = 'original';
    // 로그인 연동 전에는 기본 관리자 모드로 사용합니다.
    var csvSession = { authenticated: false, isAdmin: true, signInUrl: '' };
    var csvPending = Object.create(null);
    var csvBusy = false;
    function cleanCsvDisplay(value) {
        if (typeof value === 'string') return value.replace(/[\u{1f000}-\u{1faff}\u2600-\u27bf\ufe0f\u200d\u23f1\u2b07]/gu, '');
        if (Array.isArray(value)) return value.map(cleanCsvDisplay);
        if (value && typeof value === 'object') { var result = {}; Object.keys(value).forEach(function (key) { result[key] = cleanCsvDisplay(value[key]); }); return result; }
        return value;
    }
    defaultData = cleanCsvDisplay(defaultData); appData = JSON.parse(JSON.stringify(defaultData));


    /* Legacy business functions. The CSV controller defines appData and manualImages first. */
    // 1. 각 화면에서 사용하는 데이터 이름
    var SIMPLE_DISEASE_DB = appData.SIMPLE_DISEASE_DB;
    var LIMIT_DB = appData.LIMIT_DB;
    var TASA_LIMIT_DB = appData.TASA_LIMIT_DB;
    var DOCUMENTS_DB = appData.DOCUMENTS_DB;
    var DISABILITY_CATEGORIES = appData.DISABILITY_CATEGORIES;
    var DAILY_LIFE_ITEMS = appData.DAILY_LIFE_ITEMS;
    var CARDIO_DB = appData.CARDIO_DB;
    var SURGERY_DB = appData.SURGERY_DB;
    var SPECIAL_DB_NEW = appData.SPECIAL_DB_NEW;
    var SYNONYMS = appData.SYNONYMS;
    var HANA_AGE_LIMIT = appData.HANA_AGE_LIMIT;
    var HANA_RISK_LIMIT = appData.HANA_RISK_LIMIT;
    var HANA_MERGE_AGE = appData.HANA_MERGE_AGE;
    var HANA_MERGE_RISK = appData.HANA_MERGE_RISK;
    var HANA_MERGE_OTHER = appData.HANA_MERGE_OTHER;
    var MANUAL_DB = appData.MANUAL_DB;
    var BRAIN_DATA = appData.BRAIN_DATA;
    var HEART_DATA = appData.HEART_DATA;
    // 2. 메뉴 전환, 검색, 표 만들기
    let selectedCategory = null;
    function switchTab(name) {
        app.querySelectorAll('.tab-content').forEach(function (element) {
            element.classList.remove('active');
        });
        app.querySelectorAll('.tab-button[onclick^="HanaSupport.switchTab("]').forEach(function (button) {
            button.classList.toggle('active', button.getAttribute('onclick') === "HanaSupport.switchTab('" + name + "')");
        });
        app.getElementById(name + 'Tab').classList.add('active');
    }
    // 상속세 관련 서브탭 전환
    // =============================================
    // 초성 검색 (간편 예외 경증질환 탭)
    // =============================================
    function getChosung(char) {
        const code = char.charCodeAt(0) - 0xAC00;
        if (code < 0 || code > 11171)
            return null;
        const ch = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        return ch[Math.floor(code / 28 / 21)];
    }
    function buildChosungButtons() {
        const chosungs = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        const container = app.getElementById('chosungButtons');
        if (!container)
            return;
        chosungs.forEach(ch => {
            const btn = document.createElement('button');
            btn.textContent = ch;
            btn.className = 'chosung-button';

            btn.onclick = () => searchByChosung(ch);
            container.appendChild(btn);
        });
    }
    function searchByChosung(chosung) {
        const resultBox = app.getElementById('simpleResult');
        let results = [];
        for (const [code, data] of Object.entries(SIMPLE_DISEASE_DB)) {
            const first = (data.name || '').trim()[0];
            if (first && getChosung(first) === chosung)
                results.push(data);
        }
        results = results.filter((item, i, self) => i === self.findIndex(t => t.code === item.code));
        if (results.length > 0) {
            resultBox.innerHTML = generateMultipleResults(results, `초성 '${chosung}'`);
        }
        else {
            resultBox.innerHTML = '<div class="warning-box"><h3>검색 결과 없음</h3></div>';
        }
        resultBox.classList.add('active');
        app.getElementById('simpleInput').value = '';
    }
    function fmtW(v) {
        if (v === undefined || v === null || v === '') return '—';
        if (v === '불가' || v === '-')
            return `<span  class="legacy-text-26">${v}</span>`;
        if (typeof v === 'number')
            return v.toLocaleString() + '만';
        return v;
    }
    function setLimitBtnActive(active) {
        ['age', 'risk', 'merge-age', 'merge-risk', 'merge-other'].forEach(function (id) {
            var button = app.getElementById('btn-' + id);
            if (!button) return;
            button.classList.add('limit-filter-btn');
            button.classList.toggle('limit-merge-btn', id.startsWith('merge-'));
            button.classList.toggle('limit-filter-active', id === active);
            button.setAttribute('aria-pressed', String(id === active));
        });
    }
    function showLimitSection(section) {
        setLimitBtnActive(section);
        const box = app.getElementById('limitResult');
        if (section === 'age')
            box.innerHTML = renderAgeLimit(HANA_AGE_LIMIT, '연령별 가입한도 (전체)');
        else if (section === 'risk')
            box.innerHTML = renderRiskLimit(HANA_RISK_LIMIT, '위험등급별 가입한도');
        else if (section === 'merge-age')
            box.innerHTML = renderMergeAge();
        else if (section === 'merge-risk')
            box.innerHTML = renderMergeRisk();
        else if (section === 'merge-other')
            box.innerHTML = renderMergeOther();
        box.classList.add('active');
    }
    function renderAgeLimit(data, title) {
        let html = `<div  class="legacy-block-spacing-31"><h3  class="legacy-heading-15"> ${title}</h3><p  class="legacy-note-23">※ 금액 단위: 만원 | 기준: 2026.10.01</p></div>`;
        html += `<div  class="legacy-table-scroll-03"><table  class="legacy-data-table-04"><thead><tr  class="legacy-detail-panel-43">
                <th  class="legacy-table-heading-center-05">번호</th>
                <th  class="legacy-table-heading-center-06">담보군</th>
                <th  class="legacy-table-heading-left-26">주계약 및 특약명</th>
                <th  class="legacy-table-heading-center-07">40세↓</th>
                <th  class="legacy-table-heading-center-07">41~50세</th>
                <th  class="legacy-table-heading-center-07">51~60세</th>
                <th  class="legacy-table-heading-center-07">61~65세</th>
                <th  class="legacy-table-heading-center-07">66세↑</th>
                <th  class="legacy-table-heading-center-08">최저</th>
                <th  class="legacy-table-heading-center-08">단위</th>
                <th  class="legacy-table-heading-left-27">비고</th>
            </tr></thead><tbody>`;
        let prevGroup = null;
        data.forEach((r, i) => {
            const bg = i % 2 === 0 ? 'white' : '#f9f9f9';
            const gc = r.group && r.group !== prevGroup ? `<td  class="legacy-table-cell-center-05">${r.group}</td>` : `<td></td>`;
            if (r.group)
                prevGroup = r.group;
            // 전 연령 동일한 경우 colspan=5로 합쳐서 표시
            const allSame = r.a40 === r.a41 && r.a41 === r.a51 && r.a51 === r.a61 && r.a61 === r.a66;
            let ageCells;
            if (allSame) {
                ageCells = `<td colspan="5"  class="legacy-table-cell-center-07">${fmtW(r.a40)} <span  class="legacy-text-27">(전 연령 동일)</span></td>`;
            }
            else {
                ageCells = `<td  class="legacy-table-cell-center-08">${fmtW(r.a40)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a41)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a51)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a61)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a66)}</td>`;
            }
            html += `<tr  style="background:${bg};">
                    <td  class="legacy-table-cell-center-09">${r.num}</td>${gc}
                    <td  class="legacy-table-cell-left-03">${r.name}</td>
                    ${ageCells}
                    <td  class="legacy-table-cell-center-10">${r.min}</td>
                    <td  class="legacy-table-cell-center-10">${r.unit}</td>
                    <td  class="legacy-table-cell-left-04">${r.note}</td>
                </tr>`;
        });
        html += `</tbody></table></div>`;
        html += `<div  class="legacy-detail-panel-44">
                <strong> 세부 가입 조건</strong><br>
                • <strong  class="legacy-text-15"> [260901] 간편심사형 한도 통합 : 기존 3.10.5는 일반심사형 한도를 따랐으나, 260901부터 간편심사형(3.10.5/3.5.5/3.3.5/3.0.5) 상품 한도로 변경</strong><br>
                • <strong  class="legacy-text-15"> [260901] 대상포진진단·대상포진눈병진단특약 : 간편심사형 전체 판매중지 (일반심사형만 가입 가능)</strong><br>
                • <strong  class="legacy-text-15"> [260901] 첫날부터입원類(120일/30일/상급종합/종합병원) + 간병類(간병인사용·간호간병통합) : 간편 3.0.5 판매중지</strong><br>
                • <strong  class="legacy-text-15">[260901] 정기특약 : 전체보험료 대비 일정비율 가입 조건 삭제 / 2년이내 재해이외 사망 시 납입보험료 지급으로 보장내용 변경</strong><br>
                <div  class="legacy-detail-panel-45">
                <strong  class="legacy-presentation-strong-08"> 일반심사형에만 적용</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 뇌혈관질환진단·허혈성심장질환진단특약 부가 시 첫날부터중환자실입원특약 필수</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 3대주요암진단특약 가입 시 일반암진단특약 필수 (일반암 1배이내)</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 고액암진단특약 가입 시 일반암진단특약 필수</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 암(갑상선암,전립선암제외)다빈치로봇수술특약과 암다빈치로봇수술특약 동시 부가 및 첫날부터중환자실입원특약 필수</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] ①비급여암주요치료특약 ②암주요치료(항암호르몬약물)특약 가입 시 암주요치료특약 필수</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 항암방사선치료특약과 항암약물치료특약 동시부가</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 요양병원암입원특약과 암직접치료(요양병원제외)입원특약 동시 부가 및 첫날부터중환자실입원특약 필수</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 암직접치료통원특약 및 암직접치료상급종합병원통원특약 가입 시 첫날부터중환자실입원특약 필수</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 급여유방바늘생검조직병리검사특약 가입 시 급여암자기공명영상진단검사지원특약 필수</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 급여전립선바늘생검조직병리검사특약 가입 시 급여암자기공명영상진단검사지원특약 필수</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] ①수술류 ②입원류 ③간병류 ④질병장해(3~100%)특약 부가 시 합계보험료 전체보험료의 50% 미만으로 가입 가능</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 중환자실입원 일반/간편 분리, 한도 확대 (일반 20만, 간편 10만)</strong><br>
                • <strong  class="legacy-presentation-strong-09"> [261001] 3대주요암진단 일반/간편 분리, 일반 한도 상향</strong><br>
                </div>
                <div  class="legacy-detail-panel-46">
                <strong  class="legacy-presentation-strong-10"> 일반심사형 세부조건</strong><br>
                • 소액암진단특약은 일반암진단특약 필수가입, 일반암진단특약의 0.2배 이내<br>
                • 남녀특정암진단특약은 일반암진단특약 필수가입, 일반암진단특약의 1배 이내<br>
                • 항암세기조절방사선/양성자방사선치료특약 → 항암방사선치료특약 필수가입<br>
                • 특정항암호르몬/표적항암/면역항암 약물특약 → 항암약물치료특약 필수가입<br>
                • 원발성고혈압, 당뇨병진단, 대상포진, 통풍 가입 시 → 뇌혈관진단·허혈성질환진단 각 500만 필수가입<br>
                • 질병수술특약 5종 중 1가지 이상 가입 시 정기특약 500만원 필수가입 (260401 新특약)<br>
                • <strong  class="legacy-text-15"> 주의사항: 위험급수별과 연령별은 둘 중에 작은 금액으로 적용합니다</strong> (2026.7.27~)<br>
                • 경증수술비 합산 = 1종수술비 + 2종수술비 + 질병수술(All Risk) + 3대기관양성신생물 및 폴립수술 (각 특약별 연령별 가입한도 적용 후 합산관리, 2026.8월~)<br>
                • 원발성 고혈압, 당뇨병진단, 대상포진, 통풍, 재해골절, 깁스치료, 입원비(종합병원포함) : 설계사(51032B~51036B) 가입한도 제한 있음 (260801)<br>
                • 일반심사형+간편심사형 합산 한도
                </div>
            </div>`;
        return html;
    }
    function renderRiskLimit(data, title) {
        let html = `<div  class="legacy-block-spacing-31"><h3  class="legacy-heading-16"> ${title}</h3><p  class="legacy-note-23">※ 금액 단위: 만원 | 기준: 2026.10.01</p></div>`;
        html += `<div  class="legacy-table-scroll-03"><table  class="legacy-data-table-04 risk-limit-table"><thead><tr  class="legacy-detail-panel-47">
                <th  class="legacy-table-heading-center-09">번호</th>
                <th  class="legacy-table-heading-center-10">담보군</th>
                <th  class="legacy-table-heading-left-28">특약명</th>
                <th  class="legacy-table-heading-center-10">1급</th>
                <th  class="legacy-table-heading-center-10">2급</th>
                <th  class="legacy-table-heading-center-10">3급</th>
                <th  class="legacy-table-heading-center-10">4급</th>
                <th  class="legacy-table-heading-center-10">비위험</th>
                <th  class="legacy-table-heading-left-29">비고</th>
            </tr></thead><tbody>`;
        let prevGroup = null;
        data.forEach((r, i) => {
            const bg = i % 2 === 0 ? 'white' : '#fff5f5';
            const gc = r.group && r.group !== prevGroup ? `<td  class="legacy-table-cell-center-11">${r.group}</td>` : `<td></td>`;
            if (r.group)
                prevGroup = r.group;
            html += `<tr  style="background:${bg};">
                    <td  class="legacy-table-cell-center-09">${r.num}</td>${gc}
                    <td  class="legacy-table-cell-left-03">${r.name}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r1)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r2)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r3)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r4)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.rn)}</td>
                    <td  class="legacy-table-cell-left-05">${r.note}</td>
                </tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }
    function renderMergeAge() {
        let html = `<div  class="legacy-block-spacing-31"><h3  class="legacy-heading-17"> 당사 기계약 합산한도 - 연령별</h3><p  class="legacy-note-23">※ 금액 단위: 만원 | 기준: 2026.10.01</p></div>
            <div  class="legacy-table-scroll-03"><table  class="legacy-data-table-04"><thead><tr  class="legacy-detail-panel-48">
                <th  class="legacy-table-heading-center-11">번호</th>
                <th  class="legacy-table-heading-left-30">합산 담보</th>
                <th  class="legacy-table-heading-center-12">40세↓</th>
                <th  class="legacy-table-heading-center-12">50세↓</th>
                <th  class="legacy-table-heading-center-12">60세↓</th>
                <th  class="legacy-table-heading-center-12">65세↓</th>
                <th  class="legacy-table-heading-center-12">66세↑</th>
                <th  class="legacy-table-heading-left-31">합산기준</th>
            </tr></thead><tbody>`;
        HANA_MERGE_AGE.forEach((r, i) => {
            const bg = i % 2 === 0 ? 'white' : '#fff8f0';
            html += `<tr  style="background:${bg};">
                    <td  class="legacy-table-cell-center-12">${r.num}</td>
                    <td  class="legacy-table-cell-left-03">${r.name}${r.note ? `<br><span  class="legacy-text-28">${r.note}</span>` : ''}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a40)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a50)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a60)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a65)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.a66)}</td>
                    <td  class="legacy-table-cell-left-06">${r.basis}</td>
                </tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }
    function renderMergeRisk() {
        // 원본과 같은 하나의 표에 전체 항목을 원래 순서대로 표시합니다.
        let html = `<div  class="legacy-block-spacing-31"><h3  class="legacy-heading-17"> 당사 기계약 합산한도 - 위험등급별</h3><p  class="legacy-note-23">※ 금액 단위: 만원 | 기준: 2026.10.01</p></div>
            <div  class="legacy-table-scroll-03"><table  class="legacy-data-table-04 merge-risk-table"><thead><tr  class="legacy-detail-panel-48">
                <th  class="legacy-table-heading-center-11">번호</th>
                <th  class="legacy-table-heading-left-32">세부 특약</th>
                <th  class="legacy-table-heading-center-13">1급</th>
                <th  class="legacy-table-heading-center-13">2급</th>
                <th  class="legacy-table-heading-center-13">3급</th>
                <th  class="legacy-table-heading-center-13">4급</th>
                <th  class="legacy-table-heading-center-13">비위험</th>
                <th  class="legacy-table-heading-left-31">합산기준</th>
            </tr></thead><tbody>`;
        HANA_MERGE_RISK.forEach((r, i) => {
            const bg = i % 2 === 0 ? 'white' : '#fff8f0';
            html += `<tr  style="background:${bg};">
                    <td  class="legacy-table-cell-center-12">${r.num}</td>
                    <td  class="legacy-table-cell-left-03">${r.name}<br><span  class="legacy-text-29">${r.type || ''}</span>${r.a40 !== undefined ? '<br><small>연령별: ' + ['a40', 'a41', 'a51', 'a61', 'a66'].map((key, i) => ['40세이하', '41~50세', '51~60세', '61~65세', '66세이상'][i] + ' ' + fmtW(r[key])).join(' / ') + '</small>' : ''}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r1)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r2)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r3)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r4)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.rn)}</td>
                    <td  class="legacy-table-cell-left-06">${r.basis || '—'}</td>
                </tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }
    function renderMergeOther() {
        let html = `<div  class="legacy-block-spacing-31"><h3  class="legacy-heading-18"> 타사합산한도</h3><p  class="legacy-note-23">※ 금액 단위: 만원 | 기준: 2026.10.01</p></div>
            <div  class="legacy-table-scroll-03"><table  class="legacy-data-table-04"><thead><tr  class="legacy-detail-panel-49">
                <th  class="legacy-table-heading-center-14">번호</th>
                <th  class="legacy-table-heading-left-33">담보</th>
                <th  class="legacy-table-heading-center-15">1급</th>
                <th  class="legacy-table-heading-center-15">2급</th>
                <th  class="legacy-table-heading-center-15">3급</th>
                <th  class="legacy-table-heading-center-15">4급</th>
                <th  class="legacy-table-heading-center-15">비위험</th>
                <th  class="legacy-table-heading-left-34">비고</th>
            </tr></thead><tbody>`;
        HANA_MERGE_OTHER.forEach((r, i) => {
            const bg = i % 2 === 0 ? 'white' : '#faf5ff';
            html += `<tr  style="background:${bg};">
                    <td  class="legacy-table-cell-center-12">${r.num}</td>
                    <td  class="legacy-table-cell-left-03">${r.name}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r1)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r2)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r3)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.r4)}</td>
                    <td  class="legacy-table-cell-center-08">${fmtW(r.rn)}</td>
                    <td  class="legacy-table-cell-left-06">${r.note}</td>
                </tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }
    function searchLimit() {
        const q = app.getElementById('limitInput').value.trim();
        if (!q) {
            alert('특약명을 입력하세요.');
            return;
        }
        // 매칭된 항목 + 바로 다음 간편심사형 행도 함께 포함
        const ageR = [];
        HANA_AGE_LIMIT.forEach((r, i) => {
            if (r.name.includes(q)) {
                ageR.push(r);
                // 다음 행이 간편심사형 보조 행이면 함께 포함
                const next = HANA_AGE_LIMIT[i + 1];
                if (next && next.name.startsWith('└'))
                    ageR.push(next);
            }
        });
        const riskR = HANA_RISK_LIMIT.filter(r => r.name.includes(q));
        const box = app.getElementById('limitResult');
        if (ageR.length === 0 && riskR.length === 0) {
            box.innerHTML = `<div class="warning-box"><h3> "${q}"에 해당하는 특약을 찾을 수 없습니다.</h3></div>`;
            box.classList.add('active');
            return;
        }
        let html = `<h3  class="legacy-heading-19"> "${q}" 검색결과</h3>`;
        if (ageR.length > 0)
            html += renderAgeLimit(ageR, `연령별 가입한도 (${ageR.length}건)`);
        if (riskR.length > 0)
            html += `<div  class="legacy-block-spacing-32">${renderRiskLimit(riskR, `위험등급별 가입한도 (${riskR.length}건)`)}</div>`;
        box.innerHTML = html;
        box.classList.add('active');
        setLimitBtnActive('');
    }
    function quickSearch(type, keyword) {
        if (type === 'simple') {
            app.getElementById('simpleInput').value = keyword;
            searchSimple();
        }
        else if (type === 'limit') {
            app.getElementById('limitInput').value = keyword;
            searchLimit();
        }
        else if (type === 'disability') {
            app.getElementById('disabilityInput').value = keyword;
            searchDisability();
        }
        else if (type === 'cardio') {
            app.getElementById('cardioInput').value = keyword;
            searchCardio();
        }
        else if (type === 'surgery') {
            app.getElementById('surgeryInput').value = keyword;
            searchSurgery();
        }
        else if (type === 'special') {
            filterSpecialCategory(keyword);
        }
    }
    // 간편심사 검색
    function searchSimple() {
        const query = app.getElementById('simpleInput').value.trim().toUpperCase();
        const resultBox = app.getElementById('simpleResult');
        if (!query) {
            alert('KCD코드 또는 질병명을 입력하세요.');
            return;
        }
        let results = [];
        for (const [code, data] of Object.entries(SIMPLE_DISEASE_DB)) {
            if (code === query || code.includes(query) || query.includes(code) ||
                data.name.toUpperCase().includes(query) || query.includes(data.name.toUpperCase())) {
                results.push(data);
            }
        }
        results = results.filter((item, index, self) => index === self.findIndex((t) => t.code === item.code));
        if (results.length > 0) {
            if (results.length === 1) {
                resultBox.innerHTML = generateSimpleResult(results[0]);
            }
            else {
                resultBox.innerHTML = generateMultipleResults(results);
            }
            resultBox.classList.add('active');
        }
        else {
            resultBox.innerHTML = `<div class="warning-box"><h3> 검색 결과 없음</h3></div>`;
            resultBox.classList.add('active');
        }
    }
    function generateMultipleResults(results) {
        var list = document.createElement('div');
        list.className = 'multiple-results';
        var title = document.createElement('h4');
        title.textContent = '검색 결과 ' + results.length + '개 — 원하는 질병을 클릭하세요';
        list.appendChild(title);
        results.forEach(function (data) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'result-item safe-result';
            button.dataset.code = data.code;
            var name = document.createElement('h5');
            name.textContent = data.code + ' - ' + data.name;
            var summary = document.createElement('p');
            var warningFields = data.warnFields || [];
            var parts = [
                { label: '입원/수술', field: '입원수술' },
                { label: '뇌/심', field: '뇌심' },
                { label: '암', field: '암' },
                { label: '사망', field: '사망' }
            ];
            parts.forEach(function (part, index) {
                var value = data[part.field];
                summary.appendChild(document.createTextNode((index ? ' | ' : '') + part.label + ': '));
                if (value === '○' && warningFields.includes(part.field)) {
                    var warning = document.createElement('span');
                    warning.className = 'simple-warning-mark';
                    warning.textContent = value;
                    summary.appendChild(warning);
                } else {
                    summary.appendChild(document.createTextNode(String(value)));
                }
            });
            button.append(name, summary);
            list.appendChild(button);
        });
        return list.outerHTML;
    }
    function showSimpleDetail(data) {
        const resultBox = app.getElementById('simpleResult');
        resultBox.innerHTML = generateSimpleResult(data);
    }
    function generateSimpleResult(data) {
        const wf = data.warnFields || [];
        const ORANGE = '<span class="badge legacy-detail-panel-48" >○</span>';
        const GREEN = '<span class="badge badge-success">○</span>';
        const RED = '<span class="badge badge-danger">X</span>';
        function badge(val, field) {
            if (val !== '○')
                return RED;
            return wf.includes(field) ? ORANGE : GREEN;
        }
        return `
                <h3> ${data.name}</h3>
                <div class="info-box"><strong>KCD 코드:</strong> ${data.code}</div>
                <table class="result-table">
                    <tr><th>담보</th><th>가능</th><th>경과일</th></tr>
                    <tr><td>입원/수술</td><td>${badge(data.입원수술, '입원수술')}</td><td>${data.경과일 || '-'}</td></tr>
                    <tr><td>뇌/심</td><td>${badge(data.뇌심, '뇌심')}</td><td>${data.경과일 || '-'}</td></tr>
                    <tr><td>암</td><td>${badge(data.암, '암')}</td><td>${data.경과일 || '-'}</td></tr>
                    <tr><td>사망</td><td>${badge(data.사망, '사망')}</td><td>${data.경과일 || '-'}</td></tr>
                </table>
            `;
    }
    // 담보한도 검색
    function generateLimitResults(results, query) {
        let html = `<h3> "${query}" 검색 결과 (${results.length}개)</h3>`;
        results.forEach(data => {
            html += `
                    <div class="doc-item">
                        <h4>${data.name}</h4>
                        <table class="result-table">
                            <tr><th>40세↓</th><th>41~50</th><th>51~60</th><th>61~65</th><th>66↑</th></tr>
                            <tr><td>${data.age40}</td><td>${data.age41_50}</td><td>${data.age51_60}</td><td>${data.age61_65}</td><td>${data.age66}</td></tr>
                        </table>
                    </div>
                `;
        });
        html += generateTasaLimitSection(results);
        return html;
    }
    function generateTasaLimitSection(results) {
        let tasaResults = [];
        results.forEach(result => {
            const name = result.name;
            if (TASA_LIMIT_DB[name]) {
                tasaResults.push(TASA_LIMIT_DB[name]);
            }
            else {
                for (const [tasaName, tasaData] of Object.entries(TASA_LIMIT_DB)) {
                    if (name.includes(tasaName) || tasaName.includes(name)) {
                        if (!tasaResults.find(r => r.name === tasaName)) {
                            tasaResults.push(tasaData);
                        }
                    }
                }
            }
        });
        if (tasaResults.length === 0)
            return '';
        let html = `<div class="tasa-section"><h3> 당타사 합산 한도 (위험등급별)</h3>`;
        tasaResults.forEach(data => {
            html += `
                    <div  class="legacy-detail-panel-50">
                        <h4  class="legacy-heading-20">${data.name}</h4>
                        <table class="result-table">
                            <tr><th>1급</th><th>2급</th><th>3급</th><th>4급</th><th>비위험</th></tr>
                            <tr><td>${data.grade1}</td><td>${data.grade2}</td><td>${data.grade3}</td><td>${data.grade4}</td><td>${data.noRisk}</td></tr>
                        </table>
                        ${data.note ? `<p  class="legacy-note-24">* ${data.note}</p>` : ''}
                    </div>
                `;
        });
        html += `</div>`;
        return html;
    }
    // 구비서류
    function selectCategory(category, button) {
        selectedCategory = category;
        app.querySelectorAll('.category-card').forEach(card => card.classList.remove('selected'));
        button.closest('.category-card').classList.add('selected');
        const tasks = DOCUMENTS_DB[category];
        const taskList = app.getElementById('taskList');
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            taskDiv.textContent = task.name;
            taskDiv.onclick = () => showDocuments(category, task);
            taskList.appendChild(taskDiv);
        });
        app.getElementById('taskSelector').classList.add('active');
        app.getElementById('documentsResult').classList.remove('active');
    }
    function showDocuments(category, task) {
        const resultBox = app.getElementById('documentsResult');
        let html = `
                <h3> ${category} > ${task.name}</h3>
                <div class="doc-item">
                    <h4> 제출서류</h4>
                    <ul>
            `;
        task.documents.forEach(doc => {
            html += `<li>${doc}</li>`;
        });
        html += `</ul></div>`;
        if (task.notes && task.notes.length > 0) {
            html += `
                    <div class="warning-box">
                        <strong> 유의사항</strong>
                        <ul  class="legacy-block-spacing-29">
                `;
            task.notes.forEach(note => {
                html += `<li>${note}</li>`;
            });
            html += `</ul></div>`;
        }
        resultBox.innerHTML = html;
        resultBox.classList.add('active');
    }
    // 후유장해 카테고리 표시
    function showDisabilityCategory(number) {
        const category = DISABILITY_CATEGORIES.find(cat => cat.number === String(number));
        const resultBox = app.getElementById('disabilityResult');
        if (!category) {
            resultBox.innerHTML = '<div class="warning-box"><h3> 카테고리를 찾을 수 없습니다</h3></div>';
            resultBox.classList.add('active');
            return;
        }
        let html = `<h3> ${category.number}. ${category.title}</h3>`;
        html += `<table class="result-table">`;
        html += `<tr><th  class="legacy-table-heading-left-35">항목</th><th  class="legacy-table-heading-left-36">지급률</th></tr>`;
        category.items.forEach(item => {
            const rateBadge = item.rate.includes('~') ? 'badge-warning' : 'badge-info';
            html += `
                    <tr>
                        <td>${item.name}</td>
                        <td><span class="badge ${rateBadge}">${item.rate}</span></td>
                    </tr>
                `;
        });
        html += `</table>`;
        // 신경계 카테고리인 경우 일상생활 버튼 추가
        if (String(number) === '13') {
            html += `
                    <div class="info-box legacy-block-spacing-02" >
                        <strong> 일상생활 기본동작 제한 상세 내용</strong>
                        <p  class="legacy-block-spacing-09">
                            "1) 신경계에 장해로 일상생활 기본동작제한 시 10~100%" 항목의 세부 내용을 확인하시려면 아래 버튼을 클릭하세요.
                        </p>
                        <button class="search-button legacy-control-48" onclick="HanaSupport.showDailyLife()" >
                             일상생활 기본동작 상세 보기
                        </button>
                    </div>
                `;
        }
        resultBox.innerHTML = html;
        resultBox.classList.add('active');
    }
    // 일상생활 기본동작 표시
    function showDailyLife() {
        const resultBox = app.getElementById('disabilityResult');
        let html = `<h3  class="legacy-heading-21"> 일상생활 기본동작(ADLs) 제한 장해평가표</h3>`;
        html += `<div class="info-box legacy-detail-panel-51" >`;
        html += `<strong>※ 이 표는 "13. 신경계, 정신행동 장해 > 1) 신경계에 장해로 일상생활 기본동작제한 시 10~100%"의 세부 기준입니다.</strong>`;
        html += `</div>`;
        // 타입별로 그룹화
        let currentType = '';
        DAILY_LIFE_ITEMS.forEach(item => {
            if (item.type && item.type !== currentType) {
                if (currentType)
                    html += `</table></div>`;
                currentType = item.type;
                html += `
                        <div class="doc-item">
                            <h4  class="legacy-heading-21">${currentType}</h4>
                            <table class="result-table">
                                <tr><th  class="legacy-table-heading-left-35">제한 정도</th><th  class="legacy-table-heading-left-36">지급률</th></tr>
                    `;
            }
            html += `
                    <tr>
                        <td  class="legacy-table-cell-left-07">${item.description}</td>
                        <td><span class="badge badge-danger">${item.rate}</span></td>
                    </tr>
                `;
        });
        html += `</table></div>`;
        resultBox.innerHTML = html;
        resultBox.classList.add('active');
    }
    // 1-5종 수술 검색
    function searchSurgery() {
        const query = app.getElementById('surgeryInput').value.trim();
        const resultBox = app.getElementById('surgeryResult');
        if (!query) {
            alert('수술명 또는 부위를 입력하세요.');
            return;
        }
        let results = [];
        const queryLower = query.toLowerCase();
        for (const [key, data] of Object.entries(SURGERY_DB)) {
            if (!data)
                continue;
            const name = (data.name || '').toLowerCase();
            const category = (data.category || '').toLowerCase();
            if (name.includes(queryLower) || category.includes(queryLower)) {
                results.push(data);
            }
        }
        if (results.length > 0) {
            let html = `<h3> "${query}" 검색 결과 (${results.length}개)</h3>`;
            let currentCategory = '';
            results.forEach(data => {
                if (data.category !== currentCategory) {
                    if (currentCategory)
                        html += `</table></div>`;
                    currentCategory = data.category;
                    html += `
                            <div class="doc-item">
                                <h4>${data.category}</h4>
                                <table class="result-table">
                                    <tr><th>번호</th><th>수술명</th><th>종류</th></tr>
                        `;
                }
                const typeLabel = data.type === '1.0' ? '1종' :
                    data.type === '2.0' ? '2종' :
                        data.type === '3.0' ? '3종' :
                            data.type === '4.0' ? '4종' :
                                data.type === '5.0' ? '5종' : data.type;
                html += `
                        <tr>
                            <td>${data.number || '-'}</td>
                            <td>${data.name}</td>
                            <td><span class="badge badge-warning">${typeLabel}</span></td>
                        </tr>
                    `;
            });
            html += `</table></div>`;
            resultBox.innerHTML = html;
            resultBox.classList.add('active');
        }
        else {
            resultBox.innerHTML = `<div class="warning-box"><h3> 검색 결과 없음</h3></div>`;
            resultBox.classList.add('active');
        }
    }
    // 특약 검색
    // 그룹별 키워드 매핑 (넓은 검색을 위해)
    const SPECIAL_SEARCH_MAP = {
        '암': ['암진단', '암수술', '암방사선', '암약물', '암입원', '암통원', '암검사', '납입면제'],
        '뇌': ['뇌진단', '뇌입원통원', '뇌수술치료', '뇌심검사'],
        '심장': ['심진단', '심입원통원', '심수술치료', '뇌심검사'],
        '수술': ['수술', '암수술', '뇌수술치료', '심수술치료'],
        '입원': ['입원', '암입원', '뇌입원통원', '심입원통원', '요양'],
        '간병': ['요양'],
        '장해': ['장해'],
        '재해': ['재해'],
        '치매': ['치매'],
        '납입면제': ['납입면제'],
        '질병': ['질병'],
    };
    function renderSpecialCard(d) {
        const availBadges = d.avail.map(a => {
            const color = a.includes('간편') ? '#e67e22' : '#008e71';
            return `<span  class="legacy-badge-34" style="background:${color};">${a}</span>`;
        }).join('');
        const groupColors = {
            '암진단': '#c0392b', '암수술': '#c0392b', '암방사선': '#c0392b', '암약물': '#c0392b',
            '암입원': '#c0392b', '암통원': '#c0392b', '암검사': '#c0392b',
            '뇌진단': '#2980b9', '뇌입원통원': '#2980b9', '뇌수술치료': '#2980b9',
            '심진단': '#8e44ad', '심입원통원': '#8e44ad', '심수술치료': '#8e44ad',
            '뇌심검사': '#16a085',
            '수술': '#27ae60', '입원': '#27ae60', '요양': '#27ae60',
            '장해': '#d35400', '납입면제': '#7f8c8d', '치매': '#1abc9c',
            '질병': '#f39c12', '재해': '#e74c3c', '기타': '#95a5a6', '사망': '#2c3e50', '주계약': '#34495e'
        };
        const groupColor = groupColors[d.group] || '#666';
        // 세부항목 렌더링
        let subHtml = '';
        if (d.sub_items && d.sub_items.filter(s => s.reason || s.sub).length > 0) {
            const validSubs = d.sub_items.filter(s => s.sub || s.reason);
            if (validSubs.length > 0) {
                // sub가 모두 단계 구분인지 확인 (단계별 테이블 vs 일반 서브항목)
                const isStepTable = validSubs.every(s => s.amount && s.amount !== '') && validSubs.every(s => !s.exemption || s.exemption === '');
                if (isStepTable && validSubs.length <= 5 && validSubs.every(s => s.sub)) {
                    // 단계별 지급기준 테이블
                    subHtml = `<div  class="legacy-block-spacing-33">
                            <div  class="legacy-block-spacing-34"> 단계별 지급기준</div>
                            <table  class="legacy-data-table-02">
                                <thead>
                                    <tr  class="legacy-detail-panel-52">
                                        <th  class="legacy-table-heading-left-37">구분</th>
                                        <th  class="legacy-table-heading-center-16">지급금액</th>
                                    </tr>
                                </thead>
                                <tbody>`;
                    const amtColors = ['#c0392b', '#e67e22', '#27ae60'];
                    validSubs.forEach((s, i) => {
                        const bg = i % 2 === 0 ? 'white' : '#fafafa';
                        const amtColor = amtColors[i] || '#008e71';
                        subHtml += `<tr  style="background:${bg};">
                                <td  class="legacy-table-cell-left-08">${s.sub}</td>
                                <td  class="legacy-table-cell-center-13" style="color:${amtColor};">${s.amount}</td>
                            </tr>`;
                    });
                    subHtml += `</tbody></table></div>`;
                }
                else {
                    // 일반 서브항목 스타일
                    subHtml = `<div  class="legacy-block-spacing-35">`;
                    validSubs.forEach(s => {
                        if (!s.reason && !s.sub)
                            return;
                        const isNoExemption = s.exemption === '면책 없음';
                        const borderColor = isNoExemption ? '#27ae60' : '#ddd';
                        subHtml += `<div  class="legacy-detail-panel-53" style="background:${isNoExemption ? '#f0faf4' : '#f9f9f9'}; border:1px solid ${borderColor}; border-left:3px solid ${borderColor};">`;
                        if (s.sub)
                            subHtml += `<div  class="legacy-block-spacing-36" style="color:${isNoExemption ? '#1a7a40' : '#555'};">${s.sub}</div>`;
                        if (s.reason)
                            subHtml += `<span  class="legacy-text-30">${s.reason.replace(/\n/g, '<br>')}</span>`;
                        subHtml += `<div  class="legacy-flex-wrap-15">`;
                        if (s.criteria && s.criteria !== '')
                            subHtml += `<span  class="legacy-badge-35"> ${s.criteria}</span>`;
                        if (s.amount && s.amount !== '')
                            subHtml += `<span  class="legacy-badge-36"> ${s.amount}</span>`;
                        if (s.reduction && s.reduction !== '-' && s.reduction !== '')
                            subHtml += `<span  class="legacy-badge-37"> 삭감: ${s.reduction}</span>`;
                        if (isNoExemption)
                            subHtml += `<span  class="legacy-badge-38"> 면책기간 없음</span>`;
                        else if (s.exemption && s.exemption !== '-' && s.exemption !== '')
                            subHtml += `<span  class="legacy-badge-39"> 면책: ${s.exemption}</span>`;
                        subHtml += `</div></div>`;
                    });
                    subHtml += `</div>`;
                }
            }
        }
        return `
                <div  class="legacy-detail-panel-54" style="border-left:4px solid ${groupColor};">
                    <div  class="legacy-flex-wrap-16">
                        <span  class="legacy-badge-40" style="background:${groupColor};">${d.group}</span>
                        ${d.num !== '-' ? `<span  class="legacy-text-31">No.${d.num}</span>` : ''}
                        <strong  class="legacy-presentation-strong-11">${d.name}</strong>
                        ${d.sub_label ? `<span  class="legacy-badge-41">${d.sub_label}</span>` : ''}
                    </div>
                    <div  class="legacy-block-spacing-37">
                        ${d.reason.replace(/\n/g, '<br>')}
                    </div>
                    <div  class="legacy-flex-wrap-17">
                        ${d.criteria && d.criteria !== '-' ? `<span  class="legacy-badge-42"> ${d.criteria.replace(/\n/g, '<br>')}</span>` : ''}
                        ${d.amount && d.amount !== '' ? `<span  class="legacy-badge-43"> ${d.amount}</span>` : ''}
                        ${d.reduction && d.reduction !== '-' ? `<span  class="legacy-badge-44"> 삭감: ${d.reduction.replace(/\n/g, '<br>')}</span>` : ''}
                        ${d.exemption && d.exemption !== '-' ? `<span  class="legacy-badge-45"> 면책: ${d.exemption}</span>` : ''}
                    </div>
                    ${availBadges ? `<div  class="legacy-block-spacing-38">${availBadges}</div>` : ''}
                    ${subHtml}
                </div>
            `;
    }
    // ===== 특약 탭: 카테고리 필터 =====
    function filterSpecialCategory(category) {
        // 버튼 활성화 표시
        app.querySelectorAll('.special-cat-btn').forEach(btn => {
            btn.style.opacity = btn.dataset.cat === category ? '1' : '0.45';
            btn.style.transform = btn.dataset.cat === category ? 'scale(1.08)' : 'scale(1)';
        });
        const CATEGORY_GROUP_MAP = {
            '암': ['암진단', '암수술', '암방사선', '암약물', '암입원', '암통원', '암검사'],
            '뇌': ['뇌진단', '뇌입원통원', '뇌수술치료'],
            '심장': ['심진단', '심입원통원', '심수술치료'],
            '수술': ['수술'],
            '입원': ['입원', '요양'],
            '간병': ['요양'],
            '장해': ['장해'],
        };
        // 뇌심검사는 뇌/심장 공통으로 추가
        if (category === '뇌')
            CATEGORY_GROUP_MAP['뇌'].push('뇌심검사');
        if (category === '심장')
            CATEGORY_GROUP_MAP['심장'].push('뇌심검사');
        const targetGroups = CATEGORY_GROUP_MAP[category] || [];
        const results = SPECIAL_DB_NEW.filter(d => targetGroups.includes(d.group));
        const welcome = app.getElementById('specialWelcome');
        const resultBox = app.getElementById('specialResult');
        if (welcome)
            welcome.style.display = 'none';
        // 카테고리 색상
        const catColors = {
            '암': '#c0392b', '뇌': '#2980b9', '심장': '#8e44ad',
            '수술': '#27ae60', '입원': '#16a085', '간병': '#d35400', '장해': '#7f8c8d'
        };
        const catColor = catColors[category] || '#008e71';
        const catEmojis = { '암': '', '뇌': '', '심장': '', '수술': '', '입원': '', '간병': '', '장해': '' };
        if (results.length > 0) {
            const groups = {};
            results.forEach(d => {
                if (!groups[d.group])
                    groups[d.group] = [];
                groups[d.group].push(d);
            });
            let html = `<div  class="legacy-detail-panel-55" style="background:${catColor}18; border-left:4px solid ${catColor};">
                    ${catEmojis[category] || ''} <strong  style="color:${catColor};">${category} 관련 특약</strong> — 총 <strong>${results.length}개</strong> (${Object.keys(groups).length}개 그룹)
                </div>`;
            for (const [grp, items] of Object.entries(groups)) {
                html += `<div  class="legacy-detail-panel-56">
                        <strong  class="legacy-presentation-strong-12" style="color:${catColor};"> ${grp} (${items.length}개)</strong>
                    </div>`;
                items.forEach(d => { html += renderSpecialCard(d); });
            }
            resultBox.innerHTML = html;
            resultBox.classList.add('active');
        }
        else {
            resultBox.innerHTML = `<div class="warning-box"><h3>해당 카테고리 데이터 없음</h3></div>`;
            resultBox.classList.add('active');
        }
    }
    // ===== 특약명으로만 검색 =====
    function searchSpecialByName() {
        const query = app.getElementById('specialInput').value.trim();
        const resultBox = app.getElementById('specialResult');
        const welcome = app.getElementById('specialWelcome');
        if (!query) {
            alert('특약명을 입력하세요.');
            return;
        }
        // 카테고리 버튼 비활성화
        app.querySelectorAll('.special-cat-btn').forEach(btn => {
            btn.style.opacity = '0.45';
            btn.style.transform = 'scale(1)';
        });
        if (welcome)
            welcome.style.display = 'none';
        // 특약명(name)에서만 검색
        const results = SPECIAL_DB_NEW.filter(d => d.name.includes(query));
        if (results.length > 0) {
            const groups = {};
            results.forEach(d => {
                if (!groups[d.group])
                    groups[d.group] = [];
                groups[d.group].push(d);
            });
            let html = `<div  class="legacy-detail-panel-57">
                     특약명 "<strong>${query}</strong>" 검색 결과 — 총 <strong>${results.length}개</strong> 특약
                </div>`;
            for (const [grp, items] of Object.entries(groups)) {
                html += `<div  class="legacy-block-spacing-39">
                        <strong  class="legacy-text-02"> ${grp} (${items.length}개)</strong>
                    </div>`;
                items.forEach(d => { html += renderSpecialCard(d); });
            }
            resultBox.innerHTML = html;
            resultBox.classList.add('active');
        }
        else {
            resultBox.innerHTML = `
                    <div class="warning-box">
                        <h3> 검색 결과 없음</h3>
                        <p>특약명에 "<strong>${query}</strong>"이 포함된 특약이 없습니다.</p>
                        <p  class="legacy-note-25">예시: 일반암진단, 뇌혈관, 심근경색, 입원, 장해, 수술</p>
                    </div>
                `;
            resultBox.classList.add('active');
        }
    }
    // ===== 초기화 =====
    function resetSpecialTab() {
        app.getElementById('specialInput').value = '';
        const resultBox = app.getElementById('specialResult');
        resultBox.classList.remove('active');
        resultBox.innerHTML = '';
        const welcome = app.getElementById('specialWelcome');
        if (welcome)
            welcome.style.display = 'block';
        app.querySelectorAll('.special-cat-btn').forEach(btn => {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        });
    }
    // ===== PDF 기반 전체 특약 표 렌더링 =====
    // ========== 대리점 담당 총무 JS ==========
    function searchStaff(query) {
        filterStaffRows(query.trim(), '');
        app.querySelectorAll('.sf-btn').forEach(function (button) {
            button.classList.toggle('is-active', button.textContent.trim() === '전체');
        });
    }
    function filterByStaff(staffName, button) {
        app.querySelectorAll('.sf-btn').forEach(function (item) {
            item.classList.toggle('is-active', item === button);
        });
        filterStaffRows('', staffName);
        app.getElementById('staffSearchInput').value = '';
    }
    const MANUAL_CATS = {
        recruit: { label: '위촉', color: '#2980b9', icon: '' },
        before: { label: '계약 전', color: '#8e44ad', icon: '' },
        newc: { label: '신계약', color: '#008e71', icon: '' },
        review: { label: '심사', color: '#e67e22', icon: '' },
        after: { label: '계약 후', color: '#c0392b', icon: '' }
    };
    // 샘플 양식 이미지 (재정질의서 / 알릴의무 추가고지서) HTML 조각
    function manualImageBlock(imgId, label, dataUrl) {
        return `
                <div  class="legacy-block-spacing-40">
                    <div  class="legacy-block-spacing-41"> ${label} 양식 샘플 (클릭 시 확대)</div>
                    <img id="${imgId}" src="${dataUrl}" alt="${label}" onclick="HanaSupport.openManualImgModal('${imgId}')"
                          class="legacy-image-preview-01">
                    <a href="${dataUrl}" download="${label}.png"
                        class="legacy-block-spacing-42"> 이미지 다운로드</a>
                </div>`;
    }
    function openManualImgModal(imgId) {
        var sourceImage = app.getElementById(imgId);
        if (!sourceImage) return;
        var modal = app.getElementById('manualImgModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'manualImgModal';
            modal.className = 'manual-image-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', '이미지 확대 보기');
            modal.hidden = true;
            modal.innerHTML = '<button type="button" class="manual-modal-close">닫기</button><img id="manualImgModalPic" class="manual-modal-image" alt="">';
            modal.addEventListener('click', function () { modal.hidden = true; });
            root.addEventListener('keydown', function (event) { if (event.key === 'Escape') modal.hidden = true; });
            root.appendChild(modal);
        }
        var image = app.getElementById('manualImgModalPic');
        image.src = sourceImage.src;
        image.alt = sourceImage.alt || '매뉴얼 이미지';
        modal.hidden = false;
        modal.querySelector('button').focus();
    }
    // 매뉴얼 검색에 사용할 일반 텍스트를 준비합니다.
    // 검색용 값은 엑셀 데이터와 분리해서 보관합니다.
    var manualSearchIndex = Object.create(null);
    function buildManualSearchText() {
        manualSearchIndex = Object.create(null);
        MANUAL_DB.forEach(item => {
            const plain = item.body.replace(/<[^>]+>/g, ' ');
            manualSearchIndex[item.id] = (item.title + ' ' + item.tags.join(' ') + ' ' + plain).toLowerCase();
        });
    }
    let manualActiveCat = '';
    function renderManualCard(item) {
        const cat = MANUAL_CATS[item.cat] || { label: item.cat || '기타', color: '#607d8b', icon: '' };
        // 화면에 표시할 때만 이미지 경로를 내장 이미지로 바꿉니다.
        const body = item.body.replace(/onclick="(?:HanaSupport\.)?openManualImgModal\(/g, 'onclick="HanaSupport.openManualImgModal(')
            .replaceAll('/manual_img_financial.png', manualImages['/manual_img_financial.png'] || '/manual_img_financial.png')
            .replaceAll('/manual_img_notice.png', manualImages['/manual_img_notice.png'] || '/manual_img_notice.png');
        return `
                <div class="manual-card legacy-detail-panel-58" data-cat="${item.cat}" data-id="${item.id}"
                      style="border-left:5px solid ${cat.color};">
                    <div  class="legacy-flex-wrap-18">
                        <span  class="legacy-badge-46" style="background:${cat.color};">${cat.icon} ${cat.label}</span>
                        <h3  class="legacy-heading-22">${item.title}</h3>
                    </div>
                    <div  class="legacy-presentation-div-13">${body}</div>
                </div>`;
    }
    function renderManualList() {
        const q = (app.getElementById('manualSearchInput') || {}).value || '';
        const query = q.trim().toLowerCase();
        const listBox = app.getElementById('manualList');
        const countBox = app.getElementById('manualCount');
        if (!listBox)
            return;
        let items = MANUAL_DB.filter(item => {
            const catOk = !manualActiveCat || item.cat === manualActiveCat;
            const qOk = !query || manualSearchIndex[item.id].includes(query);
            return catOk && qOk;
        });
        if (countBox)
            countBox.textContent = `검색결과 : ${items.length}개 항목`;
        if (items.length === 0) {
            listBox.innerHTML = `
                    <div class="warning-box">
                        <h3> 검색 결과 없음</h3>
                        <p>다른 키워드로 검색해보세요. (예 : 위촉, 외국인, 재정심사, 부활, 승환)</p>
                    </div>`;
            return;
        }
        // 카테고리 순서 고정, 그룹핑
        const order = ['recruit', 'before', 'newc', 'review', 'after'];
        // 엑셀에서 새 분류명을 입력한 항목도 전체 목록과 검색 결과에 표시합니다.
        items.forEach(item => {
            if (!order.includes(item.cat)) order.push(item.cat);
        });
        let html = '';
        order.forEach(catKey => {
            const groupItems = items.filter(i => i.cat === catKey);
            if (groupItems.length === 0)
                return;
            const cat = MANUAL_CATS[catKey] || { label: catKey || '기타', color: '#607d8b', icon: '' };
            html += `<div  class="legacy-block-spacing-43">
                    <strong  class="legacy-presentation-strong-13" style="color:${cat.color};">${cat.icon} ${cat.label} (${groupItems.length}개)</strong>
                </div>`;
            groupItems.forEach(item => { html += renderManualCard(item); });
        });
        listBox.innerHTML = html;
        // 재정질의서 / 알릴의무 이미지 지연 삽입 (base64는 아래 IMG 태그로 이미 렌더링됨)
    }
    function searchManual() { renderManualList(); }
    function filterManualCat(catKey, btn) {
        manualActiveCat = catKey;
        app.querySelectorAll('.manual-cat-btn').forEach(b => {
            const isActive = b === btn;
            b.style.background = isActive ? (b.dataset.color || '#008e71') : 'white';
            b.style.color = isActive ? 'white' : (b.dataset.color || '#555');
        });
        renderManualList();
    }
    function resetManualTab() {
        const inp = app.getElementById('manualSearchInput');
        if (inp)
            inp.value = '';
        manualActiveCat = '';
        app.querySelectorAll('.manual-cat-btn').forEach(b => {
            const isAll = b.dataset.cat === '';
            b.style.background = isAll ? '#008e71' : 'white';
            b.style.color = isAll ? 'white' : (b.dataset.color || '#555');
        });
        renderManualList();
    }
    // ========== 업무매뉴얼 검색 JS 끝 ==========
    // ========== 외국인 계약 JS ==========
    function filterForeigner(type, btn) {
        app.querySelectorAll('.fg-btn').forEach(b => {
            b.style.background = 'white';
            b.style.color = b.textContent.includes('가능') && !b.textContent.includes('조건') ? '#2e7d32'
                : b.textContent.includes('불가') ? '#c62828'
                    : b.textContent.includes('조건') ? '#e65100' : '#555';
            b.style.border = '2px solid ' + (b.textContent.includes('가능') && !b.textContent.includes('조건') ? '#2e7d32'
                : b.textContent.includes('불가') ? '#c62828'
                    : b.textContent.includes('조건') ? '#ffcc80' : '#ccc');
        });
        if (btn) {
            if (type === 'all') {
                btn.style.background = '#008e71';
                btn.style.color = 'white';
                btn.style.border = 'none';
            }
            if (type === '가능') {
                btn.style.background = '#2e7d32';
                btn.style.color = 'white';
                btn.style.border = '2px solid #2e7d32';
            }
            if (type === '불가') {
                btn.style.background = '#c62828';
                btn.style.color = 'white';
                btn.style.border = '2px solid #c62828';
            }
            if (type === '조건부') {
                btn.style.background = '#e65100';
                btn.style.color = 'white';
                btn.style.border = '2px solid #e65100';
            }
        }
        app.querySelectorAll('#foreignerGrid .fg-card').forEach(card => {
            if (type === 'all') {
                card.style.display = '';
                return;
            }
            card.style.display = card.dataset.status === type ? '' : 'none';
        });
    }
    // ========== 외국인 계약 끝 ==========
    // ========== 암보장 해외여부 JS ==========
    // 그룹 구분 색상
    const BRAIN_GROUP_COLOR = {
        "뇌혈관 질환": "#2980b9",
        "기타": "#27ae60"
    };
    const HEART_GROUP_COLOR = {
        "심장질환": "#8e44ad",
        "허혈성 심장질환": "#c0392b",
        "폐성심장병 및 폐순환의 질환": "#16a085",
        "기타 형태의 심장병": "#e67e22",
        "기타": "#27ae60",
        "식도 정맥류": "#7f8c8d"
    };
    function _cell(val, borderColor) {
        if (val === "O") {
            return `<td  class="legacy-table-cell-center-14" style="border:1px solid ${borderColor};">●</td>`;
        }
        else if (val === "" || val === undefined) {
            return `<td  class="legacy-table-cell-center-15" style="border:1px solid ${borderColor};">○</td>`;
        }
        else {
            // 텍스트값 (예: "I51까지")
            return `<td  class="legacy-table-cell-center-16" style="border:1px solid ${borderColor};">${val}</td>`;
        }
    }
    function buildCardioTables() {
        // ── 뇌혈관 테이블 ──
        const brainBody = app.getElementById('brainTableBody');
        if (!brainBody)
            return;
        brainBody.innerHTML = "";
        let lastGroup = "";
        let groupColor = "#2980b9";
        BRAIN_DATA.forEach(row => {
            const isNewGroup = row.group && row.group !== lastGroup;
            if (isNewGroup) {
                lastGroup = row.group;
                groupColor = BRAIN_GROUP_COLOR[row.group] || "#555";
            }
            const bgColor = lastGroup === "기타" ? "#f0fff4" : (lastGroup === "뇌혈관 질환" ? "#f0f8ff" : "#fff");
            const bc = "#aed6f1";
            brainBody.innerHTML += `<tr  data-name="${cardioAttribute(row.name)}" data-code="${cardioAttribute(row.code)}" data-sheet="brain" style="background:${bgColor};">
              ${isNewGroup ? `<td rowspan="1"  class="legacy-table-cell-center-17" style="border:1px solid ${bc}; background:${groupColor};">${row.group}</td>` : `<td  style="border:1px solid ${bc}; background:${bgColor};"></td>`}
              <td  class="legacy-table-cell-left-09" style="border:1px solid ${bc};">${row.name}</td>
              <td  class="legacy-table-cell-center-18" style="border:1px solid ${bc};">${row.code}</td>
              ${_cell(row.특정순환계, bc)}
              ${_cell(row.검사, bc)}
              ${_cell(row.조영술, bc)}
              ${_cell(row.후유, bc)}
              ${_cell(row.산정특례, bc)}
              ${_cell(row.뇌혈관, bc)}
              ${_cell(row.뇌졸중, bc)}
              ${_cell(row.뇌출혈, bc)}
              ${_cell(row.혈전용해, bc)}
            </tr>`;
        });
        // ── 심장 테이블 ──
        const heartBody = app.getElementById('heartTableBody');
        if (!heartBody)
            return;
        heartBody.innerHTML = "";
        lastGroup = "";
        HEART_DATA.forEach(row => {
            const isNewGroup = row.group && row.group !== lastGroup;
            if (isNewGroup) {
                lastGroup = row.group;
                groupColor = HEART_GROUP_COLOR[row.group] || "#555";
            }
            const bgMap = { "심장질환": "#fdf2f8", "허혈성 심장질환": "#fff5f5", "폐성심장병 및 폐순환의 질환": "#f0fdfa", "기타 형태의 심장병": "#fff8f0", "기타": "#f0fff4", "식도 정맥류": "#f5f5f5" };
            const bgColor = bgMap[lastGroup] || "#fff";
            const bc = "#f5b7b1";
            heartBody.innerHTML += `<tr  data-name="${cardioAttribute(row.name)}" data-code="${cardioAttribute(row.code)}" data-sheet="heart" style="background:${bgColor};">
              ${isNewGroup ? `<td rowspan="1"  class="legacy-table-cell-center-17" style="border:1px solid ${bc}; background:${groupColor};">${row.group}</td>` : `<td  style="border:1px solid ${bc}; background:${bgColor};"></td>`}
              <td  class="legacy-table-cell-left-09" style="border:1px solid ${bc};">${row.name}</td>
              <td  class="legacy-table-cell-center-19" style="border:1px solid ${bc};">${row.code}</td>
              ${_cell(row.특정순환계, bc)}
              ${_cell(row.검사, bc)}
              ${_cell(row.조영술, bc)}
              ${_cell(row.후유, bc)}
              ${_cell(row.산정특례, bc)}
              ${_cell(row.허혈성, bc)}
              ${_cell(row.급성심근, bc)}
              ${_cell(row.부정맥, bc)}
              ${_cell(row.혈전용해, bc)}
            </tr>`;
        });
    }
    function filterCardioTable(filter, btn) {
        // 버튼 활성화 스타일
        app.querySelectorAll('.cardio-filter-btn').forEach(b => {
            b.style.background = 'white';
            b.style.color = b.dataset.filter === 'brain' ? '#2980b9' : b.dataset.filter === 'heart' ? '#c0392b' : '#555';
            b.style.border = '2px solid ' + (b.dataset.filter === 'brain' ? '#2980b9' : b.dataset.filter === 'heart' ? '#c0392b' : '#ccc');
        });
        if (btn) {
            btn.style.background = filter === 'all' ? '#008e71' : filter === 'brain' ? '#2980b9' : '#c0392b';
            btn.style.color = 'white';
        }
        const brainSec = app.getElementById('brainTableSection');
        const heartSec = app.getElementById('heartTableSection');
        if (filter === 'all') {
            brainSec.style.display = '';
            heartSec.style.display = '';
        }
        if (filter === 'brain') {
            brainSec.style.display = '';
            heartSec.style.display = 'none';
        }
        if (filter === 'heart') {
            brainSec.style.display = 'none';
            heartSec.style.display = '';
        }
        // 검색어 초기화
        app.getElementById('cardioSearchInput').value = '';
        _showAllCardioRows();
    }
    function filterCardioByKeyword(kw) {
        const q = kw.trim().toLowerCase();
        ['brainTableBody', 'heartTableBody'].forEach(id => {
            const tbody = app.getElementById(id);
            if (!tbody)
                return;
            tbody.querySelectorAll('tr').forEach(tr => {
                const name = (tr.dataset.name || '').toLowerCase();
                const code = (tr.dataset.code || '').toLowerCase();
                tr.style.display = (!q || name.includes(q) || code.includes(q)) ? '' : 'none';
            });
        });
        // 검색 시 양쪽 섹션 모두 표시
        if (q) {
            app.getElementById('brainTableSection').style.display = '';
            app.getElementById('heartTableSection').style.display = '';
        }
    }
    function _showAllCardioRows() {
        ['brainTableBody', 'heartTableBody'].forEach(id => {
            const tbody = app.getElementById(id);
            if (!tbody)
                return;
            tbody.querySelectorAll('tr').forEach(tr => tr.style.display = '');
        });
    }
    // ========== 뇌심혈관 끝 ==========
    function buildSpecialFullTable() {
        const tbody = app.getElementById('specialFullTableBody');
        if (!tbody)
            return;
        // 그룹별 색상
        const groupColors = {
            '주계약': '#2c3e50', '사망': '#2c3e50',
            '장해': '#7f8c8d', '납입면제': '#7f8c8d',
            '암진단': '#c0392b', '암수술': '#c0392b', '암방사선': '#c0392b', '암약물': '#c0392b',
            '암입원': '#c0392b', '암통원': '#c0392b', '암검사': '#c0392b',
            '뇌진단': '#2980b9', '뇌입원통원': '#2980b9', '뇌수술치료': '#2980b9', '뇌심검사': '#2980b9',
            '심진단': '#8e44ad', '심입원통원': '#8e44ad', '심수술치료': '#8e44ad',
            '수술': '#27ae60',
            '입원': '#16a085', '요양': '#16a085',
            '치매': '#1abc9c', '질병': '#f39c12', '재해': '#e74c3c', '기타': '#95a5a6',
        };
        // 구분 표시명 매핑
        const groupLabel = {
            '주계약': '주계약', '사망': '사망', '장해': '장해', '납입면제': '납입면제',
            '암진단': '암 진단', '암수술': '암 수술', '암방사선': '암 방사선', '암약물': '암 약물',
            '암입원': '암 입원', '암통원': '암 통원', '암검사': '암 검사',
            '뇌진단': '뇌 진단', '뇌입원통원': '뇌 입원/통원', '뇌수술치료': '뇌 수술/치료', '뇌심검사': '뇌심 검사',
            '심진단': '심 진단', '심입원통원': '심 입원/통원', '심수술치료': '심 수술/치료',
            '수술': '수술', '입원': '입원', '요양': '요양',
            '치매': '치매', '질병': '질병', '재해': '재해', '기타': '기타',
        };
        let html = '';
        let prevGroup = null;
        SPECIAL_DB_NEW.forEach((d, i) => {
            const color = groupColors[d.group] || '#666';
            const rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa';
            const borderLeft = prevGroup !== d.group ? `border-top:2px solid ${color}30;` : '';
            prevGroup = d.group;
            // avail 배지 (일반비갱/일반갱신/간편비갱/간편갱신)
            const hasIlbanBi = hasSpecialAvailability(d.avail, '일반/비갱신');
            const hasIlbanGaeng = hasSpecialAvailability(d.avail, '일반/갱신');
            const hasGanpyeonBi = hasSpecialAvailability(d.avail, '간편/비갱신');
            const hasGanpyeonGaeng = hasSpecialAvailability(d.avail, '간편/갱신');
            const circleO = `<span  class="legacy-text-32">●</span>`;
            const circleX = `<span  class="legacy-text-33">○</span>`;
            // sub_items에서 지급기준 추가 정보
            let criteriaExtra = '';
            if (d.sub_items && d.sub_items.length > 0) {
                const validSubs = d.sub_items.filter(s => s.sub || s.amount);
                if (validSubs.length > 0) {
                    criteriaExtra = validSubs.map(s => {
                        let t = '';
                        if (s.sub)
                            t += `<span  class="legacy-text-34">${s.sub}:</span> `;
                        if (s.amount)
                            t += `<strong>${s.amount}</strong>`;
                        return t;
                    }).join('<br>');
                    criteriaExtra = `<div  class="legacy-block-spacing-44">${criteriaExtra}</div>`;
                }
            }
            const numDisplay = d.num !== '-' ? d.num : '−';
            const glbl = groupLabel[d.group] || d.group;
            html += `<tr  onmouseover="this.style.background='#f0fffe'" onmouseout="this.style.background='${rowBg}'" style="background:${rowBg}; ${borderLeft};">
                    <td  class="legacy-table-cell-center-20">${numDisplay}</td>
                    <td  class="legacy-table-cell-center-21">
                        <span  class="legacy-badge-47" style="background:${color};">${glbl}</span>
                    </td>
                    <td  class="legacy-table-cell-left-10" style="border-left:3px solid ${color};">${d.name}</td>
                    <td  class="legacy-table-cell-left-11">${d.reason.replace(/\n/g, '<br>')}</td>
                    <td  class="legacy-table-cell-center-22">${d.criteria && d.criteria !== '-' ? d.criteria.replace(/\n/g, '<br>') : '−'}${criteriaExtra}</td>
                    <td  class="legacy-table-cell-center-23" style="color:${d.reduction && d.reduction !== '-' ? '#e65100' : '#bbb'};">${d.reduction && d.reduction !== '-' ? d.reduction.replace(/\n/g, '<br>') : '−'}</td>
                    <td  class="legacy-table-cell-center-23" style="color:${d.exemption && d.exemption !== '-' ? '#c62828' : '#bbb'};">${d.exemption && d.exemption !== '-' ? d.exemption : '−'}</td>
                    <td  class="legacy-table-cell-center-24">${d.amount || '−'}</td>
                    <td  class="legacy-table-cell-center-25">
                        ${hasIlbanBi ? circleO : circleX}&nbsp;│&nbsp;${hasIlbanGaeng ? circleO : circleX}${specialAvailabilityNote(d.avail, '일반')}
                    </td>
                    <td  class="legacy-table-cell-center-25">
                        ${hasGanpyeonBi ? circleO : circleX}&nbsp;│&nbsp;${hasGanpyeonGaeng ? circleO : circleX}${specialAvailabilityNote(d.avail, '간편')}
                    </td>
                </tr>`;
        });
        tbody.innerHTML = html;
    }
    // 기존 searchSpecial (다른 곳에서 호출 시 호환용)
    function searchSpecial() { searchSpecialByName(); }

    /* 표의 스크롤 영역은 검색 결과를 다시 그려도 유지합니다. */
    function prepareResponsiveTables() {
        app.querySelectorAll('.main-content table').forEach(function (table) {
            var firstRow = table.rows[0];
            var columns = firstRow ? Array.from(firstRow.cells).reduce(function (n, cell) { return n + cell.colSpan; }, 0) : 0;
            table.classList.toggle('table-wide', columns >= 8);
            table.classList.toggle('table-medium', columns >= 5 && columns < 8);
            table.classList.toggle('table-compact', columns < 5);
            if (table.parentElement.classList.contains('table-scroll')) return;
            var parent = table.parentElement;
            var box;
            if (parent.children.length === 1 && ['auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) {
                box = parent;
            } else {
                box = document.createElement('div');
                parent.insertBefore(box, table);
                box.appendChild(table);
            }
            box.classList.add('table-scroll');
            box.tabIndex = 0;
            box.setAttribute('role', 'region');
            box.setAttribute('aria-label', '표: 가로 방향으로 스크롤하여 전체 열 확인');
            var hint = document.createElement('p');
            hint.className = 'table-hint';
            hint.textContent = '표를 좌우로 밀거나 스크롤하여 전체 내용을 확인하세요.';
            hint.hidden = true;
            box.after(hint);
        });
        updateTableScrollHints();
    }

    function updateTableScrollHints() {
        app.querySelectorAll('.table-scroll').forEach(function (box) {
            var hint = box.nextElementSibling;
            if (hint && hint.classList.contains('table-hint')) {
                hint.hidden = box.clientWidth === 0 || box.scrollWidth <= box.clientWidth + 1;
            }
        });
    }

    /* 각 행의 대리점 셀을 보관해 필터 결과에 맞춰 다시 합칩니다. */
    var staffAgencyCells = new Map();

    function prepareStaffTable() {
        app.querySelectorAll('#staffTableBody tr').forEach(function (row) {
            var agency = staffAgencyCells.get(row);
            if (!agency) {
                agency = row.cells.length === 5 ? row.cells[0] : document.createElement('td');
                if (!agency.className) agency.className = 'legacy-table-cell-left-01';
                if (!agency.textContent) agency.textContent = row.dataset.ga || '';
                agency.classList.add('staff-agency-cell');
                staffAgencyCells.set(row, agency);
            }
        });
        app.querySelectorAll('.sf-btn').forEach(function (button) {
            button.style.setProperty('--staff-color', button.dataset.color || '#008e71');
            button.classList.toggle('is-active', button.textContent.trim() === '전체');
        });
        refreshStaticControls();
    }

    function mergeStaffAgencyCells() {
        var rows = Array.from(app.querySelectorAll('#staffTableBody tr'));
        var agencyLabels = new Map();
        // 먼저 각 행을 독립된 5개 셀로 복원합니다. 숨겨진 첫 행의 rowspan이 남지 않습니다.
        rows.forEach(function (row) {
            var agency = staffAgencyCells.get(row);
            // 엑셀로 바뀐 첫 셀의 문구를 후속 행에도 반영하되, 원본 텍스트 노드는 유지합니다.
            if (!agencyLabels.has(row.dataset.ga)) {
                agencyLabels.set(row.dataset.ga, agency.textContent);
            } else if (agency.textContent !== agencyLabels.get(row.dataset.ga)) {
                agency.textContent = agencyLabels.get(row.dataset.ga);
            }
            agency.rowSpan = 1;
            if (agency.parentElement !== row) row.insertBefore(agency, row.firstElementChild);
        });
        var previousAgency = null;
        var mergedCell = null;
        rows.forEach(function (row) {
            if (row.style.display === 'none') return;
            var agency = staffAgencyCells.get(row);
            if (mergedCell && row.dataset.ga === previousAgency) {
                mergedCell.rowSpan += 1;
                agency.remove();
            } else {
                previousAgency = row.dataset.ga;
                mergedCell = agency;
            }
        });
    }

    function filterStaffRows(query, staff) {
        var agencies = new Set();
        app.querySelectorAll('#staffTableBody tr').forEach(function (row) {
            var matches = staff ? (row.dataset.staff || '') === staff :
                ((row.dataset.ga || '') + ' ' + (row.dataset.staff || '')).toLowerCase().includes(query.toLowerCase());
            row.style.display = matches ? '' : 'none';
            if (matches) agencies.add(row.dataset.ga);
        });
        mergeStaffAgencyCells();
        app.getElementById('staffCount').textContent = (staff ? staff + ' 담당: ' : '검색결과: ') + agencies.size + '개 대리점';
    }

    var layoutUpdateQueued = false;
    function queueResponsiveLayout() {
        if (layoutUpdateQueued) return;
        layoutUpdateQueued = true;
        requestAnimationFrame(function () {
            layoutUpdateQueued = false;
            prepareResponsiveTables();
        });
    }






    function refreshStaticControls() {
        refreshForeignerData();
        // 첫 실행에서는 표의 원본 셀을 먼저 보관한 다음 담당자 정보를 연결합니다.
        if (typeof staffAgencyCells !== 'undefined' && staffAgencyCells.size) refreshStaffData();
    }

    function refreshForeignerData() {
        var counts = { '가능': 0, '불가': 0, '조건부': 0 };
        var classes = {
            '가능': ['legacy-flex-row-05', 'legacy-badge-25'],
            '불가': ['legacy-flex-row-06', 'legacy-badge-26'],
            '조건부': ['legacy-flex-row-07', 'legacy-badge-27']
        };
        app.querySelectorAll('#foreignerGrid .fg-card').forEach(function (card) {
            var badge = card.querySelector('span');
            var label = badge ? badge.textContent : '';
            var status = label.includes('조건') ? '조건부' : label.includes('불가') ? '불가' : label.includes('가능') ? '가능' : '';
            card.dataset.status = status;
            card.classList.remove('legacy-flex-row-05', 'legacy-flex-row-06', 'legacy-flex-row-07', 'fg-status-unknown');
            if (badge) badge.classList.remove('legacy-badge-25', 'legacy-badge-26', 'legacy-badge-27');
            if (classes[status]) {
                counts[status]++;
                card.classList.add(classes[status][0]);
                if (badge) badge.classList.add(classes[status][1]);
            } else {
                card.classList.add('fg-status-unknown');
            }
        });
        var boxes = app.querySelectorAll('#foreignerTab .search-section > div:first-of-type > div > div:first-child');
        ['가능', '불가', '조건부'].forEach(function (status, index) {
            if (boxes[index]) {
                var node = boxes[index].firstChild;
                if (node && node.nodeType === Node.TEXT_NODE) node.textContent = counts[status];
            }
        });
        filterForeigner('all', app.querySelector('#foreignerTab .fg-btn'));
    }

    function refreshStaffData() {
        var rows = Array.from(app.querySelectorAll('#staffTableBody tr'));
        var agencyNames = new Map();
        var names = [];
        rows.forEach(function (row) {
            // 병합된 두 번째 행도 첫 번째 원본 셀의 최신 대리점명을 사용합니다.
            var key = row.dataset.agencyKey || row.dataset.ga;
            row.dataset.agencyKey = key;
            var cell = staffAgencyCells.get(row);
            if (!agencyNames.has(key)) agencyNames.set(key, cell.textContent.trim());
            row.dataset.ga = agencyNames.get(key);
            if (cell.textContent.trim() !== row.dataset.ga) cell.textContent = row.dataset.ga;
            var badge = row.querySelector('td span');
            var name = badge ? badge.textContent.trim() : '';
            row.dataset.staff = name;
            if (name && !names.includes(name)) names.push(name);
        });
        var box = app.getElementById('staffFilterBtns');
        var buttons = Array.from(box.querySelectorAll('.sf-btn'));
        var allButton = buttons[0];
        var people = buttons.slice(1);
        var ordered = people.map(function (button) { return button.textContent.trim(); }).filter(function (name, index, items) {
            return names.includes(name) && items.indexOf(name) === index;
        });
        names.forEach(function (name) { if (!ordered.includes(name)) ordered.push(name); });
        var used = new Set();
        var staffColors = new Map();
        ordered.forEach(function (name) {
            var button = people.find(function (item) { return !used.has(item) && item.textContent.trim() === name; });
            if (!button) button = people.find(function (item) { return !used.has(item); });
            if (!button) {
                button = document.createElement('button');
                button.type = 'button';
                button.className = people[0] ? people[0].className : 'sf-btn';
                button.dataset.color = '#008e71';
            }
            // 원래 텍스트 노드를 남겨서 다음 엑셀 적용·복원에도 재사용합니다.
            if (button.firstChild && button.firstChild.nodeType === Node.TEXT_NODE) button.firstChild.textContent = name;
            else button.textContent = name;
            button.hidden = false;
            button.dataset.staffName = name;
            button.removeAttribute('onclick');
            button.onclick = function () { filterByStaff(this.dataset.staffName, this); };
            var color = button.dataset.color || '#008e71';
            button.style.setProperty('--staff-color', color);
            staffColors.set(name, color);
            button.classList.remove('is-active');
            used.add(button);
            box.appendChild(button);
        });
        // CSV로 이름이 바뀌어도 위 필터 버튼에 실제 배정된 색을 함께 사용합니다.
        rows.forEach(function (row) {
            var badge = row.querySelector('td span');
            if (badge) badge.style.setProperty('--staff-color', staffColors.get(row.dataset.staff) || '#008e71');
        });
        people.forEach(function (button) { if (!used.has(button)) button.hidden = true; });
        allButton.classList.add('is-active');
        app.getElementById('staffSearchInput').value = '';
        filterStaffRows('', '');
        var total = new Set(rows.map(function (row) { return row.dataset.ga; })).size;
        app.getElementById('staffCount').textContent = '총 ' + total + '개 대리점';
        var heading = app.querySelector('#staffTab .search-section > p');
        if (heading) heading.childNodes.forEach(function (node) {
            if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/(총\s*)\d+(개\s*대리점)/, '$1' + total + '$2');
        });
    }

    function cardioAttribute(value) {
        return String(value === undefined || value === null ? '' : value).replace(/"/g, '&quot;');
    }



    // Called once by the CSV controller after it has created the current data/UI.
    var legacyBusinessInitialized = false;
    function initializeLegacyBusiness() {
        if (legacyBusinessInitialized) return;
        legacyBusinessInitialized = true;
        var simpleResult = app.getElementById('simpleResult');
        if (simpleResult) simpleResult.addEventListener('click', function (event) {
            var button = event.target.closest('[data-code]');
            if (button && SIMPLE_DISEASE_DB[button.dataset.code]) {
                showSimpleDetail(SIMPLE_DISEASE_DB[button.dataset.code]);
            }
        });
        buildChosungButtons();
        showLimitSection('age');
        buildSpecialFullTable();
        buildCardioTables();
        buildManualSearchText();
        renderManualList();
        prepareStaffTable();
        prepareResponsiveTables();
        var main = app.querySelector('.main-content');
        if (main) {
            var observer = new MutationObserver(queueResponsiveLayout);
            observer.observe(main, { childList: true, subtree: true });
        }
        root.addEventListener('click', queueResponsiveLayout);
        window.addEventListener('resize', queueResponsiveLayout);
    }

    /* 각 탭의 CSV: 내려받기 → 수정 → 파일 선택 → 미리보기 → 서버 적용 */
    function csvText(value) {
        return String(value == null ? '' : value).replace(/&(?:amp|lt|gt|quot|#39|#96);/g, function (v) { return { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#96;': '`' }[v]; });
    }
    function csvEscape(value) {
        return csvText(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    }
    function csvLines(value) { return csvEscape(value).replace(/\r?\n/g, '<br>'); }
    function hasSpecialAvailability(values, key) {
        return (values || []).some(function (value) { return value === key || value.startsWith(key + ' ('); });
    }
    function specialAvailabilityNote(values, group) {
        var notes = [];
        (values || []).forEach(function (value) {
            if (!value.startsWith(group + '/')) return;
            var match = value.match(/\s+(\([^)]*\))$/);
            if (match && !notes.includes(match[1])) notes.push(match[1]);
        });
        return notes.length ? '<small class="csv-availability-note">' + csvEscape(notes.join(', ')) + '</small>' : '';
    }
    // 업무 개수 대신 현재 CSV의 대표 업무명을 짧게 보여 줍니다.
    function documentCategorySummary(category, tasks) {
        var key = category.replace(/\s+/g, ''), company = key.includes('(법인)');
        var limit = key.startsWith('제지급') ? (company ? 2 : 3) : (company ? 1 : 2);
        var names = [];
        tasks.forEach(function (task) {
            csvText(task.name).replace(/^\[(개인|법인)\]/, '')
                .replace(/\((개인|법인|동의|사망)\)/g, '').replace(/\s+/g, ' ')
                .replace(/(?:\s*보험료)?\s*신청서$/, '').split(',').forEach(function (name) {
                    name = name.trim(); if (name && !names.includes(name)) names.push(name);
                });
        });
        return (company ? '법인 ' : '') + names.slice(0, limit).join(', ') + (tasks.length > 1 ? ' 등' : '');
    }
    function renderCsvChoices() {
        var categories = app.querySelector('#documentsTab .category-selector'); categories.replaceChildren();
        var taskCount = 0;
        Object.keys(DOCUMENTS_DB).forEach(function (key) {
            var tasks = DOCUMENTS_DB[key]; taskCount += tasks.length;
            var button = document.createElement('button'); button.type = 'button'; button.className = 'category-card';
            var title = document.createElement('h3'); title.textContent = csvText(key); button.appendChild(title);
            var description = document.createElement('p'); description.textContent = documentCategorySummary(key, tasks); button.appendChild(description);
            button.addEventListener('click', function () { selectCategory(key, button); }); categories.appendChild(button);
        });
        app.querySelector('#documentsTab h2').textContent = '제지급 업무처리별 구비서류 (' + taskCount + '개 업무)';
        var disabilities = app.querySelector('#disabilityTab .suggestion-tags'); disabilities.replaceChildren();
        var shortTitles = { '눈의 장해': '눈', '귀의 장해': '귀', '코의 장해': '코', '씹어먹거나 말하는 장해': '씹어먹거나 말하기', '외모의 추상 장해': '외모', '척추(등뼈)의 장해': '척추', '체간골의 장해': '체간골', '팔의 장해': '팔', '다리의 장해': '다리', '손가락 장해': '손가락', '발가락의 장해': '발가락', '흉·복부장기 및 비뇨생식기의 장해': '흉·복부장기', '신경계, 정신행동 장해': '신경계' };
        DISABILITY_CATEGORIES.forEach(function (category) { var title = csvText(category.title); var button = document.createElement('button'); button.type = 'button'; button.className = 'suggestion-tag'; button.textContent = category.number + '. ' + (shortTitles[title] || title); button.addEventListener('click', function () { showDisabilityCategory(category.number); }); disabilities.appendChild(button); });
        var daily = document.createElement('button'); daily.type = 'button'; daily.className = 'suggestion-tag'; daily.textContent = '일상생활 기본동작'; daily.addEventListener('click', showDailyLife); disabilities.appendChild(daily);
    }
    function renderCsvContracts() {
        var section = app.querySelector('#newContractTab .search-section');
        Array.from(section.children).forEach(function (e) { if (e.tagName !== 'H2' && !e.classList.contains('csv-admin-panel')) e.remove(); });
        var groups = new Map();
        (appData.NEW_CONTRACT_ROWS || []).forEach(function (r) { if (!groups.has(r.category)) groups.set(r.category, []); groups.get(r.category).push(r); });
        groups.forEach(function (rows, title) {
            function content(row) {
                var text = String(row.content || ''), terms = [];
                if (title === '대면청약 필수제출 서류') terms = ['운전면허증', '주민등록증'];
                if (title === '미성년 계약' && !row.section) terms = text.startsWith('가족관계증명서') ? ['가족관계증명서', '신분증'] : ['기본증명서(상세)'];
                if (title === '외국인 계약') terms = ['외국인 등록증', '외국인 국내거소증', '183일 이상 거주사실 확인 서류'];
                var label = text.match(/^(?:대리인이 법인 대표일시|대리인이 직원일시|변액 계약|변액 외 계약):/);
                var markup = label ? '<strong>' + csvEscape(label[0]) + '</strong>' : '';
                if (label) text = text.slice(label[0].length);
                while (text) {
                    var next = null, position = text.length;
                    terms.forEach(function (term) { var index = text.indexOf(term); if (index !== -1 && index < position) { position = index; next = term; } });
                    markup += csvLines(text.slice(0, position));
                    if (!next) break;
                    markup += '<mark class="contract-emphasis">' + csvEscape(next) + '</mark>'; text = text.slice(position + next.length);
                }
                return (row.title ? '<strong class="contract-item-title">' + csvEscape(row.title) + '</strong>' : '') + markup;
            }
            function list(items) {
                var markup = '<ul class="contract-item-list">';
                for (var index = 0; index < items.length; index++) {
                    markup += '<li>' + content(items[index]);
                    if (title === '외국인 계약' && items[index + 1] && /^→\s*예\)/.test(items[index + 1].content || '')) {
                        markup += '<ul class="contract-sublist">';
                        while (items[index + 1] && /^→\s*예\)/.test(items[index + 1].content || '')) { index++; markup += '<li>' + content(items[index]) + '</li>'; }
                        markup += '</ul>';
                    }
                    markup += '</li>';
                }
                return markup + '</ul>';
            }
            var finalNotice = title === '중요 안내';
            var card = document.createElement('div'); card.className = 'document-section csv-contract-card' + (finalNotice ? ' contract-final-notice' : '');
            var markup = '<h3 class="document-title contract-reference-title">' + csvEscape(title) + '</h3>';
            if (finalNotice) {
                rows.forEach(function (row) { markup += (row.section ? '<h4>' + csvEscape(row.section) + '</h4>' : '') + '<p>' + content(row) + '</p>'; });
            } else {
                var noticeCategory = ['대면청약 필수제출 서류', '법인 계약', '외국인 계약'].includes(title);
                var sections = new Map();
                rows.forEach(function (row) {
                    if (noticeCategory && row.section === '안내') {
                        markup += '<div class="contract-reference-notice ' + (title === '법인 계약' ? 'contract-notice-success' : 'contract-notice-warning') + '"><p>' + content(row) + '</p></div>';
                    } else {
                        var name = row.section || ''; if (!sections.has(name)) sections.set(name, []); sections.get(name).push(row);
                    }
                });
                sections.forEach(function (items, name) {
                    if (!name) { markup += list(items); return; }
                    var kind = name === '법인 공통 서류' ? ' contract-group-common' : name === '상세 구분' ? ' contract-group-details' : '';
                    markup += '<section class="contract-reference-group' + kind + '"><h4>' + csvEscape(name) + '</h4>' + list(items) + '</section>';
                });
            }
            card.innerHTML = markup; section.appendChild(card);
        });
    }
    function renderCsvForeigner() {
        var grid = app.getElementById('foreignerGrid');
        var counts = { '가능': 0, '불가': 0, '조건부': 0 };
        grid.innerHTML = (appData.FOREIGNER_ROWS || []).filter(function (r) { return r.code; }).map(function (r) {
            if (Object.prototype.hasOwnProperty.call(counts, r.status)) counts[r.status]++;
            return '<div class="fg-card csv-foreigner-card info-panel" data-status="' + csvEscape(r.status) + '"><div><strong>' + csvEscape(r.code) + '</strong><span>' + csvEscape(r.name) + '</span></div><div><b class="csv-status">' + csvEscape(r.status) + '</b>' + (r.note ? '<p>' + csvLines(r.note) + '</p>' : '') + '</div></div>';
        }).join('');
        var boxes = app.querySelectorAll('#foreignerTab .legacy-flex-wrap-10 > div');
        Object.keys(counts).forEach(function (key, index) { if (boxes[index]) boxes[index].firstElementChild.textContent = counts[key]; });
        var notes = app.getElementById('csvForeignerNotes');
        if (!notes) { notes = document.createElement('div'); notes.id = 'csvForeignerNotes'; grid.after(notes); }
        Array.from(app.querySelector('#foreignerTab').children).forEach(function (e) { if (e !== notes && e !== grid && !e.classList.contains('search-section')) e.remove(); });
        notes.innerHTML = (appData.FOREIGNER_ROWS || []).filter(function (r) { return !r.code; }).map(function (r) {
            var title = csvText(r.name || '유의사항').trim(), text = csvText(r.note || '').trim();
            if (/^(?:계약\s*)?유의사항$/.test(title)) {
                title = '유의사항'; text = text.replace(/^(?:계약\s*)?유의사항\s*[:：]?\s*/, '');
            }
            var items = text.split(/\s*•\s*|\r?\n/).map(function (item) { return item.trim(); }).filter(Boolean);
            var body = items.length > 1 ? '<ul class="contract-foreigner-list">' + items.map(function (item) { return '<li>' + csvLines(item) + '</li>'; }).join('') + '</ul>' : '<p>' + csvLines(items[0] || '') + '</p>';
            return '<section class="info-box contract-foreigner-notice"><h3>' + csvEscape(title) + '</h3>' + body + '</section>';
        }).join('');
    }
    function renderCsvStaff() {
        var body = app.getElementById('staffTableBody');
        if (typeof staffAgencyCells !== 'undefined') staffAgencyCells.clear();
        body.innerHTML = (appData.STAFF_ROWS || []).map(function (r) { return '<tr data-ga="' + csvEscape(r.agency) + '" data-staff="' + csvEscape(r.staff) + '"><td>' + csvEscape(r.agency) + '</td><td class="staff-name-cell"><span class="csv-staff-name">' + csvEscape(r.staff) + '</span></td><td class="staff-phone-cell">' + csvEscape(r.phone) + '</td><td class="staff-fax-cell">' + csvEscape(r.fax) + '</td><td class="staff-nateon-cell">' + csvEscape(r.nateon) + (r.branch ? '<div class="csv-branch">' + csvLines(r.branch) + '</div>' : '') + '</td></tr>'; }).join('');
    }
    // 체류코드의 가입 여부는 CSV 모델에서 정하며, 예전 문구 추출 방식은 사용하지 않습니다.
    function refreshForeignerData() {
        app.querySelectorAll('#foreignerGrid .fg-card').forEach(function (card) {
            ['가능', '불가', '조건부'].forEach(function (status) { card.classList.toggle('csv-status-' + status, card.dataset.status === status); });
        });
    }
    function rebindCsvData() {
        SIMPLE_DISEASE_DB = appData.SIMPLE_DISEASE_DB;
        LIMIT_DB = appData.LIMIT_DB; TASA_LIMIT_DB = appData.TASA_LIMIT_DB;
        DOCUMENTS_DB = appData.DOCUMENTS_DB; DISABILITY_CATEGORIES = appData.DISABILITY_CATEGORIES; DAILY_LIFE_ITEMS = appData.DAILY_LIFE_ITEMS;
        CARDIO_DB = appData.CARDIO_DB; SURGERY_DB = appData.SURGERY_DB; SPECIAL_DB_NEW = appData.SPECIAL_DB_NEW; SYNONYMS = appData.SYNONYMS;
        HANA_AGE_LIMIT = appData.HANA_AGE_LIMIT; HANA_RISK_LIMIT = appData.HANA_RISK_LIMIT; HANA_MERGE_AGE = appData.HANA_MERGE_AGE; HANA_MERGE_RISK = appData.HANA_MERGE_RISK; HANA_MERGE_OTHER = appData.HANA_MERGE_OTHER;
        MANUAL_DB = appData.MANUAL_DB; BRAIN_DATA = appData.BRAIN_DATA; HEART_DATA = appData.HEART_DATA;
    }
    function refreshScreen() {
        rebindCsvData(); renderCsvChoices(); renderCsvContracts(); renderCsvForeigner(); renderCsvStaff();
        app.querySelectorAll('.csv-admin-panel').forEach(function (e) { e.hidden = !csvSession.isAdmin; });
        var simpleHeading = app.querySelector('#simpleTab h2');
        if (simpleHeading) {
            simpleHeading.textContent = '간편 예외 경증질환 검색 (' + Object.keys(SIMPLE_DISEASE_DB).length + '개)';
            var version = document.createElement('span'); version.className = 'csv-data-version'; version.textContent = '2026년 7월 ver'; simpleHeading.appendChild(version);
        }
        var specialHeading = app.querySelector('#specialTab h2'); if (specialHeading) specialHeading.textContent = '(무)하나로누리는 건강보험 특약 보장기준 (' + SPECIAL_DB_NEW.length + '개 항목)';
        ['simpleResult', 'surgeryResult', 'documentsResult', 'disabilityResult', 'cardioResult'].forEach(function (id) { var e = app.getElementById(id); if (e) { e.innerHTML = ''; e.classList.remove('active'); } });
        selectedCategory = null; app.getElementById('taskList').innerHTML = ''; app.getElementById('taskSelector').classList.remove('active');
        buildManualSearchText(); showLimitSection('age'); resetSpecialTab(); buildSpecialFullTable(); buildCardioTables(); filterCardioTable('all', app.querySelector('.cardio-filter-btn[data-filter="all"]')); resetManualTab();
        prepareStaffTable(); mergeStaffAgencyCells(); prepareResponsiveTables();
        if (typeof refreshStaffData === 'function') refreshStaffData();
        filterForeigner('all', app.querySelector('#foreignerTab .fg-btn'));
    }
    function updateDataVariables(data) { appData = Object.assign(JSON.parse(JSON.stringify(defaultData)), cleanCsvDisplay(data)); refreshScreen(); }
    function searchLimit() {
        var query = app.getElementById('limitInput').value.trim();
        if (!query) { alert('특약명을 입력하세요.'); return; }
        var parent = '';
        var age = HANA_AGE_LIMIT.filter(function (row) {
            if (!/^[└├]/.test(row.name)) parent = row.name;
            return (row.name + ' ' + (row.parent || parent)).includes(query);
        });
        var risk = HANA_RISK_LIMIT.filter(function (row) { return (row.name + ' ' + (row.parent || '')).includes(query); });
        var box = app.getElementById('limitResult');
        var title = csvEscape(query);
        box.innerHTML = age.length || risk.length ? '<h3>' + title + ' 검색결과</h3>' + (age.length ? renderAgeLimit(age, '연령별 가입한도 (' + age.length + '건)') : '') + (risk.length ? renderRiskLimit(risk, '위험등급별 가입한도 (' + risk.length + '건)') : '') : '<div class="warning-box">' + title + '에 해당하는 특약을 찾을 수 없습니다.</div>';
        box.classList.add('active'); setLimitBtnActive('');
    }
    function setCsvMessage(id, message, error) {
        var panel = app.querySelector('.csv-admin-panel[data-tab="' + id + '"]'); if (!panel) return;
        var msgEl = panel.querySelector('.csv-message');
        if (msgEl) {
            msgEl.innerHTML = message; // <br> 태그 반영을 위해 innerHTML 사용
            msgEl.classList.toggle('csv-error',  !!error);
        }
    }
    function buildCsvPanels() {
        HanaCsv.tabs.forEach(function (tab) {
            var panel = app.querySelector('.csv-admin-panel[data-tab="' + tab.id + '"]'); if (!panel) return;
            panel.innerHTML = '<strong>CSV 데이터 관리</strong><div class="csv-upload-row"><label class="csv-file-label">CSV 파일 선택<input type="file" accept=".csv,text/csv" data-csv-file="' + tab.id + '"></label><button type="button" data-csv-download="' + tab.id + '">현재 CSV 내려받기</button></div><p class="csv-help">엑셀에서 수정한 뒤 CSV UTF-8(쉼표로 분리)로 저장해 주세요. 가져올 때 열 형식을 텍스트로 지정하면 설명과 전화번호를 그대로 보존할 수 있습니다. 이 탭의 자료만 변경됩니다.</p><div class="csv-preview"></div><button type="button" class="csv-apply" data-csv-apply="' + tab.id + '" hidden>검토한 CSV 적용</button>';
            if (tab.id === 'manual') {
                var help = document.createElement('p'); help.className = 'csv-help';
                help.textContent = '강조할 문장은 **두 별표**로 감싸고 셀 안 줄바꿈을 유지해 주세요. 새 목록은 내용구분을 목록시작으로 지정합니다.';
                panel.querySelector('.csv-help').after(help);
            }
        });
    }
    async function csvRequest(url, options) {
        var response = await fetch(url, Object.assign({ cache: 'no-store', credentials: 'same-origin' }, options || {}));
        var value = await response.json().catch(function () { return {}; });
        if (!response.ok) { var err = new Error(value.error || '요청을 처리하지 못했습니다.'); err.status = response.status; throw err; } return value;
    }
    function showDataSource(message, error) {
        var box = app.getElementById('csvDataStatus');
        box.textContent = message;
        box.classList.toggle('csv-error', Boolean(error));
    }
    function validateSavedData(saved) {
        if (!saved || !saved.datasets || typeof saved.datasets !== 'object') throw new Error('저장 자료의 형식이 다릅니다.');
        var checked = Object.assign({}, defaultData);
        HanaCsv.tabs.forEach(function (tab) {
            var parsed = HanaCsv.importTab(tab.id, HanaCsv.exportTab(tab.id, saved.datasets), checked);
            Object.assign(checked, parsed.datasets);
        });
        return checked;
    }
    async function loadCsvData() {
        if (CONFIG.apiBase) {
            var saved = await csvRequest(CSV_API.data);
            if (!saved.datasets) throw new Error('서버 자료를 읽지 못했습니다.');
            csvVersion = saved.activeId;
            updateDataVariables(validateSavedData(saved));
            showDataSource('공동 자료를 표시하고 있습니다. CSV 적용 내용은 서버에 저장됩니다.');
            return;
        }
        var local;
        try { local = localStorage.getItem(CONFIG.storageKey); }
        catch (error) { showDataSource('브라우저 저장소를 사용할 수 없습니다. 기본 자료로 조회할 수 있습니다.', true); }
        if (local) {
            try {
                var savedLocal = JSON.parse(local);
                var checked = validateSavedData(savedLocal);
                csvVersion = savedLocal.activeId;
                updateDataVariables(checked);
                showDataSource('이 브라우저에 적용한 CSV 자료입니다. 다른 사용자에게는 공유되지 않습니다.');
                return;
            } catch (error) { showDataSource('브라우저 저장 자료를 읽지 못하여 기본 CSV 자료를 사용합니다.', true); }
        }
        if (location.protocol !== 'file:' && CONFIG.csvFolder) {
            var rows = await Promise.all(HanaCsv.tabs.map(async function (tab) {
                var response = await fetch(CONFIG.csvFolder + encodeURIComponent(tab.filename), { cache: 'no-store' });
                if (!response.ok) throw new Error('기본 CSV를 읽지 못했습니다: ' + tab.filename);
                return { id: tab.id, csv: await response.text() };
            }));
            var next = Object.assign({}, defaultData);
            rows.forEach(function (item) { Object.assign(next, HanaCsv.importTab(item.id, item.csv, next).datasets); });
            updateDataVariables(next);
            showDataSource('csv 폴더의 기본 자료입니다. 화면에서 업로드하면 이 브라우저에만 저장됩니다.');
        } else showDataSource('내장 기본 자료입니다. 화면에서 업로드하면 이 브라우저에만 저장됩니다.');
    }
    function downloadTabCsv(id) {
        var tab = HanaCsv.tabs.find(function (t) { return t.id === id; });
        var blob = new Blob([HanaCsv.exportTab(id, appData)], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = tab.filename; a.click(); URL.revokeObjectURL(url);
    }
    async function previewTabCsv(id, file) {
        if (!csvSession.isAdmin || csvBusy) return;
        var panel = app.querySelector('.csv-admin-panel[data-tab="' + id + '"]'); panel.querySelector('.csv-preview').replaceChildren(); panel.querySelector('.csv-apply').hidden = true; delete csvPending[id];
        try {
            if (!file || !file.name.toLowerCase().endsWith('.csv')) throw new Error('CSV 파일을 선택해 주세요.');
            if (file.size > 3000000) throw new Error('CSV 파일은 3MB 이하여야 합니다.');
            var bytes = new Uint8Array(await file.arrayBuffer()); var content;
            try { content = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch (e) { content = new TextDecoder('euc-kr', { fatal: true }).decode(bytes); }
            var parsed = HanaCsv.importTab(id, content, appData);
            var rows = HanaCsv.parse(content), tab = HanaCsv.tabs.find(function (t) { return t.id === id; });
            var table = document.createElement('table'); table.className = 'csv-preview-table';
            rows.slice(0, 6).forEach(function (row, index) { var tr = table.insertRow(); row.forEach(function (value) { var cell = document.createElement(index ? 'td' : 'th'); cell.textContent = value; tr.appendChild(cell); }); });
            var scroll = document.createElement('div'); scroll.className = 'table-scroll'; scroll.appendChild(table); 
            var message = document.createElement('div'); message.className = 'csv-message'; message.setAttribute('role', 'status'); scroll.prepend(message);
            var strong = document.createElement('strong'); strong.textContent = '업로드 미리보기'; scroll.prepend(strong); 
            panel.querySelector('.csv-preview').appendChild(scroll);
            setCsvMessage(id, file.name + ' <br> ' + parsed.rowCount + '개 데이터 행을 확인했습니다.(상위 5개 행 미리보기)<br> 적용시 ' + tab.label + '의 자료 전체가 교체됩니다.', false);
            csvPending[id] = { fileName: file.name, csv: content, baseVersion: csvVersion }; panel.querySelector('.csv-apply').hidden = false;
        } catch (error) { setCsvMessage(id, error.message, true); }
    }
    async function applyTabCsv(id) {
        if (!csvSession.isAdmin || csvBusy || !csvPending[id]) return;
        csvBusy = true; app.querySelectorAll('[data-csv-apply],[data-csv-file]').forEach(function (e) { e.disabled = true; });
        try {
            if (CONFIG.apiBase) {
                await csvRequest(CSV_API.save, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ tabId: id }, csvPending[id])) });
                await loadCsvData();
            } else {
                var parsed = HanaCsv.importTab(id, csvPending[id].csv, appData);
                var next = Object.assign({}, appData, parsed.datasets);
                var savedLocal = { activeId: 'local-' + Date.now(), datasets: next };
                localStorage.setItem(CONFIG.storageKey, JSON.stringify(savedLocal));
                csvVersion = savedLocal.activeId;
                updateDataVariables(next);
                showDataSource('이 브라우저에 적용한 CSV 자료입니다. 다른 사용자에게는 공유되지 않습니다.');
            }
            Object.keys(csvPending).forEach(function (key) { delete csvPending[key]; });
            app.querySelectorAll('.csv-apply').forEach(function (e) { e.hidden = true; });
            setCsvMessage(id, CONFIG.apiBase ? 'CSV를 공동 자료에 적용했습니다.' : 'CSV를 이 브라우저에 저장했습니다. 새로고침 후에도 유지됩니다.', false);
        } catch (error) {

            if (error.status === 409) { Object.keys(csvPending).forEach(function (key) { delete csvPending[key]; }); app.querySelectorAll('.csv-apply').forEach(function (e) { e.hidden = true; }); await loadCsvData().catch(function () { }); }
            setCsvMessage(id, error.message, true);
        } finally { csvBusy = false; app.querySelectorAll('[data-csv-apply],[data-csv-file]').forEach(function (e) { e.disabled = false; }); }
    }
    /* HTML의 버튼은 이 이름 하나로 기능을 호출합니다. */
    window.HanaSupport = {
        getElement: app.getElementById,
        filterByStaff: filterByStaff,
        filterCardioByKeyword: filterCardioByKeyword,
        filterCardioTable: filterCardioTable,
        filterForeigner: filterForeigner,
        filterManualCat: filterManualCat,
        filterSpecialCategory: filterSpecialCategory,
        openManualImgModal: openManualImgModal,
        quickSearch: quickSearch,
        resetManualTab: resetManualTab,
        resetSpecialTab: resetSpecialTab,
        searchLimit: searchLimit,
        searchManual: searchManual,
        searchSimple: searchSimple,
        searchSpecialByName: searchSpecialByName,
        searchStaff: searchStaff,
        searchSurgery: searchSurgery,
        selectCategory: selectCategory,
        showDailyLife: showDailyLife,
        showDisabilityCategory: showDisabilityCategory,
        showLimitSection: showLimitSection,
        switchTab: switchTab
    };

    buildCsvPanels();
    root.addEventListener('click', function (event) {
        var download = event.target.closest('[data-csv-download]'); if (download) downloadTabCsv(download.dataset.csvDownload);
        var apply = event.target.closest('[data-csv-apply]'); if (apply) applyTabCsv(apply.dataset.csvApply);
    });
    root.addEventListener('change', function (event) { var input = event.target.closest('[data-csv-file]'); if (input && input.files[0]) { var file = input.files[0]; previewTabCsv(input.dataset.csvFile, file); input.value = ''; } });
    refreshScreen(); initializeLegacyBusiness();
    csvBusy = true;
    app.querySelectorAll('[data-csv-apply],[data-csv-file]').forEach(function (input) { input.disabled = true; });
    loadCsvData().catch(function (error) {
        showDataSource(error.message + ' 내장 기본 자료를 표시합니다.', true);
    }).finally(function () {
        csvBusy = false;
        app.querySelectorAll('[data-csv-apply],[data-csv-file]').forEach(function (input) { input.disabled = false; });
    });

})();
