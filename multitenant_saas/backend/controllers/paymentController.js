
require("dotenv").config()

const User=require("../models/User")

const CASHFREE_APP_ID = process.env.cashfree_api_key;
const CASHFREE_SECRET = process.env.cashfree_secret_key


const { Cashfree, CFEnvironment } =require("cashfree-pg");

const cashfree = new Cashfree(
	CFEnvironment.SANDBOX,
	`${CASHFREE_APP_ID}`,
	`${CASHFREE_SECRET}`
);

function createOrder(req,res) {
	var request = {
		order_amount: "10000",
		order_currency: "INR",
		customer_details: {
			customer_id: req.body.id,
			customer_name: req.body.name,
			customer_email: req.body.email,
			customer_phone: req.body.phone,
		},
		order_meta: {
			return_url:
				"http://127.0.0.1:5500/frontend/dashboard.html",
		},
		order_note: "",
	};

	cashfree
		.PGCreateOrder(request)
		.then((response) => {
			var a = response.data;
			console.log(a)
            res.status(201).json({success: true,
      order_id: a.order_id,
      payment_session_id: a.payment_session_id});
		})
		.catch((error) => {
			console.error("Error setting up order request:", error.response.data);
		});
}

const verifyPayment=async(req,res)=>{
   try{ const {order_id}=req.body
   console.log("orderid is ",order_id)
    if (order_id){
        const id=req.user.id
        const user=await User.findById(id)
        if(!user){
           return res.status(404).json({message:"User does not exists"})
        }
         const response = await cashfree.PGFetchOrder( order_id );
         console.log("response is",response)
        const paymentStatus = response?.data?.order_status;
        console.log("ps is",paymentStatus)             
        if (paymentStatus==="PAID"){
        user.isPremium=true
        await user.save()
        res.status(200).json({message:"user upgraded to premium successfully",isPremium:true})
        }else{
            res.status(400).json({message:"unable to fetch payment details"})
        }

    }
    
    
    }catch(err){
        console.log(err)
    return res.status(500).json({message:err.message})
    }
}

module.exports={createOrder,verifyPayment}