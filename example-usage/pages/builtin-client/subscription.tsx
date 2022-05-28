import { Box, Spinner, Stack } from "@chakra-ui/react";
import { Hero, PageContainer, SectionTitle } from "landing-blocks";
import React from "react";
// import { expectType } from "tsd";
import { createClient } from "../../hasura";
import { useSubscription } from "../../client";

const client = createClient({
  subscription: {
    url: "wss://hasura-2334534.herokuapp.com/v1/graphql",
  },
});

console.log("client", client);

const Page = () => {
  const {
    result: data,
    loading,
    error,
  } = useSubscription(
    {
      user: {
        name: true,
      },
    }
    // (a: any[], b) => [...a, b],
  );
  // expectType<Partial<user>[] | undefined>(data?.user);
  return (
    <Stack spacing="40px" mt="40px">
      <Hero
        bullet="Genqlx lets you write graphql queries as code"
        heading="Example use of Genqlx"
        subheading="Search for countries via https://countries.trevorblades.com"
      />
      <PageContainer>
        <SectionTitle heading="Countries" />
        {!data && (
          <Stack justify="center" align="center">
            <Spinner />
          </Stack>
        )}
        {data && (
          <Stack spacing="20px">
            {data?.user?.map((x) => (
              <Box borderRadius="10px" p="20px" borderWidth="1px">
                {x.name}
              </Box>
            ))}
          </Stack>
        )}
        {error && <Box color="red">{error.message}</Box>}
      </PageContainer>
    </Stack>
  );
};

export default Page;
