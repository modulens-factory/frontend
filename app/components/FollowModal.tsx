import React from "react";

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import { ethers } from "ethers";

import { createUnfollowTypedData } from "~/web3/lens/follow/unfollow";
import { LENS_HUB_ABI, LENS_HUB_CONTRACT_ADDRESS } from "~/web3/lens/lens-hub";
import { getSigner } from "~/web3/etherservice";

import { Step, Steps, useSteps } from "chakra-ui-steps";

type FollowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  handle: string;
};

const FollowModal = ({
  isOpen,
  onClose,
  profileId,
  handle,
}: FollowModalProps) => {
  const steps = [{ label: "Confirm follow" }, { label: "Follow complete 🎉" }];

  const { nextStep, activeStep, reset } = useSteps({
    initialStep: 0,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [signed, setSigned] = React.useState(false);
  const [error, setError] = React.useState(false);

  const [txHash, setTxHash] = React.useState("");

  const handleFollow = async () => {
    setIsLoading(true);

    const lensContract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENS_HUB_ABI,
      getSigner()
    );

    try {
      const followProfile = await lensContract.follow([profileId], [0x0]);

      nextStep();

      setIsLoading(false);
      setSigned(true);

      const followTx = await followProfile.wait();

      setTxHash(followTx.transactionHash);

      nextStep();
      setSigned(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    setIsLoading(false);
    setSigned(false);
    setError(false);

    reset();
    onClose();
  };

  const handleExploreTx = async () => {
    window.open(`https://polygonscan.com/tx/${txHash}`, "_blank");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius={20}>
        <ModalHeader>Follow</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Steps
              labelOrientation="vertical"
              activeStep={activeStep}
              responsive={false}
              size="sm"
            >
              {steps.map(({ label }) => (
                <Step label={label} key={label}></Step>
              ))}
            </Steps>
          </Box>

          {activeStep === 0 && (
            <>
              <Text
                fontWeight="600"
                fontSize="14px"
                lineHeight="120%"
                color="black"
                pt="5"
                pl="5"
                pr="5"
              >
                You are going to start following the profile{" "}
                <Text
                  as="span"
                  fontWeight="700"
                  fontSize="14px"
                  bgGradient="linear(to-r, #31108F, #7A3CE3, #E53C79, #E8622C, #F5C144)"
                  bgClip="text"
                >
                  @{handle}
                </Text>
              </Text>

              <Box pt="5">
                <Text
                  textAlign="center"
                  fontWeight="500"
                  fontSize="15px"
                  letterSpacing="-0.03em"
                  color="black"
                >
                  Social DeFi will charge a fee of
                </Text>

                <Text
                  textAlign="center"
                  fontWeight="700"
                  fontSize="36px"
                  letterSpacing="-0.03em"
                  bgGradient="linear(to-r, #31108F, #7A3CE3, #E53C79, #E8622C, #F5C144)"
                  bgClip="text"
                >
                  $1 USD
                </Text>
              </Box>

              <Text
                textAlign="justify"
                fontWeight="600"
                fontSize="12px"
                lineHeight="120%"
                color="grayLetter"
                pt="5"
                pl="5"
                pr="5"
              >
                Remember that when you defi follow a profile, you will be
                charged 1 USD in MATIC and it will be deposited in Aave
                protocol.When the number of defi followers reaches 10, the
                accumulated jackpot will be drawn among all the defi followers.
              </Text>
            </>
          )}

          {activeStep == 2 && !signed && (
            <>
              <>
                <Center pt="5" pl="5" pr="5">
                  <Alert status="success" borderRadius={10}>
                    <AlertIcon />
                    Follow successfully!
                  </Alert>
                </Center>

                <Text pt="5" pl="5" pr="5">
                  Congratulations, you have just follow the profile{" "}
                  <Text
                    as="span"
                    fontWeight="700"
                    fontSize="14px"
                    bgGradient="linear(to-r, #31108F, #7A3CE3, #E53C79, #E8622C, #F5C144)"
                    bgClip="text"
                  >
                    @{handle}
                  </Text>{" "}
                  in the Lens protocol.
                </Text>
              </>
            </>
          )}

          {isLoading && (
            <HStack pt="5" pl="5" pr="5">
              <Text>Waiting for confirmation with your wallet...</Text>
              <Spinner size="md" color="third" />
            </HStack>
          )}

          {signed && (
            <Center>
              <VStack paddingTop="5" pl="5" pr="5">
                <HStack>
                  <Text
                    fontWeight="700"
                    fontSize="14px"
                    bgGradient="linear(to-r, #31108F, #7A3CE3, #E53C79, #E8622C, #F5C144)"
                    bgClip="text"
                  >
                    Waiting transacction to be mined...
                  </Text>

                  <Image
                    src="https://feature.undp.org/beyond-bitcoin/es/assets/mbNja7QNnr/block3.gif"
                    width="50%"
                  />
                </HStack>

                <Text
                  textAlign="center"
                  fontWeight="500"
                  fontSize="12px"
                  lineHeight="120%"
                  color="grayLetter"
                  pt="5"
                >
                  This usually takes 0-1 minutes to complete
                </Text>
              </VStack>
            </Center>
          )}
        </ModalBody>

        <ModalFooter>
          {activeStep === 0 && (
            <>
              <Button
                bg="white"
                borderRadius="10px"
                boxShadow="0px 2px 3px rgba(0, 0, 0, 0.15)"
                mr="5"
                onClick={handleClose}
              >
                <Text
                  fontWeight="500"
                  fontSize="18px"
                  lineHeight="21.6px"
                  color="first"
                >
                  Cancel
                </Text>
              </Button>

              <Button
                bg="lens"
                borderRadius="10px"
                boxShadow="0px 2px 3px rgba(0, 0, 0, 0.15)"
                onClick={handleFollow}
                disabled={isLoading}
              >
                <Flex>
                  <Box w="40px" h="40px">
                    <Image
                      src="../assets/LOGO__lens_ultra small icon.png"
                      alt="lens"
                      my="-5px"
                      mx="-5px"
                    />
                  </Box>

                  <Text
                    fontWeight="500"
                    fontSize="18px"
                    lineHeight="21.6px"
                    color="lensDark"
                    m="auto"
                  >
                    DeFi follow
                  </Text>
                </Flex>
              </Button>
            </>
          )}

          {activeStep === 2 && (
            <>
              <Button
                bg="white"
                borderRadius="10px"
                boxShadow="0px 2px 3px rgba(0, 0, 0, 0.15)"
                mr="5"
                onClick={handleClose}
              >
                <Text
                  fontWeight="500"
                  fontSize="18px"
                  lineHeight="21.6px"
                  color="first"
                >
                  Close
                </Text>
              </Button>

              <Button
                bg="second"
                borderRadius="10px"
                boxShadow="0px 2px 3px rgba(0, 0, 0, 0.15)"
                onClick={handleExploreTx}
              >
                <Text
                  fontWeight="500"
                  fontSize="18px"
                  lineHeight="21.6px"
                  color="white"
                >
                  View on Explorer
                </Text>
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FollowModal;
