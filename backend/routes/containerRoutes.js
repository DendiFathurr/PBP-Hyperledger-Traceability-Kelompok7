const express = require('express');
const router = express.Router();
const containerController = require('../controllers/containerController');

/**
 * Route: POST /api/register-container
 * Deskripsi: Mendaftarkan kontainer baru (menggunakan Transient Map untuk data sensitif)
 */
router.post('/register-container', containerController.registerContainer);

/**
 * Route: PUT /api/update-status
 * Deskripsi: Mengubah kepemilikan atau lokasi kontainer
 */
router.put('/update-status', containerController.updateStatus);

/**
 * Route: GET /api/history/:id
 * Deskripsi: Mendapatkan riwayat audit perjalanan kontainer berdasarkan ID
 */
router.get('/history/:id', containerController.getHistory);

module.exports = router;
