import { addressCheckMiddleware, withSession } from "./utils";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "4mb", // Set desired value here
        },
    },
};

export default withSession(async (req, res) => {
    if (req.method === "POST") {
        const { fileName, contentType } = req.body;

        if (!fileName || !contentType) {
            return res.status(422).send({ message: "Image data are missing" });
        }

        await addressCheckMiddleware(req, res);

        return res.status(200).send({ message: "Success" });
    }
    return res.status(422).send({ message: "Invalid endpoint" });
});
