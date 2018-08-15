//计时器
var timer;
function reset_timer(root) {
    // init_wait_time()
    timer = function () {
        setTimeout(() => {
            if (WAIT_TIME) {
                --WAIT_TIME;
                $('#' + root).text(WAIT_TIME);
                timer();
            } else { }
        }, 1000);
    }
}

function clear_timer() {
    timer = () => { };
}