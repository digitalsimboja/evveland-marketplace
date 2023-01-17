import { Switch } from "@chakra-ui/react"
import Link from 'next/link';
import { useEffect, useState } from "react"
import { useAccount, useContract, useSigner } from 'wagmi'
import axios from 'axios';
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { ExclamationIcon } from '@heroicons/react/solid';
import EvvelandMarketplace from "../public/contracts/EvvelandMarketplace.json"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from 'next/dynamic'

const Base = dynamic(() => import('../components/Base'), { ssr: false });

const ALLOWED_FIELDS = ["name", "description", "image", "attributes"];
const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
const ABI = EvvelandMarketplace.abi
const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY

export default function CreateNFT() {
  const { data: signer, isError, isLoading } = useSigner()
  const [selectedFile, setSelectedFile] = useState()
  const { address, isConnecting, isConnected, isDisconnected } = useAccount()
  const contract = useContract({
    address: MARKETPLACE,
    abi: ABI,
    signerOrProvider: signer,
  })
  const [hasURI, setHasURI] = useState(false)
  const [nftURI, setNftURI] = useState("")
  const [ipfsHash, setIpfsHash] = useState("")
  const [nftMeta, setNftMeta] = useState({
    name: "",
    description: "",
    image: "",
    attributes: [
      { trait_type: "location", value: "Evveland Metaverse" },
      { trait_type: "status", value: "Active" },
      { trait_type: "event", value: "Evveland Metaverse Event" },
    ]
  });
  const [price, setPrice] = useState("")


  const handleChange = (e) => {
    const { name, value } = e.target;
    setNftMeta({ ...nftMeta, [name]: value })
  }

  const uploadHandler = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      console.error("Select a file");
      return;
    }
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmission = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile)
    const metadata = JSON.stringify({
      name: selectedFile.name,
    });
    formData.append('pinataMetadata', metadata);
    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);

    try {
      const { signedData, account } = await getSignedData();
      const success = axios.post("/api/verify-image", {
        address: account,
        signature: signedData,
        contentType: selectedFile.type,
        fileName: selectedFile.name.replace(/\.[^/.]+$/, "")
      });
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        }
      });

      const data = res.data

      setNftMeta({
        ...nftMeta,
        image: `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`
      })
    } catch (error) {
      console.log(error);
    }
  };

  const getSignedData = async () => {
    const messageToSign = await axios.get("/api/verify")
    const account = address;

    const signedData = await window.ethereum.request({
      method: "personal_sign",
      params: [JSON.stringify(messageToSign.data), account, messageToSign.data.id]
    })

    return { signedData, account }
  }


  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    const attributeIdx = nftMeta.attributes.findIndex(attr => attr.trait_type === name);

    nftMeta.attributes[attributeIdx].value = value;
    setNftMeta({
      ...nftMeta,
      attributes: nftMeta.attributes
    })
  }

  const uploadMetadata = async () => {
    try {
      const { signedData, account } = await getSignedData();

      const promise = axios.post("/api/verify", {
        address: account,
        signature: signedData,
        nft: nftMeta
      })
      const res = await toast.promise(
        promise, {
        pending: "Uploading metadata",
        success: "Metadata uploaded",
        error: "Metadata upload error"
      }
      )

      const data = res.data;
      setIpfsHash(data.IpfsHash)
      setNftURI(`${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`);
    } catch (e) {
      console.error(e.message);
    }
  }

  const createNft = async () => {
    try {
      const nftRes = await fetch(nftURI, {
        method: 'GET',
        mode: 'no-cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        credentials: 'same-origin',
      }
      );

      Object.keys(nftRes).forEach(key => {
        if (!ALLOWED_FIELDS.includes(key)) {
          throw new Error("Invalid Json structure");
        }
      })

      const tx = await contract.createMarketItem(
        nftURI,
        ethers.utils.parseEther(price), {
        value: ethers.utils.parseEther(0.025.toString())
      }
      );
      tx.wait()

      console.log("Minted: ", tx)

      await toast.promise(
        tx.wait(), {
        pending: "Minting NFT Token",
        success: "NFT has been created and listed",
        error: "Minting error"
      }
      )

    } catch (e) {
      console.log(e.message)
    }
  }


  if (!isConnected) {
    return (
      <Base>
        <div className="flex rounded-md bg-yellow-50 p-4 mt-10">
          <div className="flex-shrink-0">
            <ExclamationIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Attention!!!</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <div>
                {isConnecting ? "Loading" : <ConnectButton />}
              </div>
            </div>
          </div>
        </div>
      </Base>
    )
  }

  console.log("ipfsHash", ipfsHash)

  return (
    <Base>
      <div>
        <div className="py-4">
          {!nftURI &&
            <div className="flex">
              <div className="mr-2 font-bold underline">Do you have meta data already?</div>
              <Switch
                checked={hasURI}
                onChange={() => setHasURI(!hasURI)}
                className={`${hasURI ? 'bg-indigo-900' : 'bg-indigo-700'}
                      relative inline-flex flex-shrink-0 h-[28px] w-[64px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`${hasURI ? 'translate-x-9' : 'translate-x-0'}
                        pointer-events-none inline-block h-[24px] w-[24px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
                />
              </Switch>
            </div>
          }
        </div>
        {(nftURI || hasURI) ?
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">List NFT</h3>
                <p className="mt-1 text-sm text-gray-600">
                  This information will be displayed publicly so be careful what you share.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  {hasURI &&
                    <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                      <div>
                        <label htmlFor="uri" className="block text-sm font-medium text-gray-700">
                          Metadata URI Link
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            onChange={(e) => setNftURI(e.target.value)}
                            type="text"
                            name="uri"
                            id="uri"
                            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                            placeholder="http://link.com/data.json"
                          />
                        </div>
                      </div>
                    </div>
                  }
                  {nftURI &&
                    <div className='mb-4 p-4'>
                      <div className="font-bold">Your metadata: </div>
                      <div>
                        <Link href={nftURI} legacyBehavior>
                          <a className="underline text-indigo-600" target={"_blank"}>
                            {nftURI}
                          </a>
                        </Link>
                      </div>
                    </div>
                  }
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Price (ETH)
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          onChange={(e) => setPrice(e.target.value)}
                          value={price}
                          type="number"
                          name="price"
                          id="price"
                          className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                          placeholder="0.8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      onClick={createNft}
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          :
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Create NFT Metadata</h3>
                <p className="mt-1 text-sm text-gray-600">
                  This information will be displayed publicly so be careful what you share.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          value={nftMeta.name}
                          onChange={handleChange}
                          type="text"
                          name="name"
                          id="name"
                          className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                          placeholder="My Nice NFT"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          value={nftMeta.description}
                          onChange={handleChange}
                          id="description"
                          name="description"
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="Some nft description..."
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Brief description of NFT
                      </p>
                    </div>
                    {/* Has Image? */}
                    {nftMeta.image ?
                      <img src={nftMeta.image} alt="" className="h-40" /> :
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                              >
                                {selectedFile ? <span>{selectedFile.name}</span> : <span>Upload a file</span>}
                                <input
                                  onChange={uploadHandler}
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                />
                              </label>
                              {selectedFile ? <p className="pl-1 text-yellow-500">Replace</p> : <p className="pl-1">or Drag and Drop</p>}

                            </div>
                            <p className="text-xs text-gray-500"> PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                        <button
                          onClick={handleSubmission}
                          disabled={!selectedFile}
                          type="button"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Pin Image
                        </button>

                      </div>
                    }
                    <div className="grid grid-cols-6 gap-6">
                      {nftMeta.attributes.map(attribute =>
                        <div key={attribute.trait_type} className="col-span-6 sm:col-span-6 lg:col-span-2">
                          <label htmlFor={attribute.trait_type} className="block text-sm font-medium text-gray-700">
                            {attribute.trait_type}
                          </label>
                          <input
                            onChange={handleAttributeChange}
                            value={attribute.value}
                            type="text"
                            name={attribute.trait_type}
                            id={attribute.trait_type}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-sm !mt-2 text-gray-500">
                      Edit the NFT attributes info
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      onClick={uploadMetadata}
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      List
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </Base>
  )
}