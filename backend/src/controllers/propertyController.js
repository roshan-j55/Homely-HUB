//get all properties
//get property based on id

import {Property} from "../Models/propertyModel.js";
import {APIFeatures} from "../utils/APIFeatures.js";
import imageKit from "../utils/ImagekitIO.js";

//get all properties

const getProperties = async(req,res)=>{
    try{
        const features = new APIFeatures(Property.find(),req.query)
        .filter()
        .search()
        .paginate();

        const allProperties = await Property.find();

        const doc = await features.query;

        res.status(200).json({
            status:"success",
            no_of_responses: doc.length,
            data:doc
        })

    }catch(error){
        console.error("Error searching properties :", error)
        res.status(500).json({error:"Internal server Error"})
    }
}


// get property by id
//http://localhost:8080/api/v1/rent/listing/:id
//http://localhost:8080/api/v1/rent/listing/63598528875

const getProperty =async(req,res)=>{
    try{
        const property =await Property.findById(req.params.id);

        res.status(200).json({
            status:"success",
            data:property,
        })
    }
    catch(error){
        res.status(404).json({
            status:"fail",
            message:error.message
        })
}
}
export{
    getProperties,
    getProperty
}