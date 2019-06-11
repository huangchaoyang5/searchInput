/* Copyright 2018 chaoyang huang   
*　source code link ==> https://github.com/huangchaoyang5/searchInput
*/

if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    }
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun/*, thisArg*/) {
        'use strict';

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}

; (function ($) {

    $.fn.searchInput = function (opts) {

        var defaults = {
            titleHtml: '',                             //append html string
            inputID: '',                               //search input tag ID
            inputName: '',                             //search input tag name
            inputPlaceholder: '',
            inputStyle: '',                            //search input append or overwirte default style
            inputRequired: false,                      //search input become Required
            inputValue: '',                            //search input overwirte value
            inputResultStyle: '',                      //search result div append or overwirte default style
            onSelectedColorCode: '#f0e0e0',            //display color when hover the reuslt data
            hasAjax: false,                            //if true then get search result data by $.getJSON return list of string
            ajaxUrl: '',                               //input value will be assigned after = when calling this prototype ex: /{path}/{pageName}?{parameter}=
            taiwanCity: false                          //if true then default method (search taiwan city and area) eventhough hasAjax parameter become true (P.S if ajaUrl is filled, find road and street by ajax)
        };

        var opts = $.extend({}, defaults, opts);

        //check element is already exist
        var testExistInput = document.getElementById(opts.inputID);
        if (testExistInput != null) {
            console.log('search input - element id is already exist!');
            return;
        }

        if (opts.inputID == '' || opts.inputName == '') {
            console.log('search input - inputID and inputName must have value!');
            return;
        }

        if (opts.hasAjax && opts.ajaxUrl.trim() == '') {
            console.log('search input - ajaxUrl must have value!');
            return;
        }

        //create title
        if (opts.titleHtml != '') {
            $(this).append(opts.titleHtml);
        }

        //create input
        var eleInput = document.createElement('input');
        eleInput.id = opts.inputID;
        eleInput.name = opts.inputName;
        if (opts.inputPlaceholder != '')
            eleInput.placeholder = opts.inputPlaceholder;
        eleInput.type = 'text';
        eleInput.autocomplete = 'off';
        eleInput.style.display = 'inline-block';
        eleInput.style.cssText += ';' + opts.inputStyle;
        eleInput.value = opts.inputValue;
        eleInput.required = opts.inputRequired;
        $(this).append(eleInput);

        $(this).append("<br />");  //make div result under the input for ie browser

        //create searchResult
        var eleInputResult = document.createElement('div');
        eleInputResult.id = opts.inputID + 'Result';
        eleInputResult.style.width = eleInput.offsetWidth + 'px';
        eleInputResult.style.backgroundColor = 'white';
        eleInputResult.style.zIndex = 500;

        //ie need to use this method
        try {
            var tempObj = eleInput.getBoundingClientRect();
            eleInputResult.style.left = (tempObj.left) + 'px';
        }
        catch (ex) {
            eleInputResult.style.left = (eleInput.offsetLeft) + 'px';
        }


        eleInputResult.style.position = 'absolute';
        eleInputResult.style.display = 'none';
        eleInputResult.style.overflowY = 'auto';
        eleInputResult.style.maxHeight = '180px';
        eleInputResult.style.border = '1px #cdcdcd solid';
        eleInputResult.style.cssText += ';' + opts.inputResultStyle;
        $(this).append(eleInputResult);


        //behavior
        var isMouseOverResult = false;
        $(eleInput).focusout(function () {
            if (isMouseOverResult && !opts.hasAjax) {
                $(eleInput).focus();
                isMouseOverResult = false;
                return;
            }

            $(eleInputResult).hide();
        });

        eleInput.onfocus = function (e) {

            eleInput.placeholder

            if (typeof e === 'undefined')
                e = event;

            var loadData = eleInputBehavior(this, e);
            if (loadData)
                CreateSelectResult(this, opts.taiwanCity, opts.hasAjax);
        };

        //specal case for enter key
        eleInput.onkeydown = function (e) {

            var charCode = 0;
            if (typeof e !== 'undefined') {
                charCode = (typeof e.which === "number") ? e.which : e.keyCode;
            }

            var resultTag = document.getElementById(this.id + 'Result');

            //hit enter
            if (charCode == 13 && $(resultTag).is(":visible")) {
                var onSelected = $(this).find("div.onSelected");
                if (onSelected.length != 0) {
                    obj.value = onSelected[0].innerText.trim();
                }
                return false;
            }

        };

        eleInput.onkeyup = function (e) {

            if (typeof e === 'undefined')
                e = event;

            var loadData = eleInputBehavior(this, e);
            if (loadData)
                CreateSelectResult(this, opts.taiwanCity, opts.hasAjax);
        };

        eleInputResult.onmouseover = function () {
            isMouseOverResult = true;
        };

        eleInputResult.onmouseout = function () {
            isMouseOverResult = false;
        };

        var ajaxStopLoading = false;

        function eleInputBehavior(obj, e) {

            var charCode = 0;
            if (typeof e !== 'undefined') {
                charCode = (typeof e.which === "number") ? e.which : e.keyCode;
            }

            var resultTag = document.getElementById(obj.id + 'Result');

            //not onfocuse
            if (charCode > 0) {

                if (charCode == 27) {
                    $(resultTag).hide();
                    return false;
                }

                //hit enter
                if (charCode == 13) {

                    var onSelected = $(resultTag).find("div.onSelected");
                    if (onSelected.length != 0) {
                        obj.value = onSelected[0].innerText.trim();
                        $(resultTag).hide();  //check any area find if not hide first

                        //if it's ajax call don't need to search again
                        if (opts.hasAjax) {
                            return false;
                        }

                    }

                    $(resultTag).hide();  //when keyup event happen the result block is still display while the event is not first time

                }

                if (charCode == 38 || charCode == 40) {

                    if (resultTag.style.display != 'none') {

                        var onSelected = $(resultTag).find("div.onSelected");
                        if (onSelected.length == 0) {
                            resultTag.childNodes[0].className = 'onSelected';
                            resultTag.childNodes[0].style.backgroundColor = opts.onSelectedColorCode;
                        } else {
                            switch (charCode) {
                                case 38:
                                    var previous = onSelected[0].previousSibling;
                                    if (previous != null) {
                                        previous.className = 'onSelected';
                                        previous.style.backgroundColor = opts.onSelectedColorCode;
                                        previous.nextSibling.className = '';  //onselected has been changed
                                        previous.nextSibling.style.backgroundColor = '';
                                        var distance = previous.offsetTop + previous.offsetHeight;
                                        if (distance > 0)
                                            resultTag.scrollTop -= previous.offsetHeight;
                                    }
                                    break;
                                case 40:
                                    var next = onSelected[0].nextSibling;
                                    if (next != null) {
                                        next.className = 'onSelected';
                                        next.style.backgroundColor = opts.onSelectedColorCode;
                                        onSelected[0].className = '';
                                        onSelected[0].style.backgroundColor = '';
                                        var distance = next.offsetTop + next.offsetHeight;
                                        if (distance > 140)
                                            resultTag.scrollTop += next.offsetHeight;
                                    }
                                    break;
                            }
                        }

                        return false; //select by up and dowm
                    }
                }

            } else {


                if (opts.hasAjax) {
                    $(resultTag).hide();  //check any area find if not hide first
                    return false;
                }

            }

            return true;
        }

        function CreateSelectResult(obj) {

            var resultTag = document.getElementById(obj.id + 'Result');
            resultTag.innerHTML = '';

            if (opts.taiwanCity) {

                var isFirst = true;
                var datas = taiwanCityAndArea(obj.value.trim());

                $.each(datas, function (key, value) {

                    var div = document.createElement('div');
                    div.style.cursor = 'pointer';
                    div.style.padding = '4px';
                    div.style.borderBottomStyle = 'solid';
                    div.style.borderBottomWidth = 'thin';
                    div.innerText = value.trim();
                    if (isFirst) {
                        div.className = 'onSelected';
                        div.style.backgroundColor = opts.onSelectedColorCode;
                        isFirst = false;
                    }
                    div.onmousedown = function () {
                        obj.value = this.innerText.trim();
                        $(resultTag).hide();
                        $(obj).focus();
                    };
                    div.onmouseover = function () {
                        var addressDiv = resultTag.getElementsByTagName('div');
                        for (var i = 0; i < addressDiv.length; i++) {
                            addressDiv[i].className = '';
                            addressDiv[i].style.backgroundColor = '';
                        }
                        this.className = 'onSelected';
                        this.style.backgroundColor = opts.onSelectedColorCode;
                    };

                    resultTag.appendChild(div);

                });

                if (datas.length > 0) {
                    $(resultTag).show();
                    $(resultTag).scrollTop(0);
                } else {
                    //find address name if city and area are exist by ajax call                   
                    if (opts.ajaxUrl.length > 0 && obj.value.trim().length >= 6) {

                        $.getJSON(opts.ajaxUrl + encodeURI(obj.value.trim()), null, function (datas) {

                            if (datas == "" || datas == null) {
                                $(resultTag).hide();
                            } else {
                                appendAjaxHint(obj, datas, isFirst, resultTag);
                            }

                        });
                    }
                }
            } else if (opts.hasAjax) {

                $.getJSON(opts.ajaxUrl + encodeURI(obj.value.trim()), null, function (datas) {
                    if (datas == "" || datas == null) {
                        $(resultTag).hide();
                    } else {
                        appendAjaxHint(obj, datas, isFirst, resultTag);
                    }
                });

            }
        }

        function appendAjaxHint(obj, datas, isFirst, resultTag) {

            resultTag.innerHTML = '';

            $.each(datas, function (key, value) {

                var thisValue = obj.value.trim()
                var searchVal = "";
                for (var i = 0; i < thisValue.length; i++) {
                    if (thisValue.charCodeAt(i) > 65280 && thisValue.charCodeAt(i) < 65375)
                        searchVal += String.fromCharCode(thisValue.charCodeAt(i) - 65248);
                    else
                        searchVal += String.fromCharCode(thisValue.charCodeAt(i))
                }

                var strArray = value.split('');
                var afterMap = jQuery.map(strArray, function (x) {
                    var matchText = searchVal.match(new RegExp(RegExp.quote(x), 'i'));
                    if (matchText !== null) {
                        return '<font style=color:red>' + x + '</font>';
                    }
                    else
                        return x;
                }).join('');

                var div = document.createElement('div');
                div.style.cursor = 'pointer';
                div.style.padding = '4px';
                div.style.borderBottomStyle = 'solid';
                div.style.borderBottomWidth = 'thin';
                div.innerHTML = afterMap;
                if (isFirst) {
                    div.className = 'onSelected';
                    isFirst = false;
                }
                div.onmousedown = function () {
                    obj.value = this.innerText.trim();
                    $(resultTag).hide();
                };
                div.onmouseover = function () {
                    var addressDiv = resultTag.getElementsByTagName('div');
                    for (var i = 0; i < addressDiv.length; i++) {
                        addressDiv[i].className = '';
                    }
                    this.className = 'onSelected';
                };

                resultTag.appendChild(div);
            });

            if (datas.length > 0) {
                $(resultTag).show();
                $(resultTag).scrollTop(0);
            }

        }

        RegExp.quote = function (str) {
            return (str + '').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
        };

        return this;
    };

})(jQuery);

