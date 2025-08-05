import { Router } from "express";
import { FetchCourtdata, Getcaptcha} from "../controllers/controller.js";

const router = Router();

router.post("/fetch-case",FetchCourtdata); // this route is used to fetch court data based on case details
router.get("/get-captcha", Getcaptcha); // this route is used to get the captcha code for Frontend

export default router;