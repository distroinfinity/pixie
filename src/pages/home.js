import React, { useEffect, useContext, useState } from "react";
import Layout from "@/components/layout";
import {
  Box,
  HStack,
  VStack,
  Divider,
  Flex,
  Text,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tabs,
} from "@chakra-ui/react";
import MyFiles from "@/components/myFiles";
import SharedWithMe from "@/components/sharedWithMe";
import { User_data } from "@/contexts/userContexts";
import { useRouter } from "next/router";

export default function SidebarWithHeader({ children }) {
  const { user, setUser } = useContext(User_data);
  const [files, setFiles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    console.log("user at home page", user);
    if (!user) {
      console.log("You are not signed in");
      router.push("/");
      return;
    }
    setFiles(user.files);
  }, []);

  return (
    <Layout setFiles={setFiles}>
      <Box>
        <HStack direction="row" h="auto" p={1} spacing="24px" align={"top"}>
          <Flex direction="column">
            {/* <Text textDecor={"underline"}>Left Column</Text> */}
          </Flex>
          <Divider orientation="vertical" />
          <Flex width="100%">
            {/* <Text fontSize={"40px"}>My Pit</Text> */}
            <Tabs
              size="lg"
              variant="soft-rounded"
              colorScheme="green"
              width="100%"
            >
              <TabList>
                <Tab>My Files</Tab>
                <Tab>Shared With Me</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <MyFiles files={files} setFiles={setFiles} />
                </TabPanel>
                <TabPanel>
                  <SharedWithMe fileIds={user?.sharedWithMe}  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </HStack>
      </Box>
    </Layout>
  );
}
