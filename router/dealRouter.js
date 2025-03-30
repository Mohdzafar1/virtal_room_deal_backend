const express = require("express");
const { createDeal, updateDealStatus, getDealList, getSingleDealList } = require("../controller/dealController");
const { authenticateUser } = require("../middleware/userAuth");


const router = express.Router();


router.post("/createDeal", createDeal);
router.post('/dealStatus',authenticateUser,updateDealStatus)
router.get('/gettingDealList',getDealList)
router.get('/:id',getSingleDealList)



module.exports = router;
