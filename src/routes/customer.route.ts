import { Router } from "express";
import { registerCustomer, getAllCustomers, getCustomerById } from "../controllers/customer.controller";

const router = Router();

router.post("/register", registerCustomer);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);

export default router;
