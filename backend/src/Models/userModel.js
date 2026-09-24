//user Schema

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

const userSchema =new mongoose.Schema(
    {
        name:{
            type:String,
            required: [true, "Please enter your name"],
            trim: true,
            maxLength:[50,"your name cannot be longer than 50 characters"]
        },
        email:{
            type: String,
            required: [true,"Please enter email ID"],
            unique:true,
            isLowercase:true,
            trim:true,
            validate:[validator.isEmail, "Please enter valid email address"]
        },password:{
            type: String,
            required: [true,"Please enter password"],
            minlength:[6,"Ypur Password must br longer than  characters"],
            select:false
        },
        passwordConfirm :{
            type: String,
            required: [true,"Please confirm password"],
            validate:{
                validator:function(el){
                    return el === this.password
                },
                message:"Passwords are not the same !"
            }
        },
        phoneNumber:{
            type: String,
            required: true,
            unique: true,
            trim:true
        },
        role:{
            type: String,
            enum:["user","admin"],
            default:"user"
        },
        avatar:{
            url:{type:String},
            public_id:{type:String}
        },
        passwordChangeAt:{
            type:Date
        },
        passwordResetToken:{
            type:String,
            select:false,
            index:true
        },
        passwordResetExpires:{
            type:Date,
            select:false
        },
    },
    {timestamps:true}
)
//settings to not pass in response from server
userSchema.set("toJSON",{
    transform:function(doc,ret){
        delete ret.password;
        delete ret.passwordConfirm;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
    }
})

//password logic
//Hashing
userSchema.pre("save",async function() {
    if(!this.isModified("password"))return;
    
    this.password = await bcrypt.hash(this.password,12)
    this.passwordConfirm = undefined;
})

//logic check
//test123== 24faasfasfaffa

userSchema.methods.correctPassword = async function(candidatePassword, userPassword)
{
    return await bcrypt.compare(candidatePassword,userPassword)
}

//

userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
    if(this.passwordChangeAt){
        const changedTimeStamp = parseInt(
            this.passwordChangeAt.getTime()/1000,
            10
        );
        return JWTTimestamp < changedTimeStamp
    }
    return false;
}


//forgot password

userSchema.method.changedPasswordResetToken=function(){
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken=crypto.createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.passwordResetExpires = Date.now() +10 *60 *1000;
    return resetToken;
}

const User = mongoose.model("User",userSchema);
export{User};