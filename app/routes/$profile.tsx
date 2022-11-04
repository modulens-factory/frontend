// BFF components
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { GraphQLClient } from "graphql-request";
import { GetDefaultProfile, GetProfile } from "~/web3/lens/lens-api";

import { getSession } from "~/bff/session";

// UI components
import { Box, Grid, GridItem, Image } from "@chakra-ui/react";

// components
import NavbarConnected from "~/components/NavbarConnected";
import LensterProfile from "~/components/external/LensterProfile";
import ProfileParticipation from "~/components/ProfileParticipation";

export const loader: LoaderFunction = async ({ request, params }) => {
  // Get address from cookie session
  const session = await getSession(request.headers.get("Cookie"));

  const address = session.get("address");

  const accessToken = session.get("accessToken");

  // Get default profile from Lens
  const lens = new GraphQLClient("https://api.lens.dev/playground");

  let variables: any = {
    request: { ethereumAddress: address },
  };

  const responseProfile = await lens.request(GetDefaultProfile, variables);

  const profile = responseProfile.defaultProfile;

  // Get profile from Lens protocol
  variables = {
    request: { handle: params.profile },
  };

  const response = await lens.request(GetProfile, variables);

  const pageProfile = response.profile;

  const location = pageProfile.attributes.filter((attribute: any) => {
    return attribute.key === "location";
  });

  const locationValue = location[0]?.value;

  const ens = pageProfile.attributes.filter((attribute: any) => {
    return attribute.key === "ens";
  });

  const ensValue = ens[0]?.value;

  const website = pageProfile.attributes.filter((attribute: any) => {
    return attribute.key === "website";
  });

  const websiteValue = website[0]?.value;

  const twitter = pageProfile.attributes.filter((attribute: any) => {
    return attribute.key === "twitter";
  });

  const twitterValue = twitter[0]?.value;

  return {
    address,
    accessToken,
    profile,
    pageProfile,
    locationValue,
    ensValue,
    websiteValue,
    twitterValue,
  };
};

export default function Profile() {
  const {
    address,
    profile,
    pageProfile,
    locationValue,
    ensValue,
    websiteValue,
    twitterValue,
  } = useLoaderData();

  console.log(pageProfile);

  return (
    <Box bg="#FAFAF9">
      <NavbarConnected
        address={address}
        authenticatedInLens={true}
        handler={profile.handle}
      />

      <Image src="./assets/2.png" w="100%" h="320px" objectFit="cover" />

      <Box maxWidth="1200px" m="auto">
        <Grid templateColumns="repeat(3, 1fr)">
          <GridItem colSpan={1} mt="-170px">
            <LensterProfile
              name={pageProfile.name}
              handle={pageProfile.handle}
              id={pageProfile.id}
              avatar={pageProfile.picture?.original?.url}
              followers={pageProfile.stats.totalFollowers}
              following={pageProfile.stats.totalFollowing}
              location={locationValue}
              ens={ensValue}
              website={websiteValue}
              twitter={twitterValue}
            />
          </GridItem>

          <GridItem colSpan={2}>
            <ProfileParticipation />
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}
