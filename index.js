// Vasantha Vasavi Meenakshi Sundaram
// Student ID - 8878335
// Email:vmeenakshisunda8335@conestogac.on.ca

const express = require('express');
const { check, validationResult } = require('express-validator');
const path = require('path');

//setting up variables to use packages
let myApp = express();
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');

myApp.use(express.urlencoded({ extended: false }));

//rendering home page and shop page
myApp.get('/', (req, res) => {
  res.render('home');
});

myApp.get('/shop', (req, res) => {
  res.render('shopPage');
});


//regex for email
const email_format =  /^([a-zA-Z0-9_.-]+)@([a-zA-Z0-9_-]+)((\.([a-zA-Z0-9_-]+))+)$/;
//regex for phone
const phone_format = /^[0-9]{10}$/;

//custom function for checking format
const check_format = (value, regex) => {
  return regex.test(value) ? true : false;
};

//function for checking phone number format
const check_phone = (value) => {
  if(!value)
  {
    throw new Error("Phone Number is mandatory");
  }
  else if (!check_format(value, phone_format)) {
    throw new Error("Enter Phone Number in correct format");
  }

  return true;
};

//function for checking email format
const check_email = (value) => {
  if(!value)
  {
    throw new Error("Email is mandatory");
  }
  else if (!check_format(value, email_format)) {
    throw new Error("Enter Email ID in correct format");
  }

  return true;
};

//function for checking if user has selected at least one product
const check_products = (p1,p2,p3,p4) => {
  if((p1 === 0 || p1 === "") && (p2 === 0 || p2 === "") && (p3 === 0 || p3 === "") && (p4 === 0 || p4 === ""))
  {
    throw new Error("Select at least 1 product to place the order");
  }
  return true;
};



myApp.post('/shop',
  [
    check('name', 'Name is mandatory').not().isEmpty(),
    check('phone').custom(check_phone),
    check('email').custom(check_email),
    check('address', 'Address field is mandatory').not().isEmpty(),
    check('city', 'City field is mandatory').not().isEmpty(),
    check('province', 'Province field is mandatory').not().isEmpty(),
    check('rose_quantity').custom((value, { req }) => {
      return check_products(value, req.body.doll_quantity, req.body.stand_quantity, req.body.clock_quantity);
     })
  ],
  function(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
      res.render('shopPage', {errors: errors.array()});
    } 
    else 
    {


      //Initialising an array with all product names, quantity and prices
      var all_product = [
        { name: "Golden Rose", quantity: 0, price: 6 },
        { name: "Red Doll", quantity: 0, price: 3 },
        { name: "Pen Stand", quantity: 0, price: 10 },
        { name: "Sand Clock", quantity: 0, price: 8 }
      ];
      
      //fetching all form inputs
      let name = req.body.name;
      let phone = req.body.phone;
      let email = req.body.email;
      let address = req.body.address;
      let city = req.body.city;
      let province = req.body.province;
      all_product[0].quantity = req.body.rose_quantity;  
      all_product[1].quantity = req.body.doll_quantity;
      all_product[2].quantity = req.body.stand_quantity;
      all_product[3].quantity = req.body.clock_quantity;

      var total_purchase = 0;
      //calculating total purchase
      for (let i = 0; i < 4; i++) {
        total_purchase += all_product[i].quantity * all_product[i].price;
      }
      
      //creating a table with only the selected products (for receipt)
      var product_table = [];
      for (let j = 0; j < 4; j++) {
        if (all_product[j].quantity > 0) {
          
          product_table.push({ name: all_product[j].name, quantity: all_product[j].quantity, price:all_product[j].price,amount: (all_product[j].quantity * all_product[j].price)}) 

        }
      }


      //an array with tax for each province
      var province_tax = [
        {province:"Alberta", tax:5},
        {province:"British Columbia", tax:12},
        {province:"Manitoba", tax:12},
        {province:"New Brunswik", tax:15},
        {province:"Newfoundland & Labrador", tax:15},
        {province:"Northwest Territories", tax:5},
        {province:"Nova Scotia", tax:15},
        {province:"Nunavut", tax:5},
        {province:"Ontario", tax:13},
        {province:"Prince Edward Island", tax:15},
        {province:"Quebec", tax:14.975},
        {province:"Saskatchewan", tax:11},
        {province:"Yukon", tax:5}
      ];
     
      //fetching tax corresponding to the province that the user has entered from the array above
      var index = province_tax.find(item => item.province === province);
      var tax = index.tax;

      //calculating tax amount and total price with tax
      var tax_amount = total_purchase * (tax/100);
      var total_with_tax = total_purchase + tax_amount;

      //rendering receipt with all the required data
      res.render('receipt', {
        name,
        phone,
        email,
        address,
        city,
        province,
        product_table,
        total_purchase,
        tax, tax_amount, total_with_tax
      });
    }
  }
);

myApp.listen(8080)
console.log('Running on port 8080')