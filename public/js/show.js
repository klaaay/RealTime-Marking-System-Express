//a check interval
var Interval;

reset_timer('timer_count span');

$(document).ready(function () {
    $('#projects .project h1').text('等待评委登陆......');
    $('.my-nav button').attr('disabled', true);
    var socket = io();
    socket.on('add_judge', function (id) {
        if (id_list.indexOf(id) === -1) {
            add_judge(id);
            id_list.push(id);
            if (id_list.length >= JUDGE_AMOUNT) {
                $('#projects .project h1').text('所有评委等待就绪');
                button_switch('init')
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
        fill_score(data.id, data.score);
    })

    $('#init').click((e) => {
        socket.emit('init');
    })
    $('#begin').click((e) => {
        socket.emit('begin');
        reset_timer('timer_count span');
        timer();
        Interval = setInterval(check_timeout,1000);
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
            WAIT_TIME = 60;
            clearInterval(Interval);
            button_switch('end');
        } else {
            groups_switch(groups_info, curren_group);
            WAIT_TIME = 60;
            all_zero();
            button_switch('begin');
            socket.emit('next');
        }
    })
})

function add_judge(id) {
    var $judge = $('<div id="' + id + '" class="judge"></div>');
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

function fill_score(id, score) {
    var $arry = $('#' + id).find('ul span');
    for (var i = 0; i < $arry.length - 1; i++) {
        $($arry[i]).text(score[i]);
    }
}

function check_timeout() {
    console.log(1)
    if (WAIT_TIME) {
    } else {
        $('#done').trigger('click');
        clear_timer();
    }
}

function show_total() {
    var divide = [0.2, 0.2, 0.2, 0.2, 0.2];
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