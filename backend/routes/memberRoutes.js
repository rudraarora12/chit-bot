const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');

router.route('/').get(getMembers).post(createMember);
router.route('/:id').get(getMemberById).put(updateMember).delete(deleteMember);

module.exports = router;
