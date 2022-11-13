import {
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { MdAccountBalanceWallet } from "react-icons/md";

type BalanceInProfileProps = {
  nativeBalance: number;
  wmaticBalance: number;
  awmaticBalance: number;
};

const BalanceInProfile = ({
  nativeBalance,
  wmaticBalance,
  awmaticBalance,
}: BalanceInProfileProps) => {
  return (
    <Box border="1px" borderColor="#E0E0E3" borderRadius="10px" p="5" mt="5">
      <Flex>
        <Icon as={MdAccountBalanceWallet} color="first" h="6" w="6" />
        <Text
          fontWeight="700"
          fontSize="18px"
          lineHeight="120%"
          letterSpacing="-0.03em"
          color="first"
          pb="2"
          ml="2"
          mr="2"
        >
          Your Balance in Polygon Mumbai
        </Text>
      </Flex>

      <TableContainer>
        <Table variant="striped" colorScheme="purple">
          <Thead>
            <Tr>
              <Th>Assets</Th>
              <Th isNumeric>Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <HStack>
                  <Image
                    src="../assets/logos/polygon-matic-logo.png"
                    w="6"
                    h="6"
                  />
                  <Text fontSize={14} paddingLeft={2}>
                    MATIC
                  </Text>
                </HStack>
              </Td>
              <Td isNumeric>{nativeBalance.toFixed(4)}</Td>
            </Tr>
            <Tr>
              <Td>
                <HStack>
                  <Image
                    src="../assets/logos/wrapped-matic-logo.png"
                    w="6"
                    h="6"
                  />{" "}
                  <Text fontSize={14}>WMATIC</Text>
                </HStack>
              </Td>
              <Td isNumeric>{wmaticBalance?.toFixed(4)}</Td>
            </Tr>
            <Tr>
              <Td>
                <HStack>
                  <Image src="../assets/logos/aave-aave-logo.png" w="6" h="6" />{" "}
                  <Text fontSize={14}>aWMATIC</Text>
                </HStack>
              </Td>
              <Td isNumeric>{awmaticBalance?.toFixed(4)}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BalanceInProfile;
