const mysql=require('mysql');

const connection = mysql.createConnection(
    {
        host:'localhost',
        user:'root',
        password:'SanikaD*0108',
        port:3306,
        database:'hostel_management'
        
        
    }
);

connection.connect((err)=>{
    if(err){console.log(err)
       
    }
    else{console.log('connected...')}
});


module.exports=(connection);