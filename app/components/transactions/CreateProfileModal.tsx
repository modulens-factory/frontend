import React from "react";
import { BigNumber, utils } from "ethers";

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Divider,
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
  Text,
  VStack,
} from "@chakra-ui/react";

import { Step, Steps, useSteps } from "chakra-ui-steps";
import { createProfileRequest } from "~/web3/lens/profile/create";
import { pollUntilIndexed } from "~/web3/lens/indexer/has-transaction-been-indexed";
import { Link } from "@remix-run/react";

type CreateProfileProps = {
  isOpen: boolean;
  onClose: () => void;
  handle: string;
  wmaticBalance: number;
};

const CreateProfileModal = ({
  isOpen,
  onClose,
  handle,
  wmaticBalance,
}: CreateProfileProps) => {
  const steps = [
    { label: "Confirm new profile" },
    { label: "Profile created 🎉" },
  ];

  const { nextStep, activeStep, reset } = useSteps({
    initialStep: 0,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [signed, setSigned] = React.useState(false);
  const [error, setError] = React.useState(false);

  const [txHash, setTxHash] = React.useState("");
  const [profileId, setProfileId] = React.useState("");

  const gasLimitNumber = 50000;

  const handleConfirmCreateProfile = async () => {
    console.log("Creating profile ...");
    setIsLoading(true);

    nextStep();

    try {
      const createProfileResponse = await createProfileRequest({
        request: {
          handle: handle,
          profilePictureUri: null,
          followNFTURI: null,
          followModule: null,
        },
      });

      if (createProfileResponse.__typename === "RelayError") {
        console.error("Create profile: failed");
        return;
      }

      console.log("txHash: ", createProfileResponse.createProfile.txHash);

      // console.log("Create profile: poll until indexed");
      const result = await pollUntilIndexed({
        txHash: createProfileResponse.createProfile.txHash,
      });

      setTxHash(createProfileResponse.createProfile.txHash);

      // console.log("Create profile: profile has been indexed", result);

      const logs = result.txReceipt!.logs;

      // console.log("Create profile: logs", logs);

      const topicId = utils.id(
        "ProfileCreated(uint256,address,address,string,string,address,bytes,string,uint256)"
      );
      // console.log("Topicid we care about", topicId);

      const profileCreatedLog = logs.find((l: any) => l.topics[0] === topicId);
      // console.log("Profile created log", profileCreatedLog);

      let profileCreatedEventLog = profileCreatedLog!.topics;
      // console.log("Profile created event logs", profileCreatedEventLog);

      const profileId = utils.defaultAbiCoder.decode(
        ["uint256"],
        profileCreatedEventLog[1]
      )[0];

      console.log("Profile id", BigNumber.from(profileId).toHexString());

      setProfileId(BigNumber.from(profileId).toHexString());

      nextStep();

      setIsLoading(false);
      setSigned(true);
    } catch (error) {
      setError(true);
      setIsLoading(false);
      setSigned(false);

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
    window.open(`https://mumbai.polygonscan.com/tx/${txHash}`, "_blank");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius={20}>
        <ModalHeader>Create profile</ModalHeader>
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

          {activeStep == 0 && (
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
                You are going to create the next profile:
              </Text>

              <Flex pt="5" pl="5" pr="5">
                <Text
                  fontWeight="600"
                  fontSize="14px"
                  color="lensDark"
                  width="20%"
                >
                  handle:
                </Text>

                <Text
                  fontWeight="700"
                  fontSize="14px"
                  bgGradient="linear(to-r, #31108F, #7A3CE3, #E53C79, #E8622C, #F5C144)"
                  bgClip="text"
                >
                  @{handle}.test
                </Text>
              </Flex>

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
                Remember this profile is created in the testnet (Polygon Mumbai)
              </Text>

              <Divider mt="5" />

              <Flex mt="5" justify="space-between">
                <Box>
                  <Text fontWeight="700" fontSize="16" color="black">
                    Transaction Fee
                  </Text>
                  <Text fontWeight="500" fontSize="14" color="gray">
                    Total gas paid
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="700" fontSize="16" color="black">
                    $ 0 USD
                  </Text>
                  <Text fontWeight="500" fontSize="14" color="gray">
                    0 MATIC
                  </Text>
                </Box>
              </Flex>

              <Flex mt="5" justify="space-between">
                <Box>
                  <Text fontWeight="700" fontSize="16" color="black">
                    Social DeFi Fee (0%)
                  </Text>
                  <Text fontWeight="500" fontSize="14" color="gray">
                    Platform charge
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="700" fontSize="16" color="black">
                    $ 0 USD
                  </Text>
                  <Text fontWeight="500" fontSize="14" color="gray">
                    0 MATIC
                  </Text>
                </Box>
              </Flex>

              <Alert status="info" borderRadius={10} mt="5">
                <AlertIcon />
                Social DeFi charge 0% fee for all transactions.
              </Alert>

              <Flex pt="5" pl="5">
                <Text
                  fontWeight="700"
                  fontSize="20px"
                  color="grayLetter"
                  my="auto"
                >
                  Your balance:
                </Text>{" "}
                <Image
                  src="../assets/logos/polygon-matic-logo.png"
                  w="5"
                  h="5"
                  ml="2"
                  my="auto"
                />
                <Text
                  fontWeight="600"
                  fontSize="18px"
                  color="black"
                  ml="2"
                  my="auto"
                >
                  {wmaticBalance.toFixed(4)} MATIC
                </Text>
              </Flex>
            </>
          )}

          {activeStep == 2 && (
            <>
              <>
                <Center pt="5" pl="5" pr="5">
                  <Alert status="success" borderRadius={10}>
                    <AlertIcon />
                    Create profile successfully!
                  </Alert>
                </Center>

                <Text pt="5" pl="5" pr="5">
                  Congratulations, you have just create the profile{" "}
                  <Text
                    as="span"
                    fontWeight="700"
                    fontSize="14px"
                    bgGradient="linear(to-r, #31108F, #7A3CE3, #E53C79, #E8622C, #F5C144)"
                    bgClip="text"
                  >
                    @{handle}.test
                  </Text>{" "}
                  in the Lens protocol.
                </Text>

                <Text
                  fontWeight="600"
                  fontSize="14px"
                  color="lensDark"
                  pt="5"
                  pl="5"
                  pr="5"
                >
                  The profile id is: #{profileId}
                </Text>
              </>
            </>
          )}

          {isLoading && (
            <Center>
              <VStack paddingTop="5" pl="5" pr="5">
                <HStack>
                  <Text
                    fontWeight="700"
                    fontSize="14px"
                    bgGradient="linear(to-r, #31108F, #7A3CE3, #E53C79, #E8622C, #F5C144)"
                    bgClip="text"
                  >
                    Waiting transacction to be indexed ...
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
                  This usually takes 1-2 minutes to complete
                </Text>
              </VStack>
            </Center>
          )}

          {error && (
            <Box p="5">
              <Alert status="error" borderRadius={10}>
                <AlertIcon />
                The transaction has failed
              </Alert>

              <Text
                fontWeight="600"
                fontSize="14px"
                lineHeight="120%"
                color="black"
                pt="5"
              >
                Please, try again 5 minutes later. If the problem persists,
                contact us.
              </Text>
            </Box>
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
                onClick={handleConfirmCreateProfile}
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
                    Create profile
                  </Text>
                </Flex>
              </Button>
            </>
          )}

          {activeStep === 2 && (
            <>
              <Link to="/set-default">
                <Button
                  bg="lens"
                  borderRadius="10px"
                  boxShadow="0px 2px 3px rgba(0, 0, 0, 0.15)"
                  mr="5"
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
                      Set as default
                    </Text>
                  </Flex>
                </Button>
              </Link>

              <Link to={`/${handle}.test`}>
                <Button
                  bg="first"
                  borderRadius="10px"
                  boxShadow="0px 2px 3px rgba(0, 0, 0, 0.15)"
                >
                  <Text
                    fontWeight="500"
                    fontSize="18px"
                    lineHeight="21.6px"
                    color="white"
                  >
                    Go to @{handle}.test
                  </Text>
                </Button>
              </Link>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateProfileModal;
