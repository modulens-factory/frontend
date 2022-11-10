// BFF components
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { lensClient } from "~/web3/lens/lens-client";

import { getSession } from "~/bff/session";

// UI components
import React from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Image,
  Select,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

// components
import NavbarConnected from "~/components/NavbarConnected";
import { GetDefaultProfile, GetProfiles } from "~/web3/lens/graphql/generated";
import SetDefaultProfileModal from "~/components/SetDefaultProfileModal";

export const loader: LoaderFunction = async ({ request }) => {
  // Get address from cookie session
  const session = await getSession(request.headers.get("Cookie"));

  const address = session.get("address");

  // Get profiles from Lens
  const variables: any = {
    request: { ownedBy: [address], limit: 20 },
  };

  const getProfilesResponse = await lensClient.request(GetProfiles, variables);

  const profiles = getProfilesResponse.profiles.items;

  // Get default profile from Lens
  const variablesForDefault: any = {
    request: { ethereumAddress: address },
  };

  const responseProfile = await lensClient.request(
    GetDefaultProfile,
    variablesForDefault
  );

  const defaultProfile = responseProfile.defaultProfile;

  return { address, profiles, defaultProfile };
};

export default function SetFollowModule() {
  const { address, profiles, defaultProfile } = useLoaderData();

  const { onOpen, onClose, isOpen } = useDisclosure();

  const [defaultProfileSelect, setDefaultProfileSelect] = React.useState("");
  const [defaultHandle, setDefaultHandle] = React.useState("");

  const handleSetDefaultProfile = (index: number) => {
    setDefaultProfileSelect(profiles[index].id);
    setDefaultHandle(profiles[index].handle);

    onOpen();
  };

  return (
    <Box bg="#FAFAF9" h="100vh">
      <NavbarConnected
        address={address}
        authenticatedInLens={false}
        handle={defaultProfile?.handle}
      />

      <Box
        maxWidth="600px"
        m="auto"
        bg="white"
        border="1px"
        borderColor="#E0E0E3"
        borderRadius="10px"
        p="5"
        mt="5"
        mb="5"
      >
        <Text
          fontWeight="700"
          fontSize="18px"
          lineHeight="120%"
          color="black"
          my="auto"
        >
          Select follow module
        </Text>

        <Text
          fontWeight="600"
          fontSize="14px"
          lineHeight="120%"
          color="black"
          my="auto"
          pt="3"
        >
          Configure the module you want to set in your profile when a user
          follows you.
        </Text>

        <Text
          fontWeight="600"
          fontSize="15px"
          lineHeight="120%"
          color="black"
          my="auto"
          pt="6"
        >
          Select follow module
        </Text>

        <Box mt="3">
          <Select placeholder="null">
            <option value="FlowmiFollowModule">FlowmiFollowModule</option>
          </Select>
        </Box>

        <Center>
          <Button
            bg="lens"
            borderRadius="10px"
            boxShadow="0px 2px 3px rgba(0, 0, 0, 0.15)"
            mt="5"

            //   onClick={onOpen}
            //   disabled={handle === ""}
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
                Set follow module
              </Text>
            </Flex>
          </Button>
        </Center>
      </Box>
    </Box>
  );
}
