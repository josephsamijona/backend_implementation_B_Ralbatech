const check = require("../../libs/checkLib");
const response = require("../../libs/responseLib");
const appConfig = require("../../../config/appConfig");



/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName createOrder
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let createOrder = async (req,res)=>{
    try{
        let options = {
            amount: req.body.amount * 100,  // amount in the smallest currency unit
            currency: "INR"
          };
    
        let order = await appConfig.razp.orders.create(options);
        if(check.isEmpty(order)){
            throw new Error('oreder creation error at payment gateway.');
        }else{

        /*Store Order ID in your application here
    
    
        */
           let apiResponse = response.generate(false,'order id generated,initiate payment',order);
           res.status(200).send(apiResponse);
        }
    }catch(err){
        let apiResponse = response.generate(true,`Error in placing Order : ${err.message}`,null);
        res.status(412).send(apiResponse);
    }
}

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName completeOrder
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let completeOrder = async (req,res)=>{
        appConfig.razp.payments.fetch(req.body.razorpay_payment_id).then((doc)=>{
            if(doc.status == 'captured'){
    
                /*update user wallet balance in your application here
    
    
                */
    
                let apiResponse = response.generate(false,'payment successful!',req.body.razorpay_payment_id);
                res.status(200).send(apiResponse);
            }else{
                let apiResponse = response.generate(true,`payment not resolved : ${doc.status}`,null);
                res.status(412).send(apiResponse);
            }
        }).catch((e) => {
            let apiResponse = response.generate(true,`Error in placing Order : ${e.message}`,null);
            res.status(412).send(apiResponse);
        })
}


module.exports = {
    createOrder:createOrder,
    completeOrder:completeOrder
}