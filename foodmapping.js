var fs = require('fs');
var asyncLoop = require('node-async-loop');


exports.assignMen = function (givers,callback){

  fs.readFile(givers,"UTF-8",function(err,givers_data){
    if(err) callback(err,null);
        var counter = 0 ; 
        console.log("in assign men");
        console.log("file read....");
    if(givers_data.length>0){
      console.log("givers more than 0 ");
      var obj = JSON.parse(givers_data);
        asyncLoop (obj , function(item , next){
            counter ++ ; 
            console.log("Item Sex  : " + item.sex);
            console.log("ITEM : " + item);
            console.log("Object : " + obj);
            if(item.sex==true){
              var samad  = item.secpass; 
              console.log("Counter"+counter);
              delete (obj[counter]);
              callback(null,samad);
              }else {
                next();
              }

    },function(err){
      if(err) callback(err,null) ;
      counter=0;
      fs.writeFile(givers ,JSON.stringify(obj),function(err,data){
        if(err) throw err; 
        console.log("write again after deletion")
      } )
    })
  }else{
  callback(null,-1);
  }
});

}

exports.assignWomen = function  (recivers,callback){
  fs.readFile(receivers,"UTF-8",function(err,receivers_data){
    if(err) callback(err,null) ;
    if(Object.keys(receivers_data).length>0){
    asyncLoop (receivers_data , function(item , next){
      if(item.sex==false){
        callback(null,item.secpass);
      }else {
        next();
      }

    },function(err){
      if(err) callback(err,null) ;
    })
  }else{
    callback (null,-1);
  }
});
}
