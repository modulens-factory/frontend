// BFF components
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useTransition } from "@remix-run/react";

import { db } from "~/bff/db.server";
import { destroySession, getSession } from "~/bff/session";

import { lensClient } from "~/web3/lens/lens-client";
import {
  GetDefaultProfile,
  GetPublicationReferenceModule,
} from "~/web3/lens/graphql/generated";

import { getBalanceFromAddress } from "~/web3/etherservice";

// UI components
import React, { useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import { MdPostAdd, MdAdsClick } from "react-icons/md";
// import { IoDiceOutline } from "react-icons/io";

// components
import NavbarConnected from "~/components/navbar/NavbarConnectedDesktop";
import HotProfiles from "~/components/HotProfiles";
import ProfileParticipation from "~/components/ProfileParticipation";
import SettingsBox from "~/components/SettingsBox";

import { switchNetwork } from "~/web3/metamask";
import { EditIcon } from "@chakra-ui/icons";
import CoinSelect from "~/components/CoinSelect";
import BalanceWallet from "~/components/BalanceWallet";
import { getTotalFundedProfile } from "~/web3/social-defi";
import { getGasFee } from "~/web3/gasfee";
import {
  getaWMATICBalance,
  getWEthBalance,
  getWMATICBalance,
  getUSDCBalance,
  getDAIBalance,
  getTOUBalance,
} from "~/web3/erc20";
import { getPriceFeedFromFlowmi } from "~/web3/social-defi/getPriceFeed";

import { getGlobalBudget, getPostBudget } from "~/web3/adsModule/index";
import {
  DAI_CONTRACT_ADDRESS,
  TOU_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  WEth_CONTRACT_ADDRESS,
  WMATIC_CONTRACT_ADDRESS,
} from "~/web3/erc20/erc20-hub";
import BalanceGlobalBudget from "~/components/BalanceGlobalBudget";
import GetIdPublications from "~/web3/adsModule/publicationId";
import getItemIds from "~/web3/adsModule/publicationId";
import BalanceContract from "~/components/BalanceContract";
import { transformToIpfsUrl } from "~/web3/ipfs/ipfs";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  const address = session.get("address");

  const accessToken = session.get("accessToken");

  // Get default profile from Lens
  const variables: any = {
    request: { ethereumAddress: address },
  };

  const responseProfile = await lensClient.request(
    GetDefaultProfile,
    variables
  );

  const referenceModule = await lensClient.request(
    GetPublicationReferenceModule
  );

  const defaultProfile = responseProfile.defaultProfile;
  const results = await getItemIds(defaultProfile.id);

  console.log(results);

  const [
    totalFounded,

    maticBalance,
    wmaticBalance,
    wethBalance,
    usdcBalance,
    daiBalance,
    touBalance,
    globalBudgetWmatic,
    globalBudgetWEth,
    globalBudgetDai,
    globalBudgetUsdc,
    globalBudgetTou,
  ] = await Promise.all([
    getTotalFundedProfile(defaultProfile?.ownedBy),
    getBalanceFromAddress(address),
    getWMATICBalance(address),
    getWEthBalance(address),
    getUSDCBalance(address),
    getDAIBalance(address),
    getTOUBalance(address),
    getGlobalBudget(defaultProfile?.id, WMATIC_CONTRACT_ADDRESS),
    getGlobalBudget(defaultProfile?.id, WEth_CONTRACT_ADDRESS),
    getGlobalBudget(defaultProfile?.id, DAI_CONTRACT_ADDRESS),
    getGlobalBudget(defaultProfile?.id, USDC_CONTRACT_ADDRESS),
    getGlobalBudget(defaultProfile?.id, TOU_CONTRACT_ADDRESS),
  ]);
  return {
    address,
    accessToken,
    defaultProfile,
    totalFounded,
    maticBalance,
    wmaticBalance,
    wethBalance,
    usdcBalance,
    daiBalance,
    touBalance,
    globalBudgetWmatic,
    globalBudgetWEth,
    globalBudgetDai,
    globalBudgetUsdc,
    globalBudgetTou,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const address = form.get("address");
  const connected = form.get("connected");
  const intent = form.get("intent");
  const profileToGo = form.get("profileToGo");

  if (intent === "search") {
    return redirect(`/${profileToGo}.test`);
  }

  if (!address || typeof address !== "string") return null;
  if (!connected || typeof connected !== "string") return null;

  await db.user.update({
    where: {
      address,
    },
    data: {
      connected: connected === "true",
    },
  });

  const session = await getSession(request.headers.get("Cookie"));

  return redirect(`/`, {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export default function Dashboard() {
  const {
    address,
    defaultProfile,
    totalFounded,
    gasFee,
    priceFeed,
    maticBalance,
    wmaticBalance,
    awmaticBalance,
    wethBalance,
    usdcBalance,
    daiBalance,
    touBalance,
    globalBudgetWmatic,
    globalBudgetWEth,
    globalBudgetDai,
    globalBudgetUsdc,
    globalBudgetTou,
  } = useLoaderData();

  const [postNormal, setPostNormal] = React.useState(false);
  const [postAds, setPostAds] = React.useState(true);

  const activePostNormal = () => {
    setPostAds(false);
    setPostNormal(true);
  };
  const activePostAds = () => {
    setPostNormal(false);
    setPostAds(true);
  };

  useEffect(() => {
    const changeNetwork = async () => {
      await switchNetwork();
    };

    changeNetwork()
      // make sure to catch any error
      .catch(console.error);
  }, []);

  console.log(defaultProfile);

  return (
    <Box bg="#FAFAF9" h="100vh">
      <NavbarConnected
        address={address}
        authenticatedInLens={true}
        handle={defaultProfile?.handle}
      />

      <Flex flexDirection="row">
        <Box bg="white" ml="40px" mt="7" w="50%" pb="32">
          <Box pt={8} pl={8}>
            <Text
              fontSize="3xl"
              fontWeight="900"
              bgGradient="linear(to-r, #FFB83F , #FF5873 20% )"
              bgClip="text"
            >
              Welcome{" "}
              {`${
                defaultProfile?.handle[0].toUpperCase() +
                defaultProfile?.handle.substring(1).slice(0, -5)
              }`}
            </Text>
            <Text fontSize="md" fontWeight="600">
              Let’s create the best post for you
            </Text>

            {/* Start normal post */}
            {postNormal && !postAds && (
              <>
                <Flex flexDirection="row" pt="5">
                  <Button
                    leftIcon={<MdPostAdd />}
                    bgGradient="linear(to-r, #FFB83F , #FF5873 80% )"
                    variant="solid"
                    color="white"
                    borderRadius="20px"
                    mr="5px"
                    onClick={activePostNormal}
                  >
                    Post
                  </Button>
                  <Button
                    leftIcon={<MdAdsClick />}
                    colorScheme="black"
                    variant="ghost"
                    fontWeight="500"
                    onClick={activePostAds}
                  >
                    Ads P2P
                  </Button>
                </Flex>
                <Flex flexDirection="row" pt="5">
                  <Avatar
                    size="md"
                    src={transformToIpfsUrl(
                      defaultProfile?.picture?.original?.url
                    )}
                  />
                  <InputGroup mx={5}>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<EditIcon color="gray.500" />}
                    />
                    <Input type="tel" placeholder="Whay’s happening?" />
                  </InputGroup>
                  <Button
                    leftIcon={<EditIcon />}
                    // colorScheme="teal"
                    bgGradient="linear(to-r, #FFB83F , #FF5873 60% )"
                    variant="solid"
                    color="white"
                    mr={20}
                    borderRadius="15px"
                    w={36}
                  >
                    Post
                  </Button>
                </Flex>
              </>
            )}
            {/* Start ads post */}
            {!postNormal && postAds && (
              <>
                <Flex flexDirection="row" pt="5">
                  <Button
                    leftIcon={<MdPostAdd />}
                    colorScheme="black"
                    variant="ghost"
                    fontWeight="500"
                    mr="5px"
                    onClick={activePostNormal}
                  >
                    Post
                  </Button>
                  <Button
                    leftIcon={<MdAdsClick />}
                    bgGradient="linear(to-r, #FFB83F , #FF5873 80% )"
                    variant="solid"
                    color="white"
                    borderRadius="20px"
                    mr="5px"
                    onClick={activePostAds}
                  >
                    Ads P2P
                  </Button>
                </Flex>
                <Box pt={3} pr="20px" w="80%">
                  <Text fontSize="md">
                    Create a p2p Ads and for each person who shares and helps
                    you reach more public, you will have to pay an amount
                    designated by you
                  </Text>
                </Box>
                <Flex flexDirection="row" pt="7">
                  <Avatar
                    size="md"
                    src={transformToIpfsUrl(
                      defaultProfile?.picture?.original?.url
                    )}
                  />
                  <InputGroup mx={5}>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<EditIcon color="gray.500" />}
                    />
                    <Input type="tel" placeholder="Whay’s happening?" />
                  </InputGroup>
                  <Button
                    leftIcon={<EditIcon />}
                    // colorScheme="teal"
                    bgGradient="linear(to-r, #FFB83F , #FF5873 60% )"
                    variant="solid"
                    color="white"
                    mr={20}
                    borderRadius="15px"
                    w={36}
                  >
                    Post
                  </Button>
                </Flex>
                <Flex flexDirection="row" pt="5" pl="10">
                  <Box>
                    <Text align="center" fontWeight={600}>
                      Incentivo
                    </Text>
                    <NumberInput defaultValue={1} w={32}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box pl={3}>
                    <Text align="center" fontWeight={600}>
                      Coins
                    </Text>

                    <Select placeholder="WMatic">
                      <option value="option1">
                        <MdPostAdd />
                        <Text>Hla</Text>
                      </option>
                      <option value="option2">??</option>
                      <option value="option3">???</option>
                    </Select>
                  </Box>
                  <Box pl={20}>
                    <Text align="center" fontWeight={600}>
                      Numbers of reply
                    </Text>
                    <NumberInput defaultValue={1} w={40}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                </Flex>
              </>
            )}
          </Box>
        </Box>
        <Box bg="white" ml="70px" mt="7" w="35%" pb="32">
          <Box pt={8} pl={8}>
            <Text
              fontSize="3xl"
              fontWeight="900"
              bgGradient="linear(to-r, #FFB83F , #FF5873 20% )"
              bgClip="text"
            >
              Balance{" "}
            </Text>
            <Text fontSize="lg" fontWeight="bold" pt={6}>
              Contract balance
            </Text>
            <Link href="https://app.uniswap.org/#/swap" isExternal>
              <Text fontSize="sm" color="#8B5CF6" fontWeight={400}>
                Need WMatic? lets swap 🦄
              </Text>
            </Link>

            <BalanceWallet
              maticBalance={maticBalance}
              wmaticBalance={wmaticBalance}
              awmaticBalance={awmaticBalance}
              wethBalance={wethBalance}
              gasFee={gasFee}
              priceFeed={priceFeed}
              usdcBalance={usdcBalance}
              daiBalance={daiBalance}
              touBalance={touBalance}
            />
            <BalanceGlobalBudget
              globalBudgetWmatic={globalBudgetWmatic}
              globalBudgetWEth={globalBudgetWEth}
              globalBudgetDai={globalBudgetDai}
              globalBudgetUsdc={globalBudgetUsdc}
              globalBudgetTou={globalBudgetTou}
            />
            {/* <BalanceContract /> */}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
