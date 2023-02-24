import { ethers } from "ethers";
import { withIronSession } from "next-iron-session";
import * as util from "ethereumjs-util";
import NftMarket from "../../../public/contracts/NftMarket.json";

export const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
export const { abi } = NftMarket;
export const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
export const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

export function withSession(handler) {
    return withIronSession(handler, {
        password: process.env.NEXT_PUBLIC_SECRET_COOKIE_PASSWORD,
        cookieName: "nft-auth-session",
        cookieOptions: {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            secure: true,
        },
    });
}

const url =
    process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_QUICKNODE_HTTP_URL
        : "http://127.0.0.1:3000";

export const addressCheckMiddleware = async (req, res) =>
    new Promise((resolve, reject) => {
        const message = req.session.get("message-session");

        const provider = new ethers.JsonRpcProvider(url);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        const ethMessage = "\x19Ethereum Signed Message:\n";
        let nonce =
            ethMessage +
            JSON.stringify(message).length +
            JSON.stringify(message);

        nonce = util.keccak(Buffer.from(nonce, "utf-8"));
        const { v, r, s } = util.fromRpcSig(req.body.signature);
        const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
        const addrBuffer = util.pubToAddress(pubKey);
        const address = util.bufferToHex(addrBuffer);

        if (address === req.body.address.toLowerCase()) {
            resolve("Correct address");
        } else {
            reject(new Error("Promise rejected due to wrong address"));
        }
    });
