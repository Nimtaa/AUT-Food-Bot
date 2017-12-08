const TelegramBot = require('node-telegram-bot-api');
var tesseract = require('node-tesseract');
var request = require('request') ;
var fs  = require('fs');
var foodmapping = require('./foodmapping');
// replace the value below with the Telegram token you receive from @BotFather
const token = '450360070:AAG1IZAr8LXh3AYSAJc5xOCbqBjv071VepE';
const pending_state = "PENDING" ;
const  give_launch_state = "GIVELAUNCH" ;
const  receive_launch_state ="RECEIVELAUNCH" ;
const give_dinner_state = "GIVEDINNER" ;
const receive_dinner_state = "RECEIVEDINNER";
// /start command getting user informations
// /order command getting user order


// Recognize text of any language in any format

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
//Reading captcha
	//
	// request.post('http://samad.aut.ac.ir', {
	// 'auth': {
	// 	'username': '9431006',
	// 	'password': 'Nima9112543378',
	// 	'captcha_input' = captcha;
	// 	'X-CSRF-TOKEN' : 'ac6db6c6-1615-49d4-b2cc-f5e97cfd29fa',
	// 	'sendImmediately': false
	// 	},function(err,res,body){
	// 		if(err){
	// 	console.log(err);
	// 	else{
	// 	console.log("log in succeeded");
	// 	}}
	// 	}
	// });
var User ;
var array = new Array();
var isvalidUser = false ;
var  UserSex = null ;  //Male true Female false
var sex = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
[{ text: 'آقا', callback_data: 'Male'  } ],
[{ text: 'خانم', callback_data: 'Femail' }]
    ]
  })
};
var options = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
[{ text: 'میخوام غذا (ناهار) بدم !', callback_data: 'giveLaunch'  } ],
[{ text: 'میخوام غذا (ناهار) بگیرم!', callback_data: 'receiveLaunch' }] ,
[{ text: 'میخوام غذا (شام) بدم !', callback_data: 'giveDinner'  } ],
[{ text: 'میخوام غذا (شام) بگیرم!', callback_data: 'receiveDinner'  } ]
    ]
  })
};

console.log(UserSex);

var chatID;
var studentNo = 0;
var name = "";
var lname = "";

bot.onText(/\/start/, (msg) => {
  if(!isvalidUser){
  bot.sendMessage(msg.chat.id,"لطفا شماره دانشجویی خودتان را وارد کنید .").then(function(infos){
    bot.on('message',(msg1) =>{
        if(studentNo!=0) return ;
          studentNo = msg1.text ;
          if(Number(studentNo)>=9700000) {
              isvalidUser = false; 
              bot.sendMessage(msg.chat.id,"شماره دانشجویی اشتباه است."+"\n"+"/start");
              return ; 
          }
         bot.sendMessage(msg1.chat.id,"لطفا نام خود را وارد کنید").then(function(info){
         bot.on('message',(FirstName) =>{
          if(name!="") return ;
            name = FirstName.text;
            bot.sendMessage(FirstName.chat.id,"لطفا نام خانوادگی تان را وارد کنید .").then(function(info){
            bot.on('message',(LastName) =>{
              if(lname!="" ) return ;
               lname = LastName.text;
               console.log(studentNo + " NAME : "+ name + " LASTNAME : "+lname);
               bot.sendMessage(LastName.chat.id,"لطفا جنسیت خود را مشخص نمایید . " , sex).then(function(info){
               bot.on('callback_query',function(callbackQuery){
                  if(UserSex==true || UserSex==false) return ;
                    if(callbackQuery.data == 'Male') {
                      UserSex = true;
                       User = {
                        "student_number" : studentNo ,
                        "first_name" : name ,
                        "last_name" : lname ,
                        "sex" : UserSex ,
                        "state" : pending_state,
                        "secpass" : 0

                      }
                      array.push(User);
                      fs.appendFile('users.json',JSON.stringify(array), function(err){
                      if(err) throw err ;
                      console.log("file saved ");
                      isvalidUser = true ;

                    });
                    bot.sendMessage(LastName.chat.id,"دریافت شد .").then(function(accepted){
                      bot.sendMessage(LastName.chat.id , "شما می توانید با دستور"+"/order"+ "ادامه دهید . ");
                      // TODO:  save to file  and shoud clean the variables
                     console.log("done getting information");
                    });
                  }
                  else if(callbackQuery.data =='Female'){
                    UserSex= false;
                     User = {
                      "student_number" : studentNo ,
                      "first_name" : name ,
                      "last_name" : lname ,
                      "sex" : UserSex ,
                      "state" : pending_state,
                      "secpass" : 0
                    }
                    array.push(User);
                    fs.appendFile('users.json',JSON.stringify(array), function(err){
                      if(err) throw err ;
                      console.log("file saved ");
                      isvalidUser = true ;

                    })
                    bot.sendMessage(LastName.chat.id,"دریافت شد .").then(function(accepted){
                      bot.sendMessage(LastName.chat.id , "شما می توانید با دستور"+"/order"+ "ادامه دهید . ");
                      // TODO:  save to file  and shoud clean the variables
                     console.log("done getting information");
                    });}
                });
              });
            });
          });
        });
      });
    });
  });
}else {bot.sendMessage(msg.chat.id,"شما در سیستم وارد شدید . "); }
  });

