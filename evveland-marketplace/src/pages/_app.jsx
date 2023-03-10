import { useEffect } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import sal from "sal.js";
import { ThemeProvider } from "next-themes";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import "@rainbow-me/rainbowkit/styles.css";
import "../assets/css/bootstrap.min.css";
import "../assets/css/feather.css";
import "../assets/css/modal-video.css";
import "react-toastify/dist/ReactToastify.css";
import "../assets/scss/style.scss";

const polygonChain = {
    id: 80001,
    name: "Mumbai Testnet",
    network: "polygon",
    nativeCurrency: {
        decimals: 18,
        name: "Matic",
        symbol: "MATIC",
    },
    rpcUrls: {
        default: "https://rpc-mumbai.maticvigil.com",
    },
    blockExplorers: {
        default: {
            name: "polygonscan",
            url: "https://mumbai.polygonscan.com/",
        },
    },
    testnet: true,
};

const { chains, provider } = configureChains(
    [polygonChain],
    [
        jsonRpcProvider({
            rpc: (chain) => {
                if (chain.id !== polygonChain.id) {
                    throw new Error(
                        "Error! Switch your network to Polygon Mumbai Testnet"
                    );
                }
                return { http: chain.rpcUrls.default };
            },
        }),
    ]
);

const { connectors } = getDefaultWallets({
    appName: "Evveland Metaverse Marketplace",
    chains,
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

const MyApp = ({ Component, pageProps }) => {
    const router = useRouter();
    useEffect(() => {
        sal({ threshold: 0.1, once: true });
    }, [router.asPath]);

    useEffect(() => {
        sal();
    }, []);
    useEffect(() => {
        document.body.className = `${pageProps.className}`;
    });
    return (
        <ThemeProvider defaultTheme="dark">
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider chains={chains}>
                    <Component {...pageProps} />
                </RainbowKitProvider>
            </WagmiConfig>
        </ThemeProvider>
    );
};

MyApp.propTypes = {
    Component: PropTypes.elementType,
    pageProps: PropTypes.shape({
        className: PropTypes.string,
    }),
};

export default MyApp;
