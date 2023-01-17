import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";
import * as util from "ethereumjs-util";
import EvvelandMarketplace from "../../public/contracts/EvvelandMarketplace.json"

export const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
export const abi = EvvelandMarketplace.abi
export const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY as string;
export const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY as string;

export function withSession(handler: any) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: "nft-auth-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  });
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_QUICKNODE_HTTP_URL
    : "http://127.0.0.1:3000";

export const addressCheckMiddleware = async (
  req: NextApiRequest & { session: Session },
  res: NextApiResponse
) => {
  return new Promise(async (resolve, reject) => {
    const message = req.session.get("message-session");
    const provider = new ethers.providers.JsonRpcProvider(url);
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      provider
    );

    let nonce: string | Buffer =
      "\x19Ethereum Signed Message:\n" +
      JSON.stringify(message).length +
      JSON.stringify(message);

    nonce = util.keccak(Buffer.from(nonce, "utf-8"));
    const { v, r, s } = util.fromRpcSig(req.body.signature);
    const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
    const addrBuffer = util.pubToAddress(pubKey);
    const address = util.bufferToHex(addrBuffer);

    if (address === req.body.address.toLowerCase()) {
      resolve("Correct Address");
    } else {
      reject("Wrong Address");
    }
  });
};
