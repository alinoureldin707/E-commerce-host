const express = require('express');
const upload = require('express-fileupload')
const morgan = require('morgan')
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs')
const Category = require('./classes/category.js');
const Product = require('./classes/product.js');
const Customer = require('./classes/customer.js');
const Order = require('./classes/order.js');
const db = require('./connection.js');

const app = express();
const urlEncodedParse = bodyParser.urlencoded({extended:false});

app.use(cors());
app.use(express.json())
app.use(morgan("dev"))
app.use(upload())


/*     CATEGORIES OPERATIONS      */
// Add category : category
app.post('/categories/addCategory',urlEncodedParse,async (req,res)=>{
  res.send(await Category.add(req.body.category));
})

// Remove category
app.delete('/categories/removeCategory/:category',urlEncodedParse,async(req,res)=>{
  res.send(await Category.delete(req.params.category));
})

// update category : category, newcategory
app.put('/categories/updateCategory',urlEncodedParse,async(req,res)=>{
  res.send(await Category.update(req.body.category,req.body.newcategory));
})

// show categories
app.get('/categories/showCategories',async (req,res)=>{
  res.send(await Category.show());
})

// filter categories
app.get('/categories/filterCategories/:search',async(req,res)=>{
  res.send(await Category.filter(req.params.search));
})

// add sub_category : category, subcategory
app.post('/categories/addSubCategory',urlEncodedParse,async(req,res)=>{
  res.send(await Category.addSubcat(req.body.category,req.body.subcategory));
})

// show sub_categories
app.get('/categories/showSubcategories',async (req,res)=>{
  res.send(await Category.showSubcategories());
})

// Remove subcategory
app.delete('/categories/removeSubcategory/:category/:subcat',async(req,res)=>{
  res.send(await Category.deleteSubcategory(req.params.category,req.params.subcat))
})

// update subcategory : category , subcategory ,newsubcategory
app.put('/categories/updateSubcategory',urlEncodedParse,async(req,res)=>{
  res.send(await Category.updateSubcat(req.body.category,req.body.subcategory,req.body.newsubcategory))
})

// clear all categories
app.get('/categories/clear',async(req,res)=>{
  res.send(await Category.clear());
})




/*      PRODUCT OPERATIONS      */
// add product : pname,model,price,oprice,file : file,color,category,subcat
app.post('/products/addProduct',urlEncodedParse,async(req,res)=>{
    let product = new Product(req.body.pname,req.body.model);
    res.send(await product.addProduct(req.body.category,req.body.subcat,req.body.price,req.body.oprice,req.files.file,req.body.color));
});

// add size : pname,model,size,quantity
app.post('/products/addSize',urlEncodedParse,async(req,res)=>{
  let p = new Product(req.body.pname,req.body.model);
  res.send(await p.addSize(req.body.size,req.body.quantity));
});

// add player : pname,model,player_name,size,quantity
app.post('/products/addPlayer',urlEncodedParse,async(req,res)=>{
  let p = new Product(req.body.pname,req.body.model);
  res.send(await p.addPlayer(req.body.player_name,req.body.size,req.body.quantity));
});

// delete model
app.delete('/products/deleteModel/:pname/:model',async(req,res) =>{
  let p = new Product(req.params.pname,req.params.model);
  res.send(await p.delete());
})

// refresh products who have zero number of pieces
app.put('/products/refresh',async(req,res) =>{
  res.send(await Product.refresh());
})

// clear all products
app.delete('/products/clear',async(req,res)=>{
  res.send(await Product.clear());
})

// show products
app.get('/products/showProducts',async (req,res)=>{
  res.send(await Product.showProducts());
})

// filter products
app.get('/products/filterProducts/:search',async(req,res)=>{
  res.send(await Product.filter(req.params.search));
})

// update model : pname , model ,newmodel
app.put('/products/updateModel',urlEncodedParse,async(req,res)=>{
  let p = new Product(req.body.pname,req.body.model)
  res.send(await p.updateModel(req.body.newmodel))
})

// update price : pname , model ,price
app.put('/products/updatePrice',urlEncodedParse,async(req,res)=>{
  let p = new Product(req.body.pname,req.body.model)
  res.send(await p.updatePrice(req.body.price))
})

// update color : pname , model ,color
app.put('/products/updateColor',urlEncodedParse,async(req,res)=>{
  let p = new Product(req.body.pname,req.body.model)
  res.send(await p.updateColor(req.body.color))
})

// show size
app.get('/products/showSizes',async (req,res)=>{
  res.send(await Product.showSizes());
})

// show players
app.get('/products/showPlayers',async (req,res)=>{
  res.send(await Product.showPlayers());
})




/*      CUSTOMER OPERATIONS      */
// add customer : fname,lname,address,phone
app.post('/customers/addCustomer',urlEncodedParse,async (req,res) =>{
  let cid = await Customer.createCid();
  res.send(await Customer.addCustomer(cid,req.body.fname,req.body.lname,req.body.address,req.body.phone))
})

// remove customer
app.delete('/customers/removeCustomer/:cid',async(req,res) =>{
  res.send(await Customer.deleteCustomer(req.params.cid))
})

// clear customers
app.delete('/customers/clear',async(req,res) =>{
  res.send(await Customer.clear())
})

// restart cid
app.put('/customers/restartCid',async(req,res) =>{
  res.send(await Customer.restartCid())
})