/////////////////////////////////////////////////city and area//////////////////////////////////////
function taiwanCityAndArea(text) {
    var citys = ["台北市", "新北市", "基隆市", "宜蘭縣", "新竹市", "新竹縣", "桃園市", "苗栗縣", "台中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "台南市", "高雄市", "屏東縣", "台東縣", "花蓮縣", "澎湖縣", "金門縣", "連江縣"];
    var areas = [];
    areas.push({ "中正區": "100", "大同區": "103", "中山區": "104", "松山區": "105", "大安區": "106", "萬華區": "108", "信義區": "110", "士林區": "111", "北投區": "112", "內湖區": "114", "南港區": "115", "文山區": "116" });
    areas.push({ "萬里區": "207", "金山區": "208", "板橋區": "220", "汐止區": "221", "深坑區": "222", "石碇區": "223", "瑞芳區": "224", "平溪區": "226", "雙溪區": "227", "貢寮區": "228", "新店區": "231", "坪林區": "232", "烏來區": "233", "永和區": "234", "中和區": "235", "土城區": "236", "三峽區": "237", "樹林區": "238", "鶯歌區": "239", "三重區": "241", "新莊區": "242", "泰山區": "243", "林口區": "244", "蘆洲區": "247", "五股區": "248", "八里區": "249", "淡水區": "251", "三芝區": "252", "石門區": "253" });
    areas.push({ "仁愛區": "200", "信義區": "201", "中正區": "202", "中山區": "203", "安樂區": "204", "暖暖區": "205", "七堵區": "206" });
    areas.push({ "宜蘭市": "260", "頭城鎮": "261", "礁溪鄉": "262", "壯圍鄉": "263", "員山鄉": "264", "羅東鎮": "265", "三星鄉": "266", "大同鄉": "267", "五結鄉": "268", "冬山鄉": "269", "蘇澳鎮": "270", "南澳鄉": "272" });
    areas.push({ "東區": "300", "北區": "300", "香山區": "300" });
    areas.push({ "湖口鄉": "303", "新豐鄉": "304", "新埔鎮": "305", "關西鎮": "306", "芎林鄉": "307", "寶山鄉": "308", "竹東鎮": "310", "五峰鄉": "311", "橫山鄉": "312", "尖石鄉": "313", "北埔鄉": "314", "峨眉鄉": "315", "竹北市": "385" });
    areas.push({ "中壢區": "320", "平鎮區": "324", "龍潭區": "325", "楊梅區": "326", "新屋區": "327", "觀音區": "328", "桃園區": "330", "龜山區": "333", "八德區": "334", "大溪區": "335", "復興區": "336", "大園區": "337", "蘆竹區": "338" });
    areas.push({ "竹南鎮": "350", "頭份鎮": "351", "三灣鄉": "352", "南庄鄉": "353", "獅潭鄉": "354", "後龍鎮": "356", "通霄鎮": "357", "苑裡鎮": "358", "苗栗市": "360", "造橋鄉": "361", "頭屋鄉": "362", "公館鄉": "363", "大湖鄉": "364", "泰安鄉": "365", "銅鑼鄉": "366", "三義鄉": "367", "西湖鄉": "368", "卓蘭鎮": "369" });
    areas.push({ "中　區": "400", "東　區": "401", "南　區": "402", "西　區": "403", "北　區": "404", "北屯區": "406", "西屯區": "407", "南屯區": "408", "太平區": "411", "大里區": "412", "霧峰區": "413", "烏日區": "414", "豐原區": "420", "后里區": "421", "石岡區": "422", "東勢區": "423", "和平區": "424", "新社區": "426", "潭子區": "427", "大雅區": "428", "神岡區": "429", "大肚區": "432", "沙鹿區": "433", "龍井區": "434", "梧棲區": "435", "清水區": "436", "大甲區": "437", "外埔區": "438", "大安區": "439" });
    areas.push({ "彰化市": "500", "芬園鄉": "502", "花壇鄉": "503", "秀水鄉": "504", "鹿港鎮": "505", "福興鄉": "506", "線西鄉": "507", "和美鎮": "508", "伸港鄉": "509", "員林鎮": "510", "社頭鄉": "511", "永靖鄉": "512", "埔心鄉": "513", "溪湖鎮": "514", "大村鄉": "515", "埔鹽鄉": "516", "田中鎮": "520", "北斗鎮": "521", "田尾鄉": "522", "埤頭鄉": "523", "溪州鄉": "524", "竹塘鄉": "525", "二林鎮": "526", "大城鄉": "527", "芳苑鄉": "528", "二水鄉": "530" });
    areas.push({ "南投市": "540", "中寮鄉": "541", "草屯鎮": "542", "國姓鄉": "544", "埔里鎮": "545", "仁愛鄉": "546", "名間鄉": "551", "集集鎮": "552", "水里鄉": "553", "魚池鄉": "555", "信義鄉": "556", "竹山鎮": "557", "鹿谷鄉": "558" });
    areas.push({ "斗南鎮": "630", "大埤鄉": "631", "虎尾鎮": "632", "土庫鎮": "633", "褒忠鄉": "634", "東勢鄉": "635", "台西鄉": "636", "崙背鄉": "637", "麥寮鄉": "638", "斗六市": "640", "林內鄉": "643", "古坑鄉": "646", "莿桐鄉": "647", "西螺鎮": "648", "二崙鄉": "649", "北港鎮": "651", "水林鄉": "652", "口湖鄉": "653", "四湖鄉": "654", "元長鄉": "655" });
    areas.push({ "東　區": "600", "西　區": "600" });
    areas.push({ "番路鄉": "602", "梅山鄉": "603", "竹崎鄉": "604", "阿里山": "605", "中埔鄉": "606", "大埔鄉": "607", "水上鄉": "608", "鹿草鄉": "611", "太保市": "612", "朴子市": "613", "東石鄉": "614", "六腳鄉": "615", "新港鄉": "616", "民雄鄉": "621", "大林鎮": "622", "溪口鄉": "623", "義竹鄉": "624", "布袋鎮": "625" });
    areas.push({ "中西區": "700", "東　區": "701", "南　區": "702", "北　區": "704", "安平區": "708", "安南區": "709", "永康區": "710", "歸仁區": "711", "新化區": "712", "左鎮區": "713", "玉井區": "714", "楠西區": "715", "南化區": "716", "仁德區": "717", "關廟區": "718", "龍崎區": "719", "官田區": "720", "麻豆區": "721", "佳里區": "722", "西港區": "723", "七股區": "724", "將軍區": "725", "學甲區": "726", "北門區": "727", "新營區": "730", "後壁區": "731", "白河區": "732", "東山區": "733", "六甲區": "734", "下營區": "735", "柳營區": "736", "鹽水區": "737", "善化區": "741", "大內區": "742", "山上區": "743", "新市區": "744", "安定區": "745" });
    areas.push({ "新興區": "800", "前金區": "801", "苓雅區": "802", "鹽埕區": "803", "鼓山區": "804", "旗津區": "805", "前鎮區": "806", "三民區": "807", "楠梓區": "811", "小港區": "812", "左營區": "813", "仁武區": "814", "大社區": "815", "岡山區": "820", "路竹區": "821", "阿蓮區": "822", "田寮區": "823", "燕巢區": "824", "橋頭區": "825", "梓官區": "826", "彌陀區": "827", "永安區": "828", "湖內區": "829", "鳳山區": "830", "大寮區": "831", "林園區": "832", "鳥松區": "833", "大樹區": "840", "旗山區": "842", "美濃區": "843", "六龜區": "844", "內門區": "845", "杉林區": "846", "甲仙區": "847", "桃源區": "848", "那瑪夏": "849", "茂林區": "851", "茄萣區": "852" });
    areas.push({ "屏東市": "900", "三地門": "901", "霧台鄉": "902", "瑪家鄉": "903", "九如鄉": "904", "里港鄉": "905", "高樹鄉": "906", "鹽埔鄉": "907", "長治鄉": "908", "麟洛鄉": "909", "竹田鄉": "911", "內埔鄉": "912", "萬丹鄉": "913", "潮州鎮": "920", "泰武鄉": "921", "來義鄉": "922", "萬巒鄉": "923", "崁頂鄉": "924", "新埤鄉": "925", "南州鄉": "926", "林邊鄉": "927", "東港鎮": "928", "琉球鄉": "929", "佳冬鄉": "931", "新園鄉": "932", "枋寮鄉": "940", "枋山鄉": "941", "春日鄉": "942", "獅子鄉": "943", "車城鄉": "944", "牡丹鄉": "945", "恆春鎮": "946", "滿州鄉": "947" });
    areas.push({ "台東市": "950", "綠島鄉": "951", "蘭嶼鄉": "952", "延平鄉": "953", "卑南鄉": "954", "鹿野鄉": "955", "關山鎮": "956", "海端鄉": "957", "池上鄉": "958", "東河鄉": "959", "成功鎮": "961", "長濱鄉": "962", "太麻里": "963", "金峰鄉": "964", "大武鄉": "965", "達仁鄉": "966" });
    areas.push({ "花蓮市": "970", "新城鄉": "971", "秀林鄉": "972", "吉安鄉": "973", "壽豐鄉": "974", "鳳林鎮": "975", "光復鄉": "976", "豐濱鄉": "977", "瑞穗鄉": "978", "萬榮鄉": "979", "玉里鎮": "981", "卓溪鄉": "982", "富里鄉": "983" });
    areas.push({ "馬公市": "880", "西嶼鄉": "881", "望安鄉": "882", "七美鄉": "883", "白沙鄉": "884", "湖西鄉": "885" });
    areas.push({ "金沙鎮": "890", "金湖鎮": "891", "金寧鄉": "892", "金城鎮": "893", "烈嶼鄉": "894", "烏坵鄉": "896" });
    areas.push({ "南竿鄉": "209", "北竿鄉": "210", "莒光鄉": "211", "東引鄉": "212" });

    text = text.replace('臺', '台');

    if (text == '')
        return citys;
    else {

        //if zipcode is at begining remove it for search
        text = text.replace(/[0-9]/g, '').trim();

        var city = text.substring(0, 3);
        var index = citys.indexOf(city);

        if (index === -1) {
            var array = citys.filter(function (x) { return x.indexOf(text) > -1 });
            return array;
        } else {
            var array = $.map(areas[index], function (value, index) {
                //return value + " " + city + [index];
                return city + [index];
            });

            var array2 = array.filter(function (x) { return x.indexOf(text) > -1 && x.length != text.length });
            return array2;

        }
    }
}
