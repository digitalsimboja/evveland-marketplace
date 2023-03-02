/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";

import PropTypes from "prop-types";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import Button from "@ui/button";
import ProductModal from "@components/modals/product-modal";
import ErrorText from "@ui/error-text";
import { toast } from "react-toastify";
import axios from "axios";
import NftMarket from "../../../public/contracts/NftMarket.json";

const ALLOWED_FIELDS = ["name", "description", "image", "attributes"];
const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
const ABI = NftMarket;
const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
const listingPrice = 0.025;

const CreateNewArea = ({ className, space }) => {
    const router = useRouter();
    const [showProductModal, setShowProductModal] = useState(false);
    const [onSale, setOnSale] = useState(false);
    const [instantPrice, setInstantPrice] = useState(false);
    const [unlockedPurchase, setUnlockedPurchase] = useState(false);
    const [nftURI, setNftURI] = useState("");
    const [ipfsHash, setIpfsHash] = useState("");
    const [selectedImage, setSelectedImage] = useState();
    const [hasImageError, setHasImageError] = useState(false);
    const [previewData, setPreviewData] = useState({});
    const [nftMeta, setNftMeta] = useState({
        name: "",
        image: "",
        price: 0,
        royalty: 0,
        size: 0,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
    });

    const notify = () => toast("Your product has been submitted");
    const notifyImageUpload = () => toast("Uploading image");
    const handleProductModal = () => {
        setShowProductModal(false);
    };

    // This function will be triggered when the file field change
    const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNftMeta({ ...nftMeta, [name]: value });
    };

    const handleOnSale = (e) => {
        setOnSale(!onSale);
    };

    const handleInstantPriceChange = (e) => {
        setInstantPrice(!instantPrice);
    };

    const handleUnlockedPurchase = (e) => {
        setUnlockedPurchase(!unlockedPurchase);
    };

    // const handleAttributeChange = (e) => {
    //     const { name, value } = e.target;
    //     const attributeIdx = nftMeta.attributes.findIndex(
    //         (attr) => attr.trait_type === name
    //     );

    //     nftMeta.attributes[attributeIdx].value = value;
    //     setNftMeta({
    //         ...nftMeta,
    //         attributes: nftMeta.attributes,
    //     });
    // };

    const getSignedData = async () => {
        const messageToSign = await axios.get("/api/verify");

        const accounts = await window.ethereum?.request({
            method: "eth_requestAccounts",
        });
        const account = accounts[0];

        const signedData = await window.ethereum?.request({
            method: "personal_sign",
            params: [
                JSON.stringify(messageToSign.data),
                account,
                messageToSign.data.id,
            ],
        });

        return { signedData, account };
    };

    const uploadImage = async () => {
        // upload to IPFS and get the returned hash
        const formData = new FormData();
        formData.append("file", selectedImage);
        const metadata = JSON.stringify({
            name: selectedImage.name,
        });
        formData.append("pinataMetadata", metadata);
        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append("pinataOptions", options);

        try {
            const { signedData, account } = await getSignedData();
            const _ = await axios.post("/api/verify-image", {
                address: account,
                signature: signedData,
                contentType: selectedImage.type,
                fileName: selectedImage.name.replace(/\.[^/.]+$/, ""),
            });

            notifyImageUpload();

            const res = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    maxBodyLength: "Infinity",
                    headers: {
                        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                        pinata_api_key: pinataApiKey,
                        pinata_secret_api_key: pinataSecretApiKey,
                    },
                }
            );

            const { data } = res;
            setNftMeta({
                ...nftMeta,
                image: `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const uploadMetadata = async () => {
        const { signedData, account } = await getSignedData();

        try {
            const promise = axios.post("/api/verify", {
                address: account,
                signature: signedData,
                nft: nftMeta,
            });
            const res = await toast.promise(promise, {
                pending: "Uploading metadata",
                success: "Metadata uploaded",
                error: "Metadata upload error",
            });

            const { data } = res;

            setIpfsHash(data.IpfsHash);

            setNftURI(
                `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`
            );
        } catch (error) {
            console.error(error);
        }
    };

    const createNft = async () => {
       
        try {

            const accounts = await window.ethereum?.request({
                method: "eth_requestAccounts",
            });
            const account = accounts[0];

            const provider = new ethers.JsonRpcProvider(window.ethereum);

            const signer = provider.getSigner(account);

            const contract = new ethers.Contract(MARKETPLACE, ABI, signer);
            console.log(contract)

            // const tx = await contract.createMarketItem(
            //     nftURI,
            //     ethers.utils.parseEther(nftMeta.price),
            //     {
            //         value: ethers.utils.parseEther(listingPrice.toString()),
            //     }
            // );
            // tx.wait();

            // console.log("Successfully minted: ", tx);

            // await toast.promise(tx.wait(), {
            //     pending: "Minting NFT Token",
            //     success: "NFT has been created and listed",
            //     error: "Minting error",
            // });

            reset();
            setSelectedImage();

            router.push({
                pathname: "/",
            });
        } catch (e) {
            console.log(e.message);
        }
    };

    const onSubmit = async (data, e) => {
        const { target } = e;
        const submitBtn =
            target.localName === "span" ? target.parentElement : target;
        const isPreviewBtn = submitBtn.dataset?.btn;
        setHasImageError(!selectedImage);
        if (isPreviewBtn && selectedImage) {
            setPreviewData({ ...data, image: selectedImage });
            setShowProductModal(true);
        }

        if (!isPreviewBtn) {
            // Upload image to IPFS
            await uploadImage();

            // Upload Metadata to ipfs
            await uploadMetadata();

            notify();
        }
    };

    return (
        <>
            <div
                className={clsx(
                    "create-area",
                    space === 1 && "rn-section-gapTop",
                    className
                )}
            >
                <form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <div className="container">
                        <div className="row g-5">
                            <div className="col-lg-3 offset-1 ml_md--0 ml_sm--0">
                                <div className="upload-area">
                                    <div className="upload-formate mb--30">
                                        <h6 className="title">Upload file</h6>
                                        <p className="formate">
                                            Drag or choose your file to upload
                                        </p>
                                    </div>

                                    <div className="brows-file-wrapper">
                                        <input
                                            name="file"
                                            id="file"
                                            type="file"
                                            className="inputfile"
                                            data-multiple-caption="{count} files selected"
                                            multiple
                                            onChange={imageChange}
                                        />
                                        {selectedImage && (
                                            <img
                                                id="createfileImage"
                                                src={URL.createObjectURL(
                                                    selectedImage
                                                )}
                                                alt=""
                                                data-black-overlay="6"
                                            />
                                        )}

                                        <label
                                            htmlFor="file"
                                            title="No File Choosen"
                                        >
                                            <i className="feather-upload" />
                                            <span className="text-center">
                                                Choose a File
                                            </span>
                                            <p className="text-center mt--10">
                                                PNG, GIF, WEBP, MP4 or MP3.{" "}
                                                <br /> Max 1Gb.
                                            </p>
                                        </label>
                                    </div>

                                    {hasImageError && !selectedImage && (
                                        <ErrorText>Image is required</ErrorText>
                                    )}
                                </div>

                                <div className="mt--100 mt_sm--30 mt_md--30 d-none d-lg-block">
                                    <h5> Note: </h5>
                                    <span>
                                        {" "}
                                        Service fee : <strong>10%</strong>{" "}
                                    </span>{" "}
                                    <br />
                                    <span>
                                        {" "}
                                        You will receive :{" "}
                                        <strong>25.00 ETH $50,000</strong>
                                    </span>
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <div className="form-wrapper-one">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="name"
                                                    className="form-label"
                                                >
                                                    Product Name
                                                </label>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    placeholder="e. g. `Digital Awesome Game`"
                                                    {...register("name", {
                                                        onChange: (e) => {
                                                            handleChange(e);
                                                        },
                                                        required:
                                                            "Name is required",
                                                    })}
                                                />
                                                {errors.name && (
                                                    <ErrorText>
                                                        {errors.name?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Description"
                                                    className="form-label"
                                                >
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows="3"
                                                    placeholder="e. g. “After purchasing the product you can get item...”"
                                                    {...register(
                                                        "description",
                                                        {
                                                            onChange: (e) => {
                                                                handleChange(e);
                                                            },
                                                            required:
                                                                "Description is required",
                                                        }
                                                    )}
                                                />
                                                {errors.discription && (
                                                    <ErrorText>
                                                        {
                                                            errors.discription
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="price"
                                                    className="form-label"
                                                >
                                                    Item Price in $
                                                </label>
                                                <input
                                                    id="price"
                                                    placeholder="e. g. `20$`"
                                                    {...register("price", {
                                                        pattern: {
                                                            value: /^[0-9]+$/,
                                                            message:
                                                                "Please enter a number",
                                                        },
                                                        onChange: (e) => {
                                                            handleChange(e);
                                                        },
                                                        required:
                                                            "Price is required",
                                                    })}
                                                />
                                                {errors.price && (
                                                    <ErrorText>
                                                        {errors.price?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Size"
                                                    className="form-label"
                                                >
                                                    Size
                                                </label>
                                                <input
                                                    id="size"
                                                    placeholder="e. g. `Size`"
                                                    {...register("size", {
                                                        onChange: (e) => {
                                                            handleChange(e);
                                                        },
                                                        required:
                                                            "Size is required",
                                                    })}
                                                />
                                                {errors.size && (
                                                    <ErrorText>
                                                        {errors.size?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Propertie"
                                                    className="form-label"
                                                >
                                                    Properties
                                                </label>
                                                <input
                                                    id="property"
                                                    placeholder="e. g. `Properties`"
                                                    {...register("property", {
                                                        onChange: (e) => {
                                                            handleChange(e);
                                                        },
                                                        required:
                                                            "Property is required",
                                                    })}
                                                />
                                                {errors.property && (
                                                    <ErrorText>
                                                        {
                                                            errors.property
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Royality"
                                                    className="form-label"
                                                >
                                                    Royalty
                                                </label>
                                                <input
                                                    id="royalty"
                                                    placeholder="e. g. `20%`"
                                                    {...register("royalty", {
                                                        onChange: (e) => {
                                                            handleChange(e);
                                                        },
                                                        required:
                                                            "Royalty is required",
                                                    })}
                                                />
                                                {errors.royalty && (
                                                    <ErrorText>
                                                        {
                                                            errors.royalty
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-4">
                                            <div className="input-box pb--20 rn-check-box">
                                                <input
                                                    className="rn-check-box-input"
                                                    type="checkbox"
                                                    id="putonsale"
                                                    {...register("putonsale", {
                                                        onChange: (e) => {
                                                            handleOnSale(e);
                                                        },
                                                    })}
                                                />
                                                <label
                                                    className="rn-check-box-label"
                                                    htmlFor="putonsale"
                                                >
                                                    Put on Sale
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-4">
                                            <div className="input-box pb--20 rn-check-box">
                                                <input
                                                    className="rn-check-box-input"
                                                    type="checkbox"
                                                    id="instantsaleprice"
                                                    {...register(
                                                        "instantsaleprice",
                                                        {
                                                            onChange: (e) => {
                                                                handleInstantPriceChange(
                                                                    e
                                                                );
                                                            },
                                                        }
                                                    )}
                                                />
                                                <label
                                                    className="rn-check-box-label"
                                                    htmlFor="instantsaleprice"
                                                >
                                                    Instant Sale Price
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-4">
                                            <div className="input-box pb--20 rn-check-box">
                                                <input
                                                    className="rn-check-box-input"
                                                    type="checkbox"
                                                    id="unlockpurchased"
                                                    {...register(
                                                        "unlockpurchased",
                                                        {
                                                            onChange: (e) => {
                                                                handleUnlockedPurchase(
                                                                    e
                                                                );
                                                            },
                                                        }
                                                    )}
                                                />
                                                <label
                                                    className="rn-check-box-label"
                                                    htmlFor="unlockpurchased"
                                                >
                                                    Unlock Purchased
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-12 col-xl-4">
                                            <div className="input-box">
                                                <Button
                                                    color="primary-alta"
                                                    fullwidth
                                                    type="submit"
                                                    data-btn="preview"
                                                    onClick={handleSubmit(
                                                        onSubmit
                                                    )}
                                                >
                                                    Preview
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="col-md-12 col-xl-8 mt_lg--15 mt_md--15 mt_sm--15">
                                            <div className="input-box">
                                                {nftURI ? (
                                                    <Button
                                                        onClick={createNft}
                                                        type="button"
                                                        fullwidth
                                                    >
                                                        Create NFT
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="submit"
                                                        fullwidth
                                                    >
                                                        Submit Item
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt--100 mt_sm--30 mt_md--30 d-block d-lg-none">
                                <h5> Note: </h5>
                                <span>
                                    {" "}
                                    Service fee : <strong>10%</strong>{" "}
                                </span>{" "}
                                <br />
                                <span>
                                    {" "}
                                    You will receive :{" "}
                                    <strong>25.00 ETH $50,000</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {showProductModal && (
                <ProductModal
                    show={showProductModal}
                    handleModal={handleProductModal}
                    data={previewData}
                />
            )}
        </>
    );
};

CreateNewArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1]),
};

CreateNewArea.defaultProps = {
    space: 1,
};

export default CreateNewArea;