// show customers
app.get('/customers/showCustomers',async (req,res)=>{
  res.send(await Customer.showCustomers());
})

// filter cutomers
app.get('/customers/filterCustomers/:search',async(req,res)=>{
  res.send(await Customer.filter(req.params.search));
})

// add account : username,password
app.post('/accounts/add',urlEncodedParse,async(req,res) =>{
  res.send(await Customer.addAccount(req.body.username,req.body.password))
})

// remove account
app.delete('/accounts/remove/:username',async(req,res) =>{
  res.send(await Customer.deleteAccount(req.params.username))
})

// remove all accounts
app.delete('/accounts/removeAll',async(req,res) =>{
  res.send(await Customer.removeAllAcounts())
})

// show accounts
app.get('/accounts/show',async (req,res)=>{
  res.send(await Customer.showAccounts());
})

// check if an account exist
app.get('/accounts/exist/:username',async (req,res)=>{
  res.send(await Customer.existAccount(req.params.username));
})

// filter accounts
app.get('/accounts/filterAccounts/:search',async(req,res)=>{
  res.send(await Customer.filterAccounts(req.params.search));
})




/*      ORDER OPERATIONS      */
// create order : cid
app.post('/orders/createOrder',urlEncodedParse,async (req,res) =>{
  let oid = await Order.createOid();
  res.send(await Order.createOrder(req.body.cid,oid))
})

// add product to an order : oid,pname,model,size,num_of_pieces,player
app.post('/orders/addToOrder',urlEncodedParse,async(req,res) =>{
  res.send(await Order.addToOrder(req.body.oid,req.body.pname,req.body.model,req.body.size,req.body.num_of_pieces,req.body.player))
})

// delete product from an order : oid,pname,model,size,player
app.delete('/orders/deleteFromOrder',urlEncodedParse,async(req,res) =>{
  res.send(await Order.deleteProductFromOrder(req.body.oid,req.body.pname,req.body.model,req.body.size,req.body.player))
})

// delete order
app.delete('/orders/deleteOrder/:oid',async(req,res) =>{
  res.send(await Order.deleteOrder(req.params.oid))
})

// clear orders
app.delete('/orders/clear',async(req,res) =>{
  res.send(await Order.clear())
})

// restart oid
app.put('/orders/restartOid',async(req,res) =>{
  res.send(await Order.restartOid())
})

// show orders
app.get('/orders/showOrders',async (req,res)=>{
  res.send(await Order.showOrders());
})

// show detailed orders
app.get('/orders/showDetailedOrders',async (req,res)=>{
  res.send(await Order.showOrder_products());
})




/*  SLIDE IMAGES  */

// add a slide image : image:file
app.post('/slide/add',urlEncodedParse,(req,res)=>{
  const file = req.files.image
  const slidename = file.name
  file.mv('./slideImages/'+slidename)
  let sql = 'INSERT INTO slide_images values(?)'
  db.query(sql,[slidename],(err,result)=>{
    if(err) throw err;
    res.send(result)
  })
})

// remove a slide image
app.delete('/slide/remove/:image',(req,res) =>{
  let image = req.params.image
  let sql = "DELETE FROM slide_images WHERE IMAGE = ?";
  db.query(sql,[image],(err,result) =>{
    if(err) throw err;
    fs.unlink('./slideImages/' + image,()=>res.send(result));
  })
})

// show slide images
app.get('/slide/show',(req,res) =>{
  let sql = "SELECT * FROM slide_images";
  db.query(sql,(err,result) =>{
    if(err) throw err;
    if(!fs.existsSync('./slideImages'))
    {
      fs.mkdirSync('./slideImages')
      res.send(result)
    }
    else{
      for(let i = 0; i < result.length;i++)
      {
        let image = result[i]['IMAGE'];
        let file = fs.readFileSync('./slideImages/' + image)
        result[i]['file'] = file;
      }
      res.send(result);
    }
  })
})

// clear the images
app.post('/slide/clear',urlEncodedParse,(req,res) =>{
  let sql = "DELETE FROM slide_images";
  db.query(sql,(err,result) =>{
    if(err) throw err;
    fs.rmdirSync('./slideImages', { recursive: true })
    fs.mkdirSync('./slideImages')
    res.send(result)
  })
})


/*  MESSAGES  */
// show messages
app.get('/messages/show',(req,res) =>{
  let sql = "SELECT * FROM messages";
  db.query(sql,(err,result) =>{
    if(err) throw err;
    res.send(result);
  })
})

// clear the messages
app.post('/messages/clear',urlEncodedParse,(req,res) =>{
  let sql = "DELETE FROM messages";
  db.query(sql,(err,result) =>{
    if(err) throw err;
    res.send(result)
  })
})


/*  CLEANUP ALL THE DATABASE  */
app.post('clean',urlEncodedParse,(req,res) =>{
  Product.clear();
  Customer.clear();
  Order.clear();
  Category.clear();
  let sql = "DELETE FROM messages";
  db.query(sql,(err,res) =>{
    if(err) throw err;
    sql = "DELETE FROM slide_images";
    db.query(sql,(err,res) =>{
      if(err) throw err;
    })
  })
})



/*  LISTENING  */
// listen for the post 3001 in the localhost server
const HOST = '192.168.0.106';
const PORT = 3002;
app.listen(PORT,HOST,()=>{
  console.log("Listening...");
});
