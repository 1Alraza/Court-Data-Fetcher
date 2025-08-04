import { Router } from "express";
import { Getcaptcha, GetCourtdata } from "../controllers/controller.js";

const router = Router();

router.post("/fetch-case",GetCourtdata);
router.get("/get-captcha", Getcaptcha); 

export default router;