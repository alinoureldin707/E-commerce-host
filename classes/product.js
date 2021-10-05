const db = require('../connection.js');
const fs = require('fs')

class Product{

  constructor(pname,model = "")
  {
    this.pname = pname;
    this.model = model;
  }

  // getters
  get pieces()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT PIECES FROM products WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[this.pname,this.model],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(0);
        else resolve(res[0].PIECES);
      })
    })
  }

  get category()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT CAT FROM procat WHERE PNAME = ?";
      db.query(sql,[this.pname],(err,res) =>{
        if(err) throw err;
        resolve(res[0].CAT);
      })
    })
  }

  get subcategory()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT SUB_CAT FROM procat WHERE PNAME = ?";
      db.query(sql,[this.pname],(err,res) =>{
        if(err) throw err;
        resolve(res[0].SUB_CAT);
      })
    })
  }

  get original_price()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT ORIGINAL_PRICE FROM products WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[this.pname,this.model],(err,res) =>{
        if(err) throw err;
        resolve(res[0].ORIGINAL_PRICE);
      })
    })
  }

  get price()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT PRICE FROM products WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[this.pname,this.model],(err,res) =>{
        if(err) throw err;
        resolve(res[0].PRICE);
      })
    })
  }

  get image()
  {
    return new Promise((resolve, reject) => {
      let sql = "SELECT IMAGE FROM products WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[this.pname,this.model],(err,res) =>{
        if(err) throw err;
        resolve(res[0].IMAGE);
      })
    })
  }

  // setters
  async addPieces(num_pieces)
  {
    let nb = await this.pieces;
    let sql = "UPDATE products SET PIECES = ? WHERE PNAME = ? and MODEL = ?";

    db.query(sql,[nb+num_pieces,this.pname,this.model],(err,res) =>{
      if(err) throw err;
    })
  }

  async updatePrice(price)
  {
    let oprice = await this.original_price;
    let sql = "UPDATE products SET PRICE = ? WHERE PNAME = ? and MODEL = ?";
    db.query(sql,[price,this.pname,this.model],(err,res) =>{
      if(err) throw err;
      let sql = "UPDATE products SET PROFITS = ? WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[price - oprice,this.pname,this.model],(err,res) =>{
        if(err) throw err;
      })
    })
  }

  // get the quantity of a size in a product
  sizePieces(size)
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM have WHERE PNAME = ? and MODEL = ? and SIZE = ?";
      db.query(sql,[this.pname,this.model,size],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(0);
        else resolve(res[0].NUM_OF_PIECES);
      })
    })
  }

  // check whether a product conatins a player or not
  havePlayer(size)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT PLAYER_NAME FROM conatins WHERE PNAME = ? and MODEL = ? and BODY_SIZE = ?";
      db.query(sql,[this.pname,this.model,size],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(false);
        else resolve(true);
      })
    });
  }

  // get the quantity of a player in a product
  playerPieces(player,size)
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM contains WHERE PNAME = ? and MODEL = ? and BODY_SIZE = ? and PLAYER_NAME = ?";
      db.query(sql,[this.pname,this.model,size,player],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(0);
        else resolve(res[0].QUANTITY);
      })
    })
  }

  // check if the product is already exist
  exist()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM products WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[this.pname,this.model],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(false);
        else resolve(true);
      })
    })
  }

  existInCategories()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM procat WHERE PNAME = ?";
      db.query(sql,[this.pname],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(false);
        else resolve(true);
      })
    })
  }


  // add a Product
  addProduct(cat,subcat,price,oprice,file,color)
  {
    let errorMessage = {
      message : 'This products already exist'
    }
    return new Promise(async(resolve, reject)=> {
      if(!await this.exist())
      {
        // move the file to the upload folder
        const filename = file.name
        file.mv('./productImages/'+filename)

        db.query("INSERT INTO products(PNAME,MODEL,PIECES,PRICE,ORIGINAL_PRICE,PROFITS,IMAGE,COLOR) values(?,?,?,?,?,?,?,?)",[this.pname,this.model,0,price,oprice,price - oprice,filename,color],async (err,result) => {
          if(err) throw err;
          if(!await this.existInCategories())
          {
            db.query("INSERT INTO procat(CAT,SUB_CAT,PNAME) values(?,?,?)",[cat,subcat,this.pname],(err,result) => {
              if(err) throw err;
              resolve(result);
            });
          }
          else resolve(result)
        });
      }
      else resolve(errorMessage)
    });
  }

  // add a size
  async addSize(size,num_pieces)
  {
    let nb = await this.sizePieces(size);
    this.addPieces(num_pieces);
    return new Promise((resolve, reject)=> {
      if(nb === 0)
      {
        let sql = "INSERT INTO have(MODEL,PNAME,SIZE,NUM_OF_PIECES) VALUES(?,?,?,?)";
        db.query(sql,[this.model,this.pname,size,num_pieces],(err,result) =>{
          if(err) throw err;
          resolve(result)
        })
      }
      else {
        let sql = "UPDATE have SET NUM_OF_PIECES = ? WHERE PNAME = ? and MODEL = ? and SIZE = ? ";
        db.query(sql,[nb + num_pieces,this.pname,this.model,size],(err,result) =>{
          if(err) throw err;
          resolve(result)
        })
      }
    });
  }

  // add a player
  async addPlayer(player,size,num_pieces)
  {
    let nb = await this.playerPieces(player,size);
    return new Promise(async (resolve, reject) => {
      if(nb === 0)
      {
        let sql = "INSERT INTO contains(MODEL,PNAME,PLAYER_NAME,QUANTITY,BODY_SIZE) VALUES(?,?,?,?,?)";
        db.query(sql,[this.model,this.pname,player,num_pieces,size],async(err,result) =>{
          if(err) throw err;
          await this.addSize(size,num_pieces);
          resolve(result)
        })
        
      }
      else {
        let sql = "UPDATE contains SET QUANTITY = ? WHERE PNAME = ? and MODEL = ? and BODY_SIZE = ? and PLAYER_NAME = ?";
        db.query(sql,[nb + num_pieces,this.pname,this.model,size,player],async(err,result) =>{
          if(err) throw err;
          await this.addSize(size,num_pieces);
          resolve(result)
        })
      }
    });
  }

  //delete model
  delete()
  {
    return new Promise(async(resolve, reject)=> {
      let image = await this.image;
      let sql = "DELETE FROM products WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[this.pname,this.model],(err,res) =>{
        if(err) throw err;
        sql = "DELETE FROM contains WHERE PNAME = ? and MODEL = ?";
        db.query(sql,[this.pname,this.model],(err,res) =>{
          if(err) throw err;
          sql = "DELETE FROM have WHERE PNAME = ? and MODEL = ?";
          db.query(sql,[this.pname,this.model],(err,res) =>{
            if(err) throw err;
            fs.unlink('./productImages/' + image,()=>resolve(res));
          })
        })
      })
    });
  }

  static showProducts()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM products";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        for(let i = 0; i < result.length;i++)
        {
          let image = result[i]['IMAGE'];
          let file = fs.readFileSync('./productImages/' + image)
          result[i]['file'] = file;
        }
        resolve(result);
      })
    })
  }

  static showSizes()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM have";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result);
      })
    })
  }

  static showPlayers()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM contains";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        resolve(result);
      })
    })
  }

  static filter(search)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT * FROM products WHERE PNAME like ?";
      db.query(sql,["%"+search+"%"],(err,result)=>{
        if(err) throw err;
        for(let i = 0; i < result.length;i++)
        {
          let image = result[i]['IMAGE'];
          let file = fs.readFileSync('./productImages/' + image)
          result[i]['file'] = file;
        }
        resolve(result);
      })
    });
  }

  updateModel(newmodel)
  {
    return new Promise((resolve, reject)=> {
      let sql = "UPDATE products SET MODEL = ? WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[newmodel,this.pname,this.model],(err,result)=>{
        if(err) throw err;
        sql = "UPDATE order_product SET MODEL = ? WHERE PNAME = ? and MODEL = ?";
        db.query(sql,[newmodel,this.pname,this.model],(err,result)=>{
          if(err) throw err;
          sql = "UPDATE have SET MODEL = ? WHERE PNAME = ? and MODEL = ?";
          db.query(sql,[newmodel,this.pname,this.model],(err,result)=>{
            if(err) throw err;
            sql = "UPDATE contains SET MODEL = ? WHERE PNAME = ? and MODEL = ?";
            db.query(sql,[newmodel,this.pname,this.model],(err,result)=>{
              if(err) throw err;
              resolve(result)
            })
          })
        })
      })
    });
  }


  updatePrice(price)
  {
    return new Promise((resolve, reject) => {
      let sql = "UPDATE products SET PRICE = ? WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[price,this.pname,this.model],(err,result)=>{
        if(err) throw err;
        resolve(result);
      })
    })
  }

  updateColor(color)
  {
    return new Promise((resolve, reject) => {
      let sql = "UPDATE products SET COLOR = ? WHERE PNAME = ? and MODEL = ?";
      db.query(sql,[color,this.pname,this.model],(err,result)=>{
        if(err) throw err;
        resolve(result);
      })
    })
  }

  // refresh
  static async refresh()
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT PNAME FROM products GROUP BY PNAME HAVING SUM(PIECES) = 0";
      db.query(sql,(err,res) =>{
        if(err) throw err;
        for(let i = 0; i < res.length;i++)
        {
          sql = "DELETE FROM procat WHERE PNAME = ?";
          db.query(sql,[res[i].PNAME],(err,result) =>{
            if(err) throw err;
          })
        }
      })
      sql = "DELETE FROM products WHERE PIECES = 0";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        sql = "DELETE FROM have WHERE NUM_OF_PIECES = 0";
        db.query(sql,(err,result) =>{
          if(err) throw err;
          sql = "DELETE FROM contains WHERE QUANTITY = 0";
          db.query(sql,(err,result) =>{
            if(err) throw err;
            resolve(result)
          });
        });
      });
    });

  }

  static clear()
  {
    return new Promise(function(resolve, reject) {
      let sql = "DELETE FROM products";
      db.query(sql,(err,res) =>{
        if(err) throw err;
        sql = "DELETE FROM have";
        db.query(sql,(err,res) =>{
          if(err) throw err;
          sql = "DELETE FROM procat";
          db.query(sql,(err,res) =>{
            if(err) throw err;
            sql = "DELETE FROM contains";
            db.query(sql,(err,result) =>{
              if(err) throw err;
              fs.rmdir('./productImages', { recursive: true })
              fs.mkdir('./productImages')
              resolve(result)
            })
          })
        })
      })
    });
  }

}

module.exports = Product;
