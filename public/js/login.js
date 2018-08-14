$(document).ready(function(){
    var socket = io('http://localhost/admin');
    $('#login_btn').click(function(){
        socket.emit('login_sucess', socket.id);
    });
})