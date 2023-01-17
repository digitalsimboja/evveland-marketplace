import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-iron-session";
import { addressCheckMiddleware, withSession } from "./utils";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb", // Set desired value here
    },
  },
};

export default withSession(
  async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
    if (req.method === "POST") {
      const { fileName, contentType } = req.body;

      if (!fileName || !contentType) {
        return res.status(422).send({ message: "Image data are missing" });
      }

      await addressCheckMiddleware(req, res);

      return res.status(200).send({ message: "Success" });
    } else {
      return res.status(422).send({ message: "Invalid endpoint" });
    }
  }
);
