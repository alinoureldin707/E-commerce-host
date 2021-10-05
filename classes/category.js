const db = require('../connection.js');

class Category{

  static existCat(cat)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT * FROM categories WHERE CATEGORY = ?";
      db.query(sql,[cat],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(false);
        resolve(true);
      })
    });
  }

  static existSubcat(cat,subcat)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT * FROM subcat WHERE CATEGORY = ? and SUB_CATEGORY = ?";
      db.query(sql,[cat,subcat],(err,res) =>{
        if(err) throw err;
        if(res.length === 0) resolve(false);
        resolve(true);
      })
    });
  }

  static add(category)
  {
    let errorMessage = {
      message : 'This category already exist'
    }
    return new Promise(async function(resolve, reject) {
      if(! await Category.existCat(category))
      {
        let sql = "INSERT INTO categories values(?)";
        db.query(sql,[category],(err,result) => {
          if(err) throw err;
          resolve(result)
        });
      }
      else resolve(errorMessage);
    });
  }

  static delete(category)
  {
    return new Promise(function(resolve, reject) {
      let sql = "DELETE FROM subcat WHERE CATEGORY = ?";
      db.query(sql,[category],(err,result) => {
        if(err) throw err;
        sql = "DELETE FROM categories WHERE CATEGORY = ?";
        db.query(sql,[category],(err,result) => {
          if(err) throw err;
          sql = "DELETE FROM procat WHERE CAT = ?";
          db.query(sql,[category],(err,result) => {
            if(err) throw err;
            resolve(result);
          });
        });
      });
    });
  }

  static update(cat,newcat)
  {
    return new Promise(function(resolve, reject) {
      let sql = "UPDATE categories SET CATEGORY = ? WHERE CATEGORY = ?";
      db.query(sql,[newcat,cat],(err,result)=>{
        if(err) throw err;
        sql = "UPDATE subcat SET CATEGORY = ? WHERE CATEGORY = ?";
        db.query(sql,[newcat,cat],(err,result)=>{
          if(err) throw err;
          sql = "UPDATE procat SET CAT = ? WHERE CAT = ?";
          db.query(sql,[newcat,cat],(err,result)=>{
            if(err) throw err;
            resolve(result);
          })
        })
      })
    });
  }

  static show()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM categories";
      db.query(sql,(err,res) =>{
        if(err) throw err;
        resolve(res);
      })
    })
  }

  static filter(search)
  {
    return new Promise(function(resolve, reject) {
      let sql = "SELECT * FROM categories WHERE CATEGORY like ?";
      db.query(sql,["%"+search+"%"],(err,res)=>{
        if(err) throw err;
        resolve(res);
      })
    });
  }

  static addSubcat(category,subcat)
  {
    let errorMessage = {
      message : 'This subcategory already exist'
    }
    return new Promise(async function(resolve, reject) {
      if(! await Category.existSubcat(category,subcat))
      {
        let sql = "INSERT INTO subcat(SUB_CATEGORY,CATEGORY) values(?,?)";
        db.query(sql,[subcat,category],(err,result) => {
          if(err) throw err;
          resolve(result);
        });
      }
      else resolve(errorMessage)
    });
  }

  static showSubcategories()
  {
    return new Promise((resolve,reject) =>{
      let sql = "SELECT * FROM subcat";
      db.query(sql,(err,res) => {
        if(err) throw err;
        resolve(res);
      });
    })
  }

  static deleteSubcategory(category,subcat)
  {
    return new Promise(function(resolve, reject) {
      let sql = "DELETE FROM subcat WHERE CATEGORY = ? and SUB_CATEGORY = ?";
      db.query(sql,[category,subcat],(err,result) => {
        if(err) throw err;
        sql = "DELETE FROM procat WHERE CAT = ? and SUB_CAT = ?";
        db.query(sql,[category,subcat],(err,result) => {
          if(err) throw err;
          resolve(result);
        });
      });
    });
  }

  static updateSubcat(category,subcat,newsubcat)
  {
    return new Promise(function(resolve, reject) {
      let sql = "UPDATE subcat SET SUB_CATEGORY = ? WHERE CATEGORY = ? and SUB_CATEGORY = ?";
      db.query(sql,[newsubcat,category,subcat],(err,result)=>{
        if(err) throw err;
        sql = "UPDATE procat SET SUB_CAT = ? WHERE CAT = ? and SUB_CAT = ?";
        db.query(sql,[newsubcat,category,subcat],(err,result)=>{
          if(err) throw err;
          resolve(result);
        })
      })
    });
  }

  static clear()
  {
    return new Promise(function(resolve, reject) {
      let sql = "DELETE FROM categories";
      db.query(sql,(err,result) =>{
        if(err) throw err;
        sql = "DELETE FROM subcat";
        db.query(sql,(err,result) =>{
          if(err) throw err;
          resolve(result);
        })
      })
    });

  }

}

module.exports = Category;
