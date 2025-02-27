import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

import { transformToIpfsUrl } from "~/web3/ipfs/ipfs";

import { calculateHoursBetweenNowAndDate } from "~/utils/time";

import { GoCommentDiscussion } from "react-icons/go";
import { TbArrowsLeftRight } from "react-icons/tb";
import { VscLibrary } from "react-icons/vsc";
import { RiCoinsLine } from "react-icons/ri";

import { WIDTH_FEED } from "~/styles/theme";
import { Link } from "@remix-run/react";
import MirrorModal from "../mirror/MirrorModal";
import { ADS_MIRROR_MODULE_ADDRESS } from "~/web3/social-defi/social-defi-hub";
import { removeLensSuffix } from "~/utils/text";

type PostProps = {
  id: string;
  name: string;
  handle: string;
  profileImage?: string;
  content?: string;
  image?: string;
  createdAt: string;
  comments: number;
  mirrors: number;
  collects: number;
  index?: number;
  row?: any;
  defaultProfile: any;
  profileIdToMirror: string;
  referenceModule?: any;
};

const LensterPost = ({
  id,
  name,
  handle,
  profileImage,
  content,
  createdAt,
  comments,
  mirrors,
  collects,
  index,
  row,
  defaultProfile,
  profileIdToMirror,
  referenceModule,
}: PostProps) => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  return (
    <Box
      bg="white"
      border="1px"
      borderBottom={index === row.length - 1 ? "1px" : "0px"}
      borderColor="#E0E0E3"
      borderRadius={
        index === 0
          ? "10px 10px 0 0"
          : index === row.length - 1
          ? "0 0 10px 10px"
          : "0"
      }
      _hover={{ bg: "#F4F4F5" }}
    >
      <HStack p={["5", "10", "10", "10"]} justifyContent="space-between">
        <Link to={`/${handle}`} prefetch="intent">
          <HStack>
            <Avatar size="md" src={transformToIpfsUrl(profileImage!)} />

            <Box my="auto" pl="1">
              {name ? (
                <Text
                  fontWeight="600"
                  fontSize="14px"
                  lineHeight="120%"
                  letterSpacing="-0.03em"
                  color="black"
                >
                  {name}
                </Text>
              ) : (
                <Text
                  fontWeight="600"
                  fontSize="14px"
                  lineHeight="120%"
                  letterSpacing="-0.03em"
                  color="black"
                >
                  {removeLensSuffix(handle)}
                </Text>
              )}

              <Text
                fontWeight="700"
                fontSize="12px"
                lineHeight="100%"
                letterSpacing="-0.03em"
                bgGradient="linear(to-r, #31108F, #7A3CE3, #E53C79, #E8622C, #F5C144)"
                bgClip="text"
                pt="1"
              >
                @{handle}
              </Text>
            </Box>
          </HStack>
        </Link>

        <Box>
          <Text
            fontWeight="700"
            fontSize="11px"
            lineHeight="120%"
            letterSpacing="-0.03em"
            color="grayLetter"
          >
            {calculateHoursBetweenNowAndDate(createdAt)}
          </Text>
        </Box>
      </HStack>

      <Box pl={["10", "14", "14", "14"]}>
        <Text
          fontWeight="500"
          fontSize="14px"
          lineHeight="120%"
          letterSpacing="-0.03em"
          color="black"
          pl="10"
          pr="10"
          pb="5"
          textAlign="justify"
        >
          {content}
        </Text>
      </Box>

      <Box pb="5">
        <HStack pl="10" justifyContent="space-evenly">
          <Flex>
            <Icon as={GoCommentDiscussion} color="first" w={5} h={5} />
            <Text
              fontWeight="700"
              fontSize="15px"
              lineHeight="120%"
              letterSpacing="-0.03em"
              color="first"
              my="auto"
              pl="3"
            >
              {comments}
            </Text>
          </Flex>

          {referenceModule?.contractAddress === ADS_MIRROR_MODULE_ADDRESS ? (
            <Flex
              onClick={onOpen}
              _hover={{
                cursor: "pointer",
              }}
            >
              <Icon as={RiCoinsLine} color="fifth" w={6} h={6} />
              <Text
                fontWeight="700"
                fontSize="15px"
                lineHeight="120%"
                letterSpacing="-0.03em"
                color="fifth"
                my="auto"
                pl="3"
              >
                {mirrors}
              </Text>
            </Flex>
          ) : (
            <Flex
              onClick={onOpen}
              _hover={{
                cursor: "pointer",
              }}
            >
              <Icon as={TbArrowsLeftRight} color="second" w={5} h={5} />
              <Text
                fontWeight="700"
                fontSize="15px"
                lineHeight="120%"
                letterSpacing="-0.03em"
                color="second"
                my="auto"
                pl="3"
              >
                {mirrors}
              </Text>
            </Flex>
          )}

          <Flex>
            <Icon as={VscLibrary} color="third" w={5} h={5} />
            <Text
              fontWeight="700"
              fontSize="15px"
              lineHeight="120%"
              letterSpacing="-0.03em"
              color="third"
              my="auto"
              pl="3"
            >
              {collects}
            </Text>
          </Flex>
        </HStack>

        <MirrorModal
          isOpen={isOpen}
          onClose={onClose}
          handle="cristian"
          address="1"
          profileId={defaultProfile.id}
          profileIdToMirror={profileIdToMirror}
          maticBalance={1}
          id={id}
        />
      </Box>
    </Box>
  );
};

export default LensterPost;
