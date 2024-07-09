import express, { Express, Request, Response } from "express";

const app: Express = express();
const PORT: number = 8000;


app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!!!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});