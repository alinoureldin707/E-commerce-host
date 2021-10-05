const Product = require('./product.js');
const db = require('../connection.js');

class Order{

  static Oid()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT OID FROM id";
      db.query(sql,(err,res) =>{
        if(err) throw err;
        resolve(res[0].OID);
      })
    })
  }

  static async addOid()
  {
    let oid = await Order.Oid();
    let sql = "UPDATE id SET OID = ?";
     db.query(sql,[oid + 1],(err,res) =>{
       if(err) throw err;
     })
  }

  static async createOid()
  {
    await Order.addOid();
    let oid = await Order.Oid();
    return oid;
  }

  static createOrder(cid,oid)
  {
    return new Promise((resolve, reject) => {
      let sql = "INSERT INTO ordr(OID,CID,ORDER_PRICE,ORDER_DATE) VALUES(?,?,?,?)";
      db.query(sql,[oid,cid,0,new Date()],(err,result) =>{
        if(err) throw err;
        resolve(result)
      })
    });
  }

  static price(oid)
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT ORDER_PRICE FROM ordr WHERE OID = ?";
      db.query(sql,[oid],(err,res) =>{
        if(err) throw err;
        resolve(res[0].ORDER_PRICE);
      })
    })
  }

  static quantity(oid,pname,model)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT AMOUNT FROM order_product WHERE OID = ? and PNAME = ? and MODEL = ?";
      db.query(sql,[oid,pname,model],(err,res) =>{
        if(err) throw err;
        resolve(res[0].AMOUNT);
      })
    });
  }

  static addToOrder(oid,pname,model,size,num_of_pieces,player = "")
  {
    return new Promise(async(resolve, reject) => {
      let sql = "SELECT * FROM order_product WHERE OID = ? and PNAME = ? and MODEL = ? and SIZE = ? and PLAYER = ?";
      db.query(sql,[oid,pname,model,size,player],async (err,res) =>{
        if(err) throw err;
        if(res.length === 0)
        {
          sql = "INSERT INTO order_product VALUES (?,?,?,?,?,?)";
          db.query(sql,[model,pname,oid,size,player,num_of_pieces],(err,result) =>{
            if(err) throw err;
          })
        }
        else {
          let nb = res[0].AMOUNT;
          sql = "UPDATE order_product SET AMOUNT = ? WHERE PNAME = ? and MODEL = ? and OID = ? and SIZE = ? and PLAYER = ?";
          db.query(sql,[num_of_pieces + nb,pname,model,oid,size,player],(err,result) =>{
            if(err) throw err;
          })
        }

        // decrease the number of products that are ordered
        let p = new Product(pname,model);

        if(player !== "") await p.addPlayer(player,size,-1 * num_of_pieces);
        else await p.addSize(size,-1 * num_of_pieces);

        // add the price of the product to the whole order of the customer
        sql = "UPDATE ordr SET ORDER_PRICE = ? Where OID = ?";
        let product_price = (await p.price) * num_of_pieces;
        let order_price = await Order.price(oid);
        db.query(sql,[product_price + order_price,oid],(err,result) =>{
          if(err) throw err;
          resolve(result)
        });

      })
    });
    
  }

  static deleteOrder(oid)
  {
    return new Promise(async(resolve, reject) => {
      let sql = "DELETE FROM ordr WHERE OID = ?";
      db.query(sql,[oid],(err,res) =>{
        if(err) throw err;

        sql = "SELECT * FROM order_product WHERE OID = ?";
        db.query(sql,[oid],async(err,res) =>{
          if(err) throw err;
          for(let i = 0; i < res.length;i++)
          {
            let p = new Product(res[i].PNAME,res[i].MODEL);
            if(res[i].PLAYER !== "") await p.addPlayer(res[i].PLAYER ,res[i].SIZE,res[i].AMOUNT);
            else
              await p.addSize(res[i].SIZE,res[i].AMOUNT);
          }
        })
        sql = "DELETE FROM order_product WHERE OID = ?";
        db.query(sql,[oid],(err,result) =>{
          if(err) throw err;
          resolve(result)
        })
      })
    });
    
  }

  static async deleteProductFromOrder(oid,pname,model,size,player = "")
  {
    return new Promise(async(resolve, reject) => {
      let p = new Product(pname,model);
      let product_price = await p.price;
      let order_price = await Order.price(oid);
      let quantity = await Order.quantity(oid,pname,model);
      let sql = "UPDATE ordr SET ORDER_PRICE = ? WHERE OID = ?";
      db.query(sql,[order_price - product_price * quantity,oid],async(err,res) =>{
        if(err) throw err;
        sql = "DELETE FROM order_product WHERE OID = ? and PNAME = ? and MODEL = ? and SIZE = ? and PLAYER = ? ";
        db.query(sql,[oid,pname,model,size,player],async (err,result) =>{
          if(err) throw err;
          let p = new Product(pname,model);
          if(player !== "") await p.addPlayer(player,size,quantity);
          else await p.addSize(size,quantity);
          resolve(result)
        })
      })
    });
    
  }

  static showOrders()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM ordr"
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result);
      })
    })
  }

  static showOrder_products()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM order_product"
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result);
      })
    })
  }

  static clear()
  {
    return new Promise((resolve, reject) => {
      let sql = "DELETE FROM ordr";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        sql = "DELETE FROM order_product";
        db.query(sql,(err,result) =>{
          if(err) throw err;
          resolve(result)
        })
      })
    });
    
  }

  static restartOid()
  {
    return new Promise((resolve, reject) => {
      let sql = "Update id SET OID = 0";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result)
      })
    });
    
  }

}

module.exports = Order;
