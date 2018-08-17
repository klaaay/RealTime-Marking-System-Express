var WAIT_TIME = 120;

var phone_list = [];
var user_list = new Object;
var groups_info = [];

var judge_result = new Object;
var groups_result = [];
var group_result = new Object;

var curren_group = 0;
var JUDGE_AMOUNT = 2;

var ALREADY_START = 0;
var CONTINUE = 0;

var stand = ["show","face","function","code","team","total"];
var divide = [0.2, 0.2, 0.2, 0.2, 0.2];

function init_wait_time(){
  WAIT_TIME = 120;
}