bot.onText(/\/order/, (msg) => {
    var secondPass ;
    if(!isvalidUser){
      bot.sendMessage(msg.chat.id,"first you should login to bot ! by /start command ");
    }
  else{
    bot.sendMessage(msg.chat.id, "لطفا یکی از گزینه های زیر را انتخاب کنید :)", options).then(function (sended) {
    bot.on("callback_query", function(callbackQuery) {
    
    if(callbackQuery.data=='giveLaunch'){
          User.state = "give_launch_state";
          bot.sendMessage(msg.chat.id,"لطفا رمز دوم سمادتان را وارد نمایید.").then(function(info){
          bot.on('message',(secpass)=>{
          User.secpass = secpass.text ;
          console.log("sec pass saved !");
          fs.appendFile('give_launch_users.json',JSON.stringify(array),function(err){
            if(err) throw err ;
            UserSex=null;
            lname ="";
            name  ="";

          });
        })});




    }

    else if (callbackQuery.data =='receiveLaunch'){
      fs.appendFile('receive_launch_users.json',JSON.stringify(array),function(err){
        if(err) throw err;
        // TODO: assigning food
        foodmapping.assignMen('give_launch_users.json',function(err,result){
          if(err) throw err ;
            console.log(result);
            bot.sendMessage(msg.chat.id , result); 
          })
        UserSex=null;
        lname ="";
        name  ="";
      })

    }
    else if(callbackQuery.data =='giveDinner'){
      User.state = give_dinner_state ;
      bot.sendMessage(msg.chat.id,"لطفا رمز دوم سمادتان را وارد نمایید.").then(function(secpass){
        bot.on('message',(secpass)=>{
        User.secpass = secpass.text ;
        console.log("sec pass saved !");
        fs.appendFile('give_dinners_users.json',JSON.stringify(array),function(err){
          if(err) throw err ;
          UserSex=null;
          lname ="";
          name  ="";

        });
      })});



    }
    else if (callbackQuery.data =='receiveDinner'){
      fs.appendFile('receive_dinner_users.json',JSON.stringify(array),function(err){
        if(err) throw err;
        //TODO assigning food
        UserSex=null;
        lname ="";
        name  ="";
      })
    }
  });


});
}
});




//  function donetwork(username , password ){
//
// 	 console.log("Doing NETWORK .... ");
// 	 console.log("username : " + username + "   " + "pass" + password   );
//
// 	 var captcha ;
// 	 request('http://samad.aut.ac.ir/captcha.jpg').pipe(fs.createWriteStream('captcha.png').on('close', function() {
// 	   console.log('file done');
// 	 		tesseract.process( '/media/nima/DEF469ECF469C77D/projects/AUTFood/captcha.png',function(err, text) {
// 	 			if(err) {
// 	 				console.error(err);
// 	 			}
// 				else {
// 	 				console.log(text);
// 	 				var captcha = text;
// 					request.post('http://samad.aut.ac.ir', {
//   				'auth': {
//       		'username': username,
//       		'password': password,
//   				'captcha_input' : captcha ,
//   				'X-CSRF-TOKEN' : 'ac6db6c6-1615-49d4-b2cc-f5e97cfd29fa',
//       		'sendImmediately': false
//   },function(err,res,body){
//     console.log("requested ... ");
// 			if(err){
// 				console.log(err);
// 			}
// 				else{
// 					console.log("log in succeeded");
// 				}
// 			}
// 	});
// }
// });
//
//  		}));
// 	//  }));
//
//  }
