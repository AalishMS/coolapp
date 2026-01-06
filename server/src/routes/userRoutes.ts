import { Router } from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { updateProfileValidation, changePasswordValidation, validate } from '../utils/validation.js'
import { getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/userController.js'
import { validateCsrf } from '../middleware/csrfMiddleware.js'

const router = Router()

router.use(protect)

router.get('/profile', getProfile)
router.put('/profile', validateCsrf, updateProfileValidation, validate, updateProfile)
router.put('/password', validateCsrf, changePasswordValidation, validate, changePassword)
router.delete('/profile', validateCsrf, deleteAccount)

export default router
