const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/menu', vendorController.getVendorMenu);
router.post('/', vendorController.createVendor);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

module.exports = router;