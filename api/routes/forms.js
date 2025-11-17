import express from "express";
import {
  getAllForms,
  getFormByJobNumber,
  createForm,
  updateForm,
  deleteForm
} from "../controllers/forms.js";

const router = express.Router();

router.get("/", getAllForms);
router.post("/", createForm);
router.get("/:jobNumber", getFormByJobNumber);
router.put("/:id", updateForm);
router.delete("/:id", deleteForm);

export default router;
