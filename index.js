const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const inboundWebHookURL = `https://learnerspoint.bitrix24.com/rest/43884/25rcwb9cj3y1m7qm/`

app.post("/update",async(req, res) => {
    //console.log(req.query);
    let totalDealAmount =  Number(req.query.totalAmount?.slice(2).replace(",",""));
    req.query.installment1 = Number(req.query.installment1?.slice(2).replace(",",""));
    req.query.installment2 = Number(req.query.installment2?.slice(2).replace(",",""));
    req.query.installment3 = Number(req.query.installment3?.slice(2).replace(",",""));
    req.query.installment4 = Number(req.query.installment4?.slice(2).replace(",",""));
    console.log(req.query);

    //calculating the total instalment amount payed by client until 5 instalment
    let totalAmountPaidInInstalment=0; 
    for(let i=0;i<=4;i++){
        let temp = `installment${i}`;
        if(req.query[temp]){
            totalAmountPaidInInstalment+=req.query[temp];
        }
    }
    console.log("total paid",totalAmountPaidInInstalment);
    //calculating balance pending
    let pendingAmount =(totalDealAmount-totalAmountPaidInInstalment);
    console.log("pending",pendingAmount);

    //calculating balance pending
    console.log(req.query);
    const params = {
        filter: {
            "UF_CRM_64461C4D5CF41": req.query.OriginalDealId,
            "CATEGORY_ID": "22",
        },
        select: ["ID"],
    };
    let fieldId = await fetchId(params);
    console.log("fetch id",fieldId,pendingAmount);   
    await updateTheField(fieldId, `${pendingAmount}`, "OPPORTUNITY");
    res.send("ok all things updated done");
})

app.post("/updateInRevenue", async (req, res) => {
    //console.log(req.query);
    req.query.installment1 = Number(req.query.installment1?.slice(2).replace(",",""));
    req.query.installment2 = Number(req.query.installment2?.slice(2).replace(",",""));
    req.query.installment3 = Number(req.query.installment3?.slice(2).replace(",",""));
    req.query.installment4 = Number(req.query.installment4?.slice(2).replace(",",""));
    // console.log(req.query);
    //calculating the total instalment amount payed by client until 5 instalment
    let totalAmountPaidInInstalment=0; 
    for(let i=0;i<=4;i++){
        let temp = `installment${i}`;
        if(req.query[temp]!=0){
            totalAmountPaidInInstalment=req.query[temp];
        }
    }
    console.log(totalAmountPaidInInstalment);
    await updateTheField(req.query.id, `${totalAmountPaidInInstalment}`, "OPPORTUNITY");
    res.send("ok all things updated done");
})

async function updateTheField(id, amount,fields) {  //ths function get deal id,value of field,feild id as parameter and make update in birix24
    console.log(id, amount,fields);
    try {
        let param = {
            "id":id,
            "fields":{}
        }
        param["fields"][fields]=amount;
        console.log(param);
        const response = await axios.post(`${inboundWebHookURL}crm.deal.update.json`,param);
        const jsonData = response.data;
        if(jsonData){
            console.log("field updated");
        }
    } catch (error) {
        console.error(error.message);
    }
}

async function fetchId(params) {
    try {
        console.log(params);
        const response = await axios.post(`https://learnerspoint.bitrix24.com/rest/43884/gffa3by2grda63er/crm.deal.list`, params);
        console.log(response.data);
        console.log(response.data.result);
        return response.data.result[0].ID;
    } catch (error) {
        console.error("Error:", error.message);
        return false;
    }
}

module.exports = {
    app
};