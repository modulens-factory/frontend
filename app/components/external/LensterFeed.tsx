import { Box, Center } from "@chakra-ui/react";

// components
import LensterPost from "./LensterPost";

type LensterFeedProps = {
  Posts: any;
  defaultProfile: any;
};

const LensterFeed = ({ Posts, defaultProfile }: LensterFeedProps) => {
  return (
    <Center mt="10">
      <Box>
        {Posts.map((post: any, index: number, row: any) => {
          return (
            <LensterPost
              key={post.id}
              id={post.id}
              name={post.profile.name}
              handle={post.profile.handle}
              profileImage={post.profile.picture?.original?.url}
              content={post.metadata.content}
              createdAt={post.createdAt}
              comments={post.stats.totalAmountOfComments}
              mirrors={post.stats.totalAmountOfMirrors}
              collects={post.stats.totalAmountOfCollects}
              index={index}
              row={row}
              defaultProfile={defaultProfile}
              profileIdToMirror={post.profile.id}
            />
          );
        })}
      </Box>
    </Center>
  );
};

export default LensterFeed;
