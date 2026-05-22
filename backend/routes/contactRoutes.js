import { Router } from 'express';
import multer from 'multer';
import { 
  getContacts, 
  createContact, 
  updateContact, 
  deleteContact, 
  searchContacts, 
  getSearchHistory, 
  importContacts, 
  exportContacts,
  getActiveCompaniesAndTags
} from '../controllers/contactController.js';
import { contactValidator } from '../validators/contactValidators.js';
import { validateFields } from '../middleware/validatorMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = Router();

// Setup in-memory storage upload specifically for temporary import CSVs
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // limit CSV files to 10MB
});

// All contact routes are protected by JWT check
router.use(protect);

// @route   GET /api/contacts
// @desc    Get contacts with filters, sorts, pagination
router.get('/', getContacts);

// @route   POST /api/contacts
// @desc    Create contact (multipart-form: handles image and inputs)
router.post('/', uploadAvatar.single('avatar'), contactValidator, validateFields, createContact);

// @route   PUT /api/contacts/:id
// @desc    Update contact
router.put('/:id', uploadAvatar.single('avatar'), contactValidator, validateFields, updateContact);

// @route   DELETE /api/contacts/:id
// @desc    Delete contact & unlink file
router.delete('/:id', deleteContact);

// @route   GET /api/contacts/search
// @desc    Smart Hybrid Search (In-memory Trie autocomplete & DB trigram similarity fallback)
router.get('/search', searchContacts);

// @route   GET /api/contacts/history
// @desc    Get top recent search history queries
router.get('/history', getSearchHistory);

// @route   POST /api/contacts/import
// @desc    Import contacts from CSV
router.post('/import', csvUpload.single('file'), importContacts);

// @route   GET /api/contacts/export
// @desc    Export contacts to downloadable CSV
router.get('/export', exportContacts);

// @route   GET /api/contacts/filters
// @desc    Get lists of distinct companies and tags
router.get('/filters', getActiveCompaniesAndTags);

export default router;
