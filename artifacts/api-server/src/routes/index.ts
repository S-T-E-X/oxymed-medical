import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import authRouter from "./auth";
import slidersRouter from "./sliders";
import productsRouter from "./products";
import newsRouter from "./news";
import referencesRouter from "./references";
import quotesRouter from "./quotes";
import corporateRouter from "./corporate";
import settingsRouter from "./settings";
import mediaRouter from "./media";
import catalogsRouter from "./catalogs";
import stockRouter from "./stock";
import quoteFormsRouter from "./quote-forms";
import warrantyRouter from "./warranty";
import productionRouter from "./production";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(authRouter);
router.use(slidersRouter);
router.use(productsRouter);
router.use(newsRouter);
router.use(referencesRouter);
router.use(quotesRouter);
router.use(corporateRouter);
router.use(settingsRouter);
router.use(mediaRouter);
router.use(catalogsRouter);
router.use("/stock", stockRouter);
router.use(quoteFormsRouter);
router.use(warrantyRouter);
router.use(productionRouter);

export default router;
