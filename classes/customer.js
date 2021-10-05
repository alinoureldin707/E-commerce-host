const db = require('../connection.js');

class Customer{

  static Cid()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT CID FROM id";
      db.query(sql,(err,res) =>{
        if(err) throw err;
        resolve(res[0].CID);
      })
    })
  }

  static async addCid()
  {
    let cid = await Customer.Cid();
    let sql = "UPDATE id SET CID = ?";
     db.query(sql,[cid + 1],(err,res) =>{
       if(err) throw err;
     })
  }

  static filter(search)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT * FROM customers WHERE LNAME like ?";
      db.query(sql,["%"+search+"%"],(err,result)=>{
        if(err) throw err;
        resolve(result);
      })
    });
  }

  static async createCid()
  {
    await Customer.addCid();
    let cid = await Customer.Cid();
    return cid;
  }

  // add customer
  static addCustomer(cid,fname,lname,address,phone)
  {
    return new Promise((resolve, reject) => {
      let sql = "INSERT INTO customers(CID,FNAME,LNAME,ADDRESS,PHONE) VALUES(?,?,?,?,?)";
      db.query(sql,[cid,fname,lname,address,phone],(err,result) =>{
        if(err) throw err;
        resolve(result)
      })
    });
  }


  // show customers
  static showCustomers()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM customers"
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result);
      })
    })
  }

  // delete customer
  static deleteCustomer(cid)
  {
    return new Promise((resolve, reject) => {
      let sql = "DELETE FROM customers WHERE CID = ?";
      db.query(sql,[cid],(err,result) =>{
        if(err) throw err;
        resolve(result)
      })
    });
    
  }

  static existAccount(username)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT * FROM login_account WHERE USERNAME = ?";
      db.query(sql,[username],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(false);
        else resolve(true);
      })
    });
  }

  static async addAccount(username,password)
  {
    let errorMessage = {
      message : "This account is already exist"
    }
    return new Promise(async(resolve, reject) => {
      if(! await Customer.existAccount(username))
      {
        let sql = "INSERT INTO login_account(USERNAME,PASSWORD,LOGIN_DATE) VALUES(?,?,?)"
        db.query(sql,[username,password,new Date()],(err,result) =>{
          if(err) throw err;
          resolve(result)
        })
      }
      else resolve(errorMessage)
    });
  }

  static deleteAccount(username)
  {
    return new Promise((resolve, reject) => {
      let sql = "DELETE FROM login_account WHERE USERNAME = ?"
      db.query(sql,[username],(err,result) =>{
        if(err) throw err;
        resolve(result)
      })
    });
  }

  static showAccounts()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM login_account"
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result);
      })
    })
  }

  static removeAllAcounts()
  {
    return new Promise((resolve, reject) => {
      let sql = "DELETE FROM login_account";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result)
      })
    }); 
  }

  static filterAccounts(search)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT * FROM login_account WHERE USERNAME like ?";
      db.query(sql,["%"+search+"%"],(err,result)=>{
        if(err) throw err;
        resolve(result);
      })
    });
  }

  static clear()
  {
    return new Promise((resolve, reject) => {
      let sql = "DELETE FROM customers";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result)
      })
    });
    
  }

  static restartCid()
  {
    return new Promise((resolve, reject) => {
      let sql = "Update id SET CID = 0";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result)
      })
    });
  }
  
}


module.exports = Customer;
