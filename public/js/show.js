//check intervals
var CHECK_TIMEOUT;
var CHECK_JUDGES_ONLINE;

init_wait_time()
reset_timer('timer_count span');

var socket = io();

$(document).ready(function () {

    $('#projects .project h1').text('等待评委登陆......');
    $('.my-nav button').attr('disabled', true);
    socket.on('add_judge', function (data) {
        if (phone_list.indexOf(data.phone) === -1) {
            add_judge(data.phone, data.id);
            phone_list.push(data.phone);
            user_list[((data.phone).toString())] = data.id;
            // console.log(phone_list);
            // console.log(user_list);
            if (!ALREADY_START) {
                if (phone_list.length >= JUDGE_AMOUNT) {
                    $('#projects .project h1').text('所有评委等待就绪');
                    button_switch('init')
                }
            }
        }
    })
    socket.on('groups_info', function (groups) {
        groups_info = groups;
        $('#projects .score h1').text('0');
        groups_switch(groups_info, curren_group);
        button_switch('begin');
    })
    socket.on('fill_score', (data) => {
        fill_score(data.phone, data.score);
    })
    socket.on('judge_leave', (id) => {
        var leave_phone = find_key(id);
        phone_list.splice(phone_list.indexOf(leave_phone), 1);
        socket.emit('change_judge_state', leave_phone);
        remove_judge(leave_phone);
    })

    $('#init').click((e) => {
        socket.emit('init');
    })
    $('#begin').click((e) => {
        ALREADY_START = 1;
        CONTINUE = 0;
        init_wait_time()
        reset_timer('timer_count span');
        // timer();
        CHECK_TIMEOUT = setInterval(check_timeout, 1000);
        CHECK_JUDGES_ONLINE = setInterval(check_judges_online, 1000);
        button_switch('done');
    })
    $('#done').click((e) => {
        clear_timer();
        show_total();
        calcu_total();
        button_switch('next');
    })
    $('#next').click((e) => {
        if (curren_group === groups_info.length) {
            init_wait_time();
            window.clearInterval(CHECK_TIMEOUT);
            window.clearInterval(CHECK_JUDGES_ONLINE);
            button_switch('end');
        } else {
            groups_switch(groups_info, curren_group);
            init_wait_time();
            all_zero();
            button_switch('begin');
            socket.emit('next');
        }
    })

    $('#end').click((e) => {
        ALREADY_START = 0;
        console.log(ALREADY_START);
    })
})

function add_judge(now_phone, id) {
    var $judge = $('<div id="' + now_phone + '" class="judge ' + id + '"></div>');
    var $list_group = $('<ul class="list-group"></ul>');
    var $head = $('<li id="head" class="list-group-item list-group-item-success head">' + id.slice(0, 5) + '</li>');
    var $live = $('<li class="list-group-item"><span class="badge">0</span>答辩</li>');
    var $interface = $('<li class="list-group-item"><span class="badge">0</span>界面</li>');
    var $func = $('<li class="list-group-item"><span class="badge">0</span>功能</li>');
    var $code = $('<li class="list-group-item"><span class="badge">0</span>代码</li>');
    var $group = $('<li class="list-group-item"><span class="badge">0</span>团队</li>');
    var $total = $('<li class="list-group-item"><span class="badge total">0</span>总计</li>');
    $list_group.append($head);
    $list_group.append($live);
    $list_group.append($interface);
    $list_group.append($func);
    $list_group.append($code);
    $list_group.append($group);
    $list_group.append($total);
    $judge.append($list_group);
    $('#judges').append($judge);
}

function remove_judge(leave_phone) {
    $('#' + leave_phone).remove();
}

function button_switch(name) {
    $('.my-nav button').attr('disabled', true);
    $('#' + name).attr('disabled', false);
}

function groups_switch(groups, index) {
    if (groups.length >= (index + 1)) {
        $('#projects .project h1').text(groups[index].project_name);
        $('#projects .project p').text(groups[index].group_member.reduce((acc, cur) => {
            return acc.member_name + '/' + cur.member_name;
        }));
    }
    curren_group = curren_group + 1;
}

function fill_score(phone, score) {
    var $arry = $('#' + phone).find('ul span');
    for (var i = 0; i < $arry.length - 1; i++) {
        $($arry[i]).text(score[i]);
    }
}

function check_timeout() {
    //?
    // console.log(1)
    if (WAIT_TIME) {
    } else {
        $('#done').trigger('click');
        clear_timer();
    }
}

function check_judges_online() {
    //?
    // console.log(phone_list);
    if (JUDGE_AMOUNT === phone_list.length) {
        $('#projects .project h3').text('');
        clear_timer();
        reset_timer('timer_count span');
        if (!CONTINUE) {
            socket.emit('begin', $('#timer_count').text());
            timer();
            CONTINUE = 1;
        }
    } else {
        clear_timer();
        CONTINUE = 0;
        $('#projects .project h3').text('有用户断开连接，请耐心等待重新连接...');
    }
}

function show_total() {
    var $arry = $('.judge');
    for (var i = 0; i < $arry.length; i++) {
        var $span = $($arry[i]).find('span');
        var score = [];
        for (var j = 0; j < $span.length - 1; j++) {
            score.push($($span[j]).text());
        }
        var res = calcu_pre_total(divide, score);
        $($span[$span.length - 1]).text(res);
    }
}

function calcu_pre_total(divide, score) {
    var total = 0;
    for (var i = 0; i < divide.length; i++) {
        total += divide[i] * score[i];
    }
    return total;
}

function calcu_total() {
    var result = [];
    var sum = 0;
    $arry = $('.judge .total');
    for (var i = 0; i < $arry.length; i++) {
        result.push($($arry[i]).text());
        sum += parseInt(($($arry[i]).text()));
    }
    $('#projects .score h1').text((sum / result.length).toFixed(2));
}

function all_zero() {
    $('#timer_count span').text(WAIT_TIME);
    $('#projects .score h1').text(0);
    $('.judge span').text(0);
}

function find_key(id) {
    for (var i = 0; i < phone_list.length; i++) {
        if (user_list[phone_list[i]] == id) {
            return phone_list[i];
        }
    }
    return -1;
}