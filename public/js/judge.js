var N = 0;
var Now_phone;
var now_id;
//a check interval
var c;
init_wait_time()
reset_timer('seconds');

$(document).ready(function () {
    show_log();
    $('i').css('display', 'none');
    $('.notification').css('display','none');
    $('body').on('click','.notification button',function(){
        $('.notification').css('display','none');
    })
    
    var socket = io('http://localhost:3000/');
    socket.on('connect', function () {
        now_id = socket.id;
    })
    //?
    // socket.on('disconnect',function(){
    //     console.log('a user disconnected');
    //     console.log(socket.id);
    // })
    socket.on('judge_login_sucess', function (now_phone) {
        Now_phone = now_phone;
        $('.notification').css('display','none');
        chose_score();
        socket.emit('add_judge',Now_phone);
        show_judge();
    })
    socket.on('judge_login_fail', function (message) {
        show_fail_message(message);
    })
    socket.on('begin', () => {
        c = setInterval(check, 500);
        timer();
    })
    socket.on('next', () => {
        $('svg').css('display', 'none');
        init_wait_time()
        reset_timer('seconds');
        $('#seconds').text(WAIT_TIME);
        $('#commit_btn').attr("disabled", true);
    })

    $('#login-area .login').click(function (e) {
        judger_login(socket);
    })
    $('#commit_btn').click((e) => {
        let result = judge_result();
        var data = {
            'score': result,
            'phone': Now_phone
        }
        socket.emit('fill_score', data);
    })
})

function show_log() {
    $('#login-area').css('display', 'block');
    $('#score-area').css('display', 'none');
}

function show_judge() {
    $('#login-area').css('display', 'none');
    $('#score-area').css('display', 'block');
}

function chose_score() {
    $('.score').click(function (e) {
        $(e.target).siblings().removeClass('marked');
        $(e.target).addClass('marked');
        $(e.target).siblings().find('svg').css('display', 'none');
        $(e.target).find('svg').css('display', 'inline');
    })
}

function check() {
    var $array = $('.score').find('.marked');
    var array = Array.prototype.slice.call($array);
    var n = array.length;
    N = n;
    if (n >= 5) {
        $('#commit_btn').attr("disabled", false);
    } else {
        $('#commit_btn').attr("disabled", true);
    }
    if (N >= 5) {
        clearInterval(c);
        $('#commit_btn').click(judge_result);
    }
    if (WAIT_TIME === 0) {
        $('#commit_btn').trigger('click');
        clearInterval(c);
    }
}

function judge_result() {
    var $array = $('.score').find('.marked');
    var array = Array.prototype.slice.call($array);
    var result = [];
    $.each(array, function (index, item) {
        switch ($(item).attr('class').split(' ')[0]) {
            case 'zero':
                result.push(0);
                break;
            case 'sixty':
                result.push(60);
                break;
            case 'eighty':
                result.push(80);
                break;
            default:
                result.push(100);
                break;
        }
    })
    clear_timer();
    //Timeout without marking
    if (WAIT_TIME === 0) {
        return [0, 0, 0, 0, 0];
    }
    return result;
}

function judger_login(socket) {
    var phone_number = $('#login-area input').val();
    socket.emit('check_judge_login', phone_number);
}

function show_fail_message(message){
    $('.notification ').css('display','flex');
    $('.notification span').text(message);
}